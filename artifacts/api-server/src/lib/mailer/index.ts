import { isSmtpConfigured, getTransporter, getFromEmail } from "./transport";
import { logger } from "../logger";
export { isSmtpConfigured };

// ── Re-export rich template functions ─────────────────────────────────────────
export { sendOtpEmail, buildOtpMailOptions } from "./templates/otp";
export { buildApprovalMailOptions, buildRejectionMailOptions } from "./templates/approval";

// ── Simple direct-send helper ─────────────────────────────────────────────────
async function send(to: string, subject: string, html: string, text: string): Promise<void> {
  if (!isSmtpConfigured()) return;
  try {
    await getTransporter().sendMail({ from: getFromEmail(), to, subject, html, text });
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
  const opts = buildRejectionMailOptions(to, name, reason);
  await send(opts.to, opts.subject, opts.html, opts.text);
}

export async function sendNewRegistrationAdminEmail(adminEmails: string[], username: string): Promise<void> {
  for (const email of adminEmails) {
    await send(
      email,
      "New registration pending approval",
      `<p>New user <strong>${username}</strong> has registered and is pending approval.</p>`,
      `New user ${username} has registered and is pending approval.`,
    );
  }
}

export async function sendBroadcastEmail(to: string, subject: string, html: string, text: string): Promise<void> {
  await send(to, subject, html, text);
}

export async function sendAdminResetLinkEmail(to: string, link: string): Promise<void> {
  await send(
    to,
    "SAHU CSC password reset link",
    `<p>Click the link to reset your password: <a href="${link}">${link}</a></p><p>Valid for 1 hour.</p>`,
    `Password reset link: ${link} (valid for 1 hour)`,
  );
}
