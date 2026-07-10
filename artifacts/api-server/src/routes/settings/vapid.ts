import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import webPush from "web-push";
import { requireRole, auditLog, getClientIp } from "../../lib/auth";

const router: IRouter = Router();

const KEY_PUBLIC = "vapidPublicKey";
const KEY_PRIVATE = "vapidPrivateKey";

// ── GET /settings/vapid — return VAPID public key + source ────────────────────
router.get("/settings/vapid", requireRole("admin"), async (_req, res): Promise<void> => {
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
});

// ── POST /settings/vapid/rotate — regenerate VAPID keypair ────────────────────
// Only allowed when keys are DB-persisted (not supplied via Replit Secrets).
router.post("/settings/vapid/rotate", requireRole("admin"), async (req, res): Promise<void> => {
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

  // Upsert both keys atomically
  for (const [key, value] of [[KEY_PUBLIC, publicKey], [KEY_PRIVATE, privateKey]] as const) {
    const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
    if (existing.length > 0) {
      await db.update(settingsTable).set({ value }).where(eq(settingsTable.key, key));
    } else {
      await db.insert(settingsTable).values({ key, value });
    }
  }

  // Sync into process.env so push works immediately without restart
  process.env.VAPID_PUBLIC_KEY = publicKey;
  process.env.VAPID_PRIVATE_KEY = privateKey;

  // Re-initialise web-push with the new keys
  const subject = process.env.VAPID_SUBJECT ?? `mailto:${process.env.SMTP_FROM_EMAIL ?? "admin@sahucsc.in"}`;
  webPush.setVapidDetails(subject, publicKey, privateKey);

  await auditLog(req.session.userId!, "settings.vapid.rotate", "VAPID keypair rotated", getClientIp(req));

  res.json({
    message: "VAPID keys rotated. Existing push subscriptions are now invalid — users will need to re-subscribe.",
    publicKey,
  });
});

export default router;
