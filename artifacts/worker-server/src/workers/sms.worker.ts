import { Worker } from "bullmq";
import { connection } from "../connection";
import { logger } from "../logger";
import type { SmsJobData } from "../queues/types";

/**
 * SMS worker.
 *
 * No SMS provider (Twilio, MSG91, etc.) is configured in this project.
 * Jobs are failed immediately so they surface in the BullMQ dead-letter queue
 * rather than silently completing as a no-op.  Wire up a provider here and
 * remove the throw when SMS sending is required.
 */
export const smsWorker = new Worker<SmsJobData>(
  "sms",
  async (job) => {
    logger.warn(
      { jobId: job.id, mobile: job.data.mobile },
      "SMS not sent: no provider configured — failing job so it appears in the dead-letter queue",
    );
    throw new Error("No SMS provider configured — integrate MSG91, Twilio, or similar before enabling SMS");
  },
  { connection, concurrency: 5 },
);

smsWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err: err.message }, "SMS job failed");
});

smsWorker.on("completed", (job) => {
  logger.debug({ jobId: job.id }, "SMS job completed");
});
