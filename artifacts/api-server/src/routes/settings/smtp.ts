import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { requireRole, auditLog, getClientIp } from "../../lib/auth";
import { createTransporter, isSmtpConfigured } from "../../lib/mailer/transport";
import { asyncHandler } from "../../lib/async-handler";

const router: IRouter = Router();

const SmtpSettingsBody = z.object({
  host: z.string().min(1, "SMTP host is required"),
  port: z.number().int().min(1).max(65535).optional().default(587),
  user: z.string().min(1, "SMTP username is required"),
  pass: z.string().optional(),         // omit to keep existing password
  fromEmail: z.string().email("Invalid from-address").optional(),
});

// ── GET /settings/smtp — return current SMTP config (password masked) ──────────
router.get("/settings/smtp", requireRole("admin"), asyncHandler(async (_req, res) => {
  const rows = await db.select().from(settingsTable);
  const s: Record<string, string> = {};
  for (const r of rows) s[r.key] = r.value;

  res.json({
    configured: isSmtpConfigured(),
    host: s["smtpHost"] ?? process.env.SMTP_HOST ?? null,
    port: parseInt(s["smtpPort"] ?? process.env.SMTP_PORT ?? "587", 10),
    user: s["smtpUser"] ?? process.env.SMTP_USER ?? null,
    fromEmail: s["smtpFromEmail"] ?? process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? null,
    // password is never returned
    passwordSaved: Boolean(s["smtpPass"] || process.env.SMTP_PASS),
  });
}));

// ── PATCH /settings/smtp — save SMTP config to the settings table ─────────────
router.patch("/settings/smtp", requireRole("admin"), asyncHandler(async (req, res) => {
  const parsed = SmtpSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues?.[0]?.message ?? "Validation failed" });
    return;
  }

  const { host, port, user, pass, fromEmail } = parsed.data;

  const toSave: Record<string, string> = {
    smtpHost: host,
    smtpPort: String(port),
    smtpUser: user,
  };
  if (pass) toSave["smtpPass"] = pass;
  if (fromEmail) toSave["smtpFromEmail"] = fromEmail;

  // Single multi-row upsert (was: one SELECT + one INSERT/UPDATE per key in a loop).
  await db
    .insert(settingsTable)
    .values(Object.entries(toSave).map(([key, value]) => ({ key, value })))
    .onConflictDoUpdate({
      target: settingsTable.key,
      set: { value: sql`excluded.value` },
    });

  // Sync into process.env so the running server picks it up without restart
  for (const [key, value] of Object.entries(toSave)) {
    const envKey = key === "smtpHost" ? "SMTP_HOST"
      : key === "smtpPort" ? "SMTP_PORT"
      : key === "smtpUser" ? "SMTP_USER"
      : key === "smtpPass" ? "SMTP_PASS"
      : key === "smtpFromEmail" ? "SMTP_FROM_EMAIL"
      : null;
    if (envKey) process.env[envKey] = value;
  }

  await auditLog(req.session.userId!, "settings.smtp.update", `SMTP settings updated (host: ${host}, user: ${user})`, getClientIp(req));
  res.json({ message: "SMTP settings saved.", configured: isSmtpConfigured() });
}));

// ── POST /settings/smtp/test — send a test email ──────────────────────────────
router.post("/settings/smtp/test", requireRole("admin"), asyncHandler(async (req, res) => {
  if (!isSmtpConfigured()) {
    res.status(400).json({ error: "SMTP is not configured. Save SMTP settings first." });
    return;
  }

  const to = req.body?.to;
  if (!to || typeof to !== "string" || !to.includes("@")) {
    res.status(400).json({ error: "Provide a valid recipient email address in { to: '...' }." });
    return;
  }

  try {
    const transporter = createTransporter();
    const from = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER;
    await transporter.sendMail({
      from,
      to,
      subject: "SAHU CSC — SMTP test",
      text: "This is a test email from your SAHU CSC server. If you received this, SMTP is working correctly.",
    });
    await auditLog(req.session.userId!, "settings.smtp.test", `Test email sent to ${to}`, getClientIp(req));
    res.json({ message: `Test email sent to ${to}.` });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to send test email: ${err.message}` });
  }
}));

export default router;
