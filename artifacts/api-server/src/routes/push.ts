import { Router } from "express";
import { db, pushSubscriptionsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import { eq, and } from "drizzle-orm";
import { pushEnabled, VAPID_PUBLIC_KEY } from "../lib/push";

const router = Router();

// Public VAPID key — needed by frontend to subscribe
router.get("/push/vapid-public-key", (req, res): void => {
  if (!pushEnabled || !VAPID_PUBLIC_KEY) {
    res.status(503).json({ error: "Push notifications not configured" });
    return;
  }
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// Subscribe this device
router.post("/push/subscribe", requireAuth, async (req: any, res): Promise<void> => {
  const { endpoint, p256dh, auth } = req.body ?? {};
  if (!endpoint || !p256dh || !auth) {
    res.status(400).json({ error: "endpoint, p256dh and auth are required" });
    return;
  }
  try {
    await db
      .insert(pushSubscriptionsTable)
      .values({
        userId: req.session.userId!,
        endpoint,
        p256dh,
        auth,
        userAgent: req.headers["user-agent"] || null,
      })
      .onConflictDoUpdate({
        target: pushSubscriptionsTable.endpoint,
        set: { p256dh, auth, userId: req.session.userId! },
      });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

// Unsubscribe this device
router.delete("/push/unsubscribe", requireAuth, async (req: any, res): Promise<void> => {
  const { endpoint } = req.body ?? {};
  if (!endpoint) {
    res.status(400).json({ error: "endpoint required" });
    return;
  }
  const userId = req.session.userId!;
  try {
    await db
      .delete(pushSubscriptionsTable)
      .where(
        and(
          eq(pushSubscriptionsTable.endpoint, endpoint),
          eq(pushSubscriptionsTable.userId, userId)
        )
      );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to remove subscription" });
  }
});

// List current user's subscriptions (device count)
router.get("/push/subscriptions", requireAuth, async (req: any, res) => {
  try {
    const subs = await db
      .select({ id: pushSubscriptionsTable.id, userAgent: pushSubscriptionsTable.userAgent, createdAt: pushSubscriptionsTable.createdAt })
      .from(pushSubscriptionsTable)
      .where(eq(pushSubscriptionsTable.userId, req.session.userId!));
    res.json({ subscriptions: subs, enabled: pushEnabled });
  } catch {
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

export default router;
