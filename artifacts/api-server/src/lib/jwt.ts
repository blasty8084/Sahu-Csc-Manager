import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";
import crypto from "node:crypto";

const SETTINGS_KEY = "jwtSecret";
let cachedSecret: Uint8Array | null = null;

async function getSecret(): Promise<Uint8Array> {
  if (cachedSecret) return cachedSecret;

  const envSecret = process.env.JWT_SECRET;
  if (envSecret) {
    cachedSecret = new TextEncoder().encode(envSecret);
    return cachedSecret;
  }

  const [existing] = await db
    .select({ value: settingsTable.value })
    .from(settingsTable)
    .where(eq(settingsTable.key, SETTINGS_KEY));

  if (existing?.value) {
    cachedSecret = new TextEncoder().encode(existing.value);
    return cachedSecret;
  }

  const generated = crypto.randomBytes(48).toString("base64");
  await db
    .insert(settingsTable)
    .values({ key: SETTINGS_KEY, value: generated })
    .onConflictDoNothing({ target: settingsTable.key });

  const [row] = await db
    .select({ value: settingsTable.value })
    .from(settingsTable)
    .where(eq(settingsTable.key, SETTINGS_KEY));

  const secret = row?.value ?? generated;
  cachedSecret = new TextEncoder().encode(secret);
  return cachedSecret;
}

/**
 * Call once at startup to eagerly generate and persist the JWT secret
 * before any request can trigger lazy init.
 */
export async function ensureJwtSecret(): Promise<void> {
  await getSecret();
  const source = process.env.JWT_SECRET ? "environment" : "settings table (auto-generated)";
  logger.info(`JWT secret loaded from ${source}`);
}

export async function signToken(
  payload: Record<string, unknown>,
  expiresIn?: string
): Promise<string> {
  const secret = await getSecret();
  const builder = new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt();
  if (expiresIn) builder.setExpirationTime(expiresIn);
  return builder.sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const secret = await getSecret();
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export interface ReceiptTokenPayload {
  sub: string;   // UUID (stable DB identifier)
  eid: number;   // entry ID
  rn: string;    // receipt number (e.g. CSC-2026-0001)
  typ: "ledger" | "udhari";
}

/** Sign a permanent receipt token. No expiry — receipts must be verifiable forever. */
export async function signReceiptToken(
  uuid: string,
  entryId: number,
  receiptNumber: string,
  type: "ledger" | "udhari" = "ledger"
): Promise<string> {
  return signToken({ sub: uuid, eid: entryId, rn: receiptNumber, typ: type });
}

/**
 * Verify a receipt token. Returns the payload if valid.
 * Throws if the signature is invalid or the token is malformed.
 */
export async function verifyReceiptToken(token: string): Promise<ReceiptTokenPayload> {
  const payload = await verifyToken(token);
  if (
    typeof payload.sub !== "string" ||
    typeof payload.eid !== "number" ||
    typeof payload.rn !== "string" ||
    (payload.typ !== "ledger" && payload.typ !== "udhari")
  ) {
    throw new Error("Invalid receipt token payload");
  }
  return payload as unknown as ReceiptTokenPayload;
}

/** Returns true if the string looks like a JWT (three base64url segments). */
export function isJwt(token: string): boolean {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token);
}
