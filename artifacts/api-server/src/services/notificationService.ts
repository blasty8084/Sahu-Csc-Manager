import { db, notificationsTable, userNotificationPreferencesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { sendPushToUser, sendPushToAll } from "../lib/push";

export type NotificationType = "info" | "warning" | "success" | "error" | "security" | "system" | "business";
export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface CreateNotificationPayload {
  userId?: number;
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  link?: string;
  meta?: Record<string, unknown>;
  /** Skip the push delivery step (e.g. when the caller already sent push separately). */
  skipPush?: boolean;
}

export interface SystemNotificationPayload {
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  link?: string;
  meta?: Record<string, unknown>;
  userIds?: number[];
}

type PrefKey = "securityAlerts" | "businessAlerts" | "systemAlerts" | "infoAlerts";

function getCategoryFlag(type: NotificationType): PrefKey {
  return PREF_MAP[type] ?? "infoAlerts";
}

const PREF_MAP: Record<NotificationType, "securityAlerts" | "businessAlerts" | "systemAlerts" | "infoAlerts"> = {
  security: "securityAlerts",
  business: "businessAlerts",
  system: "systemAlerts",
  info: "infoAlerts",
  warning: "infoAlerts",
  success: "infoAlerts",
  error: "securityAlerts",
};

async function getPrefs(userId: number) {
  try {
    const [prefs] = await db
      .select()
      .from(userNotificationPreferencesTable)
      .where(eq(userNotificationPreferencesTable.userId, userId));
    return prefs ?? null;
  } catch {
    return null;
  }
}

export async function createNotification(payload: CreateNotificationPayload): Promise<void> {
  const {
    userId,
    title,
    message,
    type = "info",
    priority = "MEDIUM",
    link,
    meta,
    skipPush = false,
  } = payload;

  try {
    if (userId !== undefined) {
      const prefs = await getPrefs(userId);
      if (prefs) {
        if (!prefs.enabled && priority !== "CRITICAL") return;
        const categoryKey = getCategoryFlag(type);
        if (!prefs[categoryKey as keyof typeof prefs] && priority !== "CRITICAL") return;
      }
    }

    await db
      .insert(notificationsTable)
      .values({ title, message, type, priority, userId: userId ?? null, isRead: false, link: link ?? null, meta: meta ?? null });

    if (!skipPush) {
      const pushPayload = {
        title,
        body: message,
        url: link ?? "/notifications",
        tag: `sahu-notif-${type}-${priority}`,
      };

      if (userId !== undefined) {
        const prefs = await getPrefs(userId);
        if (prefs?.pushEnabled) {
          sendPushToUser(userId, pushPayload).catch(() => {});
        }
      } else {
        sendPushToAll(pushPayload).catch(() => {});
      }
    }
  } catch (err) {
    logger.error({ err }, "Failed to create notification");
  }
}

export async function createSystemNotification(
  payload: SystemNotificationPayload,
  options: { skipPush?: boolean } = {},
): Promise<number> {
  const { userIds, ...rest } = payload;
  const { skipPush = false } = options;

  if (userIds && userIds.length > 0) {
    await Promise.all(userIds.map((uid) => createNotification({ ...rest, userId: uid, skipPush })));
    return userIds.length;
  }

  // Broadcast to all active users
  const { usersTable: ut } = await import("@workspace/db");
  const { and: _and, eq: _eq } = await import("drizzle-orm");
  const users = await db
    .select({ id: ut.id })
    .from(ut)
    .where(_and(_eq(ut.isActive, true), _eq(ut.status, "ACTIVE")));
  await Promise.all(users.map((u) => createNotification({ ...rest, userId: u.id, skipPush })));
  return users.length;
}
