import { Router, type IRouter } from "express";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getClientIp } from "../../lib/auth";
import { encryptField, decryptField } from "../../lib/encryption";
import { asyncHandler } from "../../lib/async-handler";

// Standard 30-second TOTP period (RFC 6238).
// All major authenticator apps default to 30s; the otpauth:// URI encodes it
// explicitly so they stay in sync.
authenticator.options = { step: 30 };

export const APP_NAME = "SAHU CSC";

// ─── Replay-attack protection ───────────────────────────────────────────────
// Track the last few TOTP tokens used per user so the same code cannot be
// submitted twice within the same 30-second window.  We keep a small rotating
// window of 6 tokens per user — enough to cover drift ±1 period.
export const _usedTotpTokens = new Map<number, string[]>();

export function isTotpReplay(userId: number, token: string): boolean {
  return (_usedTotpTokens.get(userId) ?? []).includes(token);
}

export function markTotpUsed(userId: number, token: string): void {
  const list = _usedTotpTokens.get(userId) ?? [];
  list.push(token);
  if (list.length > 6) list.splice(0, list.length - 6);
  _usedTotpTokens.set(userId, list);
}

/** Called on 2FA disable to clear per-user replay state. */
export function clearTotpReplay(userId: number): void {
  _usedTotpTokens.delete(userId);
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

// ─── POST /auth/2fa/setup-totp — enroll TOTP (authenticated) ────────────────
router.post("/auth/2fa/setup-totp", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const secret = authenticator.generateSecret();
  await db.update(usersTable).set({ totpSecret: await encryptField(secret) }).where(eq(usersTable.id, userId));

  const { otpauthUri, qrCodeDataUrl } = await buildQrData(user.username, secret);
  res.json({ enrolled: true, qrCodeDataUrl, otpauthUri, secret });
}));

// ─── POST /auth/2fa/setup-totp-pending — enroll TOTP mid-login ──────────────
router.post("/auth/2fa/setup-totp-pending", asyncHandler(async (req, res) => {
  if (!req.session.pendingUserId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const userId = req.session.pendingUserId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(401).json({ error: "Session expired. Please log in again." }); return; }

  const secret = authenticator.generateSecret();
  await db.update(usersTable).set({ totpSecret: await encryptField(secret) }).where(eq(usersTable.id, userId));
  req.session.pendingTotpEnrolling = true;
  req.session.pendingMethod = "totp";

  const { otpauthUri, qrCodeDataUrl } = await buildQrData(user.username, secret);
  res.json({ enrolled: true, qrCodeDataUrl, otpauthUri, secret });
}));

// ─── GET /auth/2fa/totp-qr — re-fetch QR for an enrolled user ───────────────
router.get("/auth/2fa/totp-qr", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (!user.totpSecret) { res.status(400).json({ error: "TOTP not set up" }); return; }

  const secret = await decryptField(user.totpSecret);
  const { otpauthUri, qrCodeDataUrl } = await buildQrData(user.username, secret!);
  res.json({ qrCodeDataUrl, otpauthUri, secret: secret! });
}));

// ─── GET /auth/2fa/totp-code — live rotating code (authenticated) ────────────
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

// ─── GET /auth/2fa/totp-code-pending — live code for mid-login state ─────────
router.get("/auth/2fa/totp-code-pending", asyncHandler(async (req, res) => {
  if (!req.session.pendingUserId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const userId = req.session.pendingUserId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(401).json({ error: "Session expired" }); return; }
  if (!user.totpSecret) { res.status(400).json({ error: "TOTP not set up" }); return; }

  const secret = await decryptField(user.totpSecret);
  const step = (authenticator.options as any).step ?? 30;
  const code = authenticator.generate(secret!);
  const remaining = step - (Math.floor(Date.now() / 1000) % step);
  res.json({ code, remaining, step });
}));

export default router;
