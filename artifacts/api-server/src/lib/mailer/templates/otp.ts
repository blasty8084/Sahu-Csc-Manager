import { createTransporter, esc, getFromEmail, buildV2Html } from "../transport";

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

  // V2 accent colours
  const accentColor = isReset ? "#f59e0b" : "#10b981";
  const accentText  = isReset ? "#fbbf24" : "#34d399";
  const accentDark  = isReset ? "#d97706" : "#059669";
  const accentBorder = isReset ? "rgba(245,158,11,0.5)" : "rgba(16,185,129,0.5)";

  const icon     = isReset ? "&#128273;" : "&#9989;";
  const subtitle = isReset ? "Password Reset" : "Email Verification";
  const heading  = isReset ? "Reset Your Password" : "Verify Your Email";
  const desc     = isReset
    ? "Use the code below to reset your password. It expires in <strong style=\"color:#ffffff;\">10 minutes</strong> and can only be used once."
    : "Enter the code below in the SAHU CSC app to verify your email. It expires in <strong style=\"color:#ffffff;\">10 minutes</strong>.";
  const secNote  = isReset
    ? "Didn't request this? Ignore this email — your password stays unchanged."
    : "Never share this code. Our team will never ask for it.";

  const expiryTime = expiresAt.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Sanitise OTP — only digits are valid; reject anything else
  const safeOtp = /^\d+$/.test(otp) ? esc(otp) : "------";
  const digits = safeOtp.split("");
  const digitCells = digits
    .map(
      (d) =>
        `<td style="padding:0 4px;">` +
        `<div style="width:48px;height:56px;line-height:56px;text-align:center;` +
        `font-size:28px;font-weight:900;color:#ffffff;` +
        `background-color:#0b1e3d;border:1px solid ${accentBorder};` +
        `border-radius:8px;font-family:'Courier New',Courier,monospace;display:inline-block;">` +
        `${d}</div></td>`
    )
    .join("");

  const bodyHtml = `
    <!-- Heading -->
    <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#ffffff;text-align:center;">${heading}</h2>
    <p style="margin:0 0 28px;font-size:15px;color:#cbd5e1;line-height:1.6;text-align:center;">${desc}</p>

    <!-- OTP digit box -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
      <tr>
        <td bgcolor="#0b1e3d" style="background-color:#0b1e3d;border:1px dashed ${accentColor};border-radius:12px 12px 0 0;padding:28px 16px 20px;text-align:center;">
          <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
            <tr>${digitCells}</tr>
          </table>
        </td>
      </tr>
      <!-- Copy strip -->
      <tr>
        <td bgcolor="#0f2a1e" style="background-color:${isReset ? "#1f1a0d" : "#0f2a1e"};border:1px solid ${accentColor};border-top:none;border-radius:0 0 12px 12px;padding:10px 16px;text-align:center;">
          <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.06em;color:${accentText};text-transform:uppercase;">&#128203;&nbsp; Copy this code</p>
          <p style="margin:4px 0 0;font-size:22px;font-weight:900;letter-spacing:0.25em;color:#ffffff;font-family:'Courier New',Courier,monospace;">${safeOtp}</p>
        </td>
      </tr>
    </table>

    <!-- Expiry pill -->
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
      <tr>
        <td style="border:1px solid ${accentColor};border-radius:999px;padding:6px 18px;text-align:center;">
          <p style="margin:0;font-size:13px;font-weight:600;color:${accentColor};">&#9201;&nbsp; Expires at ${expiryTime} &bull; valid for 10 minutes</p>
        </td>
      </tr>
    </table>

    <!-- Security note -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td bgcolor="#0b1e3d" style="background-color:#0b1e3d;border-left:4px solid ${accentColor};border-radius:0 8px 8px 0;padding:14px 16px;">
          <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
            <strong style="color:#ffffff;">Security Note:</strong>&nbsp;${secNote}
          </p>
        </td>
      </tr>
    </table>`;

  return buildV2Html({
    title: subtitle,
    icon,
    subtitle,
    accentColor,
    accentText,
    accentDark,
    bodyHtml,
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Build mail options without sending — used by the queue-client for async dispatch. */
export function buildOtpMailOptions(
  to: string,
  otp: string,
  purpose: "registration" | "password_reset",
  expiresAt: Date,
): { to: string; from: string; subject: string; html: string; text: string } {
  const fromEmail = getFromEmail();

  const subjects: Record<string, string> = {
    registration: "SAHU CSC — Your Email Verification Code",
    password_reset: "SAHU CSC — Your Password Reset Code",
  };

  return {
    from: `"SAHU CSC" <${fromEmail}>`,
    to,
    subject: subjects[purpose] ?? "SAHU CSC — One-Time Password",
    text: buildOtpText(otp, purpose, expiresAt),
    html: buildOtpHtml(otp, purpose, expiresAt),
  };
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  purpose: "registration" | "password_reset",
  expiresAt: Date
): Promise<void> {
  const opts = buildOtpMailOptions(to, otp, purpose, expiresAt);
  const transporter = createTransporter();
  await transporter.sendMail(opts);
}
