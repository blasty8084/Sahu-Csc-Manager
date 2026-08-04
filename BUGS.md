# SAHU CSC — Bug & Issue Tracker

> Original audit generated: 14 July 2026
> Status reconciled: 30 July 2026 against the current API, frontend, schema, and changelog
> Current total: **1 open / 29 fixed** — the async PDF/SMS worker limitation remains intentionally explicit

---

## 🔴 Critical / Data Integrity

| # | Status | File | Issue |
|---|--------|------|-------|
| 1 | ✅ Fixed | `routes/ledger.ts` | `POST /ledger` is now wrapped in one database transaction covering the balance update, receipt counter, insert, and receipt-token write-back. |
| 2 | ✅ Fixed | `routes/aeps/transactions.ts` | AePS session ownership is checked for list, edit, and delete paths; missing or foreign-owned sessions return `403`. |
| 3 | ⬜ Open | `workers/pdf.worker.ts` · `workers/sms.worker.ts` | Async PDF generation is explicitly failed until implemented, and SMS is explicitly failed because no provider is configured. Inline receipt PDFs work; this remains the only open tracked limitation. |

---

## 🟠 Security

| # | Status | File | Issue |
|---|--------|------|-------|
| 4 | ✅ Fixed | `routes/health.ts` | `/api/geo` is protected by a dedicated 30-requests-per-minute limiter. |
| 5 | ✅ Fixed | `app.ts` | Production CORS configuration no longer silently falls back to localhost; Replit domains are detected automatically and invalid production setup fails clearly. |
| 6 | ✅ Fixed | `app.ts` | The development loopback bypass is disabled in production and checks the real TCP peer address rather than spoofable `X-Forwarded-For` data. |
| 7 | ✅ Fixed | `routes/settings/vapid.ts` | VAPID rotation no longer mutates process environment at runtime; keys persist through the settings-backed initialization path. |

---

## 🟡 Logic Bugs

| # | Status | File | Issue |
|---|--------|------|-------|
| 8 | ✅ Fixed | `routes/ledger.ts` | Ledger period calculations now use IST calendar boundaries. |
| 9 | ✅ Fixed | `routes/admin-receipt-export.ts` | ZIP errors now return JSON before streaming begins and destroy the socket after ZIP headers are sent, avoiding a misleading corrupt download. |
| 10 | ✅ Fixed | `routes/admin-receipt-export.ts` | Bulk receipt generation stops when the client disconnects. |
| 11 | ✅ Fixed | `routes/auth/login.ts` | Session max-age is aligned at 8 hours normally and 30 days for Remember Me. |
| 12 | ✅ Fixed | `routes/ledger.ts` | Large-transaction notification failures are logged with request context. |
| 13 | ✅ Fixed | `routes/ledger.ts` | The large-transaction threshold is read from the settings table and cached, with a ₹10,000 default. |

---

## 🟡 Missing Input Validation

| # | Status | File | Issue |
|---|--------|------|-------|
| 14 | ✅ Fixed | `routes/admin-receipt-export.ts` | Bulk and monthly receipt-export inputs are validated with Zod, including ISO dates, positive user IDs, date ordering, and month ranges. |
| 15 | ✅ Fixed | `routes/receipts.ts` | Receipt tokens are format-validated before the database lookup. |

---

## 🟡 Frontend Bugs

| # | Status | File | Issue |
|---|--------|------|-------|
| 16 | ✅ Fixed | `pages/ledger.tsx` | Ledger entry forms reset after successful online creation and offline save. |
| 17 | ✅ Fixed | `pages/udhari.tsx` | Add-customer forms reset after success and close. |
| 18 | ✅ Fixed | `pages/register.tsx` → `components/auth/RegisterForm.tsx` | `form.reset()`, `setFormValues(null)`, and `setOtpDigits([])` called after every successful submit path — sensitive state cleared before redirect. Fixed as part of register page refactor (July 18, 2026). |
| 19 | ✅ Fixed | `App.tsx` | `ShareTargetHandler` includes `setLocation` in its effect dependencies. |
| 25 | ✅ Fixed | `hooks/use-auth.tsx` | Login page flashed for ~1 ms on page refresh. React Query's `isLoading` briefly becomes `false` between IDB restore completion and the `auth/me` fetch starting (`fetchStatus === 'idle'`); `ProtectedRoute` misread this and redirected to `/login`. Fixed by switching to `isPending` (true any time no data has resolved, regardless of fetch state) and initialising `offlineChecked` eagerly to `true` for online users so no extra render is needed. |
| 26 | ✅ Fixed | `scripts/serve.mjs` | In production (`serve.mjs`), all `/api/*` requests were handled by `sirv`'s SPA fallback — returning `index.html` (200 OK) instead of forwarding to the API server. React Query stored the HTML string as query data; pages calling `.map()` on the result (e.g. Ledger) crashed with `TypeError: entries.map is not a function`. Fixed by adding a Node `http.request` reverse proxy in `serve.mjs` that forwards `/api/*` and `/socket.io/*` to port 8080 before `sirv` can intercept. |
| 27 | ✅ Fixed | `components/ProtectedRoute.tsx` · `pages/login.tsx` | After a session expired or a deep link was opened unauthenticated, successful login always redirected to `/` (dashboard) instead of the originally requested page. `ProtectedRoute` now saves the pre-redirect path to `sessionStorage` (`sahu-last-route`); `login.tsx` reads, clears, and navigates to it after login. |

