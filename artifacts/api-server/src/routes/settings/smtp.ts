/**
 * SMTP settings — read-only from environment variables.
 * Config is set via Replit Secrets / Render env vars, not stored in the DB.
 * The test endpoint sends a real test email when SMTP is configured.
 */
import { Router, type IRouter } from "express";
import { requireRole } from "../../lib/auth";
import { isSmtpConfigured, createTransporter, getFromEmail } from "../../lib/mailer/transport";
import { asyncHandler } from "../../lib/async-handler";

const router: IRouter = Router();

router.get("/settings/smtp", requireRole("admin"), asyncHandler(async (_req, res) => {
  res.json({
    configured: isSmtpConfigured(),
    host: process.env.SMTP_HOST ?? null,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? null,
    fromEmail: process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? null,
    passwordSaved: !!(process.env.SMTP_PASS || process.env.SMTP_PASSWORD),
  });
}));

router.patch("/settings/smtp", requireRole("admin"), asyncHandler(async (_req, res) => {
  res.status(501).json({
    error: "SMTP config is set via environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS). Update them in Replit Secrets or Render dashboard.",
  });
}));

router.post("/settings/smtp/test", requireRole("admin"), asyncHandler(async (req, res) => {
  if (!isSmtpConfigured()) {
    res.status(503).json({
      error: "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in environment secrets.",
    });
    return;
  }

  const testTo = (req.body as { to?: string }).to;
  if (!testTo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testTo)) {
    res.status(400).json({ error: "Provide a valid 'to' email address in the request body." });
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: getFromEmail(),
      to: testTo,
      subject: "SAHU CSC — SMTP Test",
      text: "This is a test email from your SAHU CSC platform. SMTP is working correctly.",
      html: "<p style='font-family:sans-serif;'>This is a test email from your <strong>SAHU CSC</strong> platform. SMTP is working correctly ✅</p>",
    });
    res.json({ success: true, message: `Test email sent to ${testTo}` });
  } catch (err: any) {
    res.status(500).json({ error: `SMTP error: ${err.message}` });
  }
}));

export default router;
