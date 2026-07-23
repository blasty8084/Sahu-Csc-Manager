# SAHU CSC — Bug & Issue Tracker

> Original audit generated: 14 July 2026
> Status reconciled: 23 July 2026 against the current API, frontend, schema, and changelog
> Current total: **1 open / 23 fixed** — the async PDF/SMS worker limitation remains intentionally explicit

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
