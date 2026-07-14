import { Worker } from "bullmq";
import { connection } from "../connection";
import { logger } from "../logger";
import type { PdfJobData } from "../queues/types";

/**
 * PDF generation worker.
 *
 * Async PDF generation (bulk exports, scheduled reports) is not yet
 * implemented.  Jobs are failed immediately so they surface in the BullMQ
 * dashboard and retry log rather than silently completing as a no-op.
 * Implement the job body here when async PDF generation is needed;
 * individual receipt PDFs are currently generated inline by the api-server
 * via PDFKit and served directly.
 */
export const pdfWorker = new Worker<PdfJobData>(
  "pdf-generation",
  async (job) => {
    logger.warn(
      { jobId: job.id, receiptId: job.data.receiptId, userId: job.data.userId },
      "PDF async generation not implemented — failing job so it appears in the dead-letter queue",
    );
    throw new Error("PDF async generation not yet implemented");
  },
  { connection, concurrency: 2 },
);

pdfWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err: err.message }, "PDF job failed");
});

pdfWorker.on("completed", (job) => {
  logger.debug({ jobId: job.id }, "PDF job completed");
});
