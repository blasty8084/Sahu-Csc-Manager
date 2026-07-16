# SAHU CSC — Session Memory / Chat History
**Session date:** 2026-07-15 to 2026-07-16  
**Agent:** Replit Agent (main)

This file records what was done in each conversation turn, why, and what the outcome was. Use it to understand the history of decisions without reading through the full conversation logs.

---

## Turn 1 — Project Setup (2026-07-15)

**User asked:** Get this project running on Replit (imported from GitHub).

**What was done:**
1. Explored project: identified as SAHU CSC (Indian CSC management PWA), pnpm monorepo, Express + React + PostgreSQL
2. Found `DATABASE_URL` is auto-injected by Replit (no integration needed)
3. Ran `pnpm install --frozen-lockfile` (29s, all packages installed)
4. Pushed schema: `pnpm --filter @workspace/db run push-force` — all tables created
5. Created `session` table manually via `psql` (not managed by Drizzle)
6. Requested `ADMIN_PASSWORD` and `OPERATOR_PASSWORD` secrets from user (confirmed set)
7. Ran `Seed Database` workflow → `admin` and `operator` accounts created with seeded services + settings
8. Verified: API Server running on port 8080, frontend Vite on port 5000, login page rendered
9. Proposed 3 follow-up tasks: email notifications, Redis setup, publish app

**Outcome:** App fully running. Login page visible, API responding.

---

## Turn 2 — 2FA Bug Fixes (2026-07-15)

**User asked:** "2fa have some bug and issue fixed verification page par kabhi kabi show horaha totp fix karo and 2fa optimize karo"  
*(Verification page showing only sometimes; fix 2FA bugs and optimize)*

**Bugs found (by reading all 2FA code):**

### Bug 1 — Main "sometimes" bug (`login.ts`)
`sendLoginOtp` was called inside the `if (needsChallenge)` block. If the email send failed (SMTP not configured, network issue), the catch block returned a 500 error to the frontend. The frontend only shows the verification page on `requires2fa: true` — so when email failed, the page never appeared.

**Fix:** In the catch block, return `requires2fa: true` with fallback logic:
- If TOTP enrolled → return `method: "totp"` (no email needed)
- If no TOTP → return `requires2fa: true` + `otpError` warning flag so verification page still shows

### Bug 2 — TOTP method ignored on mount (`TwoFactorStep.tsx`)
`useState<Method>("otp")` hardcoded — ignored `challenge.method` from the server. If server said `"totp"`, frontend still started in OTP mode.

**Fix:** `useState<Method>(challenge.method)` — initialize from server response.

### Bug 3 — Wrong `totpEnrolled` in switch-method (`2fa.ts`)
`totpEnrolled: !!user.totpSecret` — true even for abandoned partial enrollments. User could see code-entry form for a secret they never finished scanning.

**Fix:** `totpEnrolled: !!(user.totpSecret && user.twoFaEnabled)` — only true if enrollment was confirmed.

### Bug 4 — Resend timer started for TOTP sessions
The 120s resend countdown always started on `TwoFactorStep` mount, even when method was TOTP (where no email was sent).

**Fix:** Only start timer if `challenge.method === "otp"`.

**Also added:** `TwoFaChallenge.otpError?: string` field + amber warning banner in UI when OTP email fails.

**Outcome:** All 4 bugs fixed. API rebuilt cleanly. Verification page now reliably appears.

---

## Turn 3 — SMTP Setup (2026-07-16, ~00:14 IST)

**User said:** "SMTP test email sent" (confirmed SMTP_PASS secret added)

**What was done:**
1. Checked env vars — confirmed `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_FROM_EMAIL` all already set
2. Found that `SMTP_PASS` was added AFTER the API server last started — so running process didn't have it
3. Restarted `API Server` workflow to pick up the new secret
4. Ran a direct SMTP test via Node.js — `transporter.verify()` + test email:
   - ✅ SMTP connection verified
   - ✅ Test email sent (messageId confirmed, `250 2.0.0 OK` from Gmail)

**Outcome:** SMTP working. OTP emails will now deliver reliably.

---

## Turn 4 — 2FA Method Picker Redesign (2026-07-16, ~00:45 IST)

