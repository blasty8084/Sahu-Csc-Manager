/**
 * Email transport — Resend HTTP API.
 *
 * Why Resend instead of Nodemailer SMTP:
 *   Render free tier blocks outbound TCP port 587 (SMTP) entirely.
 *   Resend uses HTTPS port 443 which is always open everywhere.
 *
 * All existing callers (sendOtpEmail, sendApprovalEmail, etc.) continue to work
 * unchanged — only this file changes.
 *
 * Env vars:
 *   RESEND_API_KEY  — from resend.com → API Keys (required for email to work)
 *   RESEND_FROM     — sender address, must be a verified domain or
 *                     onboarding@resend.dev (Resend's free sandbox domain)
 */

import { Resend } from "resend";
import { logger } from "../logger";

// ── Config ────────────────────────────────────────────────────────────────────

const RESEND_API_KEY = process.env["RESEND_API_KEY"];

/**
 * Default from address.
 *
 * IMPORTANT: Until you verify your own domain on resend.com, use:
 *   "SAHU CSC <onboarding@resend.dev>"
 *
 * After verifying your domain (e.g. sahucsc.in), change to:
 *   "SAHU CSC <noreply@sahucsc.in>"
 */
const DEFAULT_FROM = "SAHU CSC <onboarding@resend.dev>";

// ── Client (lazy singleton) ───────────────────────────────────────────────────

let _resend: Resend | null = null;

function getResend(): Resend {
  if (_resend) return _resend;
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  _resend = new Resend(RESEND_API_KEY);
  return _resend;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Returns true when Resend is configured and ready to send emails */
export function isSmtpConfigured(): boolean {
  return !!RESEND_API_KEY;
}

/** Returns the configured From address */
export function getFromEmail(): string {
  return process.env["RESEND_FROM"] ?? process.env["SMTP_FROM_EMAIL"] ?? DEFAULT_FROM;
}

/**
 * Send an email via Resend.
 * Matches the nodemailer sendMail() call signature used by all templates.
 */
export async function sendMail(opts: {
  from?: string;
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const resend = getResend();
  const from = opts.from ?? getFromEmail();
  const to = Array.isArray(opts.to) ? opts.to : [opts.to];

  const { error } = await resend.emails.send({
    from,
    to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

/**
 * Compatibility shim — templates call createTransporter().sendMail(opts).
 * Returns an object with a sendMail method that delegates to Resend.
 */
export function createTransporter() {
  return {
    sendMail: async (opts: {
      from?: string;
      to: string | string[];
      subject: string;
      html: string;
      text: string;
    }) => sendMail(opts),

    /** Verify — used by the SMTP test endpoint. With Resend, just check API key. */
    verify: async () => {
      if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
      // Resend has no verify endpoint — key presence is sufficient
      return true;
    },
  };
}

/** Alias — same as createTransporter() */
export function getTransporter() {
  return createTransporter();
}

// ── HTML builder (unchanged from original) ────────────────────────────────────

/** HTML-escape a string for safe inline use */
export function esc(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Shared V2 email shell — dark navy brand wrapper */
export function buildV2Html(opts: {
  title: string;
  icon: string;
  subtitle: string;
  accentColor: string;
  accentText: string;
  accentDark: string;
  bodyHtml: string;
}): string {
  const { title, icon, subtitle, accentColor, accentText, accentDark, bodyHtml } = opts;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a1628;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a1628;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td bgcolor="#0f2044" style="background-color:#0f2044;border-radius:16px 16px 0 0;padding:28px 32px 24px;text-align:center;border-bottom:2px solid ${accentColor};">
              <p style="margin:0 0 4px;font-size:28px;">${icon}</p>
              <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">SAHU CSC</h1>
              <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.12em;color:${accentText};text-transform:uppercase;">${esc(subtitle)}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td bgcolor="#132040" style="background-color:#132040;padding:32px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#0f2044" style="background-color:#0f2044;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);">
              <p style="margin:0 0 4px;font-size:12px;color:#64748b;">SAHU CSC · Common Service Center · Odisha, India</p>
              <p style="margin:0;font-size:11px;color:#475569;">This is an automated message. Please do not reply.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
