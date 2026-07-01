import { db, ledgerTable, usersTable, settingsTable } from "@workspace/db";
import { eq, and, gte, lte, isNotNull, inArray, asc } from "drizzle-orm";
import { logger } from "./logger";
import { isSmtpConfigured } from "./mailer";
import { createRequire } from "node:module";
import nodemailer from "nodemailer";
import cron from "node-cron";

const _require = createRequire(import.meta.url);
const PDFDocument = _require("pdfkit") as typeof import("pdfkit");
const archiver = _require("archiver") as typeof import("archiver");

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
): Buffer {
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true });
  doc.on("data", (chunk) => chunks.push(chunk));

  const W = 595.28;
  const NAVY = "#0b2c60";
  const SAFFRON = "#f97316";
  const isCredit = entry.credit > 0;
  const amount = isCredit ? entry.credit : entry.debit;
  const amountColor = isCredit ? "#059669" : "#e11d48";
  const txType = isCredit ? "CREDIT" : "DEBIT";
  const sign = isCredit ? "+" : "-";

  let y = 0;

  const headerH = 130;
  doc.rect(0, y, W, headerH).fill(NAVY);

  const stripeY = y + headerH;
  doc.rect(0, stripeY, W * 0.65, 4).fill(SAFFRON);
  doc.rect(W * 0.65, stripeY, W * 0.35, 4).fill(NAVY);

  doc.font("Helvetica").fontSize(7).fillColor("rgba(255,255,255,0.55)");
  doc.text(biz.businessName.toUpperCase(), 32, y + 22, { characterSpacing: 1.5 });
  doc.text("RECEIPT NO.", W - 32 - 80, y + 22, { width: 80, align: "right", characterSpacing: 1.5 });

  doc.font("Helvetica-Bold").fontSize(26).fillColor("#ffffff");
  doc.text("SAHU ", 32, y + 40, { continued: true });
  doc.fillColor(SAFFRON).text("CSC");

  doc.font("Helvetica").fontSize(8).fillColor("rgba(255,255,255,0.45)");
  doc.text("Common Service Center", 32, y + 73);

  doc.font("Helvetica-Bold").fontSize(13).fillColor(SAFFRON);
  doc.text(entry.receiptNumber, W - 32 - 160, y + 44, { width: 160, align: "right" });

  doc.font("Helvetica-Bold").fontSize(7).fillColor("#22c55e");
  const badgeX = W - 32 - 70;
  const badgeY = y + 64;
  doc.roundedRect(badgeX, badgeY, 70, 14, 7).stroke("#22c55e");
  doc.text("✓  VERIFIED", badgeX + 8, badgeY + 3.5, { width: 54, align: "center" });

  y = stripeY + 4;

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

  const circX = blockX + blockW - 40;
  const circY = blockY + blockH / 2;
  doc.circle(circX, circY, 18).fillAndStroke(`${amountColor}1a`, `${amountColor}35`);
  doc.font("Helvetica-Bold").fontSize(14).fillColor(amountColor);
  doc.text(isCredit ? "↑" : "↓", circX - 7, circY - 9);

  y = blockY + blockH + 18;

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

  if (biz.businessAddress || biz.businessMobile || biz.businessWebsite) {
    doc.moveTo(32, y).lineTo(W - 32, y).dash(4, { space: 4 }).stroke("#e2e8f0");
    doc.undash();
    y += 12;
    doc.font("Helvetica").fontSize(8).fillColor("#64748b");
    if (biz.businessAddress) { doc.text(`📍  ${biz.businessAddress}`, 32, y); y += 14; }
    if (biz.businessMobile) { doc.text(`📞  +91 ${biz.businessMobile.replace(/^(\+91|91)/, "").trim()}`, 32, y); y += 14; }
    if (biz.businessWebsite) { doc.text(`🌐  ${biz.businessWebsite}`, 32, y); }
  }

  const footerH = 44;
  const footerY = 841.89 - footerH;
  doc.rect(0, footerY, W, footerH).fill(NAVY);
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#ffffff");
  doc.text("Thank you for choosing SAHU CSC", 0, footerY + 10, { width: W, align: "center" });
  doc.font("Helvetica").fontSize(7.5).fillColor("rgba(255,255,255,0.45)");
  doc.text("Computer generated receipt · No signature required", 0, footerY + 26, { width: W, align: "center" });

  doc.end();
  return Buffer.concat(chunks);
}

