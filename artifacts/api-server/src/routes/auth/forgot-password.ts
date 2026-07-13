// Legacy admin-generated OTP flow (pre-email SMTP).
// New users should use POST /auth/send-otp with purpose=password_reset instead.
import { Router, type IRouter } from "express";
import { db, usersTable, passwordResetTokensTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { z } from "zod/v4";
import { getClientIp, auditLog } from "../../lib/auth";
import { generateNumericOtp, hashOtp } from "./helpers";
import { asyncHandler } from "../../lib/async-handler";

const router: IRouter = Router();

const ForgotPasswordBody = z.object({ identifier: z.string().min(1) });

router.post("/auth/forgot-password", asyncHandler(async (req, res) => {
  const parsed = ForgotPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please provide a username, email, or mobile number" });
    return;
  }

  const { identifier } = parsed.data;

  const [user] = await db
    .select({ id: usersTable.id, username: usersTable.username, isActive: usersTable.isActive })
    .from(usersTable)
    .where(or(eq(usersTable.username, identifier), eq(usersTable.email, identifier), eq(usersTable.mobile, identifier)));

  if (!user?.isActive) {
    res.json({ message: "If that account exists, an OTP has been generated.", otp: null, username: null, expiresAt: null });
    return;
  }

  const otp = generateNumericOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.update(passwordResetTokensTable).set({ usedAt: new Date() }).where(eq(passwordResetTokensTable.userId, user.id));
  await db.insert(passwordResetTokensTable).values({ userId: user.id, token: otpHash, expiresAt });

  await auditLog(user.id, "password.reset_request", `OTP password reset requested for ${user.username}`, getClientIp(req));

  res.json({ message: "OTP generated successfully.", otp, username: user.username, expiresAt: expiresAt.toISOString() });
}));

export default router;
