import { Router, type IRouter } from "express";
import { db, usersTable, passwordResetTokensTable, emailOtpsTable } from "@workspace/db";
import { eq, or, desc, and, gt, isNull, count } from "drizzle-orm";
import { z } from "zod/v4";
import { hashPassword, getClientIp, auditLog } from "../lib/auth";
import { sendOtpEmail, isSmtpConfigured } from "../lib/mailer";
import crypto from "node:crypto";
import { randomUUID } from "node:crypto";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

function generateNumericOtp(): string {
  const n = 100000 + crypto.randomInt(900000);
  return String(n);
}

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

// ─── POST /auth/send-otp ───────────────────────────────────────────────────────
const SendOtpBody = z.object({
  email: z.string().email("Invalid email address"),
  purpose: z.enum(["registration", "password_reset"]),
});

router.post("/auth/send-otp", async (req, res): Promise<void> => {
  if (!isSmtpConfigured()) {
    res.status(503).json({
      error: "Email service not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in Secrets.",
    });
    return;
  }

  const parsed = SendOtpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues?.[0]?.message ?? "Validation failed" });
    return;
  }

  const { email, purpose } = parsed.data;
  const clientIp = getClientIp(req);
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

  // Rate limit: max 3 OTPs per email per purpose per 15 min
  const [rateRow] = await db
    .select({ cnt: count() })
    .from(emailOtpsTable)
    .where(
      and(
        eq(emailOtpsTable.email, email),
        eq(emailOtpsTable.purpose, purpose),
        gt(emailOtpsTable.createdAt, windowStart)
      )
    );

  if ((rateRow?.cnt ?? 0) >= RATE_LIMIT_MAX) {
    res.status(429).json({
      error: "Too many OTP requests. Please wait 15 minutes before requesting again.",
      rateLimited: true,
    });
    return;
  }

  // For password_reset: silently succeed even if email not found (prevent enumeration)
  if (purpose === "password_reset") {
    const [user] = await db
      .select({ id: usersTable.id, isActive: usersTable.isActive })
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!user || !user.isActive) {
      // Return success shape without confirming existence
      res.json({ message: "If an account with that email exists, an OTP has been sent." });
      return;
    }
  }

  // For registration: check email is not already registered
  if (purpose === "registration") {
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (existing) {
      res.status(409).json({ error: "This email is already registered. Please log in." });
      return;
    }
  }

  const otp = generateNumericOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await db.insert(emailOtpsTable).values({
    email,
    purpose,
    otpHash,
    expiresAt,
    ipAddress: clientIp,
  });

  // Send email — never log OTP plaintext
  try {
    await sendOtpEmail(email, otp, purpose, expiresAt);
  } catch (err) {
    logger.error({ err, purpose, email: email.replace(/(.{2}).+(@.+)/, "$1***$2") }, "Failed to send OTP email");
    res.status(502).json({ error: "Failed to send email. Please check SMTP configuration or try again." });
    return;
  }

  res.json({ message: "OTP sent to your email address. It expires in 10 minutes." });
});

// ─── POST /auth/verify-otp ────────────────────────────────────────────────────
// Supports two modes:
//  1. Email-based (new):  { email, otp, purpose }
//  2. Identifier-based (legacy):  { identifier, otp }
router.post("/auth/verify-otp", async (req, res): Promise<void> => {
  const { email, otp, purpose, identifier } = req.body as {
    email?: string;
    otp?: string;
    purpose?: string;
    identifier?: string;
  };

  // ── New email+purpose mode ──────────────────────────────────────────────────
  if (email && purpose) {
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      res.json({ valid: false, reason: "missing" });
      return;
    }

    const otpHash = hashOtp(otp);

    const [record] = await db
      .select()
      .from(emailOtpsTable)
      .where(
        and(
          eq(emailOtpsTable.email, email),
          eq(emailOtpsTable.purpose, purpose),
          eq(emailOtpsTable.otpHash, otpHash),
          isNull(emailOtpsTable.usedAt)
        )
      )
      .orderBy(desc(emailOtpsTable.createdAt))
      .limit(1);

    if (!record) {
      res.json({ valid: false, reason: "invalid" });
      return;
    }
    if (new Date() > record.expiresAt) {
      res.json({ valid: false, reason: "expired" });
      return;
    }

    // For password_reset: generate a verified token so reset-password can proceed
    if (purpose === "password_reset") {
      const verifiedToken = randomUUID();
      await db
        .update(emailOtpsTable)
        .set({ usedAt: new Date(), verifiedToken })
        .where(eq(emailOtpsTable.id, record.id));
      res.json({ valid: true, resetToken: verifiedToken });
      return;
    }

    // For registration: just confirm validity (actual use happens at register time)
    // Do NOT mark as used here — register endpoint will mark it used
    res.json({ valid: true });
    return;
  }

  // ── Legacy identifier mode (backward compat) ────────────────────────────────
  if (!identifier || !otp || otp.length !== 6) {
    res.json({ valid: false, reason: "missing" });
    return;
  }

  const [user] = await db
    .select({ id: usersTable.id, username: usersTable.username })
    .from(usersTable)
    .where(
      or(
        eq(usersTable.username, identifier),
        eq(usersTable.email, identifier),
        eq(usersTable.mobile, identifier)
      )
    );

  if (!user) { res.json({ valid: false, reason: "invalid" }); return; }

  const otpHash = hashOtp(otp);
  const [record] = await db
    .select()
    .from(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.userId, user.id))
    .orderBy(desc(passwordResetTokensTable.createdAt))
    .limit(1);

  if (!record) { res.json({ valid: false, reason: "invalid" }); return; }
  if (record.usedAt) { res.json({ valid: false, reason: "used" }); return; }
  if (new Date() > record.expiresAt) { res.json({ valid: false, reason: "expired" }); return; }
  if (record.token !== otpHash) { res.json({ valid: false, reason: "invalid" }); return; }

  res.json({ valid: true, username: user.username, expiresAt: record.expiresAt.toISOString() });
});

