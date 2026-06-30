# SAHU CSC — Change Log & Feature Documentation
**Current version: 3.1.0** — last updated 2026-06-30

> Full record of every feature, change, and upgrade applied to the SAHU CSC platform.
> Use this file as a reference for future development, onboarding, and audits.
>
> **v3.1.0 adds:** Backup page complete redesign (Minimal Clean layout) · SQL backup download endpoint · Auto-backup scheduler · Selective table import · SQL backup import  
> **v3.0.0 adds:** Setup Wizard Banner · `/api/setup-status` public endpoint · SMTP fully configured · VAPID auto-generation on startup · `scripts/post-merge.sh` auto-import setup · Full V3 documentation overhaul · Package bump to 3.0.0 · TWA config v3.0.0  
> See `CHANGELOG_V3.md` for the full V3 detailed changelog. See `changelogV2.md` for v2.x history.
>
> **v2.1.0 adds:** Udhari Khata (customer credit ledger) · Receipt system (CSC-YYYY-NNNN + QR + WhatsApp PDF sharing) · V2 multi-device sessions · RBAC `requirePermission` middleware · OTP password reset · Admin oversight pages · PWA Status page · Idle timeout (30 min) · Notification isolation fixes · UI Design System v2 (mobile header, gradient card language) · Canvas mockup exploration for Ledger / AePS / Add Entry / Udhari form redesigns

---

## v3.1.0 — Backup & Restore Redesign (June 30, 2026)

### Backup Page — Complete UI Redesign (Minimal Clean)

Complete redesign of `artifacts/sahu-csc/src/pages/backups.tsx` using the "Minimal Clean" design system:

| Change | Detail |
|--------|--------|
| **Layout** | 2-column grid on desktop — Backup History (left 2/3) + Schedule & Import stacked (right 1/3). Previously single-column. |
| **Color scheme** | Navy (`#0b2c60`) top-border accent on all cards. Saffron (`#f97316`) for Create Backup button, Import button, and upload icon. Navy bg for active day chips and frequency pills. |
| **Header** | White card panel with page title, subtitle (snapshot count + description), and saffron Create Backup button. |
| **Backup table** | Navy icon badges, size pills via `Badge` component, hover highlight, Download (turns navy on hover) + Restore (turns saffron on hover) action buttons. |
| **Schedule card** | Navy toggle (saffron when enabled), active status dot + next-run label, `[10px] uppercase tracking-wider` labels for all fields, navy Save Schedule button. |
| **Import card** | Dashed drop-zone with saffron upload icon; file-select → Analyze → table checkboxes (navy accent) → Import Now (saffron) flow inline within the card. |
| **Dialogs** | Restore confirm: centered warning icon in red circle, filename in monospace code block, Cancel + destructive Restore buttons. Selective import confirm: navy table tags, orange warning note. |
| **Empty state** | Centered navy icon circle + instructional copy. |

### New API Endpoints (also in v3.0.x patches)

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/backups/:id/download` | Streams `.sql` file with `Content-Disposition: attachment`. Logs `backup.download` audit event. |
| `POST` | `/api/backups/analyze` | Multer file upload → parse pg_dump COPY blocks → return table list + row counts. |
| `POST` | `/api/backups/selective-import` | Import only chosen tables: `DELETE` existing rows + replay `COPY` blocks with `session_replication_role = replica` (FK checks disabled). |
| `GET/POST` | `/api/backups/schedule` | Read / write auto-backup cron schedule to settings table. |

### Auto-Backup Scheduler

`artifacts/api-server/src/lib/backup-scheduler.ts` — `node-cron` based scheduler:
- Initialized in `index.ts` on server startup
- Reads schedule from `settings` table on each tick
- Supports `daily`, `weekly`, `custom` (multi-day) frequencies
- Applies retention: deletes oldest backup records + files beyond the keep count
- Logs `backup.auto` audit event on each run

---

## Table of Contents

1. [Project Foundation](#1-project-foundation)
2. [Authentication & User Management](#2-authentication--user-management)
3. [Ledger System](#3-ledger-system)
4. [AePS (Aadhaar Payment System)](#4-aeps-aadhaar-payment-system)
5. [Services Catalog](#5-services-catalog)
6. [Reports & Dashboard](#6-reports--dashboard)
7. [Notifications System](#7-notifications-system)
8. [Audit Logs](#8-audit-logs)
9. [Settings & Backups](#9-settings--backups)
10. [PWA — Basic Implementation](#10-pwa--basic-implementation)
11. [PWA — Advanced Upgrade (Offline-First)](#11-pwa--advanced-upgrade-offline-first)
12. [TWA — Android App Support](#12-twa--android-app-support)
13. [Push Notification Infrastructure](#13-push-notification-infrastructure)
14. [Database Schema Changes](#14-database-schema-changes)
15. [API Routes Added](#15-api-routes-added)
16. [File Structure Summary](#16-file-structure-summary)
17. [Environment Variables](#17-environment-variables)
18. [Known Gotchas & Conventions](#18-known-gotchas--conventions)
19. [Future Work Items](#19-future-work-items)
20. [Bug Fixes & Replit Migration (June 2026)](#20-bug-fixes--replit-migration-june-2026)
21. [Architecture Documentation Overhaul (June 2026)](#21-architecture-documentation-overhaul-june-2026)
22. [Login Redirect & Session Persistence Fixes (June 2026)](#22-login-redirect--session-persistence-fixes-june-2026)
23. [Users Page — Cash Overview Tab Consolidation (June 2026)](#23-users-page--cash-overview-tab-consolidation-june-2026)
24. [LoadingScreen Multi-Phase Timeout (June 2026)](#24-loadingscreen-multi-phase-timeout-june-2026)
25. [Seed Database Workflow (June 2026)](#25-seed-database-workflow-june-2026)
26. [V2 Authentication & Multi-Device Sessions (June 2026)](#26-v2-authentication--multi-device-sessions-june-2026)
27. [RBAC — requirePermission Middleware (June 2026)](#27-rbac--requirepermission-middleware-june-2026)
28. [Udhari Khata System (June 2026)](#28-udhari-khata-system-june-2026)
29. [Receipt System (June 2026)](#29-receipt-system-june-2026)
30. [Admin Oversight Pages (June 2026)](#30-admin-oversight-pages-june-2026)
31. [PWA Status Page & App & Offline Status (June 2026)](#31-pwa-status-page--app--offline-status-june-2026)
32. [WhatsApp Receipt Sharing (June 2026)](#32-whatsapp-receipt-sharing-june-2026)
33. [Notification System Isolation Fixes (June 2026)](#33-notification-system-isolation-fixes-june-2026)
34. [UI Design System v2 — Mobile Header & Design Language (June 2026)](#34-ui-design-system-v2--mobile-header--design-language-june-2026)
35. [Canvas UI Mockup Exploration — v2 Page Redesigns (June 2026)](#35-canvas-ui-mockup-exploration--v2-page-redesigns-june-2026)
36. [Schema Tables — Full v2 Reference (June 2026)](#36-schema-tables--full-v2-reference-june-2026)

---

## 1. Project Foundation

### Stack
| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Runtime | Node.js 24, TypeScript 5.9 |
| Frontend | React 19, Vite 7, Tailwind CSS v4, shadcn/ui |
| Backend | Express 5, express-session, helmet, rate-limit |
| Database | PostgreSQL, Drizzle ORM |
| Validation | Zod (v4), drizzle-zod |
| API contract | OpenAPI 3.1 YAML → Orval codegen → typed React Query hooks |
| Build | esbuild (API), Vite (frontend) |

### Monorepo Packages
```
workspace/
├── artifacts/api-server/        Express 5 backend (PORT 8080, /api)
├── artifacts/sahu-csc/          React + Vite frontend (/)
├── artifacts/mockup-sandbox/    Canvas component preview server
├── lib/db/                      @workspace/db — Drizzle ORM + all schema tables
├── lib/api-spec/                @workspace/api-spec — openapi.yaml (source of truth)
└── lib/api-client-react/        @workspace/api-client-react — Orval-generated hooks
```

### Theme
- **Primary (Navy)**: `#0b2c60` — HSL 217 79% 21%
- **Accent (Saffron)**: `#f97415` — HSL 25 95% 53%
- Light and Dark mode both supported

### Default Login Credentials
| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | admin |
| `operator` | `operator123` | operator |

---

## 2. Authentication & User Management

### Session-Based Auth
- Login accepts **username OR email OR mobile** as identifier
- bcrypt with 12 salt rounds
- `express-session` with server-side storage (24-hour TTL)
- Session cookie: `httpOnly`, `secure` in production, `sameSite: strict` in production

### Password Reset Flow
- `POST /api/auth/forgot-password` — generates a token, creates a notification with a link
- `POST /api/auth/reset-password` — validates token, sets new password

### Middleware
- `requireAuth` — checks `req.session.userId`; returns 401 if missing
- `requireRole(...roles)` — re-fetches user from DB, checks role; returns 403 if insufficient

### User Roles
| Role | Access |
|---|---|
| `admin` | All pages, all users' data, admin-only routes |
| `operator` | All non-admin pages, own data only |
| `user` | Same as operator |

