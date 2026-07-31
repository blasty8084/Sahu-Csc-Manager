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
  res.status(501).json({ error: "SMTP is configured via environment variables, not the API." });
}));

router.post("/settings/smtp/test", requireRole("admin"), asyncHandler(async (req, res) => {
  if (!isSmtpConfigured()) {
    res.status(400).json({ error: "SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD." });
    return;
  }

  const to: string = (req.body?.to as string) || process.env["SMTP_USER"]!;

  try {
    const transporter = await getTransporter();
    // Verify the connection first
    await transporter.verify();
    // Send a real test email
    await transporter.sendMail({
      from: process.env["SMTP_FROM_EMAIL"] ?? `SAHU CSC <${process.env["SMTP_USER"]}>`,
      to,
      subject: "SAHU CSC — SMTP test email",
      text: "This is a test email from your SAHU CSC installation. SMTP is working correctly.",
      html: "<p>This is a test email from your <strong>SAHU CSC</strong> installation.</p><p>✅ SMTP is working correctly.</p>",
    });
    res.json({ ok: true, message: `Test email sent to ${to}` });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message ?? "SMTP test failed" });
  }
}));

export default router;
