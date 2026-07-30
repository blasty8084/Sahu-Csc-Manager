import { Router, type IRouter } from "express";
import { requireRole } from "../../lib/auth";
import { asyncHandler } from "../../lib/async-handler";
import { isSmtpConfigured, getTransporter } from "../../lib/mailer/transport";

const router: IRouter = Router();

router.get("/settings/smtp", requireRole("admin"), asyncHandler(async (_req, res) => {
  res.json({
    configured: isSmtpConfigured(),
    host: process.env["SMTP_HOST"] ?? null,
    port: Number(process.env["SMTP_PORT"] ?? 587),
    user: process.env["SMTP_USER"] ?? null,
    fromEmail: process.env["SMTP_FROM_EMAIL"] ?? null,
    passwordSaved: !!(process.env["SMTP_PASSWORD"] ?? process.env["SMTP_PASS"]),
  });
}));

router.patch("/settings/smtp", requireRole("admin"), asyncHandler(async (_req, res) => {
  res.status(501).json({ error: "SMTP credentials are managed via Replit Secrets (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD). Restart the server after updating them." });
}));

router.post("/settings/smtp/test", requireRole("admin"), asyncHandler(async (req, res) => {
  if (!isSmtpConfigured()) {
    res.status(503).json({
      error: "SMTP not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in Replit Secrets, then restart the API Server.",
    });
    return;
  }

  const to = (req.body as any)?.to ?? process.env["SMTP_USER"];
  if (!to) {
    res.status(400).json({ error: "Provide a 'to' email address in the request body." });
    return;
  }

  try {
    const transporter = getTransporter();
    const from = process.env["SMTP_FROM_EMAIL"] ?? `SAHU CSC <${process.env["SMTP_USER"]}>`;
    await transporter.sendMail({
      from,
      to,
      subject: "SAHU CSC — SMTP test",
      text: "This is a test email from SAHU CSC. SMTP is configured correctly.",
      html: "<p>This is a test email from <strong>SAHU CSC</strong>. SMTP is configured correctly ✅</p>",
    });
    res.json({ success: true, message: `Test email sent to ${to}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}));

export default router;