### Rate Limiting
- Global: 500 requests / 15 min
- Login endpoint: 20 requests / 15 min (brute-force protection)

### User Management (Admin only)
- Create, update, delete users
- Toggle `isActive` to lock accounts without deleting
- Admin cannot delete their own account

---

## 3. Ledger System

### Core Features
- Per-user transaction ledger (credit / debit entries)
- **Running balance** computed at insert time from sum of all previous entries for that user
- Paginated list (15 per page) with filters: date range, customer name, service type
- Excel export (`/api/reports/export`) — downloads `.xlsx` with two sheets

### Data Model (`ledger` table)
| Column | Type | Notes |
|---|---|---|
| `date` | text | ISO `YYYY-MM-DD` |
| `customer_name` | text | |
| `service_type` | text | Must match a service name |
| `credit` | numeric(12,2) | Income |
| `debit` | numeric(12,2) | Expense |
| `balance` | numeric(12,2) | Snapshot of running balance at insert |
| `created_by` | integer | FK → users.id |

### API Endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/api/ledger` | Paginated list (user-scoped) |
| POST | `/api/ledger` | Create entry — auto-computes balance |
| PATCH | `/api/ledger/:id` | Update (IDOR check for non-admins) |
| DELETE | `/api/ledger/:id` | Delete (IDOR check for non-admins) |
| DELETE | `/api/ledger/all` | Admin: wipe all entries |
| GET | `/api/ledger/balance` | `{ balance, totalCredits, totalDebits }` |
| GET | `/api/ledger/summary` | Totals for period: today/yesterday/week/month |

### Offline Ledger (added in PWA upgrade)
- New entries created while offline are stored in **IndexedDB** (`pending_ledger` store)
- Shown as an amber "Pending" card in the ledger list with the full entry details
- Automatically synced to the server when connectivity returns
- Up to **3 retry attempts** per entry before marking as a sync error

---

## 4. AePS (Aadhaar Payment System)

### Purpose
Track daily cash float for AePS (Aadhaar Enabled Payment System) operations — the physical cash managed at the CSC counter.

### Model
- `aeps_daily` — one session per calendar day (`opening_balance`, `notes`)
- `aeps_transactions` — individual withdrawals / deposits against a daily session

### Running Balance
Each transaction includes a per-transaction running balance computed in the API response (`GET /api/aeps/session`).

### API Endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/api/aeps/session?date=` | Session + transactions + running balances |
| POST | `/api/aeps/session` | Create or update day session |
| POST | `/api/aeps/transaction` | Add withdrawal or deposit |
| PATCH | `/api/aeps/transaction/:id` | Edit transaction |
| DELETE | `/api/aeps/transaction/:id` | Delete transaction |

---

## 5. Services Catalog

### Features
- 22 pre-seeded CSC services across 5 categories
- Admin can create, update, delete, and toggle services active/inactive
- Service names appear in ledger dropdowns

### Categories
1. Government ID (Aadhaar, PAN, Voter ID, Passport, Driving Licence)
2. Certificates (Birth, Death, Income, Caste, Residence)
3. Insurance (Pradhan Mantri Jeevan Jyoti, Suraksha, Fasal Bima)
4. Utility Bills (Electricity, Water, Gas LPG, Mobile Recharge)
5. Schemes (PM Kisan, NREGA, Scholarships, Banking Correspondent)

---

## 6. Reports & Dashboard

### Dashboard
- Current running balance, today's credits/debits/transactions, monthly net profit
- 5 most recent ledger entries
- Top 5 services by revenue (this month)
- Weekly overview bar chart (income vs expense)
- **Offline**: data cached in IndexedDB for 30 minutes; served from cache when offline

### Reports
| Type | Endpoint | Contents |
|---|---|---|
| Daily | `/api/reports/daily?date=` | Day summary, top services, AePS stats |
| Monthly | `/api/reports/monthly?year=&month=` | Monthly totals, daily breakdown, top services |
| AePS | `/api/reports/aeps?startDate=&endDate=` | AePS-only stats |
| Service Breakdown | `/api/reports/service-breakdown?startDate=&endDate=` | Per-service count + revenue |
| Excel Export | `/api/reports/export?startDate=&endDate=` | `.xlsx` with Ledger + AePS sheets |

### Caching Strategy (Workbox — added in PWA upgrade)
- Dashboard: **StaleWhileRevalidate** (5-min cache)
- Reports: **StaleWhileRevalidate** (10-min cache)
- Ledger: **NetworkFirst** (8-second timeout, 5-min cache)

---

## 7. Notifications System

### Auto-Generated Notifications
The following events automatically create notifications:

| Event | Visibility |
|---|---|
| Successful login | Own user |
| Failed login attempt (wrong password) | Own user |
| Backup created | System-wide |
| Backup restored | System-wide |

### API Endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/api/notifications?unreadOnly=` | Own + system-wide (max 50, newest first) |
| PATCH | `/api/notifications/:id/read` | Mark one as read |
| POST | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete one |

---

## 8. Audit Logs

### Logged Actions
Every mutating action writes an audit row with: `userId`, `action`, `details`, `ipAddress`, `createdAt`.

**Full list of audit codes:**
```
login, logout
ledger.create, ledger.update, ledger.delete, ledger.clear
aeps.session, aeps.transaction, aeps.edit, aeps.delete
profile.update, profile.password_change, profile.avatar_update, profile.avatar_delete
preferences.update
user.create, user.update, user.delete
settings.update
backup.create, backup.restore
```

### API
- `GET /api/audit-logs` — admin only, paginated, filterable by userId, action, date range

---

## 9. Settings & Backups

### Global Settings (Admin only)
Stored as key-value pairs in the `settings` table.

| Key | Default |
|---|---|
| `businessName` | SAHU Common Service Center |
| `businessAddress` | (empty) |
| `businessMobile` | (empty) |
| `businessEmail` | (empty) |
| `language` | en |
| `theme` | light |
| `currency` | INR |
| `autoBackup` | false |
| `backupFrequencyDays` | 7 |

### Backups
- `POST /api/backups` — creates a backup record + auto-creates a system notification
- `POST /api/backups/:id/restore` — marks as restored + notification
- Actual backup file creation is simulated in dev; wire to `pg_dump` in production

---

## 10. PWA — Basic Implementation

### Initial Setup
- `vite-plugin-pwa` with Workbox service worker auto-generated (`generateSW` strategy)
- `registerSW` in `main.tsx` with hourly update checks
- Dev mode enabled (`devOptions.enabled: true`)

### Manifest Fields (initial)
```json
{
  "name": "SAHU CSC — Common Service Center",
  "short_name": "SAHU CSC",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#0b2c60",
  "background_color": "#ffffff"
}
```

### Icons Added
| File | Size | Purpose |
|---|---|---|
| `pwa-96x96.png` | 96×96 | Small devices |
| `pwa-144x144.png` | 144×144 | Splash screen |
| `pwa-192x192.png` | 192×192 | Standard PWA icon |
| `pwa-512x512.png` | 512×512 | Large icon + maskable |
| `apple-touch-icon.png` | 180×180 | iOS home screen |

### Hooks & Components
- `use-pwa.ts` — `isInstallable`, `isInstalled`, `isOffline`, `promptInstall()`
- `pwa-install-banner.tsx` — install prompt UI + offline indicator banner
- `PWAStatusIcon` — small `WifiOff` icon for the header when offline

---

## 11. PWA — Advanced Upgrade (Offline-First)

### New Files Created

#### `src/lib/offline-db.ts`
Raw IndexedDB wrapper (no external library). Two object stores:
- **`pending_ledger`** — queued ledger entries created while offline
- **`cache_store`** — generic key-value cache with TTL expiry

Key functions:
```ts
addPendingEntry(entry)          // queue a new entry
getAllPendingEntries()           // read the full queue
removePendingEntry(id)          // remove after successful sync
updatePendingEntryRetry(id, n)  // increment retry count
getPendingCount()               // how many are queued
setCacheItem(key, value, ttl)   // write to cache store
getCacheItem(key)               // read (returns null if expired)
clearExpiredCache()             // housekeeping on startup
```

#### `src/lib/sync-engine.ts`
Singleton class `syncEngine` that manages the offline queue:
- Auto-triggers `sync()` on `window.online` event
- Runs on startup if already online
- POSTs each pending entry to `/api/ledger`, removes on success
- Max **3 retries** per entry; after that marks as `partial` error
- Dispatches custom `sahu-sync-complete` event when entries are synced
- Exposes `subscribe(listener)` for reactive UI updates

Sync status states: `idle` | `syncing` | `partial` | `error`

#### `src/hooks/use-network-status.ts`
```ts
useNetworkStatus() → { isOnline, isOffline, isSlow, quality }
```
- Listens to `window.online` / `window.offline`
- Also listens to `navigator.connection` change events
- Detects slow-2g / 2g as `isSlow: true`

#### `src/hooks/use-sync.ts`
```ts
useSync() → { syncStatus, pendingCount, lastSyncTime, syncNow }
```
- Subscribes to `syncEngine` state
- `syncNow()` manually triggers a sync

