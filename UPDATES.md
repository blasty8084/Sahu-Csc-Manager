# SAHU CSC — Automatic Update Log
**Auto-generated. Updated every session.**

> This file records every meaningful change made to the codebase, session by session.
> Most recent changes are at the top. One section per work session.
> For full feature history see `CHANGELOG_V3.md` (v3.x) and `docs/archive/changelogV2.md` (v2.x).

---

## Session: 2026-07-13 — v4.0.2 Image & Loader Polish

**Version:** 4.0.2
**Status:** ✅ Complete — all medium + low priority checklist items resolved, API rebuilt, docs updated

### What Was Done

#### 1. `loading="lazy"` on remaining images
- `components/layout.tsx` line 432: desktop sidebar avatar → `loading="lazy"`
- `components/layout.tsx` line 589: mobile header avatar → `loading="lazy"`
- `components/app-logo.tsx` line 25: `AppLogo` component → `loading="lazy"`
- Kept eager (intentional): `splash-screen.tsx`, `App.tsx` (splash logo), `page-skeleton.tsx`, `LoginLogo` in `app-logo.tsx`

#### 2. `/admin/appeals` query limit
- `routes/admin-appeals.ts` line 27: added `.limit(500)` to `GET /admin/users/appeals`
- API rebuilt and restarted

#### 3. `sahu-logo-glow.png` deleted
- Had zero `<img>` or `url()` references anywhere in `src/` — completely orphaned
- Removed from `artifacts/sahu-csc/public/`; 175 KB dropped from build

#### 4. EagerPreloader → `requestIdleCallback`
- `App.tsx`: replaced `setTimeout(preload, 3000)` with `requestIdleCallback(preload, { timeout: 5000 })`
- `{ timeout: 5000 }` ensures preloading happens within 5s even if the browser reports busy
- `cancelIdleCallback` used in cleanup (vs `clearTimeout` in the fallback branch)
- Fallback: `setTimeout(preload, 3000)` for browsers without `requestIdleCallback` (older Safari)

#### 5. Confirmed already done (no action needed)
- Udhari customer list caching: `cached('udhari:customers:${userId}:...', 5_000, ...)` in `customers.ts` — shipped in v4.0.0
- Async React Query persister: `createAsyncStoragePersister` + `idb-keyval` — shipped in v4.0.0

#### 6. Version bump
- `sahu-csc/package.json`: 4.0.1 → 4.0.2
- `api-server/package.json`: 4.0.1 → 4.0.2

---

## Session: 2026-07-13 — v4.0.1 Redis Rate Limiting & Multi-Instance Readiness

**Version:** 4.0.1
**Status:** ✅ Complete — rate-limit-redis installed, all 4 limiters updated, API rebuilt and running, docs updated

### What Was Done

#### 1. `rate-limit-redis` installed
```bash
pnpm --filter @workspace/api-server add rate-limit-redis
```

#### 2. `app.ts` updated — Redis client + `makeRlStore` helper
- Added imports: `RedisStore` from `rate-limit-redis`, `Redis` from `@upstash/redis`
- Added `_rlRedis` singleton: created only when `CACHE_BACKEND=redis` + both Upstash env vars are set; `null` otherwise
- Added `makeRlStore(prefix)` helper: returns `new RedisStore(...)` or `undefined` (→ default `MemoryStore`)
- Startup log: `"Rate limiter: using shared Redis store"` or `"…MemoryStore"`

#### 3. All 4 rate limiters updated
| Limiter | `store` prefix | Window / Max |
|---|---|---|
| General API | `rl:general:` | 15 min / 500 |
| Login | `rl:login:` | 15 min / 8 |
| Auth writes | `rl:auth-write:` | 15 min / 10 |
| OTP verify | `rl:otp-verify:` | 15 min / 8 |

#### 4. API rebuilt and restarted
- `node artifacts/api-server/build.mjs` — clean build (4.7 MB)
- API Server workflow restarted — confirmed `"Rate limiter: using in-process MemoryStore"` in logs (expected: no Redis secrets in this environment)

