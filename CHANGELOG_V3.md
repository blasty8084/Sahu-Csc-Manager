# SAHU CSC — Change Log v3
**Current version: 3.0.0 — June 30, 2026**

> Detailed record of every feature, change, and upgrade from v3.0.0 onward.  
> For v2.x history, see `changelogV2.md`.  
> For pre-v2 history, see `CHANGELOG.md`.  
> For full architecture reference, see `architectureV3.md`.

---

## Table of Contents

1. [v3.0.0 — Setup Wizard, SMTP Integration & Auto-Import (June 30, 2026)](#1-v300--setup-wizard-smtp-integration--auto-import-june-30-2026)

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
