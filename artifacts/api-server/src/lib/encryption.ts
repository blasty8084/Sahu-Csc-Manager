import crypto from "crypto";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// ─── AES-256-GCM field-level encryption for sensitive free-text fields ────────
// Used for data that is NOT searched/filtered at the DB level (e.g. address,
// bio, notes) — fields that participate in ILIKE search (name, mobile) are
// intentionally left in plaintext, since encrypting them would make partial
// search impossible without a much heavier searchable-encryption scheme.

const ALGO = "aes-256-gcm";
const SETTINGS_KEY = "encryptionKeyBase64";

let cachedKey: Buffer | null = null;
let keyPromise: Promise<Buffer> | null = null;

async function getKey(): Promise<Buffer> {
  if (cachedKey) return cachedKey;
  if (keyPromise) return keyPromise;

  keyPromise = (async () => {
    // Allow an operator-supplied key via secret (32 random bytes, base64)
    const envKey = process.env.ENCRYPTION_KEY;
    if (envKey) {
      const buf = Buffer.from(envKey, "base64");
      if (buf.length !== 32) {
        throw new Error("ENCRYPTION_KEY must decode to exactly 32 bytes (base64-encoded)");
      }
      cachedKey = buf;
      return buf;
    }

    // Otherwise, auto-generate once and persist in the settings table so it
    // survives restarts (same pattern used for VAPID keys).
    const [existing] = await db
      .select({ value: settingsTable.value })
      .from(settingsTable)
      .where(eq(settingsTable.key, SETTINGS_KEY));

    if (existing?.value) {
      cachedKey = Buffer.from(existing.value, "base64");
      return cachedKey;
    }

    const generated = crypto.randomBytes(32);
    await db
      .insert(settingsTable)
      .values({ key: SETTINGS_KEY, value: generated.toString("base64") })
      .onConflictDoNothing({ target: settingsTable.key });

    // Re-read in case of a race with another process inserting concurrently
    const [row] = await db
      .select({ value: settingsTable.value })
      .from(settingsTable)
      .where(eq(settingsTable.key, SETTINGS_KEY));

    cachedKey = Buffer.from((row?.value ?? generated.toString("base64")), "base64");
    return cachedKey;
  })();

  return keyPromise;
}

const PREFIX = "enc:v1:";

/** Encrypts a plaintext string. Returns null/undefined unchanged (no-op for empty fields). */
export async function encryptField(value: string | null | undefined): Promise<string | null | undefined> {
  if (value === null || value === undefined || value === "") return value;
  const key = await getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

/**
 * Decrypts a value previously produced by encryptField. Values without the
 * `enc:v1:` prefix are returned as-is (handles legacy plaintext rows written
 * before encryption was introduced).
 */
export async function decryptField(value: string | null | undefined): Promise<string | null | undefined> {
  if (value === null || value === undefined || value === "") return value;
  if (!value.startsWith(PREFIX)) return value; // legacy plaintext, pass through
  try {
    const key = await getKey();
    const raw = Buffer.from(value.slice(PREFIX.length), "base64");
    const iv = raw.subarray(0, 12);
    const authTag = raw.subarray(12, 28);
    const ciphertext = raw.subarray(28);
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(authTag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString("utf8");
  } catch {
    return "[decryption failed]";
  }
}
