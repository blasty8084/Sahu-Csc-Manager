# SAHU CSC — Common Service Center Management Platform

A full-stack CSC (Common Service Center) business management platform for tracking services, ledger accounting, AePS cash management, and reporting. Built for Odisha / India rural service centers. Supports PWA installation, offline operation, and Android TWA packaging.

---

## Workflows

| Workflow | Command | Port | Purpose |
|----------|---------|------|---------|
| `Start application` | Runs API (8082) + Frontend (5000) together | 5000 → :80 | **Main workflow — use this** |
| `Seed Database` | `pnpm --filter @workspace/api-server run seed` | — | Seed/reseed sample data |

> **Note:** `Start application` runs both the Express API (port **8082**) and the Vite frontend (port 5000) in a single workflow. Port 5000 is mapped to external port 80 (Replit proxy). Always use the `Start application` workflow — do NOT run separate API/frontend workflows as they cause port conflicts.
>
> **Port 8080 is held by a Replit artifact workflow** — the API therefore runs on **8082**. The Vite proxy in `vite.config.ts` already points to 8082.

### Startup command (in `.replit`)
```bash
fuser -k 5000/tcp 2>/dev/null; fuser -k 8082/tcp 2>/dev/null
PORT=8082 pnpm --filter @workspace/api-server run dev &
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run dev
```

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
pnpm --filter @workspace/api-server run dev      # API server (port 8082)
pnpm --filter @workspace/sahu-csc run dev         # Frontend (port 5000)

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
| Session store | connect-pg-simple (PostgreSQL-backed, survives server restarts) |
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
      auth.ts       — Login, logout, session; full audit logging for all failure scenarios
      ledger.ts     — Ledger CRUD (per-user filtered); requirePermission enforced on all routes
      aeps.ts       — AePS daily sessions + transactions; requirePermission enforced on all routes
      reports.ts    — Daily / monthly reports; requirePermission enforced on all routes
      services.ts   — CSC services catalog
      users.ts      — User management (admin only); descriptive audit log for role/status changes
      admin.ts      — Admin oversight: users-overview, per-user ledger, AePS overview
      sessions.ts   — List sessions, revoke by ID, revoke others, revoke ALL (logout everywhere)
      notifications.ts
      audit.ts
      settings.ts
      profile.ts
      preferences.ts
      push.ts       — Push notification subscribe/unsubscribe/list
      password-reset.ts — OTP-based reset; enforces 8+ chars, upper, lower, number
      health.ts
    lib/
      auth.ts       — requireAuth / requireRole / requirePermission middleware; parseDevice with deviceType
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
      login.tsx           — Mobile: navy header + white card, "Register here" CTA, "Trusted. Secure. Reliable." footer
      register.tsx        — Mobile: LoginLogo header + white card, PasswordStrength meter, security badge
      forgot-password.tsx / reset-password.tsx
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
      sessions.tsx        — Active sessions page: device cards, revoke, logout others, logout ALL
      pwa-status.tsx      — App & Offline Status page (network, sync, storage, push)
      offline.tsx         — Offline fallback page
      not-found.tsx
    components/
      layout.tsx              — Main sidebar + mobile nav + PWA install banner + sync bar + idle timeout dialog
      sync-status-bar.tsx     — 🟢/🟡/🔴 global sync status indicator
      pwa-install-banner.tsx  — Install prompt banner
      app-logo.tsx            — AppLogo (sidebar) + LoginLogo (auth pages); both use public/sahu-logo.png
      theme-provider.tsx
      ui/                     — shadcn/ui components
    hooks/
      use-auth.tsx              — Auth context + offline session cache from IndexedDB
      use-network-status.ts     — Online/offline/slow detection + latency probe (30s)
      use-pwa.ts                — Install prompt, badge, periodic sync, share, wake lock
      use-sync.ts               — Sync queue state (pending count, last sync, status)
      use-push-notifications.ts — Push subscription subscribe/unsubscribe
      use-idle-timer.ts         — Auto-logout after 30 min inactivity; 2-min warning; isWarning + remaining + resetTimer
      use-device.tsx
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
    user_sessions.ts      — V2 multi-device sessions (sessionId, userId, deviceInfo, browser, os, ip, rememberMe, isActive, expiresAt)
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
  sahu-logo.png                 — Primary brand logo used by AppLogo + LoginLogo components
  pwa-96x96.png / pwa-144x144.png / pwa-192x192.png / pwa-512x512.png
  apple-touch-icon.png
  .well-known/assetlinks.json   — Digital Asset Links for Android TWA
