/**
 * Queue client — thin wrapper around BullMQ that the api-server uses to push
 * background jobs (push notifications, emails) to the worker-server.
 *
 * If REDIS_URL is not set, every enqueue* call falls back to executing the work
 * directly in-process so the api-server stays fully functional without Redis.
 *
 * Connection string: set REDIS_URL to a TCP Redis URL (e.g. rediss://... from
 * Upstash dashboard).  This is DIFFERENT from UPSTASH_REDIS_REST_URL which is
 * the HTTP REST endpoint and cannot be used here.
 */

import { Queue } from "bullmq";
import IORedis from "ioredis";
import { logger } from "./logger";
import { sendPushToUser, sendPushToAll } from "./push";
import {
  buildApprovalMailOptions,
  buildRejectionMailOptions,
  buildOtpMailOptions,
  sendApprovalEmail,
  sendRejectionEmail,
  sendOtpEmail,
} from "./mailer";

// ── Job-data types (keep in sync with worker-server/src/queues/types.ts) ─────

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

// ── Lazy queue initialisation ─────────────────────────────────────────────────

let _conn: IORedis | null = null;
let _notifQ: Queue<NotificationJobData> | null = null;
let _emailQ: Queue<EmailJobData> | null = null;
let _initialised = false;

function getQueues(): { notifQ: Queue<NotificationJobData> | null; emailQ: Queue<EmailJobData> | null } {
  if (_initialised) return { notifQ: _notifQ, emailQ: _emailQ };
  _initialised = true;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    logger.info("REDIS_URL not set — queue-client in direct-call mode (no async offloading)");
    return { notifQ: null, emailQ: null };
  }

  try {
    _conn = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: redisUrl.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
      lazyConnect: true,
    });
    _conn.on("error", (err) => logger.warn({ err: err.message }, "Queue client Redis error"));

    const qOpts = { connection: _conn, defaultJobOptions: { attempts: 3, backoff: { type: "exponential" as const, delay: 2000 } } };
    _notifQ = new Queue<NotificationJobData>("notifications", qOpts);
    _emailQ = new Queue<EmailJobData>("emails", qOpts);

    logger.info("Queue client initialised (Redis-backed)");
  } catch (err) {
    logger.error({ err }, "Queue client failed to initialise — falling back to direct-call mode");
    _notifQ = null;
    _emailQ = null;
  }

  return { notifQ: _notifQ, emailQ: _emailQ };
}

// ── Public helpers ────────────────────────────────────────────────────────────

/**
 * Send a push notification, either via the worker queue (Redis) or directly.
 */
export async function enqueueNotification(data: NotificationJobData): Promise<void> {
  const { notifQ } = getQueues();
  if (notifQ) {
    await notifQ.add("notify", data);
    return;
  }
  // Direct fallback
  if (data.kind === "send-to-user") {
    await sendPushToUser(data.userId, data.payload);
  } else {
    await sendPushToAll(data.payload);
  }
}

/**
 * Send a pre-rendered email, either via the worker queue (Redis) or directly.
 * Call one of the build*MailOptions helpers first to obtain the job data.
 */
export async function enqueueEmail(data: EmailJobData): Promise<void> {
  const { emailQ } = getQueues();
  if (emailQ) {
    await emailQ.add("send", data);
    return;
  }
  // Direct fallback — re-use nodemailer transport from transport.ts
  const { createTransporter } = await import("./mailer/transport");
  const transporter = createTransporter();
  await transporter.sendMail(data);
}

// ── Re-export builder helpers so call sites only need one import ──────────────
export { buildApprovalMailOptions, buildRejectionMailOptions, buildOtpMailOptions };
export { sendApprovalEmail, sendRejectionEmail, sendOtpEmail };
