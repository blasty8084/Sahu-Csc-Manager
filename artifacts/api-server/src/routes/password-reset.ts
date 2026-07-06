import { Router, type IRouter } from "express";
import { db, usersTable, passwordResetTokensTable, emailOtpsTable } from "@workspace/db";
import { eq, or, desc, and, gt, isNull, count } from "drizzle-orm";
import { z } from "zod/v4";
import { hashPassword, getClientIp, auditLog } from "../lib/auth";
import { sendOtpEmail, isSmtpConfigured } from "../lib/mailer";
import crypto from "node:crypto";
import { randomUUID } from "node:crypto";
import { logger } from "../lib/logger";
import { passwordPolicySchema } from "../lib/password-policy";

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

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}${"*".repeat(Math.min(local.length - 2, 4))}@${domain}`;
}

// ─── POST /auth/send-otp ───────────────────────────────────────────────────────
// registration : requires { email, purpose }
// password_reset: accepts { identifier, purpose } (username / email / mobile)
//                 OR { email, purpose } for backward compat
router.post("/auth/send-otp", async (req, res): Promise<void> => {
  if (!isSmtpConfigured()) {
    res.status(503).json({
      error: "Email service not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in Secrets.",
    });
    return;
  }

  const { email: rawEmail, identifier, purpose } = req.body as {
    email?: string;
    identifier?: string;
    purpose?: string;
  };

  if (!purpose || !["registration", "password_reset"].includes(purpose)) {
    res.status(400).json({ error: "purpose must be 'registration' or 'password_reset'" });
    return;
  }

  const clientIp = getClientIp(req);

  // ── Resolve email ──────────────────────────────────────────────────────────
  let resolvedEmail: string | null = null;

  if (purpose === "password_reset") {
    const lookup = identifier ?? rawEmail;
    if (!lookup || !lookup.trim()) {
      res.status(400).json({ error: "Please enter your username or email address." });
      return;
    }
    const term = lookup.trim();
    const [user] = await db
      .select({ id: usersTable.id, email: usersTable.email, isActive: usersTable.isActive, status: usersTable.status })
      .from(usersTable)
      .where(or(eq(usersTable.username, term), eq(usersTable.email, term), eq(usersTable.mobile, term)));

    if (!user) {
      res.status(404).json({ error: "No account found with that username, email, or mobile number. Please register first.", notRegistered: true });
      return;
    }
    if (!user.isActive || user.status === "DELETED" || user.status === "INACTIVE") {
      res.status(403).json({ error: "This account has been deactivated. Please contact the administrator." });
      return;
    }
    resolvedEmail = user.email;
  } else {
    // registration — email required
    if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      res.status(400).json({ error: "Enter a valid email address." });
      return;
    }
    resolvedEmail = rawEmail.toLowerCase().trim();

    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, resolvedEmail));
    if (existing) {
      res.status(409).json({ error: "This email is already registered. Please log in." });
      return;
    }
  }

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const [rateRow] = await db
    .select({ cnt: count() })
    .from(emailOtpsTable)
    .where(
      and(
        eq(emailOtpsTable.email, resolvedEmail),
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

  const otp = generateNumericOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await db.insert(emailOtpsTable).values({
    email: resolvedEmail,
    purpose,
    otpHash,
    expiresAt,
    ipAddress: clientIp,
  });

  try {
    await sendOtpEmail(resolvedEmail, otp, purpose as "registration" | "password_reset", expiresAt);
  } catch (err) {
    logger.error({ err, purpose, email: maskEmail(resolvedEmail) }, "Failed to send OTP email");
    res.status(502).json({ error: "Failed to send email. Please check SMTP configuration or try again." });
    return;
  }

  res.json({
    message: "OTP sent. It expires in 10 minutes.",
    maskedEmail: maskEmail(resolvedEmail),
  });
});

// ─── POST /auth/verify-otp ────────────────────────────────────────────────────
// Modes:
//  1. { identifier, otp, purpose }  — resolves username/email/mobile → email (new)
//  2. { email, otp, purpose }       — direct email lookup (new)
//  3. { identifier, otp }           — legacy admin-OTP via passwordResetTokens table
router.post("/auth/verify-otp", async (req, res): Promise<void> => {
  const { email: rawEmail, otp, purpose, identifier } = req.body as {
    email?: string;
    otp?: string;
    purpose?: string;
    identifier?: string;
  };

  const hasPurpose = !!purpose && ["registration", "password_reset"].includes(purpose);

  // ── Mode 1 & 2: email-OTP flow ───────────────────────────────────────────────
  if (hasPurpose) {
    if (!otp || !/^\d{6}$/.test(otp)) {
      res.json({ valid: false, reason: "missing" });
      return;
    }

    // Resolve email — direct or via identifier lookup
    let email = rawEmail;
    if (!email && identifier && purpose === "password_reset") {
      const term = identifier.trim();
      const [u] = await db
        .select({ email: usersTable.email, isActive: usersTable.isActive })
        .from(usersTable)
        .where(or(eq(usersTable.username, term), eq(usersTable.email, term), eq(usersTable.mobile, term)));
      if (!u || !u.isActive) {
        res.json({ valid: false, reason: "invalid" });
        return;
      }
      email = u.email;
    }
    if (!email) {
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

    if (purpose === "password_reset") {
      const verifiedToken = randomUUID();
      await db
        .update(emailOtpsTable)
        .set({ usedAt: new Date(), verifiedToken })
        .where(eq(emailOtpsTable.id, record.id));
      res.json({ valid: true, resetToken: verifiedToken });
      return;
    }

    // registration — do NOT mark used here; register endpoint does it
    res.json({ valid: true });
    return;
  }

  // ── Mode 3: legacy admin-OTP via passwordResetTokens ────────────────────────
  if (!identifier || !otp || otp.length !== 6) {
    res.json({ valid: false, reason: "missing" });
    return;
  }

  const [user] = await db
    .select({ id: usersTable.id, username: usersTable.username })
    .from(usersTable)
    .where(or(eq(usersTable.username, identifier), eq(usersTable.email, identifier), eq(usersTable.mobile, identifier)));

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
  password: passwordPolicySchema,
});

const ResetPasswordTokenBody = z.object({
  resetToken: z.string().uuid("Invalid reset token"),
  password: passwordPolicySchema,
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
