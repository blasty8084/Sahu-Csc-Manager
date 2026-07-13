import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, isNotNull } from "drizzle-orm";
import { requireRole, auditLog, getClientIp } from "../lib/auth";
import { createNotification } from "../lib/notify";
import { sendApprovalEmail, isSmtpConfigured } from "../lib/mailer";
import { sendPushToUser } from "../lib/push";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function fmtUser(u: any) {
  return {
    id: u.id, username: u.username, email: u.email,
    mobile: u.mobile ?? null, fullName: u.fullName ?? null,
    role: u.role, status: u.status,
    rejectionReason: u.rejectionReason ?? null,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
  };
}

// ── GET /admin/users/appeals ──────────────────────────────────────────────────
router.get("/admin/users/appeals", requireRole("admin"), async (_req, res): Promise<void> => {
  const rows = await db.select().from(usersTable).where(isNotNull(usersTable.appealSubmittedAt)).orderBy(usersTable.appealSubmittedAt).limit(500);
  res.json(rows.map((u) => ({
    ...fmtUser(u),
    appealSubmittedAt: u.appealSubmittedAt instanceof Date ? u.appealSubmittedAt.toISOString() : u.appealSubmittedAt,
  })));
});

// ── PATCH /admin/users/:id/re-approve ────────────────────────────────────────
router.patch("/admin/users/:id/re-approve", requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (user.status !== "DELETED") {
    res.status(400).json({ error: `User is not in a declined state (current status: ${user.status})` }); return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ status: "ACTIVE", isActive: true, rejectionReason: null, appealSubmittedAt: null, appealDismissedAt: null })
    .where(eq(usersTable.id, id))
    .returning();

  await auditLog(req.session.userId!, "user.appeal_approved", `Appeal approved for user: ${user.username}`, getClientIp(req));
  await createNotification("Appeal Approved", "Your appeal has been reviewed and your account has been approved. You can now log in.", "success", id);
  sendPushToUser(id, { title: "Appeal Approved ✅", body: "Your account has been approved! You can now log in to SAHU CSC.", url: "/", tag: "appeal-approved", requireInteraction: true })
    .catch((err) => logger.warn({ err, userId: id }, "Failed to send appeal approval push"));

  if (isSmtpConfigured()) {
    sendApprovalEmail(user.email, user.fullName ?? user.username).catch((err) =>
      logger.warn({ err, userId: id }, "Failed to send appeal approval email")
    );
  }

  res.json({ success: true, message: "Appeal approved", user: { ...fmtUser(updated), appealSubmittedAt: null } });
});

// ── PATCH /admin/users/:id/dismiss-appeal ─────────────────────────────────────
router.patch("/admin/users/:id/dismiss-appeal", requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  await db.update(usersTable).set({ appealSubmittedAt: null, appealDismissedAt: new Date() }).where(eq(usersTable.id, id));
  await auditLog(req.session.userId!, "user.appeal_dismissed", `Appeal dismissed for user: ${user.username}`, getClientIp(req));
  await createNotification("Appeal Not Approved", "Your appeal has been reviewed but could not be approved at this time. Please contact the administrator directly for further assistance.", "warning", id);
  sendPushToUser(id, { title: "Appeal Update", body: "Your appeal has been reviewed. Please contact the administrator directly for further assistance.", url: "/", tag: "appeal-dismissed", requireInteraction: true })
    .catch((err) => logger.warn({ err, userId: id }, "Failed to send appeal dismissed push"));

  res.json({ success: true, message: "Appeal dismissed" });
});

// ── POST /admin/users/appeals/dismiss-all ─────────────────────────────────────
router.post("/admin/users/appeals/dismiss-all", requireRole("admin"), async (req, res): Promise<void> => {
  const pending = await db
    .select({ id: usersTable.id, username: usersTable.username })
    .from(usersTable)
    .where(isNotNull(usersTable.appealSubmittedAt));

  if (pending.length === 0) { res.json({ success: true, dismissed: 0 }); return; }

  await db.update(usersTable).set({ appealSubmittedAt: null, appealDismissedAt: new Date() }).where(isNotNull(usersTable.appealSubmittedAt));

  await auditLog(req.session.userId!, "user.appeals_bulk_dismissed", `Bulk dismissed ${pending.length} appeal(s) by admin`, getClientIp(req));

  Promise.allSettled(pending.map(async (u) => {
    await createNotification("Appeal Not Approved", "Your appeal has been reviewed but could not be approved at this time. Please contact the administrator directly for further assistance.", "warning", u.id);
    sendPushToUser(u.id, { title: "Appeal Update", body: "Your appeal has been reviewed. Please contact the administrator directly for further assistance.", url: "/", tag: "appeal-dismissed", requireInteraction: true })
      .catch((err) => logger.warn({ err, userId: u.id }, "Failed to send bulk appeal push"));
  }));

  res.json({ success: true, dismissed: pending.length });
});

export default router;
