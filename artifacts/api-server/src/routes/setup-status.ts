import { Router, type IRouter } from "express";
import { isSmtpConfigured } from "../lib/mailer";

const router: IRouter = Router();

router.get("/setup-status", (_req, res) => {
  const missing: { key: string; label: string; description: string }[] = [];

  if (!process.env.SESSION_SECRET) {
    missing.push({
      key: "SESSION_SECRET",
      label: "Session Secret",
      description: "Required for secure login sessions. Set any long random string.",
    });
  }

  if (!isSmtpConfigured()) {
    const smtpMissing: string[] = [];
    if (!process.env.SMTP_HOST) smtpMissing.push("SMTP_HOST");
    if (!process.env.SMTP_USER) smtpMissing.push("SMTP_USER");
    if (!process.env.SMTP_PASS) smtpMissing.push("SMTP_PASS");

    missing.push({
      key: "SMTP",
      label: "Email / SMTP",
      description: `Required for OTP login and email notifications. Missing: ${smtpMissing.join(", ")}. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL in Secrets.`,
    });
  }

  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidPersistent = !!(process.env.VAPID_KEYS_FROM_ENV);
  if (!vapidPublic || !vapidPrivate || !vapidPersistent) {
    missing.push({
      key: "VAPID",
      label: "Push Notifications (VAPID)",
      description:
        "Optional but recommended. Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL in Secrets so push subscriptions survive server restarts.",
    });
  }

  res.json({
    configured: missing.length === 0,
    missing,
  });
});

export default router;
