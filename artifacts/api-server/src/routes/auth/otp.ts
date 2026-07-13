import { Router, type IRouter } from "express";
import { db, usersTable, emailOtpsTable, passwordResetTokensTable } from "@workspace/db";
import { eq, or, and, gt, count, desc, isNull } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getClientIp } from "../../lib/auth";
import { isSmtpConfigured } from "../../lib/mailer";
import { enqueueEmail, buildOtpMailOptions } from "../../lib/queue-client";
import { logger } from "../../lib/logger";
import { generateNumericOtp, hashOtp, maskEmail } from "./helpers";

const router: IRouter = Router();

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

// ─── POST /auth/send-otp ───────────────────────────────────────────────────────
// registration : requires { email, purpose }
// password_reset: accepts { identifier, purpose } OR { email, purpose }
router.post("/auth/send-otp", async (req, res): Promise<void> => {
  if (!isSmtpConfigured()) {
    res.status(503).json({
      error: "Email service not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in Secrets.",
    });
    return;
  }

  const { email: rawEmail, identifier, purpose } = req.body as {
    email?: string; identifier?: string; purpose?: string;
  };

  if (!purpose || !["registration", "password_reset"].includes(purpose)) {
    res.status(400).json({ error: "purpose must be 'registration' or 'password_reset'" });
    return;
  }

  const clientIp = getClientIp(req);
  let resolvedEmail: string | null = null;

  if (purpose === "password_reset") {
    const lookup = identifier ?? rawEmail;
    if (!lookup?.trim()) {
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
    if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      res.status(400).json({ error: "Enter a valid email address." });
      return;
    }
    resolvedEmail = rawEmail.toLowerCase().trim();
    const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, resolvedEmail));
    if (existing) {
      res.status(409).json({ error: "This email is already registered. Please log in." });
      return;
    }
  }

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const [rateRow] = await db
    .select({ cnt: count() })
    .from(emailOtpsTable)
    .where(and(eq(emailOtpsTable.email, resolvedEmail), eq(emailOtpsTable.purpose, purpose), gt(emailOtpsTable.createdAt, windowStart)));

  if ((rateRow?.cnt ?? 0) >= RATE_LIMIT_MAX) {
    res.status(429).json({ error: "Too many OTP requests. Please wait 15 minutes before requesting again.", rateLimited: true });
    return;
  }

  const otp = generateNumericOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await db.insert(emailOtpsTable).values({ email: resolvedEmail, purpose, otpHash, expiresAt, ipAddress: clientIp });

  try {
    await enqueueEmail(buildOtpMailOptions(resolvedEmail, otp, purpose as "registration" | "password_reset", expiresAt));
  } catch (err) {
    logger.error({ err, purpose, email: maskEmail(resolvedEmail) }, "Failed to enqueue OTP email");
    res.status(502).json({ error: "Failed to send email. Please check SMTP configuration or try again." });
    return;
  }

  res.json({ message: "OTP sent. It expires in 10 minutes.", maskedEmail: maskEmail(resolvedEmail) });
});

// ─── POST /auth/verify-otp ────────────────────────────────────────────────────
// Modes:
//  1/2. { identifier|email, otp, purpose }  — email-OTP flow (registration / password_reset)
//  3.   { identifier, otp }                 — legacy admin-OTP via passwordResetTokens table
router.post("/auth/verify-otp", async (req, res): Promise<void> => {
  const { email: rawEmail, otp, purpose, identifier } = req.body as {
    email?: string; otp?: string; purpose?: string; identifier?: string;
  };

  const hasPurpose = !!purpose && ["registration", "password_reset"].includes(purpose);

  if (hasPurpose) {
    if (!otp || !/^\d{6}$/.test(otp)) { res.json({ valid: false, reason: "missing" }); return; }

    let email = rawEmail;
    if (!email && identifier && purpose === "password_reset") {
      const [u] = await db
        .select({ email: usersTable.email, isActive: usersTable.isActive })
        .from(usersTable)
        .where(or(eq(usersTable.username, identifier.trim()), eq(usersTable.email, identifier.trim()), eq(usersTable.mobile, identifier.trim())));
      if (!u?.isActive) { res.json({ valid: false, reason: "invalid" }); return; }
      email = u.email;
    }
    if (!email) { res.json({ valid: false, reason: "missing" }); return; }

    const otpHash = hashOtp(otp);
    const [record] = await db
      .select()
      .from(emailOtpsTable)
      .where(and(eq(emailOtpsTable.email, email), eq(emailOtpsTable.purpose, purpose), eq(emailOtpsTable.otpHash, otpHash), isNull(emailOtpsTable.usedAt)))
      .orderBy(desc(emailOtpsTable.createdAt))
      .limit(1);

    if (!record) { res.json({ valid: false, reason: "invalid" }); return; }
    if (new Date() > record.expiresAt) { res.json({ valid: false, reason: "expired" }); return; }

    if (purpose === "password_reset") {
      const verifiedToken = randomUUID();
      await db.update(emailOtpsTable).set({ usedAt: new Date(), verifiedToken }).where(eq(emailOtpsTable.id, record.id));
      res.json({ valid: true, resetToken: verifiedToken });
      return;
    }

    res.json({ valid: true }); // registration — mark used in register endpoint
    return;
  }

  // ── Legacy admin-OTP via passwordResetTokens ────────────────────────────────
  if (!identifier || !otp || otp.length !== 6) { res.json({ valid: false, reason: "missing" }); return; }

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

export default router;
