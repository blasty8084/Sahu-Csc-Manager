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
    if (!process.env.SMTP_PASSWORD && !process.env.SMTP_PASS) smtpMissing.push("SMTP_PASSWORD");

    missing.push({
      key: "SMTP",
      label: "Email / SMTP",
      description: `Required for OTP login and email notifications. Missing: ${smtpMissing.join(", ")}. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL in Secrets.`,
    });
  }

  if (!process.env.ADMIN_PASSWORD) {
    missing.push({
      key: "ADMIN_PASSWORD",
      label: "Admin Default Password",
      description: "Required by the Seed Database workflow to create/reset the admin account. Set any strong password in Replit Secrets.",
    });
  }

  if (!process.env.OPERATOR_PASSWORD) {
    missing.push({
      key: "OPERATOR_PASSWORD",
      label: "Operator Default Password",
      description: "Required by the Seed Database workflow to create/reset the operator account. Set any strong password in Replit Secrets.",
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

  // Setup status reflects process.env at request time — cache briefly so rapid
  // polling (e.g. setup wizard banner) doesn't hammer the server.
  res.set("Cache-Control", "no-store");
  res.json({
    configured: missing.length === 0,
    missing,
    // Feature flag: when true, all 2FA/OTP challenges are bypassed globally.
    // Flip DISABLE_2FA=true to re-enable. Never remove this field — the frontend
    // register page reads it to skip the OTP verification step.
    twoFaDisabled: process.env.DISABLE_2FA === "true",
  });
});

export default router;
