import { Router, type IRouter } from "express";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { Redis } from "@upstash/redis";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getClientIp, auditLog } from "../../lib/auth";
import { encryptField, decryptField } from "../../lib/encryption";
import { asyncHandler } from "../../lib/async-handler";

// Standard 30-second TOTP period (RFC 6238).
// All major authenticator apps default to 30s; the otpauth:// URI encodes it
// explicitly so they stay in sync.
authenticator.options = { step: 30 };

export const APP_NAME = "SAHU CSC";

// ─── Lazy Redis client ───────────────────────────────────────────────────────
let _redis: Redis | null | undefined;
function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  const url   = process.env["UPSTASH_REDIS_REST_URL"];
  const token = process.env["UPSTASH_REDIS_REST_TOKEN"];
  _redis = (url && token) ? new Redis({ url, token }) : null;
  return _redis;
}

// ─── Replay-attack protection ────────────────────────────────────────────────
// Redis-backed with 90-second TTL (covers ±1 window period).
// Falls back to in-memory Map when Upstash Redis is not configured.

const _usedTotpTokens = new Map<number, string[]>(); // in-memory fallback

export async function isTotpReplay(userId: number, token: string): Promise<boolean> {
  try {
    const r = getRedis();
    if (r) {
      const exists = await r.exists(`totp:used:${userId}:${token}`);
      return exists > 0;
    }
  } catch { /* fall through to in-memory */ }
  return (_usedTotpTokens.get(userId) ?? []).includes(token);
}

export async function markTotpUsed(userId: number, token: string): Promise<void> {
  try {
    const r = getRedis();
    if (r) {
      await r.set(`totp:used:${userId}:${token}`, "1", { ex: 90 });
      return;
    }
  } catch { /* fall through to in-memory */ }
  const list = _usedTotpTokens.get(userId) ?? [];
  list.push(token);
  if (list.length > 6) list.splice(0, list.length - 6);
  _usedTotpTokens.set(userId, list);
}

/** Called on 2FA disable to clear per-user replay state. Redis keys expire naturally. */
export function clearTotpReplay(userId: number): void {
  _usedTotpTokens.delete(userId);
}

// ─── Per-user brute-force rate limit ─────────────────────────────────────────
// Max 5 failed TOTP attempts per user per 15 minutes.
// Redis-backed; falls back to in-memory when Redis is unavailable.

const _failCounts = new Map<number, { count: number; resetAt: number }>();

export async function checkTotpRateLimit(userId: number): Promise<{ blocked: boolean }> {
  try {
    const r = getRedis();
    if (r) {
      const count = (await r.get<number>(`totp:attempts:${userId}`)) ?? 0;
      return { blocked: count >= 5 };
    }
  } catch { /* fall through */ }
  const entry = _failCounts.get(userId);
  if (entry && Date.now() < entry.resetAt && entry.count >= 5) return { blocked: true };
  return { blocked: false };
}

export async function incrementTotpFailure(userId: number): Promise<void> {
  try {
    const r = getRedis();
    if (r) {
      const key = `totp:attempts:${userId}`;
      await r.incr(key);
      await r.expire(key, 15 * 60);
      return;
    }
  } catch { /* fall through */ }
  const entry = _failCounts.get(userId);
  if (!entry || Date.now() >= entry.resetAt) {
    _failCounts.set(userId, { count: 1, resetAt: Date.now() + 15 * 60 * 1000 });
  } else {
    entry.count++;
  }
}

export async function clearTotpFailures(userId: number): Promise<void> {
  try {
    const r = getRedis();
    if (r) { await r.del(`totp:attempts:${userId}`); return; }
  } catch { /* fall through */ }
  _failCounts.delete(userId);
}

/** Build otpauth:// URI and a QR code data URL for it. */
export async function buildQrData(username: string, secret: string): Promise<{ otpauthUri: string; qrCodeDataUrl: string }> {
  const otpauthUri = authenticator.keyuri(username, APP_NAME, secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUri, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 220,
    color: { dark: "#0B1340", light: "#FFFFFF" },
  });
  return { otpauthUri, qrCodeDataUrl };
}

const router: IRouter = Router();