```

---

## Database Schema — Key Tables

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `users` | id, username, email, role, status, failed_login_attempts, locked_until, rejection_reason | role: admin/operator/user; status: ACTIVE/PENDING/INACTIVE/SUSPENDED/LOCKED/DELETED |
| `user_sessions` | sessionId, userId, deviceInfo, browser, os, ipAddress, rememberMe, isActive, expiresAt | V2 multi-device sessions |
| `session` | sid, sess, expire | Express session store (connect-pg-simple, auto-created) — survives server restarts |
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

## Authentication & Security System (v2)

### Registration Control (Admin Toggle)

Public self-registration can be opened or closed by an admin from the Settings page.

- **Storage**: `settings` table, `key = 'registration_open'`, `value = 'true' | 'false'`
- **Cache**: In-process `Map` in `lib/registration-cache.ts` — TTL 60 s for the flag, 30 s for pending count. Resets on server restart; re-reads DB on miss.
- **Endpoints**:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/settings/registration-status` | Public | `{ open: boolean }` — cached, fallback to DB |
| `PATCH` | `/api/admin/settings/registration` | Admin | Toggle flag + invalidate cache + audit log |

- **Frontend**: `/register` calls the status endpoint first. If `open = false` → shows `register-closed.tsx` full-screen message (form is **never rendered**, even briefly).

### Registration & Approval Flow

New user registrations enter a **PENDING** state and require admin approval before the account can log in.

1. User submits `/register` → `POST /api/auth/register` → user created with `status = 'PENDING'`
2. User redirected to `/register/pending` ("awaiting approval" page)
3. Admin sees red badge on "Users" sidebar item with pending count (polled every 30 s)
4. Admin opens Users → Pending tab → Approve ✅ or Reject ❌ (with optional reason)
5. Approve → `status = 'ACTIVE'` — user can now log in
6. Reject → `status = 'DELETED'` — `rejection_reason` stored — login returns generic 401

**Admin endpoints:**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/users/pending-count` | Admin | `{ count }` — cached 30 s |
| `GET` | `/api/admin/users/pending` | Admin | Paginated list of PENDING users |
| `PATCH` | `/api/admin/users/:id/approve` | Admin | status → ACTIVE + invalidate pending cache |
| `PATCH` | `/api/admin/users/:id/reject` | Admin | `{ reason? }` → status → DELETED |

### User Status System

| Status | Meaning | Login result |
|--------|---------|-------------|
| `PENDING` | Awaiting admin approval | 403 "pending approval" |
| `ACTIVE` | Normal active account | Proceed to password check |
| `INACTIVE` | Disabled by admin | 403 "inactive" |
| `SUSPENDED` | Temporarily blocked | 403 "suspended" |
| `LOCKED` | Auto-locked (5 bad passwords) | 403 "locked, X min remaining" (auto-unlocks when timer expires) |
| `DELETED` | Rejected or removed | 401 generic (no enumeration) |

### Session Management
- **PostgreSQL session store**: `express-session` uses `connect-pg-simple` — session data is stored in the `session` table in PostgreSQL, not in server memory. Sessions survive API server restarts without logging users out.
- **Multi-device sessions**: Each login creates a row in `user_sessions` with device info, IP, browser, OS, and expiry.
- **Session durations**: Standard = 8 hours, Remember Me = 30 days.
- **Session endpoints**:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sessions` | List all active sessions for current user |
| `DELETE` | `/api/sessions/:id` | Revoke a specific session by DB row ID |
| `DELETE` | `/api/sessions/others` | Revoke all sessions except the current one |
| `DELETE` | `/api/sessions/all` | Revoke ALL sessions + destroy current session → redirects to login |