#### 5. `MULTI_INSTANCE_SETUP.md` created
New guide at project root covering all 3 multi-instance approaches, the full readiness checklist (sessions ✅, VAPID ✅, encryption key ✅, Redis cache ⚠️, rate limiter now ✅), PM2 config, and DB pool tuning.

#### 6. Version bump
- `sahu-csc/package.json`: 4.0.0 → 4.0.1
- `api-server/package.json`: 4.0.0 → 4.0.1

---

## Session: 2026-07-12 — v4.0.0 Full-Stack Performance Audit

**Version:** 4.0.0
**Status:** ✅ Complete — all indexes pushed, API caching live, async persister active, docs updated

### What Was Done

#### 1. Database Indexes (`lib/db/src/schema/`)
Six new Drizzle indexes added and pushed live via `drizzle-kit push`:
- `users.ts`: `users_role_idx` (role), `users_status_idx` (status)
- `aeps.ts`: `aeps_tx_daily_id_idx` (dailyId), `aeps_tx_type_idx` (type), `aeps_tx_created_at_idx` (createdAt)
- `push_subscriptions.ts`: `push_subscriptions_user_id_idx` (userId)
- `password_reset_tokens.ts`: `password_reset_tokens_user_id_idx` (userId)

#### 2. API Caching (`artifacts/api-server/src/lib/query-cache.ts` + 4 route files)
Three new invalidation helpers added to `query-cache.ts`: `invalidateAepsCaches(userId?)`, `invalidateUdhariCaches(userId)`, `invalidateUserListCache()`.

Eight routes now use `cached(key, 5_000, loader)`:
- `aeps/sessions.ts`: GET /aeps/session, GET /admin/aeps-overview; POST invalidates
- `aeps/transactions.ts`: GET /aeps/transactions; POST/PATCH/DELETE invalidate
- `udhari/customers.ts`: GET /udhari/summary, GET /udhari/customers, GET /udhari/customers/:id; POST/PATCH/DELETE invalidate
- `udhari/entries.ts`: GET /udhari/customers/:id/entries; POST/PATCH/DELETE invalidate
- `users.ts`: GET /users; POST/PATCH/DELETE invalidate

#### 3. Async IndexedDB Persister (`artifacts/sahu-csc/src/App.tsx`)
- Removed: `createSyncStoragePersister` + `sessionStorage`
- Added: `createAsyncStoragePersister` + `idb-keyval` (IndexedDB `get/set/del`)
- Packages installed: `@tanstack/query-async-storage-persister`, `idb-keyval`

#### 4. EagerPreloader Deferred (`artifacts/sahu-csc/src/App.tsx`)
Wrapped all `import("@/pages/…")` calls in a `setTimeout(…, 3000)` with `clearTimeout` cleanup.

#### 5. Query Limits
- `GET /udhari/customers`: `.limit(500)` added
- `GET /udhari/customers/:id/entries`: `.limit(500)` added

#### 6. Lazy Image Loading
- `about.tsx` logo: `loading="lazy"`
- `download-app.tsx` icon: `loading="lazy"`

#### 7. Version Bump
- `sahu-csc/package.json`: 3.5.10 → 4.0.0
- `api-server/package.json`: 3.5.10 → 4.0.0

---

## Session: 2026-07-12 — v3.5.8 Reports & Receipt Export Page Modularization

**Version:** 3.5.8
**Status:** ✅ Complete — both pages split, typecheck clean, app renders without errors, all docs updated

### What Was Done

#### 1. Reports Page Split (`artifacts/sahu-csc/src/pages/reports.tsx`)

Original file was 1301 lines — split into a thin orchestrator plus four new files:

- `hooks/useReports.ts` — filter constants (`DATE_PRESETS`, `SERVICE_OPTIONS`), formatters (`fmtCurrency`, `fmtMonth`), `useFilterState` (all date/service/tab state with URL-sync), `useReportsData` (all React Query calls for daily/monthly/service-wise data + derived `summaryCards`, `chartData`, `serviceRows`)
- `components/reports/ReportSummaryCards.tsx` — `MobileStatCard`, `DesktopStatCard`, `Sparkline`, `KpiChip`, `SectionLabel`, `EmptyState`
- `components/reports/ReportChart.tsx` — `ChartTooltip`
- `components/reports/ReportFilters.tsx` — `MobileReportFilters`, `DesktopReportFilters`
- `pages/reports.tsx` reduced to a thin orchestrator — layout wiring only; default export and import path unchanged

