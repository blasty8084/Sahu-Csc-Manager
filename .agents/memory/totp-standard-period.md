---
name: TOTP standard 30-second period
description: Why the TOTP period must stay at 30 s, and what breaks if changed
---

## Rule
`authenticator.options = { step: 30 }` — never change this value.

**Why:** Google Authenticator, Authy, Microsoft Authenticator, and every major TOTP app hardcode a 30-second window and silently ignore the `period` parameter in `otpauth://` URIs. Setting `step: 120` makes *all* externally-generated codes permanently invalid — they are offset by the different window and will never match.

**How to apply:** Any edit to `artifacts/api-server/src/routes/auth/2fa.ts` that touches `authenticator.options` must keep `step: 30`. The `otpauth://` URI must not embed `period=120`. All `authenticator.verify()` calls must include `window: 1` for ±30 s clock-drift tolerance.

## Companion security rules (v4.8.0)
- **Replay protection**: `_usedTotpTokens` Map (userId → last 6 tokens) in `2fa.ts` — stores each verified token, rejects re-use within the window. Intentionally in-memory (resets on restart; sessions also reset).
- **Timing-safe comparison**: `crypto.timingSafeEqual(Buffer.from(a,"hex"), Buffer.from(b,"hex"))` for backup-code hashes and OTP hashes — never `===`.
- **QR export**: `setup-totp` and `setup-totp-pending` return `{ qrCodeDataUrl, otpauthUri, secret }` via `buildQrData()` in `2fa.ts`. Do not remove this — it's what makes external apps work.
- **Regenerate backup codes**: `POST /auth/2fa/regenerate-backup-codes` — requires `currentPassword`, invalidates old codes, returns 8 new ones.

## OTP resend cooldown (120 s) is unrelated
`RESEND_COOLDOWN = 120` in `loginTypes.ts` is the *email OTP resend button cooldown* — how long the user must wait before clicking "Resend code" again. It has nothing to do with the TOTP window. Do not confuse the two.