// ─── POST /auth/forgot-password (legacy — admin-generated OTP) ───────────────
const ForgotPasswordBody = z.object({
  identifier: z.string().min(1),
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const parsed = ForgotPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please provide a username, email, or mobile number" });
    return;
  }

  const { identifier } = parsed.data;

  const [user] = await db
    .select({ id: usersTable.id, username: usersTable.username, isActive: usersTable.isActive })
    .from(usersTable)
    .where(
      or(
        eq(usersTable.username, identifier),
        eq(usersTable.email, identifier),
        eq(usersTable.mobile, identifier)
      )
    );

  if (!user || !user.isActive) {
    res.json({ message: "If that account exists, an OTP has been generated.", otp: null, username: null, expiresAt: null });
    return;
  }

  const otp = generateNumericOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db
    .update(passwordResetTokensTable)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokensTable.userId, user.id));

  await db.insert(passwordResetTokensTable).values({
    userId: user.id,
    token: otpHash,
    expiresAt,
  });

  await auditLog(user.id, "password.reset_request", `OTP password reset requested for ${user.username}`, getClientIp(req));

  res.json({
    message: "OTP generated successfully.",
    otp,
    username: user.username,
    expiresAt: expiresAt.toISOString(),
  });
});

// ─── POST /auth/reset-password ────────────────────────────────────────────────
// Mode 1 (new): { resetToken, password }  ← from email OTP flow
// Mode 2 (legacy): { identifier, otp, password }
const ResetPasswordLegacyBody = z.object({
  identifier: z.string().min(1),
  otp: z.string().length(6),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const ResetPasswordTokenBody = z.object({
  resetToken: z.string().uuid("Invalid reset token"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  // ── New token-based flow ────────────────────────────────────────────────────
  if (req.body?.resetToken) {
    const parsed = ResetPasswordTokenBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues?.[0]?.message ?? "Invalid request" });
      return;
    }
    const { resetToken, password } = parsed.data;

    const [record] = await db
      .select()
      .from(emailOtpsTable)
      .where(
        and(
          eq(emailOtpsTable.verifiedToken, resetToken),
          eq(emailOtpsTable.purpose, "password_reset")
        )
      )
      .limit(1);

    if (!record) {
      res.status(400).json({ error: "Invalid or expired reset token. Please request a new OTP." });
      return;
    }
    if (new Date() > record.expiresAt) {
      res.status(400).json({ error: "Reset token has expired. Please request a new OTP." });
      return;
    }

    const [user] = await db
      .select({ id: usersTable.id, username: usersTable.username })
      .from(usersTable)
      .where(eq(usersTable.email, record.email));

    if (!user) {
      res.status(400).json({ error: "Account not found." });
      return;
    }

    const passwordHash = await hashPassword(password);
    await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, user.id));
    // Consume the token so it can't be reused
    await db
      .update(emailOtpsTable)
      .set({ verifiedToken: null })
      .where(eq(emailOtpsTable.id, record.id));

    await auditLog(user.id, "password.reset", `Password reset via email OTP for ${user.username}`, getClientIp(req));
    res.json({ message: "Password reset successfully. You can now log in with your new password." });
    return;
  }

  // ── Legacy identifier + OTP flow ────────────────────────────────────────────
  const parsed = ResetPasswordLegacyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues?.[0]?.message ?? "Invalid request." });
    return;
  }

  const { identifier, otp, password } = parsed.data;

  const [user] = await db
    .select({ id: usersTable.id, username: usersTable.username })
    .from(usersTable)
    .where(
      or(
        eq(usersTable.username, identifier),
        eq(usersTable.email, identifier),
        eq(usersTable.mobile, identifier)
      )
    );

  if (!user) {
    res.status(400).json({ error: "Invalid OTP or account not found." });
    return;
  }

  const otpHash = hashOtp(otp);
  const [record] = await db
    .select()
    .from(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.userId, user.id))
    .orderBy(desc(passwordResetTokensTable.createdAt))
    .limit(1);

  if (!record) { res.status(400).json({ error: "Invalid OTP. Please request a new one." }); return; }
  if (record.usedAt) { res.status(400).json({ error: "This OTP has already been used. Please request a new one." }); return; }
  if (new Date() > record.expiresAt) { res.status(400).json({ error: "OTP has expired. Please request a new one." }); return; }
  if (record.token !== otpHash) { res.status(400).json({ error: "Incorrect OTP. Please check and try again." }); return; }

  const passwordHash = await hashPassword(password);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, user.id));
  await db.update(passwordResetTokensTable).set({ usedAt: new Date() }).where(eq(passwordResetTokensTable.id, record.id));

  await auditLog(user.id, "password.reset", `Password reset via OTP for ${user.username}`, getClientIp(req));
  res.json({ message: "Password reset successfully. You can now log in with your new password." });
});

export default router;