#### 2. Receipt Export Page Split (`artifacts/sahu-csc/src/pages/receipt-export.tsx`)

Original file was 1219 lines — split into a thin orchestrator plus five new files:

- `components/receipt-export/types.ts` — shared interfaces (`PreviewEntry`, `CountResult`, `FullReceiptEntry`, `BusinessInfo`, `ModalAction`, `MobileTab`, `UserOverview`), constants (`NAVY`, `SAFFRON`, `MONTH_OPTIONS`), pure formatters (`fmtDate`, `fmtDateShort`). Plain `.ts` file — no JSX.
- `hooks/useReceiptExport.ts` — all state (selections, filters, modal, preview list, tabs), `buildParams()` (single source of query-param construction consumed by all 3 bulk-export endpoints), all handlers including `/bulk-export/count`, `/bulk-export/download` (PDF ZIP), `/bulk-export/excel` (XLSX), and monthly export trigger + download
- `components/receipt-export/ExportFilters.tsx` — `DesktopExportFilters`, `MobileExportFilterToggle`, `MobileExportFilterPanel`, `MobileByDatePanel`
- `components/receipt-export/ReceiptPreviewList.tsx` — `DesktopReceiptTable`, `DesktopReceiptExpandedPreview`, `MobileReceiptList`, local `Checkbox` helper (CheckSquare/Square — lives here, not in types.ts)
- `pages/receipt-export.tsx` reduced to a thin orchestrator — `MonthlyPanel`, `MobileReceiptPreview`, `ReceiptModal`, layout composition; default export unchanged

#### 3. Key Architecture Decision: `Checkbox` Placement

`Checkbox` was initially placed in `types.ts` (creating a JSX-in-.ts problem). Corrected to live in `ReceiptPreviewList.tsx` — the only file that uses it — keeping `types.ts` a pure TypeScript file.

#### 4. Verification

- `tsc --noEmit` clean on all three workspace projects (api-server, mockup-sandbox, sahu-csc)
- App preview renders correctly; browser console shows no new errors
- All 3 bulk-export endpoints (`/count`, `/download`, `/excel`) confirmed to use the same `buildParams()` — query param construction identical to the original

#### 5. Version Bumps

- `artifacts/sahu-csc/package.json`: 3.5.7 → 3.5.8
- `artifacts/api-server/package.json`: 3.5.7 → 3.5.8

#### 6. Documentation Updated

- `replit.md` — version header + What's New v3.5.8 section
- `CHANGELOG_V3.md` — v3.5.8 section added at top; TOC updated; version header bumped
- `UPDATES.md` — this entry
- `about.tsx` — v3.5.8 changelog entry added at top of CHANGELOG array; "Last updated" updated to 12 July 2026
- `whats-new-modal.tsx` — VERSION bumped to 3.5.8; 5 new feature slides describing the modularization

---

## Session: 2026-07-11 — v3.5.4 Ledger Page Modularization

**Version:** 3.5.4
**Status:** ✅ Complete — `ledger.tsx` split, typecheck clean, curl smoke test passed, all docs updated

### What Was Done

#### 1. Ledger Page Split (`artifacts/sahu-csc/src/pages/ledger.tsx`)
- Original file was 1652 lines — split per the project's page-split pattern into a thin orchestrator plus four new files:
  - `hooks/useLedger.ts` — all React Query data hooks/mutations, `EntryForm` type, `SERVICE_COLOR_MAP`/`getServiceColor`, `groupByDate`/`fmtDateGroup`, derived customer/receipt data
  - `components/ledger/LedgerFilters.tsx` — `MobileSearchBar`, `MobileFrequentCustomers`, `DesktopSearchFilterBar`, `DesktopFilterPanel`, `MobileFilterPanel`
  - `components/ledger/LedgerEntryForm.tsx` — `MobileEntryFormDialog`, `DesktopEntryFormPanel`
  - `components/ledger/LedgerTable.tsx` — `TableTabsHeader`, `PendingSyncBanners`, `DesktopReceiptsPanel`, `DesktopTransactionsTable`, `TableFooterPagination`, `MobileReceiptsList`, `MobileTransactionsList`, `MobilePagination`
