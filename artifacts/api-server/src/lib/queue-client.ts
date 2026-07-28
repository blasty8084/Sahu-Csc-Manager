/**
 * Queue client — thin wrapper around BullMQ that the api-server uses to push
 * background jobs (push notifications, emails) to the worker-server.
 *
 * REDIS_URL (TCP rediss://... from Upstash dashboard → ioredis) is required.
 * env.ts enforces this at startup — no silent fallback.
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

function getQueues(): { notifQ: Queue<NotificationJobData>; emailQ: Queue<EmailJobData> } {
  if (_initialised) return { notifQ: _notifQ!, emailQ: _emailQ! };
  _initialised = true;

  // REDIS_URL is guaranteed by env.ts — no silent fallback.
  _conn = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: env.REDIS_URL.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
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
 * Send a push notification, either via the worker queue (Redis) or directly.
 */
export async function enqueueNotification(data: NotificationJobData): Promise<void> {
  const { notifQ } = getQueues();
  await notifQ.add("notify", data);
}

/**
 * Send a pre-rendered email, either via the worker queue (Redis) or directly.
 * Call one of the build*MailOptions helpers first to obtain the job data.
 */
export async function enqueueEmail(data: EmailJobData): Promise<void> {
  const { emailQ } = getQueues();
  await emailQ.add("send", data);
}

// ── Re-export builder helpers so call sites only need one import ──────────────
export { buildApprovalMailOptions, buildRejectionMailOptions, buildOtpMailOptions };
export { sendApprovalEmail, sendRejectionEmail, sendOtpEmail };
