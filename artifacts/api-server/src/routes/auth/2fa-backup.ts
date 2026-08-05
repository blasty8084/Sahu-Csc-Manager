import { Router, type IRouter } from "express";
import { authenticator } from "otplib";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, comparePassword, auditLog, securityLog, getClientIp, parseDevice } from "../../lib/auth";
import { encryptField, decryptField } from "../../lib/encryption";
import { finalizeLogin } from "./login-helpers";
import { notify2faEnabled } from "../../services/notificationTemplates";
import { asyncHandler } from "../../lib/async-handler";
import {
  isTotpReplay, markTotpUsed, buildQrData,
  checkTotpRateLimit, incrementTotpFailure, clearTotpFailures,
} from "./2fa-totp";

export const BACKUP_CODE_COUNT = 8;
const TRUST_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─── Backup code utilities (exported for use by 2fa-otp.ts) ─────────────────

export function generateBackupCodes(): string[] {
  return Array.from({ length: BACKUP_CODE_COUNT }, () =>
    crypto.randomBytes(5).toString("hex").toUpperCase().match(/.{1,5}/g)!.join("-")
  );
}

export async function hashBackupCodes(codes: string[]): Promise<string> {
  const hashed = await Promise.all(codes.map((c) => bcrypt.hash(c, 10)));
  return JSON.stringify(hashed);
}

/** Attempts to consume a backup code. Returns true and persists removal on success. */
export async function tryConsumeBackupCode(userId: number, code: string): Promise<boolean> {
  const [user] = await db.select({ backupCodes: usersTable.backupCodes }).from(usersTable).where(eq(usersTable.id, userId));
  if (!user?.backupCodes) return false;
  let hashes: string[];
  try { hashes = JSON.parse(user.backupCodes); } catch { return false; }

  for (let i = 0; i < hashes.length; i++) {
    if (await bcrypt.compare(code.trim().toUpperCase(), hashes[i])) {
      hashes.splice(i, 1);
      await db.update(usersTable).set({ backupCodes: JSON.stringify(hashes) }).where(eq(usersTable.id, userId));
      return true;
    }
  }
  return false;
}

const router: IRouter = Router();

