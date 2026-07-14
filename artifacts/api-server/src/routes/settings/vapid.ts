import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import webPush from "web-push";
import { requireRole, auditLog, getClientIp } from "../../lib/auth";
import { asyncHandler } from "../../lib/async-handler";

const router: IRouter = Router();

const KEY_PUBLIC = "vapidPublicKey";
const KEY_PRIVATE = "vapidPrivateKey";

// ── GET /settings/vapid — return VAPID public key + source ────────────────────
router.get("/settings/vapid", requireRole("admin"), asyncHandler(async (_req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY ?? null;
  const fromEnv = Boolean(
    process.env.VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    !process.env.VAPID_KEYS_FROM_ENV // env var set by lib/vapid when keys came from DB
  );

  // Check whether key is DB-persisted (can be rotated) vs hard-coded in secrets
  const [pubRow] = await db
    .select({ value: settingsTable.value })
    .from(settingsTable)
    .where(eq(settingsTable.key, KEY_PUBLIC));

  res.json({
    publicKey,
    configured: Boolean(publicKey),
    // fromEnv = true means the key came from a Replit Secret and cannot be rotated here
    fromEnv: Boolean(process.env.VAPID_PUBLIC_KEY && !pubRow?.value),
    dbPersisted: Boolean(pubRow?.value),
  });
}));

// ── POST /settings/vapid/rotate — regenerate VAPID keypair ────────────────────
// Only allowed when keys are DB-persisted (not supplied via Replit Secrets).
router.post("/settings/vapid/rotate", requireRole("admin"), asyncHandler(async (req, res) => {
  // Refuse if the running keys came from env secrets — rotating would break
  // existing push subscriptions and we cannot update the secret automatically.
  const [pubRow] = await db
    .select({ value: settingsTable.value })
    .from(settingsTable)
    .where(eq(settingsTable.key, KEY_PUBLIC));

  if (!pubRow?.value) {
    res.status(400).json({
      error: "VAPID keys are provided via Replit Secrets and cannot be rotated here. " +
             "Remove VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY from Secrets to enable DB-managed rotation.",
    });
    return;
  }

  const { publicKey, privateKey } = webPush.generateVAPIDKeys();

  // Single multi-row upsert (was: one SELECT + one INSERT/UPDATE per key in a loop).
  await db
    .insert(settingsTable)
    .values([
      { key: KEY_PUBLIC, value: publicKey },
      { key: KEY_PRIVATE, value: privateKey },
    ])
    .onConflictDoUpdate({
      target: settingsTable.key,
      set: { value: sql`excluded.value` },
    });

  // Re-initialise web-push with the new keys so push works in this process
  // immediately without a restart.
  // NOTE: do NOT write to process.env here — in multi-instance deployments
  // each process has its own memory and the write would only take effect in
  // the instance that handled this request.  webPush.setVapidDetails() is
  // the correct in-process update; other instances will pick up the new keys
  // from the DB on their next restart (or when they next read the settings table).
  const subject = process.env.VAPID_SUBJECT ?? `mailto:${process.env.SMTP_FROM_EMAIL ?? "admin@sahucsc.in"}`;
  webPush.setVapidDetails(subject, publicKey, privateKey);

  await auditLog(req.session.userId!, "settings.vapid.rotate", "VAPID keypair rotated", getClientIp(req));

  res.json({
    message: "VAPID keys rotated. Existing push subscriptions are now invalid — users will need to re-subscribe.",
    publicKey,
  });
}));

export default router;
