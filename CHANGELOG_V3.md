# SAHU CSC — Change Log v3
**Current version: 3.5.3 — July 10, 2026**

> Detailed record of every feature, change, and upgrade from v3.0.0 onward.  
> For v2.x history, see `docs/archive/changelogV2.md`.  
> For pre-v2 history, see `CHANGELOG.md`.  
> For full architecture reference, see `architectureV3.md`.  
> For session-by-session changes, see `UPDATES.md`.

---

## Table of Contents

0. [v3.5.3 — Optimization Round 2: Query Caching, Load Testing & Safe Rate-Limiter Bypass (July 10, 2026)](#0-v353--optimization-round-2-query-caching-load-testing--safe-rate-limiter-bypass-july-10-2026)
0. [v3.5.2 — Asset & Delivery Hardening (July 10, 2026)](#0-v352--asset--delivery-hardening-july-10-2026)
0. [v3.5.1 — Performance & Scale Hardening (July 10, 2026)](#0-v351--performance--scale-hardening-july-10-2026)
0. [v3.5.0 — Backend File Split & Modularisation (July 10, 2026)](#0-v350--backend-file-split--modularisation-july-10-2026)
0. [v3.4.0 — Receipt Export Layout Refactor & TypeScript Hardening (July 10, 2026)](#1-v340--receipt-export-layout-refactor--typescript-hardening-july-10-2026)
1. [v3.3.1 — Re-import Setup & Bug Fixes (July 9, 2026)](#1-v331--re-import-setup--bug-fixes-july-9-2026)
1. [v3.3.0 — Email & Security Hardening (July 8, 2026)](#1-v330--email--security-hardening-july-8-2026)
2. [v3.2.4 – v3.2.5 — Security Upgrade & Password Policy Correction (July 6, 2026)](#2-v324--v325--security-upgrade--password-policy-correction-july-6-2026)
3. [v3.1.1 — Replit Environment Migration & TypeScript Clean (July 3, 2026)](#3-v311--replit-environment-migration--typescript-clean-july-3-2026)
4. [v3.1.0 — Backup & Restore Redesign + Download + Scheduler (June 30, 2026)](#4-v310--backup--restore-redesign--download--scheduler-june-30-2026)
5. [v3.0.0 — Setup Wizard, SMTP Integration & Auto-Import (June 30, 2026)](#5-v300--setup-wizard-smtp-integration--auto-import-june-30-2026)

---

## 0. v3.5.3 — Optimization Round 2: Query Caching, Load Testing & Safe Rate-Limiter Bypass (July 10, 2026)

**Goal:** Push past the v3.5.1 performance baseline with query-level caching, a lightweight APM surrogate, and actual measured load-test numbers instead of estimates.

| Change | Description |
|--------|-------------|
| **Process-local TTL query cache** | New `lib/query-cache.ts` — plain `Map`-based 5s TTL cache (not Redis; single-process app) in front of `GET /api/dashboard`, `GET /api/admin/users-overview`, `GET /api/reports/daily`, `GET /api/reports/monthly`. Keys are user+date scoped for the per-user endpoints, global for the admin-only overview. Invalidated synchronously via `invalidateLedgerCaches()` on every ledger create/update/delete — never relies on TTL alone for correctness after a write. |
| **Lightweight APM surrogate** | `app.ts`'s `pinoHttp` now computes `customLogLevel` so requests over `SLOW_REQUEST_MS` (default 500ms, env-overridable) log at `warn` with a `slowRequest: true` prop, without adding a full tracing agent. |
| **Real load testing** | New `pnpm --filter @workspace/api-server run loadtest` script (`autocannon`) exercises `/api/dashboard`, `/api/admin/users-overview`, `/healthz`. Measured on this container, 20 concurrent connections for 8s, 0 errors: dashboard p50 47ms / p95 272ms / p99 362ms at ~278 req/s; admin overview p50 46ms / p95 251ms / p99 298ms at ~284 req/s; healthz p50 16ms / p95 32ms at ~1133 req/s. |
| **Rate-limiter loopback skip, safely scoped** | The general `express-rate-limit` (500/15min) now skips loopback IPs (127.0.0.1/::1) so the load-test tool can generate real concurrent traffic without tripping it — but only when `NODE_ENV !== "production"`. Since `trust proxy` is on, `req.ip` is derived from `X-Forwarded-For`, which is attacker-spoofable; gating the whole skip branch on non-production removes the bypass code path entirely once deployed, rather than trusting the IP check alone. |
| **CDN / read replicas — explicitly not done** | Both flagged as follow-ups rather than claimed complete. Static assets already have correct cache headers (see v3.5.2) but no edge/CDN layer sits in front of them; adding one is an infra choice, not an app-code change. Read replicas would require an external Postgres provider — Replit's built-in Postgres doesn't expose one. |

---

## 0. v3.5.2 — Asset & Delivery Hardening (July 10, 2026)

**Goal:** Close out the remaining items from a performance/security review — CSP, session overhead on health checks, image weight, and production cache correctness.

| Change | Description |
|--------|-------------|
| **CSP enabled** | `app.ts`'s `helmet()` call now sets `contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } }` instead of `false`. The API only ever returns JSON, so this has no functional impact and closes an otherwise-open header. |
| **Health checks skip session store** | `healthRouter` and `setupStatusRouter` moved out of `routes/index.ts` and mounted directly in `app.ts`, *before* `express-session`. They still run after `cors`/`helmet`/rate-limiting, but no longer pay the `connect-pg-simple` Postgres round-trip on every uptime-monitor or setup-status poll. |
| **`vite-plugin-image-optimizer` added** | New devDependency (with `sharp` + `svgo`) in `sahu-csc`'s `vite.config.ts`, quality 80 for png/jpeg/jpg/webp, `multipass` for svg. Runs on every production build against both bundled and `public/`-folder assets. |
| **One-off static image compression** | `public/sahu-logo-glow.png` 1.6MB → 144KB, `public/og-image.png`, `public/opengraph.jpg`, `public/logo.jpg.jpg` also shrunk via a one-time `sharp` pass before the plugin was wired in. |
| **`scripts/serve.mjs` replaces `sirv-cli`** | `sirv-cli`'s `--maxage`/`--immutable` flags apply uniformly to every served file, including `index.html` via SPA fallback — meaning a browser/CDN could cache the HTML shell for a year and miss new deploys. The new script uses the `sirv` package directly with a `setHeaders` callback that classifies responses by the *request* pathname (since sirv always passes that, not the fallback file, to `setHeaders`): extensionless paths (client routes), `/`, `.html`, and `sw.js`/`sw.mjs` get `no-store`; hashed build assets get `max-age=31536000, immutable`; everything else gets a short `max-age=300`. `sirv-cli` removed from dependencies. |
| **Package versions synced** | `sahu-csc` (was `3.4.0`) and `api-server` (was `3.5.0`) both bumped to `3.5.2` to match the platform-wide version going forward. |

---

## 0. v3.5.1 — Performance & Scale Hardening (July 10, 2026)

**Goal:** Fix N+1 query patterns, batch bulk writes, tune the DB pool, and cut a DB round-trip off the hot auth path.

| Change | Description |
|--------|-------------|
| **N+1 query fixes** | `GET /admin/users-overview` replaced N×2 per-user queries with one grouped aggregate query (credits/debits/transaction counts via `sum`/`count` + `groupBy`) and one `DISTINCT ON` query for each user's latest entry, joined in-memory via `Map`. |
| **Batched ledger balance recalc** | `recalculateBalances()` in `ledger.ts` uses a single `UPDATE ... FROM UNNEST(...)` with bound array parameters instead of one `UPDATE` per row. |
| **Batched notification writes** | `notificationService.ts` fetches all recipients' preferences in one query and performs a single multi-row insert instead of N per-user inserts/selects. |
| **Settings routes batched** | `backups.ts`, `smtp.ts`, `vapid.ts` each replaced a per-key `SELECT` + `INSERT`/`UPDATE` loop against the `settings` table with a single multi-row `INSERT ... ON CONFLICT DO UPDATE` upsert. |
| **API bundle externalized further** | `exceljs` added to `build.mjs`'s `external` list alongside `pdfkit`/`archiver` — bundle dropped from 5.1MB → 3.6MB. All three remain real `dependencies` so they resolve at runtime. |
| **pg pool tuned** | `lib/db/src/index.ts`: `max: 20` (env-overridable via `DB_POOL_MAX`), `idleTimeoutMillis: 30s`, `connectionTimeoutMillis: 5s`. |
| **Lightweight session/role cache** | New `lib/auth/sessionCache.ts` — 5s in-process TTL cache backing `requireAuth`'s session validation and `requireRole`/`requirePermission`'s role lookups. Explicitly invalidated on session revoke, logout, role/status change, and password change/reset. |
| **Password reset/change now revokes sessions** | Both reset-password flows revoke all sessions for the account; self-service profile password change revokes all other sessions. |

---

## 0. v3.5.0 — Backend File Split & Modularisation (July 10, 2026)

**Goal:** All backend source files over ~300 lines split into focused sub-modules, using the barrel pattern so zero import sites were changed.

### Splits performed

#### `routes/password-reset.ts` (424 lines) → `routes/auth/`
| New file | Responsibility |
|----------|---------------|
| `auth/otp.ts` | `POST /auth/send-otp`, `POST /auth/verify-otp` (email OTP + legacy admin OTP mode) |
| `auth/forgot-password.ts` | `POST /auth/forgot-password` (legacy admin-generated OTP flow) |
| `auth/reset-password.ts` | `POST /auth/reset-password` (new token mode + legacy identifier+OTP mode) |

`routes/auth/index.ts` updated to mount all three. `routes/password-reset.ts` replaced with an empty stub router (backward-compat import guard).

#### `routes/aeps.ts` (403 lines) → `routes/aeps/`
| New file | Responsibility |
|----------|---------------|
| `aeps/sessions.ts` | `GET/POST /aeps/session`, `GET /admin/aeps-overview` |
| `aeps/transactions.ts` | `GET/POST/PATCH/DELETE /aeps/transaction(s)`, `GET /receipts/verify/aeps/:token` |

`routes/aeps.ts` overwritten as barrel re-export → `routes/aeps/index.ts`.

#### `routes/udhari.ts` (400 lines) → `routes/udhari/`
| New file | Responsibility |
|----------|---------------|
| `udhari/customers.ts` | Customer CRUD + `GET /udhari/summary` + `recalcBalance` helper |
| `udhari/entries.ts` | Entry CRUD per customer (gave/got) |

`routes/udhari.ts` overwritten as barrel re-export → `routes/udhari/index.ts`.

#### `lib/monthly-export.ts` (395 lines) → `lib/monthly-export/`
| New file | Responsibility |
|----------|---------------|
| `monthly-export/pdf.ts` | `generateReceiptPdf()` — PDFKit A4 receipt renderer |
| `monthly-export/zip.ts` | `buildMonthlyZip()` — queries DB, generates PDFs, bundles ZIP |
| `monthly-export/email.ts` | `sendMonthlyExportEmail()` — sends ZIP to admin emails |
| `monthly-export/scheduler.ts` | `scheduleMonthlyExport()` — node-cron job (1st of month, 00:05) |

`lib/monthly-export.ts` overwritten as barrel re-export.

#### `routes/reports.ts` (327 lines) → dashboard extracted
- `/dashboard` handler moved to new `routes/dashboard.ts`
- `getServiceBreakdownData` and `getAepsData` now exported from `reports.ts` so `dashboard.ts` can import them
- `dashboard.ts` registered in `routes/index.ts`

#### `routes/admin-registration.ts` (321 lines) → appeals extracted
- Appeals routes (`GET /admin/users/appeals`, `PATCH re-approve`, `PATCH dismiss-appeal`, `POST dismiss-all`) moved to new `routes/admin-appeals.ts`
- `admin-registration.ts` now only handles registration settings + pending user approve/reject
- `admin-appeals.ts` registered in `routes/index.ts`

### Convention enforced
- **Barrel pattern** — original filename overwritten as re-export so all external import sites remain unchanged
- **No circular imports** — sub-modules import from `../../lib/auth` etc., never from each other's parents

---

## 1. v3.4.0 — Receipt Export Layout Refactor & TypeScript Hardening (July 10, 2026)

### Receipt Export Page — Full Layout Refactor (`receipt-export.tsx`)

The page previously built its own duplicate navy header, desktop stat-strip header, and mobile bottom nav bar — reproducing the app's shared layout chrome from scratch inside the page file.

**What changed:**
- Removed all custom header/nav markup (desktop navy header + stat band, mobile navy top bar, mobile 4-tab fixed bottom nav at `/receipt-export`)
- Added `import { Layout }` from `@/components/layout` — now uses the same sidebar, top header, and mobile bottom nav as every other page
- Added `import { useIsMobile }` from `@/hooks/use-mobile` — branches rendering at 768px breakpoint
- Removed `import { useLocation }` from `wouter` (was only used for back-button navigation in the now-removed custom headers)

**Desktop layout (≥768px):**
4-column KPI stat bar → filter row (date presets + operator dropdown) → two-column body: receipt table with checkboxes on the left, export panel + receipt preview card + monthly auto-export on the right.

**Mobile layout (<768px):**
KPI mini-strip → horizontal pill tab row (Receipts / By Date / Summary / Export) positioned at top of content area — no conflict with the global fixed bottom nav. Expandable filter sheet on the Receipts tab, full single-receipt preview overlay, sticky export CTA on the Export tab.

**No functional changes:** All state, handlers, data fetching, `ReceiptModal`, and export logic are unchanged.

### TypeScript Hardening

- Added `UserOverview` interface typed from the `GET /api/admin/users-overview` response shape (`userId`, `username`, `fullName`, `role`, `isActive`, `balance`, `totalCredits`, `totalDebits`, `totalTransactions`)
- Replaced `useQuery<any[]>` + `.map((u: any) => ...)` with fully-typed `useQuery<UserOverview[]>` and inferred map callbacks

---

## 1. v3.3.1 — Re-import Setup & Bug Fixes (July 9, 2026)

### Bug Fixes

- **`lib/vapid.ts` — persistence flag:** `VAPID_KEYS_FROM_ENV=true` now set when loading keys from the settings table, so `/api/healthz` no longer reports `ephemeral/degraded` after first boot
- **`lib/vapid.ts` — keypair atomicity:** Partial keypair detection (only one key in DB) deletes both and regenerates together — prevents mismatched public/private pair from silently breaking push subscriptions
- **`lib/push.ts` — base64 strip:** `initPush()` strips trailing `=` padding and whitespace from VAPID keys before `webPush.setVapidDetails()` — copy-paste artifact from secrets form no longer crashes the server
- **`lib/sanitize.ts`:** `xss.IFilterXSSOptions` → named import `IFilterXSSOptions` — resolved TypeScript TS2833 error; typecheck now passes with 0 errors
- **`sahu-csc/package.json`:** Production `sirv` serve path corrected from `dist/` to `dist/public/` (Vite's actual output directory)

### Workflow & Environment

- **Duplicate workflow eliminated:** `artifacts/api-server: API Server` (auto-generated by Replit from artifact registration) overridden in `.replit` with a no-op stub — no more port 8080 conflict
- **API Server workflow** simplified to direct `node --enable-source-maps artifacts/api-server/dist/index.mjs` launch
- **Missing workflows restored:** `Build API`, `Typecheck`, `Build Production`, `Production Preview`
- **postMerge timeout** increased from 20 s → 180 s
- **All secrets fully configured:** `SESSION_SECRET`, `ADMIN_PASSWORD`, `OPERATOR_PASSWORD`, `SMTP_PASS`, `VAPID_PRIVATE_KEY` as Replit Secrets; `VAPID_PUBLIC_KEY` as shared env var
- **Health:** `GET /api/healthz` → `status: ok`, `vapid.persistent: true`; `GET /api/setup-status` → `configured: true, missing: []`

---

## 1. v3.3.0 — Email & Security Hardening (July 8, 2026)

### V2 Dark Premium Email Templates
- All 7 transactional email types rewritten in `artifacts/api-server/src/lib/mailer.ts`
- Dark gradient page (`#0a1628 → #1e3a5f`), dark navy card (`#0f2244`), 4px accent top strip per type
- Per-type accents: OTP verify = emerald, password reset OTP = amber, approval = emerald, rejection = rose, admin alert = sky blue, broadcast = violet, admin reset link = amber
- Single `buildV2Html()` wrapper — consistent structure across all types
- `esc()` HTML-escape helper applied to every dynamic field (name, reason, body, username, resetUrl, expiryTime)

### OTP Email Copy Strip
- Digit boxes and copy strip joined in one card — full OTP shown in large spaced monospace below digits
- Label "Copy this code" — no JS, works in all email clients
- OTP validated `/^\d+$/` before rendering; non-numeric shows `------`
- Description shortened to one action sentence with expiry bolded inline

### SMTP Configured
- Gmail: `smtp.gmail.com:587`, from `SAHU CSC Support <sahuuttam690@gmail.com>`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_FROM_EMAIL` → shared env vars
- `SMTP_PASS` → Replit Secret

### Password Policy
- Minimum 8 chars, no maximum (was 6–8)
- Requires: uppercase + lowercase + number + special character
- Frontend schema and strength bar (5 checks) synced with backend

### Login Lockout
- Locks after **3** failed attempts for **5 minutes** (was 5 attempts / 15 min)

---

## 1. v3.2.4 – v3.2.5 — Security Upgrade & Password Policy Correction (July 6, 2026)

### Overview

Platform-wide security hardening across four areas: password policy, rate limiting, encryption at rest, and a review of password hashing strength. Shipped as v3.2.4, then corrected in v3.2.5 after the initial password length (10+ chars) proved too strict — final policy is 6–8 characters with upper/lower/number/special-character complexity.

### Password Policy

- New shared `passwordPolicySchema` (`artifacts/api-server/src/lib/password-policy.ts`), applied consistently to registration, password reset (legacy + token flows), profile self-service password change, and admin-created/updated user accounts.
- Removed the previous inconsistency where profile self-service change only required 6 characters with no complexity rules.

### Rate Limiting

- Login limiter reduced from 20 to 8 attempts / 15 minutes per IP.
- New `authWriteLimiter` (10/15min) on register, appeal, send-otp, forgot-password.
- New `otpVerifyLimiter` (8/15min) on verify-otp, reset-password.

### Encryption at Rest

- New AES-256-GCM helper (`lib/encryption.ts`) encrypts `udhari_customers.address`, `udhari_customers.notes`, `users.address`, `users.bio`.
- `name` / `mobile` / `email` intentionally left plaintext — they're matched via `ILIKE` partial search, and encrypting them would break search.
- Encryption key auto-generates on first use and persists in the `settings` table (same pattern as VAPID key generation); overridable via an `ENCRYPTION_KEY` secret.
- Legacy plaintext rows are read transparently — no migration required.

### Password Hashing

- Reviewed: bcrypt cost factor 12 already meets current industry-standard strength. No change made.

---

## 1. v3.1.1 — Replit Environment Migration & TypeScript Clean (July 3, 2026)

### Overview

Full Replit environment setup: 7 workflows configured, all TypeScript errors resolved (0 errors across both packages), backup path bug fixed, dev script port bug fixed, ADMIN_PASSWORD + OPERATOR_PASSWORD secrets configured, and production build verified.

### Workflows Added

| Workflow | Port | Auto-starts | Purpose |
|----------|------|-------------|---------|
| `SAHU CSC` | 5000 | ✅ Yes | Vite frontend dev server |
| `API Server` | 8080 | ✅ Yes | Runs pre-built `dist/index.mjs` |
| `Build API` | — | ❌ No | Rebuilds API ESM bundle |
| `Seed Database` | — | ❌ No | Seeds DB from secrets |
| `Typecheck` | — | ❌ No | TypeScript check (0 errors) |
| `Build Production` | — | ❌ No | Full production build |
| `Production Preview` | 5000 | ❌ No | Build + serve production bundle |

### Bug Fixes

**Backup directory path** — `artifacts/api-server/src/routes/settings.ts` + `backup-scheduler.ts` + `scripts/backup.ts` + `scripts/restore.ts`
- Was: `../../backups` — resolved to workspace root; wrong when running from `artifacts/api-server/`
- Fixed: `backups` — relative to `process.cwd()` which is `artifacts/api-server/`
- Added: `mkdirSync(BACKUP_DIR, { recursive: true })` to prevent crash on missing directory

**Frontend dev script port** — `artifacts/sahu-csc/package.json`
- Was: `fuser -k ${PORT:-21700}/tcp` — was killing the canvas artifact port instead of self
- Fixed: `fuser -k ${PORT:-5000}/tcp`

### TypeScript Fixes — API Server (6 → 0 errors)

| File | Fix |
|------|-----|
| `routes/settings.ts` | Added missing `logger` import |
| `routes/broadcast.ts` | `url ?? undefined` instead of `url ?? null` |
| `lib/auth.ts` | `auditLog` signature: `userId: number` → `userId: number \| null`, added null guard |
| `routes/admin-receipt-export.ts` | Cast `archiver` as any for callable type; typed `err: Error` |
| `lib/monthly-export.ts` | Same archiver callable cast |

### TypeScript Fixes — Frontend (7 → 0 errors)

| File | Fix |
|------|-----|
| `pages/aeps.tsx` | Added `useEffect` to React imports |
| `pages/reports.tsx` | Added `AreaChart`, `Area`, `Skeleton` imports |
| `pages/udhari.tsx` | Added `Skeleton` import |
| `pages/users.tsx` | Added `Skeleton` import |
| `pages/ledger.tsx` | Wrapped `mutateAsync` args in `{ data: { ... } }` (Orval-generated API wrapper) |
| `hooks/use-toast.ts` | Cast `ReactNode` to `string` where string is required |
| `components/whats-new-modal.tsx` | Added `return undefined` to all branches |

### Build Verification

- **Typecheck:** 0 errors (both `@workspace/api-server` and `@workspace/sahu-csc`)
- **API bundle:** 5.0 MB ESM, built in ~1.5s
- **Frontend bundle:** All chunks under threshold; built in ~16s
- **PWA service worker:** 76 precache entries, 5254 KiB

---

## 1. v3.1.0 — Backup & Restore Redesign + Download + Scheduler (June 30, 2026)

### Overview

Full overhaul of the Backup & Restore admin page plus four new backend capabilities: backup file download, SQL file import, selective table import, and a `node-cron` auto-backup scheduler.

### Frontend — Backup Page Redesign (`backups.tsx`)

**Design system: "Minimal Clean"**

The page was previously a single-column stacked layout. It is now a **2-column desktop grid**:
- **Left 2/3** — Backup History card (table of snapshots with Download + Restore per row)
- **Right 1/3** — Auto-Backup Schedule card + Import Data card stacked vertically

**Color scheme:**
- Navy (`#0b2c60`) — 3px top-border accent on all cards, card titles, icon badges, active day chips, frequency pills, Save Schedule button, Analyze button
- Saffron (`#f97316`) — Create Backup button, Import Now button, upload dropzone icon, enabled schedule toggle
- Red (`#dc2626`) — Restore confirm (destructive action)
- Emerald — Active schedule status dot + "Active" label

**Cards use a shared `NavyCard` + `CardHead` helper component** (defined inline in `backups.tsx`) to keep consistent styling across the three sections.

**Action buttons:** Download turns navy on hover, Restore turns saffron on hover. Labels shown inline on `sm:` breakpoint, icon-only on mobile.

**Import flow (inline in the Import card):**
1. Dashed drop-zone with saffron `UploadCloud` icon → file selected → navy "Analyze File" button
2. Table checkboxes appear (scrollable list, max-h-48) → All / None quick-select
3. Saffron "Import N" button → selective import confirm dialog → import
4. Green success banner + "Import another file" reset link

**Schedule card:**
- Saffron toggle (enabled) / slate toggle (disabled)
- Active status: green dot + "Active · [frequency summary]" label
- Fields: Frequency (3-pill grid), Time (time input), Day picker (individual day chips), Retention (number input)
- All fields opacity-40 + pointer-events-none when schedule is disabled
- Navy "Save Schedule" button at the bottom

### Backend — New API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/backups/:id/download` | admin | Streams `.sql` file via `createReadStream`. Sets `Content-Disposition: attachment` + `Content-Length`. Logs `backup.download` audit event. |
| `POST` | `/api/backups/analyze` | admin | Multer file upload → reads file → parses `COPY <table>` blocks → returns `{ tables: [{ name, label, rowCount }], tmpPath, originalName }`. |
| `POST` | `/api/backups/selective-import` | admin | Receives `{ tmpPath, selectedTables[], originalName }`. Disables FK checks via `SET session_replication_role = replica`, replays `DELETE + COPY` for each selected table, then restores FK checks. |
| `GET` | `/api/backups/schedule` | admin | Returns current schedule config from `settings` table. |
| `POST` | `/api/backups/schedule` | admin | Saves schedule config to `settings` table, restarts the in-process cron job. |

### Backend — Auto-Backup Scheduler (`backup-scheduler.ts`)

`artifacts/api-server/src/lib/backup-scheduler.ts` — singleton `BackupScheduler` class:

- Initialized in `index.ts` at startup: `initBackupScheduler()`
- On each cron tick: reads `settings` table → checks `backupEnabled` → runs `pg_dump` → inserts into `backups` table → applies retention (deletes oldest files + DB rows beyond `backupRetention` count)
- Supports `frequency: "daily" | "weekly" | "custom"` with `days[]` (0=Sun … 6=Sat) and `time` (HH:MM)
- `restartScheduler(config)` called by `POST /api/backups/schedule` to apply changes immediately without server restart
- Logs `backup.auto` audit event on success; logs error on failure (does not crash the server)

---

## 1. v3.0.0 — Setup Wizard, SMTP Integration & Auto-Import (June 30, 2026)

### What's New at a Glance

| Feature | Description |
|---------|-------------|
| **Setup Wizard Banner** | Admin-only banner shown after login when required secrets are missing. Red = critical, yellow = optional. Expandable with per-secret descriptions. Session-dismissed. |
| **`/api/setup-status` endpoint** | Public endpoint (no auth) returning `{ configured, missing[] }`. Checks SESSION_SECRET, SMTP, and VAPID. |
| **SMTP fully configured** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL` all set. OTP email, password reset, admin approval emails, broadcast emails all active. |
| **VAPID auto-generation** | VAPID keys auto-generated on API startup if not set. No manual key generation required for dev. |
| **`scripts/post-merge.sh`** | Auto-runs `pnpm install` + `drizzle-kit push` on every GitHub import or task merge. Zero-touch schema setup. |
| **V3 documentation** | Complete rewrite of all docs: `BUILD.md`, `WORKFLOWS.md`, `architectureV3.md`, `ReplitV3.md`, `CHANGELOG_V3.md`. |
| **Package version bump** | `@workspace/sahu-csc` and `@workspace/api-server` bumped from 2.7.0 → 3.0.0. |
| **TWA version bump** | `twa-config.json` `appVersionName` 1.0.0 → 3.0.0, `appVersionCode` 1 → 3. |

---

### 1.1 Setup Wizard Banner

**File:** `artifacts/sahu-csc/src/components/setup-wizard-banner.tsx`  
**Integrated in:** `artifacts/sahu-csc/src/components/layout.tsx`

A collapsible admin-only banner rendered at the top of every page (above content, below the header) when the platform is not fully configured.

#### How it works

1. On mount, `SetupWizardBanner` fetches `GET /api/setup-status`
2. If `configured: false` and not session-dismissed → renders the banner
3. **Red banner** — critical secrets missing (`SESSION_SECRET`, `SMTP_*`)
4. **Yellow banner** — only optional secrets missing (VAPID)
5. Expandable section: each missing item shows label, severity badge, and description
6. **"Open Secrets Docs"** button links to Replit docs
7. Dismissed per-session via `sessionStorage.setItem("sahu-setup-banner-dismissed-v1", "1")`

#### Banner states

| State | Color | Trigger |
|-------|-------|---------|
| Critical | 🔴 Red `bg-red-50 border-red-200` | SESSION_SECRET or SMTP missing |
| Optional | 🟡 Yellow `bg-yellow-50 border-yellow-200` | Only VAPID missing |
| Dismissed | Hidden | `sessionStorage` key set |
| Configured | Hidden | All checks pass |

#### Wiring in layout.tsx

```tsx
// layout.tsx — admin-only, rendered after PWAInstallBanner
{isAdmin && <SetupWizardBanner />}
```

#### Files changed

- `artifacts/sahu-csc/src/components/setup-wizard-banner.tsx` — new component
- `artifacts/sahu-csc/src/components/layout.tsx` — import + render (admin-only guard)

---

### 1.2 `/api/setup-status` Public Endpoint

**File:** `artifacts/api-server/src/routes/setup-status.ts`  
**Registered in:** `artifacts/api-server/src/routes/index.ts` (first, before all other routers)

```
GET /api/setup-status   — no authentication required
```

#### Response schema

```typescript
{
  configured: boolean;          // true only when ALL checks pass
  missing: Array<{
    key: string;                // e.g. "SMTP"
    label: string;              // e.g. "Email / SMTP"
    severity: "critical" | "optional";
    description: string;        // human-readable explanation
  }>;
}
```

#### Checks performed

| Check | Key | Severity | Condition |
|-------|-----|----------|-----------|
| Express session secret | `SESSION_SECRET` | critical | `process.env.SESSION_SECRET` missing or equals `"fallback-secret-please-set"` |
| SMTP email | `SMTP` | critical | Any of `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` missing |
| Push notifications | `VAPID` | optional | `VAPID_PUBLIC_KEY` or `VAPID_PRIVATE_KEY` missing AND no auto-generated flag in `lib/vapid.ts` |

#### Design decisions

- **No auth required** — called before login from the banner (and potentially from a future onboarding flow)
- **Never exposes secret values** — only boolean presence flags, labels, and descriptions
- **Registered first** — placed before `healthRouter` in `routes/index.ts` so it's always accessible even if other middleware fails

#### Example responses

Fully configured:
```json
{ "configured": true, "missing": [] }
```

SMTP not configured:
```json
{
  "configured": false,
  "missing": [
    {
      "key": "SMTP",
      "label": "Email / SMTP",
      "severity": "critical",
      "description": "Required for OTP login and notifications. Missing: SMTP_HOST, SMTP_USER, SMTP_PASS."
    }
  ]
}
```

---

### 1.3 SMTP Email — Fully Configured

All five SMTP secrets are now set in Replit Secrets:

| Secret | Status |
|--------|--------|
| `SMTP_HOST` | ✅ Set |
| `SMTP_PORT` | ✅ Set |
| `SMTP_USER` | ✅ Set |
| `SMTP_PASS` | ✅ Set |
| `SMTP_FROM_EMAIL` | ✅ Set |

**What this unlocks:**

| Feature | Status before | Status after |
|---------|--------------|--------------|
| OTP email (registration) | ❌ Disabled | ✅ Active |
| OTP email (password reset) | ❌ Disabled | ✅ Active |
| Admin approval emails | ❌ Disabled | ✅ Active |
| Broadcast email blast | ❌ Disabled | ✅ Active |

`isSmtpConfigured()` in `lib/mailer.ts` returns `true` when all required SMTP env vars are present.

---

### 1.4 VAPID Auto-Generation

**File:** `artifacts/api-server/src/lib/vapid.ts`

If `VAPID_PUBLIC_KEY` or `VAPID_PRIVATE_KEY` is not set as an environment variable, `vapid.ts` auto-generates temporary keys on API startup using `webpush.generateVAPIDKeys()`.

**Behaviour:**
- Generated keys are stored in memory only — lost on API restart
- Push subscriptions cannot survive API restarts without persistent VAPID keys
- `GET /api/setup-status` marks VAPID as "optional missing" if using auto-generated keys
- `GET /api/healthz` reports VAPID status in its response

**For production:** Generate persistent VAPID keys and store in Replit Secrets:
```bash
node -e "const wp = require('web-push'); console.log(wp.generateVAPIDKeys())"
```

---

### 1.5 Automatic Import Setup — `scripts/post-merge.sh`

**File:** `scripts/post-merge.sh`  
**Configured in:** `.replit` under `[postMerge]` (20-second timeout)

```bash
#!/bin/bash
set -e
echo "[post-merge] Installing dependencies..."
pnpm install --frozen-lockfile

echo "[post-merge] Pushing database schema..."
pnpm --filter @workspace/db run push

echo "[post-merge] Done."
```

**Properties:**
- **Idempotent** — safe to run multiple times (drizzle-kit push only creates/alters, never drops unless schema changes)
- **Frozen lockfile** — never modifies pnpm-lock.yaml
- **Automatic** — runs on every GitHub import or task agent merge without any manual action
- **~2.7 seconds** typical runtime

**What still needs manual action (secrets):**

| Secret | Where to add |
|--------|-------------|
| `SESSION_SECRET` | Replit Secrets tab (🔒) |
| `SMTP_*` (5 vars) | Replit Secrets tab |
| `VAPID_*` (optional) | Replit Secrets tab |
| `DATABASE_URL` | Auto-provisioned by Replit PostgreSQL |

---

### 1.6 V3 Documentation Overhaul

All project documentation updated to reflect the current V3 state of the platform:

| File | Status | Notes |
|------|--------|-------|
| `BUILD.md` | ✅ Complete rewrite | Removed stale Firebase/Neon/Redis references; V3 stack |
| `WORKFLOWS.md` | ✅ Updated to V3.0.0 | New troubleshooting section for port 21700 conflict |
| `architectureV3.md` | ✅ New file | Authoritative V3 architecture reference |
| `ReplitV3.md` | ✅ New file | V3 quick-reference for agents and developers |
| `CHANGELOG_V3.md` | ✅ New file | This file — V3 change history |
| `docs/archive/changelogV2.md` | ✅ V3 header added | Cross-reference to CHANGELOG_V3.md |
| `CHANGELOG.md` | ✅ V3 entry added | Top-level version history entry |
| `docs/DESKTOP_FORMS_V2.md` | ✅ Version note added | No functional changes to the spec |
| `infrastructure/pwa/manifest.json` | ✅ No changes needed | Already current |
| `infrastructure/twa/twa-config.json` | ✅ Version bumped | appVersionName 3.0.0, appVersionCode 3 |
| `replit.md` | ✅ V3.0.0 (already current) | Updated in previous session |

---

### 1.7 Package Version Bumps

| Package | Old | New |
|---------|-----|-----|
| `@workspace/sahu-csc` | 2.7.0 | 3.0.0 |
| `@workspace/api-server` | 2.7.0 | 3.0.0 |
| TWA `appVersionName` | 1.0.0 | 3.0.0 |
| TWA `appVersionCode` | 1 | 3 |

---

### 1.8 Known State (June 30, 2026)

| Component | Status |
|-----------|--------|
| API Server (port 8080) | ✅ Running |
| Frontend (port 5000 → :80) | ✅ Running |
| Database | ✅ Connected (15 tables) |
| SMTP | ✅ Fully configured |
| VAPID push | ✅ Auto-generated (set secrets for production persistence) |
| Setup status | ✅ `{ "configured": true, "missing": [] }` |
| Default accounts | ✅ Seeded (admin/admin123, operator/operator123) |
| i18n | ✅ EN / HI / OR — all 25 pages translated |
| PWA | ✅ Service worker active, offline-capable |
| Android TWA | 🔄 Requires: deploy → generate keystore → update assetlinks.json → Play Console |

---

## Appendix — Full API Route Reference (V3)

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Login (username/email/mobile + password) |
| POST | `/api/auth/logout` | Yes | Logout + revoke session |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/register` | No | Self-registration (creates pending user) |
| POST | `/api/auth/send-otp` | No | Send OTP to email (password reset) |
| POST | `/api/auth/verify-otp` | No | Verify OTP |
| POST | `/api/auth/reset-password` | No | Set new password with valid OTP |

### Setup & Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/setup-status` | None | Missing secrets check (public) |
| GET | `/api/healthz` | No | Full system diagnostics |

### Ledger

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/ledger` | Yes | Paginated list (user-scoped) |
| POST | `/api/ledger` | Yes | Create entry (auto-computes balance) |
| PATCH | `/api/ledger/:id` | Yes | Update (IDOR check) |
| DELETE | `/api/ledger/:id` | Yes | Delete (IDOR check) |
| DELETE | `/api/ledger/all` | Admin | Wipe all entries |
| GET | `/api/ledger/balance` | Yes | `{ balance, totalCredits, totalDebits }` |
| GET | `/api/ledger/summary` | Yes | Period totals (today/week/month) |

### Receipts

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/receipts/verify/:token` | None | Public QR receipt verification |

### AePS

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/aeps/session` | Yes | Session + transactions + running balance |
| POST | `/api/aeps/session` | Yes | Create/update daily session |
| POST | `/api/aeps/transaction` | Yes | Add withdrawal or deposit |
| PATCH | `/api/aeps/transaction/:id` | Yes | Edit transaction |
| DELETE | `/api/aeps/transaction/:id` | Yes | Delete transaction |

### Udhari Khata

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/udhari/customers` | Yes | Customer list (user-scoped) |
| POST | `/api/udhari/customers` | Yes | Create customer |
| GET | `/api/udhari/customers/:id` | Yes | Customer + entries + balance |
| PATCH | `/api/udhari/customers/:id` | Yes | Update customer |
| DELETE | `/api/udhari/customers/:id` | Yes | Delete customer + entries |
| POST | `/api/udhari/customers/:id/entries` | Yes | Add gave/got entry |
| PATCH | `/api/udhari/entries/:id` | Yes | Edit entry |
| DELETE | `/api/udhari/entries/:id` | Yes | Delete entry |

### Reports

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard` | Yes | Dashboard summary + stats |
| GET | `/api/reports/daily` | Yes | Day summary |
| GET | `/api/reports/monthly` | Yes | Monthly totals + daily breakdown |
| GET | `/api/reports/aeps` | Yes | AePS-only report |
| GET | `/api/reports/service-breakdown` | Yes | Per-service count + revenue |
| GET | `/api/reports/export` | Yes | Download `.xlsx` (Ledger + AePS sheets) |

### Sessions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/sessions` | Yes | All active sessions |
| DELETE | `/api/sessions/:id` | Yes | Revoke specific session |
| DELETE | `/api/sessions/others` | Yes | Revoke all except current |
| DELETE | `/api/sessions/all` | Yes | Revoke ALL → redirect to login |

### Users (Admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | Admin | All users |
| POST | `/api/users` | Admin | Create user |
| PATCH | `/api/users/:id` | Admin | Update / set password / toggle status |
| DELETE | `/api/users/:id` | Admin | Delete user |

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/users-overview` | Admin | Cross-user balance summary |
| GET | `/api/admin/users-overview/:userId/ledger` | Admin | Single user's ledger |
| GET | `/api/admin/aeps-overview` | Admin | All users' AePS balances |
| GET | `/api/admin/broadcast/stats` | Admin | Push + email subscriber counts |
| POST | `/api/admin/broadcast/push` | Admin | Send push to all subscribers |
| POST | `/api/admin/broadcast/email` | Admin | Send email to all/active users |
| GET | `/api/admin/broadcast/history` | Admin | Paginated broadcast log |
| GET | `/api/admin/receipts/export` | Admin | Bulk receipt export |
| GET | `/api/admin/sessions` | Admin | View all users' sessions |
| DELETE | `/api/admin/sessions/:id` | Admin | Revoke any user's session |
| GET | `/api/admin/registrations` | Admin | Pending registrations |
| POST | `/api/admin/registrations/:id/approve` | Admin | Approve registration |
| POST | `/api/admin/registrations/:id/reject` | Admin | Reject registration |

### Push Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/push/vapid-public-key` | Yes | VAPID public key for browser subscription |
| POST | `/api/push/subscribe` | Yes | Save push subscription |
| DELETE | `/api/push/unsubscribe` | Yes | Remove push subscription |
| GET | `/api/push/subscriptions` | Yes | List own subscriptions |

### Profile, Preferences, Notifications, Audit, Settings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/PATCH | `/api/profile` | Yes | Own profile (avatar, bio, password) |
| GET/PATCH | `/api/preferences` | Yes | Per-user UI preferences |
| GET | `/api/notifications` | Yes | Notification inbox |
| PATCH | `/api/notifications/:id/read` | Yes | Mark read |
| POST | `/api/notifications/read-all` | Yes | Mark all read |
| DELETE | `/api/notifications/:id` | Yes | Delete notification |
| GET | `/api/audit-logs` | Admin | Paginated audit trail |
| GET/PATCH | `/api/settings` | Admin | Global settings |
| GET | `/api/services` | Yes | Service catalog |
| POST/PATCH/DELETE | `/api/services/:id` | Admin | Manage services |
