# SAHU CSC — Common Service Center Management Platform
**Version 2.3.0** — last updated 2026-06-21

A full-stack CSC (Common Service Center) business management platform for tracking services, ledger accounting, AePS cash management, Udhari Khata (customer credit ledger), and reporting. Built for Odisha / India rural service centers. Supports PWA installation, offline operation, and Android TWA packaging.

---

## Workflows

| Workflow | Command | Port | Purpose |
|----------|---------|------|---------|
| `Start application` | Runs API (8082) + Frontend (5000) together | 5000 → :80 | **Main workflow — use this** |
| `Seed Database` | `pnpm --filter @workspace/api-server run seed` | — | Seed/reseed sample data; **always resets admin + operator passwords** to defaults (one-shot, exits when done) |

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
      udhari.ts     — Udhari Khata CRUD: customers + entries + summary; requirePermission enforced on all routes
      receipts.ts   — Public receipt verify endpoint: GET /api/receipts/verify/:token (no auth required)
      health.ts
    lib/
      auth.ts       — requireAuth / requireRole / requirePermission middleware; parseDevice with deviceType
      logger.ts     — Pino structured logger
      notify.ts     — Auto-create notifications helper
      push.ts       — web-push send helpers (sendPushToUser, sendPushToAll)
      vapid.ts      — VAPID key auto-generation on startup
    scripts/
      seed.ts       — Database seeder (users, services, settings, notifications) — no ledger entries seeded
      backup.ts     — pg_dump backup to /backups/
      restore.ts    — psql restore from backup file

  sahu-csc/src/
    pages/
      login.tsx           — Mobile: navy header + white card, "Register here" CTA, "Trusted. Secure. Reliable." footer
      register.tsx        — Mobile: LoginLogo header + white card, PasswordStrength meter, security badge
      forgot-password.tsx / reset-password.tsx
      dashboard.tsx       — Real-time stats + offline cache fallback + Udhari summary card
      ledger.tsx          — Transactions with offline queue support
      aeps.tsx            — AePS cash management (per-user)
      udhari.tsx          — Udhari Khata customer list: search, sort, To Collect / To Pay banner, FAB
      udhari-customer.tsx — Per-customer ledger: balance banner, You Gave/You Got, entry list, WhatsApp reminder, PDF export
      services.tsx
      reports.tsx         — Command Center design (v2.2): horizontal top nav bar, navy KPI strip, 2-col chart grid, Print Report + Excel export; MobileReports unchanged
      notifications.tsx
      profile.tsx         — Unified Profile + Settings page (v2.3): Desktop V3 sticky side-nav + full-page scroll; Mobile V3 iOS drill-in. Sections: Photo, Personal Info, Security, Sessions, Preferences, Business Info (admin), System (admin). Replaces separate settings page.
      users.tsx           — User management (admin)
      users-overview.tsx  — Admin overview of all users' ledger/balance (admin)
      audit-logs.tsx      — Full audit trail (admin)
      settings.tsx        — Redirects to /profile (deprecated standalone page)
      backups.tsx         — Backup and restore (admin)
      sessions.tsx        — Standalone sessions page: device cards, revoke, logout others, logout ALL (still accessible at /sessions; sessions also embedded in /profile)
      pwa-status.tsx      — App & Offline Status page (network, sync, storage, push)
      receipts-verify.tsx — Public receipt verification page (/receipts/verify/:token); no auth required
      offline.tsx         — Offline fallback page
      not-found.tsx
    components/
      layout.tsx              — Main sidebar + mobile nav + PWA install banner + sync bar + idle timeout dialog
      sync-status-bar.tsx     — 🟢/🟡/🔴 global sync status indicator
      pwa-install-banner.tsx  — Install prompt banner
      app-logo.tsx            — AppLogo (sidebar) + LoginLogo (auth pages); both use public/sahu-logo.png
      receipt-modal.tsx       — Receipt preview dialog: QR code, Print popup, PDF (html2canvas+jsPDF), Web Share API
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
    udhari.ts             — udhari_customers + udhari_entries tables
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
| `users` | id, username, email, role, active_session_token | role: admin / operator |
| `user_sessions` | sessionId, userId, deviceInfo, browser, os, ipAddress, rememberMe, isActive, expiresAt | V2 multi-device sessions |
| `session` | sid, sess, expire | Express session store (connect-pg-simple, auto-created) — survives server restarts |
| `ledger` | date, credit, debit, balance, created_by, receipt_number, receipt_token | Per-user; running balance computed at insert; receipt_number = CSC-YYYY-NNNN; receipt_token = UUID |
| `receipt_counters` | year (PK), last_count | Atomic sequential counter per year for receipt numbering |
| `aeps_daily` | date, opening_balance, created_by | Unique per (date, created_by) |
| `aeps_transactions` | session_id, amount, type | Linked to aeps_daily session |
| `udhari_customers` | id, name, phone, address, balance, created_by | Per-user customer list; balance auto-recalculated on entry change |
| `udhari_entries` | id, customer_id, date, type (gave/got), amount, note, created_by | Individual credit/debit entries per customer |
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
- **Account locking**: After **5 failed login attempts**, account is locked for **15 minutes**.
- **Auto-unlock**: If lock window has expired, account is automatically unlocked on next login attempt.
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
| `GET /api/udhari/summary`, `GET /api/udhari/customers`, `GET /api/udhari/customers/:id`, `GET /api/udhari/customers/:id/entries` | `udhari:view` |
| `POST /api/udhari/customers`, `PATCH /api/udhari/customers/:id`, `DELETE /api/udhari/customers/:id`, `POST/PATCH/DELETE /api/udhari/customers/:id/entries/*` | `udhari:manage` |

