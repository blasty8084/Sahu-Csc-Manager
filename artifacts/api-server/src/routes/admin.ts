import { Router, type IRouter } from "express";
import { db, usersTable, emailOtpsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireRole, getClientIp, auditLog } from "../lib/auth";
import crypto, { randomUUID } from "node:crypto";
import { sendAdminResetLinkEmail, isSmtpConfigured } from "../lib/mailer";
import { asyncHandler } from "../lib/async-handler";
import { getUsersOverview, getRecentAuditLogs, getDbStats } from "../services/adminStatsService";
import { getUserLedger } from "../services/adminUserService";

const router: IRouter = Router();

router.get("/admin/users-overview", requireRole("admin"), asyncHandler(async (_req, res) => {
  res.json(await getUsersOverview());
}));

router.get("/admin/users-overview/:userId/ledger", requireRole("admin"), asyncHandler(async (req, res) => {
  const rawId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(rawId, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  const page = parseInt((req.query.page as string) ?? "1", 10);
  const limit = parseInt((req.query.limit as string) ?? "20", 10);
  const result = await getUserLedger(userId, page, limit);
  if (!result) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ ...result, page, limit });
}));

// ─── POST /admin/users/:id/generate-reset-link ────────────────────────────────
// Admin-only: creates a pre-verified password reset token without sending email.
// Returns { resetToken, expiresAt, username } — frontend builds the full URL.
router.post("/admin/users/:id/generate-reset-link", requireRole("admin"), asyncHandler(async (req, res) => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = parseInt(rawId, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }

  const [user] = await db
    .select({ id: usersTable.id, username: usersTable.username, email: usersTable.email, isActive: usersTable.isActive })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (!user.isActive) {
    res.status(400).json({ error: "Cannot generate a reset link for an inactive account." }); return;
  }
  if (!user.email) {
    res.status(400).json({ error: "This user has no email address on file." }); return;
  }

  // Generate a dummy OTP hash (never sent anywhere) + a pre-verified UUID token
  const otpHash = crypto.createHash("sha256").update(randomUUID()).digest("hex");
  const verifiedToken = randomUUID();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Insert with usedAt set immediately so the OTP path can never be used independently
  const [inserted] = await db
    .insert(emailOtpsTable)
    .values({ email: user.email, purpose: "password_reset", otpHash, expiresAt, usedAt: new Date(), ipAddress: getClientIp(req) })
    .returning({ id: emailOtpsTable.id });

  // Attach the pre-verified token — this is what the reset-password endpoint validates
  await db.update(emailOtpsTable).set({ verifiedToken }).where(eq(emailOtpsTable.id, inserted.id));

  await auditLog(
    req.session.userId ?? null,
    "password.admin_reset_link",
    `Admin generated reset link for @${user.username} (userId=${user.id})`,
    getClientIp(req)
  );

  res.json({ resetToken: verifiedToken, expiresAt: expiresAt.toISOString(), username: user.username });
}));

// ─── POST /admin/users/:id/email-reset-link ───────────────────────────────────
// Admin-only: sends the already-generated reset link to the user's email address.
// Body: { resetToken: string, expiresAt: string (ISO), resetUrl: string }
router.post("/admin/users/:id/email-reset-link", requireRole("admin"), asyncHandler(async (req, res) => {
  if (!isSmtpConfigured()) {
    res.status(503).json({ error: "Email is not configured on this server. Copy the link and share it manually." });
    return;
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = parseInt(rawId, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }

  const { resetToken, expiresAt: expiresAtStr, resetUrl } = req.body as {
    resetToken?: string;
    expiresAt?: string;
    resetUrl?: string;
  };

  if (!resetToken || !expiresAtStr || !resetUrl) {
    res.status(400).json({ error: "resetToken, expiresAt, and resetUrl are required." });
    return;
  }

  const expiresAt = new Date(expiresAtStr);
  if (isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
    res.status(400).json({ error: "Reset link has already expired. Generate a new one." });
    return;
  }

  const [user] = await db
    .select({ id: usersTable.id, username: usersTable.username, email: usersTable.email, fullName: usersTable.fullName, isActive: usersTable.isActive })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (!user.email) { res.status(400).json({ error: "This user has no email address on file." }); return; }

  await sendAdminResetLinkEmail({
    to: user.email,
    displayName: user.fullName ?? user.username,
    username: user.username,
    resetUrl,
    expiresAt,
  });

  await auditLog(
    req.session.userId ?? null,
    "password.admin_reset_link_emailed",
    `Admin emailed reset link to @${user.username} (userId=${user.id}, to=${user.email})`,
    getClientIp(req)
  );

  res.json({ ok: true, sentTo: user.email });
}));

router.get("/admin/audit-recent", requireRole("admin"), asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit ?? "25"), 10), 100);
  res.json(await getRecentAuditLogs(limit));
}));

router.get("/admin/db-stats", requireRole("admin"), asyncHandler(async (_req, res) => {
  res.json(await getDbStats());
}));

export default router;
