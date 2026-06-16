# SAHU CSC — Complete App Logic & Architecture

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Database Schema](#3-database-schema)
4. [Backend — Express API Server](#4-backend--express-api-server)
   - [Middleware Stack](#41-middleware-stack)
   - [Auth Library](#42-auth-library)
   - [Notify & Audit Helpers](#43-notify--audit-helpers)
   - [API Route Reference](#44-api-route-reference)
5. [Frontend — React SPA](#5-frontend--react-spa)
   - [App Bootstrap & Providers](#51-app-bootstrap--providers)
   - [Routing & Access Control](#52-routing--access-control)
   - [Pages](#53-pages)
   - [Data Fetching Layer](#54-data-fetching-layer)
6. [PWA & TWA Support](#6-pwa--twa-support)
   - [Service Worker & Caching](#61-service-worker--caching)
   - [Web App Manifest](#62-web-app-manifest)
   - [Install Prompt & Offline Banner](#63-install-prompt--offline-banner)
   - [TWA (Android)](#64-twa-android)
7. [Security Model](#7-security-model)
   - [Authentication Flow](#71-authentication-flow)
   - [Role-Based Access Control](#72-role-based-access-control)
   - [Data Isolation (Multi-User)](#73-data-isolation-multi-user)
   - [IDOR Protection](#74-idor-protection)
8. [Data Flow — End to End](#8-data-flow--end-to-end)
9. [Business Logic Details](#9-business-logic-details)
   - [Ledger & Running Balance](#91-ledger--running-balance)
   - [AePS (Aadhaar Payment System)](#92-aeps-aadhaar-payment-system)
   - [Reports & Export](#93-reports--export)
   - [Notifications](#94-notifications)
   - [Profile & Preferences](#95-profile--preferences)
10. [OpenAPI Contract-First Design](#10-openapi-contract-first-design)
11. [Environment & Configuration](#11-environment--configuration)
12. [Default Seed Data](#12-default-seed-data)
13. [Known Gotchas & Conventions](#13-known-gotchas--conventions)
14. [Replit Environment](#14-replit-environment)

---

## 1. Project Overview

**SAHU CSC** is a multi-user business management platform for Common Service Centers (CSC) in rural India. It handles:

- Daily transaction ledger with per-user running balances
- AePS (Aadhaar Enabled Payment System) cash flow tracking
- Service catalog management
- Daily and monthly financial reports with Excel export
- Multi-user accounts with role-based access and full data isolation
- Per-user profile, avatar, and UI preferences
- Full audit trail of all sensitive actions
- System-wide notifications and push notifications (VAPID)
- Multi-device session management with V2 session tracking
- Account locking after failed login attempts + idle auto-logout
- **PWA** (installable, offline-capable) and **TWA** (Android app via Digital Asset Links)

**Default Credentials**

| Username   | Password      | Role     |
|------------|---------------|----------|
| `admin`    | `admin123`    | admin    |
| `operator` | `operator123` | operator |

---

## 2. Monorepo Structure

```
workspace/
├── artifacts/
│   ├── api-server/          # Express 5 backend (port 8082 in dev, serves /api)
│   │   ├── src/
│   │   │   ├── app.ts       # Express app, middleware setup, session store
│   │   │   ├── index.ts     # HTTP server entrypoint
│   │   │   ├── routes/      # One file per resource
│   │   │   │   ├── index.ts             # Router composition
│   │   │   │   ├── auth.ts              # Login / logout / me / register
│   │   │   │   ├── password-reset.ts    # OTP-based forgot/reset password
│   │   │   │   ├── sessions.ts          # Multi-device session list + revoke
│   │   │   │   ├── ledger.ts            # Ledger CRUD + balance/summary
│   │   │   │   ├── aeps.ts              # AePS sessions + transactions
│   │   │   │   ├── services.ts          # Service catalog CRUD
│   │   │   │   ├── users.ts             # User management (admin only)
│   │   │   │   ├── admin.ts             # Admin oversight (users-overview, per-user ledger)
│   │   │   │   ├── profile.ts           # Own profile + avatar
│   │   │   │   ├── preferences.ts       # Per-user UI preferences
│   │   │   │   ├── notifications.ts     # Notification inbox
│   │   │   │   ├── reports.ts           # Reports, dashboard, export
│   │   │   │   ├── audit.ts             # Audit log viewer (admin only)
│   │   │   │   ├── settings.ts          # Global settings + backups
│   │   │   │   ├── push.ts              # Push subscription CRUD
│   │   │   │   └── health.ts            # GET /api/healthz (full diagnostics)
│   │   │   └── lib/
│   │   │       ├── auth.ts    # requireAuth / requireRole / requirePermission / parseDevice / auditLog
│   │   │       ├── notify.ts  # createNotification helper
│   │   │       ├── logger.ts  # Pino structured logger
│   │   │       ├── push.ts    # web-push helpers (sendPushToUser, sendPushToAll)
│   │   │       └── vapid.ts   # VAPID key auto-generation / env detection
│   │   └── build.mjs          # esbuild bundler script (compiles to dist/)
│   │
│   ├── sahu-csc/            # React + Vite frontend (port 5000, serves /)
│   │   ├── index.html              # PWA meta tags, theme-color, apple-touch-icon
│   │   ├── vite.config.ts          # Vite config + VitePWA + Workbox + proxy → 8082
│   │   ├── public/
│   │   │   ├── sahu-logo.png           # Primary brand logo
│   │   │   ├── apple-touch-icon.png    # 180×180 — iOS home screen icon
│   │   │   ├── pwa-96x96.png / pwa-144x144.png / pwa-192x192.png / pwa-512x512.png
│   │   │   └── .well-known/
│   │   │       └── assetlinks.json     # Digital Asset Links for TWA (Android)
│   │   └── src/
│   │       ├── App.tsx             # QueryClient, providers, router
│   │       ├── main.tsx            # createRoot + registerSW (PWA) + syncEngine init
│   │       ├── pages/
│   │       │   ├── login.tsx              # Mobile: navy header + white card + "Register here" CTA
│   │       │   ├── register.tsx           # Self-registration + PasswordStrength meter
│   │       │   ├── forgot-password.tsx    # OTP request form
│   │       │   ├── reset-password.tsx     # OTP verification + new password
│   │       │   ├── dashboard.tsx          # Real-time stats + offline cache fallback
│   │       │   ├── ledger.tsx             # Transactions + offline queue support
│   │       │   ├── aeps.tsx               # AePS cash management (per-user)
│   │       │   ├── services.tsx           # Service catalog
│   │       │   ├── reports.tsx            # Charts + Excel export + cached offline
│   │       │   ├── notifications.tsx      # Notification inbox
│   │       │   ├── profile.tsx            # Profile photo, bio, password change
│   │       │   ├── users.tsx              # User management (admin)
│   │       │   ├── users-overview.tsx     # Admin overview of all users' balances
│   │       │   ├── audit-logs.tsx         # Full audit trail (admin)
│   │       │   ├── settings.tsx           # Business info, theme, backup config (admin)
│   │       │   ├── backups.tsx            # Backup and restore (admin)
│   │       │   ├── sessions.tsx           # Active sessions: device cards, revoke, logout ALL
│   │       │   ├── pwa-status.tsx         # App & Offline Status: network, sync, storage, push
│   │       │   ├── server-health.tsx      # API server diagnostics (admin)
│   │       │   ├── offline.tsx            # Offline fallback page
│   │       │   └── not-found.tsx          # 404 page
│   │       ├── components/
│   │       │   ├── layout.tsx               # Sidebar + mobile nav + install banner + sync bar + idle timeout dialog
│   │       │   ├── sync-status-bar.tsx      # 🟢/🟡/🔴 global sync status indicator + SyncDot
│   │       │   ├── pwa-install-banner.tsx   # Install prompt banner
│   │       │   ├── app-logo.tsx             # AppLogo (sidebar) + LoginLogo (auth pages); uses sahu-logo.png
│   │       │   ├── theme-provider.tsx
│   │       │   └── ui/                      # shadcn/ui components
│   │       ├── hooks/
│   │       │   ├── use-auth.tsx              # AuthContext + offline session cache from IndexedDB
│   │       │   ├── use-network-status.ts     # Online/offline/slow detection + 30s latency probe
│   │       │   ├── use-pwa.ts                # Install prompt, badge, periodic sync, share, wake lock
│   │       │   ├── use-sync.ts               # Sync queue state (pending count, last sync, status)
│   │       │   ├── use-push-notifications.ts # Push subscription subscribe/unsubscribe
│   │       │   ├── use-idle-timer.ts         # Auto-logout after 30 min; 2-min warning dialog
│   │       │   ├── use-device.tsx            # Device type detection
│   │       │   ├── use-wake-lock.ts          # Screen Wake Lock API
│   │       │   ├── use-file-handler.ts       # File handler API
│   │       │   ├── use-mobile.tsx            # Mobile breakpoint hook
│   │       │   └── use-toast.ts              # Toast notification hook
│   │       └── lib/
│   │           ├── offline-db.ts     # IndexedDB v2 wrapper (5 stores)
│   │           ├── sync-engine.ts    # Offline queue processor; auto-syncs on window.online
│   │           ├── pwa-badge.ts      # App badge API updater
│   │           └── utils.ts
│   │
│   └── mockup-sandbox/      # Canvas component preview server (port 8081)
│
├── lib/
│   ├── db/                  # @workspace/db — Drizzle ORM + schema
│   │   ├── src/
│   │   │   ├── index.ts     # Exports: pool, db client + all table objects
│   │   │   └── schema/
│   │   │       ├── index.ts            # Re-exports all schemas
│   │   │       ├── users.ts
│   │   │       ├── ledger.ts
│   │   │       ├── services.ts
│   │   │       ├── aeps.ts
│   │   │       ├── notifications.ts
│   │   │       ├── audit_logs.ts
│   │   │       ├── settings.ts
│   │   │       ├── user_preferences.ts
│   │   │       ├── user_sessions.ts        # V2 multi-device sessions
│   │   │       ├── push_subscriptions.ts   # VAPID push subscription storage
│   │   │       └── password_reset_tokens.ts
│   │   └── drizzle.config.ts
│   │
│   ├── api-spec/            # @workspace/api-spec
│   │   └── openapi.yaml     # OpenAPI 3.1 spec — single source of truth
│   │
│   └── api-client-react/    # @workspace/api-client-react
│       └── src/
│           ├── generated/         # Orval-generated React Query hooks + Zod schemas (do not edit)
│           ├── custom-fetch.ts    # Base fetch wrapper
│           └── index.ts           # Package exports
│
├── infrastructure/
│   ├── pwa/
│   │   └── manifest.json    # Full standalone PWA manifest reference
│   └── twa/
│       └── twa-config.json  # Android TWA config for Bubblewrap CLI
│
└── replit.md                # Project README + user preferences
```

---

## 3. Database Schema

All tables use PostgreSQL via Drizzle ORM. The `@workspace/db` package exports the `pool`, `db` client, and all table objects.

### `users`
Stores all user accounts.

| Column                  | Type        | Notes                                        |
|-------------------------|-------------|----------------------------------------------|
| `id`                    | serial PK   |                                              |
| `username`              | text UNIQUE | Login identifier                             |
| `email`                 | text UNIQUE | Also usable as login identifier              |
| `mobile`                | text NULL   | Also usable as login identifier              |
| `full_name`             | text NULL   |                                              |
| `password_hash`         | text        | bcrypt, 12 rounds                            |
| `role`                  | text        | `admin` / `operator` / `user`                |
| `is_active`             | boolean     | Inactive users cannot log in                 |
| `status`                | text        | `ACTIVE` / `PENDING` / `INACTIVE` / `SUSPENDED` / `DELETED` / `LOCKED` |
| `failed_login_attempts` | integer     | Incremented on each bad password; reset on success |
| `locked_until`          | timestamptz NULL | Set when account is locked after 5 failed attempts |
| `active_session_token`  | text NULL   | V1 backward compat — latest session token    |
| `profile_picture`       | text NULL   | base64 data URL (max ~5MB)                   |
| `bio`                   | text NULL   | Max 500 chars                                |
| `address`               | text NULL   | Max 500 chars                                |
| `created_at`            | timestamptz |                                              |
| `updated_at`            | timestamptz | Auto-updated on every change                 |

### `user_sessions`
V2 multi-device session tracking. One row per active login across all devices.

| Column          | Type        | Notes                                           |
|-----------------|-------------|-------------------------------------------------|
| `id`            | serial PK   |                                                 |
| `session_id`    | text UNIQUE | UUID generated at login, stored in express-session |
| `user_id`       | integer     | FK → `users.id`                                 |
| `device_info`   | text        | e.g. `"Chrome on Windows"`                      |
| `browser`       | text        | e.g. `"Chrome"`, `"Firefox"`                    |
| `os`            | text        | e.g. `"Windows"`, `"Android"`, `"iOS"`          |
| `ip_address`    | text        | Client IP (X-Forwarded-For aware)               |
| `remember_me`   | boolean     | true = 30-day expiry; false = 8-hour expiry     |
| `is_active`     | boolean     | false after explicit revoke                     |
| `expires_at`    | timestamptz |                                                 |
| `last_activity` | timestamptz | Throttled update (at most once per minute)      |
| `created_at`    | timestamptz |                                                 |

### `session`
Express session store table — managed automatically by `connect-pg-simple`.

| Column   | Type          | Notes                                  |
|----------|---------------|----------------------------------------|
| `sid`    | varchar PK    | Session ID (opaque, signed in cookie)  |
| `sess`   | json          | Serialised session data                |
| `expire` | timestamp(6)  | Indexed for efficient pruning          |

> This table is auto-created at startup via `createTableIfMissing: true` in `app.ts`.

### `ledger`
Main income/expense transaction table. Each row belongs to a user.

| Column          | Type          | Notes                                           |
|-----------------|---------------|-------------------------------------------------|
| `id`            | serial PK     |                                                 |
| `date`          | text          | ISO format `YYYY-MM-DD`                         |
| `customer_name` | text          |                                                 |
| `service_type`  | text          | Should match a name in `services`               |
| `credit`        | numeric(12,2) | Income amount                                   |
| `debit`         | numeric(12,2) | Expense amount                                  |
| `description`   | text          |                                                 |
| `balance`       | numeric(12,2) | Running balance snapshot at insert time         |
| `created_by`    | integer       | FK → `users.id` (enforced in app, not DB)       |
| `created_at`    | timestamptz   |                                                 |
| `updated_at`    | timestamptz   |                                                 |

### `services`
Catalog of services offered at the CSC.

| Column        | Type          | Notes                                        |
|---------------|---------------|----------------------------------------------|
| `id`          | serial PK     |                                              |
| `name`        | text          |                                              |
| `description` | text          |                                              |
| `price`       | numeric(12,2) | Standard service charge in ₹                 |
| `category`    | text          | Government ID, Certificates, Utility Bills…  |
| `is_active`   | boolean       |                                              |
| `created_at`  | timestamptz   |                                              |
| `updated_at`  | timestamptz   |                                              |

### `aeps_daily`
One row per operating day per user for the AePS cash float.

| Column           | Type          | Notes                                      |
|------------------|---------------|--------------------------------------------|
| `id`             | serial PK     |                                            |
| `date`           | date          | Unique per `(date, created_by)`            |
| `opening_balance`| numeric(12,2) | Cash on hand at start of day               |
| `notes`          | text NULL     |                                            |
| `created_by`     | integer       | FK → `users.id` — per-user isolation       |
| `created_at`     | timestamptz   |                                            |
| `updated_at`     | timestamptz   |                                            |

### `aeps_transactions`
Individual withdrawals/deposits against a daily session.

| Column          | Type          | Notes                                        |
|-----------------|---------------|----------------------------------------------|
| `id`            | serial PK     |                                              |
| `daily_id`      | integer       | FK → `aeps_daily.id` CASCADE DELETE          |
| `type`          | text          | `withdrawal` or `deposit`                    |
| `amount`        | numeric(12,2) | Always positive                              |
| `customer_name` | text          |                                              |
| `description`   | text NULL     |                                              |
| `created_at`    | timestamptz   |                                              |

### `notifications`
User-level and system-wide alert messages.

| Column      | Type        | Notes                                               |
|-------------|-------------|-----------------------------------------------------|
| `id`        | serial PK   |                                                     |
| `user_id`   | integer NULL| NULL = system-wide (visible to all users)           |
| `title`     | text        |                                                     |
| `message`   | text        |                                                     |
| `type`      | text        | `info` / `warning` / `success` / `error`            |
| `is_read`   | boolean     |                                                     |
| `created_at`| timestamptz |                                                     |

### `audit_logs`
Immutable record of all sensitive actions.

| Column       | Type        | Notes                               |
|--------------|-------------|-------------------------------------|
| `id`         | serial PK   |                                     |
| `user_id`    | integer     | Who performed the action            |
| `action`     | text        | Dot-namespaced (see full list below)|
| `details`    | text NULL   | Human-readable description          |
| `ip_address` | text        | Client IP (X-Forwarded-For aware)   |
| `created_at` | timestamptz |                                     |

**Complete audit action codes:**
```
login.success, login.failed_inactive, login.failed_locked, login.failed_password, login.failed_max_attempts
logout
session.revoke, session.revoke_others, session.revoke_all
ledger.create, ledger.update, ledger.delete, ledger.clear
aeps.session, aeps.transaction, aeps.edit, aeps.delete
profile.update, profile.password_change, profile.avatar_update, profile.avatar_delete
preferences.update
user.create, user.update, user.role_change, user.delete
settings.update
backup.create, backup.restore
password.reset
REGISTER_REQUEST
```

### `settings`
Global key-value configuration store.

| Column | Type        | Notes      |
|--------|-------------|------------|
| `id`   | serial PK   |            |
| `key`  | text UNIQUE |            |
| `value`| text        |            |

**Known keys:** `businessName`, `businessAddress`, `businessMobile`, `businessEmail`,
`language`, `theme`, `currency`, `autoBackup`, `backupFrequencyDays`

### `user_preferences`
Per-user UI settings. Created on first access.

| Column             | Type           | Notes                                    |
|--------------------|----------------|------------------------------------------|
| `id`               | serial PK      |                                          |
| `user_id`          | integer UNIQUE | One row per user                         |
| `theme`            | text           | `light` / `dark`                         |
| `language`         | text           | `en` / `hi` / `or`                       |
| `dashboard_layout` | text           | Reserved for future layout variants      |
| `updated_at`       | timestamptz    |                                          |

### `push_subscriptions`
Web Push API subscription records per device.

| Column      | Type        | Notes                                |
|-------------|-------------|--------------------------------------|
| `id`        | serial PK   |                                      |
| `user_id`   | integer     | FK → `users.id`                      |
| `endpoint`  | text UNIQUE | Browser push endpoint URL            |
| `p256dh`    | text        | ECDH public key                      |
| `auth`      | text        | Auth secret                          |
| `created_at`| timestamptz |                                      |

### `password_reset_tokens`
One-time tokens for OTP-based password reset.

| Column      | Type        | Notes                                           |
|-------------|-------------|-------------------------------------------------|
| `id`        | serial PK   |                                                 |
| `token`     | text UNIQUE | Hashed OTP token                                |
| `user_id`   | integer     | FK → `users.id`                                 |
| `expires_at`| timestamptz | Short TTL (minutes)                             |
| `used`      | boolean     | Consumed after first use                        |
| `created_at`| timestamptz |                                                 |

### `backups`
Metadata records for backup operations.

| Column      | Type        |
|-------------|-------------|
| `id`        | serial PK   |
| `filename`  | text        |
| `size`      | integer     |
| `created_at`| timestamptz |

---

## 4. Backend — Express API Server

Entry point: `artifacts/api-server/src/index.ts`
App config: `artifacts/api-server/src/app.ts`
Port: **8082** in dev (set via `PORT` env var). All routes under `/api`.

> **Why 8082?** Port 8080 is held by a Replit artifact workflow. See §14.

### 4.1 Middleware Stack

Applied in order for every request:

```
pino-http (structured JSON logging)
  → helmet (security headers; CSP disabled for proxy compat)
  → hpp (HTTP parameter pollution protection)
  → rate-limit (global: 500 req / 15 min)
  → cors (origin: true, credentials: true)
  → express.json (body parsing, limit 10mb for avatar uploads)
  → express.urlencoded
  → express-session (PostgreSQL-backed via connect-pg-simple, shared pool)
  → [/api/auth/login only] loginLimiter (20 req / 15 min)
  → router (all /api routes)
```

**Session store (`connect-pg-simple`) configuration:**
```ts
new PgSession({
  pool,                     // shared pg.Pool from @workspace/db
  tableName: "session",
  createTableIfMissing: true,
  pruneSessionInterval: 3600, // prune expired sessions hourly
})
```

> Using the **shared `pool`** (not `conString`) is critical — a separate pool silently fails to save sessions. See §14 for details.

**Session cookie settings:**
- `httpOnly: true` — not accessible from JavaScript
- `secure: true` in production only (NODE_ENV === "production")
- `sameSite: "strict"` in production, `"lax"` in dev
- `maxAge`: 8 hours (standard) or 30 days (rememberMe=true)

### 4.2 Auth Library

File: `artifacts/api-server/src/lib/auth.ts`

| Export | Purpose |
|--------|---------|
| `hashPassword(password)` | bcrypt hash with 12 salt rounds |
| `comparePassword(password, hash)` | bcrypt compare |
| `requireAuth` | Middleware — checks `req.session.userId`; validates V2 session against `user_sessions` table (falls back to V1 `activeSessionToken` for backward compat); returns 401 if invalid |
| `requireRole(...roles)` | Middleware — re-fetches user from DB, checks role; returns 403 if insufficient |
| `requirePermission(permission)` | Middleware — checks role permissions map; `admin` has wildcard `["*"]`; returns 403 if insufficient |
| `parseDevice(userAgent)` | Returns `{ browser, os, deviceInfo, deviceType }` — used once per login request |
| `auditLog(userId, action, details, ip)` | Inserts an `audit_logs` row; swallows errors silently |
| `getClientIp(req)` | Reads `X-Forwarded-For`, falls back to socket address |

**Session shape** (stored server-side in PostgreSQL `session` table):
```ts
req.session.userId      // number — user.id
req.session.userRole    // string — user.role
req.session.sessionId   // string — V2 UUID (matches user_sessions.session_id)
req.session.sessionToken // string — V1 backward compat alias
```

**V2 `requireAuth` flow:**
1. Check `req.session.userId` exists → 401 if missing
2. If `req.session.sessionId` present → query `user_sessions` WHERE `session_id = ? AND is_active = true AND expires_at > NOW()` → 401 "SESSION_REPLACED" if not found
3. Throttled `lastActivity` update (at most once per minute)
4. Fallback: if only `req.session.sessionToken` (V1) → validate against `users.active_session_token`
5. `next()` on success

**Role permissions map:**

| Role | Permissions |
|------|-------------|
| `admin` | `["*"]` — all permissions (wildcard) |
| `operator` | `ledger:view`, `ledger:create`, `ledger:edit`, `aeps:view`, `aeps:manage`, `reports:view`, `reports:export`, `services:view`, `profile:view`, `profile:edit`, `notifications:view` |
| `user` | `ledger:view`, `reports:view`, `services:view`, `profile:view`, `notifications:view` (read-only) |

### 4.3 Notify & Audit Helpers

**`createNotification(title, message, type, userId?)`** — `lib/notify.ts`
Inserts a row in `notifications`. If `userId` is omitted → system-wide (shown to all users).
Used automatically on: login success, failed login attempt, account locked, backup events.

**`auditLog(userId, action, details, ip)`** — `lib/auth.ts`
Inserts a row in `audit_logs`. Called explicitly from every mutating route handler.
Errors are caught and logged (never surface to the client).

### 4.4 API Route Reference

All routes require `requireAuth` unless marked **public**. Routes marked **admin** also require `requireRole("admin")`. Routes with a permission tag use `requirePermission(...)`.

#### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Public | Accepts `{ identifier, password, rememberMe? }`. Matches username OR email OR mobile. Enforces account locking (5 attempts → 15 min lock). Sets V2 session + updates `user_sessions`. Returns user object. |
| POST | `/auth/register` | Public | Self-registration `{ username, email, mobile?, fullName?, password }`. New accounts get `status=PENDING` and require admin approval. |
| POST | `/auth/logout` | ✓ | Destroys express-session + marks `user_sessions` row `is_active=false`. |
| GET  | `/auth/me` | ✓ | Returns current user from DB (re-fetches to get live data). |
| POST | `/auth/forgot-password` | Public | Generates OTP token, creates a user notification with the reset link. |
| POST | `/auth/reset-password` | Public | Validates token, enforces password policy (8+ chars, upper, lower, number), sets new password. |

#### Sessions — `/api/sessions`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/sessions` | ✓ | List all active `user_sessions` for the current user (with device info, last activity, IP). |
| DELETE | `/sessions/:id` | ✓ | Revoke a specific session by `user_sessions.id`. Audited. |
| DELETE | `/sessions/others` | ✓ | Revoke all sessions except the current one. Audited. |
| DELETE | `/sessions/all` | ✓ | Revoke ALL sessions + destroy current → returns `{ redirect: true }` → frontend calls `logout()`. Audited. |

#### Profile — `/api/profile`

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| GET    | `/profile` | ✓ | `profile:view` | Own profile |
| PATCH  | `/profile` | ✓ | `profile:edit` | Update name/email/mobile/bio/address. Password change requires `currentPassword`. Audited. |
| POST   | `/profile/avatar` | ✓ | `profile:edit` | Upload base64 data URL. Audited. |
| DELETE | `/profile/avatar` | ✓ | `profile:edit` | Remove profile picture. Audited. |

#### Preferences — `/api/preferences`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/preferences` | ✓ | Returns or auto-creates preferences row. |
| PATCH  | `/preferences` | ✓ | Update `theme` / `language` / `dashboardLayout`. |

#### Ledger — `/api/ledger`

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| GET    | `/ledger/balance` | ✓ | `ledger:view` | `{ balance, totalCredits, totalDebits }` — user-scoped. |
| GET    | `/ledger/summary` | ✓ | `ledger:view` | Totals for `period` = today/yesterday/week/month/custom. |
| GET    | `/ledger` | ✓ | `ledger:view` | Paginated list. Query: `page`, `limit`, `startDate`, `endDate`, `serviceType`, `customerName`. |
| POST   | `/ledger` | ✓ | `ledger:create` | Create entry. Auto-computes running balance. Audited. |
| GET    | `/ledger/:id` | ✓ | `ledger:view` | Single entry. IDOR check. |
| PATCH  | `/ledger/:id` | ✓ | `ledger:edit` | Update. IDOR check. Audited. |
| DELETE | `/ledger/:id` | ✓ | `ledger:edit` | Delete. IDOR check. Audited. |
| DELETE | `/ledger/all` | Admin | — | Wipe entire ledger. Audited. |

#### AePS — `/api/aeps`

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| GET    | `/aeps/session?date=YYYY-MM-DD` | ✓ | `aeps:view` | Session + transactions + per-transaction running balance. `null` if no session. |
| POST   | `/aeps/session` | ✓ | `aeps:manage` | Create or update day session `{ date, openingBalance, notes? }`. Per-user unique `(date, created_by)`. Audited. |
| POST   | `/aeps/transaction` | ✓ | `aeps:manage` | Add `{ date, type, amount, customerName, description? }`. Audited. |
| PATCH  | `/aeps/transaction/:id` | ✓ | `aeps:manage` | Edit. Audited. |
| DELETE | `/aeps/transaction/:id` | ✓ | `aeps:manage` | Delete. Audited. |

#### Reports & Dashboard — `/api/reports` / `/api/dashboard`

All reports are user-scoped (non-admins see only their own data).

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| GET | `/dashboard` | ✓ | `reports:view` | Balance, today/month stats, recent 5 entries, top 5 services |
| GET | `/reports/daily?date=` | ✓ | `reports:view` | Day summary + topServices[5] + AePS stats |
| GET | `/reports/monthly?year=&month=` | ✓ | `reports:view` | Month summary + dailyBreakdown[] + topServices + AePS |
| GET | `/reports/aeps?startDate=&endDate=` | ✓ | `reports:view` | AePS-only stats for date range |
| GET | `/reports/service-breakdown?startDate=&endDate=` | ✓ | `reports:view` | Per-service count + revenue array |
| GET | `/reports/export?startDate=&endDate=` | ✓ | `reports:export` | Downloads `.xlsx` — Ledger Report + AePS Report sheets |

#### Notifications — `/api/notifications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/notifications?unreadOnly=` | ✓ | Own + system-wide (max 50, newest first). Returns **plain array** — not paginated. |
| PATCH  | `/notifications/:id/read` | ✓ | Mark one as read. IDOR check. |
| POST   | `/notifications/read-all` | ✓ | Mark all visible as read. |
| DELETE | `/notifications/:id` | ✓ | Delete one. IDOR check. |

#### Push Notifications — `/api/push`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/push/vapid-public-key` | Public | Returns VAPID public key for browser subscription |
| POST   | `/push/subscribe` | ✓ | Save push subscription `{ endpoint, p256dh, auth }` |
| DELETE | `/push/unsubscribe` | ✓ | Remove push subscription |

#### Admin — `/api/admin`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/users-overview` | Admin | All users' balance summary |
| GET | `/admin/users-overview/:userId/ledger` | Admin | Single user's ledger entries |
| GET | `/admin/aeps-overview` | Admin | All users' AePS balances |

#### Users — `/api/users` (Admin only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/users` | Admin | All users ordered by username. |
| POST   | `/users` | Admin | Create user. Audited (role changes logged separately). |
| PATCH  | `/users/:id` | Admin | Update fields including role/password/isActive. Role changes audited as `user.role_change`. |
| DELETE | `/users/:id` | Admin | Hard delete. Audited. |

#### Audit Logs — `/api/audit-logs` (Admin only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/audit-logs?page=&limit=&userId=&action=&startDate=&endDate=` | Admin | Paginated `{ logs, total, page, limit }`. JOINs username. |

#### Settings & Backups

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/settings` | ✓ | Returns merged defaults + DB overrides. |
| PATCH  | `/settings` | Admin | Upserts each provided key. Audited. |
| GET    | `/backups` | Admin | List all backup metadata records. |
| POST   | `/backups` | Admin | Record backup + system notification. Audited. |
| POST   | `/backups/:id/restore` | Admin | Mark restored + notification. Audited. |

#### Health — `/api/healthz`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/healthz` | Public | Full diagnostics: `{ status, server { uptime, nodeVersion, memory, system }, database { status, latencyMs, version }, vapid { status, persistent } }` |

---

## 5. Frontend — React SPA

### 5.1 App Bootstrap & Providers

`artifacts/sahu-csc/src/main.tsx` registers the service worker via `registerSW()` and initialises `syncEngine` on startup.

`artifacts/sahu-csc/src/App.tsx` wraps the app in this provider tree (outermost first):

```
QueryClientProvider (React Query, staleTime 30s, retry 1)
  → TooltipProvider (shadcn)
    → ThemeProvider (light/dark, stored in localStorage as "sahu-csc-theme")
      → WouterRouter (base = import.meta.env.BASE_URL)
        → AuthProvider (session polling via /auth/me + IndexedDB offline cache)
          → Router (page routes)
      → Toaster (shadcn toast notifications)
```

**`use-auth.tsx` loading guard:**
```ts
isLoading = liveLoading || !offlineChecked
// Uses || not && — prevents auto-logout on refresh
// (offline check completes before live fetch returns)
```

**Idle timeout:** `useIdleTimer` is called inside `Layout` (not individual pages) so the 30-minute timeout + 2-minute warning dialog applies globally across all authenticated pages.

### 5.2 Routing & Access Control

Router: **wouter** (lightweight).

`ProtectedRoute` component logic:
1. `isLoading` → full-screen spinner
2. No `user` → redirect to `/login`
3. `adminOnly` prop and `user.role !== "admin"` → 403 message
4. Otherwise → render page component

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/forgot-password` | Forgot Password | Public |
| `/reset-password` | Reset Password | Public |
| `/` | Dashboard | Any logged-in user |
| `/ledger` | Ledger | Any logged-in user |
| `/aeps` | AePS | Any logged-in user |
| `/services` | Services | Any logged-in user |
| `/reports` | Reports | Any logged-in user |
| `/notifications` | Notifications | Any logged-in user |
| `/profile` | Profile | Any logged-in user |
| `/sessions` | Active Sessions | Any logged-in user |
| `/pwa-status` | App & Offline Status | Any logged-in user |
| `/users` | Users | **Admin only** |
| `/users-overview` | Users Overview | **Admin only** |
| `/audit-logs` | Audit Logs | **Admin only** |
| `/settings` | Settings | **Admin only** |
| `/backups` | Backups | **Admin only** |
| `/server-health` | Server Health | **Admin only** |
| `/offline` | Offline Fallback | Public |
| `*` | 404 Not Found | Public |

### 5.3 Pages

| Page | Key Features |
|------|-------------|
| **Login** | Desktop split-layout + mobile navy header / white card. Username/email/mobile + password. "Forgot Password?" (navy). "Register here" dashed card (mobile). Account lock error display. |
| **Register** | `LoginLogo` header + white card. Username/email/mobile/name/password. `PasswordStrength` meter. Security badge. Link to login. Submitted accounts are `PENDING` pending admin approval. |
| **Forgot Password** | Identifier field → triggers OTP token via notification. |
| **Reset Password** | OTP + new password. Enforces 8+ chars, uppercase, lowercase, number. |
| **Dashboard** | Balance card, today/month stats, recent 5 transactions, top services bar chart. Caches to IndexedDB (30 min); reads cache when offline. |
| **Ledger** | Paginated table (mobile cards / desktop table). Add/edit/delete dialogs. Offline-aware: if offline → saves to IndexedDB `pending_ledger`. Pending entries panel shown with amber cards. |
| **AePS** | Date picker to switch sessions. Opening balance form. Add withdrawal/deposit. Running balance column. Summary totals. Per-user data isolation. |
| **Services** | Category-grouped catalog. Admin: add/edit/deactivate services. |
| **Reports** | Tabs: Daily / Monthly. Date/month pickers. Bar/pie charts (Recharts). AePS summary. Excel export. Cached offline. |
| **Notifications** | Inbox list. Unread badge. Mark one/all read. Delete. Type icons. |
| **Profile** | Avatar upload (base64). Name/email/mobile/bio/address. Separate password change with `currentPassword` check. Push notification toggle. |
| **Active Sessions** | Device cards (browser, OS, IP, last activity, device type icon). Revoke individual session. "Logout other devices". "Logout everywhere" (`DELETE /sessions/all`). |
| **App & Offline Status** | Network quality + latency, sync queue state, IndexedDB storage usage, PWA install status, push subscription status, device capability checklist. |
| **Users** *(admin)* | Table of all users. Create/edit/delete. Role and status change dialogs. Role changes audit-logged. |
| **Users Overview** *(admin)* | All users' ledger balance summary. Per-user ledger drill-down dialog. |
| **Audit Logs** *(admin)* | Paginated table. Filter by user, action, date range. |
| **Settings** *(admin)* | Business info. Language/theme/currency. Auto-backup toggle + frequency. |
| **Backups** *(admin)* | Backup records list. Create backup. Restore by ID. |
| **Server Health** *(admin)* | 4 cards: overall status, API server (memory/CPU), Database (latency/version), VAPID (persistent/ephemeral). Auto-refreshes every 30s. |

### 5.4 Data Fetching Layer

All API calls flow through generated hooks:

```
lib/api-spec/openapi.yaml
    ↓ (pnpm --filter @workspace/api-spec run codegen)
lib/api-client-react/src/generated/
    ├── sahu-csc.ts           # Orval-generated fetch functions
    ├── sahu-csc.zod.ts       # Zod schemas for all request/response shapes
    └── sahu-csc.msw.ts       # MSW mock handlers (dev/test use)
```

Pages import typed hooks:
```ts
import { useListLedgerEntries, useCreateLedgerEntry } from "@workspace/api-client-react";
```

These wrap `@tanstack/react-query` internally — `useQuery` for GET, `useMutation` for POST/PATCH/DELETE. Cache is invalidated per-resource after mutations.

---

## 6. PWA & TWA Support

### 6.1 Service Worker & Caching

Service worker is generated at build time by **`vite-plugin-pwa`** (Workbox `generateSW` strategy). Active in development (`devOptions.enabled: true`).

**Caching strategies (configured in `vite.config.ts`):**

| URL pattern | Strategy | Cache name | TTL |
|-------------|----------|------------|-----|
| `/api/auth/*` | NetworkOnly | — | never cached |
| `/api/dashboard` | StaleWhileRevalidate | `api-dashboard` | 5 min |
| `/api/reports/*` | StaleWhileRevalidate | `api-reports` | 10 min |
| `/api/settings` | StaleWhileRevalidate | `api-settings` | 30 min |
| `/api/profile` | StaleWhileRevalidate | `api-profile` | 5 min |
| `/api/preferences` | StaleWhileRevalidate | `api-preferences` | 30 min |
| `/api/ledger/*` | NetworkFirst | `api-ledger` | 5 min, 8s timeout |
| `/api/services` | NetworkFirst | `api-services` | 1 hr, 8s timeout |
| `/api/notifications` | NetworkFirst | `api-notifications` | 2 min, 8s timeout |
| Images/icons | CacheFirst | `image-cache` | 30 days |
| Fonts | CacheFirst | `font-cache` | 1 year |

**Registration** (`src/main.tsx`):
```ts
import { registerSW } from "virtual:pwa-register";
registerSW({ onOfflineReady() {}, onRegisteredSW(swUrl, r) { /* hourly check */ } });
```

`skipWaiting: true` + `clientsClaim: true` ensures new SW takes over immediately on update.

### 6.2 Web App Manifest

| Field | Value |
|-------|-------|
| `name` | SAHU CSC — Common Service Center |
| `short_name` | SAHU CSC |
| `id` | `sahu-csc-app` |
| `display` | standalone |
| `display_override` | window-controls-overlay, standalone, minimal-ui, browser |
| `theme_color` | `#0b2c60` (Deep Navy) |
| `background_color` | `#ffffff` |
| `start_url` | `/?source=pwa` |
| `orientation` | portrait-primary |
| `categories` | business, finance, productivity |
| `launch_handler.client_mode` | navigate-existing, auto |
| **shortcuts** | Dashboard, New Ledger Entry, AePS, Reports |
| **icons** | 96, 144, 192, 512px + maskable (512px) + apple-touch-icon (180px) |

### 6.3 Install Prompt & Offline Banner

**`use-pwa.ts`** — `usePWA()` hook:
- Listens for `beforeinstallprompt` → exposes `isInstallable` and `promptInstall()`
- Listens for `appinstalled` → sets `isInstalled = true`
- Delegates network detection to `useNetworkStatus`
- Exposes `isSlow` in addition to `isOffline`

**`sync-status-bar.tsx`** — global banner at top of every page:

| State | Display |
|-------|---------|
| Offline | 🔴 Red — "Offline Mode — N pending" |
| Slow connection | 🟡 Amber — "Slow connection detected" |
| Syncing | 🔵 Blue — spinning "Synchronising N entries…" |
| Partial failure | 🟠 Orange — "N entries failed to sync" + Retry |
| Pending (online) | 🟡 Amber — "N entries queued to sync" |
| All good | _(hidden)_ |

**`pwa-install-banner.tsx`** — shows install prompt when app is installable.

### 6.4 TWA (Android)

**Requirements:**
1. HTTPS (Replit deployment)
2. Valid PWA (manifest + SW — already implemented)
3. Digital Asset Links at `/.well-known/assetlinks.json`

**Publishing flow:**
1. Deploy on Replit → HTTPS domain
2. Visit [PWABuilder.com](https://www.pwabuilder.com) → Android package
3. Copy SHA-256 fingerprint → update `assetlinks.json`
4. Re-deploy → upload `.aab` to Google Play Console

---

## 7. Security Model

### 7.1 Authentication Flow

```
POST /api/auth/login
  → Zod validate body (identifier, password, rememberMe?)
  → parseDevice(userAgent) → browser, os, deviceInfo, deviceType
  → Query users WHERE username=? OR email=? OR mobile=?
  → Check status (PENDING → 403, INACTIVE/SUSPENDED/DELETED → 401)
  → Check LOCKED status → if locked and lock window expired → auto-unlock
  → bcrypt.compare(password, user.passwordHash)
  → On failure: increment failedLoginAttempts; if ≥5 → lock account 15 min
  → On success:
      - Reset failedLoginAttempts + status = ACTIVE
      - Generate UUID sessionId
      - Insert row into user_sessions (device info, IP, rememberMe, expiresAt)
      - Set req.session.userId + req.session.sessionId
      - Set req.session.cookie.maxAge (8h or 30d)
      - auditLog("login.success")
      - createNotification("User Login", userId=user.id)
      - Return user object (no password hash)
```

**Account locking:**
- 5 failed password attempts → `status = "LOCKED"`, `lockedUntil = now + 15 min`
- Auto-unlock on next login attempt after lock window expires

**Idle timeout (frontend):**
- `useIdleTimer` in `Layout` — 30 minutes of inactivity → `logout()`
- Warning dialog at 2 minutes remaining with "Stay Logged In" / "Logout Now"

**Session validation on every request (`requireAuth`):**
```
Check req.session.userId
  → V2 path: query user_sessions WHERE sessionId = ? AND isActive = true AND expiresAt > now()
  → If not found → destroy session → 401 "SESSION_REPLACED"
  → V1 fallback: compare req.session.sessionToken with users.activeSessionToken
  → Throttled lastActivity update (once per minute)
```

### 7.2 Role-Based Access Control

Three roles: **admin**, **operator**, **user**

`requirePermission(permission)` is applied at route level for all data routes:

| Permission | Routes |
|------------|--------|
| `ledger:view` | `GET /ledger`, `GET /ledger/:id`, `GET /ledger/balance`, `GET /ledger/summary` |
| `ledger:create` | `POST /ledger` |
| `ledger:edit` | `PATCH /ledger/:id`, `DELETE /ledger/:id` |
| `aeps:view` | `GET /aeps/*` |
| `aeps:manage` | `POST /aeps/*`, `PATCH /aeps/*`, `DELETE /aeps/*` |
| `reports:view` | `GET /reports/*`, `GET /dashboard` |
| `reports:export` | `GET /reports/export` |

Admin has `["*"]` — all `requirePermission` checks pass. Admin-only routes use `requireRole("admin")` directly.

**Frontend enforcement:** `ProtectedRoute adminOnly` hides admin pages.

### 7.3 Data Isolation (Multi-User)

Every query touching user-owned data applies a `getUserFilter(req)`:

```ts
function getUserFilter(req) {
  // Admin sees all; others see only their own data
  if (req.session.userRole === "admin") return undefined;
  return eq(ledgerTable.createdBy, req.session.userId);
}
```

Applied in: `ledger.ts`, `reports.ts`, `aeps.ts` (aeps_daily unique per `(date, created_by)`).

Admin oversight uses **separate `/api/admin/*` endpoints** that never mix with the admin's own data.

### 7.4 IDOR Protection

For routes operating on specific records by ID:
1. Fetch record from DB
2. If `record.createdBy !== req.session.userId` AND requester is not admin → `403 Forbidden`

Protected: `GET/PATCH/DELETE /ledger/:id`, `PATCH /notifications/:id/read`, `DELETE /notifications/:id`

---

## 8. Data Flow — End to End

```
User Action in Browser
        │
        ▼
React Component (e.g. "Add Entry" button click)
        │
        ▼ (if offline → addPendingEntry() to IndexedDB → toast "Saved offline")
useCreateLedgerEntry() — generated React Query mutation
        │
        ▼
customFetch POST /api/ledger  ── Cookie: connect.sid
        │
        ▼ (Vite proxy: localhost:5000 → localhost:8082)
Express Middleware Chain:
  pino-http → helmet → hpp → rate-limit → cors → json → session (pg-backed)
        │
        ▼
POST /api/ledger route handler
  1. requireAuth → validate V2 session in user_sessions
  2. requirePermission("ledger:create")
  3. Zod parse body
  4. Compute running balance via SUM(credit)-SUM(debit) WHERE createdBy=userId
  5. db.insert(ledgerTable, { ...data, createdBy: userId, balance })
  6. auditLog(userId, "ledger.create", details, ip)
  7. res.status(201).json(formattedEntry)
        │
        ▼
React Query cache invalidated → UI re-fetches ledger list
        │
        ▼
User sees new entry in the table
```

---

## 9. Business Logic Details

### 9.1 Ledger & Running Balance

The `balance` column stores a **snapshot** at insert time:

```
newBalance = SUM(all previous credits for this user)
           - SUM(all previous debits for this user)
           + new credit
           - new debit
```

- Balance is per-user, computed at insert
- Editing an entry **does NOT recompute** balance (snapshot drifts; `GET /ledger/balance` uses live SUM)
- `GET /ledger/balance` always computes live from SUM — always accurate

### 9.2 AePS (Aadhaar Payment System)

AePS tracks a physical cash float (separate from the main ledger).

- **Per-user isolation**: `aeps_daily` is unique per `(date, created_by)` — each user has their own daily session
- **Running balance** computed dynamically:
  ```
  current_balance = openingBalance - totalWithdrawals + totalDeposits
  ```
- Data appears in daily, monthly, and dedicated AePS reports

### 9.3 Reports & Export

**Daily report** — transaction count, total credits/debits, net revenue, top 5 services, AePS summary

**Monthly report** — aggregates + daily breakdown array (for charting) + top services + AePS daily breakdown

**Excel export** (SheetJS `xlsx` library):
- Sheet 1: Ledger — Date, Customer, Service, Credit, Debit, Balance, Description
- Sheet 2: AePS — Date, Opening Balance, Withdrawals, Deposits, Transactions, Net Flow

### 9.4 Notifications

Two scopes:
- `userId = NULL` → **system-wide** — visible to every logged-in user
- `userId = N` → **user-specific**

Auto-created notifications:
| Trigger | Type | Scope |
|---------|------|-------|
| Successful login | info | user-specific |
| Failed login (wrong password) | warning | system-wide |
| Account locked | warning | system-wide |
| Backup created/restored | success | system-wide |

### 9.5 Profile & Preferences

**Profile** — always scoped to `req.session.userId`. Password changes require `currentPassword`. Both changes are audit-logged separately.

**Preferences** — auto-created with defaults `(theme=light, language=en, dashboardLayout=default)` on first `GET /preferences`.

---

## 10. OpenAPI Contract-First Design

The API is defined once in `lib/api-spec/openapi.yaml` (OpenAPI 3.1). This drives:

1. **TypeScript types** — shared across frontend and backend
2. **Zod schemas** (`@workspace/api-zod`) — used server-side for request validation
3. **React Query hooks** (`@workspace/api-client-react`) — typed hooks for every endpoint
4. **MSW mock handlers** — for offline dev / testing

To regenerate after changing the spec:
```bash
pnpm --filter @workspace/api-spec run codegen
```

> Never edit files in `lib/api-client-react/src/generated/` manually.

---

## 11. Environment & Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (auto-provisioned by Replit) |
| `SESSION_SECRET` | Yes (prod) | Signs session cookies. Hardcoded fallback in dev only. |
| `PORT` | Yes | API server port — set to **8082** in `Start application` workflow |
| `BASE_PATH` | Yes (frontend) | Vite base URL — set to `/` in workflow |
| `NODE_ENV` | No | `production` enables secure cookies + strict sameSite |
| `VAPID_PUBLIC_KEY` | Recommended | Web Push VAPID public key; auto-generated ephemeral if missing |
| `VAPID_PRIVATE_KEY` | Recommended | Web Push VAPID private key |
| `VAPID_EMAIL` | Optional | VAPID contact email (default: `mailto:admin@sahucsc.in`) |
| `VAPID_KEYS_FROM_ENV` | Internal | Set by `ensureVapidKeys()` when keys loaded from env — used by `/api/healthz` |

**VAPID status:** `ensureVapidKeys()` runs at startup. If keys are in env → sets `VAPID_KEYS_FROM_ENV=true` (persistent). Otherwise auto-generates ephemeral keys (lost on restart — push subscriptions break).

**Schema changes:**
```bash
pnpm --filter @workspace/db run push
```
> ⚠️ Can empty tables. Always re-seed after: `pnpm --filter @workspace/api-server run seed`

---

## 12. Default Seed Data

The seed script (`artifacts/api-server/src/scripts/seed.ts`) is safe to re-run (uses `onConflictDoNothing()`).

**Users:** admin (role=admin), operator (role=operator)

**22 Services across 5 categories:**

| Category | Services |
|----------|---------|
| Government ID | Aadhaar Update, PAN Card, Voter ID, Passport, Driving Licence |
| Certificates | Birth Certificate, Death Certificate, Income Certificate, Caste Certificate, Residence Certificate |
| Insurance | Pradhan Mantri Jeevan Jyoti, Pradhan Mantri Suraksha Bima, Pradhan Mantri Fasal Bima |
| Utility Bills | Electricity Bill, Water Bill, Gas LPG Bill, Mobile Recharge |
| Schemes | PM Kisan Registration, NREGA Job Card, Scholarship Application, Banking Correspondent |

**Settings:** businessName=SAHU Common Service Center, language=en, theme=light, currency=INR, autoBackup=false

**Ledger:** 84 days of sample entries for the admin user

---

## 13. Known Gotchas & Conventions

| Rule | Details |
|------|---------|
| **Numeric columns return strings** | Drizzle returns `numeric` columns as strings. Always `parseFloat(value ?? "0")` before returning from routes. |
| **Balance is a snapshot, not live** | `balance` column in `ledger` is set at insert time. `GET /ledger/balance` computes live from SUM. They can diverge if entries are edited/deleted. |
| **`drizzle-kit push` empties tables** | After any schema push, check `SELECT COUNT(*) FROM users`. If empty, re-seed with `pnpm --filter @workspace/api-server run seed`. |
| **Notifications returns array, not page** | `GET /notifications` returns a plain array (not `{ items, total }`). Frontend uses `.length` for the unread count badge. |
| **Admin user filter = undefined** | `getUserFilter` returns `undefined` for admins (full table scan). Non-admins get a `WHERE created_by = userId` clause. |
| **openapi.yaml is source of truth** | Never edit `lib/api-client-react/src/generated/` manually. Change the spec then run codegen. |
| **typecheck order** | Always run `pnpm run typecheck:libs` before `pnpm run typecheck`. The DB lib must emit fresh `.d.ts` declarations first. |
| **PATCH on ledger does not recompute balance** | Editing credit/debit updates those fields but not the `balance` snapshot. Live `GET /ledger/balance` stays accurate. |
| **Session cookie** | Cookie name: `connect.sid`. httpOnly. 8h standard / 30d rememberMe. `sameSite: lax` in dev. |
| **PWA SW in dev** | SW is enabled in development (`devOptions.enabled: true`). If assets appear stale: DevTools → Application → Service Workers → "Update on reload", or clear site data. |
| **PWA manifest changes need restart** | Vite does not hot-reload `vite.config.ts`. After editing PWA manifest config, restart the frontend workflow. |
| **`parseDevice` called once per request** | In `auth.ts` login handler, `parseDevice` is called once before all failure/success branches — esbuild treats duplicate `const` declarations as a build error. |
| **`isLoading = liveLoading || !offlineChecked`** | In `use-auth.tsx`, uses `||` not `&&` — prevents auto-logout on page refresh when offline check completes before live fetch. |
| **LoadingScreen timeout phases** | `AuthProvider` exposes `loadingPhase: "loading" \| "slow" \| "timeout"`. After 4 s → `"slow"` (message updates). After 12 s → `"timeout"` (spinner stops, Retry button shown, `offlineChecked` forced true to unblock `isLoading` and allow redirect to login). |
| **Users page consolidates Cash Overview** | The old `/users-overview` route redirects to `/users`. Cash Overview is the 4th tab inside `users.tsx`. `users-overview.tsx` no longer exists. |
| **`DELETE /sessions/all` returns `{ redirect: true }`** | Frontend checks this flag and calls `logout()` to clear client-side auth state before redirecting to login. |
| **`willChange: transform` on ancestor breaks `position: fixed`** | The page-transition `motion.div` in `App.tsx` must have no `willChange: transform` or active CSS transform. When a parent has `willChange: transform`, it creates a new CSS containing block for `position: fixed` children, causing them to position relative to that div instead of the viewport. The bottom nav's `fixed bottom-0` CSS is correct — never add `willChange: transform` to any ancestor. Framer Motion handles GPU compositing for `opacity`/`y` without an explicit hint. |
| **`connect-pg-simple` must be in esbuild `external`** | `connect-pg-simple` reads `table.sql` from `node_modules` at runtime via `path.join(__dirname, 'table.sql')`. When bundled by esbuild the path breaks and sessions silently fail. Listed in `build.mjs` `external` array — do not remove it. |
| **Login sets auth cache via `setQueryData`** | After a successful login, `use-auth.tsx` calls `queryClient.setQueryData(["auth/me"], userData)` directly from the login response body. No separate `/api/auth/me` refetch is needed or performed. Doing a refetch instead causes a race condition through the Replit proxy (cookie not yet forwarded → 401 → user reset to null → redirect cancelled). |
| **`login.tsx` redirect guard** | A `useEffect` in `login.tsx` watches the `user` value and calls `setLocation("/")` as soon as it becomes truthy. This ensures redirect works on both fresh login and browser back-navigation to the login page when already authenticated. |
| **AePS sessions are per-user** | `aeps_daily` unique constraint is `(date, created_by)` — each user has their own daily session, unlike the previous single-session-per-day model. |
| **TWA assetlinks.json** | Update `public/.well-known/assetlinks.json` with your Android `package_name` and `sha256_cert_fingerprints` before submitting to Google Play. |

---

## 14. Replit Environment

### Port Map

| Local Port | External | Used by |
|------------|----------|---------|
| `5000` | `:80` | Vite frontend (main app URL — `Start application` workflow) |
| `8082` | `8082` | Express API server (`Start application` workflow) |
| `8080` | `8080` | **Held by Replit artifact workflow** — do not use for the API |
| `8081` | `8081` | Mockup sandbox canvas preview server |
| `21700` | — | Replit artifact `sahu-csc: web` auto-workflow — not used for main app |

### Workflow Architecture

The `Start application` workflow is the **only** workflow that should be used for normal development. It runs both API and frontend in a single shell command:

```bash
fuser -k 5000/tcp 2>/dev/null; fuser -k 8082/tcp 2>/dev/null
PORT=8082 pnpm --filter @workspace/api-server run dev &
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run dev
```

Replit auto-creates separate artifact workflows (`artifacts/api-server: API Server`, `artifacts/sahu-csc: web`) — these can cause port conflicts. The `Start application` workflow kills stale processes on 5000 and 8082 at startup to prevent conflicts.

### Session Store — Critical Fix (June 2026)

**Problem:** `connect-pg-simple` was configured with `conString: process.env.DATABASE_URL`. This creates a **separate, internal pg Pool** that fails silently in the Replit environment — sessions were never written to the DB, so every request after login returned 401 "Not authenticated".

**Symptom:** Login returned 200 with user data; immediately after, `/api/auth/me` returned 401. The `session` table had 0 rows even after login.

**Fix applied to `artifacts/api-server/src/app.ts`:**
```ts
import { pool } from "@workspace/db";

store: new PgSession({
  pool,                     // shared pool — reuses existing working connection
  tableName: "session",
  createTableIfMissing: true, // auto-creates session table if missing
  pruneSessionInterval: 3600,
})
```

The `session` table was also created manually on first deploy:
```sql
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX "IDX_session_expire" ON "session" ("expire");
```

With `createTableIfMissing: true` this is now handled automatically on server startup.

### IndexedDB Stores (v2, offline-db.ts)

| Store | Purpose | Expiry |
|-------|---------|--------|
| `pending_ledger` | Offline ledger entries queued for sync | Cleared after successful sync |
| `cache_store` | Generic KV cache (dashboard data, etc.) | Configurable TTL (default 5 min) |
| `user_session` | Cached auth session for offline login | 24 hours |
| `cached_reports` | Previously generated reports | Configurable |
| `pending_notifications` | Notifications queued offline | Cleared when read |

### Common Troubleshooting

| Problem | Fix |
|---------|-----|
| 502 Bad Gateway | Server still starting (~15–20s). Restart `Start application`, wait before testing. |
| Login fails "Invalid credentials" | DB may be empty after schema push. Run `Seed Database` workflow. |
| `relation "session" does not exist` | Session table missing. Restart `Start application` (auto-creates via `createTableIfMissing: true`). |
| Login succeeds but stays on login page | Session not persisting — check API logs for session store errors. Restart `Start application`. |
| Stale UI / old JS bundle | Clear service worker: DevTools → Application → Storage → Clear site data. |
| Push notifications break on restart | VAPID keys not in Replit Secrets — set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` as secrets. |
| Port already in use (`EADDRINUSE`) | `fuser -k 5000/tcp; fuser -k 8082/tcp` then restart `Start application`. |
