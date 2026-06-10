# SAHU CSC — Common Service Center Management Platform

A full-stack CSC (Common Service Center) business management platform for tracking services, ledger accounting, AePS cash management, and reporting. Built for Odisha / India rural service centers. Supports PWA installation, offline operation, and Android TWA packaging.

---

## Workflows

| Workflow | Command | Port | Purpose |
|----------|---------|------|---------|
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` | 8080 | Express REST API |
| `artifacts/sahu-csc: web` | `pnpm --filter @workspace/sahu-csc run dev` | 21700 | React + Vite frontend |
| `Seed Database` | `pnpm --filter @workspace/api-server run seed` | — | Seed/reseed sample data |
| `Database Restore` | `pnpm --filter @workspace/api-server run restore` | — | Restore from backup file |

---

## Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Operator | `operator` | `operator123` |

---

## Common Commands

```bash
# Development
pnpm --filter @workspace/api-server run dev      # API server
pnpm --filter @workspace/sahu-csc run dev         # Frontend

# Database
pnpm --filter @workspace/db run push              # Push schema changes to DB
pnpm --filter @workspace/api-server run seed      # Seed sample data (safe to re-run)

# Type checking
pnpm run typecheck:libs                           # Build lib declarations first (always run before app typecheck)
pnpm run typecheck                                # Full typecheck all packages

# API codegen
pnpm --filter @workspace/api-spec run codegen     # Regenerate React Query hooks + Zod schemas from OpenAPI spec

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
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod (`zod/v4`), drizzle-zod |
| API contracts | OpenAPI spec → Orval codegen → typed React Query hooks |
| PWA | vite-plugin-pwa + Workbox service worker |
| Push notifications | web-push (VAPID) |
| Build | esbuild (ESM bundle for API) |
| Monorepo | pnpm workspaces |

---

## Directory Structure

```
artifacts/
  api-server/src/
    routes/         — Express route handlers
      auth.ts       — Login, logout, session
      ledger.ts     — Ledger CRUD (per-user filtered)
      aeps.ts       — AePS daily sessions + transactions (per-user filtered)
      reports.ts    — Daily / monthly reports (per-user filtered)
      services.ts   — CSC services catalog
      users.ts      — User management (admin only)
      admin.ts      — Admin oversight: users-overview, per-user ledger, AePS overview
      notifications.ts
      audit.ts
      settings.ts
      profile.ts
      preferences.ts
      push.ts       — Push notification subscribe/unsubscribe/list
      password-reset.ts
      health.ts
    lib/
      auth.ts       — requireAuth / requireRole middleware, session helpers
      logger.ts     — Pino structured logger
      notify.ts     — Auto-create notifications helper
      push.ts       — web-push send helpers (sendPushToUser, sendPushToAll)
      vapid.ts      — VAPID key auto-generation on startup
    scripts/
      seed.ts       — Database seeder (users, services, ledger, settings, notifications)
      backup.ts     — pg_dump backup to /backups/
      restore.ts    — psql restore from backup file

  sahu-csc/src/
    pages/
      login.tsx / forgot-password.tsx / reset-password.tsx
      dashboard.tsx       — Real-time stats + offline cache fallback
      ledger.tsx          — Transactions with offline queue support
      aeps.tsx            — AePS cash management (per-user)
      services.tsx
      reports.tsx         — Charts + Excel export + cached offline
      notifications.tsx
      profile.tsx
      users.tsx           — User management (admin)
      users-overview.tsx  — Admin overview of all users' ledger/balance (admin)
      audit-logs.tsx      — Full audit trail (admin)
      settings.tsx        — Business info, theme, backup config (admin)
      backups.tsx         — Backup and restore (admin)
      pwa-status.tsx      — App & Offline Status page (network, sync, storage, push)
      offline.tsx         — Offline fallback page
      not-found.tsx
    components/
      layout.tsx              — Main sidebar + mobile nav + PWA install banner + sync bar
      sync-status-bar.tsx     — 🟢/🟡/🔴 global sync status indicator
      pwa-install-banner.tsx  — Install prompt banner
      app-logo.tsx
      theme-provider.tsx
      ui/                     — shadcn/ui components
    hooks/
      use-auth.tsx              — Auth context + offline session cache from IndexedDB
      use-network-status.ts     — Online/offline/slow detection + latency probe (30s)
      use-pwa.ts                — Install prompt, badge, periodic sync, share, wake lock
      use-sync.ts               — Sync queue state (pending count, last sync, status)
      use-push-notifications.ts — Push subscription subscribe/unsubscribe
      use-device.tsx
      use-idle-timer.ts         — Auto-logout after 30 min inactivity
      use-wake-lock.ts
      use-file-handler.ts
      use-mobile.tsx
      use-toast.ts
    lib/
      offline-db.ts     — IndexedDB v2 wrapper (5 stores — see below)
      sync-engine.ts    — Offline queue processor; auto-syncs on window.online
      pwa-badge.ts      — App badge updater
      utils.ts

lib/
  db/src/schema/
    users.ts              — users table (id, username, email, mobile, full_name, role, active_session_token…)
    ledger.ts             — ledger table (date, customerName, serviceType, credit, debit, balance, createdBy)
    aeps.ts               — aeps_daily + aeps_transactions (both have createdBy for per-user separation)
    services.ts
    notifications.ts
    audit_logs.ts
    settings.ts
    user_preferences.ts
    push_subscriptions.ts — Push notification subscriptions (endpoint, p256dh, auth, userId)
    password_reset_tokens.ts
  api-spec/openapi.yaml   — OpenAPI spec (source of truth)
  api-client-react/src/
    generated/            — Auto-generated React Query hooks + Zod schemas (do not edit)
    custom-fetch.ts       — Base fetch wrapper (exports: customFetch, setBaseUrl, setAuthTokenGetter)
    index.ts              — Package exports (includes customFetch)

infrastructure/
  pwa/
    manifest.json         — Full standalone PWA manifest (shortcuts, screenshots, share_target, file_handlers)
  twa/
    twa-config.json       — Android TWA config for Bubblewrap CLI with setup instructions

artifacts/sahu-csc/public/
  pwa-96x96.png / pwa-144x144.png / pwa-192x192.png / pwa-512x512.png
  apple-touch-icon.png
  .well-known/assetlinks.json   — Digital Asset Links for Android TWA
```

