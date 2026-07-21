import { Router, type IRouter } from "express";
import crypto from "node:crypto";
import { db, usersTable, emailOtpsTable } from "@workspace/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { requireAuth, comparePassword, auditLog, securityLog, getClientIp, parseDevice } from "../../lib/auth";
import { hashOtp } from "./helpers";
import { finalizeLogin, sendLoginOtp } from "./login-helpers";
import { notify2faEnabled } from "../../services/notificationTemplates";
import { asyncHandler } from "../../lib/async-handler";
import { generateBackupCodes, hashBackupCodes, tryConsumeBackupCode } from "./2fa-backup";

// ─── Timing-safe OTP hash comparison ────────────────────────────────────────
// Hex strings produced by hashOtp() are always 64 chars (SHA-256). If somehow
// lengths differ, timingSafeEqual would throw — fall back to false.
function timingSafeHashEqual(a: string, b: string): boolean {
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

const router: IRouter = Router();

// ─── POST /auth/2fa/switch-method — pick OTP vs TOTP on verification screen ─
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

// ─── POST /auth/2fa/enable-otp — turn on OTP-based 2FA (authenticated) ──────
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

// ─── POST /auth/2fa/verify-otp ───────────────────────────────────────────────
// Mid-login only (session.pendingUserId). Verifies the OTP that login.ts sent
// to the user's email, or a backup code as fallback.
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

export default router;
