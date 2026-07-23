# SAHU CSC — Agent Reference Document
**Version 4.9.0** · Last updated 2026-07-23

This file is the single authoritative reference for any AI agent working on this codebase. Read it first before touching any code.

---

## 1. What This App Is

**SAHU CSC** is a full-stack business management PWA for Indian Common Service Centres (CSC operators). It covers:

- **Ledger** — income/expense tracking with running balance, receipt generation (CSC-YYYY-NNNN), PDF/ZIP export
- **AePS** — Aadhaar-enabled Payment System daily session tracking and transaction log
- **Udhari Khata** — customer credit ledger (who owes what)
- **Reports** — daily/monthly income vs expense charts
- **Admin panel** — user approval, device management, audit logs, SMTP/VAPID settings, backups
- **PWA** — offline-first, installable, push notifications, background sync, periodic sync

Target users: rural Odisha CSC operators. UI languages: English, Hindi, Odia (`i18next`).

---

## 2. Monorepo Layout

```
/
├── artifacts/
│   ├── api-server/          # Express REST API — port 8080
│   │   ├── src/
│   │   │   ├── index.ts     # Entry: app init, session store, Sentry, VAPID, cron
│   │   │   ├── app.ts       # Express app, middleware, rate limiters, routes mount
│   │   │   ├── routes/      # All route handlers (see §6)
│   │   │   ├── lib/         # auth, cache, mailer, push, encryption, logger, queue-client
│   │   │   └── services/    # notificationTemplates, monthly-export
│   │   └── build.mjs        # esbuild bundler (outputs dist/index.mjs)
│   │
│   ├── worker-server/       # BullMQ consumers — port 8081 (optional, needs REDIS_URL)
│   │   └── src/queues/      # notification.worker, email.worker, pdf.worker, sms.worker
│   │
│   ├── sahu-csc/            # React 19 + Vite PWA frontend — port 5000
│   │   └── src/
│   │       ├── pages/       # All page components (see §8)
│   │       ├── components/  # Shared + page-specific components
│   │       ├── hooks/       # use-auth, useLedger, useReports, etc.
│   │       ├── lib/         # offline-db (Dexie), device-fingerprint, sync-engine
│   │       └── locales/     # en/hi/or translation JSON
│   │
│   └── mockup-sandbox/      # Isolated Vite server for UI prototyping — port 3000
│
├── lib/
│   ├── db/                  # @workspace/db — Drizzle schema + pg Pool
│   │   └── src/schema/      # One file per table (see §5)
│   ├── api-spec/            # OpenAPI 3.1 source of truth
│   ├── api-zod/             # @workspace/api-zod — generated Zod validators
│   └── api-client-react/    # @workspace/api-client-react — generated TanStack Query hooks
│
├── scripts/
│   ├── post-merge.sh        # Run after every git merge: pnpm install + drizzle push + session table
│   └── serve.mjs            # Production static file server (correct Cache-Control headers)
│
├── AGENT.md                 # ← You are here
├── replit.md                # Setup notes, version changelog, Replit-specific quirks
├── DOCS.md                  # API + module reference (verbose)
├── CHANGELOG.md          # Full version history
└── memory.md                # Session chat history
```

---

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ESM), TypeScript 5.9 |
| Backend framework | Express 5.2 |
| ORM | Drizzle ORM + drizzle-kit |
| Database | PostgreSQL (Neon · user-managed via `NEON_DATABASE_URL`; falls back to Replit-managed `DATABASE_URL`) |
| File storage | Backblaze B2 S3-compatible storage (optional; local/base64 fallbacks remain available) |
| Session | express-session + connect-pg-simple (`session` table) |
| Cache | In-process TTL map (default) or Upstash Redis (`CACHE_BACKEND=redis`) |
| Queue | BullMQ + ioredis (optional, needs `REDIS_URL`) |
| Auth | bcryptjs (cost 12), express-session, TOTP via `otplib`, QR via `qrcode` |
| Encryption | AES-256-GCM (`lib/encryption.ts`), key persisted in `settings` table |
| Email | Nodemailer → Gmail SMTP (`smtp.gmail.com:587`) |
| Push notifications | web-push, VAPID keys auto-generated + persisted in `settings` table |
| Logging | Pino |
| Observability | Sentry (optional, `SENTRY_DSN`) |
| Frontend | React 19, Vite 7, Tailwind CSS 4 |
| UI components | Radix UI, shadcn/ui pattern |
| Animations | Framer Motion |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Routing | Wouter |
| Offline | Dexie (IndexedDB), Workbox (injectManifest), Background Sync, Periodic Sync |
| i18n | i18next + react-i18next, locales: en / hi / or |
| Build | esbuild (API), Vite (frontend) |
| Package manager | pnpm workspaces |

---

## 4. Environment Variables & Secrets

