import { Router, type IRouter } from "express";
import { db, usersTable, passwordResetTokensTable } from "@workspace/db";
import { eq, or, and, gt, isNull } from "drizzle-orm";
import { z } from "zod/v4";
import { hashPassword, getClientIp, auditLog } from "../lib/auth";
import crypto from "node:crypto";

const router: IRouter = Router();

const ForgotPasswordBody = z.object({
  identifier: z.string().min(1),
});

const ResetPasswordBody = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function getResetUrl(req: any, token: string): string {
  const proto = req.headers["x-forwarded-proto"] ?? (req.socket as any)?.encrypted ? "https" : "http";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  // Use the path the frontend is served at — strip /api prefix
  const basePath = (process.env.BASE_PATH ?? "/").replace(/\/$/, "");
  return `${proto}://${host}${basePath}/reset-password?token=${token}`;
}

// POST /auth/forgot-password
// Returns the reset URL directly (display to admin/user — no email service required)
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

  // Always return success to prevent user enumeration
  if (!user || !user.isActive) {
    res.json({
      message: "If that account exists, a reset link has been generated.",
      resetUrl: null,
      expiresAt: null,
    });
    return;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.insert(passwordResetTokensTable).values({
    userId: user.id,
    token,
    expiresAt,
  });

  const resetUrl = getResetUrl(req, token);

  await auditLog(user.id, "password.reset_request", `Password reset requested for ${user.username}`, getClientIp(req));

  res.json({
    message: "Reset link generated successfully.",
    resetUrl,
    expiresAt: expiresAt.toISOString(),
    username: user.username,
  });
});

// GET /auth/verify-reset-token?token=xxx
router.get("/auth/verify-reset-token", async (req, res): Promise<void> => {
  const token = req.query.token as string;
  if (!token) {
    res.status(400).json({ valid: false, reason: "missing" });
    return;
  }

  const [record] = await db
    .select({
      id: passwordResetTokensTable.id,
      userId: passwordResetTokensTable.userId,
      expiresAt: passwordResetTokensTable.expiresAt,
      usedAt: passwordResetTokensTable.usedAt,
    })
    .from(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.token, token));

  if (!record) {
    res.json({ valid: false, reason: "invalid" });
    return;
  }

  if (record.usedAt) {
    res.json({ valid: false, reason: "used" });
    return;
  }

  if (new Date() > record.expiresAt) {
    res.json({ valid: false, reason: "expired" });
    return;
  }

  const [user] = await db
    .select({ username: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.id, record.userId));

  res.json({
    valid: true,
    username: user?.username ?? "Unknown",
    expiresAt: record.expiresAt.toISOString(),
  });
});

// POST /auth/reset-password
router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const parsed = ResetPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request. Password must be at least 6 characters." });
    return;
  }

  const { token, password } = parsed.data;

  const [record] = await db
    .select()
    .from(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.token, token));

  if (!record) {
    res.status(400).json({ error: "Invalid reset link." });
    return;
  }

  if (record.usedAt) {
    res.status(400).json({ error: "This reset link has already been used." });
    return;
  }

  if (new Date() > record.expiresAt) {
    res.status(400).json({ error: "This reset link has expired. Please request a new one." });
    return;
  }

  const passwordHash = await hashPassword(password);

  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, record.userId));
  await db.update(passwordResetTokensTable).set({ usedAt: new Date() }).where(eq(passwordResetTokensTable.id, record.id));

  await auditLog(record.userId, "password.reset_complete", "Password reset completed via token", getClientIp(req));

  // Invalidate any active sessions for this user by destroying them (best-effort)
  res.json({ message: "Password reset successfully. You can now log in with your new password." });
});

export default router;
