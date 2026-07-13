# SAHU CSC — Common Service Center Management Platform
**Version 4.0.2** — last updated 2026-07-13

> Re-imported and re-set-up on Replit 2026-07-11: ran `pnpm install`, pushed schema via `drizzle-kit push` (`pnpm exec drizzle-kit push --config=drizzle.config.ts` from `lib/db/`), seeded admin/operator via the `Seed Database` workflow, and started `API Server` + `SAHU CSC` workflows. `ADMIN_PASSWORD` and `OPERATOR_PASSWORD` were re-requested as Replit Secrets (a fresh import means a fresh, empty database, so these seed-account passwords must be re-provided each time); `SESSION_SECRET` already existed. Verified login works via curl.
>
> Note: re-importing this project always resets the database to empty. After every import, re-run in order: `pnpm install` → `drizzle-kit push` (from `lib/db/`) → `Seed Database` workflow → start `API Server` + `SAHU CSC` workflows.
>
> **Fixed a workflow bug**: the `API Server` workflow ran `PORT=8080 ... pnpm run build && node index.mjs` — in bash, a `VAR=val` prefix only applies to the command immediately before `&&`, so `node index.mjs` was inheriting the reserved `PORT=5000` (set in `.replit` `[userenv.shared]`) instead of 8080, colliding with the frontend's port. Fixed by prefixing `node` with its own `PORT=8080` too.
>
> **Fixed a fresh-`node_modules` build failure (2026-07-11)**: after a clean `pnpm install`, the API Server build failed at runtime with `ERR_MODULE_NOT_FOUND` for `@opentelemetry/instrumentation`, then `@opentelemetry/core`, then `@opentelemetry/sdk-trace-base` in turn. `build.mjs` externalizes `@opentelemetry/*` (to dodge the drizzle-orm dual-peer conflict — see Sentry note below), so esbuild doesn't bundle it, but pnpm only hoists *direct* dependencies into `artifacts/api-server/node_modules`; these three are transitive deps of `@sentry/node`/`@sentry/opentelemetry`/`@sentry/node-core` that were never hoisted. Fixed by adding all three as explicit `dependencies` in `artifacts/api-server/package.json` (alongside the existing `@opentelemetry/api`) so pnpm hoists them. If a future Sentry upgrade throws the same `ERR_MODULE_NOT_FOUND` for a new `@opentelemetry/*` subpackage, add it the same way.

## What's New in v4.0.3 (July 13, 2026) — Worker Server (BullMQ async offloading)

| Change | Description |
|--------|-------------|
| **`artifacts/worker-server/`** | New `@workspace/worker-server` package — isolated background processor on port 8081. Runs push notifications, emails, PDF (stub), and SMS (stub) as BullMQ jobs. |
| **BullMQ queues** | Four queues: `notifications`, `emails`, `pdf-generation`, `sms`. Workers: `notification.worker.ts` (web-push), `email.worker.ts` (nodemailer), `pdf.worker.ts` (stub), `sms.worker.ts` (stub). |
| **`queue-client.ts`** | New `artifacts/api-server/src/lib/queue-client.ts` — produces jobs to BullMQ when `REDIS_URL` is set; falls back to direct in-process execution when not set. No API contract changes. |
| **Template builders** | `approval.ts`, `rejection.ts`, `otp.ts` — added `build*MailOptions()` exports (pure, sync HTML render) so the api-server can pre-render emails before queuing them. |
| **Routes updated** | `admin-appeals.ts`, `admin-registration.ts`, `broadcast.ts`, `auth/otp.ts` — push/email calls now go through `enqueueNotification()` / `enqueueEmail()`. |
| **`pm2.config.js`** | Root PM2 ecosystem config: `api-server` in cluster mode, `worker-server` in fork mode (1 instance). |
| **`Worker Server` workflow** | Added workflow (console, port 8081). Needs `REDIS_URL` secret to activate queue mode. Without it, the worker server won't start (exits with a clear message), and the api-server handles everything directly. |

### To enable full async queue mode

1. Add `REDIS_URL` as a Replit Secret — set it to your Upstash Redis **direct TCP URL** (`rediss://...`), found in the Upstash dashboard under "Redis" → your database → "Connect" → "ioredis". This is **different** from `UPSTASH_REDIS_REST_URL` (the HTTP REST endpoint).
2. Start the **Worker Server** workflow.
3. The api-server logs `Queue client initialised (Redis-backed)` on startup when connected.

Without `REDIS_URL`, everything continues to work via direct in-process calls (existing behaviour). The worker server is optional.

## What's New in v4.0.2 (July 13, 2026) — Image & Loader Polish

| Change | Description |
|--------|-------------|
| **Lazy images (remaining)** | `loading="lazy"` on `layout.tsx` ×2 (nav avatars) and `AppLogo`. Splash/skeleton/LoginLogo kept eager. |
| **`/admin/appeals` limit** | `.limit(500)` — last unbounded list query on the checklist. |
| **`sahu-logo-glow.png` deleted** | Zero references in code — orphaned. 175 KB removed from build. |
| **EagerPreloader → `requestIdleCallback`** | Fires when browser is idle instead of fixed 3s; `{ timeout: 5000 }` hard cap; `setTimeout(3000)` fallback for older Safari. |

## What's New in v4.0.1 (July 13, 2026) — Redis Rate Limiting & Multi-Instance Readiness

| Change | Description |
|--------|-------------|
| **`rate-limit-redis`** | Installed; all 4 rate limiters now use a shared Upstash Redis store when `CACHE_BACKEND=redis` — counters are enforced across all worker processes, not per-process. Falls back to `MemoryStore` when Redis is absent. |
| **Key namespacing** | `rl:general:`, `rl:login:`, `rl:auth-write:`, `rl:otp-verify:` — never collide with query-cache or session keys. |
| **`MULTI_INSTANCE_SETUP.md`** | New guide: PM2 cluster mode, Node cluster module, Replit Deployments scaling, readiness checklist, connection-pool tuning. |

## What's New in v4.0.0 (July 12, 2026) — Full-Stack Performance Audit

| Change | Description |
|--------|-------------|
| **6 DB indexes** | `users.role`, `users.status`, `aeps_transactions.dailyId/type/createdAt`, `push_subscriptions.userId`, `password_reset_tokens.userId` — pushed live via `drizzle-kit push`. Fixes blind full-table scans on admin, AePS, push, and reset-token lookups. |
| **API caching expanded** | 8 new cached endpoints (5 s TTL, immediate write-invalidation): `GET /aeps/session`, `/aeps/transactions`, `/admin/aeps-overview`, `/udhari/summary`, `/udhari/customers`, `/udhari/customers/:id`, `/udhari/customers/:id/entries`, `/users`. Three new helpers: `invalidateAepsCaches`, `invalidateUdhariCaches`, `invalidateUserListCache`. |
| **Async IndexedDB persister** | Switched from `createSyncStoragePersister` (blocking sessionStorage) to `createAsyncStoragePersister` + `idb-keyval` (IndexedDB). Eliminates main-thread block after every React Query mutation. |
| **EagerPreloader deferred 3 s** | Chunk preloading fires 3 s post-login instead of immediately — first API calls no longer compete with preload requests. |
| **Query limits** | `.limit(500)` on `/udhari/customers` and `/udhari/customers/:id/entries`. |
| **Lazy images** | `loading="lazy"` on About page logo and Download App icon. |

## What's New in v3.5.10 (July 12, 2026) — Navigation Performance — Instant Page Switching

- **`AnimatePresence mode="wait"` removed**: the outgoing page was forced to finish its full 220 ms exit before the new page started mounting — a mandatory ~440 ms dead wait on every tab tap. Default `"sync"` mode lets both animate simultaneously; perceived switch delay is now ~150 ms.
- **`LiveClock` isolated as `React.memo` component**: the 1-second clock `setState` was in the root `Layout` function, re-rendering the entire layout tree every second. Extracted to its own component so only the clock `<span>` updates each tick.
- **y-translation removed from page transition**: `y: 14 → 0` triggered layout recalculation on every frame; replaced with opacity-only fade (GPU-composited, zero layout cost).
- **Transition duration 220 ms → 150 ms**: shorter, cleaner `easeOut` fade.

## What's New in v3.5.9 (July 12, 2026) — Redis Cache Live, i18n Fixes & Build Hardening