**Built-in role permissions:**

| Role | Permissions |
|------|------------|
| `admin` | `["*"]` — all permissions |
| `operator` | `ledger:view`, `ledger:create`, `ledger:edit`, `aeps:view`, `aeps:manage`, `reports:view`, `reports:export`, `services:view`, `profile:view`, `notifications:view`, `udhari:view`, `udhari:manage` |
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
| `udhari.customer.create` | New Udhari customer added |
| `udhari.customer.update` | Udhari customer details updated |
| `udhari.customer.delete` | Udhari customer (and all entries) deleted |
| `udhari.entry.create` | New You Gave / You Got entry recorded |

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
| Udhari customers & entries | ✅ |

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
- **Mobile header design language (v2)**: The mobile header (`md:hidden` block in `layout.tsx`) uses a 3-layer structure: (1) 3px gradient accent stripe (navy `#0b2c60` → saffron `#f97316`), (2) white frosted main bar (60px, `bg-white`, box-shadow) with a navy rounded-square CSC badge logo + two-tone "SAHU" (navy) / "CSC" (saffron) brand text on the left; bell button + avatar chip on the right, (3) navy gradient greeting sub-bar (44px, `linear-gradient(135deg, #0b2c60, #0f3872)`) showing time-based greeting + short date. The avatar chip replaces the old hamburger icon and opens the `Sheet` nav drawer — do not add a separate hamburger. `firstName`, `greeting`, `greetingEmoji`, and `shortDate` are computed inside the `Layout` component.
- **Mobile dashboard card design language**: Stat cards use a 3px colored top accent stripe (`s.accent` gradient) + white `bg-white` card body with `box-shadow` instead of a Tailwind `border`. Icon badges use `s.iconGradient` (CSS gradient) with a matching colored `box-shadow` drop shadow. Quick action cards are white rounded-2xl cards with gradient icon badges (42px, borderRadius 13) and navy label text. Never use flat `bg-*` Tailwind backgrounds for icon badges in these cards — always use `background: gradient` inline style so the gradient renders correctly.
- **Forgot-password is a merged 4-step page**: `/forgot-password` covers the entire reset flow — identifier → OTP → new password → success. `/reset-password` simply redirects to `/forgot-password`. Do not split the flow back into two pages.
- **Unified Profile + Settings page (v2.3)**: `/profile` is now the single unified page for all user and admin settings. It replaces the separate `/settings` page — `settings.tsx` now simply redirects to `/profile`. Desktop uses **V3 design**: a sticky `144px` left side-nav with anchor `href="#s-<id>"` links (scroll-margin-top 72px) and full-page scroll content sections. Mobile uses **V3 iOS drill-in**: avatar summary + tappable section rows with chevrons on the home screen; tapping drills into an inline detail view with a Back button. Sections visible to all users: Photo, Personal Info, Security, Sessions, Preferences. Admin-only sections (flagged with "Admin" badge in desktop side-nav): Business Info, System. Sessions are embedded inside the Security drill-in on mobile and appear as a dedicated scroll section on desktop.
- **Sessions embedded in profile (v2.3)**: The full session management UI (stats strip, current device card, other-device list with Revoke buttons, Logout Others / Logout All banners, 3 confirmation dialogs) is embedded directly in `/profile`. The standalone `/sessions` page still exists and remains accessible for direct links; it is not removed. Sessions auto-refresh every 30 seconds in both locations.
- **Profile desktop V3 side-nav anchor pattern**: Desktop side-nav links use plain `<a href="#s-photo">` anchors (not `useLocation` or router navigation) so the page never re-mounts. `scrollMarginTop: 72` on each section block offsets for the sticky app header. Active link tracking via `activeAnchor` state updated `onClick`. Never use `position: sticky` with `top: 0` on the nav — use `top: [72px]` (height of the app header) so the nav clears the header when scrolled.
- **Password reset accepts username/email/mobile**: `POST /api/auth/send-otp { identifier, purpose: "password_reset" }` resolves the identifier to an email server-side via `OR` query on username/email/mobile columns. Returns `{ maskedEmail }`. The frontend never needs to know the actual email — it re-sends `identifier` to `verify-otp` which resolves internally. For `registration` purpose, `email` is still required.
- **OTP resend timer is 120 seconds everywhere**: Both `forgot-password.tsx` and `register.tsx` use `RESEND_COOLDOWN = 120`. Do not change to 60.
- **send-otp silent success on unknown identifier**: For `password_reset`, if the identifier does not resolve to an active account, `send-otp` returns HTTP 200 with `{ maskedEmail: null }` — never 404. This prevents account enumeration. The frontend always advances to the OTP step regardless.
- **verify-otp resolves identifier internally**: `POST /api/auth/verify-otp { identifier, otp, purpose: "password_reset" }` performs the same username/email/mobile lookup as `send-otp`, then checks the `email_otps` table. The frontend never sends the raw resolved email.
- **Udhari balance recalculated server-side**: After every entry insert, update, or delete, `recalcBalance(customerId)` runs a `SUM` query over all entries for that customer and writes the result back to `udhari_customers.balance`. Never trust a client-supplied balance.
- **Udhari balance sign convention**: `balance > 0` = customer owes you (orange "To Collect"); `balance < 0` = you owe the customer (green "To Pay"); `balance = 0` = settled. The `type` field is `"gave"` (you gave credit → customer owes more) or `"got"` (you received payment → balance decreases).
- **Udhari dashboard card is conditionally rendered**: `UdhariSummaryCard` returns `null` when `totalCustomers === 0` and both totals are zero — it only appears once the first customer is added.
- **Seed script does not seed ledger entries**: As of v2, `seed.ts` seeds only users, services, settings, and notifications. Ledger starts clean. Running the seed on a fresh DB will not populate any ledger rows.
- **Receipt number is atomic via `receipt_counters`**: `POST /api/ledger` uses a Drizzle `INSERT … ON CONFLICT DO UPDATE SET last_count = last_count + 1 RETURNING last_count` on `receipt_counters(year)` to generate collision-safe sequential numbers even under concurrent inserts. Year is derived from the transaction `date` field, not the wall clock, so a backdated entry increments the correct year's counter.
- **Receipt token is a UUID, not sequential**: `receipt_token = crypto.randomUUID()` is stored on the ledger row. The QR code encodes `https://domain/receipts/verify/<uuid>` — the sequential receipt number is never in the URL, preventing enumeration of all receipts.
- **`GET /api/receipts/verify/:token` is fully public**: No `requireAuth` — customers can scan the QR code without an account. The response exposes only: `receiptNumber`, `date`, `customerName`, `serviceType`, `credit`, `debit`, `description`, `createdByName`, `createdAt`, `businessName`. Never exposes `balance`, `createdBy` (user ID), or any account data.
- **Receipt schema applied via raw SQL, not drizzle-kit push**: `drizzle-kit push` requires an interactive TTY and is not safe for non-interactive environments. `receipt_number`, `receipt_token` columns and the `receipt_counters` table were applied via `ALTER TABLE … ADD COLUMN IF NOT EXISTS` and `CREATE TABLE IF NOT EXISTS` direct SQL. Always use this approach for schema changes in automated/non-TTY contexts.
- **Receipt PDF is client-side**: `html2canvas` captures the receipt DOM element at `scale: 2`; `jsPDF` renders it as A5. This keeps the backend stateless — no server memory overhead for PDF generation. The PDF filename is the receipt number (e.g. `CSC-2026-0001.pdf`).
- **Receipt modal and verify page share identical design**: `ReceiptModal` (shown in-app) and `receipts-verify.tsx` (public QR scan target) render the same visual receipt — navy header, orange receipt number, green "VERIFIED" badge (only when `receiptToken` is present), colored amount block, detail rows, QR section, business contact footer. Always keep both in sync when changing receipt design.
- **`businessWebsite` is a settings key-value, no migration needed**: Added to `DEFAULT_SETTINGS` in `settings.ts` and the website input to `settings.tsx`. The settings table is a generic key-value store — new keys only need to be added to `DEFAULT_SETTINGS` and `formatSettings`. No schema migration required.
- **Always use CSS for responsive layout, not JS `isMobile`**: `useIsMobile()` / `useDevice()` hooks have a render-before-measure delay that causes layout flicker (the wrong layout renders first, then switches). Always use Tailwind responsive classes (`sm:hidden` / `hidden sm:block`) so the correct layout renders on first paint. The only exception is cases where a behavior difference (not just layout) is required on mobile.
- **Udhari mutation cache invalidation pattern**: Every Udhari mutation (create/update/delete entry, create/update/delete customer) must call `qc.invalidateQueries` on all affected query keys. For entry mutations: `/api/udhari/customers/${id}/entries`, `/api/udhari/customers/${id}` (balance changes), `/api/udhari/customers` (balance shown on list), `/api/udhari/summary`. For customer mutations: `/api/udhari/customers`, `/api/udhari/summary`. Missing any key causes the UI to show stale data until the next background refetch.
- **Mobile FAB must clear the bottom nav**: Fixed FABs on mobile should use `bottom-20` (80px), not `bottom-6` (24px). The bottom nav bar is ~64px tall; `bottom-6` places the FAB behind it.
- **Notification `null` userId = true broadcast only**: Every call to `createNotification` without a `userId` produces a row with `userId = null`. The `userScope` helper includes `OR userId IS NULL`, so it appears in **every** user's feed. This is intentional for admin-broadcast-only events triggered from the admin broadcast endpoint. All other call sites must pass an explicit `userId`. Never omit it for user-specific or admin-specific events.
- **Notification isolation — known violations fixed (v2.1.0)**: Seven isolation bugs were patched: (1) unknown-identifier failed login created a null-userId broadcast → removed; (2) `notifyNewRegistration` broadcast to all users → now queries admin user IDs and creates one notification per admin; (3) "Registration Setting Changed" was null userId → scoped to the acting admin's userId; (4) "User Approved" was null userId → scoped to the approved user's ID; (5–6) backup created/restored were null userId → scoped to `req.session.userId!`; (7) push unsubscribe had no user ownership check → now requires `AND userId = currentUser` on the delete.
- **`notifyNewRegistration` queries admin IDs internally**: In `notificationTemplates.ts`, `notifyNewRegistration` does a DB query for all `role = 'admin'` users and creates a per-admin notification. Call it only once per registration event — it fans out internally.
- **`createSystemNotification` broadcasts only to active users**: When called without `userIds`, it filters `WHERE isActive = true AND status = 'ACTIVE'` — never delivers to deleted/suspended/pending accounts.
- **Push unsubscribe is owner-only**: `DELETE /api/push/unsubscribe` deletes only where `endpoint = :endpoint AND userId = currentUser`. A user cannot unsubscribe a different user's device even if they know the endpoint URL.
- **React Query cache is fully cleared on logout**: `handleLogout` in `use-auth.tsx` calls `queryClient.clear()` — all cached data (including notification counts) is wiped. Switching accounts never shows stale unread counts from the previous session.
- **Rejected user sees reason on next login attempt**: When a PATCH `/admin/users/:id/reject` is called, two things happen: (1) a "Registration Declined" notification is written to the DB scoped to the rejected user's ID; (2) on the next login attempt the auth route checks `user.status === "DELETED"` and returns `{ rejected: true, rejectionReason }` in the 401 response. `login.tsx` handles `err?.rejected` with a distinct "Registration Declined" toast showing the reason. This ensures the user always sees the reason even if they can't access their notification feed.
- **Reject dialog tells admin the reason reaches the user**: The "Decline Registration" dialog in `users.tsx` includes the helper text "This reason will be shown to the user when they next try to log in." so admins know the field is not just for internal records.
- **AePS opening balance uses a hero card, not a stat card**: The opening balance in `aeps.tsx` is rendered as an `OpeningBalanceHeroCard` — a full-width navy gradient card (navy → indigo, saffron top stripe) with a 44px amount, notes pill, and mini-stats row (date / session / txn count). It replaces the flat navy `StatCard`. The "Edit" button on the card pre-fills `openForm` and opens `showOpenDialog`. Never put opening balance back into the stat-card grid — it deserves prominent visual weight.
- **AePS Set/Edit dialog has quick-amount chips**: `OPEN_QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000, 50000]` are rendered as tap-to-fill buttons below the amount input. The dialog header is a navy gradient with a saffron Wallet icon. Title switches between "Set Day Opening Balance" and "Edit Opening Balance" based on whether `session` already exists.
- **AePS balance formula is a visual chip bar**: The plain text formula (`₹OB − ₹WD + ₹DEP = ₹BAL`) is replaced with a white card containing color-coded chips — navy for Opening, red for Withdrawn, green for Deposited, and a bold green/red Balance chip. Operator/minus/plus/equals symbols separate the chips at 18px bold.
- **AePS mobile entry form — account number is deposit-only**: In `AepsMobileEntry.tsx` the Account Number field is wrapped in `{txType === "deposit" && (...)}`. It does not appear for withdrawals because AePS withdrawals are Aadhaar-authenticated and don't require the account number. Only deposits may optionally provide it.
- **AePS mobile entry form — Aadhaar masking pattern**: Aadhaar is masked by default showing `XXXX XXXX <last 4>`. While the input is focused (`showAadhaar = true`) the raw grouped value is shown. A 12-dot progress bar beneath the input fills navy (valid) or red (incomplete). The raw digit string is stored in state; the masked display is derived on render — never store the masked string.

