import { Router, type IRouter } from "express";
import { db, usersTable, settingsTable, emailOtpsTable } from "@workspace/db";
import { eq, or, and, isNull, desc } from "drizzle-orm";
import { z } from "zod/v4";
import { hashPassword, auditLog, getClientIp } from "../../lib/auth";
import { notifyNewRegistration } from "../../services/notificationTemplates";
import { cacheGet, cacheSet } from "../../lib/registration-cache";
import { sendNewRegistrationAdminEmail, isSmtpConfigured } from "../../lib/mailer";
import { logger } from "../../lib/logger";
import { passwordPolicySchema } from "../../lib/password-policy";
import { hashOtp } from "./helpers";
import { asyncHandler } from "../../lib/async-handler";

const router: IRouter = Router();

const RegisterBody = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, underscores"),
  email: z.string().email("Invalid email address"),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100).optional(),
  password: passwordPolicySchema,
  emailOtp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d{6}$/, "OTP must be numeric"),
});

// ─── POST /auth/register ──────────────────────────────────────────────────────
router.post("/auth/register", asyncHandler(async (req, res) => {
  // Check registration toggle server-side
  const cached = cacheGet("registration_open");
  let isOpen = cached === "true";
  if (cached === null) {
    const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, "registration_open"));
    isOpen = row?.value === "true";
    cacheSet("registration_open", isOpen ? "true" : "false", 60_000);
  }
  if (!isOpen) {
    res.status(403).json({ error: "Registration is currently closed. Contact your administrator." });
    return;
  }

  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues?.[0];
    res.status(400).json({ error: firstIssue?.message ?? "Validation failed" });
    return;
  }
  const data = parsed.data;

  // ── Verify email OTP before doing anything else ───────────────────────────
  const otpHash = hashOtp(data.emailOtp);
  const [otpRecord] = await db
    .select()
    .from(emailOtpsTable)
    .where(
      and(
        eq(emailOtpsTable.email, data.email),
        eq(emailOtpsTable.purpose, "registration"),
        eq(emailOtpsTable.otpHash, otpHash),
        isNull(emailOtpsTable.usedAt)
      )
    )
    .orderBy(desc(emailOtpsTable.createdAt))
    .limit(1);

  if (!otpRecord) {
    res.status(400).json({ error: "Invalid OTP. Please request a new verification code." });
    return;
  }
  if (new Date() > otpRecord.expiresAt) {
    res.status(400).json({ error: "OTP has expired. Please request a new verification code." });
    return;
  }

  // Check uniqueness
  const conditions: any[] = [
    eq(usersTable.username, data.username),
    eq(usersTable.email, data.email),
  ];
  if (data.mobile) conditions.push(eq(usersTable.mobile, data.mobile));

  const [existing] = await db
    .select({ id: usersTable.id, username: usersTable.username, email: usersTable.email, mobile: usersTable.mobile })
    .from(usersTable)
    .where(or(...conditions));

  if (existing) {
    if (existing.username === data.username) {
      res.status(409).json({ error: "Username already taken" });
    } else if (existing.email === data.email) {
      res.status(409).json({ error: "Email already registered" });
    } else {
      res.status(409).json({ error: "Mobile number already registered" });
    }
    return;
  }

  // Mark OTP as used before inserting user
  await db
    .update(emailOtpsTable)
    .set({ usedAt: new Date() })
    .where(eq(emailOtpsTable.id, otpRecord.id));

  const passwordHash = await hashPassword(data.password);
  const [user] = await db
    .insert(usersTable)
    .values({
      username: data.username,
      email: data.email,
      mobile: data.mobile ?? null,
      fullName: data.fullName ?? null,
      passwordHash,
      role: "operator",
      isActive: false,
      status: "PENDING",
      failedLoginAttempts: 0,
    })
    .returning();

  await auditLog(user.id, "REGISTER_REQUEST", `New registration submitted: ${user.username} (email verified)`, getClientIp(req));
  await notifyNewRegistration(
    "New Registration Request",
    `${user.username} submitted a registration request — pending approval`
  );

  if (isSmtpConfigured()) {
    const submittedAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt as string);
    db.select({ email: usersTable.email, fullName: usersTable.fullName, username: usersTable.username })
      .from(usersTable)
      .where(eq(usersTable.role, "admin"))
      .then((admins) => {
        for (const admin of admins) {
          sendNewRegistrationAdminEmail({
            adminEmail: admin.email,
            adminName: admin.fullName ?? admin.username,
            applicantUsername: user.username,
            applicantFullName: user.fullName ?? null,
            applicantEmail: user.email,
            submittedAt,
          }).catch((err) =>
            logger.warn({ err, adminEmail: admin.email }, "Failed to send admin registration alert email")
          );
        }
      })
      .catch((err) => logger.warn({ err }, "Failed to fetch admins for registration alert email"));
  }

  res.status(201).json({ pending: true, message: "Registration submitted. Awaiting admin approval." });
}));

export default router;
