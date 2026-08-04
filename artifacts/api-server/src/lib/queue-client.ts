/**
 * Queue client — uses BullMQ when REDIS_URL is set; falls back to direct
 * fire-and-forget when Redis is unavailable.
 */

import { Queue } from "bullmq";
import IORedis from "ioredis";
import { logger } from "./logger";
import {
  buildApprovalMailOptions,
  buildRejectionMailOptions,
  buildOtpMailOptions,
  sendApprovalEmail,
  sendRejectionEmail,
  sendOtpEmail,
} from "./mailer";
import { sendPushToUser, sendPushToAll } from "./push";

// ── Job-data types ────────────────────────────────────────────────────────────

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string }>;
}

export type NotificationJobData =
  | { kind: "send-to-user"; userId: number; payload: PushPayload }
  | { kind: "send-to-all"; payload: PushPayload };

// ── BullMQ queue (lazy init) ──────────────────────────────────────────────────

let notificationQueue: Queue | null = null;

function getQueue(): Queue | null {
  if (notificationQueue) return notificationQueue;
  const url = process.env["REDIS_URL"];
  if (!url) return null;
  try {
    const connection = new IORedis(url, { maxRetriesPerRequest: null });
    notificationQueue = new Queue("notifications", { connection });
  } catch {
    notificationQueue = null;
  }
  return notificationQueue;
}

// ── Public helpers ────────────────────────────────────────────────────────────

/**
 * Enqueue a push notification via BullMQ when Redis is available,
 * or send directly as a fire-and-forget fallback.
 */
export async function enqueueNotification(data: NotificationJobData): Promise<void> {
  const queue = getQueue();
  if (queue) {
    try {
      await queue.add("notify", data);
      return;
    } catch (err: any) {
      logger.warn({ err: err.message }, "BullMQ enqueue failed — falling back to direct send");
    }
  }
  // Direct fire-and-forget fallback
  try {
    if (data.kind === "send-to-user") {
      await sendPushToUser(data.userId, data.payload);
    } else {
      await sendPushToAll(data.payload);
    }
  } catch (err: any) {
    logger.warn({ err: err.message }, "enqueueNotification direct-send failed");
  }
}

// ── Re-export builder helpers so call sites only need one import ──────────────
export { buildApprovalMailOptions, buildRejectionMailOptions, buildOtpMailOptions };
export { sendApprovalEmail, sendRejectionEmail, sendOtpEmail };
