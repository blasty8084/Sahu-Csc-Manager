import nodemailer from "nodemailer";

/** Escape user-controlled strings before interpolating into HTML email templates. */
function esc(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

// ── V2 Dark Premium HTML helpers ───────────────────────────────────────────────

/**
 * Shared dark-card email wrapper.
 * Produces an email-client-safe table layout matching the V2 "Modern Dark Premium" design.
 */
function buildV2Html(opts: {
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

// ── OTP email ─────────────────────────────────────────────────────────────────

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

// ── Account approved ──────────────────────────────────────────────────────────

export async function sendApprovalEmail(to: string, name: string): Promise<void> {
  const transporter = createTransporter();
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? "noreply@sahucsc.in";

  const displayName = name || to.split("@")[0];
  const safeDisplayName = esc(displayName);

  const bodyHtml = `
    <h2 style="margin:0 0 20px;font-size:28px;font-weight:700;color:#ffffff;text-align:center;">Account Approved</h2>
    <p style="margin:0 0 24px;font-size:16px;color:#e2e8f0;line-height:1.6;text-align:center;">
      Hi <strong>${safeDisplayName}</strong>, great news! Your SAHU CSC account is now active and ready to use.
    </p>

    <!-- Info box -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td bgcolor="#13284f" style="background-color:#13284f;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:24px;text-align:center;">
          <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.6;">
            You can now log in and access all platform features, track applications, and manage operator services.
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA button area -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td bgcolor="#10b981" style="background-color:#10b981;border-radius:999px;padding:14px 32px;">
                <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff;">Open SAHU CSC &rarr;</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

  await transporter.sendMail({
    from: `"SAHU CSC" <${fromEmail}>`,
    to,
    subject: "SAHU CSC — Your account has been approved ✅",
    html: buildV2Html({
      title: "Account Approved",
      icon: "&#9989;",
      subtitle: "Status Update",
      accentColor: "#10b981",
      accentText: "#34d399",
      accentDark: "#059669",
      bodyHtml,
    }),
    text: [
      "SAHU CSC — Management Platform",
      "=".repeat(40),
      "",
      "ACCOUNT APPROVED",
      "",
      `Hi ${displayName},`,
      "",
      "Your SAHU CSC account has been approved. You can now log in to the platform.",
      "",
      "Open the SAHU CSC app and log in with your registered credentials.",
      "",
      "-".repeat(40),
      "SAHU CSC · Common Service Center · Odisha, India",
      "This is an automated message. Please do not reply.",
    ].join("\n"),
  });
}

// ── Registration declined ─────────────────────────────────────────────────────

export async function sendRejectionEmail(to: string, name: string, reason: string | null): Promise<void> {
  const transporter = createTransporter();
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? "noreply@sahucsc.in";

  const displayName = name || to.split("@")[0];
  const safeDisplayName = esc(displayName);

  const reasonBlock = reason
    ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
        <tr>
          <td bgcolor="#0b1e3d" style="background-color:#0b1e3d;border-left:4px solid #f43f5e;border-radius:0 8px 8px 0;padding:18px 20px;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">Reason provided</p>
            <p style="margin:0;font-size:14px;color:#ffffff;line-height:1.6;">${esc(reason)}</p>
          </td>
        </tr>
      </table>`
    : "";

  const bodyHtml = `
    <h2 style="margin:0 0 20px;font-size:22px;font-weight:600;color:#ffffff;text-align:center;">Registration Not Approved</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#cbd5e1;line-height:1.6;">
      Hi <strong>${safeDisplayName}</strong>,<br/><br/>
      Thank you for applying to join the SAHU CSC platform. We have reviewed your application, but we could not approve your registration request at this time.
    </p>

    ${reasonBlock}

    <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;text-align:center;">
      If you believe this was an error, please contact your SAHU CSC administrator directly.
    </p>`;

  await transporter.sendMail({
    from: `"SAHU CSC" <${fromEmail}>`,
    to,
    subject: "SAHU CSC — Registration request update",
    html: buildV2Html({
      title: "Registration Declined",
      icon: "&#10060;",
      subtitle: "Status Update",
      accentColor: "#f43f5e",
      accentText: "#fb7185",
      accentDark: "#e11d48",
      bodyHtml,
    }),
    text: [
      "SAHU CSC — Management Platform",
      "=".repeat(40),
      "",
      "REGISTRATION DECLINED",
      "",
      `Hi ${displayName},`,
      "",
      "We're sorry — your SAHU CSC registration request has been declined.",
      ...(reason ? ["", `Reason: ${reason}`] : []),
      "",
      "If you believe this is a mistake, please contact your SAHU CSC administrator.",
      "",
      "-".repeat(40),
      "SAHU CSC · Common Service Center · Odisha, India",
      "This is an automated message. Please do not reply.",
    ].join("\n"),
  });
}

// ── Admin new-registration alert ──────────────────────────────────────────────

export async function sendNewRegistrationAdminEmail(opts: {
  adminEmail: string;
  adminName: string;
  applicantUsername: string;
  applicantFullName: string | null;
  applicantEmail: string;
  submittedAt: Date;
}): Promise<void> {
  const transporter = createTransporter();
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? "noreply@sahucsc.in";
  const { adminEmail, adminName, applicantUsername, applicantFullName, applicantEmail, submittedAt } = opts;

  const displayApplicant = applicantFullName ? `${applicantFullName} (@${applicantUsername})` : `@${applicantUsername}`;
  const timeStr = submittedAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const safeAdminName      = esc(adminName);
  const safeDisplayApplicant = esc(displayApplicant);
  const safeApplicantEmail = esc(applicantEmail);
  const safeTimeStr        = esc(timeStr);

  const bodyHtml = `
    <h2 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#ffffff;text-align:center;">New Registration Request</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#cbd5e1;line-height:1.6;text-align:center;">
      Hi <strong>${safeAdminName}</strong>, a new operator account request has been submitted and is waiting for your review.
    </p>

    <!-- Applicant card -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td bgcolor="#13284f" style="background-color:#13284f;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px 24px;">
          <!-- Applicant row -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.06);">
            <tr>
              <td style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#7dd3fc;vertical-align:top;padding-right:12px;white-space:nowrap;">Applicant</td>
              <td style="font-size:15px;color:#ffffff;text-align:right;">${safeDisplayApplicant}</td>
            </tr>
          </table>
          <!-- Email row -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.06);">
            <tr>
              <td style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#7dd3fc;vertical-align:middle;padding-right:12px;white-space:nowrap;">Email</td>
              <td style="font-size:14px;color:#ffffff;text-align:right;">${safeApplicantEmail}</td>
            </tr>
          </table>
          <!-- Submitted row -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#7dd3fc;vertical-align:middle;padding-right:12px;white-space:nowrap;">Submitted</td>
              <td style="font-size:14px;color:#ffffff;text-align:right;">${safeTimeStr}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Action note -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="border:2px solid #38bdf8;border-radius:999px;padding:10px 24px;">
                <p style="margin:0;font-size:14px;font-weight:600;color:#38bdf8;">Review in Dashboard &rarr;</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#64748b;text-align:center;">
      This is an automated administrative notification. You will receive one alert per new registration request.
    </p>`;

  await transporter.sendMail({
    from: `"SAHU CSC" <${fromEmail}>`,
    to: adminEmail,
    subject: `SAHU CSC — New registration request from @${applicantUsername}`,
    html: buildV2Html({
      title: "New Registration Request",
      icon: "&#128276;",
      subtitle: "Admin Alert",
      accentColor: "#38bdf8",
      accentText: "#7dd3fc",
      accentDark: "#0284c7",
      bodyHtml,
    }),
    text: [
      "SAHU CSC — Management Platform",
      "=".repeat(40),
      "",
      "NEW REGISTRATION REQUEST — ACTION REQUIRED",
      "",
      `Hi ${adminName},`,
      "",
      "A new registration request is waiting for your review.",
      "",
      `Applicant : ${displayApplicant}`,
      `Email     : ${applicantEmail}`,
      `Submitted : ${timeStr}`,
      "",
      "Log in to SAHU CSC and go to User Management → Pending to approve or decline.",
      "",
      "-".repeat(40),
      "SAHU CSC · Common Service Center · Odisha, India",
      "This is an automated message. Please do not reply.",
    ].join("\n"),
  });
}

// ── Admin broadcast ───────────────────────────────────────────────────────────

export async function sendBroadcastEmail(opts: {
  subject: string;
  body: string;
  recipients: Array<{ email: string; fullName: string | null; username: string }>;
}): Promise<{ sent: number; failed: number }> {
  const { subject, body, recipients } = opts;
  const transporter = createTransporter();
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? "noreply@sahucsc.in";

  const bodyHtml = `
    <h2 style="margin:0 0 24px;font-size:22px;font-weight:600;color:#ffffff;text-align:center;">Message from Admin</h2>

    <!-- Message body card -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td bgcolor="#13284f" style="background-color:#13284f;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:24px 28px;">
          <div style="font-size:15px;color:#ffffff;line-height:1.7;white-space:pre-wrap;">${esc(body).replace(/\n/g, "<br/>")}</div>
        </td>
      </tr>
    </table>

    <!-- Divider -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
      <tr><td style="border-top:1px solid rgba(255,255,255,0.08);font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>

    <p style="margin:0;font-size:13px;color:#64748b;text-align:center;">
      Sent by your administrator to all active platform users.
    </p>`;

  const htmlContent = buildV2Html({
    title: "Admin Broadcast",
    icon: "&#128226;",
    subtitle: "Platform Announcement",
    accentColor: "#a78bfa",
    accentText: "#c4b5fd",
    accentDark: "#8b5cf6",
    bodyHtml,
  });

  const textContent = [
    "SAHU CSC — Management Platform",
    "=".repeat(40),
    "",
    "MESSAGE FROM ADMIN",
    "",
    body,
    "",
    "-".repeat(40),
    "SAHU CSC · Common Service Center · Odisha, India",
    "This is an automated message. Please do not reply.",
  ].join("\n");

  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    recipients.map(async (r) => {
      try {
        await transporter.sendMail({
          from: `"SAHU CSC" <${fromEmail}>`,
          to: r.email,
          subject,
          html: htmlContent,
          text: textContent,
        });
        sent++;
      } catch {
        failed++;
      }
    })
  );

  return { sent, failed };
}

// ── Admin-generated password reset link ───────────────────────────────────────

export async function sendAdminResetLinkEmail(opts: {
  to: string;
  displayName: string;
  username: string;
  resetUrl: string;
  expiresAt: Date;
}): Promise<void> {
  const { to, displayName, username, resetUrl, expiresAt } = opts;
  const transporter = createTransporter();
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? "noreply@sahucsc.in";

  const expiryTime = expiresAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const name = displayName || username;
  const safeName     = esc(name);
  const safeUsername = esc(username);
  const safeExpiry   = esc(expiryTime);
  const safeResetUrl = esc(resetUrl); // href attribute escaping

  const bodyHtml = `
    <h2 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#ffffff;text-align:center;">Password Reset Link</h2>
    <p style="margin:0 0 28px;font-size:15px;color:#cbd5e1;line-height:1.6;text-align:center;">
      Hi <strong>${safeName}</strong>, your administrator has initiated a password reset for your account
      <strong style="color:#ffffff;">@${safeUsername}</strong>.
      Click the button below to set a new password.
    </p>

    <!-- CTA button -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
      <tr>
        <td bgcolor="#f59e0b" style="background-color:#f59e0b;border-radius:12px;">
          <a href="${safeResetUrl}" style="display:block;padding:16px 32px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;text-align:center;border-radius:12px;">
            &#128274;&nbsp; Reset My Password &rarr;
          </a>
        </td>
      </tr>
    </table>

    <!-- Expiry warning -->
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
      <tr>
        <td style="background-color:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:8px 16px;text-align:center;">
          <p style="margin:0;font-size:12px;font-weight:600;color:#fbbf24;">
            &#9888;&#65039;&nbsp; Single-use &bull; Expires at ${safeExpiry} (2 hours) &bull; Do not share
          </p>
        </td>
      </tr>
    </table>

    <!-- Security note -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td bgcolor="#0b1e3d" style="background-color:#0b1e3d;border-radius:8px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
            If you did not request this, please contact your administrator immediately. This link is unique to your account.
          </p>
        </td>
      </tr>
    </table>`;

  await transporter.sendMail({
    from: `"SAHU CSC" <${fromEmail}>`,
    to,
    subject: "SAHU CSC — Your password reset link",
    html: buildV2Html({
      title: "Password Reset Link",
      icon: "&#128273;",
      subtitle: "Admin Action",
      accentColor: "#f59e0b",
      accentText: "#fbbf24",
      accentDark: "#d97706",
      bodyHtml,
    }),
    text: [
      "SAHU CSC — Management Platform",
      "=".repeat(40),
      "",
      "ADMIN-GENERATED PASSWORD RESET LINK",
      "",
      `Hi ${name},`,
      "",
      `Your administrator has generated a secure, one-time password reset link for @${username}.`,
      "",
      "Click the link below to set a new password:",
      "",
      resetUrl,
      "",
      `This link expires at ${expiryTime}. It is single-use — do NOT share it with anyone.`,
      "",
      "If you did not request this, contact your administrator immediately.",
      "",
      "-".repeat(40),
      "SAHU CSC · Common Service Center · Odisha, India",
      "This is an automated message. Please do not reply.",
    ].join("\n"),
  });
}