// ─── POST /auth/2fa/verify-totp ──────────────────────────────────────────────
// Mode A (session.userId):    confirms TOTP setup, enables 2FA, issues backup codes.
// Mode B (session.pendingUserId): finalizes a login that required TOTP challenge.
// Both modes accept a backup code as fallback.
router.post("/auth/2fa/verify-totp", asyncHandler(async (req, res) => {
  const { code, backupCode, trustDevice } = req.body as { code?: string; backupCode?: string; trustDevice?: boolean };

  // ── Mode A: confirming setup on an already-authenticated session ──────────
  if (req.session.userId) {
    const userId = req.session.userId;

    // Per-user rate limit: 5 failed attempts / 15 minutes
    const { blocked } = await checkTotpRateLimit(userId);
    if (blocked) {
      await auditLog(userId, "2fa.brute_force_locked", "TOTP rate limit hit during setup", getClientIp(req));
      res.status(429).json({ error: "Too many attempts — try again in 15 minutes." });
      return;
    }

    // Retrieve secret: prefer unverified session secret, fallback to DB (re-verify flow)
    const sessionSecret = (req.session as any).setupTotpSecret as string | undefined;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const rawSecret = sessionSecret ?? (user.totpSecret ? await decryptField(user.totpSecret) : null);
    if (!rawSecret) {
      res.status(400).json({ error: "No TOTP setup in progress. Call setup-totp first." });
      return;
    }
    if (!code || !/^\d{6}$/.test(code)) {
      res.status(400).json({ error: "Enter the 6-digit code from your authenticator app." });
      return;
    }

    if (await isTotpReplay(userId, code)) {
      await incrementTotpFailure(userId);
      await auditLog(userId, "2fa.replay_rejected", "Replay TOTP code rejected during setup", getClientIp(req));
      res.status(400).json({ error: "This code was already used — wait for the next one." });
      return;
    }

    // window: 1 = accept codes from ±1 period (±30 s) to handle clock drift
    const valid = authenticator.verify({ token: code, secret: rawSecret, window: 1 } as any);
    if (!valid) {
      await incrementTotpFailure(userId);
      res.status(400).json({ error: "Incorrect code — check your authenticator app." });
      return;
    }

    await markTotpUsed(userId, code);
    await clearTotpFailures(userId);

    // Persist the verified secret to DB now that the user has confirmed it works
    await db.update(usersTable).set({ totpSecret: await encryptField(rawSecret) }).where(eq(usersTable.id, userId));
    // Clear pending session secret
    delete (req.session as any).setupTotpSecret;

    const backupCodes = generateBackupCodes();
    await db.update(usersTable).set({
      twoFaEnabled: true,
      twoFaMethod: "totp",
      twoFaVerifiedAt: new Date(),
      backupCodes: await hashBackupCodes(backupCodes),
    }).where(eq(usersTable.id, userId));

    await auditLog(userId, "2fa.enabled", "2FA enabled via TOTP", getClientIp(req));
    await securityLog(userId, "2fa.enabled", true, getClientIp(req), null, "Enabled via TOTP");
    await notify2faEnabled(userId, "totp");
    res.json({ verified: true, backupCodes });
    return;
  }

  // ── Mode B: finalizing a login that required TOTP verification ──────────
  if (req.session.pendingUserId) {
    const userId = req.session.pendingUserId;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) { res.status(401).json({ error: "Session expired. Please log in again." }); return; }

    // Per-user rate limit
    const { blocked } = await checkTotpRateLimit(userId);
    if (blocked) {
      await auditLog(userId, "2fa.brute_force_locked", "TOTP rate limit hit during login", getClientIp(req));
      res.status(429).json({ error: "Too many attempts — try again in 15 minutes." });
      return;
    }

    let ok = false;
    let usedBackupCode = false;

    if (code && /^\d{6}$/.test(code)) {
      // Use pending session secret (mid-enrollment) or DB secret (already enrolled)
      const sessionSecret = (req.session as any).pendingTotpSecret as string | undefined;
      const rawSecret = sessionSecret ?? (user.totpSecret ? await decryptField(user.totpSecret) : null);

      if (rawSecret) {
        if (await isTotpReplay(userId, code)) {
          await auditLog(userId, "2fa.replay_rejected", "Replay TOTP code rejected during login", getClientIp(req));
          res.status(401).json({ error: "This code was already used — wait for the next one." });
          return;
        }
        ok = authenticator.verify({ token: code, secret: rawSecret, window: 1 } as any);
        if (ok) {
          await markTotpUsed(userId, code);
          // If enrolling, persist the secret to DB now
          if ((req.session as any).pendingTotpSecret) {
            await db.update(usersTable).set({ totpSecret: await encryptField(rawSecret) }).where(eq(usersTable.id, userId));
            delete (req.session as any).pendingTotpSecret;
          }
        }
      }
    }

    if (!ok && backupCode) {
      ok = await tryConsumeBackupCode(userId, backupCode);
      if (ok) usedBackupCode = true;
    }

    if (!ok) {
      await incrementTotpFailure(userId);
      await auditLog(userId, "2fa.login_failed", "Failed TOTP/backup-code verification during login", getClientIp(req));
      await securityLog(userId, "2fa.login_failed", false, getClientIp(req), req.session.pendingDeviceFingerprint ?? null, "Failed TOTP/backup-code verification");
      res.status(401).json({ error: "Invalid or expired code." });
      return;
    }

    await clearTotpFailures(userId);

    if (usedBackupCode) {
      await auditLog(userId, "2fa.backup_code_used", "Backup code consumed at login", getClientIp(req));
    }
    await securityLog(userId, "2fa.login_verified", true, getClientIp(req), req.session.pendingDeviceFingerprint ?? null, "TOTP/backup-code verification succeeded");

    // If enrolling for the first time, flip on 2FA and mint backup codes.
    const wasEnrolling = !!req.session.pendingTotpEnrolling;
    let newBackupCodes: string[] | undefined;
    if (wasEnrolling) {
      newBackupCodes = generateBackupCodes();
      const twoFaVerifiedAt = new Date();
      await db.update(usersTable).set({
        twoFaEnabled: true,
        twoFaMethod: "totp",
        twoFaVerifiedAt,
        backupCodes: await hashBackupCodes(newBackupCodes),
      }).where(eq(usersTable.id, userId));
      user.twoFaEnabled = true;
      user.twoFaMethod = "totp";
      user.twoFaVerifiedAt = twoFaVerifiedAt;
      await auditLog(userId, "2fa.enabled", "2FA enabled via TOTP (enrolled during login)", getClientIp(req));
      await notify2faEnabled(userId, "totp");
    }

    const result = await finalizeLogin({
      req,
      user,
      ipAddress: getClientIp(req),
      deviceInfo: req.session.pendingDeviceName ?? "Unknown Device",
      browser: parseDevice(req.headers["user-agent"]).browser,
      os: parseDevice(req.headers["user-agent"]).os,
      rememberMe: !!req.session.pendingRememberMe,
      deviceFingerprint: req.session.pendingDeviceFingerprint ?? null,
      wasNewDevice: !!req.session.pendingIsNewDevice,
      trustDevice: trustDevice === true,
    });

    const trustedUntil = trustDevice ? new Date(Date.now() + TRUST_DURATION_MS).toISOString() : undefined;
    res.json({
      ...result,
      ...(trustedUntil ? { trustedUntil } : {}),
      ...(newBackupCodes ? { backupCodes: newBackupCodes } : {}),
    });
    return;
  }

  res.status(401).json({ error: "Not authenticated" });
}));

// ─── POST /auth/2fa/regenerate-backup-codes ──────────────────────────────────
// Generates a fresh set of backup codes without disabling/re-enabling 2FA.
// Requires the current password to prevent abuse.
router.post("/auth/2fa/regenerate-backup-codes", requireAuth, asyncHandler(async (req, res) => {
  const { currentPassword } = req.body as { currentPassword?: string };
  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (!user.twoFaEnabled) { res.status(400).json({ error: "Two-factor authentication is not enabled." }); return; }
  if (!currentPassword || !(await comparePassword(currentPassword, user.passwordHash))) {
    res.status(400).json({ error: "Current password is incorrect" });
    return;
  }

  const backupCodes = generateBackupCodes();
  await db.update(usersTable)
    .set({ backupCodes: await hashBackupCodes(backupCodes) })
    .where(eq(usersTable.id, userId));

  await auditLog(userId, "2fa.backup_codes_regenerated", "Backup codes regenerated", getClientIp(req));
  await securityLog(userId, "2fa.backup_codes_regenerated", true, getClientIp(req), null, "User regenerated backup codes");
  res.json({ backupCodes });
}));

export default router;
