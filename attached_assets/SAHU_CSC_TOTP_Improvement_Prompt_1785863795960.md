# Replit Agent 4 Prompt — TOTP 2FA Improve, Upgrade & Optimization

## Overview
Audit and improve the existing TOTP 2FA implementation.
The core logic is solid — do not break what works.
Focus only on the gaps listed below.

### Critical Rules — Never Break These
- Keep `step: 30` — never change (Google Authenticator hardcodes 30s)
- Keep `window: 1` on all verify calls — needed for clock drift tolerance
- Keep backup code count at 8
- Do not change existing API response shapes — only add new fields
- Do not change any UI design or branding

---

## 1. Replay Protection — Move to Redis

Current `_usedTotpTokens` Map is in-memory — resets on every server
restart or Render redeploy, opening a brief replay window.
Move to Redis with 90-second TTL:

```typescript
// Instead of Map<number, string[]>:
// Redis key: `totp:used:{userId}:{token}` → TTL 90s
// Check: await redis.exists(`totp:used:${userId}:${token}`)
// Mark:  await redis.set(`totp:used:${userId}:${token}`, '1', 'EX', 90)
```

Use existing Upstash Redis client already in codebase.
Keep in-memory Map as fallback if Redis is unavailable.

---

## 2. Rate Limiting — TOTP Verify Endpoint

Add brute-force protection on `/auth/2fa/verify-totp`:
Max 5 failed attempts per user per 15 minutes, then lockout:

```typescript
// Redis key: `totp:attempts:{userId}` → increment on fail, TTL 15min
// After 5 fails → return 429 + lockout message
// On success → delete the attempts key
```

---

## 3. Backup Codes — Low Count Warning

When user has 3 or fewer backup codes remaining, add warning to
`/auth/2fa/status` response:

```typescript
backupCodesLow: backupCodesRemaining <= 3,
backupCodesWarning: backupCodesRemaining <= 3
  ? `Only ${backupCodesRemaining} backup codes left. Regenerate now.`
  : null,
```

Show this warning in Profile → Security section on frontend.

---

## 4. TOTP Setup — Verify Before Enabling

Currently `setup-totp` saves secret immediately.
Add `pendingTotpSecret` field — only move to `totpSecret` after
user successfully verifies first code:

```typescript
// setup-totp → save to pendingTotpSecret (encrypted)
// verify-totp (Mode A) → move pendingTotpSecret → totpSecret, enable 2FA
```

Prevents half-enrolled state if user abandons setup midway.

---

## 5. Device Trust — Show Expiry Date

Add `trustedUntil` to device trust response so frontend can show
"This device is trusted until [date]":

```typescript
// In finalizeLogin response when trustDevice=true:
trustedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
```

---

## 6. Security Email — TOTP Disable Notification

Verify `notify2faDisabled` email includes:
- Timestamp of disable action
- IP address + device info
- Warning: "If you did not do this, contact support immediately"
- Link to re-enable 2FA

If any field is missing from email template — add it.

---

## 7. Frontend — TOTP Setup UX Improvements

In Profile → Security → Enable Authenticator flow:

| Improvement | Detail |
|---|---|
| Countdown timer | Show 0-30s timer next to QR code — user knows when code expires |
| Copy secret button | "Copy secret key" button below QR for manual entry |
| Manual entry toggle | "Can't scan QR?" shows plain text secret |
| Backup codes display | Show in printable/copyable format after setup |
| Download backup codes | "Download as PDF" button for backup codes |
| Test step | Ask user to enter a code BEFORE finalizing — confirm app works |

---

## 8. Audit Log — Add Missing Events

Ensure these events are logged via `auditLog()`:

```typescript
"2fa.totp_setup_started"    // when setup-totp is called
"2fa.totp_setup_abandoned"  // when pendingTotpSecret cleared without verify
"2fa.backup_code_used"      // when backup code consumed at login
"2fa.replay_rejected"       // when replay attack detected
"2fa.brute_force_locked"    // when rate limit is hit
```

---

## 9. Login Page — TOTP Issues Fix

Fix these known issues on the TOTP login/verify screen:

1. **Code entry UX** — Auto-advance focus between digit boxes (if using
   split input). Auto-submit when 6th digit is entered — no manual
   "Verify" button tap needed.

2. **Timer sync** — The countdown timer on login screen must sync with
   actual TOTP window — not just count down from 30 independently.
   Use `Math.floor(Date.now() / 1000) % 30` for remaining seconds.

3. **Error message clarity** — Replace generic "Invalid code" with:
   - Expired code: "Code expired — wait for the next one"
   - Already used: "This code was already used — wait for the next one"
   - Wrong code: "Incorrect code — check your authenticator app"
   - Locked: "Too many attempts — try again in 15 minutes"

4. **Resend/Switch option** — On TOTP screen, add a "Use email OTP
   instead" fallback link for users who lost their authenticator app.

5. **Loading state** — Show spinner on Verify button while API call
   is in progress — prevent double submission.

6. **Backup code entry** — Add a "Use backup code instead" toggle
   that swaps the 6-digit input for a backup code input field
   (format: XXXXX-XXXXX).

---

## Files to Check/Modify

| File | Change |
|---|---|
| `routes/auth/2fa-totp.ts` | Redis replay protection |
| `routes/auth/2fa-backup.ts` | Rate limiting, audit events |
| `routes/auth/2fa.ts` | Status response, device trust expiry |
| `lib/mailer/templates/otp.ts` | 2FA disable email improvements |
| `src/pages/auth/TotpVerify.tsx` | Login UX fixes |
| `src/components/profile/TwoFactorSection.tsx` | Setup UX improvements |

---

## Do Not Change

- `authenticator.options = { step: 30 }` — never touch
- `window: 1` on all `authenticator.verify()` calls — never remove
- Backup code count (8) — never change
- Existing API response shapes — only add new optional fields
- Any existing UI design, colors, or branding
- Any business logic outside 2FA scope

---

*SAHU CSC Manager | blasty8084 | August 2026*
