import { createTransporter, esc, getFromEmail, buildV2Html } from "../transport";

// ── Account approved ──────────────────────────────────────────────────────────

export async function sendApprovalEmail(to: string, name: string): Promise<void> {
  const transporter = createTransporter();
  const fromEmail = getFromEmail();

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
