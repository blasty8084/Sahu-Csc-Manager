# SAHU CSC — Issues & Fix List
**Version 4.1.1 · Last updated: July 13, 2026**

> Comprehensive audit of all known bugs, security gaps, performance problems, and technical debt.
> Ordered by priority: 🔴 Critical → 🟠 High → 🟡 Medium → 🟢 Low.

---

## Table of Contents

- [🔴 Critical (4)](#-critical)
- [🟠 High (7)](#-high)
- [🟡 Medium (10)](#-medium)
- [🟢 Low (12)](#-low)
- [Summary](#summary)

---

## 🔴 Critical

> Security vulnerabilities and data integrity risks. Fix before next deployment.

---

### C-1 · CORS wildcard allows any origin with credentials

| | |
|---|---|
| **File** | `artifacts/api-server/src/app.ts:160` |
| **Status** | ❌ Open |

```js
app.use(cors({ origin: true, credentials: true }));
```

`origin: true` mirrors the caller's `Origin` header back verbatim — any external website can
make credentialed API requests using the user's active session cookie. In production this is a
full cross-site request forgery (CSRF) attack surface.

**Fix:** Restrict to the deployment domain via a `CORS_ORIGIN` environment variable:
```ts
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") ?? "http://localhost:5000",
  credentials: true,
}));
```

---

### C-2 · 121 async route handlers — only 28 have try/catch

| | |
|---|---|
| **Files** | All `artifacts/api-server/src/routes/*.ts` |
| **Status** | ❌ Open |

Most handlers are `async (req, res): Promise<void>` with no `try/catch`. An unhandled DB error
(connection drop, constraint violation, timeout) sends no response and the client hangs — or
Express sends a raw 500 with a stack trace if the global error handler catches it in time.

**Fix:** Add a global `asyncHandler` wrapper:
```ts
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```
Then wrap every route: `router.get("/path", asyncHandler(async (req, res) => { ... }))`.

---

### C-3 · `email_otps` table — no index on `(email, purpose, createdAt)`

| | |
|---|---|
| **File** | `lib/db/src/schema/email_otps.ts` |
| **Status** | ❌ Open |

The OTP rate-limit check runs on every `/auth/send-otp` request:
```sql
SELECT count(*) FROM email_otps
WHERE email = ? AND purpose = ? AND created_at > ?
```
Zero indexes exist on this table → full table scan on every OTP request. As the table grows
(OTPs are soft-deleted after expiry cleanup runs hourly) this becomes a hot slow query.

**Fix:** Add to schema:
```ts
index("idx_email_otps_email_purpose_created").on(t.email, t.purpose, t.createdAt),
index("idx_email_otps_expires_at").on(t.expiresAt), // speeds up hourly cleanup
```

---

### C-4 · OTP verify endpoint has no brute-force lockout

| | |
|---|---|
| **File** | `artifacts/api-server/src/routes/auth/otp.ts` |
| **Status** | ❌ Open |

The send-OTP endpoint is rate-limited (3 per 15 min window) but the **verify** endpoint has no
failed-attempt counter. An attacker who triggers one valid OTP send can brute-force all
1,000,000 possible 6-digit codes until the correct one is found — bypassing account security.

**Fix:** Track failed verify attempts in `email_otps` (add a `failedAttempts integer` column
or a separate counter). After 5 wrong attempts, mark the OTP as void and require a new send.

---

## 🟠 High

> Feature-breaking bugs and UX problems. Fix in the current sprint.

---

### H-1 · `vendor-react` chunk is 0 KB — React bundled into main 447 KB chunk

| | |
|---|---|
| **File** | `artifacts/sahu-csc/vite.config.ts:241` |
| **Status** | ❌ Open |

```js
manualChunks: { "vendor-react": ["react", "react-dom"], ... }
```
The production build shows `vendor-react-*.js` at **0.00 KB**. Rollup resolved React as an
internal dependency of another chunk first; the manual split was silently ignored. React
(~140 KB) is buried inside the main `index-*.js` (447 KB), which must fully load before
anything renders.

**Fix:** Switch to the function form of `manualChunks`:
```ts
manualChunks(id) {
  if (id.includes("node_modules/react") || id.includes("node_modules/react-dom"))
    return "vendor-react";
  if (id.includes("node_modules/framer-motion")) return "vendor-motion";
  // ... etc
}
```

---

### H-2 · 24 of 35 `useQuery` hooks have no `staleTime`

| | |
|---|---|
| **Files** | `artifacts/sahu-csc/src/pages/*.tsx`, `src/hooks/*.ts` |
| **Status** | ❌ Open |

Only 11 of 35 queries set `staleTime`. The other 24 use React Query's default (`0`) — data is
considered immediately stale, so every window focus, tab switch, or component remount triggers
a fresh API call even if data arrived 2 seconds ago.

**Fix:** Set sensible defaults per query type:
| Query type | Recommended `staleTime` |
|---|---|
| User / auth / session | `60_000` (1 min) |
| Dashboard stats | `30_000` (30 s) |
| Notifications unread count | `15_000` (15 s) |
| Settings / services | `300_000` (5 min) |

Or set a global default in the `QueryClient` constructor:
```ts
new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })
```

---

### H-3 · No `/api/health` endpoint — returns 404

| | |
|---|---|
| **File** | `artifacts/api-server/src/routes/` (missing route) |
| **Status** | ❌ Open |

Every health check (PM2, load balancer, Replit port probe) sends `GET /api/health` and gets
`404 Cannot GET /api/health`. The Worker Server has a health server ✅ but the main API has
no equivalent.

**Fix:**
```ts
router.get("/health", (_req, res) => {
  res.json({ status: "ok", version: "4.1.1", uptime: process.uptime() });
});
```

---

### H-4 · Missing Zod validation on `ledger`, `services`, and `audit` routes

| | |
|---|---|
| **Files** | `routes/ledger.ts`, `routes/services.ts`, `routes/audit.ts` |
| **Status** | ❌ Open |

These routes read directly from `req.body` without `z.safeParse()`. Malformed input (wrong
types, missing required fields, oversized strings) causes unhandled runtime errors instead of
clean `400 Bad Request` responses — and potentially crashes the route handler (see C-2).

**Fix:** Define a Zod schema for each request body and validate before using any field:
```ts
const schema = z.object({ date: z.string().date(), amount: z.number().positive(), ... });
const parsed = schema.safeParse(req.body);
if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
```

---

### H-5 · Orphaned rows on user delete — missing FK cascade on 3 tables

| | |
|---|---|
| **Files** | `schema/user_preferences.ts`, `schema/push_subscriptions.ts`, `schema/receipt_counters.ts` |
| **Status** | ❌ Open |

When an admin deletes a user, `user_preferences`, `push_subscriptions`, and `receipt_counters`
rows are left behind because their `userId` columns have no `references(..., { onDelete: "cascade" })`.
The `user_sessions` and `user_notification_preferences` tables already have cascade ✅.

**Fix:** Add to each missing table:
```ts
userId: integer("user_id")
  .notNull()
  .references(() => usersTable.id, { onDelete: "cascade" }),
```
Then run `drizzle-kit push` (requires TTY — apply via raw `ALTER TABLE` if needed).

---

### H-6 · Worker Server workflow fails silently on every project restart

| | |
|---|---|
| **File** | Worker Server workflow config |
| **Status** | ❌ Open |

The Worker Server exits immediately when `REDIS_URL` is not set (correct behaviour) but the
Replit workflow marks it as **failed** on every restart, polluting logs and causing noise.

**Fix:** Prefix the workflow command with a guard:
```bash
[ -z "$REDIS_URL" ] && echo "REDIS_URL not set — worker server skipped" && exit 0; \
PORT=8081 pnpm --filter @workspace/worker-server run build && \
PORT=8081 node --enable-source-maps artifacts/worker-server/dist/index.mjs
```

---

### H-7 · Broadcast email still sent inline — blocks admin response

| | |
|---|---|
| **File** | `artifacts/api-server/src/routes/broadcast.ts` |
| **Status** | ❌ Open |

Push notifications are now queued via `enqueueNotification()` ✅ but `sendBroadcastEmail(...)`
is still `await`-ed inline. Sending to 100+ recipients blocks the admin's HTTP response for
the entire SMTP round-trip duration (potentially 5–30 seconds).

**Fix:** Queue one email job per recipient using `enqueueEmail()`, or add a `broadcast-email`
job type to the worker server that fans out internally.

---

## 🟡 Medium

> Performance and reliability issues. Fix in the next sprint.

---

### M-1 · Missing composite index: `notifications.(userId, createdAt)`

| | |
|---|---|
| **File** | `lib/db/src/schema/notifications.ts` |
| **Status** | ❌ Open |

Existing indexes: `userId`, `isRead`, `(userId, isRead)`, `createdAt`. The most common query
is `WHERE user_id = ? ORDER BY created_at DESC LIMIT 50` — Postgres must filter by `userId`
then sort, even though both operations could use one index.

**Fix:**
```ts
index("idx_notifications_user_created").on(t.userId, t.createdAt),
```

---

### M-2 · No index on `email_otps.email`

| | |
|---|---|
| **File** | `lib/db/src/schema/email_otps.ts` |
| **Status** | ❌ Open |

OTP verification (`POST /auth/verify-otp`) looks up by `email` with no index. Under normal
usage the table is small (OTPs expire in 10 min) but under load or an OTP flood the verify
lookup scans the full table. Also covered partially by C-3.

---

### M-3 · `notifications` endpoint returns all rows — no pagination

| | |
|---|---|
| **File** | `artifacts/api-server/src/routes/notifications.ts` |
| **Status** | ❌ Open |

`GET /api/notifications` fetches every notification for the current user with no `LIMIT`. A
user with 500+ notifications (common after months of use) generates a large payload on every
page load and every React Query refetch.

**Fix:** Add cursor or offset pagination:
```ts
const page = parseInt(req.query.page as string) || 0;
const PAGE_SIZE = 50;
// .limit(PAGE_SIZE).offset(page * PAGE_SIZE)
```

---

### M-4 · `recharts` (421 KB) loads on every page

| | |
|---|---|
| **File** | `artifacts/sahu-csc/vite.config.ts`, report page imports |
| **Status** | ❌ Open |

`recharts` is correctly placed in its own `vendor-charts` chunk (421 KB, 113 KB gzip) but it
is statically imported by the reports page, which is itself lazy-loaded. The chunk still
downloads on first visit to Reports. On non-Reports pages it is never needed.

**Fix:** Verify that the reports page's own chunk does not transitively pre-load recharts via
static import in `layout.tsx` or `App.tsx`. If so, move any chart references behind a dynamic
`import()`.

---

### M-5 · `as any` / `: any` — 289 occurrences in the API server

| | |
|---|---|
| **Files** | Multiple — worst in `routes/admin.ts`, `routes/aeps/sessions.ts`, `routes/aeps/transactions.ts` |
| **Status** | ❌ Open (incremental)  |

Key offenders:
- `aeps/sessions.ts:17` — `export function fmt(n: any)` with no return type
- `aeps/transactions.ts:42` — `const sessionWhere: any[]`
- `admin.ts:168` — `(req.session as any)?.userId`
- `admin-receipt-export.ts:55` — `entries.map((e: any) => ...)`

**Fix (incremental):** Type the three most-used helpers first (`fmt`, `fmtUser`, session type
augmentation), which will cascade and remove ~80 downstream `any` casts automatically.

---

### M-6 · `user_preferences` table — no FK reference to `usersTable`

| | |
|---|---|
| **File** | `lib/db/src/schema/user_preferences.ts` |
| **Status** | ❌ Open |

`userId` is `notNull().unique()` but has no `.references(() => usersTable.id, { onDelete: "cascade" })`.
Deleting a user leaves their preferences row orphaned and the `userId` slot permanently
occupied, which can cause confusion if the ID is ever reused (serial IDs can wrap in theory).

---

### M-7 · Monthly receipt export — full month loaded into memory

| | |
|---|---|
| **File** | `artifacts/api-server/src/routes/admin-receipt-export.ts` (355 lines) |
| **Status** | ❌ Open |

The monthly export fetches all ledger entries for a calendar month into a JS array, builds a
PDF via PDFKit, then streams the finished PDF. For a busy CSC with 2,000+ entries per month
this causes a large memory spike and can OOM the server process.

**Fix:** Stream PDFKit output directly to the response while fetching entries in pages
(`LIMIT 200 OFFSET ?`) and writing each page to the PDF stream before fetching the next.

---

### M-8 · Missing index on `password_reset_tokens.userId`

| | |
|---|---|
| **File** | `lib/db/src/schema/password_reset_tokens.ts` |
| **Status** | ❌ Open |

Token lookup is by the token value (unique ✅) but token cleanup queries delete by `userId`.
No index on `userId` means a sequential scan per cleanup.

**Fix:**
```ts
index("idx_prt_user_id").on(t.userId),
```

---

### M-9 · `staleTime` missing on dashboard and layout header queries

| | |
|---|---|
| **Files** | `pages/dashboard.tsx`, `components/layout.tsx` |
| **Status** | ❌ Open |

The dashboard stats query and the unread-notifications count badge in the layout header both
refetch on every window focus. Even with server-side Redis caching, this still fires real HTTP
requests from the client on every tab switch.

---

### M-10 · `req.session as any` — session type not augmented

| | |
|---|---|
| **Files** | `routes/admin.ts:168`, `routes/admin.ts:225`, `lib/auth.ts` |
| **Status** | ❌ Open |

`req.session` is cast to `any` to access `userId` because the session type was never augmented.
This causes TypeScript to skip type-checking on session field access throughout the app.

**Fix:** Add a session type declaration once:
```ts
// src/types/session.d.ts
import "express-session";
declare module "express-session" {
  interface SessionData {
    userId?: number;
    role?: string;
  }
}
```

---

## 🟢 Low

> Tech debt and polish. Fix when bandwidth allows.

---

| # | Issue | File | Notes |
|---|---|---|---|
| L-1 | `DailyTab.tsx` is **1,734 lines** — monolithic | `pages/aeps/DailyTab.tsx` | Split into `AepsWithdrawalForm`, `AepsDepositForm`, `AepsTransactionTable` components |
| L-2 | `reports.tsx` is **1,089 lines** | `pages/reports.tsx` | Split into `ReportsFilters`, `ReportsSummaryCards`, `ReportsChart`, `ReportsTable` |
| L-3 | `LoginForm.tsx` is **999 lines** | `components/auth/LoginForm.tsx` | Split login steps into sub-components |
| L-4 | `fmt(n: any)` in AePS sessions — untyped formatter | `routes/aeps/sessions.ts:17` | Type as `fmt(n: string \| number \| null): string` |
| L-5 | Seed script has placeholder address `"Dist-XXX, Odisha - 000000"` | `scripts/seed.ts:91` | Replace with a real or clearly labelled example value |
| L-6 | No offline fallback page in Service Worker | `src/sw.ts` / Workbox config | Add a `/offline.html` precached fallback for uncached navigation routes |
| L-7 | `receipt_counters` table — no index on `userId` | `schema/receipt_counters.ts` | Used in atomic receipt-number generation; add `index("idx_rc_user_id").on(t.userId)` |
| L-8 | `push_subscriptions` — no FK cascade delete on user remove | `schema/push_subscriptions.ts` | Add `references(() => usersTable.id, { onDelete: "cascade" })` to `userId` |
| L-9 | `backup.ts` (scheduled job) uses `console.log` — should use `logger` | `scripts/backup.ts` | Replace `console.log/error` with `import { logger } from "../lib/logger"` |
| L-10 | Zero test coverage on route handlers | `src/__tests__/` | Only `auth-session.test.ts` exists; add tests for ledger, admin, and auth routes |
| L-11 | `MULTI_INSTANCE_SETUP.md` does not reference `pm2.config.js` | `MULTI_INSTANCE_SETUP.md` | Update the PM2 section to point to the root `pm2.config.js` |
| L-12 | `sahu-logo.png` only 26% compressed (88 KB → 66 KB) | `public/sahu-logo.png` | Run through a WebP conversion or a higher-quality lossy optimizer; target < 30 KB |

---

## Summary

| Priority | Count | Theme |
|---|---|---|
| 🔴 Critical | 4 | CORS wildcard, missing try/catch wrappers, OTP index + brute-force |
| 🟠 High | 7 | React chunk split broken, staleTime, health endpoint, Zod validation, cascade deletes, Worker Server noise, broadcast email blocking |
| 🟡 Medium | 10 | Pagination, memory export, missing indexes, `any` casts, session type, recharts chunk |
| 🟢 Low | 12 | Giant page files, placeholder data, offline fallback, test coverage, logo compression |
| **Total** | **33** | |

---

## Recommended Fix Order

```
1. C-1  CORS lockdown            — 5 min, one line change, massive security gain
2. H-3  /api/health endpoint     — 10 min, prevents load-balancer false alarms
3. C-3  email_otps index         — 5 min, one schema line + drizzle-kit push
4. H-2  staleTime defaults       — 20 min, reduces API calls by ~40% in active sessions
5. C-2  asyncHandler wrapper     — 1 hour, eliminates all unhandled promise gaps at once
6. C-4  OTP brute-force lockout  — 2 hours, closes authentication bypass
7. H-1  React chunk fix          — 30 min, removes 140 KB from first-paint bundle
8. H-4  Zod on ledger/services   — 2 hours, input validation coverage
9. H-5  FK cascade on 3 tables   — 30 min, data integrity
10. H-6 Worker Server guard      — 5 min, one-line workflow command change
```

> After step 5 (asyncHandler), most of the Medium `try/catch`-related issues resolve automatically.
> Setting `REDIS_URL` as a Replit Secret at any point unlocks Redis cache, cross-instance rate limiting, and the Worker Server — all already built and waiting.