- **V1 compat**: `requireAuth` validates via `user_sessions` first, falls back to legacy `activeSessionToken` on users table.

### Account Security
- **Account locking**: After **5 failed login attempts**, account is locked for **15 minutes** (`locked_until` set in DB).
- **Auto-unlock**: If `locked_until < NOW()` on next attempt, account automatically resets to `ACTIVE` — no admin action needed.
- **Idle timeout**: Frontend automatically logs out after **30 minutes of inactivity**. A warning dialog appears **2 minutes before** expiry with a live countdown and "Stay Logged In" / "Logout Now" options.

### Password Policy
Applies at **registration** and **password reset**:
- Minimum **8 characters**
- At least one **uppercase letter**
- At least one **lowercase letter**
- At least one **number**

### Role-Based Access Control (RBAC)

`requirePermission(permission)` middleware is applied to all data routes:

| Route group | Required permission |
|---|---|
| `GET /api/ledger/*` | `ledger:view` |
| `POST /api/ledger` | `ledger:create` |
| `PATCH /api/ledger/:id`, `DELETE /api/ledger/:id` | `ledger:edit` |
| `GET /api/aeps/*` | `aeps:view` |
| `POST /api/aeps/*`, `PATCH /api/aeps/*`, `DELETE /api/aeps/*` | `aeps:manage` |
| `GET /api/reports/*` (daily, monthly, aeps, service-breakdown) | `reports:view` |
| `GET /api/reports/export` | `reports:export` |
| `GET /api/dashboard` | `reports:view` |

**Built-in role permissions:**

| Role | Permissions |
|------|------------|
| `admin` | `["*"]` — all permissions |
| `operator` | `ledger:view`, `ledger:create`, `ledger:edit`, `aeps:view`, `aeps:manage`, `reports:view`, `reports:export`, `services:view`, `profile:view`, `notifications:view` |
| `user` | `ledger:view`, `reports:view`, `services:view`, `profile:view`, `notifications:view` (read-only) |

### Audit Logging

All security events are logged to `audit_logs` with user ID, IP address, and device info:

| Audit action | When it fires |
|---|---|
| `login.success` | Successful login |
| `login.failed_inactive` | Login blocked — account suspended/deleted/inactive |
| `login.failed_locked` | Login blocked — account currently locked (logs minutes remaining) |
| `login.failed_password` | Wrong password (logs attempt count e.g. `2/5`) |
| `login.failed_max_attempts` | Account just locked after hitting max attempts |
| `logout` | User logged out |
| `session.revoke` | Single session revoked |
| `session.revoke_others` | All other sessions revoked |
| `session.revoke_all` | All sessions revoked (logged out everywhere) |
| `user.create` | Admin created a new user |
| `user.update` | User profile updated |
| `user.role_change` | Admin changed a user's role (logs `old_role → new_role`) |
| `user.delete` | Admin deleted a user |
| `password.reset` | Password successfully reset via OTP |
| `REGISTER_REQUEST` | New user submitted registration form |
| `APPROVED` | Admin approved a pending user |
| `REJECTED` | Admin rejected a pending user (reason in meta) |
| `REGISTRATION_ENABLED` | Admin opened public registration |
| `REGISTRATION_DISABLED` | Admin closed public registration |

### Device Detection (`parseDevice`)

`lib/auth.ts` → `parseDevice(userAgent)` returns:
- `browser`: Chrome, Firefox, Edge, Safari, Opera, Samsung Browser, UC Browser
- `os`: Windows, macOS, Android, iOS, Linux, ChromeOS
- `deviceInfo`: `"Chrome on Windows"` (combined string stored in session)
- `deviceType`: `"mobile" | "tablet" | "desktop"` (derived from UA patterns)

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

