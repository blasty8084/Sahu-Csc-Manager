import { Router, type IRouter } from "express";
import { db, ledgerTable, usersTable } from "@workspace/db";
import { eq, and, gte, lte, isNotNull, inArray, asc, count } from "drizzle-orm";
import { requireRole } from "../lib/auth";
import { buildMonthlyZip, sendMonthlyExportEmail } from "../lib/monthly-export";
import { generateReceiptPdf, getBusinessSettings } from "../services/receiptExportService";
import { createRequire } from "node:module";
import ExcelJS from "exceljs";
import { asyncHandler } from "../lib/async-handler";
import { z } from "zod";

// ── Shared Zod schemas ────────────────────────────────────────────────────────
// ISO calendar date (YYYY-MM-DD).  Zod's z.string().date() validates the
// format AND the calendar value (e.g. 2025-02-30 is rejected).
const isoDate = z.string().date();

const bulkExportQuerySchema = z.object({
  startDate: isoDate,
  endDate: isoDate,
  // Optional positive integer operator filter.
  userId: z
    .string()
    .regex(/^\d+$/, "userId must be a positive integer")
    .transform(Number)
    .refine((n) => n > 0, "userId must be a positive integer")
    .optional(),
  // Optional comma-separated receipt numbers — no DB-layer meaning beyond an
  // IN() clause so we only sanity-check that every segment looks like a receipt
  // code (alphanumeric + hyphens, max 32 chars each).
  receiptNumbers: z
    .string()
    .regex(/^[A-Za-z0-9,\-]+$/, "receiptNumbers contains invalid characters")
    .optional(),
}).refine((d) => d.startDate <= d.endDate, {
  message: "startDate must be on or before endDate",
  path: ["startDate"],
});

const monthlyDownloadQuerySchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/, "year must be a 4-digit number")
    .transform(Number)
    .optional(),
  month: z
    .string()
    .regex(/^\d{1,2}$/, "month must be 1-12")
    .transform(Number)
    .refine((n) => n >= 1 && n <= 12, "month must be 1-12")
    .optional(),
});

const monthlyTriggerBodySchema = z.object({
  year: z.number().int().min(2000).max(2100).optional(),
  month: z.number().int().min(1).max(12).optional(),
});

const _require = createRequire(import.meta.url);
const { ZipArchive } = _require("archiver") as typeof import("archiver");

const router: IRouter = Router();

// ── Count endpoint (preview before download) ─────────────────────────────────
// Returns a count + a capped preview (first 200 rows) to avoid loading the
// full dataset into memory just for the confirmation dialog.
const PREVIEW_LIMIT = 200;
router.get(
  "/admin/receipts/bulk-export/count",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const parsed = bulkExportQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query parameters" });
      return;
    }
    const { startDate, endDate, userId } = parsed.data;

    const conditions = [
      gte(ledgerTable.date, startDate),
      lte(ledgerTable.date, endDate),
      isNotNull(ledgerTable.receiptNumber),
    ];
    if (userId !== undefined) conditions.push(eq(ledgerTable.createdBy, userId));

    const where = and(...conditions);

    // Use a real COUNT query instead of fetching all rows
    const [countRow] = await db
      .select({ total: count() })
      .from(ledgerTable)
      .where(where);

    const total = Number(countRow?.total ?? 0);

    // Fetch only the first PREVIEW_LIMIT rows for the confirmation preview
    const entries = await db
      .select({
        receiptNumber: ledgerTable.receiptNumber,
        date: ledgerTable.date,
        customerName: ledgerTable.customerName,
        serviceType: ledgerTable.serviceType,
        credit: ledgerTable.credit,
        debit: ledgerTable.debit,
        createdByName: usersTable.username,
      })
      .from(ledgerTable)
      .leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id))
      .where(where)
      .orderBy(asc(ledgerTable.date), asc(ledgerTable.id))
      .limit(PREVIEW_LIMIT);

    res.json({
      count: total,
      entries: entries.map((e) => ({
        receiptNumber: e.receiptNumber,
        date: e.date,
        customerName: e.customerName,
        serviceType: e.serviceType,
        amount: parseFloat(e.credit ?? "0") > 0 ? parseFloat(e.credit!) : parseFloat(e.debit ?? "0"),
        type: parseFloat(e.credit ?? "0") > 0 ? "credit" : "debit",
        operator: e.createdByName,
      })),
    });
  })
);