async function buildMonthlyZip(year: number, month: number): Promise<Buffer> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const settingsRows = await db
    .select({ key: settingsTable.key, value: settingsTable.value })
    .from(settingsTable)
    .where(inArray(settingsTable.key, ["businessName", "businessAddress", "businessMobile", "businessWebsite"]));
  const get = (k: string, fb = "") => settingsRows.find((r) => r.key === k)?.value ?? fb;
  const biz = {
    businessName: get("businessName", "SAHU CSC Center"),
    businessAddress: get("businessAddress"),
    businessMobile: get("businessMobile"),
    businessWebsite: get("businessWebsite"),
  };

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
      createdAt: ledgerTable.createdAt,
      createdByName: usersTable.username,
    })
    .from(ledgerTable)
    .leftJoin(usersTable, eq(ledgerTable.createdBy, usersTable.id))
    .where(and(gte(ledgerTable.date, startDate), lte(ledgerTable.date, endDate), isNotNull(ledgerTable.receiptNumber)))
    .orderBy(asc(ledgerTable.date), asc(ledgerTable.id));

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);

    for (const entry of entries) {
      const pdf = generateReceiptPdf(
        {
          receiptNumber: entry.receiptNumber!,
          date: entry.date,
          customerName: entry.customerName,
          serviceType: entry.serviceType,
          credit: parseFloat(entry.credit ?? "0"),
          debit: parseFloat(entry.debit ?? "0"),
          description: entry.description ?? null,
          createdByName: entry.createdByName ?? null,
          createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : (entry.createdAt ?? new Date().toISOString()),
        },
        biz
      );
      archive.append(pdf, { name: `${entry.receiptNumber}.pdf` });
    }
    archive.finalize();
  });
}

