import { Worker } from "bullmq";
import { connection } from "../connection";
import { logger } from "../logger";
import type { SmsJobData } from "../queues/types";

/**
 * SMS worker — stub.
 *
 * No SMS provider (Twilio, MSG91, etc.) is configured in this project.
 * Jobs are logged and completed without error.  Wire up a provider here when
 * SMS sending is required.
 */
export const smsWorker = new Worker<SmsJobData>(
  "sms",
  async (job) => {
    logger.warn(
      { jobId: job.id, mobile: job.data.mobile },
      "SMS job received but no provider configured — dropping message",
    );
    // TODO: Integrate SMS provider (e.g. MSG91, Twilio) and send job.data.message
    // to job.data.mobile.
  },
  { connection, concurrency: 5 },
);

smsWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err: err.message }, "SMS job failed");
});

smsWorker.on("completed", (job) => {
  logger.debug({ jobId: job.id }, "SMS job completed");
});
