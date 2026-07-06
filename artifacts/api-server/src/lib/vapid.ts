import webPush from "web-push";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const KEY_PUBLIC = "vapidPublicKey";
const KEY_PRIVATE = "vapidPrivateKey";

export async function ensureVapidKeys(): Promise<void> {
  // 1. Operator-supplied env vars / secrets take precedence
  const envPublic = process.env.VAPID_PUBLIC_KEY;
  const envPrivate = process.env.VAPID_PRIVATE_KEY;

  if (envPublic && envPrivate) {
    process.env.VAPID_KEYS_FROM_ENV = "true";
    logger.info("VAPID keys loaded from environment");
    return;
  }

  // 2. Try the settings table (auto-persisted on first boot)
  const [pubRow] = await db
    .select({ value: settingsTable.value })
    .from(settingsTable)
    .where(eq(settingsTable.key, KEY_PUBLIC));
  const [privRow] = await db
    .select({ value: settingsTable.value })
    .from(settingsTable)
    .where(eq(settingsTable.key, KEY_PRIVATE));

  if (pubRow?.value && privRow?.value) {
    process.env.VAPID_PUBLIC_KEY = pubRow.value;
    process.env.VAPID_PRIVATE_KEY = privRow.value;
    logger.info("VAPID keys loaded from settings table");
    return;
  }

  // 3. Generate a fresh pair and persist so they survive restarts
  const { publicKey, privateKey } = webPush.generateVAPIDKeys();

  await db
    .insert(settingsTable)
    .values({ key: KEY_PUBLIC, value: publicKey })
    .onConflictDoNothing({ target: settingsTable.key });
  await db
    .insert(settingsTable)
    .values({ key: KEY_PRIVATE, value: privateKey })
    .onConflictDoNothing({ target: settingsTable.key });

  // Re-read to handle a concurrent insert from another process
  const [pub] = await db
    .select({ value: settingsTable.value })
    .from(settingsTable)
    .where(eq(settingsTable.key, KEY_PUBLIC));
  const [priv] = await db
    .select({ value: settingsTable.value })
    .from(settingsTable)
    .where(eq(settingsTable.key, KEY_PRIVATE));

  process.env.VAPID_PUBLIC_KEY = pub?.value ?? publicKey;
  process.env.VAPID_PRIVATE_KEY = priv?.value ?? privateKey;

  logger.info(
    { publicKey: process.env.VAPID_PUBLIC_KEY },
    "VAPID keys auto-generated and persisted to settings table"
  );
}