async function sendMonthlyExportEmail(year: number, month: number): Promise<void> {
  if (!isSmtpConfigured()) {
    logger.info("Monthly receipt export: SMTP not configured, skipping email");
    return;
  }

  const monthName = new Date(year, month - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
  logger.info({ year, month }, `Monthly receipt export: building ZIP for ${monthName}`);

  const admins = await db
    .select({ id: usersTable.id, username: usersTable.username, fullName: usersTable.fullName, email: usersTable.email })
    .from(usersTable)
    .where(and(eq(usersTable.role, "admin"), eq(usersTable.isActive, true)));

  const adminsWithEmail = admins.filter((a) => a.email);
  if (adminsWithEmail.length === 0) {
    logger.info("Monthly receipt export: no admin email addresses found, skipping");
    return;
  }

  const zipBuffer = await buildMonthlyZip(year, month);
  const filename = `receipts-${year}-${String(month).padStart(2, "0")}.zip`;
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? "noreply@sahucsc.in";

  const host = process.env.SMTP_HOST!;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  const transporter = nodemailer.createTransport({
    host, port,
    secure: port === 465,
    auth: { user, pass },
  });

  const subject = `SAHU CSC — Monthly Receipt Export: ${monthName}`;
  const text = [
    `SAHU CSC — Monthly Receipt Export`,
    "=".repeat(40),
    "",
    `Hi,`,
    "",
    `Please find attached the automatic monthly receipt export for ${monthName}.`,
    `The ZIP contains individual PDF receipts for all transactions recorded during this period.`,
    "",
    `Generated automatically on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.`,
    "",
    "-".repeat(40),
    "SAHU CSC · Common Service Center · Odisha, India",
    "This is an automated message. Please do not reply.",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef2f7;padding:40px 16px 60px;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">
      <tr>
        <td style="border-radius:18px 18px 0 0;background:#0b2c60;padding:32px 36px 28px;text-align:center;">
          <p style="margin:0;font-size:26px;font-weight:900;letter-spacing:1px;">
            <span style="color:#ffffff;">SAHU&nbsp;</span><span style="color:#f97316;">CSC</span>
          </p>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:4px;text-transform:uppercase;">Management Platform &bull; Odisha</p>
          <div style="margin:16px auto 0;height:3px;width:58px;background:linear-gradient(90deg,#f97316,rgba(255,255,255,0.2));border-radius:99px;"></div>
        </td>
      </tr>
      <tr>
        <td style="background:#f97316;padding:10px 36px;text-align:center;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#fff;">Monthly Receipt Export</p>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff;padding:36px;border-left:1px solid #dde3ec;border-right:1px solid #dde3ec;">
          <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0b1a3a;">Monthly Export — ${monthName}</p>
          <p style="margin:0 0 24px;font-size:14px;color:#4b5563;line-height:1.7;">
            Your automatic monthly receipt export for <strong>${monthName}</strong> is ready.
            The attached ZIP file contains individual PDF receipts for all transactions recorded this month.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
            <tr>
              <td style="background:#eff6ff;border:2px solid rgba(37,99,235,0.2);border-radius:12px;padding:20px 22px;">
                <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#9ca3af;">Attached File</p>
                <p style="margin:0;font-size:15px;font-weight:700;color:#0b2c60;font-family:Courier New,monospace;">${filename}</p>
                <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">ZIP archive · Individual PDF receipts</p>
              </td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background:#f8fafc;border-left:4px solid #f97316;border-radius:0 8px 8px 0;padding:14px 16px;">
                <p style="margin:0;font-size:12px;color:#374151;line-height:1.6;">
                  This report is sent automatically on the 1st of each month for the previous month's receipts.
                  You can also export receipts manually from the <strong>Admin → Receipt Export</strong> page.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#f1f5f9;border:1px solid #dde3ec;border-top:none;border-radius:0 0 18px 18px;padding:20px 36px;text-align:center;">
          <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#64748b;">SAHU CSC &bull; Common Service Center &bull; Odisha, India</p>
          <p style="margin:0;font-size:10px;color:#94a3b8;">This is an automated message. Please do not reply to this email.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  let sent = 0;
  let failed = 0;
  await Promise.allSettled(
    adminsWithEmail.map(async (admin) => {
      try {
        await transporter.sendMail({
          from: `"SAHU CSC" <${fromEmail}>`,
          to: admin.email!,
          subject,
          text,
          html,
          attachments: [{ filename, content: zipBuffer, contentType: "application/zip" }],
        });
        sent++;
      } catch (err) {
        failed++;
        logger.error({ err, adminId: admin.id }, "Monthly export: failed to send to admin");
      }
    })
  );

  logger.info({ year, month, sent, failed }, "Monthly receipt export email sent");
}

function scheduleMonthlyExport(): void {
  // Runs at 00:05 on the 1st of every month.
  // node-cron handles long intervals correctly — no 32-bit setTimeout overflow.
  cron.schedule("5 0 1 * *", async () => {
    const now = new Date();
    // At 00:05 on the 1st, "last month" is now.getMonth() (0-indexed previous month)
    // because getMonth() returns the current month (0 = Jan … 11 = Dec).
    // We want the month that just ended, which is now.getMonth() (since we're on day 1).
    const currentMonth = now.getMonth(); // 0-indexed: 0=Jan, so if it's March 1st this is 2
    const month = currentMonth === 0 ? 12 : currentMonth;       // 1-indexed previous month
    const exportYear = currentMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();

    logger.info({ exportYear, month }, "Monthly receipt export cron triggered");
    try {
      await sendMonthlyExportEmail(exportYear, month);
    } catch (err) {
      logger.error({ err }, "Monthly receipt export job failed");
    }
  });

  logger.info("Monthly receipt export scheduled (cron: 5 0 1 * *)");
}

export { scheduleMonthlyExport, sendMonthlyExportEmail, buildMonthlyZip };