// ─── POST /auth/2fa/setup-totp — enroll TOTP (authenticated) ─────────────────
// Secret is saved to the session — it is only persisted to the database after
// the user successfully verifies a code, preventing half-enrolled state.
router.post("/auth/2fa/setup-totp", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  // If a previous unverified setup exists, log it as abandoned before starting fresh.
  if ((req.session as any).setupTotpSecret) {
    await auditLog(userId, "2fa.totp_setup_abandoned", "TOTP setup abandoned (new setup initiated)", getClientIp(req));
  }

  const secret = authenticator.generateSecret();
  (req.session as any).setupTotpSecret = secret; // held in session until verify

  await auditLog(userId, "2fa.totp_setup_started", "TOTP setup started", getClientIp(req));
  const { otpauthUri, qrCodeDataUrl } = await buildQrData(user.username, secret);
  res.json({ enrolled: true, qrCodeDataUrl, otpauthUri, secret });
}));

// ─── POST /auth/2fa/setup-totp-pending — enroll TOTP mid-login ──────────────
// Same pending-secret pattern for mid-login enrollment.
router.post("/auth/2fa/setup-totp-pending", asyncHandler(async (req, res) => {
  if (!req.session.pendingUserId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const userId = req.session.pendingUserId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(401).json({ error: "Session expired. Please log in again." }); return; }

  const secret = authenticator.generateSecret();
  (req.session as any).pendingTotpSecret = secret; // held in session until verify
  req.session.pendingTotpEnrolling = true;
  req.session.pendingMethod = "totp";

  await auditLog(userId, "2fa.totp_setup_started", "TOTP setup started (pending login)", getClientIp(req));
  const { otpauthUri, qrCodeDataUrl } = await buildQrData(user.username, secret);
  res.json({ enrolled: true, qrCodeDataUrl, otpauthUri, secret });
}));

// ─── GET /auth/2fa/totp-qr — re-fetch QR (in-progress setup or enrolled) ────
router.get("/auth/2fa/totp-qr", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;

  // In-progress setup: secret is in session (not yet in DB)
  const sessionSecret = (req.session as any).setupTotpSecret as string | undefined;
  if (sessionSecret) {
    const [user] = await db.select({ username: usersTable.username }).from(usersTable).where(eq(usersTable.id, userId));
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const { otpauthUri, qrCodeDataUrl } = await buildQrData(user.username, sessionSecret);
    res.json({ qrCodeDataUrl, otpauthUri, secret: sessionSecret });
    return;
  }

  // Already enrolled: secret is in DB
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (!user.totpSecret) { res.status(400).json({ error: "TOTP not set up" }); return; }
  const secret = await decryptField(user.totpSecret);
  const { otpauthUri, qrCodeDataUrl } = await buildQrData(user.username, secret!);
  res.json({ qrCodeDataUrl, otpauthUri, secret: secret! });
}));

// ─── GET /auth/2fa/totp-code — live rotating code (authenticated) ─────────────
router.get("/auth/2fa/totp-code", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (!user.totpSecret) { res.status(400).json({ error: "TOTP not set up" }); return; }

  const secret = await decryptField(user.totpSecret);
  const step = (authenticator.options as any).step ?? 30;
  const code = authenticator.generate(secret!);
  const remaining = step - (Math.floor(Date.now() / 1000) % step);
  res.json({ code, remaining, step });
}));

// ─── GET /auth/2fa/totp-code-pending — live code for mid-login enrollment ────
router.get("/auth/2fa/totp-code-pending", asyncHandler(async (req, res) => {
  if (!req.session.pendingUserId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const userId = req.session.pendingUserId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(401).json({ error: "Session expired" }); return; }

  // Prefer session secret (pending enrollment) over DB secret
  const sessionSecret = (req.session as any).pendingTotpSecret as string | undefined;
  const secret = sessionSecret ?? (user.totpSecret ? await decryptField(user.totpSecret) : null);
  if (!secret) { res.status(400).json({ error: "TOTP not set up" }); return; }

  const step = (authenticator.options as any).step ?? 30;
  const code = authenticator.generate(secret);
  const remaining = step - (Math.floor(Date.now() / 1000) % step);
  res.json({ code, remaining, step });
}));

export default router;
