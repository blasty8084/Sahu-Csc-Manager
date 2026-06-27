# SAHU CSC — Project Reference v2
**Version 2.7.1 — June 27, 2026**

> This is the authoritative quick-reference for the SAHU CSC platform.  
> For deep architecture detail: `architectureV2.md` · For change history: `changelogV2.md` · For workflow guide: `WORKFLOWS.md`

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Quick Start](#2-quick-start)
3. [Default Credentials](#3-default-credentials)
4. [Tech Stack](#4-tech-stack)
5. [Monorepo Structure](#5-monorepo-structure)
6. [Workflows](#6-workflows)
7. [Environment Variables & Secrets](#7-environment-variables--secrets)
8. [Database Schema — Quick Reference](#8-database-schema--quick-reference)
9. [API Routes — Complete Reference](#9-api-routes--complete-reference)
10. [Frontend Pages Reference](#10-frontend-pages-reference)
11. [Authentication & Security](#11-authentication--security)
12. [Business Modules](#12-business-modules)
13. [Admin Features](#13-admin-features)
14. [PWA & Offline](#14-pwa--offline)
15. [Key Architecture Decisions](#15-key-architecture-decisions)
16. [Common Problems & Fixes](#16-common-problems--fixes)

---

## 1. Project Overview

**SAHU CSC** is a full-stack business management platform for Common Service Centers (CSC) in rural Odisha, India. It runs as a React SPA (port 5000) + Express API (port 8082), backed by PostgreSQL, delivered as an installable PWA.

### Core capabilities

| Domain | Features |
|--------|---------|
| **Ledger** | Per-user income/expense ledger, running balance, `CSC-YYYY-NNNN` receipts, QR verification, offline queue |
| **AePS** | Daily cash float (Aadhaar Enabled Payment System), opening balance, withdrawal/deposit |
| **Udhari Khata** | Customer credit ledger — "You Gave / You Got", WhatsApp reminder, PDF statement |
| **Reports** | Daily / Monthly / AePS / Service breakdown · Excel export · full mobile + desktop redesign |
| **Auth** | Session-based, multi-device (V2), OTP password reset, account locking, idle auto-logout |
| **Admin — Users** | Create/edit/delete users · Pending registrations (bulk approve/reject) · Email notifications |
| **Admin — Sessions** | View + revoke any user's active sessions from User Management → Sessions tab |
| **Admin — Oversight** | Cross-user balance overview, per-user ledger view, AePS overview, audit trail |
| **Admin — Broadcast** | Push notification + email blast to all users · Sent-history log with pagination |
| **Profile** | Unified Profile+Settings page (v2.3) — Personal Info, Security, Sessions, Preferences, Business Info, System |
| **PWA** | Installable, offline-first, push notifications (VAPID), Android TWA |

---

## 2. Quick Start

Run these steps **in order** on a fresh setup:

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Create DB tables from Drizzle schema
pnpm --filter @workspace/db run push

# 3. Seed users, services, settings (use Replit workflow or shell)
pnpm --filter @workspace/api-server run seed

# 4. Start API + frontend together (use "Start application" workflow)
fuser -k 5000/tcp 2>/dev/null; fuser -k 8082/tcp 2>/dev/null
PORT=8082 pnpm --filter @workspace/api-server run dev &
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run dev
```

> ⚠️ Always re-seed after `db push` — schema push can wipe table data.

---

## 3. Default Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | admin |
| `operator` | `operator123` | operator |

---

## 4. Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 · TypeScript 5.9 |
| Frontend | React 19 · Vite 7 · Tailwind CSS v4 · shadcn/ui · Framer Motion · Recharts |
| Backend | Express 5 · express-session · helmet · hpp · express-rate-limit |
| Session store | connect-pg-simple (PostgreSQL-backed — survives restarts) |
| Database | PostgreSQL · Drizzle ORM |
| Validation | Zod v4 · drizzle-zod |
| API contract | OpenAPI 3.1 → Orval codegen → typed React Query hooks |
| Build | esbuild (API) · Vite (frontend) |
| Monorepo | pnpm workspaces |
| PWA | vite-plugin-pwa + Workbox (injectManifest strategy) |
| Push | web-push (VAPID) |
| Email | Nodemailer (SMTP-gated — optional) |

### Theme tokens

| Token | Hex |
|-------|-----|
| Navy (primary) | `#0b2c60` |
| Saffron (accent) | `#f97316` |
| Success green | `#10b981` |
| Danger red | `#ef4444` |
| Purple | `#8b5cf6` |

---

## 5. Monorepo Structure

```
workspace/
├── artifacts/
│   ├── api-server/              Express 5 API  (dev: port 8082)
│   │   ├── src/
│   │   │   ├── app.ts           Middleware stack + session store config
│   │   │   ├── index.ts         HTTP server entrypoint + VAPID init
│   │   │   ├── routes/
│   │   │   │   ├── index.ts                   Router composition
│   │   │   │   ├── auth.ts                    Login / logout / me / register
│   │   │   │   ├── sessions.ts                Per-user multi-device sessions
│   │   │   │   ├── admin.ts                   Admin oversight (users-overview, aeps-overview)
│   │   │   │   ├── admin-registration.ts      Pending registrations — approve / reject / bulk
│   │   │   │   ├── admin-sessions.ts          Admin view + revoke any user's sessions
│   │   │   │   ├── ledger.ts                  Ledger CRUD + balance
│   │   │   │   ├── aeps.ts                    AePS sessions + transactions
│   │   │   │   ├── udhari.ts                  Udhari customers + entries
│   │   │   │   ├── receipts.ts                Public receipt verify endpoint
│   │   │   │   ├── reports.ts                 Reports + dashboard + export
│   │   │   │   ├── users.ts                   User CRUD (admin)
│   │   │   │   ├── profile.ts                 Own profile + avatar
│   │   │   │   ├── preferences.ts             Per-user UI preferences
│   │   │   │   ├── notifications.ts           Notification inbox
│   │   │   │   ├── push.ts                    VAPID push subscription CRUD
│   │   │   │   ├── password-reset.ts          OTP-based reset
│   │   │   │   ├── audit.ts                   Audit log viewer
│   │   │   │   ├── settings.ts                Global settings + backup
│   │   │   │   └── health.ts                  GET /api/healthz
│   │   │   └── lib/
│   │   │       ├── auth.ts      requireAuth / requireRole / requirePermission / parseDevice / auditLog
│   │   │       ├── mailer.ts    Nodemailer SMTP (approval/rejection/admin alert emails)
│   │   │       ├── notify.ts    createNotification helper
│   │   │       ├── logger.ts    Pino structured logger
│   │   │       ├── push.ts      web-push helpers (sendPushToUser, sendPushToAll)
│   │   │       └── vapid.ts     VAPID key auto-generation / env detection
│   │   └── build.mjs            esbuild bundler — connect-pg-simple must stay in externals
│   │
│   ├── sahu-csc/                React + Vite SPA  (dev: port 5000 → ext :80)
│   │   ├── vite.config.ts       Vite + VitePWA (injectManifest) + proxy → 8082
│   │   ├── public/              PWA icons + sahu-logo.png + assetlinks.json
│   │   └── src/
│   │       ├── App.tsx          QueryClient + providers + router (wouter)
│   │       ├── main.tsx         createRoot + registerSW + syncEngine init
│   │       ├── pages/           One file per route (see §10)
│   │       ├── components/
│   │       │   ├── layout.tsx              Sidebar + mobile nav (mobileOnly filtering) + install banner + sync bar + idle timeout dialog
│   │       │   ├── app-logo.tsx            AppLogo + LoginLogo — both use public/sahu-logo.png
│   │       │   ├── sync-status-bar.tsx     🟢/🟡/🔴 global sync status + SyncDot
│   │       │   ├── pwa-install-banner.tsx  Install prompt
│   │       │   ├── receipt-modal.tsx       Receipt QR + Print + PDF + Web Share
│   │       │   └── ui/                    shadcn/ui components
│   │       ├── hooks/
│   │       │   ├── use-auth.tsx            AuthContext + IndexedDB offline session (24h)
│   │       │   ├── use-network-status.ts   Online/offline/slow + 30s latency probe
│   │       │   ├── use-sync.ts             Sync queue state
│   │       │   ├── use-pwa.ts              Install prompt + badge + wake lock + share
│   │       │   ├── use-push-notifications.ts VAPID subscribe/unsubscribe
│   │       │   ├── use-idle-timer.ts       30 min idle → logout; 2 min warning
│   │       │   ├── use-mobile.tsx          Breakpoint hook
│   │       │   └── use-toast.ts            shadcn toast
│   │       └── lib/
│   │           ├── offline-db.ts   IndexedDB v2 (5 stores: pending_ledger, cache_store, user_session, cached_reports, pending_notifications)
│   │           ├── sync-engine.ts  Offline queue; auto-syncs on window.online
│   │           ├── pwa-badge.ts    App Badge API
│   │           └── utils.ts
│   │
│   └── mockup-sandbox/          Canvas component preview server (port 8081)
│
├── lib/
│   ├── db/                      @workspace/db — Drizzle ORM + all schema tables
│   ├── api-spec/                @workspace/api-spec — openapi.yaml (source of truth)
│   └── api-client-react/        @workspace/api-client-react — Orval-generated React Query hooks
│
├── infrastructure/
│   ├── pwa/manifest.json        Full PWA manifest reference
│   └── twa/twa-config.json      Android TWA config (Bubblewrap CLI)
│
├── replit.md                    User preferences + project summary
├── ReplitV2.md                  This file — comprehensive reference
├── architectureV2.md            Deep architecture reference
├── changelogV2.md               Feature changelog (v2.0.0 onward)
├── CHANGELOG.md                 Pre-v2.0 history
└── WORKFLOWS.md                 Workflow guide + troubleshooting
```

---

## 6. Workflows

| Name | Command | Port | Purpose |
|------|---------|------|---------|
| **Start application** ⭐ | `PORT=8082 ... dev & PORT=5000 ... dev` | API: 8082 · Frontend: 5000→:80 | **Primary — use this** |
| **Seed Database** | `pnpm --filter @workspace/api-server run seed` | — | Seed/reseed users, services, settings (one-shot) |
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` | 8080 | Artifact-managed — **holds port 8080**, do not use |
| `artifacts/sahu-csc: web` | `pnpm --filter @workspace/sahu-csc run dev` | 21700→:3000 | Artifact-managed — no API proxy |
| `artifacts/mockup-sandbox: Component Preview Server` | `pnpm --filter @workspace/mockup-sandbox run dev` | 8081 | Canvas UI mockup previews |

> **Port 8080 is permanently held by the artifact workflow.** `Start application` always uses **8082** to avoid the conflict.

### Common commands

```bash
pnpm run typecheck:libs                          # Build lib declarations (run before app typecheck)
pnpm run typecheck                               # Full typecheck all packages
pnpm run build                                   # Typecheck + build all
pnpm --filter @workspace/db run push             # Push schema to DB (re-seed after!)
pnpm --filter @workspace/api-spec run codegen    # Regenerate React Query hooks from OpenAPI spec
```

---

## 7. Environment Variables & Secrets

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Express session signing key |
| `VAPID_PUBLIC_KEY` | Recommended | Web push public key |
| `VAPID_PRIVATE_KEY` | Recommended | Web push private key |
| `VAPID_EMAIL` | Optional | VAPID contact (default: `mailto:admin@sahucsc.in`) |
| `SMTP_HOST` | Optional | Mail server (enables approval/rejection emails) |
| `SMTP_PORT` | Optional | Mail port (default 587) |
| `SMTP_USER` | Optional | SMTP auth username |
| `SMTP_PASS` | Optional | SMTP password |
| `SMTP_FROM` | Optional | Sender address (e.g. `"SAHU CSC" <noreply@sahucsc.in>`) |

> VAPID keys auto-generated as ephemeral keys on startup if not set (lost on restart — subscriptions break).  
> SMTP is fully optional; email calls are fire-and-forget; missing SMTP config never breaks registration flow.

---

## 8. Database Schema — Quick Reference

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `users` | id, username, email, mobile, role, status, failed_login_attempts, locked_until | User accounts |
| `user_sessions` | id, session_id, user_id, device_info, browser, os, ip_address, is_active, remember_me, expires_at, last_activity | V2 multi-device sessions |
| `session` | sid, sess, expire | connect-pg-simple express session store (auto-created) |
| `ledger` | id, date, customer_name, service_type, credit, debit, balance, receipt_number, receipt_token, created_by | Transaction ledger |
| `receipt_counters` | year (PK), last_count | Atomic sequential receipt numbering per year |
| `aeps_daily` | id, date, opening_balance, created_by | Daily AePS float session (unique per date+user) |
| `aeps_transactions` | id, daily_id, type (withdrawal/deposit), amount, customer_name | AePS transaction entries |
| `udhari_customers` | id, name, phone, address, balance, created_by | Per-user credit customers |
| `udhari_entries` | id, customer_id, date, type (gave/got), amount, note | Individual credit/debit entries |
| `services` | id, name, category, price, is_active | CSC service catalog (22 pre-seeded) |
| `notifications` | id, user_id (null = broadcast), title, message, type, is_read | System + user notifications |
| `audit_logs` | id, user_id, action, details, ip_address | Immutable security event trail |
| `settings` | key, value | Global key-value config store |
| `user_preferences` | user_id, theme, language | Per-user UI preferences |
| `push_subscriptions` | user_id, endpoint, p256dh, auth | VAPID Web Push subscriptions |
| `password_reset_tokens` | token, user_id, expires_at, used | One-time OTP reset tokens |
| `broadcast_logs` | id, sent_by, channel, subject, body, recipient_filter, recipient_count, failed_count, created_at | Audit trail of every push / email blast sent |

---

## 9. API Routes — Complete Reference

### Auth
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/auth/login` | — | `{ identifier, password, rememberMe }` → session |
| POST | `/api/auth/logout` | ✅ | Destroys session |
| GET | `/api/auth/me` | ✅ | Current user object |
| POST | `/api/auth/register` | — | Self-registration → PENDING status |
| POST | `/api/auth/send-otp` | — | OTP for password reset |
| POST | `/api/auth/verify-otp` | — | Verify OTP |
| POST | `/api/auth/reset-password` | — | Reset password with OTP |

### Sessions (own)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/sessions` | List own active sessions |
| DELETE | `/api/sessions/:id` | Revoke a specific session |
| DELETE | `/api/sessions/others` | Revoke all except current |
| DELETE | `/api/sessions/all` | Revoke all + destroy current → logout |

### Ledger
| Method | Path | Permission |
|--------|------|-----------|
| GET | `/api/ledger` | `ledger:view` |
| POST | `/api/ledger` | `ledger:create` |
| PATCH | `/api/ledger/:id` | `ledger:edit` |
| DELETE | `/api/ledger/:id` | `ledger:edit` |
| GET | `/api/ledger/balance` | `ledger:view` |
| GET | `/api/ledger/summary` | `ledger:view` |

### AePS
| Method | Path | Permission |
|--------|------|-----------|
| GET | `/api/aeps/session?date=` | `aeps:view` |
| POST | `/api/aeps/session` | `aeps:manage` |
| POST | `/api/aeps/transaction` | `aeps:manage` |
| PATCH | `/api/aeps/transaction/:id` | `aeps:manage` |
| DELETE | `/api/aeps/transaction/:id` | `aeps:manage` |

### Udhari Khata
| Method | Path | Permission |
|--------|------|-----------|
| GET | `/api/udhari/summary` | `udhari:view` |
| GET | `/api/udhari/customers` | `udhari:view` |
| POST | `/api/udhari/customers` | `udhari:manage` |
| GET | `/api/udhari/customers/:id` | `udhari:view` |
| PATCH | `/api/udhari/customers/:id` | `udhari:manage` |
| DELETE | `/api/udhari/customers/:id` | `udhari:manage` |
| GET | `/api/udhari/customers/:id/entries` | `udhari:view` |
| POST | `/api/udhari/customers/:id/entries` | `udhari:manage` |
| PATCH | `/api/udhari/customers/:id/entries/:eid` | `udhari:manage` |
| DELETE | `/api/udhari/customers/:id/entries/:eid` | `udhari:manage` |

### Reports & Dashboard
| Method | Path | Permission |
|--------|------|-----------|
| GET | `/api/dashboard` | `reports:view` |
| GET | `/api/reports/daily?date=` | `reports:view` |
| GET | `/api/reports/monthly?year=&month=` | `reports:view` |
| GET | `/api/reports/aeps?startDate=&endDate=` | `reports:view` |
| GET | `/api/reports/service-breakdown` | `reports:view` |
| GET | `/api/reports/export?startDate=&endDate=` | `reports:export` |

### Receipts
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/receipts/verify/:token` | Public |

### Admin — Oversight
| Method | Path |
|--------|------|
| GET | `/api/admin/users-overview` |
| GET | `/api/admin/users-overview/:userId/ledger` |
| GET | `/api/admin/aeps-overview` |

### Admin — Sessions *(v2.4.0)*
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/admin/sessions` | All active sessions across all users (joined with user info) |
| DELETE | `/api/admin/sessions/:id` | Revoke a specific session |
| DELETE | `/api/admin/sessions/user/:userId` | Revoke all sessions for a user |

### Admin — Registration *(v2.4.0)*
| Method | Path |
|--------|------|
| GET | `/api/admin/registration/pending` |
| GET | `/api/admin/users/pending-count` |
| POST | `/api/admin/registration/:id/approve` |
| POST | `/api/admin/registration/:id/reject` |
| POST | `/api/admin/registration/bulk-approve` |
| POST | `/api/admin/registration/bulk-reject` |

### Users (admin)
| Method | Path |
|--------|------|
| GET | `/api/users` |
| POST | `/api/users` |
| PATCH | `/api/users/:id` |
| DELETE | `/api/users/:id` |

### Profile, Preferences, Notifications, Push
| Method | Path |
|--------|------|
| GET/PATCH | `/api/profile` |
| GET/PATCH | `/api/preferences` |
| GET | `/api/notifications` |
| PATCH | `/api/notifications/:id/read` |
| POST | `/api/notifications/read-all` |
| DELETE | `/api/notifications/:id` |
| GET | `/api/push/vapid-public-key` |
| POST | `/api/push/subscribe` |
| DELETE | `/api/push/unsubscribe` |

### Admin — Broadcast *(v2.6.0)*
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/admin/broadcast/stats` | Push subscriber count, active users, SMTP status |
| POST | `/api/admin/broadcast/push` | Send push notification to all subscribers |
| POST | `/api/admin/broadcast/email` | Send email blast (`recipientFilter`: all / active) |
| GET | `/api/admin/broadcast/history` | Paginated broadcast log (`?page=&limit=`) |

### Misc
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/healthz` | Public — full diagnostics |
| GET | `/api/audit-logs` | Admin |
| GET/PATCH | `/api/settings` | Admin write |

---

## 10. Frontend Pages Reference

| Path | Page | Access | Notes |
|------|------|--------|-------|
| `/login` | `login.tsx` | Public | Desktop split + mobile white-card. Inline 4-step forgot-password. Attempt counter + lockout countdown. |
| `/register` | `register.tsx` | Public | Self-registration + PasswordStrength meter |
| `/forgot-password` | `forgot-password.tsx` | Public | Kept for direct link compat; flow now embedded in login.tsx |
| `/reset-password` | `reset-password.tsx` | Public | OTP + new password step |
| `/` | `dashboard.tsx` | All | Real-time stats + offline IndexedDB fallback |
| `/ledger` | `ledger.tsx` | All | Offline queue support · Desktop V2 full-screen split form |
| `/aeps` | `aeps.tsx` | All | Per-user daily sessions · 3-step tx form (desktop V2 split) |
| `/udhari` | `udhari.tsx` | All | Customer list · To Collect / To Pay banner · FAB |
| `/udhari/:id` | `udhari-customer.tsx` | All | Per-customer ledger · balance banner · WhatsApp · PDF |
| `/services` | `services.tsx` | All | Service catalog |
| `/reports` | `reports.tsx` | All | `useIsMobile()` → MobileReports or DesktopReports (v2.2 full redesign) |
| `/notifications` | `notifications.tsx` | All | Notification inbox |
| `/profile` | `profile.tsx` | All | **Unified Profile+Settings (v2.3)** — desktop V5 Command Center + two-column grid; mobile V3 iOS drill-in. Sections: Personal Info, Security, Sessions, Preferences, Business Info (admin), System (admin) |
| `/settings` | — | — | Deleted — redirects to `/profile` |
| `/sessions` | `sessions.tsx` | All | Standalone device management (still accessible; also embedded in /profile) |
| `/pwa-status` | `pwa-status.tsx` | All | Network, sync, storage, install, push status |
| `/receipts/verify/:token` | `receipts-verify.tsx` | Public | QR scan target — no auth required |
| `/users` | `users.tsx` | Admin | User management — **6 tabs**: Pending (bulk approve/reject + reject reason dialog) · Active (search/filter, bulk activate/suspend, CSV export, admin password reset) · All Users (same) · Cash Overview · **AePS Overview** (per-user AePS balance) · **Sessions** (admin session viewer + revoke) |
| `/broadcast` | `broadcast.tsx` | Admin | Broadcast Center — Push tab · Email tab · History tab (paginated sent-log) |
| `/users-overview` | `users-overview.tsx` | Admin | Cross-user balance summary |
| `/audit-logs` | `audit-logs.tsx` | Admin | Full audit trail |
| `/backups` | `backups.tsx` | Admin | pg_dump backup/restore |
| `/offline` | `offline.tsx` | — | Offline fallback |

---

## 11. Authentication & Security

### Login flow
1. `POST /api/auth/login { identifier, password, rememberMe }`
2. `identifier` resolved against `username OR email OR mobile`
3. Status checks: `DELETED/INACTIVE/PENDING/SUSPENDED` → 401
4. Lock check: if `LOCKED` and `lockedUntil > now` → 401 `{ locked: true, lockedUntil }`
5. Auto-unlock: if `lockedUntil <= now` → status reset to `ACTIVE`
6. bcrypt compare (12 rounds)
7. Wrong password: increment `failedLoginAttempts`; after 5 → lock for 15 min
8. Success: create `user_sessions` row, set session, return user + `attemptsLeft: null`

### Session management
- Standard session: **8 hours**; Remember Me: **30 days**
- PostgreSQL session store (`connect-pg-simple`) — **survives server restarts**
- `requireAuth`: validates `sessionId` in `user_sessions` (V2), falls back to `activeSessionToken` on `users` (V1 compat)
- `lastActivity` updated at most once per minute (throttled)
- Idle timeout: **30 minutes** of inactivity → auto-logout; **2-minute** warning dialog

### RBAC

| Role | Permissions |
|------|------------|
| `admin` | `["*"]` — all permissions |
| `operator` | `ledger:view/create/edit`, `aeps:view/manage`, `reports:view/export`, `services:view`, `profile:view`, `notifications:view`, `udhari:view/manage` |
| `user` | `ledger:view`, `reports:view`, `services:view`, `profile:view`, `notifications:view` |

### Audit log codes

```
login.success             login.failed_inactive       login.failed_locked
login.failed_password     login.failed_max_attempts   logout
session.revoke            session.revoke_others        session.revoke_all
ledger.create             ledger.update                ledger.delete        ledger.clear
aeps.session              aeps.transaction             aeps.edit            aeps.delete
profile.update            profile.password_change      profile.avatar_update profile.avatar_delete
preferences.update        user.create                  user.update          user.role_change
user.delete               settings.update              backup.create        backup.restore
password.reset            REGISTER_REQUEST
udhari.customer.create    udhari.customer.update       udhari.customer.delete
udhari.entry.create
admin.session.revoke      admin.session.revoke_all_for_user
```

### Account lockout
- 5 failed attempts → `LOCKED` + `lockedUntil = now + 15 min`
- Auto-unlock on next attempt if `lockedUntil <= now`
- Login UI shows live MM:SS countdown + draining progress bar when locked

### Password policy (registration + reset)
- Minimum 8 characters · uppercase · lowercase · number

---

## 12. Business Modules

### Ledger
- Running balance computed at insert: `SUM(credit) - SUM(debit)` of all prior entries for that user
- `balance` stored as snapshot per row — not retroactively updated
- Receipt: `CSC-YYYY-NNNN` via atomic `receipt_counters` upsert; year from entry `date` (not wall clock)
- Public QR: `receipt_token = UUID` → `GET /api/receipts/verify/:token`
- Offline: new entries queued to IndexedDB `pending_ledger`; auto-synced on reconnect

### AePS
- One session per `(date, created_by)` — fully per-user
- Running balance computed in API response (not stored per transaction)

### Udhari Khata
- `balance > 0` = customer owes you ("To Collect"); `balance < 0` = you owe ("To Pay"); `0` = settled
- `gave` entry: balance increases; `got` entry: balance decreases
- `balance` recalculated server-side (`recalcBalance`) after every entry mutation — never trust client value

### Reports
- `reports.tsx` uses `useIsMobile()` to branch into entirely separate `MobileReports` / `DesktopReports` components
- Excel export: `.xlsx` with Ledger + AePS sheets

---

## 13. Admin Features

### User Management (`/users`) — 6 tabs

| Tab | Content |
|-----|---------|
| **Pending** | Registrations awaiting approval. Checkboxes + bulk action bar (approve/reject N at once). Bulk reject dialog with optional reason. Individual approve/reject buttons. |
| **Active** | Active users — edit, change role, suspend, delete. **v2.5:** real-time search (username/name/email/mobile) + role filter dropdown; checkboxes + bulk Activate/Suspend bar; CSV export (respects filters); admin password reset (`KeyRound` dialog with live policy checklist). |
| **All Users** | Full user list with status badges. Same search, filter, bulk status, CSV export, and admin password reset as Active tab. |
| **Cash Overview** | Cross-user ledger balance overview |
| **AePS Overview** *(v2.5)* | Per-user AePS balance summary cards — opening balance, deposited, withdrawn, net balance, last session date, color-coded chip. |
| **Sessions** *(v2.4)* | All active sessions across all users, grouped by user. Per-session: device, browser, OS, IP, last active, expiry, Remember Me. Revoke individual session or all sessions for a user. Auto-refreshes every 30s. |

### Admin User Management — new v2.5 features at a glance

| Feature | How it works |
|---------|-------------|
| Search | Real-time filter on `username`, `fullName`, `email`, `mobile` |
| Role filter | `<Select>` dropdown — "All Roles" / Admin / Operator / User |
| Bulk status | Select ≥1 users → sticky bar → "Activate Selected" or "Suspend Selected"; calls `PATCH /api/users/:id` with `{ status }` in parallel |
| CSV export | `exportCSV()` → `Blob` download; filename `users-<tab>-<YYYY-MM-DD>.csv`; respects current filters |
| Password reset | `KeyRound` button → dialog with new + confirm inputs + live policy checklist (8+ chars, upper, lower, number, match); calls `PATCH /api/users/:id` with `{ password }` |

### Admin Sessions endpoints
- `GET /api/admin/sessions` — active non-expired sessions joined with user info
- `DELETE /api/admin/sessions/:id` — revoke one session (sets `isActive = false`)
- `DELETE /api/admin/sessions/user/:userId` — revoke all for a user

### AePS Overview endpoint
- `GET /api/admin/aeps-overview` — all users' AePS balance data (pre-existing endpoint, no changes)

### Registration email notifications
When SMTP secrets are set:
- New registration → email to all active admins
- Approved → email to the new user
- Rejected → email to the rejected user (with reason)

---

## 14. PWA & Offline

### Service Worker (Workbox — injectManifest strategy)

| Route | Strategy | TTL |
|-------|----------|-----|
| `/api/auth/*` | NetworkOnly | — |
| `/api/dashboard` | StaleWhileRevalidate | 5 min |
| `/api/reports/*` | StaleWhileRevalidate | 10 min |
| `/api/settings` | StaleWhileRevalidate | 30 min |
| `/api/profile` | StaleWhileRevalidate | 5 min |
| `/api/preferences` | StaleWhileRevalidate | 30 min |
| `/api/ledger/*` | NetworkFirst | 5 min, 8s timeout |
| `/api/services` | NetworkFirst | 1 hr, 8s timeout |
| `/api/notifications` | NetworkFirst | 2 min, 8s timeout |
| Images | CacheFirst | 30 days |
| Fonts | CacheFirst | 1 year |

### IndexedDB stores (v2)

| Store | Purpose |
|-------|---------|
| `pending_ledger` | Offline queue for ledger entries |
| `cache_store` | Generic KV cache (dashboard, etc.) |
| `user_session` | Cached auth session (offline login, 24h) |
| `cached_reports` | Previously generated reports |
| `pending_notifications` | Notifications queued offline |

### Android TWA
1. Deploy to Replit (Publish) for a live HTTPS URL
2. `bubblewrap init --manifest https://<domain>/manifest.webmanifest`
3. Generate keystore → get SHA-256 fingerprint
4. Update `public/.well-known/assetlinks.json`
5. `bubblewrap build` → upload `.aab` to Google Play

---

## 15. Key Architecture Decisions

| Decision | Rule |
|----------|------|
| **`willChange: transform` on page wrappers** | Never — creates a new CSS containing block and breaks `position: fixed` on the bottom nav |
| **Auth loading guard uses `\|\|`** | `isLoading = liveLoading \|\| !offlineChecked` — using `&&` causes brief unauthenticated flash on refresh |
| **Login sets cache via `setQueryData`** | After login, set `["auth/me"]` directly from response body. A refetch causes a proxy race condition → 401 → redirect cancelled |
| **`connect-pg-simple` in esbuild externals** | Must stay in `external` in `build.mjs` — esbuild bundling breaks its internal `table.sql` path lookup; sessions silently never persist |
| **`connect-pg-simple` uses shared pool** | Must use `pool` from `@workspace/db`, not a raw connection string — raw string creates a silent-fail separate pool |
| **Running balance at insert time** | `SUM(credit) - SUM(debit)` of all prior entries; stored as a snapshot; not retroactively updated |
| **Receipt year from entry date** | `receipt_counters` year uses entry `date` field, not wall clock — backdated entries use the correct counter |
| **`parseDevice` called once per login** | Must be called before all failure/success branches — esbuild treats duplicate `const` as a build error |
| **Admin session revocation** | Sets `isActive = false` on `user_sessions` — does NOT destroy the express session (which belongs to the admin, not the target user) |
| **SMTP is fire-and-forget** | All mailer calls in routes are wrapped in `try/catch` and not awaited — missing SMTP config never blocks user operations |
| **`mobileOnly` nav items** | Sessions nav item is `mobileOnly: true` — desktop sidebar filters it out; mobile drawer shows it. Sessions are embedded in `/profile` on desktop. |
| **Seed script via esbuild** | `seed.ts` compiled by esbuild (same as main bundle). Do NOT use `npx tsx` — it cannot resolve `@workspace/db` workspace aliases |
| **Contract-first API** | OpenAPI spec → Orval → generated hooks. Never edit `lib/api-client-react/src/generated/` directly |
| **Money as Drizzle `numeric`** | Returns as string from DB — always `parseFloat()` before returning from routes |
| **Udhari balance recalculated server-side** | `recalcBalance(customerId)` after every entry mutation — never trust a client-supplied balance value |
| **AePS sessions unique per `(date, created_by)`** | Each user has their own daily session; no sharing |
| **Notification `userId = null`** | Only for true system-wide broadcasts (visible to all). All other notifications must have an explicit `userId` |

---

## 16. Common Problems & Fixes

| Symptom | Fix |
|---------|-----|
| **502 Bad Gateway** | API still starting. Run `fuser -k 5000/tcp; fuser -k 8082/tcp`, restart `Start application`, wait 20–30s |
| **Login fails / "Invalid credentials"** | DB empty after schema push. Run `Seed Database` workflow |
| **"relation does not exist"** | Schema not pushed. Run `pnpm --filter @workspace/db run push` then re-seed |
| **Login succeeds but stays on login page** | `connect-pg-simple` bundled (remove from externals check). Ensure shared `pool` used. `createTableIfMissing: true` must be set. |
| **Loading screen spins forever (>12s)** | API not responding. Check `Start application` logs. Retry button appears at 12s |
| **Push notifications break after restart** | VAPID keys not set as Replit Secrets (ephemeral keys lost on restart). Generate + set `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` |
| **Blank page / old version** | Clear service worker: DevTools → Application → Storage → Clear site data → Reload |
| **`EADDRINUSE :8080`** | Artifact workflow holds 8080 permanently. `Start application` uses 8082 — this is expected |
| **Emails not sent** | SMTP secrets not set. This is expected/normal — email is optional and always fire-and-forget |
| **Sessions tab shows nothing** | User has no active sessions, or all sessions expired. Try logging in from another browser/device first |

---

## 17. Toast Notification System v2

Fully custom Framer Motion system — Radix UI toast primitives replaced. State unchanged (`useToast()` hook). `toaster.tsx` renders with `AnimatePresence` + `motion.div`.

| Feature | Detail |
|---------|--------|
| **Positioning** | Mobile: top-center, slides down. Desktop: bottom-right, slides up |
| **Swipe-to-dismiss** | `drag="x"`, threshold `|vel| > 400` or `|offset| > 110`, throw animation via `fmAnimate` |
| **Auto-dismiss** | 4.5 s countdown with draining progress bar |
| **Variants** | `default` (navy), `success` (green), `destructive` (red), `warning` (amber) |
| **Shorthands** | `toast.success()` · `toast.error()` · `toast.warning()` · `toast.info()` |
| **Stack limit** | 3 toasts visible simultaneously (`TOAST_LIMIT = 3`) |

### Architecture decisions (toast)
| Decision | Rule |
|----------|------|
| **Custom renderer, not Radix** | `toaster.tsx` uses Framer Motion directly; `useToast()` state hook is unchanged — swapping the renderer required zero hook changes |
| **`fmAnimate(x, ±520)` for throw** | Imperative animation of a `MotionValue` via the module-level `animate` function; `.then(() => dismiss())` fires after the throw completes |
| **Timer paused on drag** | `onDragStart={clearTimer}` — prevents auto-dismiss racing the swipe animation |
| **`onPointerDown` on close button** | `e.stopPropagation()` prevents the drag handler from intercepting close-button taps |
| **`touch-pan-y` CSS class** | Allows vertical page scroll while horizontal drag is captured by Framer Motion |
| **`isTop` prop** | Passed from `Toaster` to `ToastItem`; flips `enterY`/`exitY` sign so animation direction matches card position |
