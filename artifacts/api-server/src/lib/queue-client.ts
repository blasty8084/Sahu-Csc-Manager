/**
 * Queue client — Redis/BullMQ removed. Notifications are sent directly
 * (fire-and-forget). Emails are sent directly via nodemailer when SMTP is configured.
 */

import { logger } from "./logger";
import {
  buildApprovalMailOptions,
  buildRejectionMailOptions,
  buildOtpMailOptions,
  sendApprovalEmail,
  sendRejectionEmail,
  sendOtpEmail,
  sendBroadcastEmail,
  type EmailJobData,
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

export type { EmailJobData };

// ── Public helpers ────────────────────────────────────────────────────────────

/**
 * Send a push notification directly (fire-and-forget).
 */
export async function enqueueNotification(data: NotificationJobData): Promise<void> {
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

/**
 * Send an email directly via nodemailer (fire-and-forget).
 * No-op if SMTP is not configured.
 */
export async function enqueueEmail(data: EmailJobData): Promise<void> {
  try {
    await sendBroadcastEmail(data.to, data.subject, data.html, data.text);
  } catch (err: any) {
    logger.warn({ err: err.message, to: data.to }, "enqueueEmail send failed");
  }
}

// ── Re-export builder helpers so call sites only need one import ──────────────
export { buildApprovalMailOptions, buildRejectionMailOptions, buildOtpMailOptions };
export { sendApprovalEmail, sendRejectionEmail, sendOtpEmail };
