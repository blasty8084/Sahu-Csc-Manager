# SAHU CSC — Project Reference
**Version 4.5.0 — July 15, 2026**

Complete structural guide for anyone importing or onboarding to this project.

---

## Table of Contents

1. [What This Project Is](#what-this-project-is)
2. [Tech Stack at a Glance](#tech-stack-at-a-glance)
3. [Monorepo Layout](#monorepo-layout)
4. [Getting Started](#getting-started)
5. [Environment Variables & Secrets](#environment-variables--secrets)
6. [Workspace Packages](#workspace-packages)
   - [artifacts/api-server](#artifactsapi-server)
   - [artifacts/sahu-csc](#artifactssahu-csc)
   - [lib/db](#libdb)
   - [lib/api-spec](#libapi-spec)
   - [lib/api-zod](#libapi-zod)
   - [lib/api-client-react](#libapi-client-react)
7. [Database Schema](#database-schema)
8. [API Routes](#api-routes)
9. [Frontend Pages & Components](#frontend-pages--components)
10. [PWA & Offline Support](#pwa--offline-support)
11. [i18n (Internationalisation)](#i18n-internationalisation)
12. [Auth System](#auth-system)
13. [Workflows (Replit)](#workflows-replit)
14. [Scripts](#scripts)
15. [Build System](#build-system)
16. [Key Architectural Decisions](#key-architectural-decisions)

---

## What This Project Is

**SAHU CSC** is a business management platform for Indian Common Service Centres (CSC operators). It covers:

- **Ledger** — daily credit/debit register with PDF receipts and QR verification
- **AePS** — Aadhaar-enabled Payment System cash flow tracking
- **Udhari** — informal credit/lending ledger per customer ("Udhari Khata")
- **Services** — configurable list of services offered at the CSC
- **Reports** — daily and monthly income/expense analytics
- **Admin** — user management, system settings, audit logs, bulk data export
- **Notifications** — per-user and broadcast notification system with Web Push

The app is a full-stack TypeScript monorepo: an Express REST API backed by PostgreSQL and a Vite/React PWA frontend. It runs on **Replit** and is designed to be used offline-first on mobile.

---

## Tech Stack at a Glance

| Layer | Technology |
|---|---|
| Package manager | pnpm workspaces |
| Backend | Node.js · Express · TypeScript |
| Database | PostgreSQL (Replit managed) · Drizzle ORM |
| Frontend | React 19 · Vite 7 · Tailwind CSS v4 |
| State / data fetching | TanStack Query v5 |
| Routing (frontend) | Wouter |
| Forms | React Hook Form + Zod |
| UI components | Radix UI primitives + shadcn/ui conventions |
| Animations | Framer Motion |
| Charts | Recharts |
| i18n | i18next + react-i18next |
| PWA | vite-plugin-pwa (Workbox · injectManifest mode) |
| Session store | connect-pg-simple (PostgreSQL-backed) |
| API type safety | OpenAPI spec → api-zod (Zod schemas) → api-client-react (typed hooks) |
| Build (backend) | esbuild (custom `build.mjs`) |

---

## Monorepo Layout

```
/                               ← repo root
├── pnpm-workspace.yaml         ← workspace globs: artifacts/*, lib/*, scripts
├── package.json                ← root scripts, pnpm catalog (shared versions)
├── pnpm-lock.yaml
├── scripts/
│   ├── post-merge.sh           ← runs after every task-agent merge (pnpm install + db push)
│   ├── start-prod.sh           ← production start script
│   └── start.sh
│
├── artifacts/
│   ├── api-server/             ← Express REST API  (port 8080)
│   ├── sahu-csc/               ← Vite/React PWA    (port 5000)
│   └── mockup-sandbox/         ← UI component preview server (port 3000)
│
└── lib/
    ├── db/                     ← Drizzle ORM schema + shared pool
    ├── api-spec/               ← OpenAPI 3.1 spec (source of truth for API shape)
    ├── api-zod/                ← Zod schemas generated from the spec
    └── api-client-react/       ← TanStack Query hooks generated from the spec
```

---

## Getting Started

> These steps are required every time the project is imported into a fresh Replit environment.

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set secrets

Open **Replit Secrets** and add:

| Secret | Purpose |
|---|---|
| `ADMIN_PASSWORD` | Password for the `admin` account |
| `OPERATOR_PASSWORD` | Password for the `operator` account |
| `SESSION_SECRET` | Random string used to sign HTTP sessions |

Optional secrets (email / push notifications):

| Secret | Purpose |
|---|---|
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (usually 465 or 587) |
| `SMTP_USER` | SMTP login username |
| `SMTP_PASS` | SMTP login password |

> `DATABASE_URL` is injected automatically by Replit's managed PostgreSQL.  
> `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` are auto-generated and persisted in the `settings` table at first boot — do not set them manually.

### 3. Push the database schema

```bash
pnpm --filter @workspace/db run push-force
```

### 4. Create the session table (one-time)

```sql
psql "$DATABASE_URL" -c "
  CREATE TABLE IF NOT EXISTS \"session\" (
    \"sid\"    varchar      NOT NULL COLLATE \"default\",
    \"sess\"   json         NOT NULL,
    \"expire\" timestamp(6) NOT NULL,
    CONSTRAINT \"session_pkey\" PRIMARY KEY (\"sid\")
  );
  CREATE INDEX IF NOT EXISTS \"IDX_session_expire\" ON \"session\" (\"expire\");
"
```

### 5. Seed the database

Run the **Seed Database** workflow in Replit, or:

```bash
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts
```

### 6. Start the workflows

Start these two Replit workflows:

| Workflow | Command | Port |
|---|---|---|
| API Server | `node artifacts/api-server/dist/index.mjs` | 8080 |
| SAHU CSC | `pnpm --filter @workspace/sahu-csc run dev` | 5000 |

The Vite dev server proxies all `/api/*` requests to `localhost:8080`.

---

## Environment Variables & Secrets

| Name | Required | Set by | Purpose |
|---|---|---|---|
| `DATABASE_URL` | ✅ | Replit (auto) | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Replit Secret | Signs HTTP session cookies |
| `ADMIN_PASSWORD` | ✅ | Replit Secret | Seed script — admin user password |
| `OPERATOR_PASSWORD` | ✅ | Replit Secret | Seed script — operator user password |
| `SMTP_HOST` | optional | Replit Secret | Outbound email (password reset, OTP) |
| `SMTP_PORT` | optional | Replit Secret | SMTP port |
| `SMTP_USER` | optional | Replit Secret | SMTP authentication username |
| `SMTP_PASS` | optional | Replit Secret | SMTP authentication password |
| `PORT` | optional | Workflow env | Override default server port |
| `NODE_ENV` | optional | Workflow env | `development` or `production` |

---

## Workspace Packages

---

### artifacts/api-server

**Package name:** `@workspace/api-server`  
**Port:** 8080  
**Entry point:** `src/index.ts` → built to `dist/index.mjs` via `build.mjs`

#### Directory structure

```
artifacts/api-server/
├── build.mjs               ← esbuild bundler script (locks + produces dist/)
├── src/
│   ├── index.ts            ← starts the HTTP server, calls boot init functions
│   ├── app.ts              ← Express app setup (middleware, session, rate limits)
│   ├── routes/
│   │   ├── index.ts        ← mounts all routers in order
│   │   ├── health.ts       ← GET /api/healthz
│   │   ├── auth.ts         ← login, logout, register, OTP verify
│   │   ├── password-reset.ts
│   │   ├── profile.ts      ← GET/PATCH /api/profile
│   │   ├── preferences.ts  ← user notification/display preferences
│   │   ├── ledger.ts       ← CRUD ledger entries + balance
│   │   ├── receipts.ts     ← generate receipt PDF, public QR verify endpoint
│   │   ├── aeps.ts         ← AePS daily summaries + transactions
│   │   ├── udhari.ts       ← Udhari customer + entry CRUD
│   │   ├── services.ts     ← CSC service type management
│   │   ├── reports.ts      ← income/expense analytics, monthly summaries
│   │   ├── notifications.ts← per-user notification list + mark-read
│   │   ├── push.ts         ← Web Push subscription + send
│   │   ├── sessions.ts     ← list/revoke user sessions
│   │   ├── users.ts        ← admin: list/approve/suspend users
│   │   ├── admin.ts        ← admin dashboard stats
│   │   ├── admin-registration.ts ← approve/reject pending registrations
│   │   ├── admin-sessions.ts     ← admin: view all active sessions
│   │   ├── admin-receipt-export.ts ← bulk receipt ZIP export
│   │   ├── audit.ts        ← audit log viewer
│   │   ├── settings.ts     ← system settings (VAPID, app config)
│   │   ├── broadcast.ts    ← send broadcast notifications to all users
│   │   └── setup-status.ts ← /api/setup-status (first-run wizard gate)
│   ├── lib/
│   │   ├── auth.ts         ← requireAuth, requireAdmin middleware
│   │   ├── logger.ts       ← pino logger instance
│   │   ├── mailer.ts       ← Nodemailer transporter + send helpers
│   │   ├── encryption.ts   ← AES-256-GCM field-level encryption helpers
│   │   ├── push.ts         ← web-push send helper + VAPID init
│   │   ├── vapid.ts        ← ensureVapidKeys (auto-generates on first boot)
│   │   ├── notify.ts       ← createNotification (user-scoped)
│   │   ├── sanitize.ts     ← input sanitisation helpers
│   │   ├── jwt.ts          ← JWT utilities (used for receipt tokens)
│   │   ├── otp-cleanup.ts  ← cron: delete expired OTP rows
│   │   ├── password-policy.ts ← password strength rules
│   │   ├── registration-cache.ts ← in-memory pending registration cache
│   │   ├── backup-scheduler.ts   ← cron: scheduled DB backup exports
│   │   ├── monthly-export.ts     ← auto monthly PDF/Excel export helper
│   │   └── boot-tracker.ts       ← tracks first-boot initialisation steps
│   └── services/
│       ├── notificationService.ts  ← high-level notification dispatch
│       └── notificationTemplates.ts← message templates per event type
│   └── scripts/
│       └── seed.ts         ← creates admin + operator users, seeds services
```

#### Middleware stack (in order)

1. `pino-http` — structured request/response logging
2. `helmet` — security headers (CSP disabled for Replit preview)
3. `hpp` — HTTP parameter pollution protection
4. `compression` — gzip responses
5. `express-rate-limit` — 500 req / 15 min globally; 8 req / 15 min on login; 10 req / 15 min on auth writes; 8 req / 15 min on OTP verify
6. `cors` — credentials allowed from any origin (proxied via Replit)
7. `express-session` + `connect-pg-simple` — PostgreSQL-backed sessions (uses shared `pool` from `@workspace/db`)
8. Route handlers

---

### artifacts/sahu-csc

**Package name:** `@workspace/sahu-csc`  
**Port:** 5000 (dev) / built to `dist/public/` for production  
**Entry point:** `src/main.tsx`

#### Directory structure

```
artifacts/sahu-csc/
├── vite.config.ts          ← Vite + TailwindCSS + VitePWA config
├── public/                 ← static assets (sahu-logo.png, PWA icons, favicon)
├── src/
│   ├── main.tsx            ← React root mount, SW registration, sync engine init
│   ├── App.tsx             ← wouter Router + TanStack QueryClient + layout
│   ├── index.css           ← Tailwind base + CSS custom properties
│   ├── pages/              ← one file per route (see Pages table below)
│   ├── components/
│   │   ├── ui/             ← shadcn/ui primitives (button, dialog, card, etc.)
│   │   ├── layout.tsx      ← shell with sidebar (desktop) + bottom nav (mobile)
│   │   ├── app-logo.tsx    ← AppLogo + LoginLogo (both reference sahu-logo.png)
│   │   ├── language-switcher.tsx  ← EN / HI / OR switcher (used inside sidebar)
│   │   ├── sync-status-bar.tsx    ← offline queue pending count banner
│   │   ├── sync-badge.tsx         ← small badge showing pending sync count
│   │   ├── pwa-install-banner.tsx ← "Add to Home Screen" prompt
│   │   ├── receipt-modal.tsx      ← ledger receipt view + QR code
│   │   ├── aeps-receipt-modal.tsx ← AePS receipt view
│   │   ├── udhari-receipt-modal.tsx
│   │   ├── autocomplete-input.tsx ← customer name autocomplete (used in ledger)
│   │   ├── setup-wizard-banner.tsx← first-run configuration prompt
│   │   ├── server-health-banner.tsx
│   │   ├── skeletons.tsx          ← loading skeleton components
│   │   ├── splash-screen.tsx      ← app splash on first load
│   │   ├── theme-provider.tsx     ← next-themes wrapper
│   │   ├── page-skeleton.tsx      ← full-page loading state
│   │   ├── section-loader.tsx
│   │   └── whats-new-modal.tsx    ← version changelog popup
│   └── lib/
│       ├── i18n.ts         ← i18next configuration (reads localStorage "sahu-lang")
│       ├── offline-db.ts   ← IndexedDB wrapper (Dexie) for offline queue
│       ├── sync-engine.ts  ← plays offline queue back to API when online
│       ├── prefetch.ts     ← TanStack Query prefetch helpers
│       ├── pwa-badge.ts    ← app badge count (pending offline entries)
│       └── utils.ts        ← cn(), formatINR(), date helpers
```

#### Pages (src/pages/)

| File | Route | Who can access |
|---|---|---|
| `login.tsx` | `/login` | public |
| `register.tsx` | `/register` | public |
| `register-pending.tsx` | `/register-pending` | public |
| `register-closed.tsx` | `/register-closed` | public |
| `forgot-password.tsx` | `/forgot-password` | public |
| `reset-password.tsx` | `/reset-password` | public |
| `aeps-receipt-verify.tsx` | `/aeps-receipt/:token` | public |
| `receipts-verify.tsx` | `/receipt/:token` | public |
| `udhari-receipt-verify.tsx` | `/udhari-receipt/:token` | public |
| `download-app.tsx` | `/download` | public |
| `dashboard.tsx` | `/` | authenticated |
| `ledger.tsx` | `/ledger` | authenticated |
| `aeps.tsx` | `/aeps` | authenticated |
| `udhari.tsx` | `/udhari` | authenticated |
| `udhari-customer.tsx` | `/udhari/:id` | authenticated |
| `reports.tsx` | `/reports` | authenticated |
| `services.tsx` | `/services` | authenticated |
| `notifications.tsx` | `/notifications` | authenticated |
| `profile.tsx` | `/profile` | authenticated |
| `preferences.tsx` | `/preferences` | authenticated |
| `sessions.tsx` | `/sessions` | authenticated |
| `pwa-status.tsx` | `/pwa-status` | authenticated |
| `offline.tsx` | `/offline` | authenticated |
| `receipt-export.tsx` | `/receipts` | authenticated |
| `server-health.tsx` | `/server-health` | authenticated |
| `about.tsx` | `/about` | authenticated |
| `users.tsx` | `/users` | admin only |
| `audit-logs.tsx` | `/audit` | admin only |
| `backups.tsx` | `/backups` | admin only |
| `broadcast.tsx` | `/broadcast` | admin only |
| `not-found.tsx` | `*` | all |

---

### lib/db

**Package name:** `@workspace/db`  
**Purpose:** Single source of truth for the PostgreSQL schema. Exports the Drizzle `db` instance, all table definitions, and the shared `pool` (used by both the ORM and the session store).

```
lib/db/
├── drizzle.config.ts       ← dialect: postgresql, schema: src/schema/index.ts
└── src/
    ├── index.ts            ← exports db, pool, and all table objects
    └── schema/
        ├── index.ts        ← re-exports all schema files
        ├── users.ts
        ├── ledger.ts
        ├── aeps.ts
        ├── udhari.ts
        ├── notifications.ts
        ├── services.ts
        ├── settings.ts
        ├── audit_logs.ts
        ├── user_sessions.ts
        ├── user_preferences.ts
        ├── user_notification_preferences.ts
        ├── push_subscriptions.ts
        ├── receipt_counters.ts
        ├── password_reset_tokens.ts
        ├── email_otps.ts
        └── broadcast_logs.ts
```

**Scripts:**

| Command | What it does |
|---|---|
| `pnpm --filter @workspace/db run push-force` | Runs `drizzle-kit push` to sync schema to the database (no migration files) |

> The `session` table is excluded from drizzle management (`tablesFilter: ["!session"]`) and must be created manually via the SQL in [Getting Started](#getting-started).

---

### lib/api-spec

**Package name:** `@workspace/api-spec`  
**Purpose:** OpenAPI 3.1 YAML file (`openapi.yaml`) that is the single source of truth for the API contract. Do not edit route shapes without updating this file.

**API groups defined:**  
`health` · `auth` · `profile` · `preferences` · `ledger` · `services` · `users` · `reports` · `notifications` · `audit` · `settings` · `backups` · `dashboard` · `udhari` · `aeps` · `push` · `sessions` · `receipts` · `broadcast` · `admin`

---

### lib/api-zod

**Package name:** `@workspace/api-zod`  
**Purpose:** Zod request/response schemas generated from `lib/api-spec`. Used by both the frontend and backend for runtime validation.

---

### lib/api-client-react

**Package name:** `@workspace/api-client-react`  
**Purpose:** TanStack Query hooks generated from `lib/api-spec`. Consumed by every page in `artifacts/sahu-csc`. Provides typed `useQuery` / `useMutation` calls for every API endpoint — no manual `fetch` in page components.

---

## Database Schema

### Table overview

| Table | Purpose |
|---|---|
| `users` | Operator/admin accounts. Roles: `admin`, `operator`, `user`. Status: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `LOCKED`, `DELETED` |
| `session` | connect-pg-simple HTTP session store (managed outside Drizzle) |
| `user_sessions` | V2 multi-device session tracking (device, browser, OS, IP, expiry) |
| `user_preferences` | Per-user display and notification preferences |
| `user_notification_preferences` | Fine-grained notification channel preferences |
| `ledger` | Main transaction register. Each row has a running `balance`, optional `receiptNumber` (CSC-YYYY-NNNN) and `receiptToken` (UUID for QR) |
| `receipt_counters` | Atomic per-year receipt sequence counter (prevents duplicate numbers) |
| `aeps_daily` | AePS opening balance summary per operator per date (unique constraint) |
| `aeps_transactions` | Individual AePS withdrawal/deposit entries linked to `aeps_daily` |
| `udhari_customers` | Credit-ledger customers with a running `balance` field |
| `udhari_entries` | Individual give/got entries per udhari customer |
| `services` | Configurable list of services offered at the CSC (name, price, active) |
| `notifications` | In-app notifications. `userId = NULL` means broadcast to all users |
| `push_subscriptions` | Web Push endpoint + auth keys per device |
| `audit_logs` | Append-only record of every write action (who, what, when, IP) |
| `settings` | Key-value store for system config (VAPID keys, app name, etc.) |
| `password_reset_tokens` | Short-lived tokens for the forgot-password flow |
| `email_otps` | Short-lived numeric OTPs for email verification |
| `broadcast_logs` | Record of admin broadcast messages sent |

### Key schema notes

- All monetary columns use `numeric(12, 2)` — never `float`.
- Dates in `ledger` and `udhari` are stored as `text` (`YYYY-MM-DD`) to avoid timezone drift on a per-day field.
- `ledger.balance` is a running balance calculated at write time — not computed on read.
- Receipt numbers follow the pattern `CSC-YYYY-NNNN` using an atomic upsert on `receipt_counters` so there are no gaps or duplicates.
- `users.activeSessionToken` is kept for V1 backward-compatibility; V2 uses `user_sessions`.

---

## API Routes

All routes are mounted under `/api`. The full contract is in `lib/api-spec/openapi.yaml`.

| Router file | Path prefix | Key operations |
|---|---|---|
| `health.ts` | `/healthz` | Server liveness check |
| `setup-status.ts` | `/setup-status` | First-run wizard gate |
| `auth.ts` | `/auth/*` | Login · logout · register · OTP verify |
| `password-reset.ts` | `/auth/forgot-password`, `/auth/reset-password` | Email-based reset flow |
| `profile.ts` | `/profile` | Get + update own profile |
| `preferences.ts` | `/preferences` | Get + update user preferences |
| `sessions.ts` | `/sessions` | List + revoke own sessions |
| `ledger.ts` | `/ledger` | CRUD entries · balance · quick-search |
| `receipts.ts` | `/receipts`, `/receipts/verify/:token` | Generate PDF · public QR verify |
| `aeps.ts` | `/aeps` | Daily summary + transaction CRUD |
| `udhari.ts` | `/udhari` | Customer + entry CRUD |
| `services.ts` | `/services` | Service type CRUD |
| `reports.ts` | `/reports` | Income/expense summary · monthly breakdown |
| `notifications.ts` | `/notifications` | List · mark-read · delete |
| `push.ts` | `/push` | Subscribe · unsubscribe · send test |
| `settings.ts` | `/settings` | Get + update system settings |
| `audit.ts` | `/audit` | Read-only audit log with filters |
| `users.ts` | `/users` | Admin: list · approve · suspend · delete |
| `admin.ts` | `/admin/*` | Admin dashboard stats |
| `admin-registration.ts` | `/admin/registrations` | Approve/reject pending registrations |
| `admin-sessions.ts` | `/admin/sessions` | View + revoke all active sessions |
| `admin-receipt-export.ts` | `/admin/receipts/export` | ZIP export of all receipts |
| `broadcast.ts` | `/broadcast` | Send broadcast notification to all users |

---

## Frontend Pages & Components

### Routing

Uses **Wouter** (lightweight client-side router). Route definitions are in `App.tsx`. Protected routes check the `/api/auth/me` query — unauthenticated users are redirected to `/login`.

### Layout shell (`components/layout.tsx`)

- **Desktop:** 240 px left sidebar with navigation links, language switcher, user menu.
- **Mobile:** Top header (3-layer: accent stripe + white bar + navy sub-bar) + bottom navigation bar (5 tabs). The bottom nav uses `position: fixed` — no ancestor element may have `willChange: transform` as it would break fixed positioning.

### Component library

All base components live in `src/components/ui/` following shadcn/ui conventions (Radix UI primitives + CVA variants + Tailwind). Do not add new base components elsewhere.

---

## PWA & Offline Support

### Service worker

Built with **vite-plugin-pwa** in `injectManifest` mode. The custom service worker source is `src/sw.ts`. Workbox strategies:

| Route pattern | Strategy |
|---|---|
| Navigation requests | NetworkFirst |
| `/api/*` | NetworkFirst (cache fallback for GET) |
| Static assets (JS/CSS) | CacheFirst |
| Images | StaleWhileRevalidate |

### Offline ledger queue

When the device is offline, new ledger entries are written to **IndexedDB** (via `lib/offline-db.ts` using Dexie). The sync engine (`lib/sync-engine.ts`) replays the queue when connectivity is restored, using the Background Sync API where available. The pending count is reflected in `sync-badge.tsx` and the app badge via `lib/pwa-badge.ts`.

### Push notifications

Web Push is implemented with the `web-push` library. VAPID keys are auto-generated at first boot and stored in the `settings` table. Subscriptions are stored in `push_subscriptions`. Send calls go through `src/lib/push.ts`.

---

## i18n (Internationalisation)

Uses **i18next** + **react-i18next**.

| Language | Code | Locale file |
|---|---|---|
| English | `en` | `src/locales/en/translation.json` |
| Hindi | `hi` | `src/locales/hi/translation.json` |
| Odia | `or` | `src/locales/or/translation.json` |

The selected language is persisted to `localStorage` under the key `sahu-lang`. The `LanguageSwitcher` component in the sidebar lets users change it at runtime. All pages import `useTranslation` from react-i18next.

---

## Auth System

### Session-based auth (HTTP sessions)

Sessions are stored in PostgreSQL via `connect-pg-simple`. The shared `pool` from `@workspace/db` is passed directly to the session store — **do not** create a separate pool in the session config (it causes silent session loss through Replit's proxy).

`connect-pg-simple` must remain in the `external` list of `build.mjs` — esbuild bundling breaks its internal `table.sql` path lookup.

### Middleware

`requireAuth` (in `src/lib/auth.ts`) validates:
1. `req.session.sessionId` against the `user_sessions` table (V2).
2. Falls back to `req.session.activeSessionToken` against `users.activeSessionToken` (V1 backward-compat).

`requireAdmin` extends `requireAuth` and additionally checks `user.role === 'admin'`.

### User roles

| Role | Access |
|---|---|
| `admin` | Full access including user management, audit logs, broadcast, bulk export |
| `operator` | Own ledger, AePS, Udhari, services, reports, profile |
| `user` | Reserved for future use |

### Multi-device sessions

Each login creates a row in `user_sessions` with device info, browser, OS, IP, expiry, and a unique `sessionId`. Users can list and revoke their own sessions from the Sessions page. Admins can view and revoke all sessions.

### Account lifecycle

Registrations require admin approval. Status values: `ACTIVE` → `INACTIVE` → `SUSPENDED` → `LOCKED` (after failed login attempts) → `DELETED`. Locked accounts have a `lockedUntil` timestamp.

---

## Workflows (Replit)

| Workflow name | Command | Port | Purpose |
|---|---|---|---|
| API Server | `[ -f artifacts/api-server/dist/index.mjs ] \|\| node artifacts/api-server/build.mjs && PORT=8080 NODE_ENV=development node --enable-source-maps artifacts/api-server/dist/index.mjs` | 8080 | Express REST API |
| SAHU CSC | `PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run dev` | 5000 | Vite dev server (frontend) |
| Seed Database | `PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts` | — | One-time seed |
| Component Preview Server | `pnpm --filter @workspace/mockup-sandbox run dev` | 3000 | UI mockup sandbox |

> The API workflow builds the backend before starting it. If you change backend source, stop and restart the **API Server** workflow — it will rebuild automatically.

---

## Scripts

### `scripts/post-merge.sh`

Runs automatically after every task-agent merge via the Replit platform:
1. `pnpm install --frozen-lockfile`
2. `pnpm --filter @workspace/db run push-force` — pushes any schema changes
3. Creates the `session` table if it doesn't exist

### `artifacts/api-server/src/scripts/seed.ts`

Creates (or resets) the `admin` and `operator` users using `ADMIN_PASSWORD` and `OPERATOR_PASSWORD` secrets. Also seeds default services, settings, and notifications. Safe to re-run — uses `onConflictDoUpdate`.

---

## Build System

### Backend (`artifacts/api-server/build.mjs`)

- **Tool:** esbuild, ESM output (`.mjs`)
- **Entrypoints:** `src/index.ts` and `src/scripts/seed.ts`
- **Externals:** Native modules, heavy optional deps (`nodemailer`, `pdfkit`, `archiver`, `connect-pg-simple`, etc.) — these are left as `require()` calls and resolved at runtime from `node_modules`
- **Lock file:** `/tmp/.sahucsc-api-build.lock` — prevents concurrent builds
- **Source maps:** linked (used with `--enable-source-maps` at runtime)
- Output: `artifacts/api-server/dist/`

### Frontend (`artifacts/sahu-csc/vite.config.ts`)

- **Tool:** Vite 7 + `@vitejs/plugin-react`
- **CSS:** Tailwind CSS v4 via `@tailwindcss/vite`
- **PWA:** `vite-plugin-pwa` (injectManifest)
- **Output:** `artifacts/sahu-csc/dist/public/`
- **Proxy:** `/api/*` → `http://localhost:8080`
- **Manual chunks** (to keep main bundle under 500 KB):

| Chunk | Contents |
|---|---|
| `vendor-react` | react, react-dom |
| `vendor-query` | @tanstack/react-query |
| `vendor-motion` | framer-motion |
| `vendor-router` | wouter |
| `vendor-charts` | recharts |
| `vendor-ui` | lucide-react |
| `vendor-radix` | all @radix-ui/* |
| `vendor-i18n` | i18next, react-i18next |
| `vendor-forms` | react-hook-form, zod |
| `vendor-date` | date-fns, react-day-picker |
| `vendor-icons` | react-icons |
| `vendor-misc` | sonner, cmdk, vaul, embla-carousel, etc. |

---

## Key Architectural Decisions

| Decision | Reason |
|---|---|
| Session store uses the shared `pool`, not a new connection string | A separate pool causes sessions to silently fail through Replit's mTLS proxy |
| `connect-pg-simple` kept external in esbuild | Bundling breaks its internal `table.sql` file path lookup |
| Receipt numbers via `receipt_counters` atomic upsert | Guarantees sequential, gap-free `CSC-YYYY-NNNN` numbering across concurrent requests |
| VAPID keys auto-generated and persisted in `settings` table | No manual secret management needed; keys survive server restarts |
| Monetary values use `numeric(12,2)` not `float` | Avoids floating-point rounding errors in financial calculations |
| Dates in ledger stored as `text (YYYY-MM-DD)` | Avoids timezone offset drift — a "today" entry should always display as that calendar date |
| `ledger.balance` stored as a running value, not computed | Avoids full-table scans for the current balance on every request |
| `willChange: transform` must not be on page transition wrappers | Creates a new CSS containing block which breaks `position: fixed` on the bottom navigation bar |
| Only free-text fields not used in search are encrypted | Encrypted fields break `ILIKE` search; name/mobile/email must stay plaintext |
| Language stored in `localStorage` under key `sahu-lang` | Keeps language selection across sessions without a backend round-trip |
| After login, auth cache is set directly from the response body | Using `refetch()` causes a race condition through Replit's proxy before the session cookie is available |