- `pages/ledger.tsx` reduced to ~600 lines: page-level state, handlers, and layout wiring only
- No routes, API calls, `data-testid`s, or visual output changed
- The client-side "Balance after this entry" preview calculation in the Add/Edit form was preserved exactly and documented as a comment — actual balances are always computed server-side

#### 2. Verification
- `tsc --noEmit` clean on all three workspace projects (api-server, mockup-sandbox, sahu-csc)
- Authenticated curl smoke test: login → create ledger entry → balance/list reflect it → delete removes it and resets balance to ₹0.00

#### 3. Version Bumps
- `artifacts/sahu-csc/package.json`: 3.5.3 → 3.5.4
- `artifacts/api-server/package.json`: 3.5.3 → 3.5.4
- `infrastructure/twa/twa-config.json`: appVersionName 3.4.0 → 3.5.4, appVersionCode 5

#### 4. Documentation Updated
- `replit.md` — version header + What's New v3.5.4 section
- `DOCS.md` — version header + v3.5.4 version history entry
- `CHANGELOG_V3.md` — v3.5.4 section added at top; TOC updated
- `CHANGELOG.md` — v3.5.4 entry added at top
- `BUILD.md` — version header
- `architectureV3.md` — version header
- `ReplitV3.md` — version header + footer
- `UPDATES.md` — this entry
- `about.tsx` — v3.5.4 changelog entry added at top of CHANGELOG array (plus the previously-missing v3.5.3 entry); header "Last updated" updated

---

## Session: 2026-07-10 — v3.4.0 Receipt Export Layout Refactor & TypeScript Hardening

**Version:** 3.4.0
**Status:** ✅ Complete — receipt-export page uses shared Layout, TypeScript clean, all docs updated

### What Was Done

#### 1. Receipt Export Page — Layout Refactor (`artifacts/sahu-csc/src/pages/receipt-export.tsx`)
- Removed all duplicate custom header/nav markup: desktop navy header + stat band, mobile navy top bar, mobile 4-tab fixed bottom nav
- Added `import { Layout }` from `@/components/layout` and `import { useIsMobile }` from `@/hooks/use-mobile`
- Removed `import { useLocation }` from `wouter` (was only used for back-button in the now-removed custom headers)
- Entire `return` now wraps in `<Layout>` — consistent with all other pages
- **Desktop (≥768px):** 4-column KPI stat bar → filter row (date presets + operator dropdown) → two-column body (receipt table left, export panel + preview + monthly auto-export right)
- **Mobile (<768px):** KPI mini-strip → horizontal pill tabs at top (Receipts / By Date / Summary / Export) — no conflict with global bottom nav; expandable filter sheet, full-screen preview overlay, sticky export CTA

#### 2. TypeScript Hardening
- Added `UserOverview` interface matching `GET /api/admin/users-overview` response shape
- Replaced `useQuery<any[]>` with `useQuery<UserOverview[]>`
- Replaced all three `.map((u: any) =>` callbacks with inferred typed callbacks
- Verified: `tsc --noEmit` shows zero errors specific to `receipt-export.tsx`

#### 3. Version Bumps
- `artifacts/sahu-csc/package.json`: 3.3.0 → 3.4.0
- `artifacts/api-server/package.json`: 3.3.1 → 3.4.0
- `infrastructure/twa/twa-config.json`: appVersionName 3.3.1 → 3.4.0, appVersionCode 4