### Required Secrets (Replit Secrets)
| Key | Purpose |
|-----|---------|
| `SESSION_SECRET` | Express session signing — auto-generated is fine |
| `ADMIN_PASSWORD` | Seed: admin account password |
| `OPERATOR_PASSWORD` | Seed: operator account password |

### Core Env Vars (shared)
| Key | Value | Purpose |
|-----|-------|---------|
| `PORT` | `5000` | Frontend Vite port |
| `API_PORT` | `8080` | Backend Express port |
| `BASE_PATH` | `/` | URL base path |
| `CACHE_BACKEND` | `memory` or `redis` | Cache driver |
| `DB_POOL_MAX` | `5` | Max pg pool connections (prevents exhaustion) |
| `CORS_ORIGIN` | comma-separated URLs (optional) | Extra allowed origins — `REPLIT_DEV_DOMAIN` and `REPLIT_DOMAINS` are now included automatically; this var is only needed for non-Replit origins |

SMTP variables are optional and only needed for email OTP, password reset, and email notifications:
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_FROM_EMAIL` are shared variables; `SMTP_PASSWORD`
is a secret (legacy alias: `SMTP_PASS`).

### Optional Secrets
| Key | Purpose |
|-----|---------|
| `SMTP_PASSWORD` | Gmail app password for email OTP/notifications (legacy alias: `SMTP_PASS` also accepted); email features remain disabled when absent |
| `REDIS_URL` | Upstash direct TCP URL (`rediss://...`) — enables BullMQ Worker Server |
| `UPSTASH_REDIS_REST_URL` | Upstash REST endpoint for shared cache |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token |
| `B2_KEY_ID` | Backblaze B2 application key ID for optional avatar and backup storage |
| `B2_APP_KEY` | Backblaze B2 application key for optional avatar and backup storage |
| `B2_BUCKET_NAME` | Private B2 bucket name |
| `B2_BUCKET_ENDPOINT` | B2 S3-compatible endpoint; accepts a full URL or hostname |
| `ENCRYPTION_KEY` | 32-byte base64 AES key (auto-generated if absent) |
| `MAXMIND_LICENSE_KEY` | Weekly GeoIP database updates |
| `SENTRY_DSN` | Server-side error tracking |
| `VITE_SENTRY_DSN` | Client-side error tracking |

### Database connection secret
| Key | Purpose |
|-----|---------|
| `NEON_DATABASE_URL` | Neon PostgreSQL connection string — set as a Replit Secret. This is the active database connection; `lib/db` falls back to `DATABASE_URL` only when it is absent. |

### Runtime-managed (never set manually)
`DATABASE_URL` (Replit-managed PostgreSQL fallback), `PGDATABASE`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `REPLIT_DOMAINS`, `REPLIT_DEV_DOMAIN`, `REPL_ID`

### Auto-generated (stored in `settings` table)
`ENCRYPTION_KEY` equivalent, VAPID public/private key pair, JWT secret

---

## 5. Database Schema

All tables live in `lib/db/src/schema/`. Schema is managed by drizzle-kit.

> ⚠️ `drizzle-kit push` can empty tables. Always re-seed after schema changes.  
> ⚠️ The `session` table (express-session) is NOT managed by Drizzle — create it manually (see §10).

### `users`
Primary user table. Roles: `admin`, `operator`, `user`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `username` | varchar unique | Login identifier |
| `email` | varchar unique | Login identifier + OTP target |
| `mobile` | varchar unique nullable | Login identifier |
| `passwordHash` | text | bcrypt cost 12 |
| `role` | enum | `admin` / `operator` / `user` |
| `status` | enum | `ACTIVE` / `PENDING` / `LOCKED` / `SUSPENDED` / `DELETED` / `INACTIVE` |
| `fullName` | text nullable | |
| `profilePicture` | text nullable | WebP base64 fallback or `b2:<object-key>` when B2 is configured; resized to 512×512 server-side |
| `bio` | text nullable | AES-256-GCM encrypted |
| `address` | text nullable | AES-256-GCM encrypted |
| `isActive` | boolean | |
| `firstLoginCompleted` | boolean | Triggers permission-grant overlay |
| `ledgerBalance` | numeric(15,2) | Maintained column — O(1) balance queries |
| `failedLoginAttempts` | integer | Resets on success |
| `lockedUntil` | timestamp nullable | Set when locked after 3 failures |
| `activeSessionToken` | text nullable | V1 session compat |
| `twoFaEnabled` | boolean | |
| `twoFaMethod` | enum | `otp` / `totp` |
| `totpSecret` | text nullable | AES-256-GCM encrypted |
| `backupCodes` | text nullable | JSON array of bcrypt hashes |
| `twoFaVerifiedAt` | timestamp nullable | |
| `rejectionReason` | text nullable | Admin rejection note |
| `createdAt` / `updatedAt` | timestamp | |

### `user_sessions`
One row per active login session (V2 auth).

