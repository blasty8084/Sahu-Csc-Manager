import { Queue } from "bullmq";
import { connection } from "../connection";
import type {
  NotificationJobData,
  EmailJobData,
  PdfJobData,
  SmsJobData,
} from "./types";

// One queue per concern.  The api-server pushes jobs; workers in this process
// consume them.  All four share the same ioredis connection.
export const notificationQueue = new Queue<NotificationJobData>("notifications", {
  connection,
  defaultJobOptions: { attempts: 3, backoff: { type: "exponential", delay: 2000 } },
});

export const emailQueue = new Queue<EmailJobData>("emails", {
  connection,
  defaultJobOptions: { attempts: 3, backoff: { type: "exponential", delay: 5000 } },
});

export const pdfQueue = new Queue<PdfJobData>("pdf-generation", {
  connection,
  defaultJobOptions: { attempts: 2, backoff: { type: "fixed", delay: 3000 } },
});

export const smsQueue = new Queue<SmsJobData>("sms", {
  connection,
  defaultJobOptions: { attempts: 3, backoff: { type: "exponential", delay: 5000 } },
});
