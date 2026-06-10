import webPush from "web-push";
import { logger } from "./logger";

export async function ensureVapidKeys(): Promise<void> {
  const existingPublic = process.env.VAPID_PUBLIC_KEY;
  const existingPrivate = process.env.VAPID_PRIVATE_KEY;

  if (existingPublic && existingPrivate) {
    logger.info("VAPID keys already configured");
    return;
  }

  logger.warn(
    "VAPID keys not set — generating temporary in-memory keys. " +
    "Push subscriptions will be lost on restart. " +
    "Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_EMAIL in environment secrets for production."
  );

  const { publicKey, privateKey } = webPush.generateVAPIDKeys();
  process.env.VAPID_PUBLIC_KEY = publicKey;
  process.env.VAPID_PRIVATE_KEY = privateKey;

  const email = process.env.VAPID_EMAIL || "mailto:admin@sahucsc.in";
  webPush.setVapidDetails(email, publicKey, privateKey);

  logger.info({ publicKey }, "Generated temporary VAPID keys (not persisted)");
}
