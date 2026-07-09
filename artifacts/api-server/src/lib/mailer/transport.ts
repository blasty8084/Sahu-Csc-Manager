import nodemailer from "nodemailer";

/** Escape user-controlled strings before interpolating into HTML email templates. */
export function esc(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP configuration incomplete. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in Secrets."
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
}

export function getFromEmail(): string {
  return process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? "noreply@sahucsc.in";
}

// ── V2 Dark Premium HTML helpers ───────────────────────────────────────────────

/**
 * Shared dark-card email wrapper.
 * Produces an email-client-safe table layout matching the V2 "Modern Dark Premium" design.
 */
export function buildV2Html(opts: {
  title: string;
  icon: string;         // emoji or HTML entity
  subtitle: string;     // uppercase label under brand name
  accentColor: string;  // e.g. "#10b981"
  accentText: string;   // lighter tint for subtitle text e.g. "#34d399"
  accentDark: string;   // darker shade for icon badge gradient start e.g. "#059669"
  bodyHtml: string;
}): string {
  const { title, icon, subtitle, accentColor, accentText, accentDark, bodyHtml } = opts;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>SAHU CSC &mdash; ${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a1628;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a1628" style="background-color:#0a1628;padding:40px 16px 60px;">
  <tr>
    <td align="center">

      <!-- ── Email card ── -->
      <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

        <!-- Accent top strip -->
        <tr>
          <td bgcolor="${accentColor}" style="background-color:${accentColor};height:4px;font-size:0;line-height:0;border-radius:16px 16px 0 0;">&nbsp;</td>
        </tr>

        <!-- Header -->
        <tr>
          <td bgcolor="#0f2244" style="background-color:#0f2244;padding:36px 32px 28px;text-align:center;border-left:1px solid rgba(255,255,255,0.08);border-right:1px solid rgba(255,255,255,0.08);">
            <!-- Icon badge -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
              <tr>
                <td bgcolor="${accentDark}" style="background-color:${accentDark};border-radius:50%;width:64px;height:64px;text-align:center;vertical-align:middle;">
                  <span style="font-size:30px;line-height:64px;display:block;">${icon}</span>
                </td>
              </tr>
            </table>
            <!-- Brand -->
            <p style="margin:0 0 8px;font-size:24px;font-weight:900;letter-spacing:1px;color:#ffffff;">SAHU CSC</p>
            <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${accentText};">${subtitle}</p>
          </td>
        </tr>

        <!-- Hairline divider -->
        <tr>
          <td bgcolor="#0f2244" style="background-color:#0f2244;border-left:1px solid rgba(255,255,255,0.08);border-right:1px solid rgba(255,255,255,0.08);">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-top:1px solid rgba(255,255,255,0.08);font-size:0;line-height:0;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td bgcolor="#0f2244" style="background-color:#0f2244;padding:32px 32px 40px;border-left:1px solid rgba(255,255,255,0.08);border-right:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08);border-radius:0 0 16px 16px;">
            ${bodyHtml}
          </td>
        </tr>

      </table>
      <!-- /card -->

      <!-- Footer -->
      <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;margin-top:24px;">
        <tr>
          <td style="text-align:center;padding:0 16px;">
            <p style="margin:0;font-size:13px;color:#475569;">
              &copy; SAHU CSC Platform, Odisha &bull; Automated message &mdash; please do not reply.
            </p>
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>

</body>
</html>`;
}
