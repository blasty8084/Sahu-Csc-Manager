import nodemailer from "nodemailer";

function createTransporter() {
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

function buildOtpHtml(
  otp: string,
  purpose: "registration" | "password_reset",
  expiresAt: Date
): string {
  const purposeLabel =
    purpose === "registration" ? "Email Verification" : "Password Reset";
  const purposeDesc =
    purpose === "registration"
      ? "You requested to create a SAHU CSC account. Use this OTP to verify your email address."
      : "You requested to reset your SAHU CSC password. Use this OTP to continue.";
  const expiryTime = expiresAt.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const digitCells = otp
    .split("")
    .map(
      (d) =>
        `<td style="width:40px;height:48px;text-align:center;font-size:26px;font-weight:900;color:#111827;background:#ffffff;border:2px solid #e5e7eb;border-radius:8px;font-family:monospace;">${d}</td><td style="width:6px;"></td>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>SAHU CSC — ${purposeLabel}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

        <tr>
          <td style="background:linear-gradient(135deg,#0b2c60 0%,#0f3872 100%);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
            <p style="margin:0;font-size:24px;font-weight:900;letter-spacing:1px;">
              <span style="color:#ffffff;">SAHU&nbsp;</span><span style="color:#f97316;">CSC</span>
            </p>
            <p style="margin:5px 0 0;color:rgba(255,255,255,0.45);font-size:10px;letter-spacing:3px;text-transform:uppercase;">Management Platform</p>
          </td>
        </tr>

        <tr>
          <td style="background:#ffffff;padding:32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            <p style="margin:0 0 6px;font-size:19px;font-weight:700;color:#111827;">${purposeLabel}</p>
            <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.65;">${purposeDesc}</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td align="center" style="background:#fff7ed;border:2px solid rgba(249,115,22,0.25);border-radius:12px;padding:24px 20px;">
                  <p style="margin:0 0 14px;font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:3px;text-transform:uppercase;">Your One-Time Password</p>
                  <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                    <tr>${digitCells}</tr>
                  </table>
                  <p style="margin:16px 0 0;font-size:12px;color:#d97706;">&#9201; Expires at ${expiryTime} &middot; valid for 10&nbsp;minutes</p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;color:#374151;line-height:1.6;">
              Enter this code in the SAHU CSC app to continue.
              <strong>Do not share this code</strong> with anyone — our team will never ask for it.
            </p>
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              If you did not request this, you can safely ignore this email.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">SAHU CSC &middot; Common Service Center &middot; Odisha, India</p>
            <p style="margin:4px 0 0;font-size:11px;color:#d1d5db;">This is an automated message. Please do not reply.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  purpose: "registration" | "password_reset",
  expiresAt: Date
): Promise<void> {
  const transporter = createTransporter();
  const fromEmail =
    process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? "noreply@sahucsc.in";

  const subjects: Record<string, string> = {
    registration: "SAHU CSC — Email Verification Code",
    password_reset: "SAHU CSC — Password Reset Code",
  };

  await transporter.sendMail({
    from: `"SAHU CSC" <${fromEmail}>`,
    to,
    subject: subjects[purpose] ?? "SAHU CSC — One-Time Password",
    html: buildOtpHtml(otp, purpose, expiresAt),
  });
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
}
