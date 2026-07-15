import { Router, type IRouter } from "express";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { db, usersTable, emailOtpsTable } from "@workspace/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { requireAuth, comparePassword, auditLog, securityLog, getClientIp, parseDevice } from "../../lib/auth";
import { encryptField, decryptField } from "../../lib/encryption";
import { hashOtp } from "./helpers";
import { finalizeLogin } from "./login-helpers";
import { notify2faEnabled, notify2faDisabled } from "../../services/notificationTemplates";
import { asyncHandler } from "../../lib/async-handler";

const router: IRouter = Router();

// TOTP window = 120 seconds (code valid for 2 minutes, refreshes every 2 min)
authenticator.options = { step: 120 };

const BACKUP_CODE_COUNT = 8;

// ─── Backup codes ──────────────────────────────────────────────────────────────
function generateBackupCodes(): string[] {
  return Array.from({ length: BACKUP_CODE_COUNT }, () =>
    crypto.randomBytes(5).toString("hex").toUpperCase().match(/.{1,5}/g)!.join("-")
  );
}

async function hashBackupCodes(codes: string[]): Promise<string> {
  const hashed = await Promise.all(codes.map((c) => bcrypt.hash(c, 10)));
  return JSON.stringify(hashed);
}

/** Attempts to consume a backup code. Returns true and persists removal on success. */
async function tryConsumeBackupCode(userId: number, code: string): Promise<boolean> {
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

// ─── POST /auth/2fa/setup-totp — begin TOTP enrollment (authenticated) ────────
router.post("/auth/2fa/setup-totp", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(user.email, "SAHU CSC", secret);
  const qrCode = await QRCode.toDataURL(otpauth);

  // Store the (unconfirmed) secret encrypted. twoFaEnabled stays false until
  // the user proves possession via /auth/2fa/verify-totp.
  await db.update(usersTable).set({ totpSecret: await encryptField(secret) }).where(eq(usersTable.id, userId));

  res.json({ secret, qrCode, manualEntryKey: secret });
}));

// ─── POST /auth/2fa/verify-totp ────────────────────────────────────────────────
// Mode A (req.session.userId set): confirms TOTP setup, enables 2FA, issues backup codes.
// Mode B (req.session.pendingUserId set): finalizes a login that required a TOTP challenge.
router.post("/auth/2fa/verify-totp", asyncHandler(async (req, res) => {
  const { code, backupCode, trustDevice } = req.body as { code?: string; backupCode?: string; trustDevice?: boolean };

  // ── Mode A: confirming setup on an already-authenticated session ──────────
  if (req.session.userId) {
    const userId = req.session.userId;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user?.totpSecret) { res.status(400).json({ error: "No TOTP setup in progress. Call setup-totp first." }); return; }
    if (!code || !/^\d{6}$/.test(code)) { res.status(400).json({ error: "Enter the 6-digit code from your authenticator app." }); return; }

    const secret = await decryptField(user.totpSecret);
    const valid = authenticator.verify({ token: code, secret: secret! });
    if (!valid) { res.status(400).json({ error: "Invalid code. Please try again." }); return; }

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

  // ── Mode B: finalizing a login that required TOTP verification ────────────
  if (req.session.pendingUserId) {
    const userId = req.session.pendingUserId;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) { res.status(401).json({ error: "Session expired. Please log in again." }); return; }

    let ok = false;
    if (code && /^\d{6}$/.test(code) && user.totpSecret) {
      const secret = await decryptField(user.totpSecret);
      ok = authenticator.verify({ token: code, secret: secret! });
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
    res.json(result);
    return;
  }

  res.status(401).json({ error: "Not authenticated" });
}));

// ─── POST /auth/2fa/enable-otp — turn on OTP-based 2FA (authenticated) ────────
// No secret to prove possession of (OTP rides on the already-verified email),
// so this requires the current password instead, matching /profile & /disable.
router.post("/auth/2fa/enable-otp", requireAuth, asyncHandler(async (req, res) => {
  const { currentPassword } = req.body as { currentPassword?: string };
  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (!currentPassword || !(await comparePassword(currentPassword, user.passwordHash))) {
    res.status(400).json({ error: "Current password is incorrect" });
    return;
  }

  const backupCodes = generateBackupCodes();
  await db.update(usersTable).set({
    twoFaEnabled: true,
    twoFaMethod: "otp",
    twoFaVerifiedAt: new Date(),
    backupCodes: await hashBackupCodes(backupCodes),
  }).where(eq(usersTable.id, userId));

  await auditLog(userId, "2fa.enabled", "2FA enabled via Email OTP", getClientIp(req));
  await securityLog(userId, "2fa.enabled", true, getClientIp(req), null, "Enabled via Email OTP");
  await notify2faEnabled(userId, "otp");
  res.json({ verified: true, backupCodes });
}));