---

## Mockup Sandbox

Design exploration lives in `artifacts/mockup-sandbox/`. Each group is a folder under `src/components/mockups/`. The preview server runs on port 8081 — URL pattern: `https://<domain>/__mockup/preview/<group>/<ComponentName>`.

| Group | Component | Viewport | Description |
|-------|-----------|----------|-------------|
| `aeps-mobile-entry` | `AepsMobileEntry` | 390×844 (mobile) | Mobile AePS Withdrawal/Deposit entry form — customer name, Aadhaar (masked + progress bar), bank dropdown, amount + quick chips, account number (deposit-only), 3-step flow: form → confirm → success |
| `aeps-page` | `AePS` | 390×844 (mobile) | Mobile AePS daily session — redesigned Opening Balance hero card (navy gradient, edit mode, notes, mini stats), visual formula bar, date nav, transaction list |
| `aeps-desktop` | `AePS` | 1280×800 (desktop) | Desktop AePS with sidebar, stat cards, tabbed transaction table |
| `aeps-entry-form` | `AepsEntry` | 900×620 (desktop) | Side-by-side Withdrawal + Deposit entry forms with quick-amount buttons, validation, and success state |
| `ledger-desktop` | `Ledger` | 1280×800 (desktop) | Desktop Ledger with sidebar, stat cards, filter bar, full table with receipt numbers |
| `udhari-desktop` | `Udhari` | 1280×800 (desktop) | Desktop Udhari Khata — two-panel layout: customer list + per-customer detail/entry ledger |
| `addentry` | `AddEntryForm` | — | Ledger add entry form |
| `aeps` | `AepsEntryForm`, `AepsPage` | — | Earlier AePS entry form variants |
| `ledger` | `LedgerPage` | — | Earlier ledger page variant |
| `receipt` | `ReceiptDesign` | — | Receipt card design |
| `sahu-csc` | `Desktop`, `Mobile`, `Tablet`, `Login`, `Register` | — | Full-app layout variants |
| `sahu-header` | `Minimal`, `MobileNew`, `Modern` | — | Header design variants |
| `udhari` | `UdhariForm` | — | Udhari entry form |

