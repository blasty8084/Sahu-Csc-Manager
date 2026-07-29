/**
 * Mailer — all send functions use nodemailer via createTransporter().
 * Every function is a no-op (logs a warning) when SMTP is not configured,
 * so dev / Replit environments without SMTP secrets work without crashing.
 */

import { logger } from "../logger";
import {
  isSmtpConfigured,
  createTransporter,
  getFromEmail,
  buildV2Html,
  esc,
} from "./transport";

export { isSmtpConfigured };

// ── Shared send helper ────────────────────────────────────────────────────────

async function send(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: getFromEmail(),
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}

// ── OTP email ─────────────────────────────────────────────────────────────────

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  if (!isSmtpConfigured()) {
    logger.warn({ to }, "sendOtpEmail: SMTP not configured — skipped");
    return;
  }
  const { html, text } = buildOtpEmail(otp);
  await send({ to, subject: "Your SAHU CSC Verification Code", html, text });
}

function buildOtpEmail(otp: string): { html: string; text: string } {
  const html = buildV2Html({
    title: "Verification Code",
    icon: "🔐",
    subtitle: "Email Verification",
    accentColor: "#f97316",
    accentText: "#fdba74",
    accentDark: "#c2410c",
    bodyHtml: `
      <p style="margin:0 0 24px;font-size:16px;color:#cbd5e1;line-height:1.7;text-align:center;">
        Use the code below to verify your email address.<br/>
        It expires in <strong style="color:#ffffff;">10 minutes</strong>.
      </p>
      <!-- OTP box -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="#1e3a5f" style="background-color:#1e3a5f;border:2px solid #f97316;border-radius:12px;padding:20px 48px;text-align:center;">
                  <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#ffffff;font-family:monospace;">${esc(otp)}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:13px;color:#64748b;text-align:center;line-height:1.6;">
        If you did not request this, you can safely ignore this email.<br/>
        Do not share this code with anyone.
      </p>
    `,
  });
  const text = `Your SAHU CSC verification code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`;
  return { html, text };
}

// ── Approval email ────────────────────────────────────────────────────────────

export async function sendApprovalEmail(
  to: string,
  name: string,
): Promise<void> {
  if (!isSmtpConfigured()) {
    logger.warn({ to }, "sendApprovalEmail: SMTP not configured — skipped");
    return;
  }
  const { html, text } = buildApprovalEmail(name);
  await send({ to, subject: "Your SAHU CSC Account Has Been Approved", html, text });
}

