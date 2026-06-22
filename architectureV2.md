# SAHU CSC — Architecture Reference v2
**Version 2.4.0 — June 2026**

> This document is the single authoritative reference for the SAHU CSC platform architecture.  
> It supersedes any older architecture notes in `ARCHITECTURE.md`.  
> For a per-feature change history, see `changelogV2.md`.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Monorepo Layout](#2-monorepo-layout)
3. [Runtime & Tech Stack](#3-runtime--tech-stack)
4. [Database Schema](#4-database-schema)
5. [Backend — Express API Server](#5-backend--express-api-server)
   - [Middleware Stack](#51-middleware-stack)
   - [Authentication & Session System](#52-authentication--session-system)
   - [RBAC — requirePermission](#53-rbac--requirepermission)
   - [Audit Logging](#54-audit-logging)
   - [API Route Reference](#55-api-route-reference)
6. [Frontend — React SPA](#6-frontend--react-spa)
   - [App Bootstrap & Routing](#61-app-bootstrap--routing)
   - [Pages Reference](#62-pages-reference)
   - [Design System](#63-design-system)
   - [Hooks Reference](#64-hooks-reference)
   - [Data Fetching](#65-data-fetching)
7. [Login & Auth UX (v2.2)](#7-login--auth-ux-v22)
8. [Business Modules](#8-business-modules)
   - [Ledger & Running Balance](#81-ledger--running-balance)
   - [AePS Cash Management](#82-aeps-cash-management)
   - [Udhari Khata](#83-udhari-khata)
   - [Receipt System](#84-receipt-system)
   - [Reports & Dashboard (v2.2)](#85-reports--dashboard-v22)
9. [PWA & Offline Architecture](#9-pwa--offline-architecture)
10. [Security Model](#10-security-model)
11. [Per-User Data Isolation](#11-per-user-data-isolation)
12. [OpenAPI Contract-First Design](#12-openapi-contract-first-design)
13. [Environment & Secrets](#13-environment--secrets)
14. [Key Architecture Decisions](#14-key-architecture-decisions)

---

## 1. Overview

**SAHU CSC** is a full-stack business management platform for Common Service Centers (CSC) in rural Odisha, India. It runs as a React SPA frontend + Express API backend, backed by PostgreSQL, delivered as a PWA installable on Android/iOS/desktop.

### Core capabilities

| Domain | Feature |
|--------|---------|
| Ledger | Per-user income/expense ledger with running balance, `CSC-YYYY-NNNN` receipts, QR verification |
| AePS | Daily cash float tracking (Aadhaar Enabled Payment System) |
| Udhari Khata | Customer credit ledger — "You Gave / You Got" with WhatsApp reminders + PDF statement |
| Reports | Daily / Monthly / AePS / Service breakdown with Excel export — full mobile & desktop redesign |
| Auth | Session-based, multi-device, OTP password reset, account locking, idle auto-logout |
| Admin | Cross-user balance overview, per-user ledger view, AePS overview, audit trail |
| PWA | Installable, offline-first, push notifications (VAPID), Android TWA |

### Default credentials (seeded)

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | admin |
| `operator` | `operator123` | operator |

---

## 2. Monorepo Layout

```
workspace/
├── artifacts/
│   ├── api-server/              Express 5 backend  (dev: port 8082)
│   │   ├── src/
│   │   │   ├── app.ts           Express app, middleware, session store
│   │   │   ├── index.ts         HTTP server entrypoint
│   │   │   ├── routes/          One file per resource domain
│   │   │   └── lib/             Shared middleware & helpers
│   │   └── build.mjs            esbuild bundler (ESM output → dist/)
│   │
│   ├── sahu-csc/                React + Vite SPA  (dev: port 5000)
│   │   ├── index.html           PWA meta tags
│   │   ├── vite.config.ts       Vite + VitePWA + Workbox + proxy → 8082
│   │   ├── public/              Static assets + PWA icons + assetlinks.json
│   │   └── src/
│   │       ├── App.tsx          QueryClient, providers, router
│   │       ├── main.tsx         createRoot + registerSW + syncEngine init
│   │       ├── pages/           One file per route
│   │       ├── components/      Shared components + shadcn/ui
│   │       ├── hooks/           React hooks
│   │       └── lib/             IndexedDB, sync engine, utilities
│   │
│   └── mockup-sandbox/          Canvas component preview server (port 8081)
│
├── lib/
│   ├── db/                      @workspace/db — Drizzle ORM + all schema tables
│   ├── api-spec/                @workspace/api-spec — openapi.yaml (source of truth)
│   └── api-client-react/        @workspace/api-client-react — Orval-generated hooks
│
├── infrastructure/
│   ├── pwa/manifest.json        Full PWA manifest reference
│   └── twa/twa-config.json      Android TWA config (Bubblewrap CLI)
│
├── replit.md                    Project README + user preferences
├── architectureV2.md            This file
└── changelogV2.md               Feature changelog
```

---

## 3. Runtime & Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 20 |
| Language | TypeScript | 5.9 |
| Frontend | React + Vite | 19 + 7 |
| Styling | Tailwind CSS v4 + shadcn/ui | — |
| Animations | Framer Motion | — |
| Charts | Recharts | — |
| Backend | Express | 5 |
| Session | express-session + connect-pg-simple | — |
| Security | helmet, hpp, express-rate-limit | — |
| Database | PostgreSQL + Drizzle ORM | — |
| Validation | Zod v4 + drizzle-zod | — |
| API contract | OpenAPI 3.1 → Orval → React Query hooks | — |
| Build | esbuild (API) + Vite (frontend) | — |
| Monorepo | pnpm workspaces | — |
| PWA | vite-plugin-pwa + Workbox | — |
| Push | web-push (VAPID) | — |

### Theme tokens

| Token | Value |
|-------|-------|
| Navy (primary) | `#0b2c60` |
| Saffron (accent) | `#f97316` |
| Success green | `#10b981` |
| Danger red | `#ef4444` |
| Purple | `#8b5cf6` |

---

## 4. Database Schema

All tables use PostgreSQL via Drizzle ORM. `@workspace/db` exports `pool`, `db`, and all table objects.

### `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `username` | text UNIQUE | |
| `email` | text UNIQUE | |
| `mobile` | text | Login identifier |
| `full_name` | text | |
| `password_hash` | text | bcrypt 12 rounds |
| `role` | text | `admin` / `operator` / `user` |
| `status` | text | `ACTIVE` / `PENDING` / `INACTIVE` / `SUSPENDED` / `DELETED` / `LOCKED` |
| `failed_login_attempts` | integer | Incremented on bad password; reset on success |
| `locked_until` | timestamptz | Set for 15 min after 5 failed attempts |
| `active_session_token` | text | V1 backward compat |
| `profile_picture` | text | base64 data URL |
| `bio` | text | Max 500 chars |
| `created_at` / `updated_at` | timestamptz | |

### `user_sessions`  *(V2 multi-device)*

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `session_id` | text UNIQUE | UUID; stored in express-session |
| `user_id` | integer | FK → `users.id` |
| `device_info` | text | `"Chrome on Windows"` |
| `browser` / `os` | text | |
| `ip_address` | text | X-Forwarded-For aware |
| `remember_me` | boolean | true = 30 days, false = 8 hours |
| `is_active` | boolean | false after revoke |
| `expires_at` / `last_activity` | timestamptz | |

### `session`  *(connect-pg-simple — auto-created)*

| Column | Type |
|--------|------|
| `sid` | varchar PK |
| `sess` | json |
| `expire` | timestamp(6) |

### `ledger`

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `date` | text | ISO `YYYY-MM-DD` |
| `customer_name` | text | |
| `service_type` | text | |
| `credit` / `debit` | numeric(12,2) | |
| `balance` | numeric(12,2) | Running balance snapshot at insert |
| `description` | text | |
| `receipt_number` | text | `CSC-YYYY-NNNN` |
| `receipt_token` | text | UUID — public QR URL key |
| `created_by` | integer | FK → `users.id` |
| `created_at` / `updated_at` | timestamptz | |

### `receipt_counters`

| Column | Type | Notes |
|--------|------|-------|
| `year` | integer PK | |
| `last_count` | integer | Atomically incremented via `ON CONFLICT DO UPDATE` |

### `aeps_daily`

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `date` | date | Unique per `(date, created_by)` |
| `opening_balance` | numeric(12,2) | |
| `notes` | text | |
| `created_by` | integer | Per-user isolation |

### `aeps_transactions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `daily_id` | integer | FK → `aeps_daily.id` CASCADE DELETE |
| `type` | text | `withdrawal` / `deposit` |
| `amount` | numeric(12,2) | |
| `customer_name` | text | |
| `description` | text | |

### `udhari_customers`

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `name` / `phone` / `address` | text | |
| `balance` | numeric(12,2) | Server-recalculated after every entry change |
| `created_by` | integer | Per-user isolation |

### `udhari_entries`

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `customer_id` | integer | FK → `udhari_customers.id` |
| `date` | text | ISO |
| `type` | text | `gave` (customer owes more) / `got` (payment received) |
| `amount` | numeric(12,2) | |
| `note` | text | |
| `created_by` | integer | |

### Other tables

| Table | Purpose |
|-------|---------|
| `services` | CSC service catalog (22 pre-seeded, 5 categories) |
| `notifications` | User + system notifications (`user_id = null` = broadcast to all) |
| `audit_logs` | Immutable security event trail |
| `settings` | Global key-value config store |
| `user_preferences` | Per-user UI settings (theme, language) |
| `push_subscriptions` | VAPID Web Push subscription records |
| `password_reset_tokens` | One-time OTP reset tokens |

---

## 5. Backend — Express API Server

### 5.1 Middleware Stack

Order in `app.ts`:

```
helmet()                       — Security headers
hpp()                          — HTTP Parameter Pollution protection
express-rate-limit (global)    — 500 req / 15 min
cors() / trust proxy           — Replit proxy compatibility
express.json({ limit: "10mb" })
pino-http logger
connect-pg-simple session store — PostgreSQL-backed; createTableIfMissing: true
```

**Session configuration:**

| Setting | Value |
|---------|-------|
| Store | PostgreSQL (`session` table) |
| Standard TTL | 8 hours |
| Remember Me TTL | 30 days |
| Cookie | `httpOnly: true`, `secure` in production, `sameSite: strict` in production |
| Survives restarts | Yes — stored in DB, not memory |

### 5.2 Authentication & Session System

**Login flow:**

1. `POST /api/auth/login { identifier, password, rememberMe }`
2. `identifier` resolved against `username OR email OR mobile`
3. Account status checks: `DELETED/INACTIVE/PENDING/SUSPENDED` → 401 with `rejected` / `inactive` flag
4. Lock check: if `status = LOCKED` and `lockedUntil > now()` → 401 with `{ locked: true, lockedUntil }`
5. Auto-unlock: if `lockedUntil <= now()` → status reset to `ACTIVE`, attempts cleared
6. bcrypt password comparison
7. On wrong password: increment `failedLoginAttempts`; after 5 → set `status = LOCKED`, `lockedUntil = now() + 15m`
8. On success: create `user_sessions` row, set `req.session.userId + sessionId`, return user object + `attemptsLeft = null`
9. API always returns `attemptsLeft` count on wrong-password 401 so the frontend can show the counter

**`requireAuth` middleware:**

1. Checks `req.session.userId` + `req.session.sessionId`
2. Validates against `user_sessions` (V2): `WHERE sessionId = ? AND isActive = true AND expiresAt > now()`
3. Falls back to V1 `activeSessionToken` on `users` table for backward compat
4. Updates `lastActivity` on `user_sessions` (throttled to once per minute)
5. Attaches `req.user` and `req.session.userId`

**Session revocation endpoints:**

| Method | Path | Action |
|--------|------|--------|
| `GET` | `/api/sessions` | List active sessions for current user |
| `DELETE` | `/api/sessions/:id` | Revoke specific session by DB row ID |
| `DELETE` | `/api/sessions/others` | Revoke all except current |
| `DELETE` | `/api/sessions/all` | Revoke all + destroy current → client redirects to login |

### 5.3 RBAC — requirePermission

`requirePermission(permission: string)` middleware:

- Admin role has wildcard `["*"]` — all permissions granted
- Operator and user roles have explicit permission lists
- Applied at route registration, not in controller logic

| Role | Permissions |
|------|------------|
| `admin` | `["*"]` — all |
| `operator` | `ledger:view`, `ledger:create`, `ledger:edit`, `aeps:view`, `aeps:manage`, `reports:view`, `reports:export`, `services:view`, `profile:view`, `notifications:view`, `udhari:view`, `udhari:manage` |
| `user` | `ledger:view`, `reports:view`, `services:view`, `profile:view`, `notifications:view` |

### 5.4 Audit Logging

All security events logged to `audit_logs` with `userId`, `action`, `details`, `ipAddress`, `createdAt`.

**Complete action codes:**

```
login.success          login.failed_inactive    login.failed_locked
login.failed_password  login.failed_max_attempts
logout
session.revoke         session.revoke_others    session.revoke_all
ledger.create          ledger.update            ledger.delete        ledger.clear
aeps.session           aeps.transaction         aeps.edit            aeps.delete
profile.update         profile.password_change  profile.avatar_update profile.avatar_delete
preferences.update
user.create            user.update              user.role_change     user.delete
settings.update
backup.create          backup.restore
password.reset
REGISTER_REQUEST
udhari.customer.create udhari.customer.update   udhari.customer.delete
udhari.entry.create
admin.session.revoke  admin.session.revoke_all_for_user
```

**Device detection** (`parseDevice(userAgent)`) — called once per login request, returns `{ browser, os, deviceInfo, deviceType }`. `deviceType` is `"mobile" | "tablet" | "desktop"`.

### 5.5 API Route Reference

| Domain | Method | Path | Auth | Permission |
|--------|--------|------|------|-----------|
| **Auth** | POST | `/api/auth/login` | — | — |
| | POST | `/api/auth/logout` | ✅ | — |
| | GET | `/api/auth/me` | ✅ | — |
| | POST | `/api/auth/register` | — | — |
| | POST | `/api/auth/send-otp` | — | — |
| | POST | `/api/auth/verify-otp` | — | — |
| | POST | `/api/auth/reset-password` | — | — |
| **Sessions** | GET | `/api/sessions` | ✅ | — |
| | DELETE | `/api/sessions/:id` | ✅ | — |
| | DELETE | `/api/sessions/others` | ✅ | — |
| | DELETE | `/api/sessions/all` | ✅ | — |
| **Ledger** | GET | `/api/ledger` | ✅ | `ledger:view` |
| | POST | `/api/ledger` | ✅ | `ledger:create` |
| | PATCH | `/api/ledger/:id` | ✅ | `ledger:edit` |
| | DELETE | `/api/ledger/:id` | ✅ | `ledger:edit` |
| | GET | `/api/ledger/balance` | ✅ | `ledger:view` |
| | GET | `/api/ledger/summary` | ✅ | `ledger:view` |
| **AePS** | GET | `/api/aeps/session` | ✅ | `aeps:view` |
| | POST | `/api/aeps/session` | ✅ | `aeps:manage` |
| | POST | `/api/aeps/transaction` | ✅ | `aeps:manage` |
| | PATCH | `/api/aeps/transaction/:id` | ✅ | `aeps:manage` |
| | DELETE | `/api/aeps/transaction/:id` | ✅ | `aeps:manage` |
| **Reports** | GET | `/api/reports/daily` | ✅ | `reports:view` |
| | GET | `/api/reports/monthly` | ✅ | `reports:view` |
| | GET | `/api/reports/aeps` | ✅ | `reports:view` |
| | GET | `/api/reports/service-breakdown` | ✅ | `reports:view` |
| | GET | `/api/reports/export` | ✅ | `reports:export` |
| | GET | `/api/dashboard` | ✅ | `reports:view` |
| **Udhari** | GET | `/api/udhari/summary` | ✅ | `udhari:view` |
| | GET | `/api/udhari/customers` | ✅ | `udhari:view` |
| | POST | `/api/udhari/customers` | ✅ | `udhari:manage` |
| | GET | `/api/udhari/customers/:id` | ✅ | `udhari:view` |
| | PATCH | `/api/udhari/customers/:id` | ✅ | `udhari:manage` |
| | DELETE | `/api/udhari/customers/:id` | ✅ | `udhari:manage` |
| | GET | `/api/udhari/customers/:id/entries` | ✅ | `udhari:view` |
| | POST | `/api/udhari/customers/:id/entries` | ✅ | `udhari:manage` |
| | PATCH | `/api/udhari/customers/:id/entries/:eid` | ✅ | `udhari:manage` |
| | DELETE | `/api/udhari/customers/:id/entries/:eid` | ✅ | `udhari:manage` |
| **Receipts** | GET | `/api/receipts/verify/:token` | — | Public |
| **Admin** | GET | `/api/admin/users-overview` | ✅ | admin |
| | GET | `/api/admin/users-overview/:userId/ledger` | ✅ | admin |
| | GET | `/api/admin/aeps-overview` | ✅ | admin |
| | GET | `/api/admin/sessions` | ✅ | admin |
| | DELETE | `/api/admin/sessions/:id` | ✅ | admin |
| | DELETE | `/api/admin/sessions/user/:userId` | ✅ | admin |
| **Admin Registration** | GET | `/api/admin/registration/pending` | ✅ | admin |
| | GET | `/api/admin/users/pending-count` | ✅ | admin |
| | POST | `/api/admin/registration/:id/approve` | ✅ | admin |
| | POST | `/api/admin/registration/:id/reject` | ✅ | admin |
| | POST | `/api/admin/registration/bulk-approve` | ✅ | admin |
| | POST | `/api/admin/registration/bulk-reject` | ✅ | admin |
| **Users** | GET | `/api/users` | ✅ | admin |
| | POST | `/api/users` | ✅ | admin |
| | PATCH | `/api/users/:id` | ✅ | admin |
| | DELETE | `/api/users/:id` | ✅ | admin |
| **Push** | GET | `/api/push/vapid-public-key` | — | — |
| | POST | `/api/push/subscribe` | ✅ | — |
| | DELETE | `/api/push/unsubscribe` | ✅ | — |
| **Misc** | GET | `/api/healthz` | — | Public |
| | GET | `/api/audit-logs` | ✅ | admin |
| | GET/PATCH | `/api/settings` | ✅ | admin (write) |
| | GET/PATCH | `/api/profile` | ✅ | — |
| | GET/PATCH | `/api/preferences` | ✅ | — |
| | GET/POST | `/api/notifications` | ✅ | — |

---

## 6. Frontend — React SPA

### 6.1 App Bootstrap & Routing

`App.tsx` wraps everything in:
- `QueryClientProvider` (React Query)
- `AuthProvider` (auth context + offline session cache)
- `ThemeProvider`
- `Toaster`

`<Router />` uses `wouter`. Protected routes use a `<ProtectedRoute>` component that checks `useAuth()` — redirects to `/login` if unauthenticated.

**Page transitions:** Framer Motion `<motion.div>` with `opacity` + `y` animation. **Never add `willChange: transform`** — it creates a new CSS containing block and breaks `position: fixed` on the bottom nav bar.

### 6.2 Pages Reference

| Path | Page | Access | Notes |
|------|------|--------|-------|
| `/login` | `login.tsx` | Public | 4-step forgot-password embedded inline (v2.2) |
| `/register` | `register.tsx` | Public | Self-registration + PasswordStrength meter |
| `/forgot-password` | `forgot-password.tsx` | Public | Kept for direct link compat; flow now lives in login.tsx |
| `/` | `dashboard.tsx` | All roles | Offline cache fallback |
| `/ledger` | `ledger.tsx` | All roles | Offline queue support |
| `/aeps` | `aeps.tsx` | All roles | Per-user daily sessions |
| `/udhari` | `udhari.tsx` | All roles | Customer credit list |
| `/udhari/:id` | `udhari-customer.tsx` | All roles | Per-customer ledger |
| `/services` | `services.tsx` | All roles | |
| `/reports` | `reports.tsx` | All roles | Separate MobileReports + DesktopReports (v2.2) |
| `/notifications` | `notifications.tsx` | All roles | |
| `/profile` | `profile.tsx` | All roles | **Unified Profile + Settings (v2.3)** — Personal Info, Security, Sessions (embedded), Preferences, Business Info (admin), System (admin). Desktop V5: Command Center banner + two-column grid. Mobile V3: iOS drill-in. |
| `/settings` | — | — | Deleted. Route redirects to `/profile` via `App.tsx`. File removed. |
| `/sessions` | `sessions.tsx` | All roles | Standalone device management + revoke (still accessible; same UI also embedded in `/profile`) |
| `/pwa-status` | `pwa-status.tsx` | All roles | Network, sync, storage, push status |
| `/receipts/verify/:token` | `receipts-verify.tsx` | Public | QR scan target — no auth |
| `/users` | `users.tsx` | admin | User management — tabs: Pending (bulk approve/reject + bulk reject dialog) · Active · All Users · Cash Overview · **Sessions** (view + revoke all users' sessions) |
| `/users-overview` | `users-overview.tsx` | admin | Cross-user balance view |
| `/audit-logs` | `audit-logs.tsx` | admin | Full audit trail |
| `/backups` | `backups.tsx` | admin | pg_dump backup/restore |

### 6.3 Design System

#### Mobile design language (all pages)

Every mobile page follows this pattern established in the Dashboard and extended across Reports, Ledger, AePS, Udhari:

**Stat cards:**
```
white bg-white rounded-2xl overflow-hidden
├── 3px colored top accent stripe  (background: linear-gradient)
└── body p-3 / p-3.5
    ├── label: 9-10px ALL CAPS, color #94a3b8, letter-spacing 0.06em
    ├── icon badge: 26-30px, rounded-lg/rounded-xl, background: gradient, no flat bg-*
    └── value: 15-19px font-black, color #0b2c60
box-shadow: 0 2px 12px rgba(11,44,96,0.08)
```

**Mobile header (layout.tsx):**  
Three-layer structure:
1. 3px gradient accent stripe (navy → saffron)
2. 60px white frosted main bar: logo + brand name left, bell + avatar chip right
3. 44px navy gradient greeting sub-bar: time-based greeting + short date

**Icon badges:** Always `background: linear-gradient(...)` inline style — never flat `bg-*` Tailwind classes (gradients don't work through Tailwind's JIT in this context).

#### Desktop design language

- Left sidebar: white card with accent stripe, nav items with active highlight
- Content: 4-column stat grid, white cards with 3px top stripe + `box-shadow: 0 2px 16px rgba(11,44,96,0.09)`
- Tables: clean dividers, hover states, badge pills for counts, colored amounts
- Charts: 200–260px height, CartesianGrid, styled tooltips, Legend

#### Profile page desktop V5 (v2.3) — Command Center banner + two-column grid

`profile.tsx` desktop uses a full-width navy Command Center banner that breaks out of layout padding, followed by a responsive two-column card grid. No sticky side-nav, no anchor-based scroll links.

```
┌──────────────────────────────────────────────────────────────┐
│  COMMAND BANNER  (navy gradient, -mx-8 -mt-8 px-8 py-6)      │
│  [Avatar 80px]  Full Name · email · mobile · role badge      │
│                              [Sessions] [Role] [Sess. Length]│
└──────────────────────────────────────────────────────────────┘
┌────────────────────────────────┐ ┌────────────────────────┐
│  Personal Information          │ │  Preferences           │
│  (2-col form grid)             │ ├────────────────────────┤
│  Security                      │ │  Business Info  [Admin]│
│  (password form)               │ │  (orange border)       │
│  Active Sessions               │ ├────────────────────────┤
│  (sessions UI)                 │ │  System Sett.   [Admin]│
└────────────────────────────────┘ └────────────────────────┘
```

**Command Banner:** `linear-gradient(135deg, #0b2c60, #0d3270, #0f3872)` breaking out with `-mx-8 -mt-8 mb-6`. KPI strip on the right shows total sessions, role, session length.

**Grid:** `gridTemplateColumns: "1fr 300px"; gap: 24px`. Left column holds Personal Info → Security → Sessions. Right column holds Preferences → Business Info (admin) → System (admin).

**`CmdCard` component:** `rounded-xl border bg-card shadow-sm`. Header: icon badge + title + optional `Admin` orange badge. Admin cards use `border-orange-200` + `bg-orange-50/60` header. No `SectionBlock`, no `activeAnchor` state, no `ALL_NAV` array.

#### Profile page mobile V3 (v2.3) — iOS-style drill-in

```
Home screen:                   Drill-in (e.g. Security):
┌───────────────────────┐      ┌───────────────────────┐
│ Avatar + name + badge │      │ ← Back  Security      │
├───────────────────────┤      ├───────────────────────┤
│ My Profile        ❯   │      │  [Change Password form]│
│ Security          ❯   │      │  [Sessions list]       │
│ Preferences       ❯   │      │  [Logout Others]       │
│ Business Info ❯ [ADM] │      │  [Logout All]          │
│ System        ❯ [ADM] │      └───────────────────────┘
└───────────────────────┘
```

- Home screen state: `mobileSection === null`
- Drill-in: `setMobileSection("security")` etc.
- Back button: `setMobileSection(null)`
- Sessions embedded inside Security panel in a compact card list + bulk-action buttons

#### Reports page (v2.2) — dual-component architecture

`reports.tsx` exports a single `Reports` default that uses `useIsMobile()` to branch:
- `<MobileReports />` — horizontal scrollable tab chips, collapsible filter tray, mobile stat cards, compact charts
- `<DesktopReports />` — fixed left sidebar (nav + filters), 4-across stat grid, full-width charts, data tables

Both share:
- `useFilterState()` — all date/period state in one hook
- `useReportsData()` — all four API queries in one hook

### 6.4 Hooks Reference

| Hook | Returns | Notes |
|------|---------|-------|
| `useAuth()` | `{ user, login, logout, isLoading }` | AuthContext; offline session in IndexedDB `user_session` (24h) |
| `useIsMobile()` | `boolean` | Breakpoint hook; triggers re-render on resize |
| `useNetworkStatus()` | `{ isOnline, isOffline, isSlow, quality, latency }` | Probes every 30s; listens to `navigator.connection` |
| `useSync()` | `{ syncStatus, pendingCount, lastSyncTime, syncNow }` | Subscribes to `SyncEngine` |
| `usePwa()` | `{ isInstallable, isInstalled, promptInstall, ... }` | Install prompt, badge, wake lock, share |
| `usePushNotifications()` | `{ isSubscribed, subscribe, unsubscribe }` | VAPID push subscription |
| `useIdleTimer()` | `{ isWarning, remaining, resetTimer }` | 30 min idle → logout; 2 min warning dialog |
| `useDevice()` | `{ deviceType }` | `mobile / tablet / desktop` |
| `useToast()` | `{ toast }` | shadcn toast |

**Critical auth loading guard:**  
In `use-auth.tsx`: `isLoading = liveLoading || !offlineChecked` (using `||`, not `&&`).  
Using `&&` causes a brief unauthenticated flash on page refresh because the offline check resolves before the live fetch, briefly setting `user = null` and triggering a login redirect.

### 6.5 Data Fetching

- All API queries use **React Query** hooks auto-generated by Orval from `openapi.yaml`
- Generated code lives in `lib/api-client-react/src/generated/` — **never edit directly**
- Regenerate after any OpenAPI spec change: `pnpm --filter @workspace/api-spec run codegen`
- `customFetch` in `lib/api-client-react/src/custom-fetch.ts` wraps `fetch` with credentials + base URL

**Post-login cache set:**  
After a successful login, `handleLogin` calls `queryClient.setQueryData(["auth/me"], userData)` directly from the login response body.  
A `queryClient.invalidateQueries(["auth/me"])` refetch causes a race condition through the Replit proxy (cookie not yet forwarded → 401 → user = null → redirect cancelled).

---

## 7. Login & Auth UX (v2.2)

### Inline forgot-password flow

The login page (`login.tsx`) embeds the full 4-step password reset flow inline using `AnimatePresence`. Clicking "Forgot Password?" does **not** navigate away — the reset form slides in within the same card.

Steps:
1. **Identifier** — enter username / email / mobile
2. **OTP** — 6-digit code sent to masked email; 120-second resend cooldown
3. **New Password** — enforces policy (8+ chars, upper + lower + number)
4. **Success** — auto-advances back to login

Both `MobileLogin` and `DesktopLogin` manage their own `showForgot` state and animate between the login form and the reset steps with `x` slide + `opacity`.

### Login attempt counter (v2.2)

After the first wrong password, a counter widget animates in between the "Remember me" row and the Login button:

- 5 progress bars (filled dots) — each increments with a pop animation on new failure
- Color escalates: amber (3+ left) → orange (2 left) → red (1 left)
- "X/5 used" counter in the top-right corner
- Security badge below the button swaps from green "100% Secure" to a red/orange "Use Forgot Password to reset safely" warning with an inline `onForgotPassword` link

State: `attemptsLeft: number | null` in the root `Login` component. Reset to `null` on successful login. Set from `err.attemptsLeft` returned by the API on wrong-password 401.

### Lockout countdown timer (v2.2)

When an account is locked (5 failed attempts), the API returns `{ locked: true, lockedUntil: ISO }`.

The login form:
- Sets `lockoutUntil: Date | null` state from `err.lockedUntil`
- `useLockoutCountdown(lockoutUntil, onExpired)` hook ticks every second, computes `MM:SS` display + draining `progress` (0–1)
- Form fields animate out; a lockout panel animates in:
  - Red draining progress bar (drains from 100% to 0% over 15 minutes)
  - Shaking red lock icon badge
  - Large `MM:SS` countdown — turns brighter crimson in the last 60 seconds, each tick has a scale pulse
  - "Reset password instead →" button opens the inline forgot-password flow
- When timer hits zero: `onLockoutExpired` clears state, shows "Lockout lifted" toast, form slides back in — no page refresh needed

### Password policy (enforced at registration + reset)

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Account lockout

- 5 failed attempts → `LOCKED` status, `lockedUntil = now + 15 min`
- Auto-unlock: if `lockedUntil <= now()` at next login attempt, status resets to `ACTIVE` automatically
- Frontend idle timeout: 30 minutes of inactivity → auto-logout; 2-minute warning dialog appears with live countdown

---

## 8. Business Modules

### 8.1 Ledger & Running Balance

- Per-user transaction ledger (credit / debit)
- **Running balance** computed at insert time: `SUM(credit) - SUM(debit)` of all prior entries for that user
- `balance` is a snapshot stored on each row — it does not update retroactively when old entries change
- Paginated (15/page), filters: date range, customer name, service type
- **Offline support**: new entries created offline saved to IndexedDB `pending_ledger`; auto-synced on reconnect via `SyncEngine`

**Receipt system:**
- Every new entry gets `receipt_number = CSC-YYYY-NNNN` via atomic `INSERT … ON CONFLICT DO UPDATE` on `receipt_counters`
- Year derived from entry `date` field (not wall clock), so backdated entries use the correct counter
- `receipt_token = crypto.randomUUID()` — used in QR URL; not the sequential number (prevents enumeration)
- Public verify endpoint: `GET /api/receipts/verify/:token` — no auth, returns only display-safe fields
- Receipt PDF: `html2canvas` + `jsPDF` client-side; backend stays stateless

### 8.2 AePS Cash Management

- One `aeps_daily` session per `(date, created_by)` — each user has their own daily float
- Opening balance set at session start; individual `aeps_transactions` linked to the session
- Running balance computed in API response at query time
- **Hero card** in the UI: full-width navy gradient, 44px amount, session notes pill, mini stats row

### 8.3 Udhari Khata

- Per-user customer credit ledger ("You Gave / You Got")
- `udhari_customers.balance` recalculated server-side (`recalcBalance(customerId)`) after every entry change — never trust a client-supplied balance
- **Balance sign convention:** `balance > 0` = customer owes you (orange "To Collect"); `balance < 0` = you owe (green "To Pay"); `0` = settled
- **Entry types:** `gave` (you gave credit → balance increases) / `got` (payment received → balance decreases)
- Features: WhatsApp reminder message, PDF statement export, dashboard summary card
- Cache invalidation: every mutation invalidates `/api/udhari/customers`, `/api/udhari/customers/:id`, `/api/udhari/customers/:id/entries`, `/api/udhari/summary` — all four keys

### 8.4 Receipt System

- See Ledger section above for implementation details
- `ReceiptModal` (in-app) and `receipts-verify.tsx` (public) share identical visual design — always keep in sync
- Modal features: QR code, Print popup (browser A5), PDF download, Web Share API
- Business info footer pulled from settings: `businessName`, `businessAddress`, `businessMobile`, `businessWebsite`

### 8.5 Reports & Dashboard (v2.2)

**Four report types:**

| Type | Endpoint | Contents |
|------|----------|---------|
| Daily | `/api/reports/daily?date=` | Day summary, top services, AePS stats |
| Monthly | `/api/reports/monthly?year=&month=` | Monthly totals, daily breakdown (chart), AePS |
| AePS range | `/api/reports/aeps?startDate=&endDate=` | AePS-only stats + day-wise table |
| Service breakdown | `/api/reports/service-breakdown` | Per-service count + revenue (all time) |
| Excel export | `/api/reports/export?startDate=&endDate=` | `.xlsx` with Ledger + AePS sheets |

**Reports page architecture (v2.2 redesign):**

`reports.tsx` uses `useIsMobile()` to render two completely separate components:

`MobileReports`:
- Horizontal scrollable tab chips with gradient active state
- Collapsible filter tray (contextual to active tab)
- 2-col stat card grid with accent stripe + gradient icon badge
- Full-width charts (BarChart with Recharts)
- Compact day-wise AePS cards

`DesktopReports`:
- Fixed 256px left sidebar: nav panel + filter panel (filters change with active tab)
- 4-across stat card grid (larger: 24px font, 36px icon badge)
- Charts at 200–260px height with CartesianGrid + Legend + styled tooltip
- Data tables with hover states, colored badge pills, `UPPERCASE TRACKING` headers
- Services tab: side-by-side pie chart + detail table

**Shared hooks:**
```ts
useFilterState()   // dailyDate, reportYear, reportMonth, aepsStart, aepsEnd
useReportsData()   // wraps all four API queries in one hook
```

---

## 9. PWA & Offline Architecture

### Service Worker (Workbox — injectManifest mode)

| Route pattern | Strategy | Cache name | TTL |
|---------------|----------|------------|-----|
| `/api/auth/*` | NetworkOnly | — | — |
| `/api/dashboard` | StaleWhileRevalidate | api-dashboard | 5 min |
| `/api/reports/*` | StaleWhileRevalidate | api-reports | 10 min |
| `/api/settings` | StaleWhileRevalidate | api-settings | 30 min |
| `/api/profile` | StaleWhileRevalidate | api-profile | 5 min |
| `/api/preferences` | StaleWhileRevalidate | api-preferences | 30 min |
| `/api/ledger/*` | NetworkFirst | api-ledger | 5 min, 8s timeout |
| `/api/services` | NetworkFirst | api-services | 1 hr, 8s timeout |
| `/api/notifications` | NetworkFirst | api-notifications | 2 min, 8s timeout |
| Images | CacheFirst | image-cache | 30 days |
| Fonts | CacheFirst | font-cache | 1 year |

### IndexedDB (v2 — 5 stores)

| Store | Purpose | Expiry |
|-------|---------|--------|
| `pending_ledger` | Offline ledger queue | Cleared after sync |
| `cache_store` | Generic KV cache (dashboard etc.) | Configurable TTL |
| `user_session` | Cached auth session for offline login | 24 hours |
| `cached_reports` | Previously loaded reports | Configurable TTL |
| `pending_notifications` | Notifications queued offline | Cleared when read |

### Sync Engine

`SyncEngine` (singleton in `lib/sync-engine.ts`):
- Triggers `sync()` on `window.online` event and on startup if already online
- POSTs each `pending_ledger` entry to `/api/ledger`
- Max 3 retries per entry; then marks as `partial` error
- Dispatches `sahu-sync-complete` event for reactive UI
- States: `idle | syncing | partial | error`

### Network status

`useNetworkStatus()` — listens to `window.online/offline` + `navigator.connection` change events + probes a HEAD request every 30 seconds. Returns `{ isOnline, isOffline, isSlow, quality, latency }`.

### Push notifications (VAPID)

- `lib/vapid.ts` — `ensureVapidKeys()` called at Express startup; uses env vars if set, otherwise generates ephemeral keys (lost on restart)
- Set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL` in Replit Secrets for production persistence
- `sendPushToUser(userId, payload)` and `sendPushToAll(payload)` in `lib/push.ts`
- Push unsubscribe is owner-only: deletes `WHERE endpoint = ? AND userId = currentUser`

### PWA Manifest (key fields)

```json
{
  "name": "SAHU CSC — Common Service Center",
  "short_name": "SAHU CSC",
  "display": "standalone",
  "theme_color": "#0b2c60",
  "shortcuts": [
    { "name": "Dashboard", "url": "/?source=shortcut" },
    { "name": "New Ledger Entry", "url": "/ledger?new=1&source=shortcut" },
    { "name": "AePS Cash", "url": "/aeps?source=shortcut" },
    { "name": "Reports", "url": "/reports?source=shortcut" }
  ]
}
```

### Android TWA

Digital Asset Links: `public/.well-known/assetlinks.json`  
Config: `infrastructure/twa/twa-config.json`  
Build via Bubblewrap CLI after deploying to Replit (requires live HTTPS URL for assetlinks).

---

## 10. Security Model

| Control | Implementation |
|---------|---------------|
| Session storage | PostgreSQL (`connect-pg-simple`) — survives server restarts |
| Password hashing | bcrypt 12 rounds |
| Account locking | 5 failed → `LOCKED` for 15 min; auto-unlock on next attempt if window expired |
| Idle timeout | 30 min — `useIdleTimer` in `Layout` applies globally |
| Rate limiting | 500 req/15 min global; 20 req/15 min on `/api/auth/login` |
| RBAC | `requirePermission()` middleware on every data route |
| IDOR prevention | Non-admin routes filter by `created_by = req.session.userId` |
| Audit trail | All security events written to `audit_logs` |
| Header security | `helmet()` — CSP, HSTS, X-Content-Type-Options, etc. |
| Parameter pollution | `hpp()` |
| Notification isolation | `userId = null` only for true system-wide broadcasts; all other events are user-scoped |
| Push unsubscribe | Owner-only delete (endpoint + userId match) |
| Receipt enumeration | Sequential `CSC-YYYY-NNNN` number never in public URL; UUID token used instead |
| OTP enumeration | `send-otp` with unknown identifier returns HTTP 200 with `maskedEmail: null` — never 404 |

---

## 11. Per-User Data Isolation

All primary data tables are filtered by `created_by = userId`. No route crosses user boundaries except the `/api/admin/*` endpoints which are admin-only and use separate query paths.

| Data | Isolated by |
|------|-------------|
| Ledger entries + balance | `created_by` |
| AePS daily sessions + transactions | `created_by` |
| Dashboard stats | `created_by` |
| Reports | `created_by` |
| Excel export | `created_by` |
| Udhari customers + entries | `created_by` |
| Notifications | `userId` (null = true broadcast only) |
| Push subscriptions | `userId` |

Admin oversight (`/api/admin/*`) aggregates across users but is separate from the admin's own personal data.

---

## 12. OpenAPI Contract-First Design

1. `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
2. `pnpm --filter @workspace/api-spec run codegen` — runs Orval to regenerate:
   - `lib/api-client-react/src/generated/` — typed React Query hooks + Zod schemas
3. **Never edit generated files directly**
4. Run codegen after every OpenAPI spec change before touching frontend code

---

## 13. Environment & Secrets

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Express session signing secret |
| `VAPID_PUBLIC_KEY` | Recommended | Web push public key (persistent across restarts) |
| `VAPID_PRIVATE_KEY` | Recommended | Web push private key |
| `VAPID_EMAIL` | Optional | Default: `mailto:admin@sahucsc.in` |

> If VAPID keys are not set, ephemeral keys are generated at startup — push subscriptions are lost on server restart.

### Dev ports

| Service | Port | Mapped |
|---------|------|--------|
| Frontend (Vite) | 5000 | → external port 80 (Replit proxy) |
| API (Express) | 8082 | Internal only; proxied by Vite |
| Mockup sandbox | 8081 | Canvas preview |

> Port 8080 is reserved by a Replit artifact workflow — API uses 8082.  
> Vite proxy in `vite.config.ts` points to 8082.

---

## 14. Key Architecture Decisions

| Decision | Rule |
|----------|------|
| **Unified Profile page** | `/profile` is the single page for all profile + settings. `/settings` redirects there. Desktop V3: sticky side-nav anchors + full-page scroll. Mobile V3: section list → drill-in. Sessions embedded inline. |
| **Profile side-nav anchors** | Desktop nav uses plain `<a href="#s-id">` anchors (not router), `scrollMarginTop: 72` offsets for app header, `sticky top-[72px]` on the aside |
| **Page transitions** | `motion.div` must NOT have `willChange: transform` — breaks `position: fixed` on the bottom nav |
| **Contract-first API** | OpenAPI → Orval → React Query hooks; never edit generated files |
| **Session-based auth** | express-session + bcrypt; no JWTs — simpler for single-center use case |
| **PostgreSQL session store** | `connect-pg-simple` must stay in esbuild `external` array — bundling breaks its internal `table.sql` path and sessions silently fail |
| **Post-login auth cache** | `queryClient.setQueryData(["auth/me"], data)` directly from login response; refetch causes race condition through Replit proxy |
| **Auth loading guard** | `isLoading = liveLoading \|\| !offlineChecked` (OR, not AND) — prevents flash logout on refresh |
| **V2 multi-device sessions** | `user_sessions` table; `requireAuth` checks it first, falls back to V1 `activeSessionToken` |
| **Money as `numeric`** | Drizzle returns numeric as string; always `parseFloat()` before returning from routes |
| **Running balance at insert** | Computed from SUM of prior entries — not retroactively updated when old entries change |
| **AePS sessions** | Unique per `(date, created_by)` — each user owns their own daily session |
| **Udhari balance** | Server-recalculated after every entry change via `recalcBalance()` — never trust client-supplied balance |
| **Receipt token vs number** | Sequential number in display only; UUID token in public URL to prevent enumeration |
| **Schema changes** | Use raw `ALTER TABLE … ADD COLUMN IF NOT EXISTS` for non-interactive environments — `drizzle-kit push` requires TTY |
| **Receipt PDF** | Client-side via html2canvas + jsPDF — backend stays stateless |
| **Notification `null` userId** | Only true system-wide broadcast; all user-specific events must pass explicit `userId` |
| **Idle timeout in Layout** | `useIdleTimer` called in `Layout` (not pages) so timeout is global |
| **`parseDevice` once per request** | Called before all failure/success branches in login handler to avoid esbuild duplicate-const errors |
| **Responsive layout** | Use Tailwind `sm:hidden / hidden sm:block` for layout; `useIsMobile()` only when behavior (not just layout) differs. Reports page uses `useIsMobile()` because the component architecture is entirely different |
| **Mobile FAB clearance** | `bottom-20` (80px) — bottom nav is ~64px, `bottom-6` places FAB behind it |
| **Udhari cache invalidation** | Every mutation must invalidate all 4 keys: customers list, single customer, entries, summary |
| **OTP resend cooldown** | 120 seconds everywhere — do not change to 60 |
| **send-otp silent on unknown** | Returns 200 with `maskedEmail: null` for unknown identifiers (prevents account enumeration) |
| **React Query clear on logout** | `queryClient.clear()` in `handleLogout` — prevents stale data when switching accounts |