- **Redis cache activated**: `CACHE_BACKEND=redis` set; Upstash Redis (`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`) is now the live cache backend for dashboard stats, session/role lookups, and report queries. Survives server restarts, shared across instances. Fails open — Redis down → cache miss → fresh DB query, never a 500.
- **5 missing i18n keys fixed** across all 3 locales (en/hi/or): `common.platform` (register-closed/register-pending subtitle), `udhari.customer.settled` (balance badge), `udhari.customer.edit_entry` (form heading), `udhari.customer.desc_gave` / `desc_got` (entry descriptions). All Udhari customer and register pages now fully translate in Hindi and Odia.
- **Sentry/OTel upgrade guard**: `@opentelemetry/api` pinned via `pnpm-workspace.yaml` `overrides` block — one-line fix for any future `@sentry/node` major bump. Pre-build `checkDrizzlePeerSingleton()` in `build.mjs` scans `pnpm-lock.yaml` snapshots section and exits immediately with a clear remediation guide if drizzle-orm ever gets two resolution variants again.
- **Build API workflow removed**: stale references to the non-existent "Build API" workflow cleaned from the `api-server` `dev` script echo and this file. The `API Server` workflow already builds before starting — the duplicate was only a source of confusion.

## What's New in v3.5.8 (July 12, 2026) — Reports & Receipt Export Page Modularization

Pure code-organization refactor — no behavior, route, API call, `data-testid`, or visual output changed.

- **`pages/reports.tsx` split** (1301 → thin orchestrator): extracted `hooks/useReports.ts` (filter constants, formatters, `useFilterState`, `useReportsData`) and three component files — `components/reports/ReportSummaryCards.tsx` (stat cards, sparklines, KPI chips, empty state), `components/reports/ReportChart.tsx` (chart tooltip), `components/reports/ReportFilters.tsx` (mobile + desktop filter panels).
- **`pages/receipt-export.tsx` split** (1219 → thin orchestrator): extracted `components/receipt-export/types.ts` (shared interfaces + constants + formatters), `hooks/useReceiptExport.ts` (all state, `buildParams()` shared by all three bulk-export API calls, all handlers including `/bulk-export/count` · `/bulk-export/download` · `/bulk-export/excel` · monthly export), `components/receipt-export/ExportFilters.tsx` (desktop + mobile filter panels), `components/receipt-export/ReceiptPreviewList.tsx` (desktop table + expanded preview, mobile list, local `Checkbox` helper).
- **Verified**: `tsc --noEmit` clean on all three workspace projects; app renders with no console errors; all three bulk-export endpoints use identical `buildParams()` query params post-split.

## What's New in v3.5.7 (July 12, 2026) — Pluggable Cache Backend, Read-Replica Guidance & Load-Test Baseline

Scale-readiness groundwork (explicitly not urgent at current usage) — no route, API, or visual behavior changed; default (memory) backend is byte-for-byte the same as before.

- **Pluggable cache backend**: `lib/cache/backend.ts` selects a storage backend for the query cache (`lib/query-cache.ts`) and the session/role cache (`lib/auth/sessionCache.ts`) via `CACHE_BACKEND` (`memory` default, `redis` opt-in). The memory backend is the same per-namespace `Map` logic as before. The Redis backend uses `@upstash/redis` (added as a dependency to both `api-server` and `lib/db` — see the drizzle-orm dual-peer note below) and needs `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` when enabled; it fails open (treats Redis errors as cache misses) rather than 500ing. Session/role cache methods are now `async` to support this — call sites updated to `await`, semantics unchanged.
- **`@upstash/redis` + drizzle-orm dual-peer note**: adding `@upstash/redis` only to `api-server` triggered the same class of bug as the earlier `@opentelemetry/api` issue — drizzle-orm 0.45.2 lists `@upstash/redis` as an optional peer, so pnpm created a second drizzle-orm peer-resolution variant and TS types conflicted across files that don't even touch caching. Fixed by adding `@upstash/redis` to `lib/db`'s dependencies too, so both packages resolve to the same drizzle-orm instance. **If a future dependency addition causes the same "shouldInlineParams is protected"-style TS errors across unrelated files, check `node_modules/.pnpm` for more than one `drizzle-orm@version_...` folder — that's the tell.**
- **Read-replica guidance (documentation only)**: the original scale-readiness prompt assumed Neon/read-replica support; corrected here — this app runs on **Replit's built-in Postgres**, which does not expose a read-replica option today (see "Read replicas" note below, unchanged). Forward-looking guidance for if/when the app migrates to a provider that supports replicas: `GET /api/dashboard`, `GET /api/reports/*`, `GET /api/admin/users-overview`, and `GET /api/receipts/verify/:token` are read-only aggregate/lookup queries safe to route to a replica; anything inside `routes/ledger.ts` writes (create/update/delete), `routes/auth/*`, `routes/sessions.ts`, and `routes/users.ts` must stay on the primary since they read-after-write in the same request (e.g. balance recalculation, session validation immediately after login) and replica lag would cause visible inconsistency.
- **Load test re-run at higher concurrency** (50/100/200 connections, read-heavy and write-heavy mixes, disposable seeded data) — findings in `LOADTEST_FINDINGS.md`. No architecture changes made based on the results in this pass, per the scope of this round.

## What's New in v3.5.6 (July 11, 2026) — Documentation Consolidation, i18n Completion & CDN Setup Guide

Docs-only + one missing translation key — no route, API, or visual behavior changed. See `CHANGELOG_V3.md` for full details.

- **9 parallel `.md` files → 4 canonical + pointers**: `CHANGELOG_V3.md` (changelog), `architectureV3.md` (architecture/build), `replit.md` (this file — setup/workflows), `DOCS.md` (API/module reference). `BUILD.md`/`WORKFLOWS.md`/`ReplitV3.md` are now short pointer stubs; `CHANGELOG.md` trimmed to the pre-v3 archive.
- **Backfilled the missing v3.5.5 entry** into `CHANGELOG_V3.md` — the About page's changelog already listed it (Vitest tests, Sentry, ErrorBoundary) but this file never got updated, which is exactly the kind of doc drift this consolidation was meant to catch and prevent going forward.
- **i18n**: filled the one missing key (`nav.admin`) in Hindi and Odia — all 793 keys now present in all three locales.
- **CDN**: setup guide written at `CDN_SETUP.md` (Cloudflare reverse-proxy in front of the existing single-origin VM deployment, respecting already-correct origin cache headers). Documentation only — not provisioned, since it needs external DNS/account access.

## What's New in v3.5.5 (July 11, 2026) — Tests, Error Tracking & Bundle Audit

- **42 automated Vitest tests**: ledger balance math, receipt-number generation (`CSC-YYYY-NNNN`), and all auth/session middleware (`requireAuth`, `requirePermission`, `requireRole`, lockout, session durations).
- **Sentry APM** wired server-side (`@sentry/node`) and client-side (`@sentry/react`) — no-ops when `SENTRY_DSN`/`VITE_SENTRY_DSN` are unset; no PII sent.
- **React ErrorBoundary** wraps the app — unexpected render crashes show a branded recovery screen instead of a blank page.
- **Bundle audit confirmed**: `recharts`/`jsPDF`/`html2canvas` are separate lazy chunks; main bundle is 438 KB (under the 500 KB warning threshold).

## What's New in v3.5.4 (July 11, 2026) — Ledger Page Modularization

- **`pages/ledger.tsx` split** (1652 → ~600 lines): extracted into `hooks/useLedger.ts` (all React Query data hooks/mutations, service-color map, date grouping, derived customer/receipt lists) and three component files — `components/ledger/LedgerFilters.tsx` (search bar, frequent customers, filter panels), `components/ledger/LedgerEntryForm.tsx` (mobile dialog + desktop panel add/edit forms), `components/ledger/LedgerTable.tsx` (tabs header, sync banners, receipts panel, transactions table with inline-edit, pagination, mobile lists).
- **No behavior change**: routes, API calls, `data-testid`s, and visual output are unchanged — this is a pure code-organization refactor following the project's page-split pattern.
- **Verified**: `tsc --noEmit` clean on all three workspace projects; authenticated curl smoke test (login → create ledger entry → balance/list → delete) confirms create/read/balance/delete all work end-to-end after the split.

## Performance — Optimization Round 2 (2026-07-10)

Continuing from the 8.5/10 baseline (N+1 fixes, batched writes, pooled connections, cached/skipped session lookups, chunked bundles, compressed images, correct cache headers). This round adds:

