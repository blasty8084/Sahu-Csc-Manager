import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, or, isNull, and, desc } from "drizzle-orm";
import {
  ListNotificationsQueryParams,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

function fmt(n: any) {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    isRead: n.isRead,
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
  };
}

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const params = ListNotificationsQueryParams.safeParse(req.query);
  const unreadOnly = params.success ? params.data.unreadOnly : false;
  const userId = req.session.userId!;

  const userScope = or(eq(notificationsTable.userId, userId), isNull(notificationsTable.userId));
  const whereClause = unreadOnly
    ? and(userScope, eq(notificationsTable.isRead, false))
    : userScope;

  const items = await db
    .select()
    .from(notificationsTable)
    .where(whereClause)
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  res.json(items.map(fmt));
});

router.post("/notifications/read-all", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const userScope = or(eq(notificationsTable.userId, userId), isNull(notificationsTable.userId));
  await db.update(notificationsTable).set({ isRead: true }).where(userScope);
  res.json({ message: "All marked as read" });
});

router.patch("/notifications/:id/read", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const userId = req.session.userId!;
  const [existing] = await db.select().from(notificationsTable).where(eq(notificationsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  // IDOR: only allow marking own or system-wide notifications as read
  if (existing.userId !== null && existing.userId !== userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const [updated] = await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, id)).returning();
  res.json(fmt(updated));
});

router.delete("/notifications/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const userId = req.session.userId!;
  const [existing] = await db.select().from(notificationsTable).where(eq(notificationsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  // IDOR: only allow deleting own or system-wide notifications
  if (existing.userId !== null && existing.userId !== userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.delete(notificationsTable).where(eq(notificationsTable.id, id));
  res.sendStatus(204);
});

export default router;