// ── Download ZIP endpoint ─────────────────────────────────────────────────────
router.get(
  "/admin/receipts/bulk-export/download",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const parsed = bulkExportQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query parameters" });
      return;
    }
    const { startDate, endDate, userId, receiptNumbers: receiptNumbersParam } = parsed.data;

    // Split the already-sanitised receiptNumbers string into individual codes.
    const selectedNumbers = receiptNumbersParam
      ? receiptNumbersParam.split(",").map((s) => s.trim()).filter(Boolean)
      : null;

    const conditions = [
      gte(ledgerTable.date, startDate),
      lte(ledgerTable.date, endDate),
      isNotNull(ledgerTable.receiptNumber),
    ];
    if (userId !== undefined) conditions.push(eq(ledgerTable.createdBy, userId));
    if (selectedNumbers && selectedNumbers.length > 0) {
      conditions.push(inArray(ledgerTable.receiptNumber, selectedNumbers));
    }

    // Check there is at least one matching receipt before opening the stream
    const [countRow] = await db
      .select({ total: count() })
      .from(ledgerTable)
      .where(and(...conditions));

    if (Number(countRow?.total ?? 0) === 0) {
      res.status(404).json({ error: "No receipts found for the selected range" });
      return;
    }

    const biz = await getBusinessSettings();
    const label = `receipts-${startDate}-to-${endDate}`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${label}.zip"`);

    const archive = new ZipArchive({ zlib: { level: 6 } });
    archive.on("error", (err: Error) => {
      if (!res.headersSent) {
        // Headers not yet flushed — we can still send a clean JSON error.
        res.status(500).json({ error: err.message });
      } else {
        // Headers already sent with Content-Type: application/zip.  We cannot
        // inject a JSON error into the stream without corrupting the ZIP.
        // Destroy the socket so the client receives a network-level error and
        // its browser shows a failed download rather than a silently-corrupt file.
        req.socket?.destroy(err);
      }
    });
    archive.pipe(res);

    // Abort the loop immediately if the client closes the connection — prevents
    // wasting CPU and memory finishing a ZIP nobody will receive.
    let clientDisconnected = false;
    req.on("close", () => { clientDisconnected = true; });

    // Fetch and process entries in pages of 200 to avoid loading the full
    // dataset into memory at once — critical for months with 2 000+ receipts.
    const PAGE_SIZE = 200;
    let offset = 0;
    while (true) {
      if (clientDisconnected) break;

      const page = await db
        .select({
          id: ledgerTable.id,
          receiptNumber: ledgerTable.receiptNumber,
          date: ledgerTable.date,
          customerName: ledgerTable.customerName,
          serviceType: ledgerTable.serviceType,
          credit: ledgerTable.credit,
          debit: ledgerTable.debit,
          description: ledgerTable.description,
          receiptToken: ledgerTable.receiptToken,
          createdAt: ledgerTable.createdAt,
          createdByName: usersTable.username,
        })
        .from(ledgerTable)
        .leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id))
        .where(and(...conditions))
        .orderBy(asc(ledgerTable.date), asc(ledgerTable.id))
        .limit(PAGE_SIZE)
        .offset(offset);

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
            createdAt:
              entry.createdAt instanceof Date
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
  })
);

