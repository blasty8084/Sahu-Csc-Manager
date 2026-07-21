import { Router, type IRouter } from "express";
import { requireRole } from "../lib/auth";
import { asyncHandler } from "../lib/async-handler";
import { buildMonthlyZip, sendMonthlyExportEmail } from "../lib/monthly-export";
import { getBusinessSettings } from "../services/receiptExportService";
import {
  bulkExportQuerySchema,
  monthlyDownloadQuerySchema,
  monthlyTriggerBodySchema,
} from "../services/receiptExportSchemas";
import {
  buildBulkConditions,
  countBulkReceipts,
  previewBulkReceipts,
  fetchAllReceiptsForExcel,
  fetchSingleReceiptEntry,
} from "../services/receiptExportQueries";
import { buildExcelBuffer } from "../services/receiptExportBuilders";
import { streamBulkZip } from "../services/receiptExportZip";

const router: IRouter = Router();

// ── Count endpoint (preview before download) ─────────────────────────────────
router.get("/admin/receipts/bulk-export/count", requireRole("admin"), asyncHandler(async (req, res) => {
  const parsed = bulkExportQuerySchema.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query parameters" }); return; }
  const where = buildBulkConditions(parsed.data);
  const [total, entries] = await Promise.all([countBulkReceipts(where), previewBulkReceipts(where)]);
  res.json({ count: total, entries });
}));

// ── Download ZIP endpoint ─────────────────────────────────────────────────────
router.get("/admin/receipts/bulk-export/download", requireRole("admin"), asyncHandler(async (req, res) => {
  const parsed = bulkExportQuerySchema.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query parameters" }); return; }
  await streamBulkZip(parsed.data, req, res);
}));

// ── Download Excel (.xlsx) summary endpoint ───────────────────────────────────
router.get("/admin/receipts/bulk-export/excel", requireRole("admin"), asyncHandler(async (req, res) => {
  const parsed = bulkExportQuerySchema.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query parameters" }); return; }
  const where = buildBulkConditions(parsed.data);
  const entries = await fetchAllReceiptsForExcel(where);
  if (entries.length === 0) { res.status(404).json({ error: "No receipts found for the selected range" }); return; }
  const { startDate, endDate } = parsed.data;
  const buffer = await buildExcelBuffer(entries);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="receipts-${startDate}-to-${endDate}.xlsx"`);
  res.send(buffer);
}));

// ── Single receipt lookup (for Print / PDF / Share actions) ──────────────────
router.get("/admin/receipts/single/:receiptNumber", requireRole("admin"), asyncHandler(async (req, res) => {
  const entry = await fetchSingleReceiptEntry(String(req.params.receiptNumber));
  if (!entry) { res.status(404).json({ error: "Receipt not found" }); return; }
  const biz = await getBusinessSettings();
  res.json({
    id: entry.id,
    receiptNumber: entry.receiptNumber,
    date: entry.date,
    customerName: entry.customerName,
    serviceType: entry.serviceType,
    credit: parseFloat(entry.credit ?? "0"),
    debit: parseFloat(entry.debit ?? "0"),
    description: entry.description ?? null,
    balance: parseFloat(entry.balance ?? "0"),
    receiptToken: entry.receiptToken,
    createdByName: entry.createdByName ?? null,
    createdAt: entry.createdAt instanceof Date
      ? entry.createdAt.toISOString()
      : (entry.createdAt ?? new Date().toISOString()),
    business: biz,
  });
}));

// ── Manual monthly export trigger (for testing / on-demand) ──────────────────
router.post("/admin/receipts/monthly-export/trigger", requireRole("admin"), asyncHandler(async (req, res) => {
  const parsed = monthlyTriggerBodySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request body" }); return; }
  const now = new Date();
  const targetYear  = parsed.data.year  ?? (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
  const targetMonth = parsed.data.month ?? (now.getMonth() === 0 ? 12 : now.getMonth());
  await sendMonthlyExportEmail(targetYear, targetMonth);
  res.json({ ok: true, message: `Monthly export for ${targetYear}-${String(targetMonth).padStart(2, "0")} triggered` });
}));

// ── Manual monthly ZIP download (admin downloads without email) ───────────────
router.get("/admin/receipts/monthly-export/download", requireRole("admin"), asyncHandler(async (req, res) => {
  const parsed = monthlyDownloadQuerySchema.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query parameters" }); return; }
  const now = new Date();
  const rawYear  = parsed.data.year  ?? (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
  const rawMonth = parsed.data.month ?? (now.getMonth() === 0 ? 12 : now.getMonth());
  const zipBuffer = await buildMonthlyZip(rawYear, rawMonth);
  const filename = `receipts-${rawYear}-${String(rawMonth).padStart(2, "0")}.zip`;
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(zipBuffer);
}));

export default router;