---

## Database Schema — Key Tables

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `users` | id, username, email, role, active_session_token | role: admin / operator |
| `ledger` | date, credit, debit, balance, created_by | Per-user; running balance computed at insert |
| `aeps_daily` | date, opening_balance, created_by | Unique per (date, created_by) |
| `aeps_transactions` | session_id, amount, type | Linked to aeps_daily session |
| `push_subscriptions` | user_id, endpoint, p256dh, auth | VAPID push subscription storage |
| `settings` | key, value | Key-value store for business config |
| `notifications` | title, message, type, is_read, user_id | System notifications |
| `audit_logs` | action, entity, user_id, ip, details | Full audit trail |
| `password_reset_tokens` | token, user_id, expires_at | One-time password reset |

---

## IndexedDB Stores (v2)

| Store | Purpose | Expiry |
|-------|---------|--------|
| `pending_ledger` | Offline ledger entries queued for sync | Cleared after sync |
| `cache_store` | Generic KV cache (dashboard data, etc.) | Configurable (default 5 min) |
| `user_session` | Cached auth session for offline login | 24 hours |
| `cached_reports` | Previously generated reports | Configurable |
| `pending_notifications` | Notifications queued offline | Cleared when read |

---

## Per-User Data Separation

All data is fully isolated per user:

| Data | Filtered by userId |
|------|--------------------|
| Ledger entries | ✅ |
| Running balance | ✅ |
| AePS daily sessions | ✅ |
| AePS transactions | ✅ |
| Dashboard stats | ✅ |
| Reports | ✅ |
| Excel exports | ✅ |

