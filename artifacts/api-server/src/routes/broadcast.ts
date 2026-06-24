import { Router, type IRouter } from "express";
import { db, pushSubscriptionsTable, usersTable } from "@workspace/db";
import { eq, isNotNull, ne, count } from "drizzle-orm";
import { requireRole } from "../lib/auth";
import { sendPushToAll } from "../lib/push";
import { sendBroadcastEmail, isSmtpConfigured } from "../lib/mailer";
import { createSystemNotification } from "../services/notificationService";
import { z } from "zod/v4";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// GET /api/admin/broadcast/stats — subscriber counts
router.get("/admin/broadcast/stats", requireRole("admin"), async (_req, res): Promise<void> => {
  try {
    const [pushRow] = await db.select({ total: count() }).from(pushSubscriptionsTable);
    const [emailRow] = await db
      .select({ total: count() })
      .from(usersTable)
      .where(isNotNull(usersTable.email));

    const [activeRow] = await db
      .select({ total: count() })
      .from(usersTable)
      .where(eq(usersTable.isActive, true));

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

// POST /api/admin/broadcast/push — send push notification to all subscribers
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

  try {
    await sendPushToAll({
      title,
      body,
      url: url || "/",
      tag: "admin-broadcast",
      requireInteraction: false,
    });

    if (createInAppNotification) {
      await createSystemNotification({
        title,
        message: body,
        type: "info",
        priority: "HIGH",
        link: url ?? null,
      });
    }

    logger.info({ adminId: req.session?.userId, title }, "admin broadcast push sent");
    res.json({ success: true, message: "Push notification sent to all subscribers" });
  } catch (err) {
    logger.error({ err }, "broadcast push failed");
    res.status(500).json({ error: "Failed to send push notification" });
  }
});

// POST /api/admin/broadcast/email — send custom email to all registered users
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

  try {
    let query = db.select({ email: usersTable.email, fullName: usersTable.fullName, username: usersTable.username })
      .from(usersTable)
      .where(isNotNull(usersTable.email));

    if (recipientFilter === "active") {
      query = db
        .select({ email: usersTable.email, fullName: usersTable.fullName, username: usersTable.username })
        .from(usersTable)
        .where(eq(usersTable.isActive, true)) as typeof query;
    }

    const users = await query;
    const withEmail = users.filter((u) => u.email && u.email.trim());

    if (withEmail.length === 0) {
      res.status(400).json({ error: "No users with registered email addresses found" });
      return;
    }

    const results = await sendBroadcastEmail({ subject, body, recipients: withEmail as any });

    logger.info({ adminId: req.session?.userId, subject, sent: results.sent, failed: results.failed }, "admin broadcast email sent");

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