**User asked:** "User can choose email otp or totp than press email otp sent email otp other than press totp sent totp"  
*(Don't auto-send OTP on login — show method selection first, only send OTP/show TOTP after user explicitly picks)*

**What changed:**

### Backend (`login.ts`)
- **Removed** `sendLoginOtp` call from the login route entirely
- Instead of auto-sending OTP, just sets `pendingUserId` + session state and returns:
  ```json
  { "requires2fa": true, "maskedEmail": "sa****@gmail.com", "totpEnrolled": false, "isNewDevice": true }
  ```
- No `method` field in the response (user picks method themselves)
- Fixed `totpEnrolled` check: `!!(user.totpSecret && user.twoFaEnabled)` (was just `!!user.totpSecret`)

### Type (`use-auth.tsx`)
- Removed `method` and `otpError` from `TwoFaChallenge` interface
- New minimal interface: `{ requires2fa: true, isNewDevice, maskedEmail?, totpEnrolled? }`

### Frontend — Full `TwoFactorStep.tsx` rewrite
New two-phase flow:

**Phase 1 — Method Picker (new screen):**
- Blue card: "Email OTP" → clicks call `switchTwoFaMethod("otp")` → OTP sent → timer starts → code entry
- Orange card: "Authenticator App" → clicks call `switchTwoFaMethod("totp")` → TOTP entry (or QR enrollment)
- Loading spinner on the clicked card while API call in flight
- Error shown inline if API call fails

**Phase 2 — Code Entry (same as before, cleaned up):**
- OTP: 6-digit input + resend timer (only starts AFTER user chose OTP)
- TOTP: 6-digit input (or QR enrollment flow if not set up)
- "Change method" link → back to Phase 1 (clears timer and code)
- "Use a backup code" toggle

**Key state changes:**
- `method: Method | null` — null = Phase 1, "otp"/"totp" = Phase 2
- `choosing: Method | null` — which card is loading
- `resendSeconds: 0` initial (timer only starts after user requests OTP)
- Removed `otpSendError` initial state (no auto-send, so no initial error possible)

**Outcome:** Verification flow is now completely explicit. No OTP waste. User has a clear choice every time. API logs confirmed new flow: `login 200` → `switch-method 200` → `switch-method 200` (resend or second method pick).

---

## Turn 5 — Documentation (2026-07-16)

**User asked:** "Update documents md and create a agent.md complete app document one file for agent understand, create also memory.md for chat history"

**What was done:**
- Created `AGENT.md` — single-file comprehensive reference for any agent:
  - Project overview, monorepo layout, full tech stack
  - All environment variables and secrets
  - Complete database schema (all tables, columns, relationships)
  - All API routes (method, path, auth, description)
  - Auth and session system (full 2FA flow, roles, rate limiting)
  - All frontend pages (public, authenticated, admin-only)
  - Key frontend architecture (auth state, offline PWA, i18n, performance)
  - How to run (first-time + ongoing)
  - Background jobs and cron
  - Known quirks and non-obvious decisions (15 critical items)
  - Testing, build process
  - Version history summary

- Created `memory.md` (this file) — session chat history

- Updated `.agents/memory/MEMORY.md` — added new entries for 2FA method picker redesign

---

## Open Items / Not Yet Done

| Task | Status |
|------|--------|
| Email notifications fully configured | ✅ Done (SMTP live, OTP emails working) |
| Redis / BullMQ worker server | ⏳ Pending — needs `REDIS_URL` secret |
| Publish to stable URL | ⏳ Pending — deploy workflow not run |
| CORS_ORIGIN includes current dev domain | ✅ In env vars |

---

## Key Files Changed This Session

| File | Change |
|------|--------|
| `artifacts/api-server/src/routes/auth/login.ts` | Removed OTP auto-send; returns method-neutral challenge; fixed totpEnrolled check |
| `artifacts/api-server/src/routes/auth/2fa.ts` | Fixed `totpEnrolled: !!(totpSecret && twoFaEnabled)` in switch-method |
| `artifacts/sahu-csc/src/hooks/use-auth.tsx` | Simplified TwoFaChallenge type (removed method + otpError fields) |
| `artifacts/sahu-csc/src/components/auth/TwoFactorStep.tsx` | Full rewrite — explicit method picker + code entry phases |
| `AGENT.md` | Created — full agent reference |
| `memory.md` | Created — this file |

---

## Environment State (end of session)

| Item | Value |
|------|-------|
| API Server | Running, port 8080 |
| Frontend | Running, port 5000 (Vite dev) |
| Worker Server | Not running (no REDIS_URL) |
| Database | Schema applied, seeded |
| SMTP | ✅ Working (Gmail, verified) |
| 2FA | ✅ Fixed + redesigned |
| Secrets set | SESSION_SECRET, ADMIN_PASSWORD, OPERATOR_PASSWORD, SMTP_PASS |
