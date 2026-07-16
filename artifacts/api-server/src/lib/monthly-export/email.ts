import { db, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import nodemailer from "nodemailer";
import { logger } from "../logger";
import { isSmtpConfigured } from "../mailer";
import { buildMonthlyZip } from "./zip";

export async function sendMonthlyExportEmail(year: number, month: number): Promise<void> {
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

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT ?? "587", 10),
    secure: parseInt(process.env.SMTP_PORT ?? "587", 10) === 465,
    auth: { user: process.env.SMTP_USER!, pass: (process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS)! },
  });

  const subject = `SAHU CSC — Monthly Receipt Export: ${monthName}`;
  const text = [
    `SAHU CSC — Monthly Receipt Export`, "=".repeat(40), "",
    `Hi,`, "", `Please find attached the automatic monthly receipt export for ${monthName}.`,
    `The ZIP contains individual PDF receipts for all transactions recorded during this period.`,
    "", `Generated automatically on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.`,
    "", "-".repeat(40), "SAHU CSC · Common Service Center · Odisha, India",
    "This is an automated message. Please do not reply.",
  ].join("\n");

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef2f7;padding:40px 16px 60px;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">
      <tr><td style="border-radius:18px 18px 0 0;background:#0b2c60;padding:32px 36px 28px;text-align:center;">
        <p style="margin:0;font-size:26px;font-weight:900;"><span style="color:#fff;">SAHU&nbsp;</span><span style="color:#f97316;">CSC</span></p>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:4px;text-transform:uppercase;">Management Platform &bull; Odisha</p>
      </td></tr>
      <tr><td style="background:#f97316;padding:10px 36px;text-align:center;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#fff;">Monthly Receipt Export</p>
      </td></tr>
      <tr><td style="background:#ffffff;padding:36px;border-left:1px solid #dde3ec;border-right:1px solid #dde3ec;">
        <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0b1a3a;">Monthly Export — ${monthName}</p>
        <p style="margin:0 0 24px;font-size:14px;color:#4b5563;line-height:1.7;">
          Your automatic monthly receipt export for <strong>${monthName}</strong> is ready.
          The attached ZIP file contains individual PDF receipts for all transactions recorded this month.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
          <tr><td style="background:#eff6ff;border:2px solid rgba(37,99,235,0.2);border-radius:12px;padding:20px 22px;">
            <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#9ca3af;">Attached File</p>
            <p style="margin:0;font-size:15px;font-weight:700;color:#0b2c60;font-family:Courier New,monospace;">${filename}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">ZIP archive · Individual PDF receipts</p>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="background:#f1f5f9;border:1px solid #dde3ec;border-top:none;border-radius:0 0 18px 18px;padding:20px 36px;text-align:center;">
        <p style="margin:0;font-size:11px;font-weight:600;color:#64748b;">SAHU CSC &bull; Common Service Center &bull; Odisha, India</p>
        <p style="margin:0;font-size:10px;color:#94a3b8;">Automated message — please do not reply.</p>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;

  let sent = 0, failed = 0;
  await Promise.allSettled(adminsWithEmail.map(async (admin) => {
    try {
      await transporter.sendMail({ from: `"SAHU CSC" <${fromEmail}>`, to: admin.email!, subject, text, html, attachments: [{ filename, content: zipBuffer, contentType: "application/zip" }] });
      sent++;
    } catch (err) {
      failed++;
      logger.error({ err, adminId: admin.id }, "Monthly export: failed to send to admin");
    }
  }));

  logger.info({ year, month, sent, failed }, "Monthly receipt export email sent");
}
