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
6. [Security Model](#6-security-model)
   - [Authentication Flow](#61-authentication-flow)
   - [Role-Based Access Control](#62-role-based-access-control)
   - [Data Isolation (Multi-User)](#63-data-isolation-multi-user)
   - [IDOR Protection](#64-idor-protection)
7. [Data Flow — End to End](#7-data-flow--end-to-end)
8. [Business Logic Details](#8-business-logic-details)
   - [Ledger & Running Balance](#81-ledger--running-balance)
   - [AePS (Aadhaar Payment System)](#82-aeps-aadhaar-payment-system)
   - [Reports & Export](#83-reports--export)
   - [Notifications](#84-notifications)
   - [Profile & Preferences](#85-profile--preferences)
9. [OpenAPI Contract-First Design](#9-openapi-contract-first-design)
10. [Environment & Configuration](#10-environment--configuration)
11. [Default Seed Data](#11-default-seed-data)
12. [Known Gotchas & Conventions](#12-known-gotchas--conventions)

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
- System-wide notifications and settings

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
│   ├── api-server/          # Express 5 backend (port 8080, serves /api)
│   │   ├── src/
│   │   │   ├── app.ts       # Express app, middleware setup
│   │   │   ├── index.ts     # HTTP server entrypoint
│   │   │   ├── routes/      # One file per resource
│   │   │   │   ├── index.ts         # Router composition
│   │   │   │   ├── auth.ts          # Login / logout / me
│   │   │   │   ├── ledger.ts        # Ledger CRUD + balance/summary
│   │   │   │   ├── aeps.ts          # AePS sessions + transactions
│   │   │   │   ├── services.ts      # Service catalog CRUD
│   │   │   │   ├── users.ts         # User management (admin only)
│   │   │   │   ├── profile.ts       # Own profile + avatar
│   │   │   │   ├── preferences.ts   # Per-user UI preferences
│   │   │   │   ├── notifications.ts # Notification inbox
│   │   │   │   ├── reports.ts       # Reports, dashboard, export
│   │   │   │   ├── audit.ts         # Audit log viewer (admin only)
│   │   │   │   ├── settings.ts      # Global settings + backups
│   │   │   │   └── health.ts        # GET /health
│   │   │   └── lib/
│   │   │       ├── auth.ts    # hashPassword, requireAuth, requireRole, auditLog
│   │   │       ├── notify.ts  # createNotification helper
│   │   │       └── logger.ts  # Pino logger instance
│   │   └── build.mjs          # esbuild bundler script
│   │
│   └── sahu-csc/            # React + Vite frontend (serves /)
│       ├── src/
│       │   ├── App.tsx             # QueryClient, providers, router
│       │   ├── pages/              # One file per route
│       │   │   ├── login.tsx
│       │   │   ├── dashboard.tsx
│       │   │   ├── ledger.tsx
│       │   │   ├── aeps.tsx
│       │   │   ├── services.tsx
│       │   │   ├── reports.tsx
│       │   │   ├── notifications.tsx
│       │   │   ├── profile.tsx
│       │   │   ├── preferences.tsx
│       │   │   ├── users.tsx       # Admin only
│       │   │   ├── audit-logs.tsx  # Admin only
│       │   │   ├── settings.tsx    # Admin only
│       │   │   └── backups.tsx     # Admin only
│       │   ├── components/
│       │   │   ├── layout.tsx       # Sidebar + header shell
│       │   │   ├── theme-provider.tsx
│       │   │   └── ui/              # shadcn/ui components
│       │   └── hooks/
│       │       └── use-auth.tsx     # AuthContext + useAuth hook
│
├── lib/
│   ├── db/                  # @workspace/db — Drizzle ORM + schema
│   │   ├── src/
│   │   │   ├── index.ts     # Exports: db client + all tables
│   │   │   └── schema/
│   │   │       ├── index.ts            # Re-exports all schemas
│   │   │       ├── users.ts
│   │   │       ├── ledger.ts
│   │   │       ├── services.ts
│   │   │       ├── aeps.ts
│   │   │       ├── notifications.ts
│   │   │       ├── audit_logs.ts
│   │   │       ├── settings.ts
│   │   │       └── user_preferences.ts
│   │   └── drizzle.config.ts
│   │
│   ├── api-spec/            # @workspace/api-spec
│   │   └── openapi.yaml     # OpenAPI 3.1 spec — single source of truth
│   │
│   └── api-client-react/    # @workspace/api-client-react
│       └── src/generated/   # Orval-generated React Query hooks + Zod schemas
│
└── replit.md                # Project README + user preferences
```

---

## 3. Database Schema

All tables use PostgreSQL via Drizzle ORM. The `@workspace/db` package exports the `db` client and all table objects.

### `users`
Stores all user accounts.

| Column           | Type        | Notes                                     |
|------------------|-------------|-------------------------------------------|
| `id`             | serial PK   |                                           |
| `username`       | text UNIQUE | Login identifier                          |
| `email`          | text UNIQUE | Also usable as login identifier           |
| `mobile`         | text NULL   | Also usable as login identifier           |
| `full_name`      | text NULL   |                                           |
| `password_hash`  | text        | bcrypt, 12 rounds                         |
| `role`           | text        | `admin` / `operator` / `user`             |
| `is_active`      | boolean     | Inactive users cannot log in              |
| `profile_picture`| text NULL   | base64 data URL (max ~5MB)                |
| `bio`            | text NULL   | Max 500 chars                             |
| `address`        | text NULL   | Max 500 chars                             |
| `created_at`     | timestamptz |                                           |
| `updated_at`     | timestamptz | Auto-updated on every change              |

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
One row per operating day for the AePS cash float.

| Column           | Type          | Notes                              |
|------------------|---------------|------------------------------------|
| `id`             | serial PK     |                                    |
| `date`           | date UNIQUE   | One session per calendar day       |
| `opening_balance`| numeric(12,2) | Cash on hand at start of day       |
| `notes`          | text NULL     |                                    |
| `created_at`     | timestamptz   |                                    |
| `updated_at`     | timestamptz   |                                    |

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
| `action`     | text        | Dot-namespaced, e.g. `ledger.create`|
| `details`    | text NULL   | Human-readable description          |
| `ip_address` | text        | Client IP (X-Forwarded-For aware)   |
| `created_at` | timestamptz |                                     |

**Known audit action codes:**
`login`, `logout`, `ledger.create`, `ledger.update`, `ledger.delete`, `ledger.clear`,
`aeps.session`, `aeps.transaction`, `aeps.edit`, `aeps.delete`,
`profile.update`, `profile.password_change`, `profile.avatar_update`, `profile.avatar_delete`,
`preferences.update`, `user.create`, `user.update`, `user.delete`,
`settings.update`, `backup.create`, `backup.restore`

### `settings`
Global key-value configuration store.

| Column | Type | Notes                                 |
|--------|------|---------------------------------------|
| `id`   | serial PK |                                  |
| `key`  | text UNIQUE |                               |
| `value`| text |                                       |

**Known keys:** `businessName`, `businessAddress`, `businessMobile`, `businessEmail`,
`language`, `theme`, `currency`, `autoBackup`, `backupFrequencyDays`

### `user_preferences`
Per-user UI settings. Created on first access.

| Column             | Type        | Notes                                    |
|--------------------|-------------|------------------------------------------|
| `id`               | serial PK   |                                          |
| `user_id`          | integer UNIQUE | One row per user                      |
| `theme`            | text        | `light` / `dark`                         |
| `language`         | text        | `en` / `hi` / `or`                       |
| `dashboard_layout` | text        | Reserved for future layout variants      |
| `updated_at`       | timestamptz |                                          |

### `backups`
Metadata records for backup operations (files are simulated in dev).

| Column      | Type        |
|-------------|-------------|
| `id`        | serial PK   |
| `filename`  | text        |
| `size`      | integer     | Bytes |
| `created_at`| timestamptz |

---

## 4. Backend — Express API Server

Entry point: `artifacts/api-server/src/index.ts`  
App config: `artifacts/api-server/src/app.ts`  
Runs on `PORT` env var (default 8080), all routes under `/api`.

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
  → express-session (cookie-based, 24h TTL)
  → [/api/auth/login only] loginLimiter (20 req / 15 min)
  → router (all /api routes)
```

**Session cookie settings:**
- `httpOnly: true` — not accessible from JavaScript
- `secure: true` in production only
- `sameSite: strict` in production, `lax` in dev
- `maxAge: 86400000` (24 hours)

### 4.2 Auth Library

File: `artifacts/api-server/src/lib/auth.ts`

| Export | Purpose |
|--------|---------|
| `hashPassword(password)` | bcrypt hash with 12 salt rounds |
| `comparePassword(password, hash)` | bcrypt compare |
| `requireAuth` | Express middleware — checks `req.session.userId`, returns 401 if missing |
| `requireRole(...roles)` | Express middleware — re-fetches user from DB, checks role, returns 401/403 |
| `auditLog(userId, action, details, ip)` | Inserts an `audit_logs` row; swallows errors silently |
| `getClientIp(req)` | Reads `X-Forwarded-For`, falls back to socket address |

**Session shape** (stored server-side, cookie is opaque session ID):
```ts
req.session.userId   // number — user.id
req.session.userRole // string — user.role
```

### 4.3 Notify & Audit Helpers

**`createNotification(title, message, type, userId?)`** — `lib/notify.ts`  
Inserts a row in `notifications`. If `userId` is omitted → system-wide (shown to all users).  
Used automatically on: login success, failed login attempt, backup created/restored.

**`auditLog(userId, action, details, ip)`** — `lib/auth.ts`  
Inserts a row in `audit_logs`. Called explicitly from every mutating route handler.  
Errors are caught and logged (never surface to the client).

### 4.4 API Route Reference

All routes require `requireAuth` unless marked **public**. Routes marked **admin** require `requireRole("admin")`.

#### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Public | Accepts `{ identifier, password }`. Matches username OR email OR mobile. Sets session. Returns user object. |
| POST | `/auth/logout` | ✓ | Destroys session. |
| GET  | `/auth/me` | ✓ | Returns current user from DB. |

#### Profile — `/api/profile`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/profile` | ✓ | Own profile (id, username, email, mobile, fullName, role, profilePicture, bio, address, createdAt) |
| PATCH  | `/profile` | ✓ | Update fullName, email, mobile, bio, address. Password change requires `currentPassword` + `password`. |
| POST   | `/profile/avatar` | ✓ | Upload base64 data URL. Must start with `data:image/`. Max ~5MB. |
| DELETE | `/profile/avatar` | ✓ | Removes profile picture (sets to null). |

#### Preferences — `/api/preferences`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/preferences` | ✓ | Returns or auto-creates preferences row. Fields: `theme`, `language`, `dashboardLayout`, `updatedAt`. |
| PATCH  | `/preferences` | ✓ | Update any combination of `theme` (`light`/`dark`), `language` (`en`/`hi`/`or`), `dashboardLayout`. |

#### Ledger — `/api/ledger`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/ledger/balance` | ✓ | `{ balance, totalCredits, totalDebits }` — user-scoped (admin sees all). |
| GET    | `/ledger/summary` | ✓ | Totals for `period` = today/yesterday/week/month/custom. User-scoped. |
| GET    | `/ledger` | ✓ | Paginated list. Query params: `page`, `limit`, `startDate`, `endDate`, `serviceType`, `customerName`. User-scoped. Includes `createdByName` via LEFT JOIN. |
| POST   | `/ledger` | ✓ | Create entry. Auto-computes running `balance` for this user. Audited. |
| GET    | `/ledger/:id` | ✓ | Single entry. IDOR check for non-admins. |
| PATCH  | `/ledger/:id` | ✓ | Update entry. IDOR check for non-admins. Audited. |
| DELETE | `/ledger/:id` | ✓ | Delete entry. IDOR check for non-admins. Audited. |
| DELETE | `/ledger/all` | Admin | Wipes entire ledger. Audited. |

#### AePS — `/api/aeps`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/aeps/session?date=YYYY-MM-DD` | ✓ | Returns session + transactions with per-transaction running balance. Returns `null` if no session opened. |
| POST   | `/aeps/session` | ✓ | Create or update day session `{ date, openingBalance, notes? }`. Audited. |
| POST   | `/aeps/transaction` | ✓ | Add `{ date, type, amount, customerName, description? }`. Session must exist first. Audited. |
| PATCH  | `/aeps/transaction/:id` | ✓ | Edit type/amount/customerName/description. Audited. |
| DELETE | `/aeps/transaction/:id` | ✓ | Delete transaction. Audited. |

#### Reports & Dashboard — `/api/reports` / `/api/dashboard`

All reports are user-scoped (non-admins see only their own data).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/dashboard` | ✓ | `{ currentBalance, todayCredits, todayDebits, todayTransactions, monthCredits, monthDebits, monthTransactions, netProfitMonth, recentEntries[5], topServicesMonth[5] }` |
| GET | `/reports/daily?date=` | ✓ | Day summary + topServices[5] + AePS stats |
| GET | `/reports/monthly?year=&month=` | ✓ | Month summary + dailyBreakdown[] + topServices + AePS |
| GET | `/reports/aeps?startDate=&endDate=` | ✓ | AePS-only stats for a date range |
| GET | `/reports/service-breakdown?startDate=&endDate=` | ✓ | Service-by-service count + revenue array |
| GET | `/reports/export?startDate=&endDate=` | ✓ | Downloads `.xlsx` with two sheets: Ledger Report + AePS Report |

#### Notifications — `/api/notifications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/notifications?unreadOnly=` | ✓ | Returns user's own + system-wide notifications (max 50, newest first). |
| PATCH  | `/notifications/:id/read` | ✓ | Mark one as read. IDOR check. |
| POST   | `/notifications/read-all` | ✓ | Mark all visible notifications as read. |
| DELETE | `/notifications/:id` | ✓ | Delete one. IDOR check. |

#### Users — `/api/users` (Admin only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/users` | Admin | All users ordered by username. |
| POST   | `/users` | Admin | Create user `{ username, email, mobile?, fullName?, password, role }`. Audited. |
| PATCH  | `/users/:id` | Admin | Update any field including `password`, `isActive`. Audited. |
| DELETE | `/users/:id` | Admin | Hard delete. Audited. |

#### Audit Logs — `/api/audit-logs` (Admin only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/audit-logs?page=&limit=&userId=&action=&startDate=&endDate=` | Admin | Paginated log with `{ logs, total, page, limit }`. JOINs username. |

#### Settings & Backups — `/api/settings`, `/api/backups`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/settings` | ✓ | Returns merged defaults + DB overrides as typed object. |
| PATCH  | `/settings` | Admin | Upserts each provided key. Audited. |
| GET    | `/backups` | Admin | List all backup metadata records. |
| POST   | `/backups` | Admin | Record a new backup (filename, size simulated). Audited + notification. |
| POST   | `/backups/:id/restore` | Admin | Mark a backup as restored. Audited + notification. |

#### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | Public | Returns `{ status: "ok" }` |

---

## 5. Frontend — React SPA

### 5.1 App Bootstrap & Providers

`artifacts/sahu-csc/src/App.tsx` wraps the entire app in this provider tree (outermost first):

```
QueryClientProvider (React Query, staleTime 30s, retry 1)
  → TooltipProvider (shadcn)
    → ThemeProvider (light/dark, stored in localStorage as "sahu-csc-theme")
      → WouterRouter (base = import.meta.env.BASE_URL)
        → AuthProvider (session polling via /auth/me)
          → Router (page routes)
      → Toaster (shadcn toast notifications)
```

### 5.2 Routing & Access Control

Router: **wouter** (lightweight, no React Router dependency).

`ProtectedRoute` component logic:
1. If `isLoading` → show full-screen spinner
2. If no `user` → redirect to `/login`
3. If `adminOnly` prop and `user.role !== "admin"` → show 403 message
4. Otherwise → render the page component

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login | Public |
| `/` | Dashboard | Any logged-in user |
| `/ledger` | Ledger | Any logged-in user |
| `/aeps` | AePS | Any logged-in user |
| `/services` | Services | Any logged-in user |
| `/reports` | Reports | Any logged-in user |
| `/notifications` | Notifications | Any logged-in user |
| `/profile` | Profile | Any logged-in user |
| `/preferences` | Preferences | Any logged-in user |
| `/users` | Users | **Admin only** |
| `/audit-logs` | Audit Logs | **Admin only** |
| `/settings` | Settings | **Admin only** |
| `/backups` | Backups | **Admin only** |

### 5.3 Pages

| Page | Key Features |
|------|-------------|
| **Login** | Username/email/mobile + password form. Error toast on 401. |
| **Dashboard** | Balance card, today stats, this-month stats, recent 5 transactions table, top services bar chart. All data from `GET /dashboard`. |
| **Ledger** | Full paginated table with search (customer name, service type, date range). Add/edit/delete entry dialogs. Credit/debit colouring. All data user-scoped. |
| **AePS** | Date picker to switch sessions. Opening balance form. Add withdrawal/deposit form. Running balance column. Session summary totals. |
| **Services** | Service catalog with category grouping. Admin: add/edit/deactivate services. |
| **Reports** | Tab switcher: Daily / Monthly. Date/month pickers. Bar charts (Recharts) for daily breakdown. Pie/bar chart for top services. AePS summary panel. Excel export button. |
| **Notifications** | List of all notifications visible to user. Unread badge. Mark one/all as read. Delete. Type icons (info/warning/success/error). |
| **Profile** | Avatar upload (base64, client-side preview). Name/email/mobile/bio/address fields. Separate password change section requiring current password. |
| **Preferences** | Theme toggle (light/dark). Language selector (English/Hindi/Odia). Dashboard layout selector (future use). |
| **Users** *(admin)* | Table of all users. Create user dialog. Edit role/status/password. Delete. |
| **Audit Logs** *(admin)* | Paginated table of all actions. Filter by user, action type, date range. |
| **Settings** *(admin)* | Business info form (name, address, mobile, email). Language/theme/currency dropdowns. Auto-backup toggle + frequency. |
| **Backups** *(admin)* | List of backup records. Create backup button. Restore button per backup. |

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

Pages import typed hooks like:
```ts
import { useListLedgerEntries, useCreateLedgerEntry } from "@workspace/api-client-react";
```

These hooks wrap `@tanstack/react-query` internally — `useQuery` for GET, `useMutation` for POST/PATCH/DELETE. Cache invalidation is handled per-resource after mutations.

---

## 6. Security Model

### 6.1 Authentication Flow

```
POST /api/auth/login
  → Validate body with Zod (LoginBody)
  → Query users WHERE username=? OR email=? OR mobile=?
  → Check user.isActive
  → bcrypt.compare(password, user.passwordHash)
  → Set req.session.userId + req.session.userRole
  → auditLog("login")
  → createNotification("User Login", userId=user.id)
  → Return user object (no password hash)
```

On every subsequent authenticated request:
```
requireAuth middleware
  → Check req.session.userId exists
  → (session verified by express-session via signed cookie)
```

Session is destroyed on `POST /api/auth/logout`.

### 6.2 Role-Based Access Control

Three roles: **admin**, **operator**, **user**

| Capability | user | operator | admin |
|-----------|------|----------|-------|
| Login | ✓ | ✓ | ✓ |
| View own ledger / dashboard / reports | ✓ | ✓ | ✓ |
| Create / edit / delete own ledger entries | ✓ | ✓ | ✓ |
| Use AePS | ✓ | ✓ | ✓ |
| View / update own profile | ✓ | ✓ | ✓ |
| View / update own preferences | ✓ | ✓ | ✓ |
| View services | ✓ | ✓ | ✓ |
| Read system settings | ✓ | ✓ | ✓ |
| View **all** users' data (ledger, reports) | ✗ | ✗ | ✓ |
| Manage users (create/edit/delete) | ✗ | ✗ | ✓ |
| Manage services (create/edit) | ✗ | ✗ | ✓ |
| Update system settings | ✗ | ✗ | ✓ |
| Manage backups | ✗ | ✗ | ✓ |
| View audit logs | ✗ | ✗ | ✓ |
| Wipe entire ledger (`DELETE /ledger/all`) | ✗ | ✗ | ✓ |

**Frontend enforcement:** `ProtectedRoute adminOnly` prop hides admin pages.  
**Backend enforcement:** `requireRole("admin")` middleware on admin routes.

### 6.3 Data Isolation (Multi-User)

The `getUserFilter(req)` function is used in every query that touches user-owned data:

```ts
function getUserFilter(req) {
  if (req.session.userRole === "admin") return undefined;  // no filter → sees all
  return eq(ledgerTable.createdBy, req.session.userId);    // scoped to own data
}
```

This pattern is applied in:
- `ledger.ts` — all list, balance, summary, dashboard queries
- `reports.ts` — all report and dashboard queries
- Notifications are scoped via `WHERE user_id = ? OR user_id IS NULL`

Admin users see **all data across all users** in every query.

### 6.4 IDOR Protection

On any route that operates on a specific record by ID, the server:
1. Fetches the record from DB
2. Checks if `record.createdBy !== req.session.userId`
3. If mismatch AND requester is not admin → returns `403 Forbidden`

Protected endpoints:
- `GET /ledger/:id` — checks `entry.createdBy`
- `PATCH /ledger/:id` — checks `entry.createdBy`
- `DELETE /ledger/:id` — checks `entry.createdBy`
- `PATCH /notifications/:id/read` — checks `notification.userId`
- `DELETE /notifications/:id` — checks `notification.userId`
- `PATCH /profile` — always scoped to `req.session.userId` (no `:id` param)
- `POST /profile/avatar` — always scoped to `req.session.userId`

---

## 7. Data Flow — End to End

```
User Action in Browser
        │
        ▼
React Component (e.g. "Add Entry" button click)
        │
        ▼
useCreateLedgerEntry() — generated React Query mutation
        │
        ▼
fetch POST /api/ledger  ── Cookie: session-id
        │
        ▼
Express Middleware Chain:
  pino-http → helmet → hpp → rate-limit → cors → json → session
        │
        ▼
POST /api/ledger route handler
  1. requireAuth — checks session.userId
  2. Zod parse body (CreateLedgerEntryBody)
  3. Compute running balance via SUM(credit)-SUM(debit) WHERE createdBy=userId
  4. db.insert(ledgerTable, { ...data, createdBy: userId, balance })
  5. auditLog(userId, "ledger.create", details, ip)
  6. res.status(201).json(formattedEntry)
        │
        ▼
React Query cache invalidated → UI re-fetches ledger list
        │
        ▼
User sees new entry in the table
```

---

## 8. Business Logic Details

### 8.1 Ledger & Running Balance

The `balance` column stores a **snapshot** of the user's total balance at the time of entry creation:

```
newBalance = SUM(all previous credits for this user)
           - SUM(all previous debits for this user)
           + new credit
           - new debit
```

This means:
- Balance is computed per-user at insert time
- Editing an existing entry **does NOT recompute** balance (only the raw credit/debit fields change)
- The `GET /ledger/balance` endpoint always computes live from SUM, not from the stored snapshot
- Admin's balance = sum of all users' entries (they see everything)

### 8.2 AePS (Aadhaar Payment System)

AePS tracks a physical cash float (not linked to the main ledger):

1. **Open a day session** — set opening cash balance for a date (`POST /aeps/session`)
2. **Record transactions** — each withdrawal reduces cash on hand, each deposit increases it (`POST /aeps/transaction`)
3. **Running balance** — computed dynamically by the GET endpoint, not stored:
   ```
   current_balance = openingBalance - totalWithdrawals + totalDeposits
   ```
4. Sessions are shared (not user-scoped) — only one session per date for the whole CSC
5. AePS data appears in reports: daily, monthly, and a dedicated AePS report tab

### 8.3 Reports & Export

**Daily report** (`GET /reports/daily?date=YYYY-MM-DD`):
- Transaction count, total credits, total debits, net revenue for the day
- Top 5 services by revenue
- AePS summary for the day

**Monthly report** (`GET /reports/monthly?year=&month=`):
- Aggregate totals for the month
- Daily breakdown array (for charting)
- Top services breakdown
- Full AePS daily breakdown

**Excel export** (`GET /reports/export?startDate=&endDate=`):
- Sheet 1: Ledger entries (Date, Customer, Service, Credit, Debit, Balance, Description)
- Sheet 2: AePS sessions (Date, Opening Balance, Withdrawals, Deposits, Transactions, Net Flow)
- Generated with the `xlsx` (SheetJS) library, served as `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### 8.4 Notifications

Notifications have two scopes:
- `userId = NULL` → **system-wide**, shown to every logged-in user
- `userId = N` → **user-specific**, shown only to that user

The GET endpoint filters: `WHERE user_id = ? OR user_id IS NULL`

Auto-created notifications:
| Trigger | Title | Type | Scope |
|---------|-------|------|-------|
| Successful login | "User Login" | info | user-specific |
| Failed login (user not found) | "Failed Login Attempt" | warning | system-wide |
| Failed login (wrong password) | "Failed Login Attempt" | warning | system-wide |
| Backup created | "Backup Created" | success | system-wide |
| Backup restored | "Backup Restored" | success | system-wide |

### 8.5 Profile & Preferences

**Profile** — owned by the authenticated user only. No `:id` parameter means IDOR is not possible.
- Password changes require `currentPassword` (verified against current hash)
- New password is hashed with bcrypt before storing
- Both changes are audit-logged separately

**Preferences** — auto-created with defaults `(theme=light, language=en, dashboardLayout=default)` on first `GET /preferences`. No explicit create step needed in the frontend.

---

## 9. OpenAPI Contract-First Design

The API is defined once in `lib/api-spec/openapi.yaml` (OpenAPI 3.1). This drives:

1. **Zod schemas** (`@workspace/api-zod`) — used server-side for request validation
2. **TypeScript types** — shared across frontend and backend
3. **React Query hooks** (`@workspace/api-client-react`) — typed hooks for every endpoint
4. **MSW mock handlers** — for storybook / offline dev

To regenerate after changing the spec:
```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## 10. Environment & Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes (prod) | Used to sign session cookies. Falls back to a hardcoded string in dev only. |
| `PORT` | No | Port for each service (assigned by Replit). Defaults: api=8080 |
| `NODE_ENV` | No | `production` enables secure cookies and strict sameSite |

**Schema changes:**
```bash
pnpm --filter @workspace/db run push
```
After running this, **always re-seed** — drizzle-kit push can recreate tables and empty them.

**Re-seeding** (when users table is empty):
```bash
# Run from workspace root
node --input-type=module << 'EOF'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Pool } = require('/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg');
const bcrypt = require('/home/runner/workspace/node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const hash = await bcrypt.hash("admin123", 12);
await pool.query(`INSERT INTO users (username, email, mobile, full_name, password_hash, role, is_active)
  VALUES ('admin', 'admin@sahucsc.in', '9876543210', 'SAHU Admin', $1, 'admin', true)
  ON CONFLICT (username) DO NOTHING`, [hash]);
console.log("Seeded!");
await pool.end();
EOF
```

---

## 11. Default Seed Data

The seed script (`artifacts/api-server/src/scripts/seed.ts`) populates:

**Users:** admin (role=admin), operator (role=operator)

**Services (10 pre-seeded):**

| Name | Category | Price |
|------|----------|-------|
| PAN Card | Government ID | ₹107 |
| Aadhaar Update | Government ID | ₹50 |
| Voter ID | Government ID | ₹0 |
| Driving License | Government ID | ₹300 |
| Income Certificate | Certificates | ₹30 |
| Caste Certificate | Certificates | ₹30 |
| Electricity Bill | Utility Bills | ₹10 |
| Mobile Recharge | Utility Bills | ₹5 |
| Photo Print | Other Services | ₹30 |
| Photocopy | Other Services | ₹2 |

**Settings:** businessName=SAHU CSC Center, language=en, theme=light, currency=INR, autoBackup=false

**Ledger:** 30 days of random entries for the admin user

---

## 12. Known Gotchas & Conventions

| Rule | Details |
|------|---------|
| **Numeric columns return strings** | Drizzle returns `numeric` columns as strings. Always `parseFloat(value ?? "0")` before returning from routes. |
| **Balance is a snapshot, not live** | The `balance` column in `ledger` is set at insert time. `GET /ledger/balance` computes live from SUM. They can diverge if entries are edited/deleted. |
| **drizzle-kit push empties tables** | After any schema push, query `SELECT COUNT(*) FROM users`. If empty, re-seed. See §10. |
| **tsx not available in scripts** | Use `node --input-type=module` with direct pg + bcryptjs require paths for ad-hoc DB scripts. |
| **notifications returns array, not page** | Unlike ledger and audit-logs, `GET /notifications` returns a plain array (not `{ items, total }`). Frontend uses `.length` for the unread count badge. |
| **Admin user filter = undefined** | `getUserFilter` returns `undefined` for admins (no WHERE clause), so Drizzle does a full table scan. Non-admins get `eq(ledgerTable.createdBy, userId)`. |
| **openapi.yaml is source of truth** | Never edit generated files in `lib/api-client-react/src/generated/` manually. Change the spec then run codegen. |
| **typecheck order** | Always run `pnpm run typecheck:libs` before `pnpm run typecheck`. The DB lib must emit fresh `.d.ts` declarations before app packages can resolve types. |
| **AePS sessions are not user-scoped** | AePS daily sessions belong to the entire CSC, not individual users. Any authenticated user can open/view/add to a session. |
| **PATCH on ledger does not recompute balance** | Editing credit or debit on an entry updates those fields but not `balance`. The live `GET /ledger/balance` (which uses SUM) stays correct; only the snapshot column drifts. |
| **Session cookie** | Cookie name defaults to `connect.sid`. httpOnly, 24h expiry. In dev it is `sameSite: lax` to allow cross-origin dev proxy. |