**Admin oversight** (does not mix with admin's own data):
- `GET /api/admin/users-overview` — all users' balance summary
- `GET /api/admin/users-overview/:userId/ledger` — single user's ledger
- `GET /api/admin/aeps-overview` — all users' AePS balances

---

## PWA / Offline Features

### Service Worker Caching (Workbox)
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

### Offline Capabilities
- **Offline ledger entry**: New entries saved to IndexedDB `pending_ledger`; auto-synced on reconnect
- **Offline auth**: Cached user session in IndexedDB `user_session` (24-hour expiry) — users stay logged in offline
- **Offline dashboard**: Reads from IndexedDB `cache_store` when network unavailable
- **Network status**: Detects online / slow (2G / latency >2s) / offline; probes every 30 seconds
- **Sync status bar**: Global top-of-page bar showing 🟢 Online / 🟡 Syncing / 🔴 Offline + pending count
- **PWA install banner**: Appears when app is installable (Chrome/Edge desktop + Android)

### App & Offline Status Page (`/pwa-status`)
Shows live: network quality + latency, sync queue, IndexedDB storage usage, app install status, push notification subscription, device capability checklist, security summary.

### Push Notifications (VAPID)
- VAPID keys auto-generated on API startup if not set (`lib/vapid.ts`)
- Set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL` in env secrets for production (persists across restarts)
- Frontend: `use-push-notifications.ts` hook handles subscribe/unsubscribe
- API: `POST /api/push/subscribe`, `DELETE /api/push/unsubscribe`, `GET /api/push/vapid-public-key`

### App Shortcuts (Home Screen)
| Shortcut | URL |
|----------|-----|
| Dashboard | `/?source=shortcut` |
| New Ledger Entry | `/ledger?new=1&source=shortcut` |
| AePS Cash | `/aeps?source=shortcut` |
| Reports | `/reports?source=shortcut` |

---

## Android TWA Setup

1. Install Bubblewrap CLI: `npm install -g @bubblewrap/cli`
2. Generate Android project: `bubblewrap init --manifest https://<your-domain>/manifest.webmanifest`
3. Generate keystore: `keytool -genkey -v -keystore android.keystore -alias sahucsc -keyalg RSA -keysize 2048 -validity 10000`
4. Get SHA-256 fingerprint: `keytool -list -v -keystore android.keystore | grep SHA256`
5. Update `artifacts/sahu-csc/public/.well-known/assetlinks.json` with your `package_name` and fingerprint
6. Deploy to Replit (Publish) so assetlinks.json is live at `/.well-known/assetlinks.json`
7. Build APK: `bubblewrap build`
8. Upload to Google Play Console

Full config in `infrastructure/twa/twa-config.json`.

---

## Environment Variables (Secrets)

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Express session signing secret |
| `VAPID_PUBLIC_KEY` | Recommended | Web push notification public key |
| `VAPID_PRIVATE_KEY` | Recommended | Web push notification private key |
| `VAPID_EMAIL` | Optional | VAPID contact email (default: `mailto:admin@sahucsc.in`) |

> If `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` are not set, the API auto-generates temporary keys on startup (lost on restart — subscriptions won't work reliably).

---

## Architecture Decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → typed React Query hooks. Never edit `lib/api-client-react/src/generated/` directly.
- **Session-based auth**: express-session + bcrypt. No JWTs — simpler for single-center CSC use case.
- **Per-user data isolation**: `getUserFilter()` in ledger/reports/aeps always filters by `userId` — no admin exception for personal data. Admin oversight uses separate `/api/admin/*` endpoints.
- **Money as Drizzle `numeric`**: Returns as string from DB — always `parseFloat()` before returning from routes.
- **Running balance at insert time**: Computed from `SUM(credit) - SUM(debit)` of all prior entries for that user.
- **AePS sessions**: Unique per `(date, created_by)` — each user has their own daily session.
- **Offline-first IndexedDB**: v2 with 5 stores. `pending_ledger` auto-syncs on reconnect via `SyncEngine`. `user_session` enables offline auth for 24 hours.
- **VAPID auto-init**: `ensureVapidKeys()` called at Express startup; uses env secrets if present, otherwise generates ephemeral keys.
- **Seed script**: Compiled by esbuild alongside the main bundle (`src/scripts/seed.ts` → `dist/scripts/seed.mjs`). Safe to re-run — all inserts use `onConflictDoNothing()`.

---

## Product Features

| Feature | Description | Access |
|---------|-------------|--------|
| **Dashboard** | Today's stats, running balance, recent transactions, top services | All users |
| **Ledger** | Double-entry ledger with running balance, filters, pagination, offline entry, Excel export | All users |
| **AePS Cash** | Daily AePS session tracking with transactions, opening/closing balance | All users |
| **Services** | 22 pre-seeded CSC services across 5 categories; admin can add/edit | All / Admin |
| **Reports** | Daily & monthly bar charts, service breakdown pie chart, Excel export, cached offline | All users |
| **Notifications** | Auto-created on key events (login, failed login, backup, system); read/unread tracking | All users |
| **Profile** | Profile photo, bio, address, password change, push notification toggle | All users |
| **App & Offline** | Network status, sync queue, storage usage, install status, push notifications, device caps | All users |
| **Users Overview** | Admin view of all users' ledger balances and summaries | Admin only |
| **User Management** | Create/edit/deactivate users, change roles | Admin only |
| **Audit Logs** | Full audit trail of all actions with user, IP, timestamp | Admin only |
| **Settings** | Business info, language, theme, auto-backup config | Admin only |
| **Backups** | Manual pg_dump backups, restore from file | Admin only |
| **PWA Install** | Installable on desktop (Chrome/Edge) and Android | All users |

---

## Gotchas & Known Behaviour

- Always run `pnpm run typecheck:libs` before typechecking app packages — the DB/API libs must emit fresh declarations first.
- After adding new schema files, export them from `lib/db/src/schema/index.ts`.
- Numeric columns from Drizzle return as **strings** — always `parseFloat()` before returning from routes.
- The notifications endpoint returns an array directly (not paginated) — use `.length`, not `.total`.
- Sessions require `SESSION_SECRET` env var; falls back to a default in dev only.
- `customFetch` is exported from `@workspace/api-client-react` — import from the package root, not from `./custom-fetch` directly.
- After changing `vite.config.ts` PWA config, **restart the frontend workflow** — Vite does not hot-reload config changes.
- PWA service worker is active in dev mode (`devOptions: { enabled: true }`). If stale assets appear during development, clear site data in DevTools → Application → Clear storage.
- TWA `assetlinks.json` requires the SHA-256 fingerprint of your Android signing key. Must be served live at `/.well-known/assetlinks.json` on your production domain.
- `drizzle-kit push` can empty tables on destructive schema changes — always re-seed after schema changes.
- Seed script uses `onConflictDoNothing()` — safe to run multiple times. Ledger entries are only inserted if the table is empty.
- VAPID keys are auto-generated ephemerally if not set as env secrets — push subscriptions break on server restart without persistent keys.
- Port 8080 (API) and 21700 (Frontend) must be free before starting workflows. If a workflow fails with `EADDRINUSE`, kill the occupying process with `fuser -k <port>/tcp`.

---

## User Preferences

- Currency: ₹ (Indian Rupee) throughout
- Language support planned: English, Hindi, Odia
- Theme: Light (Navy + Saffron) and Dark mode
- Locale: `en-IN`
