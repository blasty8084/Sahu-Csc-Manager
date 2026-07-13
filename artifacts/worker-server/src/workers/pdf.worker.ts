import { Worker } from "bullmq";
import { connection } from "../connection";
import { logger } from "../logger";
import type { PdfJobData } from "../queues/types";

/**
 * PDF generation worker.
 *
 * Placeholder — individual receipt PDFs are currently generated inline by the
 * api-server via PDFKit and served directly.  This worker is here for future
 * use when async PDF generation (e.g. bulk exports, scheduled reports) is
 * needed.  Any job queued here is logged and completed without error so the
 * api-server is never blocked.
 */
export const pdfWorker = new Worker<PdfJobData>(
  "pdf-generation",
  async (job) => {
    logger.info(
      { jobId: job.id, receiptId: job.data.receiptId, userId: job.data.userId },
      "PDF job received — async PDF generation not yet implemented; completing as no-op",
    );
    // TODO: Generate PDF using PDFKit, save to storage, update DB record.
  },
  { connection, concurrency: 2 },
);

pdfWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err: err.message }, "PDF job failed");
});

pdfWorker.on("completed", (job) => {
  logger.debug({ jobId: job.id }, "PDF job completed");
});
