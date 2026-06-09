import { db, notificationsTable, usersTable } from "@workspace/db";
import { logger } from "./logger";
import { sendPushToUser, sendPushToAll } from "./push";
import { eq } from "drizzle-orm";

export async function createNotification(
  title: string,
  message: string,
  type: "info" | "warning" | "success" | "error" = "info",
  userId?: number
): Promise<void> {
  try {
    await db.insert(notificationsTable).values({ title, message, type, userId: userId ?? null, isRead: false });

    // Fire push notification to the target user (or all users if broadcast)
    const payload = {
      title,
      body: message,
      url: "/notifications",
      tag: `sahu-notif-${type}`,
    };

    if (userId !== undefined) {
      sendPushToUser(userId, payload).catch(() => {});
    } else {
      sendPushToAll(payload).catch(() => {});
    }
  } catch (err) {
    logger.error({ err }, "Failed to create notification");
  }
}
