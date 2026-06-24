import { Router, type IRouter } from "express";
import { db, pushSubscriptionsTable, usersTable, broadcastLogsTable } from "@workspace/db";
import { eq, isNotNull, count, desc } from "drizzle-orm";
import { requireRole } from "../lib/auth";
import { sendPushToAll } from "../lib/push";
import { sendBroadcastEmail, isSmtpConfigured } from "../lib/mailer";
import { createSystemNotification } from "../services/notificationService";
import { z } from "zod/v4";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// GET /api/admin/broadcast/stats
router.get("/admin/broadcast/stats", requireRole("admin"), async (_req, res): Promise<void> => {
  try {
    const [pushRow] = await db.select({ total: count() }).from(pushSubscriptionsTable);
    const [emailRow] = await db.select({ total: count() }).from(usersTable).where(isNotNull(usersTable.email));
    const [activeRow] = await db.select({ total: count() }).from(usersTable).where(eq(usersTable.isActive, true));

    res.json({
      pushSubscribers: Number(pushRow?.total ?? 0),
      usersWithEmail: Number(emailRow?.total ?? 0),
      activeUsers: Number(activeRow?.total ?? 0),
      smtpConfigured: isSmtpConfigured(),
    });
  } catch (err) {
    logger.error({ err }, "broadcast stats failed");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /api/admin/broadcast/history
router.get("/admin/broadcast/history", requireRole("admin"), async (req, res): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10)));
    const offset = (page - 1) * limit;

    const [totalRow] = await db.select({ total: count() }).from(broadcastLogsTable);
    const rows = await db
      .select({
        id: broadcastLogsTable.id,
        sentBy: broadcastLogsTable.sentBy,
        channel: broadcastLogsTable.channel,
        subject: broadcastLogsTable.subject,
        body: broadcastLogsTable.body,
        recipientFilter: broadcastLogsTable.recipientFilter,
        recipientCount: broadcastLogsTable.recipientCount,
        failedCount: broadcastLogsTable.failedCount,
        createdAt: broadcastLogsTable.createdAt,
        senderUsername: usersTable.username,
        senderFullName: usersTable.fullName,
      })
      .from(broadcastLogsTable)
      .leftJoin(usersTable, eq(broadcastLogsTable.sentBy, usersTable.id))
      .orderBy(desc(broadcastLogsTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      logs: rows.map((r) => ({
        ...r,
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      })),
      total: Number(totalRow?.total ?? 0),
      page,
      limit,
    });
  } catch (err) {
    logger.error({ err }, "broadcast history failed");
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// POST /api/admin/broadcast/push
router.post("/admin/broadcast/push", requireRole("admin"), async (req: any, res): Promise<void> => {
  const parsed = z.object({
    title: z.string().min(1).max(150),
    body: z.string().min(1).max(500),
    url: z.string().optional(),
    createInAppNotification: z.boolean().optional().default(true),
  }).safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
    return;
  }

  const { title, body, url, createInAppNotification } = parsed.data;
  const adminId: number = req.session?.userId;

  try {
    const [subRow] = await db.select({ total: count() }).from(pushSubscriptionsTable);
    const subCount = Number(subRow?.total ?? 0);

    await sendPushToAll({ title, body, url: url || "/", tag: "admin-broadcast", requireInteraction: false });

    if (createInAppNotification) {
      await createSystemNotification({ title, message: body, type: "info", priority: "HIGH", link: url ?? null });
    }

    await db.insert(broadcastLogsTable).values({
      sentBy: adminId,
      channel: "push",
      subject: title,
      body,
      recipientFilter: "all",
      recipientCount: subCount,
      failedCount: 0,
    });

    logger.info({ adminId, title, subCount }, "admin broadcast push sent");
    res.json({ success: true, sent: subCount, message: `Push notification sent to ${subCount} subscriber(s)` });
  } catch (err) {
    logger.error({ err }, "broadcast push failed");
    res.status(500).json({ error: "Failed to send push notification" });
  }
});

// POST /api/admin/broadcast/email
router.post("/admin/broadcast/email", requireRole("admin"), async (req: any, res): Promise<void> => {
  const parsed = z.object({
    subject: z.string().min(1).max(200),
    body: z.string().min(1),
    recipientFilter: z.enum(["all", "active"]).optional().default("all"),
  }).safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
    return;
  }

  if (!isSmtpConfigured()) {
    res.status(503).json({ error: "SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in Secrets." });
    return;
  }

  const { subject, body, recipientFilter } = parsed.data;
  const adminId: number = req.session?.userId;

  try {
    let usersQuery;
    if (recipientFilter === "active") {
      usersQuery = db.select({ email: usersTable.email, fullName: usersTable.fullName, username: usersTable.username })
        .from(usersTable)
        .where(eq(usersTable.isActive, true));
    } else {
      usersQuery = db.select({ email: usersTable.email, fullName: usersTable.fullName, username: usersTable.username })
        .from(usersTable)
        .where(isNotNull(usersTable.email));
    }

    const users = await usersQuery;
    const withEmail = users.filter((u) => u.email && u.email.trim());

    if (withEmail.length === 0) {
      res.status(400).json({ error: "No users with registered email addresses found" });
      return;
    }

    const results = await sendBroadcastEmail({ subject, body, recipients: withEmail as any });

    await db.insert(broadcastLogsTable).values({
      sentBy: adminId,
      channel: "email",
      subject,
      body,
      recipientFilter,
      recipientCount: results.sent,
      failedCount: results.failed,
    });

    logger.info({ adminId, subject, sent: results.sent, failed: results.failed }, "admin broadcast email sent");
    res.json({
      success: true,
      sent: results.sent,
      failed: results.failed,
      message: `Email sent to ${results.sent} recipient(s)${results.failed > 0 ? `, ${results.failed} failed` : ""}`,
    });
  } catch (err: any) {
    logger.error({ err }, "broadcast email failed");
    res.status(500).json({ error: err?.message ?? "Failed to send emails" });
  }
});

export default router;