| 28 | ✅ Fixed | `lib/mailer/index.ts` · `lib/queue-client.ts` · `routes/auth/login-helpers.ts` · `routes/auth/otp.ts` | Email OTP was never delivered. `enqueueEmail()` in `queue-client.ts` was a no-op stub that discarded its argument; `buildOtpMailOptions()` in `mailer/index.ts` returned `null`. OTP codes were saved to the DB but never sent. Fixed by calling `sendOtpEmail(to, otp, purpose, expiresAt)` directly from the mailer in both call sites. |
| 29 | ✅ Fixed | `lib/mailer/transport.ts` · `lib/mailer/templates/*.ts` | All template files imported `createTransporter`, `getFromEmail`, `esc`, and `buildV2Html` from `transport.ts`, but those four functions did not exist — any template call would throw `TypeError` at runtime. HTML emails fell back to plain-text stubs. Fixed by adding the missing functions to `transport.ts` and re-exporting `sendOtpEmail` from `templates/otp.ts` in `mailer/index.ts`. |
| 30 | ✅ Fixed | `lib/mailer/index.ts` | Admin registration-alert emails were never delivered. `mailer/index.ts` defined its own `sendNewRegistrationAdminEmail(adminEmails: string[], username: string)` stub, but `register.ts` called it with a rich object `{ adminEmail, adminName, applicantUsername, ... }` matching the signature in `adminAlerts.ts`. esbuild strips types without checking, so the mismatch compiled silently. At runtime `for...of` on a plain object threw `TypeError: object is not iterable`, caught silently by the `.catch()` in `register.ts`. Fixed by removing the stub from `mailer/index.ts` and re-exporting `sendNewRegistrationAdminEmail` from `./templates/adminAlerts` (the rich V2 dark template with correct signature). |

---

## 🔵 Schema / Database

| # | Status | File | Issue |
|---|--------|------|-------|
| 20 | ✅ Fixed | `schema/ledger.ts` | `ledger.createdBy → users.id` is now a foreign key with `RESTRICT`, preserving financial history and requiring deactivation instead of destructive deletion. |
| 21 | ✅ Fixed | `schema/` (multiple) | User-owned dependent tables now define the appropriate cascading foreign keys; financial ledger records intentionally use `RESTRICT`. |

---

## 🔵 Configuration / Maintenance

| # | Status | File | Issue |
|---|--------|------|-------|
| 22 | ✅ Fixed | `routes/health.ts` | `/health` reads its version dynamically from the package metadata. |
| 23 | ✅ Fixed | `routes/health.ts` | The VAPID contact uses `VAPID_EMAIL` with a generic fallback rather than a personal address. |
| 24 | ✅ Fixed | `geo-block.ts` · `package.json` | A weekly `node-cron` updater refreshes and hot-reloads the bundled GeoIP database when `MAXMIND_LICENSE_KEY` is available. |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ⬜ Open | Not yet fixed |
| 🔧 In Progress | Being worked on |
| ✅ Fixed | Resolved and verified |

---

## Historical Fix Priority Order

1. **#1** — Wrap `POST /ledger` in a database transaction *(fixed)*
2. **#2** — Add `createdBy` ownership checks to AePS queries *(fixed)*
3. **#3** — Implement async PDF generation and configure an SMS provider *(still open)*
4. **#4** — Add rate limiting to `/api/geo` *(fixed)*
5. **#14** — Add Zod validation to admin receipt-export params *(fixed)*
6. **#16, #17, #18** — Fix form resets *(fixed)*
7. **#8** — Fix month-boundary timezone handling *(fixed)*
8. **#9, #10** — Fix ZIP error handling and disconnect abort *(fixed)*
9. **#20, #21** — Add FK constraints and cascade deletes *(fixed with financial-record restrictions)*
10. **#22, #23, #24** — Config/maintenance cleanup *(fixed)*
