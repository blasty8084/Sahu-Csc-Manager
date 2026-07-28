/**
 * Queue client — thin wrapper around BullMQ that the api-server uses to push
 * background jobs (push notifications, emails) to the worker-server.
 *
 * When REDIS_URL is set, jobs are enqueued via BullMQ for the worker-server to
 * process asynchronously.  When REDIS_URL is absent (dev / no-Redis setup),
 * the helpers fall back to direct, synchronous sends so the feature still works
 * — just without the retry/backoff guarantees that the queue provides.
 */

import { Queue } from "bullmq";
import IORedis from "ioredis";
import { logger } from "./logger";
import { env } from "./env";
import {
  buildApprovalMailOptions,
  buildRejectionMailOptions,
  buildOtpMailOptions,
  sendApprovalEmail,
  sendRejectionEmail,
  sendOtpEmail,
} from "./mailer";
import { sendPushToUser, sendPushToAll } from "./push";

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

// ── Lazy queue initialisation (only when Redis is configured) ─────────────────

let _conn: IORedis | null = null;
let _notifQ: Queue<NotificationJobData> | null = null;
let _emailQ: Queue<EmailJobData> | null = null;
let _initialised = false;

function getQueues(): { notifQ: Queue<NotificationJobData>; emailQ: Queue<EmailJobData> } | null {
  if (_initialised) return _notifQ && _emailQ ? { notifQ: _notifQ, emailQ: _emailQ } : null;
  _initialised = true;

  if (!env.REDIS_URL) {
    logger.info("Queue client: REDIS_URL not set — falling back to direct (synchronous) sends");
    return null;
  }

  const redisUrl = env.REDIS_URL;
  _conn = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: redisUrl.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
    lazyConnect: true,
  });
  _conn.on("error", (err) => logger.warn({ err: err.message }, "Queue client Redis error"));

  const qOpts = {
    connection: _conn as never,
    defaultJobOptions: { attempts: 3, backoff: { type: "exponential" as const, delay: 2000 } },
  };
  _notifQ = new Queue<NotificationJobData>("notifications", qOpts);
  _emailQ = new Queue<EmailJobData>("emails", qOpts);

  logger.info("Queue client initialised (Redis-backed)");
  return { notifQ: _notifQ, emailQ: _emailQ };
}

// ── Public helpers ────────────────────────────────────────────────────────────

/**
 * Send a push notification via the worker queue when Redis is available,
 * or directly (fire-and-forget) when it is not.
 */
export async function enqueueNotification(data: NotificationJobData): Promise<void> {
  const queues = getQueues();
  if (queues) {
    await queues.notifQ.add("notify", data);
    return;
  }
  // Direct fallback — no queue, send synchronously
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
 * Send a pre-rendered email via the worker queue when Redis is available,
 * or directly (fire-and-forget) when it is not.
 * Call one of the build*MailOptions helpers first to obtain the job data.
 */
export async function enqueueEmail(data: EmailJobData): Promise<void> {
  const queues = getQueues();
  if (queues) {
    await queues.emailQ.add("send", data);
    return;
  }
  // Direct fallback — no queue, send synchronously via nodemailer
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS ?? process.env.SMTP_PASSWORD,
    },
  });
  try {
    await transporter.sendMail(data);
  } catch (err: any) {
    logger.warn({ err: err.message }, "enqueueEmail direct-send failed");
  }
}

// ── Re-export builder helpers so call sites only need one import ──────────────
export { buildApprovalMailOptions, buildRejectionMailOptions, buildOtpMailOptions };
export { sendApprovalEmail, sendRejectionEmail, sendOtpEmail };