// ─── POST /auth/2fa/verify-otp ─────────────────────────────────────────────────
// Only used mid-login (req.session.pendingUserId) to verify the OTP that
// login.ts already sent to the user's email.
router.post("/auth/2fa/verify-otp", asyncHandler(async (req, res) => {
  const { otp, backupCode, trustDevice } = req.body as { otp?: string; backupCode?: string; trustDevice?: boolean };

  if (!req.session.pendingUserId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const userId = req.session.pendingUserId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(401).json({ error: "Session expired. Please log in again." }); return; }

  let ok = false;
  if (otp && /^\d{6}$/.test(otp)) {
    const [record] = await db
      .select()
      .from(emailOtpsTable)
      .where(and(eq(emailOtpsTable.email, user.email), eq(emailOtpsTable.purpose, "2fa_login"), isNull(emailOtpsTable.usedAt)))
      .orderBy(desc(emailOtpsTable.createdAt))
      .limit(1);

    if (record && new Date() <= record.expiresAt && record.failedAttempts < 5) {
      if (record.otpHash === hashOtp(otp)) {
        ok = true;
        await db.update(emailOtpsTable).set({ usedAt: new Date() }).where(eq(emailOtpsTable.id, record.id));
      } else {
        await db.update(emailOtpsTable).set({ failedAttempts: record.failedAttempts + 1 }).where(eq(emailOtpsTable.id, record.id));
      }
    }
  }
  if (!ok && backupCode) {
    ok = await tryConsumeBackupCode(userId, backupCode);
  }

  if (!ok) {
    await auditLog(userId, "2fa.login_failed", "Failed OTP/backup-code verification during login", getClientIp(req));
    await securityLog(userId, "2fa.login_failed", false, getClientIp(req), req.session.pendingDeviceFingerprint ?? null, "Failed OTP/backup-code verification");
    res.status(401).json({ error: "Invalid or expired code." });
    return;
  }

  await securityLog(userId, "2fa.login_verified", true, getClientIp(req), req.session.pendingDeviceFingerprint ?? null, "OTP/backup-code verification succeeded");
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
  res.json(result);
}));

// ─── POST /auth/2fa/disable — BLOCKED: 2FA is mandatory ──────────────────────
router.post("/auth/2fa/disable", requireAuth, asyncHandler(async (_req, res) => {
  res.status(403).json({ error: "Two-factor authentication is mandatory and cannot be disabled." });
}));

// ─── GET /auth/2fa/current-totp-code — returns live TOTP code ─────────────────
// Works in two contexts:
//   • Setup mode  (req.session.userId set)   — user is authenticated, setting up TOTP
//   • Login mode  (req.session.pendingUserId) — user passed credentials, awaiting TOTP
// Returns the current code + seconds remaining until it rotates.
router.get("/auth/2fa/current-totp-code", asyncHandler(async (req, res) => {
  const userId = req.session.userId ?? req.session.pendingUserId;
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const [user] = await db
    .select({ totpSecret: usersTable.totpSecret })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user?.totpSecret) { res.status(404).json({ error: "No TOTP configured" }); return; }

  const secret = await decryptField(user.totpSecret);
  const code = authenticator.generate(secret!);
  const step = (authenticator.options as any).step as number ?? 120;
  const timeRemaining = step - (Math.floor(Date.now() / 1000) % step);

  res.json({ code, timeRemaining, step });
}));

// ─── GET /auth/2fa/status ───────────────────────────────────────────────────────
router.get("/auth/2fa/status", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  let backupCodesRemaining = 0;
  if (user.backupCodes) {
    try { backupCodesRemaining = JSON.parse(user.backupCodes).length; } catch { /* ignore */ }
  }

  res.json({
    enabled: user.twoFaEnabled,
    method: user.twoFaMethod,
    verifiedAt: user.twoFaVerifiedAt ? user.twoFaVerifiedAt.toISOString() : null,
    backupCodesRemaining,
  });
}));

export default router;