| Column | Notes |
|--------|-------|
| `sessionId` | UUID, links to express-session |
| `userId` | FK → users |
| `deviceInfo` | "Chrome on Windows" |
| `browser` / `os` | Parsed from UA |
| `ipAddress` | |
| `rememberMe` | boolean |
| `isActive` | boolean — single-device enforcement |
| `expiresAt` | |

### `device_sessions`
Tracks known devices for fingerprint-based trust.

| Column | Notes |
|--------|-------|
| `deviceFingerprint` | SHA-256 of UA+lang+screen+timezone |
| `userId` | FK → users |
| `sessionId` | Latest session |
| `isTrusted` | boolean |
| `trustedUntil` | timestamp — 30-day trust window |
| `lastActive` | timestamp |

### `ledger`
All financial transactions.

| Column | Notes |
|--------|-------|
| `id` | serial PK |
| `userId` | FK → users RESTRICT |
| `type` | `income` / `expense` |
| `amount` | numeric(15,2) |
| `description` | text |
| `serviceId` | FK → services nullable |
| `receiptNumber` | `CSC-YYYY-NNNN` format |
| `receiptToken` | UUID — public receipt QR URL |
| `createdBy` | FK → users RESTRICT |
| `runningBalance` | numeric(15,2) — balance after this entry |
| `createdAt` | timestamp |

> Ledger writes are atomic transactions (balance + receipt counter + insert).

### `receipt_counters`
Composite PK `(userId, year)` — per-user annual receipt numbering.

### `services`
Service catalog (name, category, icon, color, active flag).

### `aeps_daily`
One row per AePS daily session. FK → users.

### `aeps_transactions`
Individual AePS transactions. FK → aeps_daily (CASCADE).

### `udhari_customers`
Customer credit accounts. FK → users. `address`/`notes` AES encrypted.

### `udhari_entries`
Credit/debit entries per customer. FK → udhari_customers (CASCADE).

### `notifications`
User notifications. `userId = null` = broadcast to all.

### `push_subscriptions`
Web Push API subscription objects. FK → users.

### `email_otps`
OTP records for 2FA login and password reset. Expires 10 min, max 5 failed attempts.

### `settings`
Key-value store for server config (VAPID keys, JWT secret, encryption key, thresholds, etc.).

### `audit_logs`
Every significant action (login, 2FA, ledger ops, user management). FK → users CASCADE.

### `security_logs`
Auth security events (login failures, lockouts, 2FA challenges). FK → users.

### `password_reset_tokens`
Token-based password reset links. FK → users CASCADE.

### `user_preferences`
Per-user UI preferences (theme, language, etc.).

### `user_notification_preferences`
Per-user push/email notification toggle per event type.

### `user_sessions`
See above.

### `broadcast_logs`
Admin broadcast message history. FK → users RESTRICT.

### `session` *(not Drizzle-managed)*
express-session PostgreSQL store table. Must be created manually:
```sql
CREATE TABLE IF NOT EXISTS "session" (
  "sid"    varchar      NOT NULL COLLATE "default",
  "sess"   json         NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
```

---

## 6. API Routes

All routes mount under `/api/`. Auth middleware: `requireAuth` (session), `requireRole(role)`, `requirePermission(perm)`.

### Auth (`routes/auth/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | — | Password check. Returns user OR `requires2fa: true` (sets `pendingUserId` in session). No OTP auto-sent — user picks method on frontend. |
| POST | `/auth/register` | — | Self-registration (if open). Status `PENDING` until admin approves. |
| POST | `/auth/logout` | requireAuth | Revokes session, clears cookie. |
| GET | `/auth/me` | requireAuth | Returns current user object. |
| POST | `/auth/2fa/switch-method` | pendingUserId | Switch OTP↔TOTP mid-login. Switching to `otp` sends email. Switching to `totp` returns `totpEnrolled` flag. |
| POST | `/auth/2fa/verify-otp` | pendingUserId | Verify email OTP code mid-login → `finalizeLogin`. |
| POST | `/auth/2fa/verify-totp` | userId or pendingUserId | Mode A (authenticated): confirm TOTP setup, enable 2FA. Mode B (pending): verify TOTP mid-login → `finalizeLogin`. |
| POST | `/auth/2fa/setup-totp` | requireAuth | Begin TOTP enrollment (authenticated session). Returns `{ qrCodeDataUrl, otpauthUri, secret }`. |
| POST | `/auth/2fa/setup-totp-pending` | pendingUserId | Begin TOTP enrollment mid-login (before full session). Returns same QR payload. |
| GET | `/auth/2fa/totp-qr` | requireAuth | Re-fetch QR code + secret for already-enrolled TOTP (e.g. for app transfer). |
| GET | `/auth/2fa/status` | requireAuth | Returns 2FA enabled/method/backupCodesRemaining/totpConfigured. |
| POST | `/auth/2fa/enable-otp` | requireAuth | Enable OTP-based 2FA (requires current password). |
| POST | `/auth/2fa/disable` | requireAuth | Disable 2FA (requires current password). Clears TOTP replay-protection cache. |
| POST | `/auth/2fa/regenerate-backup-codes` | requireAuth | Invalidate old backup codes and generate a fresh set (requires current password). |
| POST | `/auth/send-otp` | — | Send OTP for password reset flow. |
| POST | `/auth/verify-otp` | — | Verify OTP for password reset flow. |
| POST | `/auth/forgot-password` | — | Admin-targeted legacy forgot-password. |
| POST | `/auth/reset-password` | — | Token-based password reset. |
| GET | `/auth/devices` | requireAuth | List trusted/known devices. |
| DELETE | `/auth/devices/:id` | requireAuth | Revoke a device session. |

