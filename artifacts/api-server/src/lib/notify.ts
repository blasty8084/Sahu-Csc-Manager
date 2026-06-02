import { db, notificationsTable } from "@workspace/db";
import { logger } from "./logger";

export async function createNotification(
  title: string,
  message: string,
  type: "info" | "warning" | "success" | "error" = "info",
  userId?: number
): Promise<void> {
  try {
    await db.insert(notificationsTable).values({ title, message, type, userId: userId ?? null, isRead: false });
  } catch (err) {
    logger.error({ err }, "Failed to create notification");
  }
}
