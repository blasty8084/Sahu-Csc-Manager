import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../logger";
import { isSmtpConfigured, createTransporter, getFromEmail } from "../mailer/transport";
import { buildMonthlyZip } from "./zip";

/**
 * Build the monthly receipt ZIP and email it to all admin accounts.
 * Silently skips if SMTP is not configured — the ZIP is still built.
 */
export async function sendMonthlyExportEmail(year: number, month: number): Promise<void> {
  const monthName = new Date(year, month - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  let zipBuffer: Buffer;
  try {
    zipBuffer = await buildMonthlyZip(year, month);
  } catch (err: any) {
    logger.error({ err: err.message, year, month }, "Monthly export: failed to build ZIP");
    return;
  }

  if (!isSmtpConfigured()) {
    logger.info({ year, month }, "Monthly export: ZIP built but email skipped (SMTP not configured)");
    return;
  }

  const admins = await db
    .select({ email: usersTable.email, username: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.role, "admin"));

  const adminEmails = admins
    .map((a) => a.email)
    .filter((e): e is string => !!e && e.trim().length > 0);

  if (adminEmails.length === 0) {
    logger.warn({ year, month }, "Monthly export: no admin email addresses found — skipped");
    return;
  }

  const transporter = createTransporter();
  const subject = `SAHU CSC — Monthly Receipt Export: ${monthName}`;
  const text = `Please find attached the monthly receipt export for ${monthName}.\n\nThis is an automated message from SAHU CSC Platform.`;
  const html = `<p style="font-family:sans-serif;font-size:15px;line-height:1.7;">Please find attached the monthly receipt export for <strong>${monthName}</strong>.</p><p style="font-family:sans-serif;font-size:13px;color:#888;">This is an automated message from SAHU CSC Platform.</p>`;

  await Promise.all(
    adminEmails.map((to) =>
      transporter
        .sendMail({
          from: getFromEmail(),
          to,
          subject,
          text,
          html,
          attachments: [
            {
              filename: `receipts-${year}-${String(month).padStart(2, "0")}.zip`,
              content: zipBuffer,
              contentType: "application/zip",
            },
          ],
        })
        .catch((err: Error) =>
          logger.warn({ err: err.message, to, year, month }, "Monthly export: failed to send email"),
        ),
    ),
  );

  logger.info({ year, month, recipients: adminEmails.length }, "Monthly export email sent");
}
