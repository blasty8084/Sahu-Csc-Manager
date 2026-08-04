import { isSmtpConfigured, getTransporter, getFromEmail } from "./transport";
import { logger } from "../logger";
export { isSmtpConfigured };

// ── Re-export rich template functions ─────────────────────────────────────────
export { sendOtpEmail, buildOtpMailOptions } from "./templates/otp";
export { buildApprovalMailOptions } from "./templates/approval";
export { buildRejectionMailOptions } from "./templates/rejection";
export { sendAdminResetLinkEmail, sendNewRegistrationAdminEmail } from "./templates/adminAlerts";

// ── Simple direct-send helper ─────────────────────────────────────────────────
async function send(to: string, subject: string, html: string, text: string): Promise<void> {
  if (!isSmtpConfigured()) return;
  try {
    const transporter = getTransporter();
    // No `from` passed — sendMail() defaults to RESEND_FROM (full "Name <email>" format)
    await transporter.sendMail({ to, subject, html, text });
  } catch (err) {
    logger.warn({ err, to, subject }, "Email send failed");
  }
}

export async function sendApprovalEmail(to: string, name: string): Promise<void> {
  const { buildApprovalMailOptions } = await import("./templates/approval");
  const opts = buildApprovalMailOptions(to, name);
  await send(opts.to, opts.subject, opts.html, opts.text);
}

export async function sendRejectionEmail(to: string, name: string, reason?: string): Promise<void> {
  const { buildRejectionMailOptions } = await import("./templates/rejection");
  const opts = buildRejectionMailOptions(to, name, reason ?? null);
  await send(opts.to, opts.subject, opts.html, opts.text);
}

export async function sendBroadcastEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
  if (!isSmtpConfigured()) return false;
  try {
    const transporter = getTransporter();
    await transporter.sendMail({ to, subject, html, text });
    return true;
  } catch (err) {
    logger.warn({ err, to, subject }, "Broadcast email send failed");
    return false;
  }
}

// sendAdminResetLinkEmail and sendNewRegistrationAdminEmail are re-exported
// from ./templates/adminAlerts above — they use the rich V2 dark template.
