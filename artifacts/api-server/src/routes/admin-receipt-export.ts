import { Router, type IRouter } from "express";
import { db, ledgerTable, usersTable, settingsTable } from "@workspace/db";
import { eq, and, gte, lte, isNotNull, inArray, asc } from "drizzle-orm";
import { requireRole } from "../lib/auth";
import { buildMonthlyZip, sendMonthlyExportEmail } from "../lib/monthly-export";
import { createRequire } from "node:module";

const _require = createRequire(import.meta.url);
const PDFDocument = _require("pdfkit") as typeof import("pdfkit");
const archiver = _require("archiver") as (format: string, options?: object) => import("archiver").Archiver;

const router: IRouter = Router();

async function getSettings() {
  const rows = await db
    .select({ key: settingsTable.key, value: settingsTable.value })
    .from(settingsTable)
    .where(
      inArray(settingsTable.key, [
        "businessName",
        "businessAddress",
        "businessMobile",
        "businessWebsite",
      ])
    );
  const get = (k: string, fb = "") => rows.find((r) => r.key === k)?.value ?? fb;
  return {
    businessName: get("businessName", "SAHU CSC Center"),
    businessAddress: get("businessAddress"),
    businessMobile: get("businessMobile"),
    businessWebsite: get("businessWebsite"),
  };
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtAmount(n: number): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function generateReceiptPdf(
  entry: {
    receiptNumber: string;
    date: string;
    customerName: string;
    serviceType: string;
    credit: number;
    debit: number;
    description: string | null;
    createdByName: string | null;
    createdAt: string;
  },
  biz: {
    businessName: string;
    businessAddress: string;
    businessMobile: string;
    businessWebsite: string;
  }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true });
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => resolve(Buffer.concat(chunks)));
  doc.on("error", reject);

  const W = 595.28;
  const NAVY = "#0b2c60";
  const SAFFRON = "#f97316";
  const isCredit = entry.credit > 0;
  const amount = isCredit ? entry.credit : entry.debit;
  const amountColor = isCredit ? "#059669" : "#e11d48";
  const txType = isCredit ? "CREDIT" : "DEBIT";
  const sign = isCredit ? "+" : "-";

  let y = 0;

  // ── Navy header band ──────────────────────────────────────────────────────
  const headerH = 130;
  doc.rect(0, y, W, headerH).fill(NAVY);

  // Accent stripe under header
  const stripeY = y + headerH;
  doc.rect(0, stripeY, W * 0.65, 4).fill(SAFFRON);
  doc.rect(W * 0.65, stripeY, W * 0.35, 4).fill(NAVY);

  // Business name (top-left)
  doc.font("Helvetica").fontSize(7).fillColor("rgba(255,255,255,0.55)");
  doc.text(biz.businessName.toUpperCase(), 32, y + 22, { characterSpacing: 1.5 });

  // Receipt No label (top-right)
  doc.text("RECEIPT NO.", W - 32 - 80, y + 22, { width: 80, align: "right", characterSpacing: 1.5 });

  // Brand "SAHU CSC"
  doc.font("Helvetica-Bold").fontSize(26).fillColor("#ffffff");
  doc.text("SAHU ", 32, y + 40, { continued: true });
  doc.fillColor(SAFFRON).text("CSC");

  doc.font("Helvetica").fontSize(8).fillColor("rgba(255,255,255,0.45)");
  doc.text("Common Service Center", 32, y + 73);

  // Receipt number (top-right, bold saffron)
  doc.font("Helvetica-Bold").fontSize(13).fillColor(SAFFRON);
  doc.text(entry.receiptNumber, W - 32 - 160, y + 44, { width: 160, align: "right" });

  // "VERIFIED" badge
  doc.font("Helvetica-Bold").fontSize(7).fillColor("#22c55e");
  const badgeX = W - 32 - 70;
  const badgeY = y + 64;
  doc.roundedRect(badgeX, badgeY, 70, 14, 7).stroke("#22c55e");
  doc.text("✓  VERIFIED", badgeX + 8, badgeY + 3.5, { width: 54, align: "center" });

  y = stripeY + 4;

  // ── Amount block ─────────────────────────────────────────────────────────
  const blockX = 32;
  const blockW = W - 64;
  const blockY = y + 22;
  const blockH = 72;

  doc.roundedRect(blockX, blockY, blockW, blockH, 8)
    .fillAndStroke(`${amountColor}18`, `${amountColor}35`);

  doc.font("Helvetica-Bold").fontSize(8).fillColor("#94a3b8");
  doc.text(`${txType} AMOUNT`, blockX + 16, blockY + 14, { characterSpacing: 1.8 });

  doc.font("Helvetica-Bold").fontSize(30).fillColor(amountColor);
  doc.text(`${sign}₹${fmtAmount(amount)}`, blockX + 14, blockY + 27);

  // Circle icon (right side of amount block)
  const circX = blockX + blockW - 40;
  const circY = blockY + blockH / 2;
  doc.circle(circX, circY, 18).fillAndStroke(`${amountColor}1a`, `${amountColor}35`);
  doc.font("Helvetica-Bold").fontSize(14).fillColor(amountColor);
  doc.text(isCredit ? "↑" : "↓", circX - 7, circY - 9);

  y = blockY + blockH + 18;

  // ── Detail rows ──────────────────────────────────────────────────────────
  const rows: Array<{ label: string; value: string }> = [
    { label: "Customer", value: entry.customerName },
    { label: "Service", value: entry.serviceType },
    { label: "Date", value: fmtDate(entry.date) },
    {
      label: "Issued At",
      value: new Date(entry.createdAt).toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
    },
    ...(entry.createdByName ? [{ label: "Operator", value: entry.createdByName }] : []),
    ...(entry.description ? [{ label: "Note", value: entry.description }] : []),
  ];

  const rowX = 32;
  const rowW = W - 64;
  const rowH = 30;

  rows.forEach((row, i) => {
    const rowY = y + i * rowH;
    if (i < rows.length - 1) {
      doc.moveTo(rowX, rowY + rowH).lineTo(rowX + rowW, rowY + rowH).stroke("#f1f5f9");
    }
    doc.font("Helvetica").fontSize(9).fillColor("#94a3b8");
    doc.text(row.label, rowX, rowY + 9);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(NAVY);
    doc.text(row.value, rowX + rowW / 2, rowY + 9, { width: rowW / 2, align: "right" });
  });

  y += rows.length * rowH + 16;

  // ── Business contact ─────────────────────────────────────────────────────
  const hasBizContact = biz.businessAddress || biz.businessMobile || biz.businessWebsite;
  if (hasBizContact) {
    doc.moveTo(32, y).lineTo(W - 32, y).dash(4, { space: 4 }).stroke("#e2e8f0");
    doc.undash();
    y += 12;

    doc.font("Helvetica").fontSize(8).fillColor("#64748b");
    if (biz.businessAddress) {
      doc.text(`📍  ${biz.businessAddress}`, 32, y);
      y += 14;
    }
    if (biz.businessMobile) {
      doc.text(`📞  +91 ${biz.businessMobile.replace(/^(\+91|91)/, "").trim()}`, 32, y);
      y += 14;
    }
    if (biz.businessWebsite) {
      doc.text(`🌐  ${biz.businessWebsite}`, 32, y);
      y += 14;
    }
    y += 4;
  }

  // ── Navy footer ───────────────────────────────────────────────────────────
  const footerH = 44;
  const footerY = 841.89 - footerH;
  doc.rect(0, footerY, W, footerH).fill(NAVY);

  doc.font("Helvetica-Bold").fontSize(10).fillColor("#ffffff");
  doc.text("Thank you for choosing SAHU CSC", 0, footerY + 10, { width: W, align: "center" });

  doc.font("Helvetica").fontSize(7.5).fillColor("rgba(255,255,255,0.45)");
  doc.text("Computer generated receipt · No signature required", 0, footerY + 26, {
    width: W,
    align: "center",
  });

  doc.end();
  }); // end Promise
}

// ── Count endpoint (preview before download) ─────────────────────────────────
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

    const entries = await db
      .select({
        id: ledgerTable.id,
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
      .where(and(...conditions))
      .orderBy(asc(ledgerTable.date), asc(ledgerTable.id));

    res.json({
      count: entries.length,
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

    const entries = await db
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
      .orderBy(asc(ledgerTable.date), asc(ledgerTable.id));

    if (entries.length === 0) {
      res.status(404).json({ error: "No receipts found for the selected range" });
      return;
    }

    const biz = await getSettings();
    const label = `receipts-${startDate}-to-${endDate}`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${label}.zip"`);

    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.on("error", (err: Error) => {
      if (!res.headersSent) res.status(500).json({ error: err.message });
    });
    archive.pipe(res);

    for (const entry of entries) {
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

    await archive.finalize();
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
