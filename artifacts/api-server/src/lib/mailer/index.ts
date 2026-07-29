import { isSmtpConfigured, getTransporter } from "./transport";
import { logger } from "../logger";

export { isSmtpConfigured };

const FROM = process.env["SMTP_FROM_EMAIL"] ?? `SAHU CSC <${process.env["SMTP_USER"]}>`;

async function send(to: string, subject: string, html: string, text: string): Promise<void> {
  if (!isSmtpConfigured()) return; // graceful no-op
  try {
    await getTransporter().sendMail({ from: FROM, to, subject, html, text });
  } catch (err) {
    logger.warn({ err, to, subject }, "Email send failed");
  }
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  await send(
    to,
    "Your SAHU CSC verification code",
    `<p>Your OTP is: <strong>${otp}</strong></p><p>Valid for 10 minutes.</p>`,
    `Your OTP is: ${otp}. Valid for 10 minutes.`,
  );
}

export async function sendApprovalEmail(to: string, name: string): Promise<void> {
  await send(
    to,
    "Your SAHU CSC account has been approved",
    `<p>Hello ${name},</p><p>Your account has been approved. You can now log in.</p>`,
    `Hello ${name}, your account has been approved. You can now log in.`,
  );
}

export async function sendRejectionEmail(to: string, name: string, reason?: string): Promise<void> {
  await send(
    to,
    "SAHU CSC account application update",
    `<p>Hello ${name},</p><p>Your account application was not approved.</p>${reason ? `<p>Reason: ${reason}</p>` : ""}`,
    `Hello ${name}, your account application was not approved.${reason ? ` Reason: ${reason}` : ""}`,
  );
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

export function buildOtpMailOptions(_to: string, _otp: string): null { return null; }
export function buildApprovalMailOptions(_to: string, _name: string): null { return null; }
export function buildRejectionMailOptions(_to: string, _name: string, _reason?: string): null { return null; }