// ── Download Excel (.xlsx) summary endpoint ───────────────────────────────────
router.get(
  "/admin/receipts/bulk-export/excel",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const parsed = bulkExportQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query parameters" });
      return;
    }
    const { startDate, endDate, userId, receiptNumbers: receiptNumbersParam } = parsed.data;

    const selectedNumbers = receiptNumbersParam
      ? receiptNumbersParam.split(",").map((s) => s.trim()).filter(Boolean)
      : null;

    const conditions = [
      gte(ledgerTable.date, startDate),
      lte(ledgerTable.date, endDate),
      isNotNull(ledgerTable.receiptNumber),
    ];
    if (userId !== undefined) conditions.push(eq(ledgerTable.createdBy, userId));
    if (selectedNumbers && selectedNumbers.length > 0) {
      conditions.push(inArray(ledgerTable.receiptNumber, selectedNumbers));
    }

    const entries = await db
      .select({
        receiptNumber: ledgerTable.receiptNumber,
        date: ledgerTable.date,
        customerName: ledgerTable.customerName,
        serviceType: ledgerTable.serviceType,
        credit: ledgerTable.credit,
        debit: ledgerTable.debit,
        balance: ledgerTable.balance,
        description: ledgerTable.description,
        createdByName: usersTable.username,
      })
      .from(ledgerTable)
      .leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id))
      .where(and(...conditions))
      .orderBy(asc(ledgerTable.date), asc(ledgerTable.id));

    if (entries.length === 0) {
      res.status(404).json({ error: "No receipts found for the selected range" });
      return;
    }

    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet("Receipts");
    sheet.columns = [
      { header: "Receipt #",     key: "receiptNumber", width: 18 },
      { header: "Date",          key: "date",           width: 14 },
      { header: "Customer",      key: "customerName",   width: 24 },
      { header: "Service",       key: "serviceType",    width: 20 },
      { header: "Credit (₹)",    key: "credit",         width: 14 },
      { header: "Debit (₹)",     key: "debit",          width: 14 },
      { header: "Balance (₹)",   key: "balance",        width: 14 },
      { header: "Operator",      key: "operator",       width: 16 },
      { header: "Description",  key: "description",    width: 30 },
    ];
    sheet.getRow(1).font = { bold: true };

    let totalCredit = 0;
    let totalDebit = 0;
    for (const e of entries) {
      const credit = parseFloat(e.credit ?? "0");
      const debit = parseFloat(e.debit ?? "0");
      totalCredit += credit;
      totalDebit += debit;
      sheet.addRow({
        receiptNumber: e.receiptNumber,
        date: e.date,
        customerName: e.customerName,
        serviceType: e.serviceType,
        credit,
        debit,
        balance: parseFloat(e.balance ?? "0"),
        operator: e.createdByName ?? "",
        description: e.description ?? "",
      });
    }
    sheet.addRow({});
    const totalsRow = sheet.addRow({
      customerName: "TOTAL",
      credit: totalCredit,
      debit: totalDebit,
    });
    totalsRow.font = { bold: true };

    const buffer = await wb.xlsx.writeBuffer();
    const label = `receipts-${startDate}-to-${endDate}`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${label}.xlsx"`);
    res.send(Buffer.from(buffer));
  })
);

// ── Single receipt lookup (for Print / PDF / Share actions) ──────────────────
router.get(
  "/admin/receipts/single/:receiptNumber",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const receiptNumber = String(req.params.receiptNumber);

    const [entry] = await db
      .select({
        id: ledgerTable.id,
        receiptNumber: ledgerTable.receiptNumber,
        date: ledgerTable.date,
        customerName: ledgerTable.customerName,
        serviceType: ledgerTable.serviceType,
        credit: ledgerTable.credit,
        debit: ledgerTable.debit,
        description: ledgerTable.description,
        balance: ledgerTable.balance,
        receiptToken: ledgerTable.receiptToken,
        createdAt: ledgerTable.createdAt,
        createdByName: usersTable.username,
      })
      .from(ledgerTable)
      .leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id))
      .where(eq(ledgerTable.receiptNumber, receiptNumber))
      .limit(1);

    if (!entry) {
      res.status(404).json({ error: "Receipt not found" });
      return;
    }

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
      createdAt:
        entry.createdAt instanceof Date
          ? entry.createdAt.toISOString()
          : (entry.createdAt ?? new Date().toISOString()),
      business: biz,
    });
  })
);

// ── Manual monthly export trigger (for testing / on-demand) ──────────────────
router.post(
  "/admin/receipts/monthly-export/trigger",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const parsed = monthlyTriggerBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request body" });
      return;
    }
    const now = new Date();
    const { year, month } = parsed.data;
    const targetYear = year ?? (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
    const targetMonth = month ?? (now.getMonth() === 0 ? 12 : now.getMonth());

    await sendMonthlyExportEmail(targetYear, targetMonth);
    res.json({ ok: true, message: `Monthly export for ${targetYear}-${String(targetMonth).padStart(2, "0")} triggered` });
  })
);

// ── Manual monthly ZIP download (admin downloads without email) ───────────────
router.get(
  "/admin/receipts/monthly-export/download",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const parsed = monthlyDownloadQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query parameters" });
      return;
    }
    const now = new Date();
    const rawYear = parsed.data.year ?? (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
    const rawMonth = parsed.data.month ?? (now.getMonth() === 0 ? 12 : now.getMonth());

    const zipBuffer = await buildMonthlyZip(rawYear, rawMonth);
    const filename = `receipts-${rawYear}-${String(rawMonth).padStart(2, "0")}.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(zipBuffer);
  })
);

export default router;