- **Query-level caching**: new `lib/query-cache.ts` — a process-local 5s TTL cache in front of the heaviest read aggregates (`GET /api/dashboard`, `GET /api/admin/users-overview`, `GET /api/reports/daily`, `GET /api/reports/monthly`), invalidated immediately on any ledger create/update/delete via `invalidateLedgerCaches()`. Not Redis — this is a single-process app, so a shared cache adds infra with no benefit today; if the API ever scales to multiple instances, this must move to Redis.
- **Lightweight APM surrogate**: `app.ts` now logs every request's status-based level (error/warn/info) and flags any request over `SLOW_REQUEST_MS` (default 500ms) with `slowRequest: true` in the pino log line, so regressions are grep/alertable without a full tracing agent.
- **Load testing**: `pnpm --filter @workspace/api-server run loadtest` (autocannon) hits `/api/dashboard`, `/api/admin/users-overview`, `/healthz`. The general rate limiter now skips loopback requests (127.0.0.1) so the tool can generate real concurrent load without tripping the same per-IP limiter that protects the app from external abuse — production behavior is unchanged. **Measured on this container** (20 concurrent connections, 8s, single Node process, dev build): dashboard p50 47ms / p95 272ms / p99 362ms at ~278 req/s; admin users-overview p50 46ms / p95 251ms / p99 298ms at ~284 req/s; healthz p50 16ms / p95 32ms at ~1133 req/s. All 0 errors.
- **CDN**: not added. Static assets already get correct cache headers (immutable hashed assets, no-store on the SPA shell — see `scripts/serve.mjs`), but there is no edge/CDN layer in front of them; the Vite `dist` output is served directly from this container. A real CDN (Cloudflare, or Replit's own deployment edge) is an infrastructure choice outside app code — flagged as a follow-up, not silently claimed as done. **Setup steps documented in [`CDN_SETUP.md`](./CDN_SETUP.md)** (2026-07-11) for whoever provisions it — no code changes needed since the app is a single-origin deployment with already-correct origin cache headers; the CDN just needs to sit in front and pass those headers through.
- **Read replicas**: not added. The app connects to a single managed Postgres instance; Replit's built-in Postgres does not expose a read-replica option, so this would require an external Postgres provider. Flagged as a follow-up rather than faked. (See v3.5.7 above for which queries would be safe to route to a replica if this provider changes.)

**Honest ceiling**: this is now measured, not guessed — the numbers above are real, but they're single-process/single-container numbers, not a production-scale concurrent-user benchmark. Getting believably closer to 10/10 still needs a CDN, either read replicas or a managed cache tier (Redis) for multi-instance scaling, and a real APM/tracing service (e.g. via a Sentry or OpenTelemetry integration) instead of log-based flags.

## Replit Setup

### How to run
- **Frontend** (port 5000): `SAHU CSC` workflow — `PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run dev`
- **API Server** (port 8080): `API Server` workflow — `node --enable-source-maps artifacts/api-server/dist/index.mjs`
- **Seed DB**: Run the `Seed Database` workflow (requires `ADMIN_PASSWORD` and `OPERATOR_PASSWORD` secrets)
- **Rebuild API**: `node artifacts/api-server/build.mjs` from workspace root

### First-time setup
1. `pnpm install` from workspace root
2. Schema is auto-applied by `drizzle-kit push` (runs via `scripts/post-merge.sh`)
3. Run `Seed Database` workflow to create admin/operator accounts
4. Secrets required: `SESSION_SECRET`, `ADMIN_PASSWORD`, `OPERATOR_PASSWORD`

### Login credentials
- Admin: `admin` / value of `ADMIN_PASSWORD` secret
- Operator: `operator` / value of `OPERATOR_PASSWORD` secret

> Full platform documentation: **[DOCS.md](./DOCS.md)**

A full-stack CSC (Common Service Center) business management platform for tracking services, ledger accounting, AePS cash management, Udhari Khata (customer credit ledger), and reporting. Built for Odisha / India rural service centers. Supports PWA installation, offline operation, Android TWA packaging, and full multilingual UI (English / Hindi / Odia).

---

## What's New in v3.5.2 (July 10, 2026) — Asset & Delivery Hardening

| Change | Description |
|--------|-------------|
| **CSP enabled** | API server's `helmet` config now sets a real Content-Security-Policy (`default-src 'none'`, `frame-ancestors 'none'`) instead of `contentSecurityPolicy: false`. The API is JSON-only (no HTML/static serving), so this is a zero-risk hardening with no functional impact. |
| **Health checks skip session store** | `healthRouter` + `setupStatusRouter` now mount in `app.ts` *before* `express-session`, so uptime monitors and setup-status polling no longer trigger a `connect-pg-simple` Postgres round-trip per request. CORS/security headers still apply — only the session middleware is skipped. |
| **Image optimization pipeline** | `vite-plugin-image-optimizer` (sharp + svgo) added to `sahu-csc`'s Vite build — every build now compresses `public/` static assets and imported images (PNG/JPEG/WebP quality 80, SVG multipass). One-off pass shrank `sahu-logo-glow.png` from 1.6MB → ~144KB; ~31% total savings across all static images. |
| **Correct static asset cache headers** | Production `serve` script replaced: `sirv-cli` (which applies one cache policy to every file, including `index.html`) swapped for a custom `scripts/serve.mjs` using the `sirv` package programmatically. Content-hashed assets (`assets/*-[hash].js/css`) get `max-age=31536000, immutable`; the SPA shell (`/`, deep-linked client routes, `sw.js`) gets `no-store` so deploys are picked up immediately; unhashed static files get a short `max-age=300`. |
| **Package versions synced** | `sahu-csc` and `api-server` package versions aligned to `3.5.2` (previously drifted at `3.4.0` / `3.5.0`). |

---

## What's New in v3.5.1 (July 10, 2026) — Performance & Scale Hardening

| Change | Description |
|--------|-------------|
| **N+1 query fixes** | `GET /admin/users-overview` replaced N×2 per-user queries with one grouped aggregate + one `DISTINCT ON` query for latest entries, joined in-memory. |
| **Batched ledger balance recalc** | `recalculateBalances()` in `ledger.ts` now does a single `UPDATE ... FROM UNNEST(...)` (bound array params, not string-interpolated) instead of one `UPDATE` per row. |
| **Batched notification writes** | `notificationService.ts` fetches all recipients' prefs in one query and does a single multi-row insert instead of N per-user inserts/selects. Push-send and return-count semantics preserved exactly (push only when `prefs?.pushEnabled`, return count = targeted recipients). |
| **API bundle externalized further** | `exceljs` added to `build.mjs`'s `external` list alongside the already-external `pdfkit`/`archiver` — bundle dropped from 5.1MB → 3.6MB. All three ship as real `dependencies` so they resolve at runtime. |
| **pg pool tuned** | `lib/db/src/index.ts`: `max: 20` (env-overridable via `DB_POOL_MAX`), `idleTimeoutMillis: 30s`, `connectionTimeoutMillis: 5s` — caps concurrent connections and fails fast instead of hanging when the pool is saturated. |
| **Lightweight session/role cache** | New `lib/auth/sessionCache.ts` — 5s in-process TTL cache backing `requireAuth`'s session validation and `requireRole`/`requirePermission`'s role lookups, cutting a DB round-trip off nearly every authenticated request. Explicitly invalidated on: session revoke (self/admin), logout, role/status change, and password change/reset. |
| **Password reset/change now revokes sessions** | Both reset-password flows revoke *all* sessions for the account; self-service profile password change revokes all *other* sessions (keeps the current one). Previously a stolen session could outlive a password change. |

---

## What's New in v3.5.0 (July 10, 2026) — Backend File Split & Modularisation

| Change | Description |
|--------|-------------|
| **`routes/auth/` split** | `password-reset.ts` (424 lines) → `auth/otp.ts` (send-otp + verify-otp), `auth/forgot-password.ts` (legacy admin OTP), `auth/reset-password.ts` (token + legacy reset). `auth/index.ts` updated. `password-reset.ts` replaced with empty stub. |
| **`routes/aeps/` split** | `routes/aeps.ts` (403 lines) → `aeps/sessions.ts` (day session CRUD + admin overview) + `aeps/transactions.ts` (CRUD + public receipt verify). `routes/aeps.ts` overwritten as barrel. |
| **`routes/udhari/` split** | `routes/udhari.ts` (400 lines) → `udhari/customers.ts` (customer CRUD + summary + `recalcBalance`) + `udhari/entries.ts` (entry CRUD). `routes/udhari.ts` overwritten as barrel. |
| **`lib/monthly-export/` split** | `lib/monthly-export.ts` (395 lines) → `pdf.ts` (PDFKit renderer) + `zip.ts` (ZIP builder) + `email.ts` (send to admins) + `scheduler.ts` (node-cron). `lib/monthly-export.ts` overwritten as barrel. |
| **`routes/dashboard.ts` extracted** | `/dashboard` handler extracted from `reports.ts` (327 lines) into new standalone file. `getServiceBreakdownData` and `getAepsData` exported from `reports.ts`. |
| **`routes/admin-appeals.ts` extracted** | Appeals routes (`GET /admin/users/appeals`, `PATCH re-approve`, `PATCH dismiss-appeal`, `POST dismiss-all`) extracted from `admin-registration.ts` (321 lines). Both files now under 200 lines. |
| **Barrel pattern** | Every split uses the original filename as a barrel re-export — zero changes to any import site outside the split modules. |

---

## What's New in v3.4.0 (July 10, 2026) — Receipt Export Layout Refactor

| Change | Description |
|--------|-------------|
| **`<Layout>` adoption** | `receipt-export.tsx` now wraps in the shared `<Layout>` component. All duplicate custom navy headers, desktop stat-strip header, and mobile 4-tab fixed bottom nav removed from the page. |
| **Desktop layout** | KPI 4-column stat bar → filter row (date presets + operator dropdown) → two-column body: receipt table + checkboxes left, export panel + receipt preview + monthly auto-export right. |
| **Mobile pill tabs** | Fixed bottom 4-tab nav replaced with a horizontal pill tab row (Receipts / By Date / Summary / Export) at the top of the content area — no conflict with the global Layout bottom nav. |
| **TypeScript: `UserOverview`** | `useQuery<any[]>` and `(u: any)` map callbacks replaced with a typed `UserOverview` interface from `GET /api/admin/users-overview` response shape. |

---

## What's New in v3.3.0 (July 8, 2026) — Email & Security Hardening

| Change | Description |
|--------|-------------|
| **V2 dark premium email templates** | All 7 transactional email types rewritten with dark gradient card design (`#0a1628→#1e3a5f` page, `#0f2244` card), per-type accent colours (emerald/amber/rose/sky/violet), and HTML-injection-safe `esc()` helper applied to every dynamic field. |
| **OTP email copy strip** | Digit boxes now have a joined copy strip below showing the full OTP in large spaced monospace — easy tap-to-select on mobile. Tighter action-focused subject copy. OTP input validated as digits-only before rendering. |
| **SMTP live** | Gmail connected (`smtp.gmail.com:587`, `sahuuttam690@gmail.com`). `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_FROM_EMAIL` set as shared env vars; `SMTP_PASS` stored as secret. All transactional emails (OTP, approval, rejection, admin alert, broadcast, reset link) now deliver. |
| **Password policy** | Updated to 8+ chars, no maximum, uppercase + lowercase + number + special char required. Frontend schema and strength indicator synced with backend `passwordPolicySchema`. |
| **Login lockout tightened** | Account locks after **3** failed attempts for **5 minutes** (was 5 attempts / 15 min). |

---

## What's New in v3.2.5 (July 6, 2026) — Security Upgrade

| Change | Description |
|--------|-------------|
| **Stronger, unified password policy** | New shared `passwordPolicySchema` (`lib/password-policy.ts`) — 6 to 8 characters, upper/lower/number/special-character required. Applied consistently across registration, password reset (both legacy + token flows), profile self-service password change (was previously only `min(6)` with no complexity checks), and admin-created/updated user accounts (`users.ts`, enforced server-side since the generated `CreateUserBody`/`UpdateUserBody` schemas don't validate strength). |
| **Tighter rate limiting** | Login limiter reduced from 20→8 attempts/15min per IP. New dedicated limiters: `authWriteLimiter` (10/15min) on register/appeal/send-otp/forgot-password, `otpVerifyLimiter` (8/15min) on verify-otp/reset-password — previously these endpoints were only covered by the generous global limiter (500/15min). |
| **Field-level encryption at rest** | New AES-256-GCM helper (`lib/encryption.ts`) encrypts sensitive free-text fields that are never searched: `udhari_customers.address`, `udhari_customers.notes`, `users.address`, `users.bio`. `name`/`mobile`/`email` are intentionally left in plaintext since they're matched via `ILIKE` partial search — encrypting them would break search without a much heavier searchable-encryption scheme. Encryption key auto-generates on first use and persists in the `settings` table (same pattern as VAPID key auto-generation); can be overridden with an `ENCRYPTION_KEY` secret (32 bytes, base64) for advanced deployments. Legacy plaintext rows are read transparently (no migration needed — encryption applies going forward). |
| **Password hashing reviewed** | Confirmed existing bcrypt cost factor 12 (`lib/auth.ts`) is already industry-standard strength — no change needed. |

---

## What's New in v3.2.3 (July 5, 2026)

| Change | Description |
|--------|-------------|
| **Device Performance card on Server Health page** | New admin-only card shows live FPS (sampled continuously via `requestAnimationFrame`, updated twice/sec), target FPS, current tier (High/Medium/Low), rich-animations status, and reduced-motion status — lets an admin verify the adaptive performance system on any real device. |
| **`useLiveFps` hook** | Added inline in `server-health.tsx` — separate from the one-time startup benchmark, this continuously measures real-time frame rate for live diagnostics. |
| **Fixed false "degraded" health status** | `GET /api/healthz` previously flagged the server as degraded whenever heap usage passed 90% of `heapTotal` (currently-*allocated* heap) — but V8 normally runs heap usage near 90–98% of `heapTotal` between GC cycles as expected, steady-state behavior, not a leak. |
| **Heap check now uses the real ceiling** | Memory warning now compares `heapUsed` against `v8.getHeapStatistics().heap_size_limit` (the actual out-of-memory crash boundary) instead of `heapTotal`. `heapSizeLimitBytes` is now also included in the `/api/healthz` response and shown on the Server Health page. |

---

## What's New in v3.2.2 (July 5, 2026)

| Change | Description |
|--------|-------------|
| **Adaptive animation performance** | New `PerformanceProvider` (`hooks/use-performance-tier.tsx`) detects device capability — CPU cores, RAM (`deviceMemory`), network `saveData`/`effectiveType`, plus a one-time `requestAnimationFrame` benchmark — and buckets the session into `high` / `medium` / `low` tiers. |
| **Tier targets** | High-end devices target 60–120fps with full motion; low-end devices target 30–40fps with simplified, compositor-only effects. |
| **Rich animations gated by tier** | Decorative infinite loops (login-screen spinner ring, staggered loading dots, progress-bar sweep) are skipped on `low` tier and replaced with a cheap `animate-pulse` equivalent — same visual language, far less CPU/GPU work. |
| **Shorter transitions on weak hardware** | Page-transition and splash durations are *shortened* (not lengthened) on lower tiers — long-running animations are what visibly drop frames on weak GPUs, so `scaleDuration()` trims duration instead. |
| **Respects `prefers-reduced-motion`** | If the OS reports reduced motion, all animation durations are forced to ~0 via a global CSS rule — takes priority over tier detection and is never benchmarked. |
| **Session-cached tier** | Benchmark runs once per `sessionStorage` session (`sahu-perf-tier`) to avoid repeated rAF sampling on every page load. |
| **`data-perf-tier` / `data-reduced-motion` attributes** | Set on `<html>` so any component or CSS rule can react to the current tier without prop drilling. |

---

## What's New in v3.2.1 (July 4, 2026)

| Change | Description |
|--------|-------------|
| **Remaining spinners eliminated app-wide** | Last 4 pages using the spinner-based `SectionLoader`/`Loader2` were converted to content-shaped skeletons: `backups.tsx` (history list, schedule form), `profile.tsx` (registration toggle, full profile load), `udhari-customer.tsx` (customer header, transaction list), `sessions.tsx` (sessions list). |
| **7 new skeleton components** | Added to `skeletons.tsx`: `AdminSessionsSkeleton`, `UsersOverviewSkeleton`, `BackupHistorySkeleton`, `BackupScheduleSkeleton`, `ProfileToggleSkeleton`, `ProfilePageSkeleton`, `UdhariCustomerHeaderSkeleton`. |
| **`users.tsx` admin tabs** | Admin Sessions tab and AePS Overview tab now use `AdminSessionsSkeleton` / `UsersOverviewSkeleton` instead of spinners. |
| **Dead imports removed** | Unused `SectionLoader` imports cleaned up from `udhari.tsx`, `reports.tsx`, `notifications.tsx`, `ledger.tsx`, `dashboard.tsx`, `aeps.tsx` (those pages already used skeletons since v3.2.0). |
| **`SectionLoader` component fully retired** | No page references the spinner component anymore; only the (now-unused) component file remains. |

---

## What's New in v3.2.0 (July 4, 2026)

| Change | Description |
|--------|-------------|
| **Persistent React Query cache** | `PersistQueryClientProvider` + `createSyncStoragePersister` — sessionStorage-backed cache; staleTime 5 min, gcTime 30 min. Repeat page visits render instantly with zero loading states. |
| **`EagerPreloader` component** | Prefetches 7 key queries (dashboard, ledger, AePS, reports, services, notifications, udhari) immediately after login so every page is warm before the user navigates. |
| **14 skeleton components** | New `skeletons.tsx`: `DashboardStatsSkeleton`, `DashboardServicesSkeleton`, `RecentTxSkeleton`, `LedgerSkeleton`, `LedgerBalanceSkeleton`, `AepsSkeleton`, `ReportsSkeleton`, `NotificationsSkeleton`, `UdhariListSkeleton`, `UdhariSummarySkeleton`, `ServicesSkeleton`, `PreferencesSkeleton`, `SessionsListSkeleton`, `AuditLogsSkeleton`. |
| **All `SectionLoader` spinners removed** | Dashboard (×2), Reports, Services, Preferences, Profile/Sessions, Audit Logs (×2) — all replaced with content-shaped `animate-pulse` shimmer skeletons. |
| **Smooth page transitions** | `PAGE_ENTER` 200 ms cubic-bezier + `PAGE_EXIT` 80 ms easeIn; `willChange: opacity` only — no transform (avoids breaking `position: fixed` bottom nav). |
| **`SyncBadge` indicator** | Subtle "Updating…" dot shown in header only during background refetch — never blocks the UI. |
| **Session cache cleared on logout** | `sessionStorage.removeItem("sahu-csc-rq-cache")` in logout handler — switching accounts never shows stale data. |
| **Packages added** | `@tanstack/react-query-persist-client` · `@tanstack/query-sync-storage-persister` |

---

## What's New in v3.1.1 (July 3, 2026)

| Change | Description |
|--------|-------------|
| **Replit environment migration** | Project fully set up in Replit: DB schema pushed, DB seeded, both servers running. |
| **4 workflows configured** | SAHU CSC · API Server · Seed Database · Project (parallel launcher) |
| **TypeScript: 0 errors** | All 13 TypeScript errors fixed across API server and frontend. |
| **Backup path fix** | `../../backups` → `backups` across 4 files; `mkdirSync` added before multer init. |
| **Dev script port fix** | `${PORT:-21700}` → `${PORT:-5000}` in `sahu-csc/package.json`. |
| **Production build verified** | Full build passes: API (5.0 MB ESM) + Vite frontend + PWA service worker (76 precache entries). |
| **Backup page redesign** | "Minimal Clean" UI — 2-col desktop grid, navy borders, saffron CTAs, dashed dropzone. |
| **Backup download** | `GET /api/backups/:id/download` — streams `.sql` to browser with `Content-Disposition: attachment`. |
| **Auto-backup scheduler** | `node-cron` daily/weekly/custom cron, configurable time + retention. |
| **Selective table import** | `POST /api/backups/analyze` + `POST /api/backups/selective-import` with FK checks disabled. |
| **Setup Wizard Banner** | Admin-only, red/yellow severity, session-dismissed, expandable per-secret descriptions. |
| **`/api/setup-status`** | Public endpoint (no auth) — returns missing secrets list. |
| **Auto DB migration on import** | `scripts/post-merge.sh` runs `pnpm install` + `drizzle-kit push --force` automatically. |

---

## Workflows

| Workflow | Port | Purpose | Starts with Project |
|----------|------|---------|---------------------|
| `API Server` | 8080 | Express API — builds then runs the bundle | ✅ Yes |
| `SAHU CSC` | 5000 → :80 | Vite frontend dev server | ✅ Yes |
| `Seed Database` | — | One-shot DB seeder; requires ADMIN_PASSWORD + OPERATOR_PASSWORD secrets | ❌ Manual only |
| `Typecheck` | — | `pnpm run typecheck:libs` + per-artifact typecheck | ❌ Manual only |
| `Build Production` | — | Full typecheck + API build + frontend build, no serve | ❌ Manual only |
| `Production Preview` | 5000 | Full production build then `vite preview`-style serve (kills port 5000 first) | ❌ Manual only |

> Port 5000 is the main app URL (Replit proxy → :80). The API runs on **port 8080**. The Vite proxy in `vite.config.ts` forwards `/api/*` to `http://localhost:8080`.
> After any backend code change: restart **API Server** (it rebuilds on every start).
> The standalone `Build API` workflow was permanently removed as redundant — it duplicated the build step that already runs at the start of `API Server`. To rebuild the API bundle without restarting the server, run `node artifacts/api-server/build.mjs` from the workspace root, or use the `Build Production` workflow.

### Artifact-managed workflows (do not touch)

Each registered artifact (`artifacts/api-server`, `artifacts/sahu-csc`, `artifacts/mockup-sandbox`) auto-generates its own workflow from its `artifact.toml` (e.g. `artifacts/sahu-csc: web`, `artifacts/mockup-sandbox: Component Preview Server`). These are **not accessible to the agent** — `removeWorkflow` explicitly rejects them ("managed by an artifact and cannot be removed"), and `artifact.toml` cannot be edited directly. They show as duplicates of the main `API Server`/`SAHU CSC` workflows and may appear `failed`/`finished` when unused — this is expected and only the user can rename/remove them via the Replit project UI (artifact tabs).

### Workflow commands (current)

```bash
# API Server — builds then runs the bundle (auto-start)
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server run build && PORT=8080 node --enable-source-maps artifacts/api-server/dist/index.mjs

# SAHU CSC — frontend dev server (auto-start)
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run dev
# dev script in package.json: fuser -k ${PORT:-5000}/tcp 2>/dev/null; sleep 1; vite --host 0.0.0.0

# Seed Database — create/reset admin + operator (manual, requires secrets)
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts

# Typecheck (manual)
pnpm run typecheck:libs && pnpm -r --filter "./artifacts/**" --if-present run typecheck

# Build Production (manual)
pnpm run typecheck:libs && pnpm --filter @workspace/api-server run build && PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run build

# Production Preview (manual)
fuser -k 5000/tcp 2>/dev/null; sleep 1; pnpm run typecheck:libs && pnpm --filter @workspace/api-server run build && PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run build && PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run serve
```

---

## Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | set via `ADMIN_PASSWORD` Replit Secret |
| Operator | `operator` | set via `OPERATOR_PASSWORD` Replit Secret |

> Passwords are read from Replit Secrets — never hardcoded. Run the **Seed Database** workflow to create/reset accounts. The workflow will fail with a clear error if either secret is missing.

---

## Common Commands

```bash
# Development
pnpm --filter @workspace/api-server run dev      # API server (port 8080)
pnpm --filter @workspace/sahu-csc run dev         # Frontend (port 5000)

# Database
pnpm --filter @workspace/db run push              # Push schema changes to DB
pnpm --filter @workspace/api-server run seed      # Seed sample data (safe to re-run)

# Type checking
pnpm run typecheck:libs                           # Build lib declarations first
pnpm run typecheck                                # Full typecheck all packages

# API codegen
pnpm --filter @workspace/api-spec run codegen     # Regenerate React Query hooks + Zod schemas

# Build
pnpm run build                                    # Typecheck + build all packages
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20, TypeScript 5.9 |
| Frontend | React + Vite + Tailwind CSS v4 + shadcn/ui |
| Theme | Navy (`#0b2c60`) + Saffron (`#f97316`) |
| API | Express 5, express-session, helmet, hpp, express-rate-limit |
| Session store | connect-pg-simple (PostgreSQL-backed, survives server restarts) |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod (`zod/v4`), drizzle-zod |
| API contracts | OpenAPI spec → Orval codegen → typed React Query hooks |
| PWA | vite-plugin-pwa + Workbox service worker |
| Push notifications | web-push (VAPID) |
| i18n | i18next + react-i18next (EN / HI / OR locale JSON files) |
| Build | esbuild (ESM bundle for API) |
| Monorepo | pnpm workspaces |

---

## Data Store Architecture

The app uses **3 tiers of storage** working together:

### 1. PostgreSQL — 19 Tables (permanent data)

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `users` | id, username, email, role, active_session_token | role: admin / operator |
| `user_sessions` | sessionId, userId, deviceInfo, browser, os, ipAddress, rememberMe, isActive, expiresAt | V2 multi-device sessions |
| `session` | sid, sess, expire | Express session store (connect-pg-simple, auto-created) |
| `ledger` | date, credit, debit, balance, created_by, receipt_number, receipt_token | Per-user; running balance at insert |
| `receipt_counters` | year (PK), last_count | Atomic sequential counter per year |
| `aeps_daily` | date, opening_balance, created_by | Unique per (date, created_by) |
| `aeps_transactions` | session_id, amount, type | Linked to aeps_daily session |
| `udhari_customers` | id, name, phone, address, balance, created_by | Per-user; balance auto-recalculated |
| `udhari_entries` | id, customer_id, date, type (gave/got), amount, note, created_by | Individual credit/debit entries |
| `push_subscriptions` | user_id, endpoint, p256dh, auth | VAPID push subscription storage |
| `settings` | key, value | Key-value store for business config |
| `notifications` | title, message, type, is_read, user_id | System notifications |
| `audit_logs` | action, entity, user_id, ip, details | Full audit trail |
| `password_reset_tokens` | token, user_id, expires_at | One-time password reset |

Schema applied via: `pnpm --filter @workspace/db run push` (also runs automatically in `scripts/post-merge.sh`).

### 2. IndexedDB — 5 Stores (offline/browser)

| Store | Purpose | Expiry |
|-------|---------|--------|
| `pending_ledger` | Offline ledger entries queued for sync | Cleared after sync |
| `cache_store` | Generic KV cache (dashboard data, etc.) | Configurable (default 5 min) |
| `user_session` | Cached auth session for offline login | 24 hours |
| `cached_reports` | Previously generated reports | Configurable |
| `pending_notifications` | Notifications queued offline | Cleared when read |

### 3. Service Worker Cache — 10 Buckets (speed/offline)

| Route pattern | Strategy | Cache name |
|---------------|----------|------------|
| `/api/auth/*` | NetworkOnly | — (never cached) |
| `/api/dashboard` | StaleWhileRevalidate | api-dashboard (5 min) |
| `/api/reports` | StaleWhileRevalidate | api-reports (10 min) |
| `/api/settings` | StaleWhileRevalidate | api-settings (30 min) |
| `/api/profile` | StaleWhileRevalidate | api-profile (5 min) |
| `/api/preferences` | StaleWhileRevalidate | api-preferences (30 min) |
| `/api/ledger` | NetworkFirst | api-ledger (8s timeout, 5 min) |
| `/api/services` | NetworkFirst | api-services (8s timeout, 1 hr) |
| `/api/notifications` | NetworkFirst | api-notifications (8s timeout, 2 min) |
| Images | CacheFirst | image-cache (30 days) |
| Fonts | CacheFirst | font-cache (1 year) |

---

## Directory Structure

```
artifacts/
  api-server/src/
    routes/
      auth.ts              — Login, logout, session; full audit logging
      ledger.ts            — Ledger CRUD (per-user filtered)
      aeps.ts              — AePS daily sessions + transactions
      reports.ts           — Daily / monthly reports
      services.ts          — CSC services catalog
      users.ts             — User management (admin only)
      admin.ts             — Admin oversight: users-overview, per-user ledger, AePS overview
      sessions.ts          — List / revoke sessions (by ID, others, ALL)
      notifications.ts
      audit.ts
      settings.ts
      profile.ts
      preferences.ts
      push.ts              — Push notification subscribe/unsubscribe/list
      password-reset.ts    — OTP-based reset; enforces 8+ chars, upper, lower, number
      udhari.ts            — Udhari Khata CRUD
      receipts.ts          — Public receipt verify: GET /api/receipts/verify/:token
      broadcast.ts         — Admin push + email broadcast
      admin-receipt-export.ts
      admin-registration.ts
      admin-sessions.ts
      health.ts            — GET /api/healthz (DB + VAPID + system info)
      setup-status.ts      — GET /api/setup-status (public; returns missing secrets list)
    lib/
      auth.ts              — requireAuth / requireRole / requirePermission; parseDevice
      logger.ts            — Pino structured logger
      mailer.ts            — nodemailer SMTP: sendOtpEmail, sendApprovalEmail, isSmtpConfigured
      notify.ts            — Auto-create notifications helper
      push.ts              — web-push send helpers (sendPushToUser, sendPushToAll)
      vapid.ts             — VAPID key auto-generation on startup
      otp-cleanup.ts       — Hourly job: deletes used/expired OTP rows from email_otps
    scripts/
      seed.ts              — DB seeder (users, services, settings, notifications)
      backup.ts            — pg_dump backup to /backups/
      restore.ts           — psql restore from backup file

  sahu-csc/src/
    pages/
      login.tsx            — Mobile: navy header + white card, "Register here" CTA
      register.tsx         — Mobile: LoginLogo header, PasswordStrength meter
      forgot-password.tsx / reset-password.tsx
      dashboard.tsx        — Real-time stats + offline cache fallback + Udhari summary card
      ledger.tsx           — Transactions with offline queue support
      aeps.tsx             — AePS cash management (per-user)
      udhari.tsx           — Udhari Khata customer list: search, sort, To Collect / To Pay banner
      udhari-customer.tsx  — Per-customer ledger: balance banner, WhatsApp reminder, PDF export
      services.tsx
      reports.tsx          — Command Center design: horizontal top nav, navy KPI strip, 2-col charts
      notifications.tsx
      profile.tsx          — Unified Profile + Settings (v2.3): Desktop sticky side-nav, Mobile iOS drill-in
      preferences.tsx      — Standalone Preferences page (language + theme + dashboard layout)
      users.tsx            — User management (admin)
      users-overview.tsx   — Admin overview of all users' ledger/balance
      audit-logs.tsx       — Full audit trail (admin)
      settings.tsx         — Redirects to /profile (deprecated)
      backups.tsx          — Backup & Restore (admin) v3.1: Minimal Clean redesign — 2-col grid, navy card borders, saffron CTAs, dashed import dropzone, schedule + selective import
      sessions.tsx         — Standalone sessions page (also embedded in /profile)
      pwa-status.tsx       — App & Offline Status page
      server-health.tsx    — Live API/DB/VAPID health check page
      broadcast.tsx        — Admin push + email broadcast center
      download-app.tsx     — PWA install guide for Android/iOS/Desktop/Web
      receipts-verify.tsx  — Public receipt verification (/receipts/verify/:token; no auth)
      about.tsx            — Docs & System Requirements, changelog
      offline.tsx / not-found.tsx
    components/
      layout.tsx              — Sidebar + mobile nav + banners + idle timeout dialog
      sync-status-bar.tsx     — 🟢/🟡/🔴 global sync status indicator
      pwa-install-banner.tsx  — PWA install prompt banner
      setup-wizard-banner.tsx — Admin-only first-run banner: detects missing secrets via
                                GET /api/setup-status; red=critical, yellow=optional;
                                expandable per-secret descriptions; session-dismissed
      app-logo.tsx            — AppLogo (sidebar) + LoginLogo (auth); both use public/sahu-logo.png
      receipt-modal.tsx       — Receipt: QR code, Print, PDF (html2canvas+jsPDF), Web Share API
      language-switcher.tsx   — EN / हि / ଓ toggle in sidebar footer
      theme-provider.tsx
      ui/                     — shadcn/ui components
    locales/
      en/translation.json     — English (~860 keys)
      hi/translation.json     — Hindi
      or/translation.json     — Odia
    lib/
      i18n.ts                 — i18next init; reads localStorage "sahu-lang", falls back to "en"
      offline-db.ts           — IndexedDB v2 wrapper (5 stores)
      sync-engine.ts          — Offline queue processor; auto-syncs on window.online
      pwa-badge.ts            — App badge updater
      utils.ts
    hooks/
      use-auth.tsx              — Auth context + offline session cache from IndexedDB
      use-network-status.ts     — Online/offline/slow detection + latency probe (30s)
      use-pwa.ts                — Install prompt, badge, periodic sync, share, wake lock
      use-sync.ts               — Sync queue state
      use-push-notifications.ts — Push subscribe/unsubscribe
      use-idle-timer.ts         — Auto-logout after 30 min; 2-min warning
      use-device.tsx / use-wake-lock.ts / use-file-handler.ts / use-mobile.tsx / use-toast.ts

lib/
  db/src/schema/            — Drizzle schema files (one per table)
  api-spec/openapi.yaml     — OpenAPI spec (source of truth — do not edit generated files)
  api-client-react/src/
    generated/              — Auto-generated React Query hooks + Zod schemas (do not edit)
    custom-fetch.ts         — Base fetch wrapper
    index.ts                — Package exports

infrastructure/
  pwa/manifest.json         — Full standalone PWA manifest
  twa/twa-config.json       — Android TWA config for Bubblewrap CLI

scripts/
  post-merge.sh             — Runs automatically on GitHub import / task merge:
                              pnpm install + drizzle-kit push --force (schema migration)
  start.sh                  — Starts API (8080) + frontend (5000) in parallel

artifacts/sahu-csc/public/
  sahu-logo.png             — Primary brand logo (AppLogo + LoginLogo)
  pwa-*.png / apple-touch-icon.png
  .well-known/assetlinks.json — Digital Asset Links for Android TWA
```

---

## Setup Wizard Banner (v3.0.0)

When a new importer or admin logs in with missing secrets, a banner appears automatically at the top of every page (admin only).

### How it works

1. `SetupWizardBanner` (in `layout.tsx`, admin-only) fetches `GET /api/setup-status` on mount
2. If `configured: false`, the banner renders
3. **Red banner** — critical secrets missing (`SESSION_SECRET`, `SMTP_*`)
4. **Yellow banner** — only optional secrets missing (VAPID)
5. Expandable section lists each missing secret with label, severity badge, and description
6. "Open Secrets Docs" button links to Replit docs; instructions say to restart the API server after adding secrets
7. Dismissed per-session via `sessionStorage` — won't re-appear until next login

### `/api/setup-status` endpoint

```
GET /api/setup-status   (no auth required)
```

Response:
```json
{
  "configured": false,
  "missing": [
    {
      "key": "SMTP",
      "label": "Email / SMTP",
      "description": "Required for OTP login and notifications. Missing: SMTP_HOST, SMTP_USER, SMTP_PASS."
    }
  ]
}
```

Checks performed (in order):
- `SESSION_SECRET` — required (critical)
- `SMTP_HOST` + `SMTP_USER` + `SMTP_PASS` — required for email/OTP (critical)
- `ADMIN_PASSWORD` — required for Seed Database workflow (critical)
- `OPERATOR_PASSWORD` — required for Seed Database workflow (critical)
- `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` + persistent flag — optional (push notifications)

---

## Automatic Import Setup

Every GitHub import or task merge automatically runs `scripts/post-merge.sh`:

```bash
#!/bin/bash
set -e
echo "[post-merge] Installing dependencies..."
pnpm install --frozen-lockfile

echo "[post-merge] Pushing database schema..."
pnpm --filter @workspace/db run push-force

echo "[post-merge] Ensuring session table exists..."
psql "$DATABASE_URL" -c "CREATE TABLE IF NOT EXISTS ..."

echo "[post-merge] Done."
```

This is configured in `.replit` under `[postMerge]` with a 20-second timeout. The script:
- Is **idempotent** — safe to run multiple times
- Uses `--frozen-lockfile` — never modifies the lockfile
- Runs `drizzle-kit push --force` — creates all tables if they don't exist, applies any new columns
- ⚠️ `push --force` is destructive on conflict — always re-run **Seed Database** after a schema change to restore default data

**What still requires manual setup (secrets):**

| Secret | Where to add |
|--------|-------------|
| `DATABASE_URL` | Auto-provisioned by Replit PostgreSQL |
| `SESSION_SECRET` | Replit Secrets tab (🔒 in left sidebar) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL` | Replit Secrets tab |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL` | Replit Secrets tab (optional) |
| `SENTRY_DSN` | Replit Secrets tab — server-side error tracking (optional; Sentry no-ops if absent) |
| `VITE_SENTRY_DSN` | Replit Env Vars (shared) — client-side error tracking (optional; no-ops if absent) |

---

## Environment Variables (Secrets)

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (auto-provisioned by Replit) |
| `SESSION_SECRET` | ✅ | Express session signing secret — any long random string |
| `SMTP_HOST` | ✅ for email | SMTP server hostname (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | ✅ for email | SMTP port (e.g. `587` for TLS, `465` for SSL) |
| `SMTP_USER` | ✅ for email | SMTP username / email address |
| `SMTP_PASS` | ✅ for email | SMTP password or app password |
| `SMTP_FROM_EMAIL` | Optional | From address shown in emails (defaults to `SMTP_USER`) |
| `VAPID_PUBLIC_KEY` | Recommended | Web push notification public key |
| `VAPID_PRIVATE_KEY` | Recommended | Web push notification private key |
| `VAPID_EMAIL` | Optional | VAPID contact email (default: `mailto:admin@sahucsc.in`) |

> If VAPID keys are not set, the API auto-generates temporary keys on startup. These are lost on restart — push subscriptions won't survive server restarts. Set real keys for production.
>
> If SMTP is not configured, OTP login, password reset, and admin email notifications are disabled. The app still works for users who log in with username + password.

---

## Authentication & Security System (v2)

### Session Management
- **PostgreSQL session store**: Sessions stored in the `session` DB table — survive server restarts
- **Multi-device sessions**: Each login creates a row in `user_sessions` with device info, IP, browser, OS, expiry
- **Session durations**: Standard = 8 hours, Remember Me = 30 days
- **Session endpoints**:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sessions` | List all active sessions |
| `DELETE` | `/api/sessions/:id` | Revoke a specific session |
| `DELETE` | `/api/sessions/others` | Revoke all except current |
| `DELETE` | `/api/sessions/all` | Revoke ALL → redirect to login |

### Account Security
- **Account locking**: 5 failed attempts → locked for 15 minutes (auto-unlocks)
- **Idle timeout**: Auto-logout after 30 min inactivity; 2-min warning dialog

### Password Policy
- Minimum 8 characters, uppercase, lowercase, number

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|------------|
| `admin` | `["*"]` — all permissions |
| `operator` | ledger, aeps, reports, udhari, services, profile, notifications |
| `user` | ledger:view, reports:view, services:view, profile:view, notifications:view |

### Audit Logging

All security events logged to `audit_logs` with user ID, IP, device:

| Action | Trigger |
|--------|---------|
| `login.success` / `login.failed_*` | Login attempts (all outcomes) |
| `logout` | User logged out |
| `session.revoke` / `session.revoke_others` / `session.revoke_all` | Session revocations |
| `user.create` / `user.update` / `user.role_change` / `user.delete` | Admin user management |
| `password.reset` | Successful OTP password reset |
| `udhari.customer.*` / `udhari.entry.create` | Udhari Khata changes |

---

## Per-User Data Separation

All data fully isolated per user (ledger, balance, AePS, reports, Excel exports, Udhari).

**Admin oversight endpoints** (separate from admin's own data):
- `GET /api/admin/users-overview` — all users' balance summary
- `GET /api/admin/users-overview/:userId/ledger` — single user's ledger
- `GET /api/admin/aeps-overview` — all users' AePS balances

---

## PWA / Offline Features

- **Offline ledger entry**: Saved to IndexedDB; auto-synced on reconnect
- **Offline auth**: Cached session (24 hr) — users stay logged in offline
- **Offline dashboard**: Reads from IndexedDB cache
- **Network status**: Detects online / slow / offline; probes every 30 seconds
- **Sync status bar**: 🟢/🟡/🔴 global indicator + pending count
- **Push Notifications**: VAPID via web-push; subscribe/unsubscribe at `/api/push/*`
- **App & Offline Status Page** (`/pwa-status`): Live network, sync queue, storage, push status
- **App Shortcuts**: Dashboard, New Ledger Entry, AePS Cash, Reports

---

## Internationalisation (i18n)

| Code | Language | Script |
|------|----------|--------|
| `en` | English | Latin |
| `hi` | Hindi | Devanagari |
| `or` | Odia | Odia |

- Single flat `translation.json` per locale (~860 keys) — do not split into namespace files
- `i18n.ts` reads `localStorage["sahu-lang"]`, falls back to `"en"`
- Language saved in both `localStorage` and `user_preferences` DB table
- Translated string constants (arrays, config objects) must be **inside** the component function after `const { t } = useTranslation()` — never at module scope

**All 25 pages and layout.tsx are fully translated** (EN / HI / OR).

---

## Android TWA Setup

1. Install Bubblewrap CLI: `npm install -g @bubblewrap/cli`
2. `bubblewrap init --manifest https://<your-domain>/manifest.webmanifest`
3. Generate keystore and get SHA-256 fingerprint via `keytool`
4. Update `artifacts/sahu-csc/public/.well-known/assetlinks.json`
5. Deploy to Replit so assetlinks.json is live
6. `bubblewrap build` → upload APK to Google Play Console

Full config in `infrastructure/twa/twa-config.json`.

---

## Architecture Decisions

- **Page transitions must not use `willChange: transform`**: Creates a new CSS containing block for `position: fixed` — breaks the bottom nav's viewport pinning.
- **Contract-first API**: OpenAPI spec → Orval codegen → typed React Query hooks. Never edit `lib/api-client-react/src/generated/` directly.
- **Session-based auth, no JWT**: express-session + bcrypt. Simpler for single-center CSC use case.
- **PostgreSQL session store**: `connect-pg-simple` in `external` array in `build.mjs` — bundling breaks its internal `table.sql` path lookup, causing silent session failures.
- **V2 multi-device sessions**: `user_sessions` table. `requireAuth` validates `sessionId` first, falls back to `activeSessionToken` for backward compat.
- **RBAC via `requirePermission`**: Applied at route level, not just controller logic. Admin has wildcard `["*"]`.
- **Per-user data isolation**: `getUserFilter()` always filters by `userId`. Admin oversight uses separate `/api/admin/*` endpoints.
- **Money as Drizzle `numeric`**: Returns as string from DB — always `parseFloat()` before returning from routes.
- **Running balance at insert time**: Computed from `SUM(credit) - SUM(debit)` of all prior entries for that user.
- **Offline-first IndexedDB v2**: `pending_ledger` auto-syncs on reconnect via `SyncEngine`. `user_session` enables offline auth for 24 hours.
- **Auth loading guard uses `||`**: `isLoading = liveLoading || !offlineChecked`. Using `&&` causes auto-logout on refresh because offline check completes before live fetch.
- **Login sets auth cache via `setQueryData`**: After login, `queryClient.setQueryData(["auth/me"], userData)` is called directly from response body — no separate `/api/auth/me` refetch (race condition through Replit proxy).
- **Toast system v2 — custom Framer Motion renderer**: `toaster.tsx` replaces Radix UI toast. Variants: `default` (navy), `success`, `destructive`, `warning`. Shorthands: `toast.success()`, `toast.error()`. Mobile: top-center. Desktop: bottom-right.
- **Receipt number is atomic**: `receipt_counters` table uses `INSERT … ON CONFLICT DO UPDATE SET last_count = last_count + 1 RETURNING last_count`. Year derived from transaction `date` field, not wall clock.
- **Receipt token is UUID, not sequential**: Prevents enumeration. QR encodes `https://domain/receipts/verify/<uuid>`.
- **Receipt PDF is client-side**: `html2canvas` + `jsPDF` — backend stays stateless.
- **`GET /api/receipts/verify/:token` is public**: No auth — customers scan QR without an account.
- **`GET /api/setup-status` is public**: No auth — called before user logs in on first import. Never exposes secret values, only boolean presence flags and labels.
- **Setup banner is session-dismissed**: `sessionStorage.getItem("sahu-setup-banner-dismissed-v1")` — reappears on next login session until all secrets are configured.
- **`parseDevice` called once per request**: Before all failure/success branches in auth.ts login handler — avoids esbuild duplicate-const errors.
- **Udhari balance recalculated server-side**: `recalcBalance(customerId)` runs `SUM` after every entry change. Never trust client-supplied balance.
- **Udhari balance sign convention**: `balance > 0` = customer owes you ("To Collect"). `balance < 0` = you owe customer ("To Pay").
- **Notification `null` userId = broadcast to all**: Every `createNotification` without `userId` produces `userId = null` row visible in every user's feed. Always pass explicit `userId` for user-specific events.
- **`notifyNewRegistration` fans out internally**: Queries admin IDs and creates one notification per admin. Call it only once per registration event.
- **React Query cache cleared on logout**: `queryClient.clear()` in `handleLogout` — switching accounts never shows stale data.
- **Always CSS for responsive layout, not JS `isMobile`**: `useIsMobile()` has a render-before-measure delay causing layout flicker. Use `sm:hidden` / `hidden sm:block` Tailwind classes.
- **Mobile FAB clears bottom nav**: Use `bottom-20` (80px), not `bottom-6`. Bottom nav is ~64px tall.
- **Forgot-password is a merged 4-step page**: `/forgot-password` covers identifier → OTP → new password → success. Do not split.
- **Unified Profile + Settings (v2.3)**: `/profile` replaces standalone `/settings`. Desktop: sticky 144px side-nav with anchor links. Mobile: iOS drill-in pattern.
- **OTP resend timer is 120 seconds**: Both `forgot-password.tsx` and `register.tsx` use `RESEND_COOLDOWN = 120`. Do not change.
- **send-otp silent success on unknown identifier**: Returns HTTP 200 with `{ maskedEmail: null }` — prevents account enumeration.
- **AePS opening balance uses OpeningBalanceHeroCard**: Full-width navy gradient card. Never put it back into the stat-card grid.
- **AePS mobile entry — Aadhaar masking**: `XXXX XXXX <last 4>` at rest; raw grouped value shown while focused. Store raw digits, derive masked display on render.
- **Seed script does not seed ledger entries**: Seeds only users, services, settings, notifications. Ledger starts clean.
- **i18n string constants inside component**: Arrays/config with translated strings declared after `const { t } = useTranslation()` — never at module scope.
- **Sub-components with translations need own `useTranslation`**: Cannot share parent's `t` — hooks cannot be passed as props.
- **Session/role cache is process-local, 5s TTL, not a distributed cache**: `lib/auth/sessionCache.ts`. Fine for a single API instance; if ever scaled horizontally, revocation across instances is only guaranteed within the TTL window unless swapped for a shared cache.
- **Every session/role mutation must call the matching cache invalidator**: revoke session(s) → `invalidateSessionCache(sessionId)`; role/status/active change or logout → `invalidateUserCache(userId)`. Skipping this reintroduces a stale-auth window.
- **Password reset/change must revoke sessions, not just update the hash**: reset-password revokes *all* sessions for the account; self-service profile password change revokes all *other* sessions (keeps the current one alive). Otherwise a stolen session survives a password change.
- **`requirePermission` and `requireRole` must read the same role source**: both use the cached DB role via `userRoleCache`, never `req.session.userRole` (baked in at login, never refreshes) — otherwise role changes apply inconsistently between route guards.

---

## Mockup Sandbox

Design exploration in `artifacts/mockup-sandbox/`. Preview server on port 8081 — URL: `https://<domain>/__mockup/preview/<group>/<ComponentName>`.

| Group | Component | Viewport | Description |
|-------|-----------|----------|-------------|
| `aeps-mobile-entry` | `AepsMobileEntry` | 390×844 | Mobile AePS entry form — Aadhaar masking, bank dropdown, quick chips |
| `aeps-page` | `AePS` | 390×844 | Mobile AePS — opening balance hero card, formula bar, transaction list |
| `aeps-desktop` | `AePS` | 1280×800 | Desktop AePS with sidebar, stat cards, tabbed table |
| `aeps-entry-form` | `AepsEntry` | 900×620 | Side-by-side Withdrawal + Deposit forms |
| `ledger-desktop` | `Ledger` | 1280×800 | Desktop Ledger with filter bar, full table, receipt numbers |
| `udhari-desktop` | `Udhari` | 1280×800 | Desktop Udhari — two-panel customer list + per-customer ledger |

---

## User Preferences

- Language: EN (English) by default
- Monorepo managed with pnpm workspaces
