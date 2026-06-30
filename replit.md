# SAHU CSC — Common Service Center Management Platform
**Version 3.1.0** — last updated 2026-06-30

A full-stack CSC (Common Service Center) business management platform for tracking services, ledger accounting, AePS cash management, Udhari Khata (customer credit ledger), and reporting. Built for Odisha / India rural service centers. Supports PWA installation, offline operation, Android TWA packaging, and full multilingual UI (English / Hindi / Odia).

---

## What's New in v3.1.0

| Feature | Description |
|---------|-------------|
| **Backup page redesign** | Complete "Minimal Clean" UI — 2-column desktop grid (history left, schedule+import right), navy card borders, saffron CTAs, dashed import dropzone, expand-on-hover action buttons. |
| **Backup download** | `GET /api/backups/:id/download` — streams `.sql` file to browser with `Content-Disposition: attachment`. Download button on each table row. |
| **Auto-backup scheduler** | `node-cron` scheduler (`backup-scheduler.ts`) — daily/weekly/custom cron, configurable time + retention. `GET/POST /api/backups/schedule` endpoints. |
| **Selective table import** | `POST /api/backups/analyze` parses pg_dump COPY blocks. `POST /api/backups/selective-import` replays chosen tables with FK checks disabled. |

## What's New in v3.0.0

| Feature | Description |
|---------|-------------|
| **Setup Wizard Banner** | Admin-only banner shown after login when required secrets are missing. Red for critical, yellow for optional. Expandable with per-secret descriptions and Secrets docs link. Dismissible per session. |
| **`/api/setup-status` endpoint** | Public endpoint (no auth) that returns `{ configured, missing[] }` — checks `SESSION_SECRET`, SMTP, and VAPID config. |
| **Automatic DB migration on import** | `scripts/post-merge.sh` runs `pnpm install` + `drizzle-kit push` automatically on every GitHub import / task merge. No manual setup needed. |
| **3-store data architecture documented** | PostgreSQL (14 tables), IndexedDB (5 stores), Service Worker cache (10 cache buckets) — all three tiers documented. |

---

## Workflows

| Workflow | Port | Purpose | Starts with Project |
|----------|------|---------|---------------------|
| `API Server` | 8080 | Express API server (main) | ✅ Yes |
| `artifacts/sahu-csc: web` | 5000 → :80 | Vite frontend webview | ✅ Yes |
| `Seed Database` | — | One-shot DB seeder; resets admin + operator passwords | ❌ Manual only |
| `artifacts/api-server: API Server` | 8080 | Artifact-managed API (auto-added by platform) | ⚠️ Platform-injected |
| `artifacts/mockup-sandbox: Component Preview Server` | 8081 | Design mockup sandbox (canvas) | ⚠️ Platform-injected |

> **Note:** The `Project` run button starts `API Server` + `artifacts/sahu-csc: web` in parallel. The platform artifact system also injects `artifacts/api-server: API Server`, `artifacts/mockup-sandbox: Component Preview Server`, and a duplicate `artifacts/sahu-csc: web` — these extra tasks can be removed manually via **Workflows → Project** in the Replit UI.
>
> Port 5000 is mapped to external port 80 (Replit proxy). The API runs on **port 8080**. The Vite proxy in `vite.config.ts` forwards `/api/*` to `http://localhost:8080`.

### Preview panel
The Preview panel shows **two entries** due to the artifact system:
- **`artifacts/sahu-csc: web`** — the real app (port 5000 → :80). **Use this one.**
- **`SAHU CSC FV1`** — canvas artifact duplicate (port 21700). Remove via ⋮ → Delete in Preview.

### Workflow commands

```bash
# API Server workflow
pnpm install && PORT=8080 pnpm --filter @workspace/api-server run dev
# dev script: (test -f ./dist/index.mjs || pnpm run build) && fuser -k 8080/tcp; pnpm run start
# Smart build: skips esbuild rebuild on restart if dist/index.mjs already exists

# artifacts/sahu-csc: web workflow
pnpm install && fuser -k 5000/tcp 2>/dev/null; sleep 1; PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run dev

# Seed Database workflow (manual, one-shot)
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts
```

> **Import-safe**: Both workflow commands run `pnpm install` before starting. `scripts/post-merge.sh` also runs `pnpm install` + `drizzle-kit push` automatically on every GitHub import or task merge.

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

### 1. PostgreSQL — 14 Tables (permanent data)

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
                              pnpm install + drizzle-kit push (schema migration)
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

Checks performed:
- `SESSION_SECRET` — required (critical)
- `SMTP_HOST` + `SMTP_USER` + `SMTP_PASS` — required for email/OTP (critical)
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
pnpm --filter @workspace/db run push

echo "[post-merge] Done."
```

This is configured in `.replit` under `[postMerge]` with a 20-second timeout. The script:
- Is **idempotent** — safe to run multiple times
- Uses `--frozen-lockfile` — never modifies the lockfile
- Runs `drizzle-kit push` — creates all 14 tables if they don't exist, applies any new columns

**What still requires manual setup (secrets):**

| Secret | Where to add |
|--------|-------------|
| `DATABASE_URL` | Auto-provisioned by Replit PostgreSQL |
| `SESSION_SECRET` | Replit Secrets tab (🔒 in left sidebar) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL` | Replit Secrets tab |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL` | Replit Secrets tab (optional) |

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
