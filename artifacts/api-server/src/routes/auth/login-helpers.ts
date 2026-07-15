import type { Request } from "express";
import { db, usersTable, userSessionsTable, deviceSessionsTable } from "@workspace/db";
import { eq, and, not } from "drizzle-orm";
import { randomUUID } from "crypto";
import { auditLog } from "../../lib/auth";
import { invalidateSessionCache } from "../../lib/auth/sessionCache";
import { notifyLoginSuccess, notifyNewDeviceLogin, notifyDeviceTrusted, notifyOtherSessionsSignedOut } from "../../services/notificationTemplates";
import { fmtUser } from "./helpers";

export interface FinalizeLoginParams {
  req: Request;
  user: typeof usersTable.$inferSelect;
  ipAddress: string;
  deviceInfo: string; // "Chrome on Windows"
  browser: string;
  os: string;
  rememberMe: boolean;
  deviceFingerprint: string | null;
  wasNewDevice: boolean;
  trustDevice: boolean;
}

const TRUST_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Completes a login: enforces single-device-active-session, upserts the
 * device_sessions row, creates the new user_sessions row + express-session,
 * and fires the usual audit/notification hooks. Shared by the direct-login
 * path (routes/auth/login.ts) and the 2FA/device-challenge finalize path
 * (routes/auth/2fa.ts).
 */
export async function finalizeLogin(params: FinalizeLoginParams) {
  const { req, user, ipAddress, deviceInfo, browser, os, rememberMe, deviceFingerprint, wasNewDevice, trustDevice } = params;

  const sessionId = randomUUID();
  const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + sessionDuration);

  // ── Single-device enforcement: revoke every other active session ──────────
  const revoked = await db
    .update(userSessionsTable)
    .set({ isActive: false })
    .where(and(eq(userSessionsTable.userId, user.id), eq(userSessionsTable.isActive, true)))
    .returning({ sessionId: userSessionsTable.sessionId });
  await Promise.all(revoked.map((r) => invalidateSessionCache(r.sessionId)));
  if (revoked.length > 0) {
    await notifyOtherSessionsSignedOut(user.id, deviceInfo);
  }

  await db
    .update(usersTable)
    .set({ failedLoginAttempts: 0, status: "ACTIVE", lockedUntil: null, activeSessionToken: sessionId })
    .where(eq(usersTable.id, user.id));

  await db.insert(userSessionsTable).values({
    userId: user.id,
    sessionId,
    deviceInfo,
    browser,
    os,
    ipAddress,
    rememberMe,
    expiresAt,
  });

  // ── device_sessions upsert (known-device tracking + trust) ────────────────
  if (deviceFingerprint) {
    const trustedUntil = trustDevice ? new Date(Date.now() + TRUST_DURATION_MS) : undefined;
    const [existing] = await db
      .select()
      .from(deviceSessionsTable)
      .where(and(eq(deviceSessionsTable.userId, user.id), eq(deviceSessionsTable.deviceFingerprint, deviceFingerprint)));

    if (existing) {
      await db
        .update(deviceSessionsTable)
        .set({
          sessionId,
          deviceName: deviceInfo,
          ipAddress,
          lastActive: new Date(),
          ...(trustDevice ? { isTrusted: true, trustedUntil } : {}),
        })
        .where(eq(deviceSessionsTable.id, existing.id));
    } else {
      await db.insert(deviceSessionsTable).values({
        userId: user.id,
        sessionId,
        deviceName: deviceInfo,
        deviceFingerprint,
        ipAddress,
        isTrusted: trustDevice,
        trustedUntil,
      });
    }

    if (trustDevice) await notifyDeviceTrusted(user.id, deviceInfo);
  }

  req.session.userId = user.id;
  req.session.userRole = user.role;
  req.session.sessionToken = sessionId;
  req.session.sessionId = sessionId;
  req.session.cookie.maxAge = sessionDuration;
  // Clear any pending-2FA state now that login is complete.
  req.session.pendingUserId = undefined as unknown as number;
  req.session.pendingDeviceFingerprint = undefined as unknown as string;
  req.session.pendingDeviceName = undefined as unknown as string;
  req.session.pendingRememberMe = undefined as unknown as boolean;
  req.session.pendingMethod = undefined as unknown as "otp" | "totp";
  req.session.pendingIsNewDevice = undefined as unknown as boolean;

  await auditLog(user.id, "login", `Logged in from ${deviceInfo}`, ipAddress);
  await notifyLoginSuccess(user.id, ipAddress, deviceInfo);
  if (wasNewDevice) await notifyNewDeviceLogin(user.id, ipAddress, deviceInfo);

  return fmtUser(user);
}
