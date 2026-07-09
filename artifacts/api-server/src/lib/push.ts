import webPush from "web-push";
import { db, pushSubscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

// Mutable exports — set by initPush() after ensureVapidKeys() completes.
// Routes that import these will always see the live values (ESM live bindings).
export let pushEnabled = false;
export let VAPID_PUBLIC_KEY: string | undefined;

/**
 * Called once from index.ts after ensureVapidKeys() has populated
 * process.env.VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY.
 */
export function initPush(): void {
  const pubKey = process.env.VAPID_PUBLIC_KEY;
  const privKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL || "mailto:sahuuttam690@gmail.com";

  // web-push requires unpadded URL-safe base64 — strip any trailing = or whitespace
  // that may have been introduced when the secret was copy-pasted by the user.
  const cleanPub  = pubKey?.trim().replace(/=+$/, "");
  const cleanPriv = privKey?.trim().replace(/=+$/, "");

  if (cleanPub && cleanPriv) {
    webPush.setVapidDetails(email, cleanPub, cleanPriv);
    pushEnabled = true;
    VAPID_PUBLIC_KEY = pubKey;
    logger.info("Push notifications enabled");
  }
}

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