**Mockup sandbox workflow:** `artifacts/mockup-sandbox: Component Preview Server` (port 8081). The `.generated/mockup-components.ts` file is auto-maintained — add imports there when adding new groups. All mockup components are fully self-contained with mock data (no API calls).

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-20 | **AePS opening balance redesign (live app)**: Replaced flat navy stat card with `OpeningBalanceHeroCard` — full-width navy gradient card showing ₹ amount at 44px, session notes pill, and mini-stats row (date / active / txn count). Balance formula bar replaced with visual color-coded chip tiles (Opening − Withdrawn + Deposited = Balance). Set/Edit dialog redesigned with navy gradient header, 60px rupee input, and ₹500–50K quick-amount chips. Dialog title auto-switches based on whether a session already exists. |
| 2026-06-20 | **Mobile AePS entry form mockup** (`aeps-mobile-entry/AepsMobileEntry`): 3-step form flow — (1) form: amount + quick chips, customer name, Aadhaar (masked, 12-dot progress bar, eye toggle), bank dropdown (10 banks), account number (deposit-only), note; (2) confirm: summary card with masked Aadhaar, warning to verify before saving; (3) success: receipt-style card with Print/Share and New Transaction actions. |
| 2026-06-20 | **AePS mobile page mockup — opening balance redesign**: `aeps-page/AePS.tsx` updated with new `OpeningBalanceCard` component — navy gradient hero card, inline edit mode (input + cancel/save buttons with validation), session notes pill, mini stats row. Visual `BalanceFormula` bar replaces plain text. Session start marker in transaction list replaces plain "OB" badge row. |
| 2026-06-20 | **Design mockups**: Created desktop redesign mockups for Ledger, AePS, and Udhari Khata pages on the canvas. Added desktop AePS Withdrawal/Deposit entry form mockup with quick-amount buttons, field validation, and success state. All mockups live in mockup sandbox at `/__mockup/preview/*`. |
| 2026-06-19 | **v2.1.0** — **Reject-with-reason notification**: When an admin declines a registration, a "Registration Declined" notification is sent to the rejected user's ID. On the user's next login attempt, `auth.ts` returns `{ rejected: true, rejectionReason }` in the 401 — `login.tsx` shows a distinct "Registration Declined" toast with the reason text so the user sees exactly why they were turned away, even without access to their notification feed. Reject dialog updated to "Decline Registration" with helper text explaining the reason goes to the user. |
| 2026-06-18 | **v2.1.0** — **Notification isolation audit & fixes**: Full audit of notification creation, fetching, push targeting, and cache scoping. 7 bugs fixed: (1) unknown-identifier login created a null-userId broadcast notification → removed; (2) `notifyNewRegistration` broadcast to all users → now per-admin; (3) "Registration Setting Changed" null-userId → scoped to admin; (4) "User Approved" null-userId → scoped to approved user; (5–6) backup created/restored null-userId → scoped to acting admin; (7) push unsubscribe had no ownership check → added `AND userId = currentUser`. `createSystemNotification` now filters to `isActive=true AND status='ACTIVE'` only. All fetch/count/delete queries confirmed correctly scoped via `userScope(userId)`. `queryClient.clear()` on logout confirmed. |
| 2026-06-18 | **v2.1.0** — **Receipt modal redesign**: `ReceiptModal` and public `/receipts/verify/:token` page both updated to match a professional receipt format — navy branded header ("SAHU CSC CENTER"), orange receipt number, green "VERIFIED" badge (only when `receiptToken` present), colored amount block with checkmark, detail rows, QR code section, business contact footer (📍 address, 📞 mobile, 🌐 website), navy footer bar. Business address/phone/website now returned by `GET /api/receipts/verify/:token` from the settings table. New `businessWebsite` field added to `DEFAULT_SETTINGS` and `settings.tsx` form. |
| 2026-06-18 | **v2.1.0** — **Udhari Khata instant updates**: Fixed cache invalidation bug where new customers and entries only appeared after a manual page refresh. All mutations (create entry, update entry, delete entry, update customer, delete customer, create customer) now call `qc.invalidateQueries` on the exact affected keys: `/api/udhari/customers/${id}/entries`, `/api/udhari/customers/${id}`, `/api/udhari/customers`, `/api/udhari/summary`. UI is always in sync with the server immediately after any change. |
| 2026-06-18 | **v2.1.0** — **Responsive layout fixes**: `udhari.tsx` — replaced JS `isMobile` hook with pure CSS (`sm:hidden` / `hidden sm:block`), eliminating layout flicker and hydration delay. Mobile FAB positioned at `bottom-20` (above bottom nav). `notifications.tsx` — header stacks on mobile (`flex-col sm:flex-row`), buttons use `flex-1` on mobile, text uses `min-w-0`/`truncate`/`break-words` to prevent overflow, tabs scroll horizontally with `flex-shrink-0`. |
| 2026-06-18 | **Receipt & PDF module**: Every new ledger entry gets a sequential `CSC-YYYY-NNNN` receipt number (atomic counter via `receipt_counters` table) and a UUID `receipt_token`. `ReceiptModal` component: navy/saffron themed receipt card with QR code, Print popup (A5), PDF download (html2canvas + jsPDF), Web Share API. Public verify page at `/receipts/verify/:token` — no auth required, branded, scannable by customers. New `receipts.ts` API route (`GET /api/receipts/verify/:token`). Schema: `receipt_number` + `receipt_token` columns added to `ledger`; new `receipt_counters` table. OpenAPI spec + Orval codegen updated. |
| 2026-06-18 | **v2.0.0** — **Udhari Khata module**: Full customer credit ledger — `udhari_customers` + `udhari_entries` DB tables, Express CRUD routes, OpenAPI spec, Orval-generated React Query hooks, customer list page (`/udhari`), per-customer ledger page (`/udhari/:id`), "You Gave"/"You Got" entry buttons, WhatsApp reminder, PDF/print export, dashboard summary card, `HandCoins` nav icon. Permissions: `udhari:view` + `udhari:manage`. Seeded demo ledger entries removed — ledger starts clean. Version bumped to 2.0.0. |
| 2026-06-17 | **Merged forgot-password flow**: `/forgot-password` is now a single 4-step page (identifier → OTP → new password → success). `/reset-password` redirects to it. Accepts username, email, or mobile as identifier. OTP resend timer raised to 120s on both forgot-password and register pages. |
| 2026-06-16 | **Mobile header v2**: Replaced flat navy bar with 3-layer frosted design — gradient accent stripe, white main bar, navy greeting sub-bar. Avatar chip replaces hamburger to open nav drawer. |
| 2026-06-16 | **Dashboard mobile cards v2**: Stat cards upgraded with gradient accent stripe + gradient icon badge + shadow. Quick actions upgraded to white card + gradient icon badge pattern. |

