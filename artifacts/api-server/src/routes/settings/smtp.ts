import { Router, type IRouter } from "express";
import { requireRole } from "../../lib/auth";
import { asyncHandler } from "../../lib/async-handler";
import { isSmtpConfigured, getFromEmail, sendMail } from "../../lib/mailer/transport";

const router: IRouter = Router();

// GET /api/settings/smtp — returns current email config status
router.get("/settings/smtp", requireRole("admin"), asyncHandler(async (_req, res) => {
  res.json({
    configured: isSmtpConfigured(),
    provider: "resend",
    fromEmail: getFromEmail(),
    apiKeySaved: !!process.env["RESEND_API_KEY"],
  });
}));

router.patch("/settings/smtp", requireRole("admin"), asyncHandler(async (_req, res) => {
  res.status(501).json({ error: "Email is configured via environment variables, not the API." });
}));

// POST /api/settings/smtp/test — send a test email
router.post("/settings/smtp/test", requireRole("admin"), asyncHandler(async (req, res) => {
  if (!isSmtpConfigured()) {
    res.status(400).json({
      error: "Resend is not configured. Add RESEND_API_KEY to your environment variables.",
    });
    return;
  }

  const to: string = (req.body?.to as string) || "";
  if (!to) {
    res.status(400).json({ error: "No recipient email found. Pass { to: 'email@example.com' } in request body." });
    return;
  }

  try {
    await sendMail({
      to,
      subject: "SAHU CSC — Email test ✅",
      text: "This is a test email from your SAHU CSC installation. Resend is working correctly.",
      html: "<p>This is a test email from your <strong>SAHU CSC</strong> installation.</p><p>✅ Resend is working correctly.</p>",
    });
    res.json({ ok: true, message: `Test email sent to ${to}` });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message ?? "Email test failed" });
  }
}));

export default router;
