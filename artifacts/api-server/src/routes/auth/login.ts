import { Router, type IRouter } from "express";
import { db, usersTable, deviceSessionsTable } from "@workspace/db";
import { eq, or, and } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";
import { comparePassword, auditLog, securityLog, getClientIp, parseDevice } from "../../lib/auth";
import {
  notifyLoginFailed,
  notifyAccountLocked,
} from "../../services/notificationTemplates";
import { finalizeLogin, sendLoginOtp } from "./login-helpers";
import { asyncHandler } from "../../lib/async-handler";
import { maskEmail } from "./helpers";

const router: IRouter = Router();

const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 5;
const TRUST_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post("/auth/login", asyncHandler(async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues?.[0]?.message ?? "Validation failed" });
    return;
  }
  const { identifier, password } = parsed.data;
  const rememberMe = req.body.rememberMe === true || req.body.rememberMe === "true";
  // Client-computed device fingerprint (SHA-256 of UA+lang+screen+timezone) —
  // optional so older clients / disabled JS crypto still degrade gracefully
  // to "no device-based challenge, just the user's own 2FA setting".
  const deviceFingerprint: string | null =
    typeof req.body.deviceFingerprint === "string" && req.body.deviceFingerprint.length > 0
      ? req.body.deviceFingerprint.slice(0, 128)
      : null;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(
      or(
        eq(usersTable.username, identifier),
        eq(usersTable.email, identifier),
        eq(usersTable.mobile, identifier)
      )
    );

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const clientIp = getClientIp(req);
  const { browser, os, deviceInfo } = parseDevice(req.headers["user-agent"]);

  if (user.status === "PENDING") {
    await auditLog(user.id, "login.failed_inactive", `Login blocked — account pending approval from ${deviceInfo}`, clientIp);
    res.status(403).json({ error: "Your account is pending admin approval. Please wait for an administrator to approve your request.", pending: true });
    return;
  }
  if (!user.isActive || user.status === "DELETED" || user.status === "INACTIVE" || user.status === "SUSPENDED") {
    await auditLog(user.id, "login.failed_inactive", `Login blocked — account status: ${user.status} from ${deviceInfo}`, clientIp);
    if (user.status === "DELETED" && user.rejectionReason) {
      res.status(401).json({
        error: `Your registration was declined. Reason: ${user.rejectionReason}`,
        rejected: true,
        rejectionReason: user.rejectionReason,
      });
    } else if (user.status === "DELETED") {
      res.status(401).json({
        error: "Your registration was declined. Please contact administrator.",
        rejected: true,
      });
    } else {
      res.status(401).json({ error: "Account is not active. Please contact administrator." });
    }
    return;
  }

  if (user.status === "LOCKED" && user.lockedUntil) {
    if (new Date() < user.lockedUntil) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
      await auditLog(user.id, "login.failed_locked", `Login blocked — account locked, ${minutesLeft}m remaining, from ${deviceInfo}`, clientIp);
      res.status(401).json({
        error: `Account temporarily locked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
        locked: true,
        lockedUntil: user.lockedUntil.toISOString(),
      });
      return;
    }
    await db
      .update(usersTable)
      .set({ status: "ACTIVE", failedLoginAttempts: 0, lockedUntil: null })
      .where(eq(usersTable.id, user.id));
    user.status = "ACTIVE";
    user.failedLoginAttempts = 0;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    const attempts = (user.failedLoginAttempts ?? 0) + 1;
    if (attempts >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60_000);
      await db
        .update(usersTable)
        .set({ failedLoginAttempts: attempts, status: "LOCKED", lockedUntil })
        .where(eq(usersTable.id, user.id));
      await auditLog(user.id, "login.failed_max_attempts", `Account locked after ${MAX_ATTEMPTS} failed attempts from ${deviceInfo}`, clientIp);
      await securityLog(user.id, "login.locked", false, clientIp, deviceFingerprint, `Account locked after ${MAX_ATTEMPTS} failed password attempts`);
      await notifyAccountLocked(user.id, clientIp, attempts);
      res.status(401).json({
        error: `Too many failed attempts. Account locked for ${LOCK_MINUTES} minutes.`,
        locked: true,
        lockedUntil: lockedUntil.toISOString(),
      });
    } else {
      await db
        .update(usersTable)
        .set({ failedLoginAttempts: attempts })
        .where(eq(usersTable.id, user.id));
      await auditLog(user.id, "login.failed_password", `Wrong password attempt ${attempts}/${MAX_ATTEMPTS} from ${deviceInfo}`, clientIp);
      await securityLog(user.id, "login.failed_password", false, clientIp, deviceFingerprint, `Attempt ${attempts}/${MAX_ATTEMPTS}`);
      await notifyLoginFailed(user.id, clientIp, deviceInfo, attempts, MAX_ATTEMPTS);
      res.status(401).json({
        error: "Invalid credentials",
        attemptsLeft: MAX_ATTEMPTS - attempts,
      });
    }
    return;
  }

  // ── Device recognition (single-device enforcement) + 2FA gating ───────────
  let knownDevice: typeof deviceSessionsTable.$inferSelect | undefined;
  if (deviceFingerprint) {
    [knownDevice] = await db
      .select()
      .from(deviceSessionsTable)
      .where(and(eq(deviceSessionsTable.userId, user.id), eq(deviceSessionsTable.deviceFingerprint, deviceFingerprint)));
  }

  const isNewDevice = deviceFingerprint != null && !knownDevice;
  const trustedSkip = !!knownDevice?.isTrusted && !!knownDevice.trustedUntil && new Date() < knownDevice.trustedUntil;
  const needsUserTwoFa = user.twoFaEnabled && !trustedSkip;
  const needsChallenge = isNewDevice || needsUserTwoFa;

  if (needsChallenge) {
    // The verification screen now lets the user pick their method (default
    // Email OTP) regardless of the account's stored `twoFaMethod` preference,
    // so we always start the challenge on "otp" and send that email; the
    // client can switch to "Authenticator App" via /auth/2fa/switch-method.
    const method: "otp" | "totp" = "otp";
    const totpEnrolled = !!user.totpSecret;

    req.session.pendingUserId = user.id;
    req.session.pendingDeviceFingerprint = deviceFingerprint;
    req.session.pendingDeviceName = deviceInfo;
    req.session.pendingRememberMe = rememberMe;
    req.session.pendingMethod = method;
    req.session.pendingIsNewDevice = isNewDevice;
    req.session.pendingTotpEnrolling = false;
    req.session.cookie.maxAge = 10 * 60 * 1000; // pending challenge window

    try {
      const { maskedEmail } = await sendLoginOtp(
        user,
        clientIp,
        `Verification code sent for ${isNewDevice ? "new device" : "2FA"} login from ${deviceInfo}`
      );
      await securityLog(user.id, isNewDevice ? "device.new_challenge" : "2fa.challenge", true, clientIp, deviceFingerprint, "OTP challenge issued");
      res.json({ requires2fa: true, method: "otp", maskedEmail, totpEnrolled, isNewDevice });
    } catch (err: any) {
      // Email send failed — the session already has pendingUserId set so the
      // challenge window is still valid. Instead of returning a hard error
      // (which hides the verification page), fall back gracefully:
      //   • User has TOTP enrolled → switch to TOTP challenge (no email needed)
      //   • No TOTP → still show the verification page with an email error flag
      //     so the user can see the problem and use a backup code or retry.
      if (totpEnrolled) {
        req.session.pendingMethod = "totp";
        await securityLog(user.id, isNewDevice ? "device.new_challenge" : "2fa.challenge", true, clientIp, deviceFingerprint, "OTP email failed, fell back to TOTP challenge");
        res.json({ requires2fa: true, method: "totp", totpEnrolled: true, isNewDevice });
      } else {
        // Still return requires2fa so the verification page renders; the
        // otpError flag lets the frontend display a friendly warning about
        // the email delivery failure.
        const masked = maskEmail(user.email);
        await securityLog(user.id, isNewDevice ? "device.new_challenge" : "2fa.challenge", false, clientIp, deviceFingerprint, `OTP email failed: ${err?.message}`);
        res.json({ requires2fa: true, method: "otp", maskedEmail: masked, totpEnrolled, isNewDevice, otpError: err?.message ?? "Failed to send verification code." });
      }
    }
    return;
  }

  const result = await finalizeLogin({
    req,
    user,
    ipAddress: clientIp,
    deviceInfo,
    browser,
    os,
    rememberMe,
    deviceFingerprint,
    wasNewDevice: false,
    trustDevice: false,
  });
  res.json(result);
}));

export default router;
