import { Router, type IRouter } from "express";
import { authenticator } from "otplib";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, comparePassword, auditLog, securityLog, getClientIp, parseDevice } from "../../lib/auth";
import { decryptField } from "../../lib/encryption";
import { finalizeLogin } from "./login-helpers";
import { notify2faEnabled } from "../../services/notificationTemplates";
import { asyncHandler } from "../../lib/async-handler";
import { isTotpReplay, markTotpUsed, buildQrData } from "./2fa-totp";

export const BACKUP_CODE_COUNT = 8;

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
// Mode A (session.userId): confirms TOTP setup, enables 2FA, issues backup codes.
// Mode B (session.pendingUserId): finalizes a login that required TOTP challenge.
// Also accepts a backup code as fallback for both modes.
router.post("/auth/2fa/verify-totp", asyncHandler(async (req, res) => {
  const { code, backupCode, trustDevice } = req.body as { code?: string; backupCode?: string; trustDevice?: boolean };

  // ── Mode A: confirming setup on an already-authenticated session ────────
  if (req.session.userId) {
    const userId = req.session.userId;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user?.totpSecret) { res.status(400).json({ error: "No TOTP setup in progress. Call setup-totp first." }); return; }
    if (!code || !/^\d{6}$/.test(code)) { res.status(400).json({ error: "Enter the 6-digit code from your authenticator app." }); return; }

    const secret = await decryptField(user.totpSecret);
    if (isTotpReplay(userId, code)) {
      res.status(400).json({ error: "This code has already been used. Wait for the next code." });
      return;
    }

    // window: 1 = accept codes from ±1 period (±30 s) to handle clock drift
    const valid = authenticator.verify({ token: code, secret: secret!, window: 1 } as any);
    if (!valid) { res.status(400).json({ error: "Invalid code. Please try again." }); return; }
    markTotpUsed(userId, code);

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

    let ok = false;
    if (code && /^\d{6}$/.test(code) && user.totpSecret) {
      if (isTotpReplay(userId, code)) {
        await auditLog(userId, "2fa.login_failed", "Replay TOTP code rejected during login", getClientIp(req));
        res.status(401).json({ error: "This code has already been used. Wait for the next code." });
        return;
      }
      const secret = await decryptField(user.totpSecret);
      ok = authenticator.verify({ token: code, secret: secret!, window: 1 } as any);
      if (ok) markTotpUsed(userId, code);
    }
    if (!ok && backupCode) {
      ok = await tryConsumeBackupCode(userId, backupCode);
    }

    if (!ok) {
      await auditLog(userId, "2fa.login_failed", "Failed TOTP/backup-code verification during login", getClientIp(req));
      await securityLog(userId, "2fa.login_failed", false, getClientIp(req), req.session.pendingDeviceFingerprint ?? null, "Failed TOTP/backup-code verification");
      res.status(401).json({ error: "Invalid or expired code." });
      return;
    }

    await securityLog(userId, "2fa.login_verified", true, getClientIp(req), req.session.pendingDeviceFingerprint ?? null, "TOTP/backup-code verification succeeded");

    // If the user chose "Authenticator App" on the verification screen and
    // had no TOTP set up yet, this confirms first-time enrollment — flip on
    // 2FA and mint backup codes, same as Mode A.
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
    res.json(newBackupCodes ? { ...result, backupCodes: newBackupCodes } : result);
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
