# SAHU CSC — Change Log v3
**Current version: 3.3.0 — July 8, 2026**

> Detailed record of every feature, change, and upgrade from v3.0.0 onward.  
> For v2.x history, see `changelogV2.md`.  
> For pre-v2 history, see `CHANGELOG.md`.  
> For full architecture reference, see `architectureV3.md`.  
> For session-by-session changes, see `UPDATES.md`.

---

## Table of Contents

0. [v3.3.0 — Email & Security Hardening (July 8, 2026)](#0-v330--email--security-hardening-july-8-2026)
1. [v3.2.4 – v3.2.5 — Security Upgrade & Password Policy Correction (July 6, 2026)](#1-v324--v325--security-upgrade--password-policy-correction-july-6-2026)
1. [v3.1.1 — Replit Environment Migration & TypeScript Clean (July 3, 2026)](#1-v311--replit-environment-migration--typescript-clean-july-3-2026)
2. [v3.1.0 — Backup & Restore Redesign + Download + Scheduler (June 30, 2026)](#2-v310--backup--restore-redesign--download--scheduler-june-30-2026)
3. [v3.0.0 — Setup Wizard, SMTP Integration & Auto-Import (June 30, 2026)](#3-v300--setup-wizard-smtp-integration--auto-import-june-30-2026)

---

## 0. v3.3.0 — Email & Security Hardening (July 8, 2026)

### V2 Dark Premium Email Templates
- All 7 transactional email types rewritten in `artifacts/api-server/src/lib/mailer.ts`
- Dark gradient page (`#0a1628 → #1e3a5f`), dark navy card (`#0f2244`), 4px accent top strip per type
- Per-type accents: OTP verify = emerald, password reset OTP = amber, approval = emerald, rejection = rose, admin alert = sky blue, broadcast = violet, admin reset link = amber
- Single `buildV2Html()` wrapper — consistent structure across all types
- `esc()` HTML-escape helper applied to every dynamic field (name, reason, body, username, resetUrl, expiryTime)

### OTP Email Copy Strip
- Digit boxes and copy strip joined in one card — full OTP shown in large spaced monospace below digits
- Label "Copy this code" — no JS, works in all email clients
- OTP validated `/^\d+$/` before rendering; non-numeric shows `------`
- Description shortened to one action sentence with expiry bolded inline

### SMTP Configured
- Gmail: `smtp.gmail.com:587`, from `SAHU CSC Support <sahuuttam690@gmail.com>`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_FROM_EMAIL` → shared env vars
- `SMTP_PASS` → Replit Secret

### Password Policy
- Minimum 8 chars, no maximum (was 6–8)
- Requires: uppercase + lowercase + number + special character
- Frontend schema and strength bar (5 checks) synced with backend

### Login Lockout
- Locks after **3** failed attempts for **5 minutes** (was 5 attempts / 15 min)

---

## 1. v3.2.4 – v3.2.5 — Security Upgrade & Password Policy Correction (July 6, 2026)

### Overview

Platform-wide security hardening across four areas: password policy, rate limiting, encryption at rest, and a review of password hashing strength. Shipped as v3.2.4, then corrected in v3.2.5 after the initial password length (10+ chars) proved too strict — final policy is 6–8 characters with upper/lower/number/special-character complexity.

### Password Policy

- New shared `passwordPolicySchema` (`artifacts/api-server/src/lib/password-policy.ts`), applied consistently to registration, password reset (legacy + token flows), profile self-service password change, and admin-created/updated user accounts.
- Removed the previous inconsistency where profile self-service change only required 6 characters with no complexity rules.

### Rate Limiting

- Login limiter reduced from 20 to 8 attempts / 15 minutes per IP.
- New `authWriteLimiter` (10/15min) on register, appeal, send-otp, forgot-password.
- New `otpVerifyLimiter` (8/15min) on verify-otp, reset-password.

### Encryption at Rest

- New AES-256-GCM helper (`lib/encryption.ts`) encrypts `udhari_customers.address`, `udhari_customers.notes`, `users.address`, `users.bio`.
- `name` / `mobile` / `email` intentionally left plaintext — they're matched via `ILIKE` partial search, and encrypting them would break search.
- Encryption key auto-generates on first use and persists in the `settings` table (same pattern as VAPID key generation); overridable via an `ENCRYPTION_KEY` secret.
- Legacy plaintext rows are read transparently — no migration required.

### Password Hashing

- Reviewed: bcrypt cost factor 12 already meets current industry-standard strength. No change made.

---

## 1. v3.1.1 — Replit Environment Migration & TypeScript Clean (July 3, 2026)

### Overview

Full Replit environment setup: 7 workflows configured, all TypeScript errors resolved (0 errors across both packages), backup path bug fixed, dev script port bug fixed, ADMIN_PASSWORD + OPERATOR_PASSWORD secrets configured, and production build verified.

### Workflows Added

| Workflow | Port | Auto-starts | Purpose |
|----------|------|-------------|---------|
| `SAHU CSC` | 5000 | ✅ Yes | Vite frontend dev server |
| `API Server` | 8080 | ✅ Yes | Runs pre-built `dist/index.mjs` |
| `Build API` | — | ❌ No | Rebuilds API ESM bundle |
| `Seed Database` | — | ❌ No | Seeds DB from secrets |
| `Typecheck` | — | ❌ No | TypeScript check (0 errors) |
| `Build Production` | — | ❌ No | Full production build |
| `Production Preview` | 5000 | ❌ No | Build + serve production bundle |

### Bug Fixes

**Backup directory path** — `artifacts/api-server/src/routes/settings.ts` + `backup-scheduler.ts` + `scripts/backup.ts` + `scripts/restore.ts`
- Was: `../../backups` — resolved to workspace root; wrong when running from `artifacts/api-server/`
- Fixed: `backups` — relative to `process.cwd()` which is `artifacts/api-server/`
- Added: `mkdirSync(BACKUP_DIR, { recursive: true })` to prevent crash on missing directory

**Frontend dev script port** — `artifacts/sahu-csc/package.json`
- Was: `fuser -k ${PORT:-21700}/tcp` — was killing the canvas artifact port instead of self
- Fixed: `fuser -k ${PORT:-5000}/tcp`

### TypeScript Fixes — API Server (6 → 0 errors)

| File | Fix |
|------|-----|
| `routes/settings.ts` | Added missing `logger` import |
| `routes/broadcast.ts` | `url ?? undefined` instead of `url ?? null` |
| `lib/auth.ts` | `auditLog` signature: `userId: number` → `userId: number \| null`, added null guard |
| `routes/admin-receipt-export.ts` | Cast `archiver` as any for callable type; typed `err: Error` |
| `lib/monthly-export.ts` | Same archiver callable cast |

### TypeScript Fixes — Frontend (7 → 0 errors)

| File | Fix |
|------|-----|
| `pages/aeps.tsx` | Added `useEffect` to React imports |
| `pages/reports.tsx` | Added `AreaChart`, `Area`, `Skeleton` imports |
| `pages/udhari.tsx` | Added `Skeleton` import |
| `pages/users.tsx` | Added `Skeleton` import |
| `pages/ledger.tsx` | Wrapped `mutateAsync` args in `{ data: { ... } }` (Orval-generated API wrapper) |
| `hooks/use-toast.ts` | Cast `ReactNode` to `string` where string is required |
| `components/whats-new-modal.tsx` | Added `return undefined` to all branches |

### Build Verification

- **Typecheck:** 0 errors (both `@workspace/api-server` and `@workspace/sahu-csc`)
- **API bundle:** 5.0 MB ESM, built in ~1.5s
- **Frontend bundle:** All chunks under threshold; built in ~16s
- **PWA service worker:** 76 precache entries, 5254 KiB

---

## 1. v3.1.0 — Backup & Restore Redesign + Download + Scheduler (June 30, 2026)

### Overview

Full overhaul of the Backup & Restore admin page plus four new backend capabilities: backup file download, SQL file import, selective table import, and a `node-cron` auto-backup scheduler.

### Frontend — Backup Page Redesign (`backups.tsx`)

**Design system: "Minimal Clean"**

The page was previously a single-column stacked layout. It is now a **2-column desktop grid**:
- **Left 2/3** — Backup History card (table of snapshots with Download + Restore per row)
- **Right 1/3** — Auto-Backup Schedule card + Import Data card stacked vertically

**Color scheme:**
- Navy (`#0b2c60`) — 3px top-border accent on all cards, card titles, icon badges, active day chips, frequency pills, Save Schedule button, Analyze button
- Saffron (`#f97316`) — Create Backup button, Import Now button, upload dropzone icon, enabled schedule toggle
- Red (`#dc2626`) — Restore confirm (destructive action)
- Emerald — Active schedule status dot + "Active" label

**Cards use a shared `NavyCard` + `CardHead` helper component** (defined inline in `backups.tsx`) to keep consistent styling across the three sections.

**Action buttons:** Download turns navy on hover, Restore turns saffron on hover. Labels shown inline on `sm:` breakpoint, icon-only on mobile.

**Import flow (inline in the Import card):**
1. Dashed drop-zone with saffron `UploadCloud` icon → file selected → navy "Analyze File" button
2. Table checkboxes appear (scrollable list, max-h-48) → All / None quick-select
3. Saffron "Import N" button → selective import confirm dialog → import
4. Green success banner + "Import another file" reset link

**Schedule card:**
- Saffron toggle (enabled) / slate toggle (disabled)
- Active status: green dot + "Active · [frequency summary]" label
- Fields: Frequency (3-pill grid), Time (time input), Day picker (individual day chips), Retention (number input)
- All fields opacity-40 + pointer-events-none when schedule is disabled
- Navy "Save Schedule" button at the bottom

### Backend — New API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/backups/:id/download` | admin | Streams `.sql` file via `createReadStream`. Sets `Content-Disposition: attachment` + `Content-Length`. Logs `backup.download` audit event. |
| `POST` | `/api/backups/analyze` | admin | Multer file upload → reads file → parses `COPY <table>` blocks → returns `{ tables: [{ name, label, rowCount }], tmpPath, originalName }`. |
| `POST` | `/api/backups/selective-import` | admin | Receives `{ tmpPath, selectedTables[], originalName }`. Disables FK checks via `SET session_replication_role = replica`, replays `DELETE + COPY` for each selected table, then restores FK checks. |
| `GET` | `/api/backups/schedule` | admin | Returns current schedule config from `settings` table. |
| `POST` | `/api/backups/schedule` | admin | Saves schedule config to `settings` table, restarts the in-process cron job. |

### Backend — Auto-Backup Scheduler (`backup-scheduler.ts`)

`artifacts/api-server/src/lib/backup-scheduler.ts` — singleton `BackupScheduler` class:

- Initialized in `index.ts` at startup: `initBackupScheduler()`
- On each cron tick: reads `settings` table → checks `backupEnabled` → runs `pg_dump` → inserts into `backups` table → applies retention (deletes oldest files + DB rows beyond `backupRetention` count)
- Supports `frequency: "daily" | "weekly" | "custom"` with `days[]` (0=Sun … 6=Sat) and `time` (HH:MM)
- `restartScheduler(config)` called by `POST /api/backups/schedule` to apply changes immediately without server restart
- Logs `backup.auto` audit event on success; logs error on failure (does not crash the server)

---

## 1. v3.0.0 — Setup Wizard, SMTP Integration & Auto-Import (June 30, 2026)

### What's New at a Glance

| Feature | Description |
|---------|-------------|
| **Setup Wizard Banner** | Admin-only banner shown after login when required secrets are missing. Red = critical, yellow = optional. Expandable with per-secret descriptions. Session-dismissed. |
| **`/api/setup-status` endpoint** | Public endpoint (no auth) returning `{ configured, missing[] }`. Checks SESSION_SECRET, SMTP, and VAPID. |
| **SMTP fully configured** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL` all set. OTP email, password reset, admin approval emails, broadcast emails all active. |
| **VAPID auto-generation** | VAPID keys auto-generated on API startup if not set. No manual key generation required for dev. |
| **`scripts/post-merge.sh`** | Auto-runs `pnpm install` + `drizzle-kit push` on every GitHub import or task merge. Zero-touch schema setup. |
| **V3 documentation** | Complete rewrite of all docs: `BUILD.md`, `WORKFLOWS.md`, `architectureV3.md`, `ReplitV3.md`, `CHANGELOG_V3.md`. |
| **Package version bump** | `@workspace/sahu-csc` and `@workspace/api-server` bumped from 2.7.0 → 3.0.0. |
| **TWA version bump** | `twa-config.json` `appVersionName` 1.0.0 → 3.0.0, `appVersionCode` 1 → 3. |

---

### 1.1 Setup Wizard Banner

**File:** `artifacts/sahu-csc/src/components/setup-wizard-banner.tsx`  
**Integrated in:** `artifacts/sahu-csc/src/components/layout.tsx`

A collapsible admin-only banner rendered at the top of every page (above content, below the header) when the platform is not fully configured.

#### How it works

1. On mount, `SetupWizardBanner` fetches `GET /api/setup-status`
2. If `configured: false` and not session-dismissed → renders the banner
3. **Red banner** — critical secrets missing (`SESSION_SECRET`, `SMTP_*`)
4. **Yellow banner** — only optional secrets missing (VAPID)
5. Expandable section: each missing item shows label, severity badge, and description
6. **"Open Secrets Docs"** button links to Replit docs
7. Dismissed per-session via `sessionStorage.setItem("sahu-setup-banner-dismissed-v1", "1")`

#### Banner states

| State | Color | Trigger |
|-------|-------|---------|
| Critical | 🔴 Red `bg-red-50 border-red-200` | SESSION_SECRET or SMTP missing |
| Optional | 🟡 Yellow `bg-yellow-50 border-yellow-200` | Only VAPID missing |
| Dismissed | Hidden | `sessionStorage` key set |
| Configured | Hidden | All checks pass |

#### Wiring in layout.tsx

```tsx
// layout.tsx — admin-only, rendered after PWAInstallBanner
{isAdmin && <SetupWizardBanner />}
```

#### Files changed

- `artifacts/sahu-csc/src/components/setup-wizard-banner.tsx` — new component
- `artifacts/sahu-csc/src/components/layout.tsx` — import + render (admin-only guard)

---

### 1.2 `/api/setup-status` Public Endpoint

**File:** `artifacts/api-server/src/routes/setup-status.ts`  
**Registered in:** `artifacts/api-server/src/routes/index.ts` (first, before all other routers)

```
GET /api/setup-status   — no authentication required
```

#### Response schema

```typescript
{
  configured: boolean;          // true only when ALL checks pass
  missing: Array<{
    key: string;                // e.g. "SMTP"
    label: string;              // e.g. "Email / SMTP"
    severity: "critical" | "optional";
    description: string;        // human-readable explanation
  }>;
}
```

#### Checks performed

| Check | Key | Severity | Condition |
|-------|-----|----------|-----------|
| Express session secret | `SESSION_SECRET` | critical | `process.env.SESSION_SECRET` missing or equals `"fallback-secret-please-set"` |
| SMTP email | `SMTP` | critical | Any of `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` missing |
| Push notifications | `VAPID` | optional | `VAPID_PUBLIC_KEY` or `VAPID_PRIVATE_KEY` missing AND no auto-generated flag in `lib/vapid.ts` |

#### Design decisions

- **No auth required** — called before login from the banner (and potentially from a future onboarding flow)
- **Never exposes secret values** — only boolean presence flags, labels, and descriptions
- **Registered first** — placed before `healthRouter` in `routes/index.ts` so it's always accessible even if other middleware fails

#### Example responses

Fully configured:
```json
{ "configured": true, "missing": [] }
```

SMTP not configured:
```json
{
  "configured": false,
  "missing": [
    {
      "key": "SMTP",
      "label": "Email / SMTP",
      "severity": "critical",
      "description": "Required for OTP login and notifications. Missing: SMTP_HOST, SMTP_USER, SMTP_PASS."
    }
  ]
}
```

---

### 1.3 SMTP Email — Fully Configured

All five SMTP secrets are now set in Replit Secrets:

| Secret | Status |
|--------|--------|
| `SMTP_HOST` | ✅ Set |
| `SMTP_PORT` | ✅ Set |
| `SMTP_USER` | ✅ Set |
| `SMTP_PASS` | ✅ Set |
| `SMTP_FROM_EMAIL` | ✅ Set |

**What this unlocks:**

| Feature | Status before | Status after |
|---------|--------------|--------------|
| OTP email (registration) | ❌ Disabled | ✅ Active |
| OTP email (password reset) | ❌ Disabled | ✅ Active |
| Admin approval emails | ❌ Disabled | ✅ Active |
| Broadcast email blast | ❌ Disabled | ✅ Active |

`isSmtpConfigured()` in `lib/mailer.ts` returns `true` when all required SMTP env vars are present.

---

### 1.4 VAPID Auto-Generation

**File:** `artifacts/api-server/src/lib/vapid.ts`

If `VAPID_PUBLIC_KEY` or `VAPID_PRIVATE_KEY` is not set as an environment variable, `vapid.ts` auto-generates temporary keys on API startup using `webpush.generateVAPIDKeys()`.

**Behaviour:**
- Generated keys are stored in memory only — lost on API restart
- Push subscriptions cannot survive API restarts without persistent VAPID keys
- `GET /api/setup-status` marks VAPID as "optional missing" if using auto-generated keys
- `GET /api/healthz` reports VAPID status in its response

**For production:** Generate persistent VAPID keys and store in Replit Secrets:
```bash
node -e "const wp = require('web-push'); console.log(wp.generateVAPIDKeys())"
```

---

### 1.5 Automatic Import Setup — `scripts/post-merge.sh`

**File:** `scripts/post-merge.sh`  
**Configured in:** `.replit` under `[postMerge]` (20-second timeout)

```bash
#!/bin/bash
set -e
echo "[post-merge] Installing dependencies..."
pnpm install --frozen-lockfile

echo "[post-merge] Pushing database schema..."
pnpm --filter @workspace/db run push

echo "[post-merge] Done."
```

**Properties:**
- **Idempotent** — safe to run multiple times (drizzle-kit push only creates/alters, never drops unless schema changes)
- **Frozen lockfile** — never modifies pnpm-lock.yaml
- **Automatic** — runs on every GitHub import or task agent merge without any manual action
- **~2.7 seconds** typical runtime

**What still needs manual action (secrets):**

| Secret | Where to add |
|--------|-------------|
| `SESSION_SECRET` | Replit Secrets tab (🔒) |
| `SMTP_*` (5 vars) | Replit Secrets tab |
| `VAPID_*` (optional) | Replit Secrets tab |
| `DATABASE_URL` | Auto-provisioned by Replit PostgreSQL |

---

### 1.6 V3 Documentation Overhaul

All project documentation updated to reflect the current V3 state of the platform:

| File | Status | Notes |
|------|--------|-------|
| `BUILD.md` | ✅ Complete rewrite | Removed stale Firebase/Neon/Redis references; V3 stack |
| `WORKFLOWS.md` | ✅ Updated to V3.0.0 | New troubleshooting section for port 21700 conflict |
| `architectureV3.md` | ✅ New file | Authoritative V3 architecture reference |
| `ReplitV3.md` | ✅ New file | V3 quick-reference for agents and developers |
| `CHANGELOG_V3.md` | ✅ New file | This file — V3 change history |
| `changelogV2.md` | ✅ V3 header added | Cross-reference to CHANGELOG_V3.md |
| `CHANGELOG.md` | ✅ V3 entry added | Top-level version history entry |
| `docs/DESKTOP_FORMS_V2.md` | ✅ Version note added | No functional changes to the spec |
| `infrastructure/pwa/manifest.json` | ✅ No changes needed | Already current |
| `infrastructure/twa/twa-config.json` | ✅ Version bumped | appVersionName 3.0.0, appVersionCode 3 |
| `replit.md` | ✅ V3.0.0 (already current) | Updated in previous session |

---

### 1.7 Package Version Bumps

| Package | Old | New |
|---------|-----|-----|
| `@workspace/sahu-csc` | 2.7.0 | 3.0.0 |
| `@workspace/api-server` | 2.7.0 | 3.0.0 |
| TWA `appVersionName` | 1.0.0 | 3.0.0 |
| TWA `appVersionCode` | 1 | 3 |

---

### 1.8 Known State (June 30, 2026)

| Component | Status |
|-----------|--------|
| API Server (port 8080) | ✅ Running |
| Frontend (port 5000 → :80) | ✅ Running |
| Database | ✅ Connected (15 tables) |
| SMTP | ✅ Fully configured |
| VAPID push | ✅ Auto-generated (set secrets for production persistence) |
| Setup status | ✅ `{ "configured": true, "missing": [] }` |
| Default accounts | ✅ Seeded (admin/admin123, operator/operator123) |
| i18n | ✅ EN / HI / OR — all 25 pages translated |
| PWA | ✅ Service worker active, offline-capable |
| Android TWA | 🔄 Requires: deploy → generate keystore → update assetlinks.json → Play Console |

---

## Appendix — Full API Route Reference (V3)

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Login (username/email/mobile + password) |
| POST | `/api/auth/logout` | Yes | Logout + revoke session |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/register` | No | Self-registration (creates pending user) |
| POST | `/api/auth/send-otp` | No | Send OTP to email (password reset) |
| POST | `/api/auth/verify-otp` | No | Verify OTP |
| POST | `/api/auth/reset-password` | No | Set new password with valid OTP |

### Setup & Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/setup-status` | None | Missing secrets check (public) |
| GET | `/api/healthz` | No | Full system diagnostics |

### Ledger

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/ledger` | Yes | Paginated list (user-scoped) |
| POST | `/api/ledger` | Yes | Create entry (auto-computes balance) |
| PATCH | `/api/ledger/:id` | Yes | Update (IDOR check) |
| DELETE | `/api/ledger/:id` | Yes | Delete (IDOR check) |
| DELETE | `/api/ledger/all` | Admin | Wipe all entries |
| GET | `/api/ledger/balance` | Yes | `{ balance, totalCredits, totalDebits }` |
| GET | `/api/ledger/summary` | Yes | Period totals (today/week/month) |

### Receipts

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/receipts/verify/:token` | None | Public QR receipt verification |

### AePS

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/aeps/session` | Yes | Session + transactions + running balance |
| POST | `/api/aeps/session` | Yes | Create/update daily session |
| POST | `/api/aeps/transaction` | Yes | Add withdrawal or deposit |
| PATCH | `/api/aeps/transaction/:id` | Yes | Edit transaction |
| DELETE | `/api/aeps/transaction/:id` | Yes | Delete transaction |

### Udhari Khata

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/udhari/customers` | Yes | Customer list (user-scoped) |
| POST | `/api/udhari/customers` | Yes | Create customer |
| GET | `/api/udhari/customers/:id` | Yes | Customer + entries + balance |
| PATCH | `/api/udhari/customers/:id` | Yes | Update customer |
| DELETE | `/api/udhari/customers/:id` | Yes | Delete customer + entries |
| POST | `/api/udhari/customers/:id/entries` | Yes | Add gave/got entry |
| PATCH | `/api/udhari/entries/:id` | Yes | Edit entry |
| DELETE | `/api/udhari/entries/:id` | Yes | Delete entry |

### Reports

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard` | Yes | Dashboard summary + stats |
| GET | `/api/reports/daily` | Yes | Day summary |
| GET | `/api/reports/monthly` | Yes | Monthly totals + daily breakdown |
| GET | `/api/reports/aeps` | Yes | AePS-only report |
| GET | `/api/reports/service-breakdown` | Yes | Per-service count + revenue |
| GET | `/api/reports/export` | Yes | Download `.xlsx` (Ledger + AePS sheets) |

### Sessions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/sessions` | Yes | All active sessions |
| DELETE | `/api/sessions/:id` | Yes | Revoke specific session |
| DELETE | `/api/sessions/others` | Yes | Revoke all except current |
| DELETE | `/api/sessions/all` | Yes | Revoke ALL → redirect to login |

### Users (Admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | Admin | All users |
| POST | `/api/users` | Admin | Create user |
| PATCH | `/api/users/:id` | Admin | Update / set password / toggle status |
| DELETE | `/api/users/:id` | Admin | Delete user |

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/users-overview` | Admin | Cross-user balance summary |
| GET | `/api/admin/users-overview/:userId/ledger` | Admin | Single user's ledger |
| GET | `/api/admin/aeps-overview` | Admin | All users' AePS balances |
| GET | `/api/admin/broadcast/stats` | Admin | Push + email subscriber counts |
| POST | `/api/admin/broadcast/push` | Admin | Send push to all subscribers |
| POST | `/api/admin/broadcast/email` | Admin | Send email to all/active users |
| GET | `/api/admin/broadcast/history` | Admin | Paginated broadcast log |
| GET | `/api/admin/receipts/export` | Admin | Bulk receipt export |
| GET | `/api/admin/sessions` | Admin | View all users' sessions |
| DELETE | `/api/admin/sessions/:id` | Admin | Revoke any user's session |
| GET | `/api/admin/registrations` | Admin | Pending registrations |
| POST | `/api/admin/registrations/:id/approve` | Admin | Approve registration |
| POST | `/api/admin/registrations/:id/reject` | Admin | Reject registration |

### Push Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/push/vapid-public-key` | Yes | VAPID public key for browser subscription |
| POST | `/api/push/subscribe` | Yes | Save push subscription |
| DELETE | `/api/push/unsubscribe` | Yes | Remove push subscription |
| GET | `/api/push/subscriptions` | Yes | List own subscriptions |

### Profile, Preferences, Notifications, Audit, Settings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/PATCH | `/api/profile` | Yes | Own profile (avatar, bio, password) |
| GET/PATCH | `/api/preferences` | Yes | Per-user UI preferences |
| GET | `/api/notifications` | Yes | Notification inbox |
| PATCH | `/api/notifications/:id/read` | Yes | Mark read |
| POST | `/api/notifications/read-all` | Yes | Mark all read |
| DELETE | `/api/notifications/:id` | Yes | Delete notification |
| GET | `/api/audit-logs` | Admin | Paginated audit trail |
| GET/PATCH | `/api/settings` | Admin | Global settings |
| GET | `/api/services` | Yes | Service catalog |
| POST/PATCH/DELETE | `/api/services/:id` | Admin | Manage services |