- **Page transitions must not use `willChange: transform`**: The Framer Motion page-transition `motion.div` in `App.tsx` uses `style={{ minHeight: "100vh" }}` (no `willChange`). Any `willChange: transform` on an ancestor would create a new containing block for `position: fixed` descendants, breaking the bottom nav's viewport pinning. Framer Motion handles GPU compositing for `opacity`/`y` animations internally — the explicit hint is not needed.
- **Registration open/closed is not a deploy-time setting**: It is a runtime value stored in the `settings` table and toggled by admin from the UI at `/settings`. It is cached in-process for 60 s and re-read from DB on cache miss or server restart.
- **New users register as `PENDING`**: `POST /api/auth/register` always sets `status = 'PENDING'`. `PENDING` users cannot log in (403). An admin must approve them via the Users → Pending tab before they can access the app.
- **Pages use React.lazy — wrap new pages in lazy()**: The initial JS bundle only includes Login, NotFound, and Offline. All other pages are lazy-loaded on first navigation. New pages must be added as `const MyPage = lazy(() => import("@/pages/my-page"))` in `App.tsx`.
- **Contract-first API**: OpenAPI spec → Orval codegen → typed React Query hooks. Never edit `lib/api-client-react/src/generated/` directly.
- **Session-based auth**: express-session + bcrypt. No JWTs — simpler for single-center CSC use case.
- **PostgreSQL session store**: `connect-pg-simple` stores express-session data in the `session` DB table. Sessions survive server restarts — users stay logged in. The table is auto-created by connect-pg-simple on first startup.
- **V2 multi-device sessions**: `user_sessions` table stores every active login. `requireAuth` validates `sessionId` from `user_sessions` first, falls back to `activeSessionToken` on `users` table for backward compat.
- **RBAC via `requirePermission`**: Admin has wildcard `["*"]`; operator has full data permissions; `user` role is read-only. Middleware applied at route level — not just controller logic.
- **Audit log everything security-related**: Every failed login scenario (inactive, locked, wrong password, max attempts), every session revocation, every role change, every admin action is logged with IP + device info.
- **Per-user data isolation**: `getUserFilter()` in ledger/reports/aeps always filters by `userId` — no admin exception for personal data. Admin oversight uses separate `/api/admin/*` endpoints.
- **Money as Drizzle `numeric`**: Returns as string from DB — always `parseFloat()` before returning from routes.
- **Running balance at insert time**: Computed from `SUM(credit) - SUM(debit)` of all prior entries for that user.
- **AePS sessions**: Unique per `(date, created_by)` — each user has their own daily session.
- **Offline-first IndexedDB**: v2 with 5 stores. `pending_ledger` auto-syncs on reconnect via `SyncEngine`. `user_session` enables offline auth for 24 hours.
- **Auth loading guard uses `||`**: In `use-auth.tsx`, `isLoading = liveLoading || !offlineChecked`. Using `&&` caused auto-logout on refresh because the offline check completed before the live fetch, briefly showing the user as unauthenticated.
- **Login sets auth cache via `setQueryData`**: After a successful login, `handleLogin` in `use-auth.tsx` calls `queryClient.setQueryData(["auth/me"], userData)` directly from the login response body — no separate `/api/auth/me` refetch. Doing a refetch causes a race condition through the Replit proxy (cookie not yet forwarded → 401 → user reset to null → redirect cancelled).
- **`connect-pg-simple` must be in esbuild externals**: The package reads `table.sql` via `path.join(__dirname, 'table.sql')` at runtime. When bundled by esbuild the relative path breaks and sessions silently fail to persist. Always keep `"connect-pg-simple"` in the `external` array in `artifacts/api-server/build.mjs`.
- **VAPID auto-init**: `ensureVapidKeys()` called at Express startup; uses env secrets if present, otherwise generates ephemeral keys.
- **Seed script**: Compiled by esbuild alongside the main bundle (`src/scripts/seed.ts` → `dist/scripts/seed.mjs`). Safe to re-run — all inserts use `onConflictDoNothing()`.
- **Idle timeout in Layout**: `useIdleTimer` hook called in `Layout` component (not individual pages) so timeout applies globally across all pages. `handleIdle` callback calls `logout()` directly.
- **`parseDevice` called once per request**: In `auth.ts` login handler, `parseDevice` is called once before all failure/success branches to avoid esbuild duplicate-const errors.
- **Responsive design pattern**: Data-heavy pages use a dual-render approach — mobile cards (`sm:hidden`) and desktop tables (`hidden sm:block`) rendered from the same data. Form grids use `grid-cols-1 sm:grid-cols-2` so fields stack on mobile and sit side-by-side on desktop. Dialog tables use `overflow-x-auto` with `min-w-[480px]` to enable horizontal scroll on narrow screens.
- **Login page uses `h-screen`**: Both mobile and desktop login layouts use `h-screen overflow-hidden` (not `min-h-screen`) so the full page fits the viewport with no scrolling required on any device.
- **Register page uses `h-screen` on mobile**: `register.tsx` mobile layout matches `forgot-password.tsx` — `h-screen overflow-hidden flex flex-col` with compact `LoginLogo` header + `flex-1` white card that `overflow-y-auto` scrolls the form. Desktop uses `min-h-screen`.
- **App logo is `sahu-logo.png`**: Both `AppLogo` (sidebar/header) and `LoginLogo` (auth pages) in `app-logo.tsx` render `public/sahu-logo.png`. Never use inline SVG or text-box placeholders for the brand logo.
- **Login mobile "Register here" card**: A dashed blue CTA card at the bottom of the mobile login white card links to `/register`. Placed after the OTP reset link, before the "Trusted. Secure. Reliable." footer.
- **"Forgot Password?" is navy, not orange**: The link in `LoginFormContent` uses `#0b2c60` (navy) to match the security-focused design language. Do not change it to `#F97316` (saffron).

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
| **Active Sessions** | View all devices, revoke individual sessions, logout other devices, logout everywhere | All users |
| **App & Offline** | Network status, sync queue, storage usage, install status, push notifications, device caps | All users |
| **Server Health** | Live API server status, DB connection + latency, VAPID key status, memory & CPU — at `/server-health` | Admin only |
| **Users Overview** | Admin view of all users' ledger balances and summaries | Admin only |
| **User Management** | Create/edit/deactivate users, change roles (role changes are audit-logged) | Admin only |
| **Audit Logs** | Full audit trail including login failures, role changes, session events, all admin actions | Admin only |
| **Settings** | Business info, language, theme, auto-backup config | Admin only |
| **Backups** | Manual pg_dump backups, restore from file | Admin only |
| **Registration** | Self-registration form (when open) or "Registration Closed" page; PENDING status after submit; approval required before login | Public |
| **Admin Approval** | Pending badge in sidebar, Pending tab in Users page, approve/reject with optional reason | Admin only |
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
- **API port is 8082** (not 8080) — Replit holds 8080 via an artifact workflow. The `Start application` command and the Vite proxy in `vite.config.ts` are already set to 8082.
- **502 on mobile / preview**: Usually means the server is still starting up (takes ~15–20 seconds). Wait for the Replit preview pane to load first, then open the link on your phone. Never use `localhost` on mobile — always use the `.replit.dev` public URL.
- **VAPID key persistence**: `ensureVapidKeys()` now sets `VAPID_KEYS_FROM_ENV=true` when keys come from Replit Secrets — the `/server-health` page uses this flag to show "Persistent" vs "Ephemeral" status.
- **`/api/healthz`** returns full diagnostics (server uptime, memory, DB latency, VAPID status) — no auth required, safe to call from monitoring tools.
- **`parseDevice` must be called once per route handler**: esbuild treats duplicate `const` declarations as a build error. In the login handler, call `parseDevice` once before all failure/success branches.
- **Idle timeout applies globally**: `useIdleTimer` is wired inside `Layout`, so it covers every authenticated page. Do not add it again to individual pages.
- **`DELETE /api/sessions/all` returns `{ redirect: true }`**: The frontend checks this flag and calls `logout()` to clear the client-side auth state and redirect to login.
- **Mobile blank white screen**: `index.html` contains an inline navy loading spinner that is visible before React mounts — prevents blank white page while JS loads on slow mobile connections. The Vite server sends `Cache-Control: no-store` headers to stop browsers from caching stale `index.html`.
- **`pike.replit.dev` URL does not work on mobile**: The dev preview URL only works inside the Replit environment. For a stable mobile-accessible URL, publish/deploy the app — this creates a permanent `*.replit.app` domain.
- **`session` table is auto-created**: `connect-pg-simple` creates the `session` table in PostgreSQL on first API startup — no migration needed. Do NOT drop this table manually or all logged-in users will be immediately logged out.
- **`connect-pg-simple` must NOT be bundled by esbuild**: It reads `table.sql` via `path.join(__dirname, 'table.sql')` at runtime. Bundling breaks that path — sessions silently fail. It is listed in `external` in `artifacts/api-server/build.mjs`. Do not remove it.
- **Login redirect uses `setQueryData`, not refetch**: After login, `use-auth.tsx` sets `queryClient.setQueryData(["auth/me"], userData)` directly from the login response body. A `useEffect` in `login.tsx` then fires `setLocation("/")` when `user` becomes truthy. Never replace this with an invalidate+refetch pattern — the Replit proxy introduces a delay before the session cookie is forwarded, which causes a transient 401 that cancels the redirect.
- **Auth `isLoading` must use `||` not `&&`**: In `use-auth.tsx`, the guard is `isLoading = liveLoading || !offlineChecked`. Using `&&` causes the app to briefly consider the user unauthenticated on page refresh (offline check completes before live fetch), triggering an incorrect logout redirect.
- **Login page `h-screen` must not be changed to `min-h-screen`**: Both `MobileLogin` and `DesktopLogin` use `h-screen overflow-hidden` to keep all content within the viewport without scrolling. Changing to `min-h-screen` causes the page to scroll on short screens.
- **Responsive table pattern**: For pages with data tables, always render both a mobile card list (`sm:hidden`) and a desktop table (`hidden sm:block`). Do not use `overflow-x-auto` alone as a mobile solution — it produces poor UX on phones. Tables inside dialogs use `overflow-x-auto` with `min-w-[480px]` since the dialog already constrains width.
- **`willChange: transform` on an ancestor breaks `position: fixed`**: The page-transition `motion.div` in `App.tsx` must NOT have `willChange: "opacity, transform"` or any active CSS transform. When a parent has `willChange: transform`, it becomes a new containing block for `position: fixed` children — making them position relative to that div instead of the viewport. The bottom nav has correct `fixed bottom-0` CSS; never add `willChange: transform` to any of its ancestor elements. Framer Motion handles GPU compositing internally without needing an explicit `willChange` hint.
- **Registration status is in-memory cached (60 s TTL)**: `GET /api/settings/registration-status` reads from an in-process `Map` cache before hitting the DB. After a server restart the cache is empty and the first request re-reads from the `settings` table — this is intentional. Do not add a layer that bypasses the DB read on cache miss.
- **Pending count cache invalidates on approve/reject**: `admin:pending_approvals` cache key is deleted via `cacheDel()` after every approve or reject action. The sidebar badge will show the accurate count on the next 30-s poll. Do not rely on the cache count being real-time.
- **Registration toggle writes to `settings` table**: The `registration_open` key lives in the same `settings` table used for business name, theme, etc. Do not confuse it with Replit env secrets or a separate config file.
- **All pages are lazy-loaded except Login/NotFound/Offline**: `App.tsx` uses `React.lazy()` for all 18+ pages. Adding a new page requires using `lazy(() => import(...))`, not a static import, to keep the initial bundle small.
- **Vendor chunks are split in production build**: `vite.config.ts` `rollupOptions.output.manualChunks` splits React, Framer Motion, Recharts, TanStack Query, Wouter, and Lucide into separate cached chunks. Do not remove these entries — they are the reason vendor assets are cached independently of app code.

---

## User Preferences

- Currency: ₹ (Indian Rupee) throughout
- Language support planned: English, Hindi, Odia
- Theme: Light (Navy + Saffron) and Dark mode
- Locale: `en-IN`