#### 4. Documentation Updated
- `replit.md` — version header + What's New v3.4.0 section
- `DOCS.md` — version header + v3.4.0 version history + receipt-export page description
- `CHANGELOG_V3.md` — v3.4.0 section added at top; TOC updated
- `CHANGELOG.md` — v3.4.0 entry added at top
- `BUILD.md` — version header
- `architectureV3.md` — version header; receipt-export page description
- `ReplitV3.md` — version header; receipt-export description; footer
- `UPDATES.md` — this entry
- `about.tsx` — v3.4.0 changelog entry added at top of CHANGELOG array; header "Last updated" updated

---

## Session: 2026-07-09 — Re-import Setup, Bug Fixes & VAPID Secrets

**Version:** 3.3.1
**Status:** ✅ Complete — all workflows running, health OK, SMTP live, VAPID persistent, duplicate workflow removed

### What Was Done

#### 1. Re-import Setup
- Ran `pnpm install` — all workspace dependencies restored
- Pushed Drizzle schema via `drizzle-kit push --force` — all tables applied
- Created `session` table (connect-pg-simple; excluded from Drizzle schema push)
- Seeded admin and operator accounts from `ADMIN_PASSWORD` + `OPERATOR_PASSWORD` secrets
- Built API bundle — `artifacts/api-server/dist/index.mjs` generated

#### 2. All Secrets Configured

| Secret / Env Var | Type | Status |
|------------------|------|--------|
| `SESSION_SECRET` | Replit Secret | ✅ Already set |
| `ADMIN_PASSWORD` | Replit Secret | ✅ Already set |
| `OPERATOR_PASSWORD` | Replit Secret | ✅ Already set |
| `SMTP_PASS` | Replit Secret | ✅ Added this session |
| `VAPID_PRIVATE_KEY` | Replit Secret | ✅ Added this session |
| `VAPID_PUBLIC_KEY` | Shared env var | ✅ Added this session |
| `SMTP_HOST/PORT/USER/FROM_EMAIL` | Shared env vars | ✅ Already set |
| `VAPID_EMAIL` | Shared env var | ✅ Already set |

#### 3. Workflow Fixes
- **API Server** command simplified to `PORT=8080 NODE_ENV=development node --enable-source-maps artifacts/api-server/dist/index.mjs` (removed fragile conditional build wrapper)
- **Build API**, **Typecheck**, **Build Production**, **Production Preview** workflows restored (were missing after re-import)
- **`artifacts/api-server: API Server`** duplicate overridden with a no-op stub — stops port 8080 conflict on startup
- `postMerge.timeoutMs` increased from 20 000 ms → 180 000 ms so `pnpm install + drizzle push` reliably complete on future imports

#### 4. Bug Fixes

| File | Fix |
|------|-----|
| `lib/sanitize.ts` | `xss.IFilterXSSOptions` → named import `IFilterXSSOptions` — fixed TS2833 typecheck error |
| `sahu-csc/package.json` | `sirv dist` → `sirv dist/public` — production serve now points at Vite's actual output directory |
| `lib/vapid.ts` | Set `VAPID_KEYS_FROM_ENV=true` when keys loaded from DB — fixes false `ephemeral`/`degraded` health status |
| `lib/vapid.ts` | Detect partial keypair (only one key in DB) → delete both and regenerate atomically — prevents mismatched VAPID key pair |
| `lib/vapid.ts` | Batch-insert both VAPID keys in a single `INSERT` statement — reduces race-condition window |
| `lib/push.ts` | Strip trailing `=` padding and whitespace from VAPID keys in `initPush()` — copy-paste artifact no longer crashes server |

#### 5. Documentation Updated
- `DOCS.md` — bumped to v3.3.1; added v3.3.1 version history; updated workflows note, VAPID env section, Architecture Decisions table, common commands, footer version
- `UPDATES.md` — this entry
- `CHANGELOG_V3.md` — added v3.3.1 section

#### 6. Verification
- `GET /api/healthz` → `{"status":"ok","vapid":{"persistent":true},...}`
- `GET /api/setup-status` → `{"configured":true,"missing":[]}`
- TypeScript typecheck → 0 errors across all packages

---

## Session: 2026-07-06 — v3.2.5 Security Upgrade & Password Policy Correction

**Version:** 3.2.5
**Status:** ✅ Complete — password policy, rate limiting, encryption at rest, and hashing review all shipped and verified