---

## Product Features

| Feature | Description | Access |
|---------|-------------|--------|
| **Dashboard** | Today's stats, running balance, recent transactions, top services, Udhari summary card | All users |
| **Udhari Khata** | Customer credit ledger — customer list, per-customer balance, "You Gave"/"You Got" entries, WhatsApp reminder, PDF/print export | All users |
| **Ledger** | Double-entry ledger with running balance, filters, pagination, offline entry, Excel export, receipt generation (CSC-YYYY-NNNN), QR-linked PDF receipt, print, Web Share | All users |
| **AePS Cash** | Daily AePS session tracking with transactions, opening/closing balance | All users |
| **Services** | 22 pre-seeded CSC services across 5 categories; admin can add/edit | All / Admin |
| **Reports** | Daily & monthly bar charts, service breakdown pie chart, Excel export, cached offline | All users |
| **Notifications** | Auto-created on key events (login, failed login, backup, system); read/unread tracking | All users |
| **Profile** | Profile photo, bio, address, password change, push notification toggle | All users |
| **Active Sessions** | View all devices, revoke individual sessions, logout other devices, logout everywhere | All users |
| **App & Offline** | Network status, sync queue, storage usage, install status, push notifications, device caps | All users |
| **Server Health** | Live API server status, DB connection + latency, VAPID key status, memory & CPU — at `/server-health` | Admin only |
| **Users / Cash Overview** | User management + Cash Overview tab: all users' ledger balances (admin) | Admin only |
| **User Management** | Create/edit/deactivate users, change roles (role changes are audit-logged) | Admin only |
| **Audit Logs** | Full audit trail including login failures, role changes, session events, all admin actions | Admin only |
| **Settings** | Business info, language, theme, auto-backup config | Admin only |
| **Backups** | Manual pg_dump backups, restore from file | Admin only |
| **Registration** | Self-registration form with password strength meter, security badge, links to login | Public |
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
- Seed script uses `onConflictDoNothing()` — safe to run multiple times. Ledger entries are **not** seeded (removed in v2.0.0) — ledger starts clean.
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
- **LoadingScreen has a 3-phase timeout**: `AuthProvider` exposes `loadingPhase: "loading" | "slow" | "timeout"`. After 4 s → "slow" (message changes). After 12 s → "timeout" (spinner stops, Retry button shown, `offlineChecked` forced `true` to unblock redirect to login). Forcing `offlineChecked` at timeout is intentional — it ensures the app does not hang forever if the API never responds.
- **Login page `h-screen` must not be changed to `min-h-screen`**: Both `MobileLogin` and `DesktopLogin` use `h-screen overflow-hidden` to keep all content within the viewport without scrolling. Changing to `min-h-screen` causes the page to scroll on short screens.
- **Responsive table pattern**: For pages with data tables, always render both a mobile card list (`sm:hidden`) and a desktop table (`hidden sm:block`). Do not use `overflow-x-auto` alone as a mobile solution — it produces poor UX on phones. Tables inside dialogs use `overflow-x-auto` with `min-w-[480px]` since the dialog already constrains width.
- **`willChange: transform` on an ancestor breaks `position: fixed`**: The page-transition `motion.div` in `App.tsx` must NOT have `willChange: "opacity, transform"` or any active CSS transform. When a parent has `willChange: transform`, it becomes a new containing block for `position: fixed` children — making them position relative to that div instead of the viewport. The bottom nav has correct `fixed bottom-0` CSS; never add `willChange: transform` to any of its ancestor elements. Framer Motion handles GPU compositing internally without needing an explicit `willChange` hint.
- **Desktop Reports — Command Center layout (v2.2)**: `DesktopReports` uses a full-width column layout: (1) white horizontal top nav bar — brand left, 4 tab links centre, filter controls + Print + Export buttons right; (2) navy KPI strip — 5 metric chips (tab-specific) showing live data from the already-fetched API responses; (3) scrollable `#f1f5f9` content area with 2-column chart grids and data tables. There is no sidebar. `MobileReports` is untouched. The `DESKTOP_TABS` constant holds tab metadata (id, label, Icon, accent, grad). `KpiChip` is a presentational-only component for the navy strip.
- **Reports sparklines use existing monthly data**: The `Sparkline` sub-component in `reports.tsx` (72×28 `LineChart`, no axes/tooltip) reads `monthly.data.dailyBreakdown.slice(-7)` — no extra API call. It is passed into `DesktopStatCard` via `sparkData` / `sparkColor` props and only renders when there are ≥ 2 data points. In Command Center (v2.2) sparklines are on the KPI-strip level (not individual cards) — do not add sparklines back to `DesktopStatCard` usages without re-checking the layout.
- **Print Report — `window.open` approach**: `printReport()` in `DesktopReports` builds a self-contained HTML string (inline `<style>`, A4 `@page`, branded header, KPI strip, tables, navy `summary-box`) and writes it into a new `window.open("", "_blank")`. `win.print()` fires after 400 ms to allow layout paint. This avoids `@media print` conflicts with Tailwind/Vite's dev CSS. The generated HTML adapts per tab: Daily (services table + AePS box), Monthly (daily breakdown table + AePS box), AePS (full day-wise detail table), Services (breakdown table). Never replace with a library-based PDF approach without removing this function first — duplicate print triggers will confuse users.

---

## User Preferences

- Currency: ₹ (Indian Rupee) throughout
- Language support planned: English, Hindi, Odia
- Theme: Light (Navy + Saffron) and Dark mode
- Locale: `en-IN`