### Ledger (`routes/ledger.ts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/ledger` | requireAuth | List entries (paginated, filtered). |
| GET | `/ledger/balance` | requireAuth | Current running balance. |
| POST | `/ledger` | requireAuth | Create entry (atomic: balance + receipt counter + insert). |
| PATCH | `/ledger/:id` | requireAuth | Edit entry (adjusts balance). |
| DELETE | `/ledger/:id` | requireAuth | Delete entry (adjusts balance). |
| DELETE | `/ledger/all` | requireAuth | Delete all entries, reset balance. |

### Dashboard (`routes/dashboard.ts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/dashboard` | requireAuth | Stats: balance, today/month income/expense, AePS summary, recent transactions. Cached 5 s. |

### Services (`routes/services.ts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/services` | requireAuth | List all services. |
| POST | `/services` | requireRole("admin") | Create service. |
| PATCH | `/services/:id` | requireRole("admin") | Update service. |
| DELETE | `/services/:id` | requireRole("admin") | Delete service. |

### AePS (`routes/aeps/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/aeps/session` | requireAuth + perm(aeps:view) | Get today's AePS session. |
| POST | `/aeps/session` | requireAuth + perm(aeps:manage) | Open/close AePS session. |
| GET | `/aeps/transactions` | requireAuth + perm(aeps:view) | List AePS transactions. |
| POST | `/aeps/transactions` | requireAuth + perm(aeps:manage) | Add AePS transaction. |
| PATCH | `/aeps/transactions/:id` | requireAuth + perm(aeps:manage) | Edit transaction. |
| DELETE | `/aeps/transactions/:id` | requireAuth + perm(aeps:manage) | Delete transaction. |
| GET | `/aeps/receipt/:token` | — | Public receipt verify. |
| GET | `/admin/aeps-overview` | requireRole("admin") | All users' AePS summary. |

### Udhari (`routes/udhari/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/udhari/summary` | requireAuth + perm(udhari:view) | Total balance owed. |
| GET | `/udhari/customers` | requireAuth + perm(udhari:view) | List customers. |
| POST | `/udhari/customers` | requireAuth + perm(udhari:manage) | Add customer. |
| GET | `/udhari/customers/:id` | requireAuth + perm(udhari:view) | Customer detail. |
| PATCH | `/udhari/customers/:id` | requireAuth + perm(udhari:manage) | Edit customer. |
| DELETE | `/udhari/customers/:id` | requireAuth + perm(udhari:manage) | Delete customer. |
| GET | `/udhari/customers/:id/entries` | requireAuth + perm(udhari:view) | List credit entries. |
| POST | `/udhari/customers/:id/entries` | requireAuth + perm(udhari:manage) | Add entry. |
| PATCH | `/udhari/customers/:id/entries/:eid` | requireAuth + perm(udhari:manage) | Edit entry. |
| DELETE | `/udhari/customers/:id/entries/:eid` | requireAuth + perm(udhari:manage) | Delete entry. |
| GET | `/udhari/receipt/:token` | — | Public receipt verify. |

### Reports (`routes/reports.ts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/reports/daily` | requireAuth | Daily income/expense for date range. Cached 5 s. |
| GET | `/reports/monthly` | requireAuth | Monthly aggregates. Cached 5 s. |

### Profile & Preferences

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/profile` | requireAuth | Own profile. |
| PATCH | `/profile` | requireAuth | Update profile (avatar resized to 512×512 WebP). |
| PATCH | `/profile/password` | requireAuth | Change password (revokes other sessions). |
| PATCH | `/users/first-login-completed` | requireAuth | Mark first-login permissions done. |
| GET | `/preferences` | requireAuth | Notification + UI preferences. |
| PATCH | `/preferences` | requireAuth | Update preferences. |

### Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications` | requireAuth | List own notifications. |
| GET | `/notifications/unread-count` | requireAuth | Unread count badge. |
| PATCH | `/notifications/:id/read` | requireAuth | Mark as read. |
| POST | `/notifications/mark-all-read` | requireAuth | Mark all read. |