- Unified `passwordPolicySchema` across registration, password reset, profile change, and admin user management.
- Password length corrected mid-session: initial rollout required 10+ characters (v3.2.4); adjusted to a 6–8 character range at the user's request (v3.2.5), complexity rules unchanged.
- Login rate limiter tightened 20→8/15min; new dedicated limiters added for register/OTP/forgot-password/reset-password endpoints.
- AES-256-GCM field-level encryption added for non-searched free-text fields (customer address/notes, user address/bio); searchable fields left plaintext by design.
- bcrypt cost factor reviewed and confirmed already at industry-standard strength (12).
- All docs (`replit.md`, `DOCS.md`, `CHANGELOG.md`, `CHANGELOG_V3.md`) and app version bumped to 3.2.5.

---

## Session: 2026-07-04 — v3.2.0 Zero-Spinner UX & Persistent Cache

**Version:** 3.2.0
**Status:** ✅ Complete — all pages instant on repeat visit, zero spinning loaders

---

### 1. Packages Added

| Package | Purpose |
|---------|---------|
| `@tanstack/react-query-persist-client` | `PersistQueryClientProvider` — persists React Query cache across page navigations |
| `@tanstack/query-sync-storage-persister` | `createSyncStoragePersister` — writes/reads the cache to `sessionStorage` synchronously |

---

### 2. New Files Created

#### `artifacts/sahu-csc/src/components/skeletons.tsx`

14 new skeleton components — each shaped to match the exact content it replaces, using Tailwind `animate-pulse`:

| Component | Matches |
|-----------|---------|
| `DashboardStatsSkeleton` | 4 stat cards row on dashboard |
| `DashboardServicesSkeleton` | Top services list (5 shimmer rows) |
| `RecentTxSkeleton` | Recent transactions mini-table |
| `LedgerSkeleton` | Full ledger table rows + pagination bar |
| `LedgerBalanceSkeleton` | Balance header card strip |
| `AepsSkeleton` | AePS balance hero + transaction rows |
| `ReportsSkeleton` | KPI strip + 2-column chart placeholders |
| `NotificationsSkeleton` | 5 notification card rows |
| `UdhariListSkeleton` | Customer list cards |
| `UdhariSummarySkeleton` | To Collect / To Pay summary banner |
| `ServicesSkeleton` | Category header + service rows |
| `PreferencesSkeleton` | Settings form card blocks |
| `SessionsListSkeleton` | Session device cards |
| `AuditLogsSkeleton` | Mobile cards or desktop `<tr>` rows (via `mobile` + `rows` props) |

#### `artifacts/sahu-csc/src/components/sync-badge.tsx`

Subtle "Updating…" dot indicator. Appears in the layout header **only** when React Query is doing a background refetch. Never blocks the UI or shows a spinner over content.

---

### 3. Changed — `App.tsx`

| Before | After |
|--------|-------|
| `QueryClientProvider` | `PersistQueryClientProvider` (sessionStorage key `sahu-csc-rq-cache`) |
| `staleTime: 0` (every visit refetches) | `staleTime: 5 min`, `gcTime: 30 min` |
| No preloading | `EagerPreloader` prefetches 7 queries immediately after auth resolves |
| Page fade uses `willChange: transform` | Changed to `willChange: opacity` only — `transform` creates a CSS containing block that breaks `position: fixed` bottom nav |

**Page transition values:**
- Enter: 200 ms, `cubic-bezier(0.22, 1, 0.36, 1)` — fast settle
- Exit: 80 ms, `easeIn` — quick dismiss
- Property: `opacity` only

---

### 4. Changed — `use-auth.tsx`

**On login (prefetch 7 queries):**
```
dashboard  →  ledger (page 1)  →  aeps-daily (today)
reports/daily  →  services  →  notifications  →  udhari/customers
```
Every page is warm in cache before the user navigates to it — skeletons never appear on the first click after login.

**On logout (cache clear):**
```
sessionStorage.removeItem("sahu-csc-rq-cache")   ← persisted cache wiped
queryClient.clear()                               ← in-memory cache wiped
```
Switching accounts never shows the previous user's data.

