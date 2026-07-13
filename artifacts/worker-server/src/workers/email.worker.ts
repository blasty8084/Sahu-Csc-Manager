import { Worker } from "bullmq";
import nodemailer from "nodemailer";
import { connection } from "../connection";
import { logger } from "../logger";
import type { EmailJobData } from "../queues/types";

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP not configured — set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS to send emails.",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export const emailWorker = new Worker<EmailJobData>(
  "emails",
  async (job) => {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: job.data.from,
      to: job.data.to,
      subject: job.data.subject,
      html: job.data.html,
      text: job.data.text,
    });
    logger.info({ to: job.data.to, subject: job.data.subject }, "Email sent");
  },
  {
    connection,
    concurrency: 3,
  },
);

emailWorker.on("failed", (job, err) => {
  logger.error(
    { jobId: job?.id, to: job?.data?.to, err: err.message },
    "Email job failed",
  );
});

emailWorker.on("completed", (job) => {
  logger.debug({ jobId: job.id, to: job.data.to }, "Email job completed");
});
