import type { Request, Response } from "express";
import { createRequire } from "node:module";
import { generateReceiptPdf, getBusinessSettings } from "./receiptExportService";
import {
  buildBulkConditions,
  countBulkReceipts,
  fetchBulkReceiptPage,
} from "./receiptExportQueries";
import type { BulkExportQuery } from "./receiptExportSchemas";

const _require = createRequire(import.meta.url);
const { ZipArchive } = _require("archiver") as typeof import("archiver");

const PAGE_SIZE = 200;

/**
 * Stream a ZIP of PDFs (one per receipt) directly to the HTTP response.
 * Fetches receipts in pages of 200 to bound memory usage.
 * Returns false and sends a JSON error if no matching receipts exist.
 */
export async function streamBulkZip(
  params: BulkExportQuery,
  req: Request,
  res: Response
): Promise<void> {
  const where = buildBulkConditions(params);

  if ((await countBulkReceipts(where)) === 0) {
    res.status(404).json({ error: "No receipts found for the selected range" });
    return;
  }

  const biz = await getBusinessSettings();
  const { startDate, endDate } = params;
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="receipts-${startDate}-to-${endDate}.zip"`);

  const archive = new ZipArchive({ zlib: { level: 6 } });
  archive.on("error", (err: Error) => {
    // Headers not yet flushed — send a clean JSON error.
    if (!res.headersSent) res.status(500).json({ error: err.message });
    // Headers already flushed with Content-Type: application/zip — destroy
    // the socket so the client sees a network error rather than a corrupt ZIP.
    else req.socket?.destroy(err);
  });
  archive.pipe(res);

  // Abort immediately if the client disconnects to avoid wasting CPU/memory.
  let clientDisconnected = false;
  req.on("close", () => { clientDisconnected = true; });

  let offset = 0;
  while (true) {
    if (clientDisconnected) break;
    const page = await fetchBulkReceiptPage(where, offset, PAGE_SIZE);

    for (const entry of page) {
      if (clientDisconnected) break;
      const pdf = await generateReceiptPdf(
        {
          receiptNumber: entry.receiptNumber!,
          date: entry.date,
          customerName: entry.customerName,
          serviceType: entry.serviceType,
          credit: parseFloat(entry.credit ?? "0"),
          debit: parseFloat(entry.debit ?? "0"),
          description: entry.description ?? null,
          createdByName: entry.createdByName ?? null,
          createdAt: entry.createdAt instanceof Date
            ? entry.createdAt.toISOString()
            : (entry.createdAt ?? new Date().toISOString()),
        },
        biz
      );
      archive.append(pdf, { name: `${entry.receiptNumber}.pdf` });
    }

    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  await archive.finalize();
}
