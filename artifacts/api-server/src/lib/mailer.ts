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

function buildOtpText(
  otp: string,
  purpose: "registration" | "password_reset",
  expiresAt: Date
): string {
  const purposeLabel =
    purpose === "registration" ? "Email Verification" : "Password Reset";
  const purposeDesc =
    purpose === "registration"
      ? "You requested to create a SAHU CSC account. Use the OTP below to verify your email address."
      : "You requested to reset your SAHU CSC password. Use the OTP below to continue.";
  const expiryTime = expiresAt.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return [
    "SAHU CSC — Management Platform",
    "=".repeat(40),
    "",
    `${purposeLabel.toUpperCase()}`,
    "",
    purposeDesc,
    "",
    "Your One-Time Password:",
    "",
    `    ${otp}`,
    "",
    `This code expires at ${expiryTime} (valid for 10 minutes).`,
    "",
    "Enter this code in the SAHU CSC app to continue.",
    "Do NOT share this code with anyone. Our team will never ask for it.",
    "",
    "If you did not request this, you can safely ignore this email.",
    "",
    "-".repeat(40),
    "SAHU CSC · Common Service Center · Odisha, India",
    "This is an automated message. Please do not reply.",
  ].join("\n");
}

function buildOtpHtml(
  otp: string,
  purpose: "registration" | "password_reset",
  expiresAt: Date
): string {
  const isReset = purpose === "password_reset";
  const purposeLabel = isReset ? "Password Reset" : "Email Verification";
  const purposeDesc = isReset
    ? "We received a request to reset your SAHU CSC account password. Use the one-time password below to continue."
    : "Welcome to SAHU CSC! Use the one-time password below to verify your email address and activate your account.";
  const iconChar = isReset ? "&#128274;" : "&#9989;";
  const accentColor = isReset ? "#f97316" : "#16a34a";
  const accentLight = isReset ? "#fff7ed" : "#f0fdf4";
  const accentBorder = isReset ? "rgba(249,115,22,0.3)" : "rgba(22,163,74,0.3)";

  const expiryTime = expiresAt.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const digits = otp.split("");
  const digitCells = digits
    .map(
      (d) =>
        `<td style="padding:0 4px;">` +
        `<div style="width:46px;height:56px;line-height:56px;text-align:center;` +
        `font-size:28px;font-weight:900;color:#0b2c60;` +
        `background:#ffffff;border:2.5px solid #cbd5e1;` +
        `border-radius:10px;border-bottom:4px solid #94a3b8;` +
        `font-family:Courier New,Courier,monospace;display:inline-block;">` +
        `${d}</div></td>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>SAHU CSC &mdash; ${purposeLabel}</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef2f7;padding:40px 16px 60px;">
  <tr>
    <td align="center">

      <!-- Card -->
      <table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">

        <!-- ── Header banner ── -->
        <tr>
          <td style="border-radius:18px 18px 0 0;overflow:hidden;background:#0b2c60;padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:#0b2c60;padding:32px 36px 28px;text-align:center;">
                  <!-- Logo area -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
                    <tr>
                      <td style="background:rgba(255,255,255,0.08);border-radius:50%;width:64px;height:64px;text-align:center;vertical-align:middle;">
                        <span style="font-size:30px;line-height:64px;">${iconChar}</span>
                      </td>
                    </tr>
                  </table>
                  <!-- Brand -->
                  <p style="margin:0;font-size:26px;font-weight:900;letter-spacing:1px;line-height:1;">
                    <span style="color:#ffffff;">SAHU&nbsp;</span><span style="color:${accentColor};">CSC</span>
                  </p>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:4px;text-transform:uppercase;">Management Platform &bull; Odisha</p>
                  <!-- Divider stripe -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin:20px auto 0;">
                    <tr>
                      <td style="width:40px;height:3px;background:rgba(249,115,22,1);border-radius:99px;"></td>
                      <td style="width:6px;"></td>
                      <td style="width:18px;height:3px;background:rgba(255,255,255,0.2);border-radius:99px;"></td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Purpose badge strip -->
              <tr>
                <td style="background:${accentColor};padding:10px 36px;text-align:center;">
                  <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#ffffff;">${purposeLabel}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Body ── -->
        <tr>
          <td style="background:#ffffff;padding:36px 36px 28px;border-left:1px solid #dde3ec;border-right:1px solid #dde3ec;">
            <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0b1a3a;">Hi there!</p>
            <p style="margin:0 0 28px;font-size:14px;color:#4b5563;line-height:1.7;">${purposeDesc}</p>

            <!-- OTP box -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:${accentLight};border:2px solid ${accentBorder};border-radius:14px;padding:28px 20px;text-align:center;">
                  <p style="margin:0 0 18px;font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#9ca3af;">Your One-Time Password</p>
                  <!-- Digit boxes -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                    <tr>${digitCells}</tr>
                  </table>
                  <!-- Expiry -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin:20px auto 0;">
                    <tr>
                      <td style="background:${accentColor};border-radius:99px;padding:6px 18px;">
                        <p style="margin:0;font-size:12px;font-weight:600;color:#ffffff;">&#9201;&nbsp; Expires at ${expiryTime} &bull; valid for 10 minutes</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Security notice -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
              <tr>
                <td style="background:#f8fafc;border-left:4px solid ${accentColor};border-radius:0 8px 8px 0;padding:14px 16px;">
                  <p style="margin:0;font-size:12px;color:#374151;line-height:1.6;">
                    <strong style="color:#0b1a3a;">&#128274; Security Notice:</strong>&nbsp;
                    Enter this code in the SAHU CSC app. <strong>Never share this code</strong> with anyone &mdash; our team will <em>never</em> ask for it.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              If you did not request this code, you can safely ignore this email. No changes have been made to your account.
            </p>
          </td>
        </tr>

        <!-- ── Footer ── -->
        <tr>
          <td style="background:#f1f5f9;border:1px solid #dde3ec;border-top:none;border-radius:0 0 18px 18px;padding:20px 36px;text-align:center;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 10px;">
              <tr>
                <td style="width:28px;height:2px;background:#0b2c60;border-radius:99px;"></td>
                <td style="width:6px;"></td>
                <td style="width:12px;height:2px;background:${accentColor};border-radius:99px;"></td>
              </tr>
            </table>
            <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#64748b;">SAHU CSC &bull; Common Service Center &bull; Odisha, India</p>
            <p style="margin:0;font-size:10px;color:#94a3b8;">This is an automated message. Please do not reply to this email.</p>
          </td>
        </tr>

      </table>
      <!-- /Card -->

    </td>
  </tr>
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
    registration: "SAHU CSC — Your Email Verification Code",
    password_reset: "SAHU CSC — Your Password Reset Code",
  };

  await transporter.sendMail({
    from: `"SAHU CSC" <${fromEmail}>`,
    to,
    subject: subjects[purpose] ?? "SAHU CSC — One-Time Password",
    text: buildOtpText(otp, purpose, expiresAt),
    html: buildOtpHtml(otp, purpose, expiresAt),
  });
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
}