### Push

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/push/vapid-public-key` | — | VAPID public key for browser subscription. |
| POST | `/push/subscribe` | requireAuth | Register push subscription. |
| DELETE | `/push/unsubscribe` | requireAuth | Remove push subscription. |

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/users-overview` | requireRole("admin") | All users with balances. Cached 5 s. |
| GET | `/admin/users-overview/:uid/ledger` | requireRole("admin") | Specific user's ledger. |
| GET | `/admin/audit-recent` | requireRole("admin") | Recent audit log. |
| GET | `/admin/db-stats` | requireRole("admin") | DB table sizes. |
| GET | `/users` | requireRole("admin") | List all users. |
| POST | `/users` | requireRole("admin") | Create user. |
| PATCH | `/users/:id` | requireRole("admin") | Edit user (role/status/info). |
| DELETE | `/users/:id` | requireRole("admin") | Delete user. |
| POST | `/admin/users/:id/generate-reset-link` | requireRole("admin") | Generate password reset link. |
| POST | `/admin/users/:id/email-reset-link` | requireRole("admin") | Email reset link to user. |
| GET | `/admin/users/pending` | requireRole("admin") | Pending registrations. |
| GET | `/admin/users/pending-count` | requireRole("admin") | Badge count. |
| PATCH | `/admin/users/:id/approve` | requireRole("admin") | Approve registration. |
| PATCH | `/admin/users/:id/reject` | requireRole("admin") | Reject registration. |
| GET | `/admin/users/appeals` | requireRole("admin") | Re-approval appeals. |
| PATCH | `/admin/users/:id/re-approve` | requireRole("admin") | Re-approve. |
| PATCH | `/admin/users/:id/dismiss-appeal` | requireRole("admin") | Dismiss appeal. |
| POST | `/admin/users/appeals/dismiss-all` | requireRole("admin") | Dismiss all appeals. |
| GET | `/admin/sessions` | requireRole("admin") | All active sessions. |
| DELETE | `/admin/sessions/:id` | requireRole("admin") | Revoke a session. |
| DELETE | `/admin/sessions/user/:uid` | requireRole("admin") | Revoke all sessions for user. |
| GET | `/settings/registration-status` | — | Is registration open? |
| PATCH | `/admin/settings/registration` | requireRole("admin") | Toggle registration open/closed. |
| GET | `/settings` | requireAuth | App settings. |
| PATCH | `/settings` | requireRole("admin") | Update settings. |
| GET/PATCH | `/settings/smtp` | requireRole("admin") | SMTP config. |
| POST | `/settings/smtp/test` | requireRole("admin") | Send SMTP test email. |
| GET | `/settings/vapid` | requireRole("admin") | VAPID public key. |
| POST | `/settings/vapid/rotate` | requireRole("admin") | Rotate VAPID keys. |
| GET | `/settings/contact` | — | Public contact info. |
| GET | `/backups/:id/download` | requireRole("admin") | Download backup. |
| DELETE | `/backups/:id` | requireRole("admin") | Delete backup. |
| POST | `/backups/:id/restore` | requireRole("admin") | Restore backup. |
| GET | `/admin/receipt-export/*` | requireRole("admin") | Receipt export (PDF/ZIP/Excel). |
| POST | `/broadcast` | requireRole("admin") | Send broadcast notification. |

### Receipts & Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/receipts/verify/:token` | — | Public receipt QR verification. |
| GET | `/healthz` | — | Server health (DB, memory, uptime). `no-store`. |
| GET | `/setup-status` | — | Is DB seeded? `no-store`. |
| GET | `/geo` | — | Visitor country (GeoIP). Rate-limited 30 req/min. |

---

## 7. Auth & Session System

### Login Flow
```
POST /auth/login
  → password check (bcrypt)
  → device fingerprint lookup (device_sessions)
  → if known + trusted + not expired → finalizeLogin() directly
  → if new device OR 2FA enabled:
      set session.pendingUserId, pendingDeviceFingerprint, etc.
      return { requires2fa: true, maskedEmail, totpEnrolled, isNewDevice }
      *** NO OTP auto-sent — user picks method on the verification screen ***
  → user clicks "Email OTP" card → POST /auth/2fa/switch-method { method: "otp" } → sends OTP
  → user clicks "Authenticator App" card → POST /auth/2fa/switch-method { method: "totp" }
  → user submits code → POST /auth/2fa/verify-otp or verify-totp
  → finalizeLogin():
      revoke all other user_sessions (single-device enforcement)
      update users.activeSessionToken
      insert user_sessions row
      upsert device_sessions (trust if requested)
      set req.session.userId, sessionId
      return fmtUser(user)
```

### Session State During 2FA
The `req.session` carries pending-login state:
```typescript
pendingUserId: number          // set by login, cleared by finalizeLogin
pendingDeviceFingerprint: string | null
pendingDeviceName: string
pendingRememberMe: boolean
pendingMethod: "otp" | "totp"  // updated by switch-method
pendingIsNewDevice: boolean
pendingTotpEnrolling: boolean  // true during inline TOTP enrollment
```

