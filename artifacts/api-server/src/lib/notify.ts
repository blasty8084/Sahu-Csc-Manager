import { createNotification as _createNotification } from "../services/notificationService";
import type { NotificationType, NotificationPriority } from "../services/notificationService";

export { createNotification as _svcCreateNotification } from "../services/notificationService";

export async function createNotification(
  title: string,
  message: string,
  type: NotificationType = "info",
  userId?: number,
  opts?: { priority?: NotificationPriority; link?: string; meta?: Record<string, unknown> }
): Promise<void> {
  await _createNotification({
    title,
    message,
    type,
    priority: opts?.priority ?? "MEDIUM",
    userId,
    link: opts?.link,
    meta: opts?.meta,
  });
}
