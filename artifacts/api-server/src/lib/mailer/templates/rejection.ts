import { createTransporter, esc, getFromEmail, buildV2Html } from "../transport";

// ── Registration declined ─────────────────────────────────────────────────────

export async function sendRejectionEmail(to: string, name: string, reason: string | null): Promise<void> {
  const transporter = createTransporter();
  const fromEmail = getFromEmail();

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
