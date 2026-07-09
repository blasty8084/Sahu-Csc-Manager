import { createTransporter, esc, getFromEmail, buildV2Html } from "../transport";

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
  const fromEmail = getFromEmail();
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
  const fromEmail = getFromEmail();

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
  const fromEmail = getFromEmail();

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