function buildApprovalEmail(name: string): { html: string; text: string } {
  const html = buildV2Html({
    title: "Account Approved",
    icon: "✅",
    subtitle: "Registration Approved",
    accentColor: "#10b981",
    accentText: "#34d399",
    accentDark: "#059669",
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:16px;color:#cbd5e1;line-height:1.7;">
        Hi <strong style="color:#ffffff;">${esc(name)}</strong>,
      </p>
      <p style="margin:0 0 24px;font-size:16px;color:#cbd5e1;line-height:1.7;">
        Great news! Your SAHU CSC account has been <strong style="color:#10b981;">approved</strong>.
        You can now log in and access all platform services.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
        <tr>
          <td bgcolor="#1e3a5f" style="background-color:#1e3a5f;border-left:4px solid #10b981;border-radius:8px;padding:16px 20px;">
            <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
              Log in at your SAHU CSC portal and start managing your services.
            </p>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
        If you have any questions, please contact your administrator.
      </p>
    `,
  });
  const text = `Hi ${name},\n\nYour SAHU CSC account has been approved. You can now log in and access all platform services.\n\nIf you have any questions, please contact your administrator.`;
  return { html, text };
}

// ── Rejection email ───────────────────────────────────────────────────────────

export async function sendRejectionEmail(
  to: string,
  name: string,
  reason?: string,
): Promise<void> {
  if (!isSmtpConfigured()) {
    logger.warn({ to }, "sendRejectionEmail: SMTP not configured — skipped");
    return;
  }
  const { html, text } = buildRejectionEmail(name, reason);
  await send({ to, subject: "Update on Your SAHU CSC Registration", html, text });
}

function buildRejectionEmail(
  name: string,
  reason?: string,
): { html: string; text: string } {
  const reasonBlock = reason
    ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
        <tr>
          <td bgcolor="#1e3a5f" style="background-color:#1e3a5f;border-left:4px solid #ef4444;border-radius:8px;padding:16px 20px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#f87171;">Reason</p>
            <p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.6;">${esc(reason)}</p>
          </td>
        </tr>
      </table>`
    : "";

  const html = buildV2Html({
    title: "Registration Update",
    icon: "📋",
    subtitle: "Account Status Update",
    accentColor: "#ef4444",
    accentText: "#fca5a5",
    accentDark: "#b91c1c",
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:16px;color:#cbd5e1;line-height:1.7;">
        Hi <strong style="color:#ffffff;">${esc(name)}</strong>,
      </p>
      <p style="margin:0 0 24px;font-size:16px;color:#cbd5e1;line-height:1.7;">
        We have reviewed your SAHU CSC registration and are unable to approve it at this time.
      </p>
      ${reasonBlock}
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
        If you believe this is an error or have additional questions, please contact your administrator.
      </p>
    `,
  });
  const text = `Hi ${name},\n\nYour SAHU CSC registration could not be approved at this time.${reason ? `\n\nReason: ${reason}` : ""}\n\nIf you have questions, please contact your administrator.`;
  return { html, text };
}

// ── New registration — admin notification ────────────────────────────────────

export async function sendNewRegistrationAdminEmail(
  adminEmails: string[],
  username: string,
): Promise<void> {
  if (!isSmtpConfigured()) {
    logger.warn("sendNewRegistrationAdminEmail: SMTP not configured — skipped");
    return;
  }
  const html = buildV2Html({
    title: "New Registration",
    icon: "👤",
    subtitle: "Admin Notification",
    accentColor: "#6366f1",
    accentText: "#a5b4fc",
    accentDark: "#4338ca",
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:16px;color:#cbd5e1;line-height:1.7;">
        A new user has registered and is awaiting approval.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
        <tr>
          <td bgcolor="#1e3a5f" style="background-color:#1e3a5f;border-left:4px solid #6366f1;border-radius:8px;padding:16px 20px;">
            <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#a5b4fc;">Username</p>
            <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">${esc(username)}</p>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
        Log in to the admin panel to review and approve or reject this registration.
      </p>
    `,
  });
  const text = `New user registration: @${username} is awaiting approval.\n\nLog in to the admin panel to review this registration.`;
  await Promise.all(
    adminEmails.map((to) =>
      send({ to, subject: "New Registration — Action Required", html, text }),
    ),
  );
}

// ── Broadcast email ───────────────────────────────────────────────────────────

export async function sendBroadcastEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<void> {
  if (!isSmtpConfigured()) {
    logger.warn({ to }, "sendBroadcastEmail: SMTP not configured — skipped");
    return;
  }
  await send({ to, subject, html, text });
}

// ── Admin password reset link ────────────────────────────────────────────────

export async function sendAdminResetLinkEmail(opts: {
  to: string;
  displayName: string;
  username: string;
  resetUrl: string;
  expiresAt: Date;
}): Promise<void> {
  if (!isSmtpConfigured()) {
    logger.warn({ to: opts.to }, "sendAdminResetLinkEmail: SMTP not configured — skipped");
    return;
  }
  const expiresFormatted = opts.expiresAt.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const html = buildV2Html({
    title: "Password Reset",
    icon: "🔑",
    subtitle: "Password Reset Link",
    accentColor: "#f97316",
    accentText: "#fdba74",
    accentDark: "#c2410c",
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:16px;color:#cbd5e1;line-height:1.7;">
        Hi <strong style="color:#ffffff;">${esc(opts.displayName)}</strong>,
      </p>
      <p style="margin:0 0 24px;font-size:16px;color:#cbd5e1;line-height:1.7;">
        Your administrator has generated a password reset link for your account
        <strong style="color:#ffffff;">@${esc(opts.username)}</strong>.
      </p>
      <!-- CTA button -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="#f97316" style="background-color:#f97316;border-radius:8px;padding:14px 32px;">
                  <a href="${esc(opts.resetUrl)}" style="font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;display:block;">
                    Reset My Password
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 16px;font-size:13px;color:#64748b;text-align:center;line-height:1.6;">
        This link expires on <strong style="color:#94a3b8;">${esc(expiresFormatted)} IST</strong>.<br/>
        If the button above doesn't work, copy and paste this URL:
      </p>
      <p style="margin:0;font-size:12px;color:#475569;word-break:break-all;text-align:center;">
        ${esc(opts.resetUrl)}
      </p>
    `,
  });
  const text = `Hi ${opts.displayName},\n\nYour administrator has generated a password reset link for @${opts.username}.\n\nReset link: ${opts.resetUrl}\n\nExpires: ${expiresFormatted} IST\n\nIf you did not request this, please contact your administrator.`;
  await send({
    to: opts.to,
    subject: "Password Reset Link — SAHU CSC",
    html,
    text,
  });
}

// ── Mail option builders (used by queue-client re-exports) ────────────────────

export interface EmailJobData {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
}

export function buildOtpMailOptions(to: string, otp: string): EmailJobData {
  const { html, text } = buildOtpEmail(otp);
  return {
    to,
    from: getFromEmail(),
    subject: "Your SAHU CSC Verification Code",
    html,
    text,
  };
}

export function buildApprovalMailOptions(to: string, name: string): EmailJobData {
  const { html, text } = buildApprovalEmail(name);
  return {
    to,
    from: getFromEmail(),
    subject: "Your SAHU CSC Account Has Been Approved",
    html,
    text,
  };
}

export function buildRejectionMailOptions(
  to: string,
  name: string,
  reason?: string,
): EmailJobData {
  const { html, text } = buildRejectionEmail(name, reason);
  return {
    to,
    from: getFromEmail(),
    subject: "Update on Your SAHU CSC Registration",
    html,
    text,
  };
}
