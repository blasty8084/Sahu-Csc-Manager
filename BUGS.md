# SAHU CSC — Bug & Issue Tracker

> Generated: 14 July 2026 · Last reviewed: 23 July 2026  
> Scanned: API server, frontend, database schema, configuration  
> Total: **23 open / 1 fixed** — 3 Critical · 4 Security · 6 Logic · 2 Validation · 3 Frontend open + 1 fixed · 2 Schema · 3 Config

---

## 🔴 Critical / Data Integrity

| # | Status | File | Issue |
|---|--------|------|-------|
| 1 | ⬜ Open | `routes/ledger.ts` | `POST /ledger` inserts ledger entry + updates balance + writes receipt token in **separate statements with no transaction** — a crash mid-way leaves balance and ledger out of sync. |
| 2 | ⬜ Open | `routes/aeps/transactions.ts` | AePS daily session queries fetch by `id` without checking `createdBy === userId` — a user who guesses another's session ID can read their data. |
| 3 | ⬜ Open | `workers/pdf.worker.ts` · `workers/sms.worker.ts` | Both workers are **stubs with TODO comments** — they log "success" without doing any work. PDF receipts and SMS are silently never sent to users. |

---

## 🟠 Security

| # | Status | File | Issue |
|---|--------|------|-------|
| 4 | ⬜ Open | `routes/health.ts` | `/api/geo` endpoint has **no rate limiting** — any caller can freely probe country/IP lookups for arbitrary IPs. |
| 5 | ⬜ Open | `app.ts` | `CORS_ORIGIN` falls back to `http://localhost:5000` when unset — if the env var is ever missing in production, cross-origin requests from localhost are silently allowed. |
| 6 | ⬜ Open | `app.ts` | Rate-limiter loopback bypass (`127.0.0.1`) is gated on `NODE_ENV !== "production"`, but `req.ip` comes from `X-Forwarded-For` via `trust proxy` — spoofable if the upstream proxy is misconfigured. |
| 7 | ⬜ Open | `routes/settings/vapid.ts` | VAPID keys are **written into `process.env` at runtime** — causes inconsistency across multi-instance deployments where each process may hold different in-memory values. |

---

## 🟡 Logic Bugs

| # | Status | File | Issue |
|---|--------|------|-------|
| 8 | ⬜ Open | `routes/ledger.ts` | Period calculation for the "month" filter uses **local machine time** — causes off-by-one boundary errors for IST users when the server clock is UTC. |
| 9 | ⬜ Open | `routes/admin-receipt-export.ts` | ZIP stream error handler checks `!res.headersSent` after the response is already in `application/zip` binary mode — sends a **corrupted ZIP** instead of a clean JSON error on failure. |
| 10 | ⬜ Open | `routes/admin-receipt-export.ts` | Expensive PDF generation loop has **no client-disconnect abort** — if the user closes the browser, the loop runs to completion, wasting CPU and memory for nothing. |
| 11 | ⬜ Open | `routes/auth/login.ts` | "Remember Me" hardcodes a 30-day cookie but `express-session` in `app.ts` defaults to 24 hours — **conflicting session durations** with unpredictable results depending on which setting wins. |
| 12 | ⬜ Open | `routes/ledger.ts` | `notifyLargeTransaction` failure is silently swallowed with `.catch(() => {})` — large-transaction alerts can fail with no log entry or retry attempt. |
| 13 | ⬜ Open | `routes/ledger.ts` | Large-transaction notification threshold (`₹10,000`) is **hardcoded** in source — should be a per-operator configurable setting. |

---

## 🟡 Missing Input Validation

| # | Status | File | Issue |
|---|--------|------|-------|
| 14 | ⬜ Open | `routes/admin-receipt-export.ts` | `startDate`, `endDate`, `userId` query params and the monthly-export POST body are **manually cast without Zod** — malformed dates or NaN values pass through to the database layer. |
| 15 | ⬜ Open | `routes/receipts.ts` | `req.params.token` is used directly in a DB query with **no format validation** — any arbitrary string hits the database. |

---

## 🟡 Frontend Bugs

| # | Status | File | Issue |
|---|--------|------|-------|
| 16 | ⬜ Open | `pages/ledger.tsx` | Ledger entry form does **not call `form.reset()`** after a successful submit — stale values persist when the dialog is reopened for a new entry. |
| 17 | ⬜ Open | `pages/udhari.tsx` | "Add Customer" form does **not reset** after success — previous customer name and details remain populated in the input fields. |
| 18 | ✅ Fixed | `pages/register.tsx` → `components/auth/RegisterForm.tsx` | `form.reset()`, `setFormValues(null)`, and `setOtpDigits([])` called after every successful submit path — sensitive state cleared before redirect. Fixed as part of register page refactor (July 18, 2026). |
| 19 | ⬜ Open | `App.tsx` | `ShareTargetHandler` calls `setLocation` inside `useEffect([])` with an empty dependency array — **stale closure** risk if wouter's `setLocation` reference ever changes. |

---

## 🔵 Schema / Database

| # | Status | File | Issue |
|---|--------|------|-------|
| 20 | ⬜ Open | `schema/ledger.ts` | No **foreign key** from `ledger.createdBy → users.id` — deleting a user leaves orphaned ledger rows; admin receipt export JOINs return silent null user fields. |
| 21 | ⬜ Open | `schema/` (multiple) | Several FK columns have **no `onDelete: cascade`** — deleting a user leaves dangling rows in `push_subscriptions`, `audit_logs`, `aeps_transactions`, and `udhari_*` tables. |

---

## 🔵 Configuration / Maintenance

| # | Status | File | Issue |
|---|--------|------|-------|
| 22 | ⬜ Open | `routes/health.ts` | `/health` hardcodes `version: "4.1.2"` — should read dynamically from `package.json` the same way the frontend uses `__APP_VERSION__`. |
| 23 | ⬜ Open | `routes/health.ts` | Fallback VAPID contact email is a **personal address hardcoded in source** — should be an env var (`VAPID_EMAIL`). |
| 24 | ⬜ Open | `geo-block.ts` · `package.json` | `geoip-lite` ships a **static IP database** with no scheduled update — the database goes stale within weeks of deployment and no `updatedb` script is wired to startup or CI. |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ⬜ Open | Not yet fixed |
| 🔧 In Progress | Being worked on |
| ✅ Fixed | Resolved and verified |

---

## Fix Priority Order

1. **#1** — Wrap `POST /ledger` in a database transaction *(data integrity)*
2. **#2** — Add `createdBy` ownership check to AePS queries *(security)*
3. **#3** — Implement PDF and SMS workers *(broken features)*
4. **#4** — Add rate limiting to `/api/geo` *(security)*
5. **#14** — Add Zod validation to admin receipt export params *(validation)*
6. **#16, #17, #18** — Fix form resets *(UX)*
7. **#8** — Fix month-boundary timezone handling *(correctness)*
8. **#9, #10** — Fix ZIP error handling and disconnect abort *(reliability)*
9. **#20, #21** — Add FK constraints and cascade deletes *(schema integrity)*
10. **#22, #23, #24** — Config/maintenance cleanup *(housekeeping)*
