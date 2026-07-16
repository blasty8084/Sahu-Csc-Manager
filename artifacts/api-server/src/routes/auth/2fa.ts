import { Router, type IRouter } from "express";
import { authenticator } from "otplib";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import QRCode from "qrcode";
import { db, usersTable, emailOtpsTable } from "@workspace/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { requireAuth, comparePassword, auditLog, securityLog, getClientIp, parseDevice } from "../../lib/auth";
import { encryptField, decryptField } from "../../lib/encryption";
import { hashOtp } from "./helpers";
import { finalizeLogin, sendLoginOtp } from "./login-helpers";
import { notify2faEnabled, notify2faDisabled } from "../../services/notificationTemplates";
import { asyncHandler } from "../../lib/async-handler";

const router: IRouter = Router();

// Standard 30-second TOTP period (RFC 6238).
// All major authenticator apps (Google Authenticator, Authy, Microsoft
// Authenticator, 1Password, etc.) default to 30s and the otpauth:// QR URI
// encodes this explicitly so they stay in sync.
authenticator.options = { step: 30 };

const APP_NAME = "SAHU CSC";
const BACKUP_CODE_COUNT = 8;

// ─── Replay-attack protection ──────────────────────────────────────────────────
// Track the last few TOTP tokens used per user so the same code cannot be
// submitted twice within the same 30-second window.  We keep a small rotating
// window of 3 tokens per user — enough to cover drift ±1 period.
const _usedTotpTokens = new Map<number, string[]>();
function isTotpReplay(userId: number, token: string): boolean {
  return (_usedTotpTokens.get(userId) ?? []).includes(token);
}
function markTotpUsed(userId: number, token: string): void {
  const list = _usedTotpTokens.get(userId) ?? [];
  list.push(token);
  if (list.length > 6) list.splice(0, list.length - 6); // keep last 6
  _usedTotpTokens.set(userId, list);
}

// ─── Timing-safe OTP hash comparison ──────────────────────────────────────────
// Hex strings produced by hashOtp() are always 64 chars (SHA-256). If somehow
// lengths differ, timingSafeEqual would throw — fall back to false.
function timingSafeHashEqual(a: string, b: string): boolean {
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

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

/** Build otpauth:// URI and a QR code data URL for it. */
async function buildQrData(username: string, secret: string): Promise<{ otpauthUri: string; qrCodeDataUrl: string }> {
  const otpauthUri = authenticator.keyuri(username, APP_NAME, secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUri, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 220,
    color: { dark: "#0B1340", light: "#FFFFFF" },
  });
  return { otpauthUri, qrCodeDataUrl };
}

// ─── POST /auth/2fa/setup-totp — auto-enroll TOTP (authenticated) ─────────────
// Generates and stores the TOTP secret. Returns a QR code data URL so the user
// can scan it with Google Authenticator / Authy / any TOTP app, plus the raw
// secret for manual entry. twoFaEnabled stays false until verified via
// /auth/2fa/verify-totp.
router.post("/auth/2fa/setup-totp", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const secret = authenticator.generateSecret();
  await db.update(usersTable).set({ totpSecret: await encryptField(secret) }).where(eq(usersTable.id, userId));

  const { otpauthUri, qrCodeDataUrl } = await buildQrData(user.username, secret);
  res.json({ enrolled: true, qrCodeDataUrl, otpauthUri, secret });
}));

// ─── POST /auth/2fa/setup-totp-pending — auto-enroll TOTP mid-login ───────────
router.post("/auth/2fa/setup-totp-pending", asyncHandler(async (req, res) => {
  if (!req.session.pendingUserId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const userId = req.session.pendingUserId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(401).json({ error: "Session expired. Please log in again." }); return; }

  const secret = authenticator.generateSecret();
  await db.update(usersTable).set({ totpSecret: await encryptField(secret) }).where(eq(usersTable.id, userId));
  req.session.pendingTotpEnrolling = true;
  req.session.pendingMethod = "totp";

  const { otpauthUri, qrCodeDataUrl } = await buildQrData(user.username, secret);
  res.json({ enrolled: true, qrCodeDataUrl, otpauthUri, secret });
}));

// ─── GET /auth/2fa/totp-qr — QR code for an already-setup TOTP (authenticated)
// Lets an existing TOTP user re-scan the QR (e.g. when switching phones).
router.get("/auth/2fa/totp-qr", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (!user.totpSecret) { res.status(400).json({ error: "TOTP not set up" }); return; }

  const secret = await decryptField(user.totpSecret);
  const { otpauthUri, qrCodeDataUrl } = await buildQrData(user.username, secret!);
  res.json({ qrCodeDataUrl, otpauthUri, secret: secret! });
}));

