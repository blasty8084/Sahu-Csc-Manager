import { Router, type IRouter } from "express";
import { db, usersTable, passwordResetTokensTable, emailOtpsTable } from "@workspace/db";
import { eq, or, and } from "drizzle-orm";
import { z } from "zod/v4";
import { desc } from "drizzle-orm";
import { hashPassword, getClientIp, auditLog } from "../../lib/auth";
import { passwordPolicySchema } from "../../lib/password-policy";
import { hashOtp } from "./helpers";

const router: IRouter = Router();

const ResetPasswordLegacyBody = z.object({
  identifier: z.string().min(1),
  otp: z.string().length(6),
  password: passwordPolicySchema,
});

const ResetPasswordTokenBody = z.object({
  resetToken: z.string().uuid("Invalid reset token"),
  password: passwordPolicySchema,
});

// ─── POST /auth/reset-password ────────────────────────────────────────────────
// Mode 1 (new): { resetToken, password }  ← from email OTP verify-otp flow
// Mode 2 (legacy): { identifier, otp, password }
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
      .where(and(eq(emailOtpsTable.verifiedToken, resetToken), eq(emailOtpsTable.purpose, "password_reset")))
      .limit(1);

    if (!record) { res.status(400).json({ error: "Invalid or expired reset token. Please request a new OTP." }); return; }
    if (new Date() > record.expiresAt) { res.status(400).json({ error: "Reset token has expired. Please request a new OTP." }); return; }

    const [user] = await db
      .select({ id: usersTable.id, username: usersTable.username })
      .from(usersTable)
      .where(eq(usersTable.email, record.email));

    if (!user) { res.status(400).json({ error: "Account not found." }); return; }

    const passwordHash = await hashPassword(password);
    await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, user.id));
    // Consume the token so it can't be reused
    await db.update(emailOtpsTable).set({ verifiedToken: null }).where(eq(emailOtpsTable.id, record.id));

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
    .where(or(eq(usersTable.username, identifier), eq(usersTable.email, identifier), eq(usersTable.mobile, identifier)));

  if (!user) { res.status(400).json({ error: "Invalid OTP or account not found." }); return; }

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
