import { Worker } from "bullmq";
import webPush from "web-push";
import { db, pushSubscriptionsTable, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { connection } from "../connection";
import { logger } from "../logger";
import type { NotificationJobData } from "../queues/types";

let vapidInitialised = false;

async function ensureVapidReady(): Promise<boolean> {
  if (vapidInitialised) return true;

  const pubRow = await db
    .select({ value: settingsTable.value })
    .from(settingsTable)
    .where(eq(settingsTable.key, "VAPID_PUBLIC_KEY"));
  const privRow = await db
    .select({ value: settingsTable.value })
    .from(settingsTable)
    .where(eq(settingsTable.key, "VAPID_PRIVATE_KEY"));

  const pub = pubRow[0]?.value;
  const priv = privRow[0]?.value;
  const email = process.env.VAPID_EMAIL ?? "mailto:sahuuttam690@gmail.com";

  if (!pub || !priv) {
    logger.warn("VAPID keys not found in settings table — push notifications disabled in worker");
    return false;
  }

  webPush.setVapidDetails(email, pub.trim().replace(/=+$/, ""), priv.trim().replace(/=+$/, ""));
  vapidInitialised = true;
  logger.info("VAPID keys loaded from DB — push notifications ready");
  return true;
}

async function sendToUser(userId: number, payload: NotificationJobData["payload"]): Promise<void> {
  const subs = await db
    .select()
    .from(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.userId, userId));

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        );
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await db
            .delete(pushSubscriptionsTable)
            .where(eq(pushSubscriptionsTable.endpoint, sub.endpoint));
        }
      }
    }),
  );
}

async function sendToAll(payload: NotificationJobData["payload"]): Promise<void> {
  const subs = await db.select().from(pushSubscriptionsTable);
  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        );
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await db
            .delete(pushSubscriptionsTable)
            .where(eq(pushSubscriptionsTable.endpoint, sub.endpoint));
        }
      }
    }),
  );
}

export const notificationWorker = new Worker<NotificationJobData>(
  "notifications",
  async (job) => {
    const ready = await ensureVapidReady();
    if (!ready) return; // No VAPID keys → skip silently

    const data = job.data;
    if (data.kind === "send-to-user") {
      await sendToUser(data.userId, data.payload);
      logger.debug({ userId: data.userId, tag: data.payload.tag }, "Push sent to user");
    } else {
      await sendToAll(data.payload);
      logger.debug({ tag: data.payload.tag }, "Push sent to all subscribers");
    }
  },
  {
    connection,
    concurrency: 5,
  },
);

notificationWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err: err.message }, "Notification job failed");
});

notificationWorker.on("completed", (job) => {
  logger.debug({ jobId: job.id }, "Notification job completed");
});
