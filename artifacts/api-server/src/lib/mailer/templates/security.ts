import { sendMail, esc, getFromEmail, buildV2Html } from "../transport";

interface TwoFaDisabledParams {
  ip?: string;
  device?: string;
  timestamp?: Date;
}

function buildDisabledText(params: TwoFaDisabledParams): string {
  const ts = (params.timestamp ?? new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  return [
    "SAHU CSC — Security Alert",
    "=".repeat(40),
    "",
    "TWO-FACTOR AUTHENTICATION DISABLED",
    "",
    "Two-factor authentication was just turned off on your account.",
    "",
    `Time:   ${ts} IST`,
    `IP:     ${params.ip ?? "Unknown"}`,
    `Device: ${params.device ?? "Unknown"}`,
    "",
    "⚠  If you did NOT do this, contact your administrator immediately",
    "   and re-enable 2FA from your Profile → Security settings.",
    "",
    "-".repeat(40),
    "SAHU CSC · Common Service Center · Odisha, India",
    "This is an automated message. Please do not reply.",
  ].join("\n");
}

function buildDisabledHtml(params: TwoFaDisabledParams): string {
  const ts = (params.timestamp ?? new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const safeIp     = esc(params.ip ?? "Unknown");
  const safeDevice = esc(params.device ?? "Unknown");
  const safeTs     = esc(ts);

  const bodyHtml = `
    <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#ffffff;text-align:center;">
      Two-Factor Authentication Disabled
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#cbd5e1;line-height:1.6;text-align:center;">
      2FA was turned off on your SAHU CSC account.
    </p>

    <!-- Event detail table -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td bgcolor="#0b1e3d" style="background-color:#0b1e3d;border:1px solid rgba(239,68,68,0.4);border-radius:12px;padding:20px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#94a3b8;width:72px;">&#128336; Time</td>
              <td style="padding:6px 0;font-size:13px;color:#ffffff;font-weight:600;">${safeTs} IST</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#94a3b8;">&#127760; IP</td>
              <td style="padding:6px 0;font-size:13px;color:#ffffff;font-weight:600;">${safeIp}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#94a3b8;">&#128187; Device</td>
              <td style="padding:6px 0;font-size:13px;color:#ffffff;font-weight:600;">${safeDevice}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Warning banner -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td bgcolor="#2d0e0e" style="background-color:#2d0e0e;border:1px solid rgba(239,68,68,0.6);border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:14px 16px;">
          <p style="margin:0;font-size:13px;color:#fca5a5;line-height:1.6;">
            <strong style="color:#fecaca;">&#9888;&#65039; If you did not do this:</strong>&nbsp;
            Contact your administrator immediately. Your account may be compromised.
            Re-enable 2FA from <strong style="color:#ffffff;">Profile → Security</strong> settings.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:12px;color:#64748b;text-align:center;line-height:1.6;">
      If this was you, no action is needed. Your account remains accessible.<br/>
      We recommend re-enabling 2FA to keep your account secure.
    </p>`;

  return buildV2Html({
    title: "2FA Disabled",
    icon: "&#128274;",
    subtitle: "Security Alert",
    accentColor: "#ef4444",
    accentText: "#fca5a5",
    accentDark: "#dc2626",
    bodyHtml,
  });
}

export async function send2faDisabledEmail(to: string, params: TwoFaDisabledParams = {}): Promise<void> {
  const fromEmail = getFromEmail();
  await sendMail({
    from: `"SAHU CSC Security" <${fromEmail}>`,
    to,
    subject: "SAHU CSC — Two-Factor Authentication Disabled",
    text: buildDisabledText(params),
    html: buildDisabledHtml(params),
  });
}