### Single-Device Enforcement
`finalizeLogin` revokes ALL existing `user_sessions` rows for the user before creating the new one.

### TOTP Inline Enrollment (mid-login)
If user has no TOTP set up and clicks "Authenticator App":
1. `POST /auth/2fa/setup-totp-pending` — generates secret, stores encrypted, sets `pendingTotpEnrolling = true`
2. User scans QR, enters 6-digit code
3. `POST /auth/2fa/verify-totp` (Mode B + pendingTotpEnrolling) — verifies, sets `twoFaEnabled = true`, mints backup codes, calls `finalizeLogin`
4. Backup codes shown once before redirect

### Roles & Permissions
```
admin    → all permissions
operator → ledger:view, ledger:manage, aeps:view, aeps:manage, udhari:view, udhari:manage
user     → ledger:view, udhari:view
```

### Rate Limiting
| Limiter | Scope | Limit |
|---------|-------|-------|
| General | All routes | 500 req/15min per IP |
| Login | POST /auth/login | 8 attempts/15min per IP |
| Auth write | register, OTP send, forgot-password | 10/15min per IP |
| OTP verify | verify-otp, reset-password | 8/15min per IP |
| Geo | GET /geo | 30 req/min per IP |

---

## 8. Frontend Pages

All pages are in `artifacts/sahu-csc/src/pages/`.

### Public Pages
| File | Route | Description |
|------|-------|-------------|
| `login.tsx` | `/login` | Login + 2FA method picker + forgot password panel |
| `register.tsx` | `/register` | Self-registration form |
| `register-closed.tsx` | `/register` | Shown when registration disabled |
| `register-pending.tsx` | `/register-pending` | Post-registration pending approval screen |
| `forgot-password.tsx` | `/forgot-password` | OTP-based password reset |
| `reset-password.tsx` | `/reset-password` | Token-based password reset |
| `about.tsx` | `/about` | App info + version changelog |
| `download-app.tsx` | `/download-app` | PWA install guide |
| `pwa-status.tsx` | `/pwa-status` | Service worker / offline status debug |
| `offline.tsx` | `/offline` | Shown when app is offline |
| `region-blocked.tsx` | `/region-blocked` | GeoIP region block landing |
| `not-found.tsx` | `*` | 404 |

### Authenticated Pages (operator + admin)
| File | Route | Description |
|------|-------|-------------|
| `dashboard.tsx` | `/` | Stats, balance, recent transactions |
| `ledger.tsx` | `/ledger` | Transaction list, add/edit/delete, balance |
| `aeps.tsx` | `/aeps` | AePS daily sessions + transaction log |
| `udhari.tsx` | `/udhari` | Customer credit list |
| `udhari-customer.tsx` | `/udhari/:id` | Per-customer entry detail |
| `reports.tsx` | `/reports` | Income vs expense charts |
| `notifications.tsx` | `/notifications` | Notification list |
| `profile.tsx` | `/profile` | Profile edit, avatar, password change, 2FA settings |
| `preferences.tsx` | `/preferences` | Notification + UI preferences |
| `sessions.tsx` | `/sessions` | Active session list, revoke |
| `services.tsx` | `/services` | Service catalog (admin can edit) |
| `receipts-verify.tsx` | `/receipts/verify/:token` | Ledger receipt public view |
| `aeps-receipt-verify.tsx` | `/aeps/receipt/:token` | AePS receipt public view |
| `udhari-receipt-verify.tsx` | `/udhari/receipt/:token` | Udhari receipt public view |

### Admin-Only Pages
| File | Route | Description |
|------|-------|-------------|
| `users.tsx` | `/users` | User management, approvals, device sessions, AePS overview tabs |
| `audit-logs.tsx` | `/audit-logs` | Full audit trail |
| `backups.tsx` | `/backups` | DB backup/restore |
| `receipt-export.tsx` | `/receipt-export` | Bulk receipt PDF/ZIP/Excel export |
| `server-health.tsx` | `/server-health` | DB stats, heap, FPS, GeoIP updater |
| `broadcast.tsx` | `/broadcast` | Push + email broadcast |

---

## 9. Key Frontend Architecture

### Auth State (`hooks/use-auth.tsx`)
- `useGetMe` (TanStack Query, key `["auth/me"]`) — source of truth for user
- Offline fallback: `getCachedUserSession()` from IndexedDB if `!navigator.onLine`
- After login/2FA verify: `queryClient.setQueryData(["auth/me"], userData)` — no refetch (avoids Replit proxy race)
- `TwoFaChallenge` interface: `{ requires2fa: true, isNewDevice, maskedEmail?, totpEnrolled? }`