#### `src/components/sync-status-bar.tsx`
Global banner shown at top of every page below the header.

| State | Display |
|---|---|
| Offline | 🔴 Red bar — "Offline Mode — N pending" |
| Slow connection | 🟡 Amber bar — "Slow connection detected" |
| Syncing | 🔵 Blue bar — spinning "Synchronising N entries…" |
| Partial failure | 🟠 Orange bar — "N entries failed to sync" + Retry button |
| Pending (online) | 🟡 Amber bar — "N entries queued to sync" + last sync time |
| All good | _(hidden — no bar shown)_ |

Also exports `<SyncDot>` — a compact icon for the desktop header.

### Modified Files

#### `src/hooks/use-pwa.ts`
- Now delegates network detection to `useNetworkStatus`
- Exports `isSlow` in addition to `isOffline`

#### `src/components/pwa-install-banner.tsx`
- Simplified — only shows install prompt (offline/sync state moved to `SyncStatusBar`)
- Better icon + description copy

#### `src/components/layout.tsx`
- `<SyncStatusBar />` added above `<PWAInstallBanner />`
- `<SyncDot />` added to desktop header (right side, near notifications)

#### `src/main.tsx`
- Initialises `syncEngine` on startup
- Triggers `syncEngine.sync()` if already online at load time
- Logs `sahu-sync-complete` events to console

#### `src/pages/ledger.tsx`
- Imports `useNetworkStatus`, `addPendingEntry`, `getAllPendingEntries`, `syncEngine`
- `onSubmit` handler is **offline-aware**:
  - If **online** → POST to server as normal
  - If **offline** → save to `pending_ledger` IDB store, toast "Saved offline"
- Pending entries panel shown above the transaction list (amber card with each entry)
- Panel auto-refreshes on `online` and `sahu-sync-complete` events

#### `src/pages/dashboard.tsx`
- On successful API load → saves data to `cache_store` IDB (30-min TTL)
- If offline → reads from `cache_store` IDB and renders cached data
- Shows a red offline indicator banner when rendering cached data

### Enhanced Workbox Caching Strategy
| Route | Strategy | Cache Name | TTL |
|---|---|---|---|
| `/api/auth/*` | NetworkOnly | — | — |
| `/api/dashboard` | StaleWhileRevalidate | api-dashboard | 5 min |
| `/api/reports/*` | StaleWhileRevalidate | api-reports | 10 min |
| `/api/settings` | StaleWhileRevalidate | api-settings | 30 min |
| `/api/profile` | StaleWhileRevalidate | api-profile | 5 min |
| `/api/preferences` | StaleWhileRevalidate | api-preferences | 30 min |
| `/api/ledger/*` | NetworkFirst | api-ledger | 5 min, 8s timeout |
| `/api/services` | NetworkFirst | api-services | 1 hr, 8s timeout |
| `/api/notifications` | NetworkFirst | api-notifications | 2 min, 8s timeout |
| Images / icons | CacheFirst | image-cache | 30 days |
| Fonts | CacheFirst | font-cache | 1 year |

---

## 12. TWA — Android App Support

### Digital Asset Links
File: `artifacts/sahu-csc/public/.well-known/assetlinks.json`

Tells Android that the website and native app are the same — required for TWA to launch the app fullscreen without a browser chrome.

