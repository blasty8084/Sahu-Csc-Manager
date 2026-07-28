/**
 * Queue client — Redis/BullMQ removed. Notifications are sent directly
 * (fire-and-forget). Email sending is a no-op.
 */

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

export interface EmailJobData {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
}

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
 * Email sending is disabled (SMTP removed). This is a no-op.
 */
export async function enqueueEmail(_data: EmailJobData): Promise<void> {
  // SMTP removed — emails are not sent
}

// ── Re-export builder helpers so call sites only need one import ──────────────
export { buildApprovalMailOptions, buildRejectionMailOptions, buildOtpMailOptions };
export { sendApprovalEmail, sendRejectionEmail, sendOtpEmail };