### 2FA Verification Flow (`components/auth/TwoFactorStep.tsx`)
- Phase 1: Method picker — two cards (Email OTP / Authenticator App)
  - Clicking Email OTP → `switchTwoFaMethod("otp")` → OTP sent → code entry
  - Clicking Authenticator App → `switchTwoFaMethod("totp")` → TOTP entry; if first time, shows QR code + manual secret for external app enrollment
- Phase 2: Code entry with "Change method" back link
- Email OTP resend cooldown: `RESEND_COOLDOWN = 120` seconds

### Offline PWA (`lib/offline-db.ts`, `lib/sync-engine.ts`)
- IndexedDB (Dexie) stores pending ledger entries when offline
- Background sync replays queue on reconnect
- Periodic sync (1hr interval) via service worker
- Workbox `injectManifest` strategy (custom `sw.ts`)

### i18n
- `i18next`, locales at `src/locales/{en,hi,or}/translation.json`
- Language stored in `localStorage["sahu-lang"]`
- Language switcher in sidebar

### Performance
- `PerformanceProvider` — device tier (high/medium/low) via CPU/RAM/network/rAF benchmark
- TanStack Query: `staleTime: 5 min`, `gcTime: 30 min`, persisted to IndexedDB via `idb-keyval`
- `EagerPreloader` — prefetches 7 key queries post-login
- Page transitions: opacity-only fade 150ms (no transform — would break `position: fixed` bottom nav)
- `LiveClock` isolated as `React.memo` (was re-rendering entire layout every second)
- Manual Vite `manualChunks` for every heavy lib (radix, i18n, forms, date, icons)

---

## 10. How to Run (Replit)

### Workflows
| Workflow | Command | Port |
|----------|---------|------|
| `API Server` | `PORT=8080 ... pnpm build && PORT=8080 node dist/index.mjs` | 8080 |
| `artifacts/sahu-csc: web` | `pnpm --filter @workspace/sahu-csc run dev` | 5000 |
| `Worker Server` | Requires `REDIS_URL`; exits cleanly if absent | 8081 |
| `Seed Database` | `tsx src/scripts/seed.ts` | — |

### First-time / After Re-import
```bash
pnpm install --frozen-lockfile
pnpm --filter @workspace/db run push-force    # apply schema
psql "${NEON_DATABASE_URL:-$DATABASE_URL}" -c "CREATE TABLE IF NOT EXISTS session ..."   # session table
# Run "Seed Database" workflow
# Start "API Server" + "artifacts/sahu-csc: web" workflows
# Update CORS_ORIGIN env var to include current $REPLIT_DEV_DOMAIN
```

### After Every Schema Change
```bash
pnpm --filter @workspace/db run push-force
# Re-seed if push cleared tables (it sometimes does)
```

### Default Credentials
- Admin: username `admin`, password = `ADMIN_PASSWORD` secret
- Operator: username `operator`, password = `OPERATOR_PASSWORD` secret

---

## 11. Background Jobs & Cron

| Job | Schedule | Description |
|-----|----------|-------------|
| OTP cleanup | Every 1 hour | Delete expired `email_otps` rows |
| Monthly receipt export | `5 0 1 * *` (1st of month, midnight IST) | PDF/ZIP → email to admins |
| GeoIP update | `0 3 * * 0` (Sunday 3am) | MaxMind DB update via `geoip-lite` (needs `MAXMIND_LICENSE_KEY`) |
| Auto-backup | Disabled by default | Configurable in settings |

### BullMQ Queues (when REDIS_URL set)
| Queue | Workers |
|-------|---------|
| `notifications` | Web push send |
| `emails` | Nodemailer send |
| `pdf-generation` | Receipt PDF (stub → real) |
| `sms` | SMS (stub) |

Without `REDIS_URL`: all queues fall back to direct in-process execution.

---

## 12. Known Quirks & Non-Obvious Decisions

### Must Know Before Editing

1. **`drizzle-kit push` can empty tables** — always re-seed after. If adding a NOT NULL column, the push will fail; drop and recreate affected table instead.

2. **`connect-pg-simple` must be in `external` in `build.mjs`** — esbuild bundling breaks its internal `table.sql` path lookup; sessions silently fail.

3. **`connect-pg-simple` must use the shared `pool` from `@workspace/db`** — using a plain connection string creates a separate pool that silently fails.

4. **`position: fixed` bottom nav breaks with `willChange: transform` on parent** — the page-transition `motion.div` must NOT set `willChange: transform`; it creates a new CSS containing block.

5. **drizzle-orm dual-peer variant** — adding any optional peer of drizzle-orm (e.g. `@upstash/redis`, `@opentelemetry/api`) only to one workspace triggers a second drizzle-orm resolution. Fix: add the dep to both `api-server` AND `lib/db`.

6. **`REDIS_URL` must be direct TCP (`rediss://...`)** — not the Upstash REST URL. BullMQ/ioredis cannot use the HTTP REST endpoint.

