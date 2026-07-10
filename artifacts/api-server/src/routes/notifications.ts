import { Router, type IRouter } from "express";
import { db, notificationsTable, userNotificationPreferencesTable, usersTable } from "@workspace/db";
import { eq, or, isNull, and, desc, ilike, count, inArray } from "drizzle-orm";
import { requireAuth, requireRole, getClientIp } from "../lib/auth";
import { createSystemNotification } from "../services/notificationService";
import { z } from "zod/v4";

const router: IRouter = Router();

type NotifRow = typeof notificationsTable.$inferSelect;

function fmt(n: NotifRow) {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    priority: n.priority,
    isRead: n.isRead,
    readAt: n.readAt instanceof Date ? n.readAt.toISOString() : n.readAt ?? null,
    link: n.link ?? null,
    meta: n.meta ?? null,
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
  };
}

function userScope(userId: number) {
  return or(eq(notificationsTable.userId, userId), isNull(notificationsTable.userId));
}

// GET /notifications — paginated, filterable
router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10)));
  const offset = (page - 1) * limit;
  const typeFilter = req.query.type as string | undefined;
  const priorityFilter = req.query.priority as string | undefined;
  const isReadFilter = req.query.is_read as string | undefined;
  const search = req.query.search as string | undefined;
  const tab = req.query.tab as string | undefined;

  let where: any = userScope(userId);

  if (tab === "unread") {
    where = and(where, eq(notificationsTable.isRead, false));
  } else if (tab && ["security", "business", "system", "info", "success", "warning", "error"].includes(tab)) {
    where = and(where, eq(notificationsTable.type, tab));
  }

  if (typeFilter) where = and(where, eq(notificationsTable.type, typeFilter));
  if (priorityFilter) where = and(where, eq(notificationsTable.priority, priorityFilter));
  if (isReadFilter === "true") where = and(where, eq(notificationsTable.isRead, true));
  if (isReadFilter === "false") where = and(where, eq(notificationsTable.isRead, false));
  if (search) where = and(where, or(ilike(notificationsTable.title, `%${search}%`), ilike(notificationsTable.message, `%${search}%`)));

  const [totalRow] = await db.select({ total: count() }).from(notificationsTable).where(where);
  const items = await db
    .select()
    .from(notificationsTable)
    .where(where)
    .orderBy(desc(notificationsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({
    notifications: items.map(fmt),
    total: Number(totalRow?.total ?? 0),
    page,
    limit,
    unreadCount: 0,
  });
});

// GET /notifications/unread-count
router.get("/notifications/unread-count", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const [row] = await db
    .select({ total: count() })
    .from(notificationsTable)
    .where(and(userScope(userId), eq(notificationsTable.isRead, false)));
  res.json({ count: Number(row?.total ?? 0) });
});

// POST /notifications/read-all
router.post("/notifications/read-all", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const result = await db
    .update(notificationsTable)
    .set({ isRead: true, readAt: new Date() })
    .where(and(userScope(userId), eq(notificationsTable.isRead, false)))
    .returning({ id: notificationsTable.id });
  res.json({ success: true, updated: result.length });
});

// PATCH /notifications/:id/read
router.patch("/notifications/:id/read", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const userId = req.session.userId!;

  const [existing] = await db.select().from(notificationsTable).where(eq(notificationsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (existing.userId !== null && existing.userId !== userId) { res.status(403).json({ error: "Forbidden" }); return; }

  const [updated] = await db
    .update(notificationsTable)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notificationsTable.id, id))
    .returning();
  res.json(fmt(updated));
});

// DELETE /notifications/:id
router.delete("/notifications/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const userId = req.session.userId!;

  const [existing] = await db.select().from(notificationsTable).where(eq(notificationsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (existing.userId !== null && existing.userId !== userId) { res.status(403).json({ error: "Forbidden" }); return; }

  await db.delete(notificationsTable).where(eq(notificationsTable.id, id));
  res.sendStatus(204);
});

// DELETE /notifications/bulk
router.delete("/notifications/bulk", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const body = z.object({
    filter: z.enum(["read", "all"]).optional(),
    ids: z.array(z.number()).optional(),
  }).safeParse(req.body);

  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  let deleted = 0;
  if (body.data.ids && body.data.ids.length > 0) {
    // Single scoped DELETE instead of one SELECT + one DELETE per id. The
    // ownership check (broadcast rows with userId=null, or rows owned by this
    // user) is folded directly into the WHERE clause via userScope().
    const result = await db
      .delete(notificationsTable)
      .where(and(inArray(notificationsTable.id, body.data.ids), userScope(userId)))
      .returning({ id: notificationsTable.id });
    deleted = result.length;
  } else if (body.data.filter === "read") {
    const result = await db.delete(notificationsTable)
      .where(and(userScope(userId), eq(notificationsTable.isRead, true)))
      .returning({ id: notificationsTable.id });
    deleted = result.length;
  } else if (body.data.filter === "all") {
    const result = await db.delete(notificationsTable)
      .where(userScope(userId))
      .returning({ id: notificationsTable.id });
    deleted = result.length;
  }

  res.json({ success: true, deleted });
});

// GET /notifications/preferences
router.get("/notifications/preferences", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  let [prefs] = await db.select().from(userNotificationPreferencesTable).where(eq(userNotificationPreferencesTable.userId, userId));
  if (!prefs) {
    const [created] = await db.insert(userNotificationPreferencesTable).values({ userId }).returning();
    prefs = created;
  }
  res.json(prefs);
});

// PATCH /notifications/preferences
router.patch("/notifications/preferences", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const allowed = z.object({
    enabled: z.boolean().optional(),
    securityAlerts: z.boolean().optional(),
    businessAlerts: z.boolean().optional(),
    systemAlerts: z.boolean().optional(),
    infoAlerts: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
  }).safeParse(req.body);

  if (!allowed.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const [existing] = await db.select({ id: userNotificationPreferencesTable.id }).from(userNotificationPreferencesTable).where(eq(userNotificationPreferencesTable.userId, userId));

  if (existing) {
    const [updated] = await db.update(userNotificationPreferencesTable).set({ ...allowed.data, updatedAt: new Date() }).where(eq(userNotificationPreferencesTable.userId, userId)).returning();
    res.json(updated);
  } else {
    const [created] = await db.insert(userNotificationPreferencesTable).values({ userId, ...allowed.data }).returning();
    res.json(created);
  }
});

// POST /admin/notifications/broadcast
router.post("/admin/notifications/broadcast", requireRole("admin"), async (req, res): Promise<void> => {
  const body = z.object({
    title: z.string().min(1).max(150),
    message: z.string().min(1),
    type: z.string().optional(),
    priority: z.string().optional(),
    link: z.string().optional(),
    userIds: z.array(z.number()).optional(),
  }).safeParse(req.body);

  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const { userIds, ...rest } = body.data;
  const sent = await createSystemNotification({
    ...rest,
    type: (rest.type as any) ?? "system",
    priority: (rest.priority as any) ?? "MEDIUM",
    userIds,
  });
  res.json({ success: true, sent });
});

export default router;
