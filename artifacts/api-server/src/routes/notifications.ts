import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, or, isNull, desc } from "drizzle-orm";
import {
  ListNotificationsQueryParams,
  MarkNotificationReadParams,
  DeleteNotificationParams,
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

  const conditions: any[] = [or(eq(notificationsTable.userId, userId), isNull(notificationsTable.userId))];
  if (unreadOnly) conditions.push(eq(notificationsTable.isRead, false));

  const items = await db
    .select()
    .from(notificationsTable)
    .where(conditions.length === 1 ? conditions[0] : conditions.reduce((a, b) => ({ sql: `${a.sql} AND ${b.sql}` })))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  res.json(items.map(fmt));
});

router.post("/notifications/read-all", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  await db.update(notificationsTable).set({ isRead: true }).where(
    or(eq(notificationsTable.userId, userId), isNull(notificationsTable.userId))
  );
  res.json({ message: "All marked as read" });
});

router.patch("/notifications/:id/read", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [existing] = await db.select().from(notificationsTable).where(eq(notificationsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  const [updated] = await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, id)).returning();
  res.json(fmt(updated));
});

router.delete("/notifications/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [existing] = await db.select().from(notificationsTable).where(eq(notificationsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  await db.delete(notificationsTable).where(eq(notificationsTable.id, id));
  res.sendStatus(204);
});

export default router;
