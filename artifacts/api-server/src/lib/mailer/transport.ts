import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { resolve4 } from "node:dns/promises";

let _transporter: Transporter | null = null;
let _transporterPromise: Promise<Transporter> | null = null;

export function isSmtpConfigured(): boolean {
  return !!(
    process.env["SMTP_HOST"] &&
    process.env["SMTP_USER"] &&
    (process.env["SMTP_PASSWORD"] ?? process.env["SMTP_PASS"])
  );
}

/**
 * Returns (and lazily creates) the singleton Nodemailer transporter.
 *
 * Nodemailer 9 explicitly resolves both IPv4 and IPv6 addresses and then
 * chooses one, so Node's `ipv4first` DNS preference is not sufficient.
 * Resolve the hostname to a concrete IPv4 address before handing it to
 * Nodemailer. Keep the original hostname as TLS servername for certificate
 * validation.
 */
export async function getTransporter(): Promise<Transporter> {
  if (_transporter) return _transporter;
  if (!isSmtpConfigured()) throw new Error("SMTP not configured");

  if (_transporterPromise) return _transporterPromise;

  _transporterPromise = (async () => {
    const smtpHost = process.env["SMTP_HOST"]!;
    let smtpIpv4 = smtpHost;
    try {
      smtpIpv4 = (await resolve4(smtpHost))[0] ?? smtpHost;
    } catch {
      // If SMTP_HOST is already an IP, or DNS is temporarily unavailable,
      // let Nodemailer report the connection error with its normal diagnostics.
    }

    const transporter = nodemailer.createTransport({
      host: smtpIpv4,
      port: Number(process.env["SMTP_PORT"] ?? 587),
      secure: false,
      requireTLS: true,
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 30_000,
      tls: { servername: smtpHost },
      auth: {
        user: process.env["SMTP_USER"]!,
        pass: (process.env["SMTP_PASSWORD"] ?? process.env["SMTP_PASS"])!,
      },
    });
    _transporter = transporter;
    return transporter;
  })();

  try {
    return await _transporterPromise;
  } finally {
    _transporterPromise = null;
  }
}

/** Alias used by template files */
export async function createTransporter(): Promise<Transporter> {
  return getTransporter();
}

/** Returns the configured From address */
export function getFromEmail(): string {
  return (
    process.env["SMTP_FROM_EMAIL"] ??
    `SAHU CSC <${process.env["SMTP_USER"] ?? "noreply@sahucsc.in"}>`
  );
}

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