**To complete TWA setup:**
1. Deploy the app on Replit (`Publish` button) to get a live HTTPS URL
2. Go to **[pwabuilder.com](https://www.pwabuilder.com)** → enter your deployed URL
3. Click **Package for Stores → Android** → download
4. Copy your **SHA-256 fingerprint** from PWABuilder
5. Update `assetlinks.json` with your `package_name` and fingerprint
6. Re-deploy
7. Upload the `.aab` to Google Play Console

### Enhanced Manifest Fields for TWA
```json
{
  "id": "sahu-csc-app",
  "display_override": ["window-controls-overlay", "standalone", "minimal-ui", "browser"],
  "launch_handler": { "client_mode": ["navigate-existing", "auto"] },
  "shortcuts": [
    { "name": "Dashboard", "url": "/?source=shortcut" },
    { "name": "New Ledger Entry", "url": "/ledger?new=1&source=shortcut" },
    { "name": "AePS", "url": "/aeps?source=shortcut" },
    { "name": "Reports", "url": "/reports?source=shortcut" }
  ]
}
```

### App Shortcuts
Long-pressing the app icon on Android / right-clicking on desktop shows 4 shortcuts:
1. **Dashboard** — today's stats
2. **New Ledger Entry** — ledger with new entry form
3. **AePS** — AePS cash management
4. **Reports** — daily/monthly reports

---

## 13. Push Notification Infrastructure

### What Was Built (Infrastructure Only — not fully wired yet)
Push notifications require VAPID keys set as environment variables before they activate.

#### New Files
- `artifacts/api-server/src/lib/push.ts` — VAPID setup, `sendPushToUser()`, `sendPushToAll()`
- `artifacts/api-server/src/routes/push.ts` — subscription management routes
- `artifacts/sahu-csc/src/hooks/use-push-notifications.ts` — subscription hook

#### New DB Table: `push_subscriptions`
| Column | Type |
|---|---|
| `id` | serial PK |
| `user_id` | integer FK → users |
| `endpoint` | text UNIQUE |
| `p256dh` | text |
| `auth` | text |
| `created_at` | timestamptz |

#### Push API Routes
| Method | Path | Description |
|---|---|---|
| GET | `/api/push/vapid-public-key` | Returns VAPID public key for browser subscription |
| POST | `/api/push/subscribe` | Save a push subscription for current user |
| DELETE | `/api/push/unsubscribe` | Remove a push subscription |

#### Environment Variables Required
```env
VAPID_PUBLIC_KEY=   # Generate with: npx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:admin@sahucsc.in
```

#### To Generate VAPID Keys
```bash
npx web-push generate-vapid-keys
```
Then save both keys as environment variables in Replit Secrets.

#### Push is Disabled by Default
If `VAPID_PUBLIC_KEY` or `VAPID_PRIVATE_KEY` is not set, `pushEnabled` is `false` and all push calls are silently skipped — the app runs normally without push.

---

## 14. Database Schema Changes

### Tables Added (Beyond Initial Schema)
| Table | Purpose |
|---|---|
| `push_subscriptions` | Web Push API subscription records per user |

### All Tables (Current)
```
users               — user accounts
ledger              — income/expense transactions
services            — service catalog
aeps_daily          — AePS daily float sessions
aeps_transactions   — individual AePS transactions
notifications       — user + system notifications
audit_logs          — immutable action trail
settings            — global key-value config
user_preferences    — per-user UI preferences
backups             — backup metadata records
push_subscriptions  — Web Push subscriptions (new)
```

### Running Schema Push
```bash
pnpm --filter @workspace/db run push
```
> ⚠️ This can empty tables in dev. Always run the seed script after:
> `NODE_ENV=development npx tsx artifacts/api-server/src/scripts/seed.ts`

---

## 15. API Routes Added

### Password Reset (new)
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/forgot-password` | Generate reset token, notify user |
| POST | `/api/auth/reset-password` | Validate token, set new password |

### Push Notifications (new)
| Method | Path | Description |
|---|---|---|
| GET | `/api/push/vapid-public-key` | Returns public key |
| POST | `/api/push/subscribe` | Save subscription |
| DELETE | `/api/push/unsubscribe` | Remove subscription |

### Admin Overview (new)
| Method | Path | Description |
|---|---|---|
| GET | `/api/users/overview` | Stats for all users (admin dashboard) |

---

## 16. File Structure Summary

### New Files Added (all sessions)
```
artifacts/api-server/src/
├── lib/
│   └── push.ts                          Web Push helper (VAPID + send functions)
├── routes/
│   ├── push.ts                          Push subscription CRUD routes
│   ├── password-reset.ts                Forgot/reset password routes
│   └── admin.ts                         Admin overview route

artifacts/sahu-csc/src/
├── lib/
│   ├── offline-db.ts                    IndexedDB wrapper (2 stores)
│   ├── sync-engine.ts                   Offline sync queue engine
│   └── pwa-badge.ts                     App badge API helper
├── hooks/
│   ├── use-network-status.ts            Online/offline/slow detection
│   ├── use-sync.ts                      Sync state hook
│   ├── use-push-notifications.ts        Push subscription management hook
│   ├── use-file-handler.ts              File handler API hook
│   └── use-wake-lock.ts                 Screen Wake Lock API hook
└── components/
    └── sync-status-bar.tsx              Global sync status bar + SyncDot

lib/db/src/schema/
└── push_subscriptions.ts               Push subscription DB table

public/
└── .well-known/
    └── assetlinks.json                  Digital Asset Links for Android TWA
```

### Modified Files (all sessions)
```
artifacts/sahu-csc/
├── vite.config.ts                       Enhanced manifest, Workbox strategies
├── src/main.tsx                         SW registration + sync engine init
├── src/hooks/use-pwa.ts                 Uses use-network-status
├── src/components/pwa-install-banner.tsx  Simplified (offline moved to SyncStatusBar)
├── src/components/layout.tsx            Added SyncStatusBar + SyncDot
├── src/pages/dashboard.tsx             Offline caching + offline indicator
└── src/pages/ledger.tsx                Offline entry creation + pending panel

lib/db/src/schema/index.ts              Exports push_subscriptions table
replit.md                               Updated with all new architecture details
ARCHITECTURE.md                         Added Section 6 (PWA & TWA)
```

---

## 17. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ Yes | express-session secret (falls back to hardcoded default in dev only) |
| `PORT` | ✅ Yes (API) | API server port (use 8080) |
| `BASE_PATH` | ✅ Yes (Frontend) | Vite base path (use `/`) |
| `NODE_ENV` | Optional | `development` or `production` |
| `VAPID_PUBLIC_KEY` | Optional | VAPID public key for Web Push (push disabled if missing) |
| `VAPID_PRIVATE_KEY` | Optional | VAPID private key for Web Push |
| `VAPID_EMAIL` | Optional | Contact email for VAPID (default: `mailto:admin@sahucsc.in`) |

---

## 18. Known Gotchas & Conventions

### TypeScript
- Always run `pnpm run typecheck:libs` before running `pnpm run typecheck` — the DB package must emit fresh type declarations first
- After adding new schema files, add an export to `lib/db/src/schema/index.ts`

### Database
- Drizzle `numeric` columns return as **strings** from the DB — always `parseFloat()` before returning from routes
- Running balance is computed by summing all previous entries at insert time — do not cache it separately
- `drizzle-kit push` can empty tables in dev — always re-seed after schema changes

### API
- The notifications endpoint returns a plain **array** (not paginated) — the layout uses `.length` not `.total`
- Auth routes (`/api/auth/*`) must use `NetworkOnly` in Workbox — `StaleWhileRevalidate` will cache stale session state
- IDOR protection: non-admin users cannot read/modify another user's ledger entries (checked in each route)

### PWA / Service Worker
- In dev mode the SW is active (`devOptions.enabled: true`) — if you see stale UI, open DevTools → Application → Clear Storage
- After changing `vite.config.ts` manifest or Workbox config, restart the frontend workflow — Vite does not hot-reload config files
- The `generateSW` strategy is used (not `injectManifest`) — no custom `src/sw.ts` file is needed; Workbox is configured entirely in `vite.config.ts`
- `skipWaiting: true` + `clientsClaim: true` ensures new SW takes over immediately on update

### Offline / Sync
- Pending ledger entries are keyed by a local UUID (`local-${Date.now()}-${random}`) — never clash with server IDs
- The sync engine retries up to 3 times per entry; after that it shows a "Retry" button in the sync bar
- `sahu-sync-complete` CustomEvent is dispatched after a successful sync — the ledger page listens to this to refresh the list
- `clearExpiredCache()` is called once on startup to keep IndexedDB tidy

### Deployment
- Deploying to Replit gives you a stable HTTPS domain required for TWA and push notifications
- `assetlinks.json` SHA-256 fingerprint must be updated after generating the APK via PWABuilder

---

## 23. Users Page — Cash Overview Tab Consolidation (June 2026)

The separate `users-overview.tsx` page (admin cash overview of all users) was merged into `users.tsx` as a fourth tab, reducing navigation clutter and keeping all user-related admin tools in one place.

### Changes
- **`artifacts/sahu-csc/src/pages/users.tsx`** — added "Cash Overview" tab (4th tab) that renders inline what was previously the full `/users-overview` page
- **`artifacts/sahu-csc/src/pages/users-overview.tsx`** — deleted
- **`artifacts/sahu-csc/src/App.tsx`** — old `/users-overview` route now redirects to `/users`
- **`artifacts/sahu-csc/src/components/layout.tsx`** — removed standalone "Users Overview" nav entry; cash overview is now accessed via the Users page tab
- Updated prefetch logic to point to the consolidated page

---

## 24. LoadingScreen Multi-Phase Timeout (June 2026)

The auth loading screen previously spun indefinitely if the API was slow or unreachable. A three-phase timeout was added so users always get feedback and a recovery path.

### How it works

`use-auth.tsx` — `AuthProvider` now tracks a `loadingPhase` state (`"loading" | "slow" | "timeout"`) exported via context:

| Timer | Phase change | Effect |
|-------|-------------|--------|
| 4 seconds | `"loading"` → `"slow"` | Message changes to "Server is starting up…" |
| 12 seconds | `"slow"` → `"timeout"` | Spinner stops; "Retry" button appears; `offlineChecked` forced `true` to unblock `isLoading` |

`App.tsx` — `LoadingScreen` accepts a `phase` prop and renders phase-appropriate UI:
- **loading**: normal spinner + "Loading..."
- **slow**: spinning ring + "Server is starting up… This may take a few seconds"
- **timeout**: static ring + "Server is taking too long to respond" + saffron **Retry** button (`window.location.reload()`)

At timeout, forcing `offlineChecked = true` unblocks `isLoading`, allowing the app to redirect to `/login` even without a server response.

---

## 25. Seed Database Workflow (June 2026)

Added a `Seed Database` workflow to the Replit workflow panel (visible under the Run button dropdown).

**Command:** `pnpm --filter @workspace/api-server run seed`  
**Output type:** console (one-shot, exits after completion)

The seed script compiles `src/scripts/seed.ts` via esbuild to `dist/scripts/seed.mjs` and runs it. Using `npx tsx` directly would fail because the script imports `@workspace/db` — a workspace package that requires pnpm's workspace resolution and the esbuild compile step.

---

## 20. Bug Fixes & Replit Migration (June 2026)

> Applied during migration to Replit hosting environment. All items below were diagnosed and resolved.

---

### Bug Fix: 502 Bad Gateway on Mobile / Preview

**Symptom:** Accessing the `.replit.dev` URL on a mobile phone showed "This page isn't working — HTTP ERROR 502".

**Root cause:** The 502 occurred during the ~15–20 second window when the server was restarting (workflow restart clears ports with `fuser -k`). Replit's proxy returns 502 while port 5000 is not yet bound.

**Fix applied:**
- Workflow start command now clears both ports (`fuser -k 5000/tcp; fuser -k 8080/tcp`) before starting processes, reducing stale-process interference.
- `waitForPort = 5000` in `.replit` ensures Replit marks the workflow "ready" only after Vite binds port 5000.
- **User guidance**: Wait ~20 seconds after pressing Run before accessing the URL on a phone. Never use `localhost` on mobile — always use the `.replit.dev` public URL from the Replit preview pane.

---

### Bug Fix: Duplicate Workflow Port Conflicts

**Symptom:** App worked in preview pane but returned 502 intermittently. Multiple workflows were running simultaneously (`artifacts/api-server: API Server` + `artifacts/sahu-csc: web` + `Start application`), all trying to bind the same ports.

**Root cause:** Replit automatically created separate artifact workflows (`artifacts/api-server: API Server` on port 8080, `artifacts/sahu-csc: web` on port 21700/5000) that conflicted with the combined `Start application` workflow.

**Fix applied:**
- Consolidated to a single `Start application` workflow that runs both API and frontend in one shell command.
- Port mapping confirmed: `localPort = 5000 → externalPort = 80` (Replit proxy).
- Frontend port corrected from 21700 to **5000** in the combined workflow.
- Extra conflicting workflows identified and removed from `.replit`.

---

### Feature: Server Health Page (`/server-health`)

**Added:** Full-stack diagnostic page accessible at `/server-health` (admin only, in sidebar under admin section).

**Backend — `GET /api/healthz` (enhanced):**

| Field | Details |
|-------|---------|
| `status` | `"ok"` / `"degraded"` / `"error"` — overall system health |
| `server.uptime` | Process uptime in seconds |
| `server.nodeVersion` | Node.js version string |
| `server.memory` | RSS, heap used/total, external bytes |
| `server.system` | Total/free system RAM, CPU count, load averages (1m/5m/15m) |
| `database.status` | `"ok"` / `"error"` — result of `SELECT version()` probe |
| `database.latencyMs` | Milliseconds for the DB probe round-trip |
| `database.version` | PostgreSQL version string (e.g. `"PostgreSQL 16.10"`) |
| `vapid.status` | `"ok"` (persistent) / `"ephemeral"` (auto-generated) / `"disabled"` (missing) |
| `vapid.persistent` | `true` when keys came from Replit Secrets (not auto-generated) |

**Frontend — `artifacts/sahu-csc/src/pages/server-health.tsx`:**
- 4 cards: Overall status banner, API Server (memory + CPU), Database, VAPID/Push
- Colour-coded badges: 🟢 Healthy / 🟡 Degraded or Ephemeral / 🔴 Error / ⚫ Disabled
- Auto-refreshes every 30 seconds; manual Refresh button
- Quick Fixes section with copy-paste shell commands for common issues
- Added to sidebar under Admin section with `HeartPulse` icon

**Route added:** `<Route path="/server-health">{() => <ProtectedRoute component={ServerHealth} />}</Route>`

---

### Bug Fix: VAPID Persistence Detection

**Symptom:** The `/server-health` page always showed VAPID as "Ephemeral" even when keys were set in Replit Secrets.

**Root cause:** `ensureVapidKeys()` did not distinguish between keys loaded from env secrets vs. auto-generated at startup. Both paths set the same `process.env.VAPID_PUBLIC_KEY` variable, so there was no way to tell them apart at health-check time.

**Fix applied (`artifacts/api-server/src/lib/vapid.ts`):**
```ts
if (existingPublic && existingPrivate) {
  process.env.VAPID_KEYS_FROM_ENV = "true";  // ← added
  logger.info("VAPID keys already configured");
  return;
}
```
The health endpoint reads `process.env.VAPID_KEYS_FROM_ENV` to determine `persistent: true/false` and sets `vapid.status = "ok"` vs `"ephemeral"` accordingly.

---

### Bug Fix: Login Redirect Loop — Session Not Persisting

**Symptom:** Login returned HTTP 200 with the user object, but the frontend immediately stayed on (or redirected back to) the login page. Every call to `GET /api/auth/me` after login returned 401 "Not authenticated". The `session` DB table had 0 rows even after successful login.

**Root cause:** `connect-pg-simple` was configured with `conString: process.env.DATABASE_URL` in `app.ts`. This mode creates a **separate, internal `pg.Pool`** that silently failed to connect in the Replit environment. Sessions were never written to the database, so the session cookie held no server-side data.

**Fix applied (`artifacts/api-server/src/app.ts`):**
```ts
// Before (broken — silent pool failure in Replit):
store: new PgSession({ conString: process.env.DATABASE_URL, tableName: "session" })

// After (correct — shared working pool):
import { pool } from "@workspace/db";
store: new PgSession({
  pool,                        // reuse the shared, already-working pool
  tableName: "session",
  createTableIfMissing: true,  // auto-creates session table on first startup
  pruneSessionInterval: 3600,
})
```

**Session table:** Also created manually on first deploy via SQL:
```sql
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX "IDX_session_expire" ON "session" ("expire");
```
With `createTableIfMissing: true`, this is handled automatically on all subsequent restarts.

---

### Bug Fix: Port 8082 vs 8080

**Symptom:** API server started successfully on port 8080 but was immediately killed — Replit's artifact workflow `artifacts/api-server: API Server` also binds port 8080.

**Fix:** The `Start application` workflow passes `PORT=8082` to the API server. The Vite proxy in `vite.config.ts` was updated to forward `/api` → `localhost:8082`. Documented in `replit.md` Gotchas.

---

### Documentation Updates (this session)

- `replit.md` — Workflows table updated to reflect single `Start application` workflow; frontend port corrected (21700 → 5000); Server Health page added to Product Features table; new Gotchas entries for 502 on mobile, VAPID persistence flag, `/api/healthz` diagnostics, API port 8082.
- `CHANGELOG.md` — This section added (section 20).

---

## 21. Architecture Documentation Overhaul (June 2026)

### Summary

`ARCHITECTURE.md` was significantly out of date relative to the actual codebase. A full rewrite brought it in sync with all features implemented through June 2026.

### Changes covered in the overhaul

**New tables documented:**
- `session` (express-session store, managed by connect-pg-simple)
- `user_sessions` (V2 multi-device session tracking)
- `password_reset_tokens` (OTP-based password reset)
- Full column listings for all 12 tables (previously only key columns shown)

**New API routes documented (previously missing):**
- `POST /auth/register` — self-registration endpoint
- `POST /auth/forgot-password` + `POST /auth/reset-password` — OTP password reset
- `GET/DELETE /sessions/:id` — multi-device session management
- `GET /admin/users-overview`, `GET /admin/users-overview/:userId/ledger`, `GET /admin/aeps-overview`
- `GET /push/vapid-public-key`, `POST /push/subscribe`, `DELETE /push/unsubscribe`
- `GET /api/healthz` — full diagnostics (server, DB, VAPID)
- `GET /reports/aeps`, `GET /reports/service-breakdown`

**V2 Auth flow documented:**
- Account locking (5 attempts → 15-minute lock, auto-unlock)
- `requirePermission()` middleware + full permissions map per role
- `parseDevice()` — called once per request before all branches
- V2 `requireAuth` flow (validates `user_sessions` table, falls back to V1 `activeSessionToken`)
- Idle timeout (30 min) + 2-min warning dialog (via `useIdleTimer` in Layout)

**Frontend pages added:**
- `register.tsx`, `forgot-password.tsx`, `reset-password.tsx`
- `sessions.tsx` (multi-device session management)
- `pwa-status.tsx` (App & Offline Status)
- `server-health.tsx` (API diagnostics, admin only)
- `users-overview.tsx` (admin balance overview)
- `offline.tsx`, `not-found.tsx`

**Section 14 (Replit Environment) added:**
- Port map table
- Session store critical fix explanation + SQL
- IndexedDB store reference table
- Common troubleshooting table

**Caching strategies updated** to reflect per-resource granular Workbox config (replaced single `api-cache` entry).

**RBAC section updated** to reflect `requirePermission` pattern instead of simple `requireRole`.

**Seed data corrected** — 22 services across 5 categories (previously listed as 10 across 4 categories).

---

## 22. Login Redirect & Session Persistence Fixes (June 2026)

> Applied during debugging of the login-stays-on-login-page issue in the Replit environment.

---

### Bug Fix: `connect-pg-simple` Bundled by esbuild → `table.sql ENOENT`

**Symptom:** API started without errors, login returned HTTP 200, but `GET /api/auth/me` always returned 401 "Not authenticated". The `session` table in PostgreSQL had 0 rows even after successful login.

**Root cause:** `connect-pg-simple` internally reads a bundled SQL file (`table.sql`) from `node_modules` using `path.join(__dirname, 'table.sql')`. When esbuild bundled the package into `dist/index.mjs`, the relative path to `table.sql` was broken — the file did not exist alongside the bundle. `connect-pg-simple` silently swallowed the error and never created or wrote to the session table.

**Fix applied (`artifacts/api-server/build.mjs`):**
```js
// Added to the external array:
external: [
  // ...existing externals...
  "connect-pg-simple",   // ← reads table.sql from node_modules at runtime; must not be bundled
],
```

With `connect-pg-simple` marked external, Node resolves it from `node_modules` at runtime and `table.sql` is found correctly.

---

### Bug Fix: Login Redirect Race Condition — Replaced Refetch with `setQueryData`

**Symptom:** Login toast appeared, cookie was set, but the frontend stayed on the login page and did not redirect to `/`. No redirect happened even though the server returned HTTP 200 with the user object.

**Root cause:** The original `handleLogin` in `use-auth.tsx` called `queryClient.invalidateQueries(["auth/me"])` then `refetch()`. In the Replit proxy environment the subsequent `GET /api/auth/me` call was sometimes completing before the session cookie propagated through the proxy layer, returning a brief 401 "Not authenticated" response. This reset `user` to null, which cancelled the redirect.

**Fix applied (`artifacts/sahu-csc/src/hooks/use-auth.tsx`):**
```ts
// Before (broken — race condition with refetch in Replit proxy):
await queryClient.invalidateQueries({ queryKey: ["auth/me"] });
await refetch();

// After (correct — set cache directly from login response body):
queryClient.setQueryData(["auth/me"], userData);   // userData = parsed login response body
```

The login endpoint already returns the full user object — this is set directly into the React Query cache, so no additional network round-trip is needed. The `user` state updates immediately and triggers the redirect.

**Logout** was updated to mirror this pattern:
```ts
queryClient.setQueryData(["auth/me"], null);
queryClient.clear();
```

---

### Fix: Login Page `useEffect` Redirect Guard

**Added to `artifacts/sahu-csc/src/pages/login.tsx`:**
```tsx
useEffect(() => {
  if (user) setLocation("/");
}, [user, setLocation]);
```

This `useEffect` serves as a safety net — if `user` is already set (e.g., browser back-navigation after login), the page immediately redirects to the dashboard without showing the login form.

---

### Summary Table

| Fix | File | What Changed |
|-----|------|-------------|
| `connect-pg-simple` esbuild external | `artifacts/api-server/build.mjs` | Added to `external` array |
| Login `setQueryData` | `artifacts/sahu-csc/src/hooks/use-auth.tsx` | Login sets cache directly from response body; no refetch |
| Logout `setQueryData` | `artifacts/sahu-csc/src/hooks/use-auth.tsx` | Logout clears `["auth/me"]` cache entry directly |
| Login redirect guard | `artifacts/sahu-csc/src/pages/login.tsx` | `useEffect` redirects when `user` becomes truthy |

---

## 23. Bottom Navigation Bar Fixed to Viewport (June 2026)

> Applied after Replit environment migration.

---

### Bug Fix: Mobile Bottom Nav Scrolled With Page Instead of Staying Fixed

**Symptom:** The mobile bottom navigation bar (Dashboard / Ledger / AePS / Profile) scrolled away with the page content instead of staying pinned at the bottom of the viewport.

**Root cause:** In `App.tsx`, the `Router` component wrapped every page in a Framer Motion `<motion.div>` for page-transition animations:

```tsx
<motion.div
  key={location}
  initial={{ opacity: 0, y: 5 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -5 }}
  transition={{ duration: 0.15, ease: "easeOut" }}
  style={{ minHeight: "100vh", willChange: "opacity, transform" }}  // ← culprit
>
```

The `willChange: "opacity, transform"` CSS property causes the browser to promote the element to its own compositor layer. A **side effect** of this promotion is that the element becomes a new **containing block** for any `position: fixed` descendants. This is specified CSS behaviour — `position: fixed` is only relative to the viewport when no ancestor has `transform`, `perspective`, `filter`, or `willChange` applied. Because the bottom `<nav>` (with `position: fixed bottom-0`) lived inside this `motion.div`, it was positioned relative to that div rather than the viewport, and therefore scrolled with the content.

**Why the nav already had correct CSS:** The `<nav>` in `layout.tsx` already had `className="md:hidden fixed bottom-0 left-0 right-0 z-30"` and `<main>` already had `pb-24`. The CSS was always correct — the containing block was the problem.

**Fix applied (`artifacts/sahu-csc/src/App.tsx`):**

```tsx
// Before (broken — willChange: transform creates new containing block for position: fixed):
style={{ minHeight: "100vh", willChange: "opacity, transform" }}

// After (correct — Framer Motion handles GPU compositing internally):
style={{ minHeight: "100vh" }}
```

Framer Motion uses GPU acceleration for `opacity` and `y` animations internally without needing an explicit `willChange` hint. Removing it has no effect on animation quality or performance, but restores correct `position: fixed` behaviour for the bottom nav and any other fixed elements in the app.

| Fix | File | What Changed |
|-----|------|-------------|
| Remove `willChange` from page-transition wrapper | `artifacts/sahu-csc/src/App.tsx` | Removed `willChange: "opacity, transform"` from `motion.div` style prop |

---

## 19. Future Work Items

The following features are architected or partially wired but not yet fully active:

### Ready to Enable (just needs env vars)
- **Web Push Notifications** — set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL` in Replit Secrets; the infrastructure is in place

### Ready to Wire (UI + route exists, integration needed)
- **Offline ledger sync for edits** — currently only new entry creation works offline; edits/deletes show an error if attempted offline
- **Offline Reports** — reports page does not yet cache to IDB; only dashboard caches

### Planned / Design-Ready
- **Web Push notification triggers** — call `sendPushToUser()` from ledger create, daily summary cron, backup events
- **Background Sync API** — use SW `sync` event for more reliable background flushing (current approach uses `window.online` event which requires the tab to be open)
- **Multi-device sync** — detect and resolve conflicts when the same user edits on two devices
- **PWA Widgets** — manifest has a `widgets` entry for Android 12+ / Windows 11 home screen widgets; needs `/widgets/balance-template.json` served from the API
- **Share Target** — manifest has `share_target` defined; needs a `/share-target` page to handle received content
- **File Handler** — manifest would allow opening `.csv`/`.xlsx` files; needs `/open-file` page
- **Language support** — English, Hindi (`hi`), Odia (`or`) are listed in preferences but UI strings are currently English only; i18n library needed
- **Cloud backup** — current backup is a metadata record only; wire to `pg_dump` / S3 for real backups
- **TWA APK** — follow the 5-step publishing guide in `replit.md` after deploying

---

## 26. V2 Authentication & Multi-Device Sessions (June 2026)

### Overview
Full rebuild of the session and authentication system. V1 used a single `activeSessionToken` on the `users` table; V2 adds a dedicated `user_sessions` table that tracks every active login across all devices simultaneously.

### New DB Table: `user_sessions`
| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `session_id` | text UNIQUE | UUID generated at login; also stored in express-session |
| `user_id` | integer | FK → users.id |
| `device_info` | text | `"Chrome on Windows"` — combined from UA parsing |
| `browser` | text | Chrome, Firefox, Safari, Edge, etc. |
| `os` | text | Windows, macOS, Android, iOS, Linux |
| `ip_address` | text | X-Forwarded-For aware |
| `remember_me` | boolean | Standard=8h, RememberMe=30 days |
| `is_active` | boolean | Set to false on revoke |
| `expires_at` | timestamptz | |
| `last_activity` | timestamptz | Throttled update (at most once/minute) |
| `created_at` | timestamptz | |

### `requireAuth` V2 Fallback Chain
1. Read `sessionId` from `req.session`
2. Look up `user_sessions` by `sessionId` where `isActive=true` and not expired
3. If found → set `req.session.userId` and continue
4. If not found → fall back to V1 `activeSessionToken` on `users` table for backward compat
5. If neither → 401 Unauthorized

### Session Management API (`/api/sessions`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sessions` | List all active sessions for current user |
| `DELETE` | `/api/sessions/:id` | Revoke a specific session by DB row ID |
| `DELETE` | `/api/sessions/others` | Revoke all sessions except the current one |
| `DELETE` | `/api/sessions/all` | Revoke ALL sessions + destroy current session |

`DELETE /sessions/all` returns `{ redirect: true }`. The frontend checks this flag and calls `logout()` to clear client-side auth state before redirecting to `/login`.

### Sessions Page (`/sessions`)
Frontend page `sessions.tsx` shows:
- Device card per active session: browser, OS, IP, last active time, "This device" badge
- Per-session revoke button
- "Logout Other Devices" and "Logout Everywhere" bulk actions
- Added to sidebar under Account section with `Monitor` icon

### Account Locking
- 5 failed login attempts → account locked for 15 minutes
- `locked_until` timestamptz on `users` table; auto-unlocked if window has expired
- `login.failed_max_attempts` audit log entry written when account is first locked
- `login.failed_locked` written on every blocked attempt (includes minutes remaining)

### Password Reset — OTP Flow (`/forgot-password`)
4-step flow on a single page (`forgot-password.tsx`):
1. **Step 1** — Enter username / email / mobile
2. **Step 2** — Enter 6-digit OTP (token stored in `password_reset_tokens` table, short TTL)
3. **Step 3** — Enter new password (must pass strength policy: 8+ chars, upper, lower, number)
4. **Step 4** — Success screen with login redirect

`/reset-password` redirects to `/forgot-password` — do not split back into two pages.

---

## 27. RBAC — `requirePermission` Middleware (June 2026)

### Overview
Replaced simple `requireRole(["admin"])` checks with a fine-grained `requirePermission(permission)` system. Each route group is guarded by the specific permission it needs, not just a role name.

### Built-In Role Permissions
| Role | Permissions |
|---|---|
| `admin` | `["*"]` — wildcard, all permissions |
| `operator` | `ledger:view`, `ledger:create`, `ledger:edit`, `aeps:view`, `aeps:manage`, `reports:view`, `reports:export`, `services:view`, `profile:view`, `notifications:view`, `udhari:view`, `udhari:manage` |
| `user` | `ledger:view`, `reports:view`, `services:view`, `profile:view`, `notifications:view` (read-only) |

### Permission Map (by route group)
| Route group | Required permission |
|---|---|
| `GET /api/ledger/*` | `ledger:view` |
| `POST /api/ledger` | `ledger:create` |
| `PATCH /api/ledger/:id`, `DELETE /api/ledger/:id` | `ledger:edit` |
| `GET /api/aeps/*` | `aeps:view` |
| `POST/PATCH/DELETE /api/aeps/*` | `aeps:manage` |
| `GET /api/reports/*` | `reports:view` |
| `GET /api/reports/export` | `reports:export` |
| `GET /api/dashboard` | `reports:view` |
| `GET /api/udhari/*` (read) | `udhari:view` |
| `POST/PATCH/DELETE /api/udhari/*` | `udhari:manage` |

### Middleware implementation (`lib/auth.ts`)
```ts
export function requirePermission(permission: string) {
  return requireAuth, async (req, res, next) => {
    const role = req.session.userRole;
    const permissions = ROLE_PERMISSIONS[role] ?? [];
    if (permissions.includes("*") || permissions.includes(permission)) return next();
    res.status(403).json({ error: "Insufficient permissions" });
  };
}
```

### Idle Timeout (`use-idle-timer.ts`)
Auto-logout after **30 minutes of inactivity** across the whole app:
- Counts down from 30 min on every mouse/keyboard/touch event
- Shows a 2-minute countdown warning dialog: "Stay Logged In" / "Logout Now"
- `useIdleTimer` called in `Layout` component (not individual pages) so it applies globally
- `handleIdle` callback calls `logout()` directly when timer expires

---

## 28. Udhari Khata System (June 2026)

### Purpose
"Udhari Khata" (उधारी खाता) is a per-user customer credit ledger. The CSC operator tracks money they gave to customers (credit extended) and money they received back. Each customer has a running balance showing the net amount owed.

### Data Model

#### `udhari_customers`
| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `name` | text | Required |
| `phone` | text NULL | |
| `address` | text NULL | |
| `balance` | numeric(12,2) | Auto-recalculated on every entry change |
| `created_by` | integer | FK → users.id — per-user isolation |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `udhari_entries`
| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `customer_id` | integer | FK → udhari_customers.id CASCADE |
| `date` | text | ISO YYYY-MM-DD |
| `type` | text | `gave` (CSC gave money) / `got` (CSC received) |
| `amount` | numeric(12,2) | Always positive |
| `note` | text NULL | |
| `created_by` | integer | FK → users.id |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### API Endpoints (`/api/udhari`)
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/udhari/summary` | Total to_collect + to_pay across all customers |
| `GET` | `/api/udhari/customers` | List all customers with balance |
| `POST` | `/api/udhari/customers` | Create new customer |
| `GET` | `/api/udhari/customers/:id` | Single customer detail |
| `PATCH` | `/api/udhari/customers/:id` | Update customer info |
| `DELETE` | `/api/udhari/customers/:id` | Delete customer + all entries |
| `GET` | `/api/udhari/customers/:id/entries` | List entries for a customer |
| `POST` | `/api/udhari/customers/:id/entries` | Add gave/got entry |
| `PATCH` | `/api/udhari/customers/:id/entries/:entryId` | Edit entry |
| `DELETE` | `/api/udhari/customers/:id/entries/:entryId` | Delete entry |

### Frontend Pages

#### `udhari.tsx` — Customer List
- Summary banner: "To Collect ₹X · To Pay ₹Y" with gradient chips
- Search by name, sort by name/balance/date
- Customer cards with `BalanceBadge` (orange=to collect, green=to pay, grey=settled)
- FAB to add new customer

#### `udhari-customer.tsx` — Per-Customer Ledger
- Balance banner: large balance chip (orange/green/grey) with customer name + phone
- "You Gave / You Got" entry form as bottom-sheet dialog
- Entry list with colored left stripe (orange=gave, green=got)
- WhatsApp reminder button: opens `wa.me/<phone>?text=...` with pre-filled balance message
- PDF export (html2canvas + jsPDF): generates A4 statement with customer info + all entries

### Audit Logging
| Action | When |
|---|---|
| `udhari.customer.create` | New customer added |
| `udhari.customer.update` | Customer details edited |
| `udhari.customer.delete` | Customer (+ all entries) deleted |
| `udhari.entry.create` | New gave/got entry recorded |

---

## 29. Receipt System (June 2026)

### Overview
Every ledger transaction now gets a unique receipt number and a public shareable URL for verification.

### New DB Tables

#### `receipt_counters`
| Column | Type | Notes |
|---|---|---|
| `year` | integer PK | Calendar year |
| `last_count` | integer | Last used sequential counter for this year |

Sequential counter is incremented atomically using an upsert:
```sql
INSERT INTO receipt_counters(year, last_count) VALUES($year, 1)
ON CONFLICT(year) DO UPDATE SET last_count = receipt_counters.last_count + 1
RETURNING last_count
```

#### New columns on `ledger`
| Column | Type | Notes |
|---|---|---|
| `receipt_number` | text | `CSC-YYYY-NNNN` format (e.g. `CSC-2026-0042`) |
| `receipt_token` | text UNIQUE | UUID used in public verification URL |

### Public Verification URL
`GET /api/receipts/verify/:token` — **no auth required**.
Returns: receipt_number, date, customer_name, service_type, credit, debit, balance, business info.

Frontend page `receipts-verify.tsx` at `/receipts/verify/:token`:
- Shows a clean receipt card with all transaction details
- Displays a QR code linking back to itself (for re-verification)
- "No auth required" — sharable with customers

### Receipt Modal (`receipt-modal.tsx`)
Shown after creating a ledger entry. Contains:
- Header: business name, receipt number, date, customer
- Line items: service, amount, running balance
- QR code linking to `/receipts/verify/:token`
- 2×2 action button grid:
  - **Print** — `window.print()` popup
  - **PDF** — html2canvas + jsPDF → A4 PDF download
  - **WhatsApp** — Web Share API (with PDF file on mobile) or `wa.me` link fallback on desktop
  - **Share** — Web Share API (text/URL)

### AePS Receipt Modal (`aeps-receipt-modal.tsx`)
Same layout and 2×2 action grid for AePS withdrawal/deposit transactions.

### Udhari Receipt Modal (`udhari-receipt-modal.tsx`)
Receipt for "You Gave / You Got" entries. Orange/green gradient header, balance chip, customer info, WhatsApp reminder pre-filled with balance text.

---

## 30. Admin Oversight Pages (June 2026)

### Admin API Routes (`/api/admin`)
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/users-overview` | All users' balance summary (name, balance, total credits/debits) |
| `GET` | `/api/admin/users-overview/:userId/ledger` | Full ledger for any user (admin only) |
| `GET` | `/api/admin/aeps-overview` | AePS current balance for all users |

### Users Page — Cash Overview Tab
The old separate `/users-overview` page was consolidated into `users.tsx` as a 4th tab ("Cash Overview"). Old route `/users-overview` now redirects to `/users`. This reduces navigation depth and keeps all user-related admin tools in one place.

---

## 31. PWA Status Page & App & Offline Status (June 2026)

### `/pwa-status` — App & Offline Status
Full diagnostic page accessible from the sidebar. Live readings:
- **Network**: Online / Offline / Slow (2G) with latency probe
- **Sync queue**: Pending count, last sync time, manual sync trigger
- **IndexedDB storage**: Usage per store, quota remaining
- **App install status**: Installed / Installable / Not supported
- **Push notifications**: Subscription active / inactive, subscribe/unsubscribe button
- **Device capability checklist**: Service Worker, Push, Background Sync, Periodic Sync, Wake Lock, Share, File Handler, Badges
- **Security summary**: Session info, VAPID status

---

## 32. WhatsApp Receipt Sharing (June 2026)

All three receipt modals (Ledger, AePS, Udhari) include a WhatsApp share option:

**Mobile (supports Web Share API with files):**
```ts
const file = new File([pdfBlob], "receipt.pdf", { type: "application/pdf" });
await navigator.share({ title, text, files: [file] });
```

**Desktop fallback:**
```ts
window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
```

**Receipts verify page** also has a WhatsApp share button for the verification link.

---

## 33. Notification System Isolation Fixes (June 2026)

### Problem
7 notification isolation bugs were found and fixed. Notifications were appearing in the wrong user's inbox or leaking across users.

### Root Cause
`createNotification()` was being called without a `userId` in some places, which caused those notifications to be broadcast to all users. Other places used the wrong user's ID.

### Fix
- `createNotification()` now **always** requires `userId` to be explicitly passed
- `notifyNewRegistration()` fans out to all admin user IDs internally (no longer leaks to the registering user's inbox)
- `null userId` is now reserved exclusively for true system-wide broadcasts (backup events, etc.)
- All 7 call sites audited and corrected

---

## 34. UI Design System v2 — Mobile Header & Design Language (June 2026)

### Mobile Header v2 (3-layer design)
The mobile header in `layout.tsx` (`md:hidden` block) was redesigned with a 3-layer structure:

**Layer 1** — 3px gradient accent stripe: navy `#0b2c60` → saffron `#f97316`

**Layer 2** — White frosted main bar (60px):
- Left: navy rounded-square CSC badge + two-tone "SAHU" (navy) / "CSC" (saffron) brand text
- Right: notification bell + avatar chip (opens Sheet nav drawer — replaces old hamburger icon)

**Layer 3** — Navy gradient greeting sub-bar (44px):
- Time-based greeting + short date (computed in `Layout` component)

### Mobile Dashboard Stat Cards
- White `bg-white` card body with `box-shadow` instead of Tailwind `border`
- 3px colored top accent stripe (`s.accent` gradient) at card top
- Icon badges use CSS `background: gradient` inline style (not Tailwind `bg-*`) + matching `box-shadow` drop shadow
- Quick action cards: white rounded-2xl with gradient icon badges (42px, borderRadius 13) + navy label

### Font Size Bumps (Sidebar)
| Element | Before | After |
|---|---|---|
| Nav labels | 12px | 14px |
| Nav icons | 15px | 17px |
| Admin section label | 9px | 10px |
| User name/role | unchanged | bumped |

### Login Page Design Language
- `h-screen overflow-hidden` on both mobile and desktop — no scroll required
- Mobile: navy gradient header + slide-up white card
- "Forgot Password?" uses navy `#0b2c60` (not saffron)
- "Register here" dashed blue CTA card at bottom of mobile white card
- Register page: compact `LoginLogo` header + `flex-1 overflow-y-auto` white card

---

## 35. Canvas UI Mockup Exploration — v2 Page Redesigns (June 2026)

Four mobile-viewport redesign mockups placed on the Replit canvas board for review before integrating into the main app. Built in the `artifacts/mockup-sandbox/` isolated preview server.

### Components Created
| Canvas Frame | Component Path | Preview URL pattern |
|---|---|---|
| Ledger Page | `mockups/ledger/LedgerPage.tsx` | `/__mockup/preview/ledger/LedgerPage` |
| Add Entry Form | `mockups/addentry/AddEntryForm.tsx` | `/__mockup/preview/addentry/AddEntryForm` |
| AePS Page | `mockups/aeps/AepsPage.tsx` | `/__mockup/preview/aeps/AepsPage` |
| Udhari Entry Form | `mockups/udhari/UdhariForm.tsx` | `/__mockup/preview/udhari/UdhariForm` |

### Design Direction
- **Ledger Page**: Navy gradient hero header with live balance card; date-grouped transaction list; colored left stripe per row (green=credit, red=debit); saffron FAB; debounced search bar
- **Add Entry Form**: Bottom-sheet dialog; Credit/Debit type toggle switches entire form color scheme (green/red); large bold amount input with gradient badge; gradient submit button
- **AePS Page**: Hero header with daily cash balance card + opening/withdrawal/deposit mini stats; red/green action buttons embedded in header; focused transaction form overlay on tap
- **Udhari Entry Form**: "You Gave / You Got" toggle (orange/green); colored header chip showing customer + current balance; live "new balance after this entry" preview; gradient submit

### Status
Mockups are live on the canvas (390×844 mobile viewport each). Pending user review and approval before graduating into the main app via `mockup-graduate` workflow.

---

## 36. Schema Tables — Full v2 Reference (June 2026)

Complete list of all database tables as of v2.1.0:

| Table | Purpose |
|---|---|
| `users` | User accounts (id, username, email, mobile, role, status, locking fields) |
| `user_sessions` | V2 multi-device session tracking (one row per active login) |
| `session` | Express session store (auto-managed by connect-pg-simple) |
| `ledger` | Income/expense transactions with receipt_number + receipt_token |
| `receipt_counters` | Atomic sequential counter per year for CSC-YYYY-NNNN numbering |
| `aeps_daily` | AePS daily float session per user per day |
| `aeps_transactions` | Individual AePS withdrawals/deposits |
| `udhari_customers` | Udhari Khata customer list (per-user) |
| `udhari_entries` | Gave/got entries per customer |
| `services` | CSC service catalog (22 services, 5 categories) |
| `notifications` | User + system notifications (null userId = broadcast) |
| `audit_logs` | Immutable security + action audit trail |
| `settings` | Global key-value config store |
| `user_preferences` | Per-user UI preferences (theme, language, layout) |
| `push_subscriptions` | VAPID Web Push subscription records |
| `password_reset_tokens` | One-time OTP tokens for password reset |
| `backups` | Backup metadata records |

---

## 37. AePS & Udhari Receipt Token System (June 2026)

### What was added
- `receipt_token TEXT` column on `aeps_transactions` and `udhari_entries` tables (added via raw `ALTER TABLE … ADD COLUMN IF NOT EXISTS`)
- UUID receipt token generated at create-time for every AePS transaction and every Udhari entry
- All GET responses for transactions and entries include `receiptToken`

### AePS Receipt Modal (`aeps-receipt-modal.tsx`)
- Receipt number format: `AEPS-YYYY-{id padded 4}`
- QR code links to `/receipts/verify/aeps/:token` when token is present
- Print (popup), PDF (html2canvas + jsPDF), Web Share API with PDF blob, WhatsApp text fallback

### Udhari Receipt Modal (`udhari-receipt-modal.tsx`)
- Receipt number format: `UDH-YYYY-{id padded 4}`
- QR code links to `/receipts/verify/udhari/:token` when token is present
- WhatsApp share uses customer mobile from `udhari_customers` as fallback

### Public Verify Pages
| Route | Component | Notes |
|-------|-----------|-------|
| `/receipts/verify/aeps/:token` | `aeps-receipt-verify.tsx` | No auth required |
| `/receipts/verify/udhari/:token` | `udhari-receipt-verify.tsx` | No auth required |

### Public API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/receipts/verify/aeps/:token` | AePS transaction verify (in `aeps.ts`) |
| `GET` | `/api/receipts/verify/udhari/:token` | Udhari entry verify (in `receipts.ts`) |

> **Routing note:** `/receipts/verify/:token` (3 segments) does not match `/receipts/verify/aeps/:token` (4 segments) — Express route depth prevents the catch-all from shadowing the specific paths.

---

## 38. Toast Notification Redesign v2 (June 2026)

### Architecture
Replaced the Radix UI `@radix-ui/react-toast` primitives entirely. The new system is a pure custom Framer Motion renderer — `toaster.tsx` reads state from the existing `useToast()` hook but renders with its own animated components.

### Visual design
- **Rounded card** (rounded-2xl) with a **4px colored left accent bar** per variant
- **Icon badge** — 32×32 circle with tinted background, colored icon
- **Draining progress bar** at the bottom — animates `scaleX: 1 → 0` over 4.5 s so the user can see time remaining
- **Close button** — top-right, 24×24 rounded circle, hover background
- **Elevated shadow** — `0 8px 40px -6px rgba(0,0,0,0.18)`

### Variants
| Variant | Accent | Icon | Use case |
|---------|--------|------|----------|
| `default` | Navy `#0b2c60` | Info | General info |
| `success` | Green `#16a34a` | CheckCircle2 | Completed actions |
| `destructive` | Red `#ef4444` | XCircle | Errors |
| `warning` | Amber `#d97706` | AlertTriangle | Caution / reversible actions |

### Shorthands (`use-toast.ts`)
```ts
toast.success("Entry created")
toast.error("Failed to save", "Check your connection")
toast.warning("All transactions deleted", "Balance reset to ₹0.")
toast.info("OTP resent", "A new code has been sent.")
```

### ~30 call-site upgrades
All success actions across `ledger.tsx`, `profile.tsx`, `login.tsx`, `broadcast.tsx`, `notifications.tsx`, `preferences.tsx`, `backups.tsx`, and receipt modals updated to `toast.success()`. Lockout-lifted and bulk-delete upgraded to `toast.warning()`.

### Positioning
- **Mobile (< sm):** top-center, full width minus 1rem padding, stacks downward
- **Desktop (≥ sm):** bottom-right, 360px wide, stacks upward

### TOAST_LIMIT raised to 3 (from 1) — toasts stack with `AnimatePresence layout` animations.

---

## 39. Toast Swipe-to-Dismiss + Mobile Animation Direction (June 2026)

### Swipe-to-dismiss
- `drag="x"` + `dragConstraints={{ left: 0, right: 0 }}` + `dragElastic={0.35}` on each toast card
- Dismiss triggers when `|velocity.x| > 400` or `|offset.x| > 110`
- On swipe: imperatively animates card to `x: ±520` via `fmAnimate(x, dir * 520)`, then calls `dismiss(id)`
- On partial drag (below threshold): spring-snaps back via `fmAnimate(x, 0, { spring })` and restarts the auto-dismiss timer
- `dragOpacity` motion value fades the card as it's dragged (`x: 0 → 1.0`, `x: ±180 → 0.15`)
- `rotate` motion value tilts the card ±4° at max drag
- Close button uses `onPointerDown={e.stopPropagation()}` to prevent drag intercepting the tap
- `touch-pan-y select-none` CSS class prevents scroll interference on mobile

### Animation directions
- **Mobile (isTop=true):** enter from `y: -64` (slides down from top), exit to `y: -18` (slides up)
- **Desktop (isTop=false):** enter from `y: 64` (slides up from bottom), exit to `y: 18` (slides down)
- Spring: `stiffness 460, damping 34, mass 0.8`
- Exit: `0.22s ease-in`

### Timer management
Auto-dismiss timer is paused on `onDragStart` and either restarted (snap-back) or permanently cleared (swipe-dismiss).


---

## 40. Language UX, Startup Reliability & Workflow Cleanup — v2.7.1 (June 27, 2026)

### Language Switcher Removed from Sidebar
The `LanguageSwitcher` component was removed from `layout.tsx`. Language is now only accessible via **Profile → Preferences → Language**. Consolidates all user preferences in one place and removes duplication.

### Language Switching Fixed in Profile > Preferences
Two bugs fixed in `profile.tsx`:
- **Bug 1:** `onValueChange` for the language `<Select>` only called `prefsForm.setValue(...)` but never called `setLanguage(val)` — UI language never actually switched. Fixed by adding `setLanguage(val)` in both mobile + desktop handlers.
- **Bug 2:** The `useEffect` that restores saved preferences on mount did not call `setLanguage(savedPrefs.language)` — language reverted to default on page navigation. Fixed by adding `setLanguage(savedPrefs.language)` inside the preferences `useEffect`.

### Language Indicator Badge in Preferences
A blue pill badge (`bg-blue-100 text-blue-800`) showing the current language (e.g., `🇬🇧 English`) was added below the Language label in the Preferences section — both mobile and desktop.

### API Server Smart Build Check
`dev` script in `artifacts/api-server/package.json` now skips esbuild if `dist/index.mjs` already exists:
```bash
export NODE_ENV=development && (test -f ./dist/index.mjs || pnpm run build) && fuser -k 8080/tcp 2>/dev/null; pnpm run start
```
Restart time drops from ~90 s → ~2 s. Force full rebuild: `rm -rf artifacts/api-server/dist/`.

### Frontend Port-Kill on Startup
`artifacts/sahu-csc: web` workflow command now includes `fuser -k 5000/tcp 2>/dev/null` before Vite starts — prevents `EADDRINUSE` on rapid restarts.

### WORKFLOWS.md Corrected
Full rewrite to reflect current state: removed references to defunct `Start application` workflow and port 8082; documented API on port 8080, smart build check, port-kill, duplicate Preview panel entry, and correct Seed Database command.
