import { logger } from "../logger";
import { isSmtpConfigured, sendMail, getFromEmail } from "../mailer/transport";

/**
 * Monthly receipt export email — sends ZIP download notification via Resend.
 * No-op when RESEND_API_KEY is not configured.
 */
export async function sendMonthlyExportEmail(
  year: number,
  month: number,
  recipientEmail?: string,
): Promise<void> {
  if (!isSmtpConfigured()) {
    logger.info({ year, month }, "Monthly export: email skipped (RESEND_API_KEY not set)");
    return;
  }

  const to = recipientEmail ?? process.env["ADMIN_EMAIL"] ?? process.env["SMTP_USER"];
  if (!to) {
    logger.warn({ year, month }, "Monthly export: no recipient email configured");
    return;
  }

  const monthName = new Date(year, month - 1).toLocaleString("en-IN", { month: "long" });

  try {
    await sendMail({
      to,
      subject: `SAHU CSC — Monthly Export Ready (${monthName} ${year})`,
      text: `Your monthly receipt export for ${monthName} ${year} is ready. Log in to download it from the Admin → Receipts section.`,
      html: `<p>Your monthly receipt export for <strong>${monthName} ${year}</strong> is ready.</p><p>Log in to download it from <strong>Admin → Receipts</strong>.</p>`,
    });
    logger.info({ year, month, to }, "Monthly export email sent");
  } catch (err: any) {
    logger.warn({ err, year, month }, "Monthly export email failed");
  }
}
