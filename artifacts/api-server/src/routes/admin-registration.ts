import { Router, type IRouter } from "express";
import { db, usersTable, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { requireRole, auditLog, getClientIp } from "../lib/auth";
import { cacheGet, cacheSet, cacheDel } from "../lib/registration-cache";
import { createNotification } from "../lib/notify";
import { isSmtpConfigured } from "../lib/mailer";
import { enqueueNotification, enqueueEmail, buildApprovalMailOptions, buildRejectionMailOptions } from "../lib/queue-client";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const REG_KEY = "registration_open";
const PENDING_KEY = "admin:pending_approvals";
const REG_TTL = 60_000;
const PENDING_TTL = 30_000;

async function getRegistrationOpen(): Promise<boolean> {
  const cached = cacheGet(REG_KEY);
  if (cached !== null) return cached === "true";
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, REG_KEY));
  if (!row) {
    await db.insert(settingsTable).values({ key: REG_KEY, value: "false" }).onConflictDoNothing();
    cacheSet(REG_KEY, "false", REG_TTL);
    return false;
  }
  cacheSet(REG_KEY, row.value, REG_TTL);
  return row.value === "true";
}

async function getPendingCount(): Promise<number> {
  const cached = cacheGet(PENDING_KEY);
  if (cached !== null) return parseInt(cached, 10);
  const rows = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.status, "PENDING"));
  const count = rows.length;
  cacheSet(PENDING_KEY, String(count), PENDING_TTL);
  return count;
}

function invalidatePendingCache() {
  cacheDel(PENDING_KEY);
}

function fmtUser(u: any) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    mobile: u.mobile ?? null,
    fullName: u.fullName ?? null,
    role: u.role,
    status: u.status,
    rejectionReason: u.rejectionReason ?? null,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
  };
}

// ─── GET /api/settings/registration-status (public) ─────────────────────────
router.get("/settings/registration-status", async (_req, res): Promise<void> => {
  const open = await getRegistrationOpen();
  res.json({ open });
});

// ─── PATCH /api/admin/settings/registration (admin only) ────────────────────
router.patch("/admin/settings/registration", requireRole("admin"), async (req, res): Promise<void> => {
  const parsed = z.object({ open: z.boolean() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Body must be { open: boolean }" });
    return;
  }
  const { open } = parsed.data;
  const value = open ? "true" : "false";

  const [existing] = await db.select().from(settingsTable).where(eq(settingsTable.key, REG_KEY));
  if (existing) {
    await db.update(settingsTable).set({ value }).where(eq(settingsTable.key, REG_KEY));
  } else {
    await db.insert(settingsTable).values({ key: REG_KEY, value });
  }

  cacheDel(REG_KEY);

  const action = open ? "REGISTRATION_ENABLED" : "REGISTRATION_DISABLED";
  await auditLog(req.session.userId!, action, `Registration ${open ? "enabled" : "disabled"} by admin`, getClientIp(req));
  await createNotification(
    "Registration Setting Changed",
    `Public registration has been ${open ? "enabled" : "disabled"} by admin.`,
    "info",
    req.session.userId!
  );

  res.json({ success: true, open });
});

// ─── GET /api/admin/users/pending-count ─────────────────────────────────────
router.get("/admin/users/pending-count", requireRole("admin"), async (_req, res): Promise<void> => {
  const count = await getPendingCount();
  res.json({ count });
});

// ─── GET /api/admin/users/pending ───────────────────────────────────────────
router.get("/admin/users/pending", requireRole("admin"), async (req, res): Promise<void> => {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "50"), 10)));
  const offset = (page - 1) * limit;

  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.status, "PENDING"))
    .orderBy(usersTable.createdAt)
    .limit(limit)
    .offset(offset);

  res.json(rows.map(fmtUser));
});

// ─── PATCH /api/admin/users/:id/approve ─────────────────────────────────────
router.patch("/admin/users/:id/approve", requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (user.status !== "PENDING") {
    res.status(400).json({ error: `User is not pending (current status: ${user.status})` });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ status: "ACTIVE", isActive: true, rejectionReason: null })
    .where(eq(usersTable.id, id))
    .returning();

  invalidatePendingCache();
  await auditLog(req.session.userId!, "APPROVED", `Approved user: ${user.username}`, getClientIp(req));
  await createNotification("Account Approved", `Your account has been approved. You can now log in.`, "success", id);

  if (user.email && isSmtpConfigured()) {
    enqueueEmail(buildApprovalMailOptions(user.email, user.fullName ?? user.username))
      .catch((err) => logger.warn({ err, userId: id }, "Failed to enqueue approval email"));
  }

  res.json({ success: true, message: "User approved", user: fmtUser(updated) });
});

// ─── PATCH /api/admin/users/:id/reject ──────────────────────────────────────
router.patch("/admin/users/:id/reject", requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const reason = typeof req.body.reason === "string" ? req.body.reason.trim() : null;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (user.status !== "PENDING") {
    res.status(400).json({ error: `User is not pending (current status: ${user.status})` });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ status: "DELETED", isActive: false, rejectionReason: reason ?? null })
    .where(eq(usersTable.id, id))
    .returning();

  invalidatePendingCache();
  await auditLog(req.session.userId!, "REJECTED", `Rejected user: ${user.username}${reason ? ` — reason: ${reason}` : ""}`, getClientIp(req));

  const notifyMsg = reason
    ? `Your registration has been declined. Reason: ${reason}`
    : "Your registration has been declined. Please contact administrator for details.";
  await createNotification("Registration Declined", notifyMsg, "warning", id);

  if (user.email && isSmtpConfigured()) {
    enqueueEmail(buildRejectionMailOptions(user.email, user.fullName ?? user.username, reason))
      .catch((err) => logger.warn({ err, userId: id }, "Failed to enqueue rejection email"));
  }

  res.json({ success: true, message: "User rejected", user: fmtUser(updated) });
});

export { getRegistrationOpen, getPendingCount, invalidatePendingCache };
export default router;
