import { Router, type IRouter } from "express";
import { db, ledgerTable, usersTable } from "@workspace/db";
import { eq, and, gte, lte, isNotNull, inArray, asc, count } from "drizzle-orm";
import { requireRole } from "../lib/auth";
import { buildMonthlyZip, sendMonthlyExportEmail } from "../lib/monthly-export";
import { generateReceiptPdf, getBusinessSettings } from "../services/receiptExportService";
import { createRequire } from "node:module";
import ExcelJS from "exceljs";

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
  async (req, res): Promise<void> => {
    const { startDate, endDate, userId } = req.query as Record<string, string>;

    if (!startDate || !endDate) {
      res.status(400).json({ error: "startDate and endDate are required" });
      return;
    }

    const conditions = [
      gte(ledgerTable.date, startDate),
      lte(ledgerTable.date, endDate),
      isNotNull(ledgerTable.receiptNumber),
    ];
    if (userId) {
      const uid = parseInt(userId, 10);
      if (!isNaN(uid)) conditions.push(eq(ledgerTable.createdBy, uid));
    }

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
  }
);

// ── Download ZIP endpoint ─────────────────────────────────────────────────────
router.get(
  "/admin/receipts/bulk-export/download",
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const { startDate, endDate, userId, receiptNumbers: receiptNumbersParam } = req.query as Record<string, string>;

    if (!startDate || !endDate) {
      res.status(400).json({ error: "startDate and endDate are required" });
      return;
    }

    // Parse optional comma-separated receipt numbers list (from user's selection)
    const selectedNumbers = receiptNumbersParam
      ? receiptNumbersParam.split(",").map((s) => s.trim()).filter(Boolean)
      : null;

    const conditions = [
      gte(ledgerTable.date, startDate),
      lte(ledgerTable.date, endDate),
      isNotNull(ledgerTable.receiptNumber),
    ];
    if (userId) {
      const uid = parseInt(userId, 10);
      if (!isNaN(uid)) conditions.push(eq(ledgerTable.createdBy, uid));
    }
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
      if (!res.headersSent) res.status(500).json({ error: err.message });
    });
    archive.pipe(res);

    // Fetch and process entries in pages of 200 to avoid loading the full
    // dataset into memory at once — critical for months with 2 000+ receipts.
    const PAGE_SIZE = 200;
    let offset = 0;
    while (true) {
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
  }
);

// ── Download Excel (.xlsx) summary endpoint ───────────────────────────────────
router.get(
  "/admin/receipts/bulk-export/excel",
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const { startDate, endDate, userId, receiptNumbers: receiptNumbersParam } = req.query as Record<string, string>;

    if (!startDate || !endDate) {
      res.status(400).json({ error: "startDate and endDate are required" });
      return;
    }

    const selectedNumbers = receiptNumbersParam
      ? receiptNumbersParam.split(",").map((s) => s.trim()).filter(Boolean)
      : null;

    const conditions = [
      gte(ledgerTable.date, startDate),
      lte(ledgerTable.date, endDate),
      isNotNull(ledgerTable.receiptNumber),
    ];
    if (userId) {
      const uid = parseInt(userId, 10);
      if (!isNaN(uid)) conditions.push(eq(ledgerTable.createdBy, uid));
    }
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
  }
);

// ── Single receipt lookup (for Print / PDF / Share actions) ──────────────────
router.get(
  "/admin/receipts/single/:receiptNumber",
  requireRole("admin"),
  async (req, res): Promise<void> => {
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
  }
);

// ── Manual monthly export trigger (for testing / on-demand) ──────────────────
router.post(
  "/admin/receipts/monthly-export/trigger",
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const now = new Date();
    const { year, month } = req.body as { year?: number; month?: number };
    const targetYear = year ?? (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
    const targetMonth = month ?? (now.getMonth() === 0 ? 12 : now.getMonth());

    if (targetMonth < 1 || targetMonth > 12) {
      res.status(400).json({ error: "month must be 1-12" }); return;
    }

    await sendMonthlyExportEmail(targetYear, targetMonth);
    res.json({ ok: true, message: `Monthly export for ${targetYear}-${String(targetMonth).padStart(2, "0")} triggered` });
  }
);

// ── Manual monthly ZIP download (admin downloads without email) ───────────────
router.get(
  "/admin/receipts/monthly-export/download",
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const now = new Date();
    const rawYear = req.query.year ? parseInt(req.query.year as string, 10) : (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
    const rawMonth = req.query.month ? parseInt(req.query.month as string, 10) : (now.getMonth() === 0 ? 12 : now.getMonth());

    if (isNaN(rawYear) || isNaN(rawMonth) || rawMonth < 1 || rawMonth > 12) {
      res.status(400).json({ error: "Invalid year or month" }); return;
    }

    const zipBuffer = await buildMonthlyZip(rawYear, rawMonth);
    const filename = `receipts-${rawYear}-${String(rawMonth).padStart(2, "0")}.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(zipBuffer);
  }
);

export default router;