---

### 5. Removed — `SectionLoader` Spinning Loaders

All 8 spinning `SectionLoader` calls replaced with content-shaped skeletons:

| Page | Section | Removed | Added |
|------|---------|---------|-------|
| `dashboard.tsx` | Top Services card | `SectionLoader` | `DashboardServicesSkeleton` |
| `dashboard.tsx` | Recent Transactions | `SectionLoader` | `RecentTxSkeleton` |
| `reports.tsx` | Daily tab (desktop) | `SectionLoader` | `ReportsSkeleton` |
| `services.tsx` | Services list | `SectionLoader` | `ServicesSkeleton` |
| `preferences.tsx` | Settings form | `SectionLoader` | `PreferencesSkeleton` |
| `profile.tsx` | Sessions section | `SectionLoader` | `SessionsListSkeleton` |
| `audit-logs.tsx` | Mobile card list | `SectionLoader` | `AuditLogsSkeleton` (mobile) |
| `audit-logs.tsx` | Desktop table body | `SectionLoader` | `AuditLogsSkeleton` (table) |

Unused `SectionLoader` imports also removed from `preferences.tsx`, `services.tsx`, `audit-logs.tsx`.

---

### 6. Optimized — Cache Flow

```
Cold (first visit after login):
  isLoading=true → skeleton shown ~100–300ms → data arrives → skeleton gone

Warm (within 5 min staleTime):
  isLoading=false (cache hit) → data renders instantly → no skeleton shown

Stale (after 5 min, cache exists):
  isLoading=false → data renders instantly → background refetch fires
  → SyncBadge "Updating…" visible → data swapped silently

New tab / page refresh:
  PersistQueryClientProvider rehydrates from sessionStorage on mount
  → all 7 prefetched queries available before first API response
```

---

### 7. Documentation Updated

| File | Change |
|------|--------|
| `replit.md` | Bumped to v3.2.0, added "What's New in v3.2.0" table |
| `CHANGELOG.md` | Bumped to v3.2.0, full v3.2.0 section (packages/changes/removals/optimizations) |
| `artifacts/sahu-csc/package.json` | `version` → `3.2.0` |
| `artifacts/api-server/package.json` | `version` → `3.2.0` |

---

## Session: 2026-07-03 — Replit Environment Migration & TypeScript Clean

**Version:** 3.1.1
**Status:** ✅ Complete — 0 TypeScript errors, all workflows running

### What Was Done

#### 1. Replit Environment Migration
- Ran `pnpm install` — all monorepo workspace dependencies installed
- Pushed Drizzle schema via `pnpm --filter @workspace/db run push` — all 15 PostgreSQL tables created
- Built API bundle via `pnpm --filter @workspace/api-server run build` — `dist/index.mjs` generated
- Seeded database — admin and operator accounts created from `ADMIN_PASSWORD` + `OPERATOR_PASSWORD` secrets
- Configured `ADMIN_PASSWORD` and `OPERATOR_PASSWORD` in Replit Secrets

#### 2. Workflow Setup (7 workflows configured)

| Workflow | Change |
|----------|--------|
| `SAHU CSC` | Configured — auto-starts frontend dev server on port 5000 |
| `API Server` | Configured — auto-starts pre-built API bundle on port 8080 |
| `Build API` | Added — rebuilds API esbuild bundle on demand |
| `Seed Database` | Configured — uses tsx to run seed.ts, requires secrets |
| `Typecheck` | Added — runs typecheck:libs + typecheck across all artifacts |
| `Build Production` | Added — full typecheck + API + Vite + PWA build |
| `Production Preview` | Added — build + vite preview on port 5000 |

#### 3. Bug Fixes

**Backup directory path (`artifacts/api-server/src/routes/settings.ts`)**
- Was: `../../backups` (resolved to workspace root — wrong when running from dist/)
- Fixed: `backups` (relative to `process.cwd()` which is `artifacts/api-server/`)
- Added: `mkdirSync(BACKUP_DIR, { recursive: true })` before multer init (prevents crash on missing dir)
- Same fix applied to: `backup-scheduler.ts`, `scripts/backup.ts`, `scripts/restore.ts`

