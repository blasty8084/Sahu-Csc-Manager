import { Router, type IRouter } from "express";
import { db, usersTable, passwordResetTokensTable } from "@workspace/db";
import { eq, or, desc } from "drizzle-orm";
import { z } from "zod/v4";
import { hashPassword, getClientIp, auditLog } from "../lib/auth";
import crypto from "node:crypto";

const router: IRouter = Router();

const ForgotPasswordBody = z.object({
  identifier: z.string().min(1),
});

const ResetPasswordBody = z.object({
  identifier: z.string().min(1),
  otp: z.string().length(6),
  password: z.string().min(6),
});

function generateOtp(): string {
  // 6-digit numeric OTP (100000–999999)
  const n = 100000 + (crypto.randomInt(900000));
  return String(n);
}

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

// POST /auth/forgot-password
// Admin enters user identifier → get 6-digit OTP to share
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
    // Prevent user enumeration — always return success shape
    res.json({ message: "If that account exists, an OTP has been generated.", otp: null, username: null, expiresAt: null });
    return;
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Invalidate any previous unused tokens for this user
  await db
    .update(passwordResetTokensTable)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokensTable.userId, user.id));

  await db.insert(passwordResetTokensTable).values({
    userId: user.id,
    token: otpHash,   // store hash, not plaintext
    expiresAt,
  });

  await auditLog(user.id, "password.reset_request", `OTP password reset requested for ${user.username}`, getClientIp(req));

  res.json({
    message: "OTP generated successfully.",
    otp,              // plaintext — shown to admin only, not stored
    username: user.username,
    expiresAt: expiresAt.toISOString(),
  });
});

// POST /auth/verify-otp  (used by frontend to validate before showing password fields)
router.post("/auth/verify-otp", async (req, res): Promise<void> => {
  const { identifier, otp } = req.body as { identifier?: string; otp?: string };
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

// POST /auth/reset-password
router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const parsed = ResetPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request. OTP must be 6 digits and password at least 6 characters." });
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

  if (!record) {
    res.status(400).json({ error: "Invalid OTP. Please request a new one." });
    return;
  }
  if (record.usedAt) {
    res.status(400).json({ error: "This OTP has already been used. Please request a new one." });
    return;
  }
  if (new Date() > record.expiresAt) {
    res.status(400).json({ error: "OTP has expired. Please request a new one." });
    return;
  }
  if (record.token !== otpHash) {
    res.status(400).json({ error: "Incorrect OTP. Please check and try again." });
    return;
  }

  const passwordHash = await hashPassword(password);

  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, user.id));
  await db.update(passwordResetTokensTable).set({ usedAt: new Date() }).where(eq(passwordResetTokensTable.id, record.id));

  await auditLog(user.id, "password.reset_complete", `Password reset via OTP for ${user.username}`, getClientIp(req));

  res.json({ message: "Password reset successfully. You can now log in with your new password." });
});

export default router;