// ─── GET /auth/2fa/totp-code — current rotating code for logged-in user ───────
// Returns the live 6-digit code + seconds until it refreshes, so the app can
// display it in-app without requiring an external authenticator.
router.get("/auth/2fa/totp-code", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (!user.totpSecret) { res.status(400).json({ error: "TOTP not set up" }); return; }

  const secret = await decryptField(user.totpSecret);
  const step = (authenticator.options as any).step ?? 30;
  const code = authenticator.generate(secret!);
  const remaining = step - (Math.floor(Date.now() / 1000) % step);
  res.json({ code, remaining, step });
}));

// ─── GET /auth/2fa/totp-code-pending — current code for mid-login state ───────
router.get("/auth/2fa/totp-code-pending", asyncHandler(async (req, res) => {
  if (!req.session.pendingUserId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const userId = req.session.pendingUserId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(401).json({ error: "Session expired" }); return; }
  if (!user.totpSecret) { res.status(400).json({ error: "TOTP not set up" }); return; }

  const secret = await decryptField(user.totpSecret);
  const step = (authenticator.options as any).step ?? 30;
  const code = authenticator.generate(secret!);
  const remaining = step - (Math.floor(Date.now() / 1000) % step);
  res.json({ code, remaining, step });
}));

// ─── POST /auth/2fa/switch-method — pick OTP vs TOTP on the verification screen
router.post("/auth/2fa/switch-method", asyncHandler(async (req, res) => {
  if (!req.session.pendingUserId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { method } = req.body as { method?: "otp" | "totp" };
  if (method !== "otp" && method !== "totp") { res.status(400).json({ error: "Invalid method" }); return; }

  const userId = req.session.pendingUserId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(401).json({ error: "Session expired. Please log in again." }); return; }

  req.session.pendingMethod = method;
  const deviceFingerprint = req.session.pendingDeviceFingerprint ?? null;

  if (method === "otp") {
    req.session.pendingTotpEnrolling = false;
    try {
      const { maskedEmail } = await sendLoginOtp(user, getClientIp(req), "Verification code re-sent (method switched to Email OTP)");
      await securityLog(user.id, "2fa.challenge", true, getClientIp(req), deviceFingerprint, "OTP challenge (re-)issued via method switch");
      res.json({ method: "otp", maskedEmail });
    } catch (err: any) {
      res.status(err?.status ?? 500).json({ error: err?.message ?? "Failed to send verification code." });
    }
    return;
  }

  // TOTP: report enrollment status (twoFaEnabled = confirmed enrollment).
  const totpEnrolled = !!(user.totpSecret && user.twoFaEnabled);
  res.json({ method: "totp", totpEnrolled });
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

    // Replay protection
    if (isTotpReplay(userId, code)) {
      res.status(400).json({ error: "This code has already been used. Wait for the next code." });
      return;
    }

    // window: 1 = accept codes from ±1 period (±30 s) to handle slight clock drift
    const valid = authenticator.verify({ token: code, secret: secret!, window: 1 });
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

  // ── Mode B: finalizing a login that required TOTP verification ────────────
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
      ok = authenticator.verify({ token: code, secret: secret!, window: 1 });
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
    // had no TOTP set up yet, this same code confirms first-time enrollment
    // — flip on 2FA for the account and mint backup codes, same as Mode A.
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

// ─── POST /auth/2fa/enable-otp — turn on OTP-based 2FA (authenticated) ────────
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
      if (timingSafeHashEqual(record.otpHash, hashOtp(otp))) {
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

// ─── POST /auth/2fa/disable ─────────────────────────────────────────────────────
router.post("/auth/2fa/disable", requireAuth, asyncHandler(async (req, res) => {
  const { currentPassword } = req.body as { currentPassword?: string };
  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (!currentPassword || !(await comparePassword(currentPassword, user.passwordHash))) {
    res.status(400).json({ error: "Current password is incorrect" });
    return;
  }

  await db.update(usersTable).set({
    twoFaEnabled: false,
    twoFaMethod: "otp",
    totpSecret: null,
    twoFaVerifiedAt: null,
    backupCodes: null,
  }).where(eq(usersTable.id, userId));

  // Clear replay-protection state for this user
  _usedTotpTokens.delete(userId);

  await auditLog(userId, "2fa.disabled", "2FA disabled", getClientIp(req));
  await securityLog(userId, "2fa.disabled", true, getClientIp(req), null, null);
  await notify2faDisabled(userId);
  res.json({ message: "2FA disabled" });
}));

// ─── POST /auth/2fa/regenerate-backup-codes ────────────────────────────────────
// Generates a fresh set of 8 backup codes without needing to disable/re-enable
// 2FA. Requires the current password to prevent abuse.
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
    totpConfigured: !!user.totpSecret,
  });
}));

export default router;