7. **AES-256-GCM encrypted fields** — only encrypt fields NOT used in `ILIKE` search. `name`, `mobile`, `email` must stay plaintext. Encrypted: `address`, `bio`, `notes`, `totpSecret`, `backupCodes`.

8. **`archiver@8` is ESM-only** — use `new ZipArchive(opts)` named export, NOT the legacy callable `archiver(format, opts)` factory.

9. **`setTimeout` 32-bit overflow** — `setTimeout(fn, >2.1B ms)` silently clamps to 1ms. Use `node-cron` for intervals longer than ~24 days.

10. **Login body uses `identifier` not `username`** — the `LoginBody` Zod schema has `identifier` which matches username OR email OR mobile.

11. **Receipt counter is per-user, per-year** — composite PK `(userId, year)` in `receipt_counters`. Format: `CSC-YYYY-NNNN`.

12. **Ledger balance is IST-based** — period queries use `Asia/Kolkata` timezone offset, not UTC.

13. **After every `drizzle-kit push`** — the session table is dropped (it's outside Drizzle's schema). Re-create it manually.

14. **VAPID keys and JWT secret are auto-generated** on first startup and persisted to the `settings` table. Never need to set them as environment secrets.

15. **`finalizeLogin` is the single codepath** for all successful logins (direct + OTP + TOTP). If you add post-login logic, put it there.

16. **SMTP is optional for boot** — `isSmtpConfigured()` checks `SMTP_HOST + SMTP_USER + (SMTP_PASSWORD ?? SMTP_PASS)`. If unconfigured, email OTP/password reset/notifications are unavailable, but password login and TOTP/backup-code flows still work.
17. **B2 is optional and local-first** — avatars use base64 PostgreSQL storage and backups use `./backups/` when B2 is absent; configured B2 mirrors avatar/backup objects and provides download/restore fallback.
18. **B2 endpoints are normalized** — `B2_BUCKET_ENDPOINT` receives an `https://` prefix when supplied as a hostname only.

---

## 13. Testing

```bash
pnpm --filter @workspace/api-server run test    # Vitest — 70 tests
```

Test files in `artifacts/api-server/src/__tests__/`:
- `async-handler.test.ts` — error forwarding (6 cases)
- `query-cache.test.ts` — TTL cache (8 cases)
- Auth/session middleware tests (56 cases)

---

## 14. Build

```bash
# Full production build
pnpm run typecheck:libs
pnpm --filter @workspace/api-server run build   # esbuild → artifacts/api-server/dist/
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run build  # Vite → artifacts/sahu-csc/dist/
```

API bundle: ~2.8MB (source-mapped). Deliberately keeps drizzle-orm and @sentry/node bundled.

Frontend main chunk: ~438KB (under 500KB Vite warning).

---

## 15. Version History Summary

| Version | Date | Key Change |
|---------|------|-----------|
| 4.9.0 | 2026-07-16 | Optimization pass: CORS auto-detects domain, SMTP_PASSWORD, 60 s polling, precache −985 KB, session index, 90-day export cap |
| Setup | 2026-07-23 | Imported project connected to Neon; optional B2 avatar/backup storage configured and verified; API/frontend workflows running |
| 4.8.0 | 2026-07-16 | 2FA: QR codes, replay protection, standard 30 s TOTP, regenerate backup codes |
| 4.7.0 | 2026-07-16 | Built-in TOTP code display, explicit method selection, SMTP fixed |
| 4.6.0 | 2026-07-15 | 2FA method toggle (OTP/TOTP) on login, inline TOTP enrollment |
| 4.5.1 | 2026-07-15 | File Manager permission real grant/deny |
| 4.5.0 | 2026-07-15 | PermissionCard redesign, Location+Notifications+FileManager |
| 4.4.0 | 2026-07-15 | 2FA (OTP+TOTP), device trust, single-device enforcement |
| 4.3.2 | 2026-07-14 | Load test baseline, 2 new DB indexes |
| 4.3.1 | 2026-07-14 | Health versioning, GeoIP weekly updater, bundle 6.5MB→2.8MB |
| 4.3.0 | 2026-07-14 | Security hardening, atomic ledger, input validation |
| 4.2.0 | 2026-07-14 | O(1) running balance column, CDN headers, 70 tests |
| 4.1.2 | 2026-07-13 | asyncHandler, type-safety |
| 4.1.1 | 2026-07-13 | Worker server (BullMQ), queue-client |
| 4.0.1 | 2026-07-13 | Redis rate limiting, multi-instance readiness |
| 4.0.0 | 2026-07-12 | Performance audit, 6 DB indexes, API caching |
| 3.5.x | 2026-07-10–12 | Modularization, Redis cache, i18n, load testing |
| 3.3.0 | 2026-07-08 | Dark premium email templates, SMTP live, password policy |
| 3.2.x | 2026-07-04–06 | Adaptive performance, skeleton loaders, encryption at rest |
