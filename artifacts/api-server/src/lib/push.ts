import webPush from "web-push";
import { db, pushSubscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:admin@sahucsc.in";

export const pushEnabled = !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (pushEnabled) {
  webPush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY!, VAPID_PRIVATE_KEY!);
}

export { VAPID_PUBLIC_KEY };

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string }>;
}

export async function sendPushToUser(userId: number, payload: PushPayload): Promise<void> {
  if (!pushEnabled) return;
  try {
    const subs = await db
      .select()
      .from(pushSubscriptionsTable)
      .where(eq(pushSubscriptionsTable.userId, userId));

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webPush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify(payload)
          );
        } catch (err: any) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await db
              .delete(pushSubscriptionsTable)
              .where(eq(pushSubscriptionsTable.endpoint, sub.endpoint));
          }
        }
      })
    );
  } catch (err) {
    logger.error({ err }, "sendPushToUser failed");
  }
}

export async function sendPushToAll(payload: PushPayload): Promise<void> {
  if (!pushEnabled) return;
  try {
    const subs = await db.select().from(pushSubscriptionsTable);
    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webPush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify(payload)
          );
        } catch (err: any) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await db
              .delete(pushSubscriptionsTable)
              .where(eq(pushSubscriptionsTable.endpoint, sub.endpoint));
          }
        }
      })
    );
  } catch (err) {
    logger.error({ err }, "sendPushToAll failed");
  }
}