**Frontend dev script port (`artifacts/sahu-csc/package.json`)**
- Was: `fuser -k ${PORT:-21700}/tcp` (wrong port — killed canvas artifact instead of self)
- Fixed: `fuser -k ${PORT:-5000}/tcp`

**Missing `logger` import (`artifacts/api-server/src/routes/settings.ts`)**
- Added: `import { logger } from "../lib/logger.js"`

#### 4. TypeScript Fixes — API Server (6 errors → 0)

| File | Error | Fix |
|------|-------|-----|
| `routes/settings.ts` | `logger` used but not imported | Added `import { logger }` |
| `routes/broadcast.ts` | `url` typed `string \| null` but param needs `string \| undefined` | Changed to `url ?? undefined` |
| `lib/auth.ts` | `auditLog` called with `null` userId but type was `number` | Changed signature to `userId: number \| null`, added null guard |
| `routes/admin-receipt-export.ts` | `archiver()` not callable as function | Cast: `(archiver as any)('zip', ...)` |
| `lib/monthly-export.ts` | Same archiver callable issue | Same cast fix |
| `routes/admin-receipt-export.ts` | `err` in catch block typed as `unknown` | Annotated as `err: Error` |

#### 5. TypeScript Fixes — Frontend (7 errors → 0)

| File | Error | Fix |
|------|-------|-----|
| `pages/aeps.tsx` | `useEffect` used but not imported | Added `useEffect` to React import |
| `pages/reports.tsx` | `AreaChart`, `Area` used but not imported | Added imports from recharts |
| `pages/reports.tsx` | `Skeleton` used but not imported | Added `Skeleton` import from `@/components/ui/skeleton` |
| `pages/udhari.tsx` | `Skeleton` used but not imported | Added `Skeleton` import |
| `pages/users.tsx` | `Skeleton` used but not imported | Added `Skeleton` import |
| `pages/ledger.tsx` | `mutateAsync` called with flat object, expected `{data:{...}}` | Wrapped args in `{ data: { ... } }` (Orval-generated wrapper) |
| `hooks/use-toast.ts` | `ReactNode` passed where `string` expected | Cast to `as string` |
| `components/whats-new-modal.tsx` | Function not guaranteed to return `ReactNode` | Added `return undefined` to all code paths |

#### 6. Production Build Verification
- Full `Build Production` workflow run: ✅ passed
- API bundle: 5.0 MB (esbuild ESM)
- Frontend: all chunks under Vite threshold
- PWA service worker: 76 precache entries, 5254 KiB

---

## Session: 2026-06-30 — v3.1.0 Backup & Restore + v3.0.0 Setup Wizard

**Version:** 3.1.1 (tagged post-session)

### What Was Done

- Backup page complete redesign (Minimal Clean — 2-col grid, navy borders, saffron CTAs)
- `GET /api/backups/:id/download` — streams `.sql` to browser
- `POST /api/backups/analyze` — parse pg_dump COPY blocks, return table list
- `POST /api/backups/selective-import` — replay chosen tables, FK checks disabled
- `GET/POST /api/backups/schedule` — read/write cron schedule
- `backup-scheduler.ts` — `node-cron` daily/weekly/custom auto-backup with retention
- Setup Wizard Banner (admin-only, session-dismissed, red/yellow severity)
- `GET /api/setup-status` — public endpoint, no auth, returns missing secrets list
- `scripts/post-merge.sh` — auto-runs `pnpm install` + `drizzle-kit push` on import
- Backup page redesign documented in `CHANGELOG_V3.md`

---

## How This File Is Maintained

This file is updated at the end of every agent work session. Each entry records:
- What was built or changed and why
- Any bug fixes with before/after detail
- New workflows, endpoints, or pages added
- TypeScript or build issues resolved

**Format:**
```
## Session: YYYY-MM-DD — Short Title

**Version:** x.x.x
**Status:** ✅ / 🚧 / ❌

### What Was Done
...sections as needed...
```
