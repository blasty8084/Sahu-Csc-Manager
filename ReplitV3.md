# SAHU CSC — Project Quick Reference v3
**Version 3.0.0 — June 30, 2026**

> Authoritative quick-reference for the SAHU CSC platform.  
> For deep architecture: `architectureV3.md` · Change history: `CHANGELOG_V3.md` (v3), `changelogV2.md` (v2) · Workflows: `WORKFLOWS.md`

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
14. [PWA, TWA & Offline](#14-pwa-twa--offline)
15. [i18n](#15-i18n)
16. [Setup Wizard (V3)](#16-setup-wizard-v3)
17. [Key Architecture Decisions](#17-key-architecture-decisions)
18. [Common Problems & Fixes](#18-common-problems--fixes)

---

## 1. Project Overview

**SAHU CSC** is a full-stack business management platform for Common Service Centers (CSC) in rural Odisha, India.

| | |
|---|---|
| Frontend | React 19 + Vite (port 5000 → :80) |
| API | Express 5 (port 8080) |
| Database | PostgreSQL — 15 tables |
| Version | 3.0.0 |

### Core capabilities

| Domain | Features |
|--------|---------|
| **Ledger** | Per-user income/expense · running balance · `CSC-YYYY-NNNN` receipts · QR verification · offline queue |
| **AePS** | Daily cash float · opening balance · withdrawal/deposit |
| **Udhari Khata** | Customer credit ledger — "You Gave / You Got" · WhatsApp reminder · PDF statement |
| **Reports** | Daily / Monthly / AePS / Service breakdown · Excel export |
| **Auth** | Session-based · V2 multi-device · OTP password reset · account locking · idle auto-logout |
| **Admin — Users** | Create/edit/delete · Pending registrations (bulk approve/reject) · Email notifications |
| **Admin — Sessions** | View + revoke any user's active sessions |
| **Admin — Oversight** | Cross-user balance/ledger/AePS overview · audit trail |
| **Admin — Broadcast** | Push notification + email blast · history log |
| **Profile** | Unified Profile+Settings (v2.3) · Personal Info · Security · Sessions · Preferences · Business |
| **PWA** | Installable · offline-first · VAPID push · Android TWA |
| **i18n** | English / Hindi / Odia — all 25 pages |
| **Setup Wizard** | Admin-only first-run banner · `/api/setup-status` public endpoint |

---

## 2. Quick Start

Run these steps **in order** on a fresh setup:

```bash
# Automatic (runs via scripts/post-merge.sh on every import/merge):
pnpm install
pnpm --filter @workspace/db run push

# Manual — run "Seed Database" workflow once:
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts

# Then click ▶ Run (starts API Server + frontend)
```

---

## 3. Default Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `operator` | `operator123` | Operator |

> Run **Seed Database** workflow to reset credentials or populate a fresh database.

---

## 4. Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20, TypeScript 5.9 |
| Frontend | React 19 + Vite 7 + Tailwind CSS v4 + shadcn/ui |
| Theme | Navy `#0b2c60` + Saffron `#f97316` |
| API | Express 5, express-session, helmet, hpp, express-rate-limit |
| Session store | connect-pg-simple (PostgreSQL-backed) |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod (v4), drizzle-zod |
| API contracts | OpenAPI 3.1 → Orval codegen → typed React Query hooks |
| Push | web-push (VAPID — auto-generated if not set) |
| Email | Nodemailer (SMTP) |
| i18n | i18next + react-i18next (EN / HI / OR) |
| PWA | vite-plugin-pwa + Workbox (generateSW) |
| Build | esbuild (API), Vite (frontend) |
| Monorepo | pnpm workspaces |

---

## 5. Monorepo Structure

```
workspace/
├── artifacts/api-server/     @workspace/api-server v3.0.0 — Express 5 (port 8080)
├── artifacts/sahu-csc/       @workspace/sahu-csc v3.0.0 — React + Vite (port 5000)
├── artifacts/mockup-sandbox/ Canvas component preview (port 8081)
├── lib/db/                   @workspace/db — Drizzle ORM + schema (15 tables)
├── lib/api-spec/             @workspace/api-spec — openapi.yaml (source of truth)
├── lib/api-client-react/     @workspace/api-client-react — Orval-generated hooks
├── lib/api-zod/              @workspace/api-zod — Zod schemas
├── infrastructure/pwa/       manifest.json (reference)
├── infrastructure/twa/       twa-config.json v3.0.0 (Android TWA)
├── scripts/post-merge.sh     Auto-runs on import: pnpm install + drizzle-kit push
└── docs/DESKTOP_FORMS_V2.md  Desktop split-form design spec
```

---

## 6. Workflows

| Workflow | Port | Auto-start | Purpose |
|----------|------|-----------|---------|
| `API Server` | 8080 | ✅ Yes | Express API (primary) |
| `artifacts/sahu-csc: web` | 5000 → :80 | ✅ Yes | Vite frontend (primary) |
| `Seed Database` | — | ❌ Manual | One-shot DB seeder |
| `artifacts/api-server: API Server` | 8080 | ⚠️ Platform | Duplicate — expected to fail (port taken by API Server) |
| `artifacts/mockup-sandbox: Component Preview Server` | 8081 | ⚠️ Platform | Canvas UI mockups |

### Workflow commands

```bash
# API Server
pnpm install && PORT=8080 pnpm --filter @workspace/api-server run dev
# dev script: (test -f ./dist/index.mjs || pnpm run build) && fuser -k 8080/tcp; pnpm run start

# artifacts/sahu-csc: web
pnpm install && fuser -k 5000/tcp 21700/tcp 2>/dev/null; sleep 1; PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run dev

# Seed Database (manual)
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts
```

---

## 7. Environment Variables & Secrets

### Required

| Secret | Purpose |
|--------|---------|
| `DATABASE_URL` | PostgreSQL connection string (auto-provisioned by Replit) |
| `SESSION_SECRET` | Express session signing secret |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (587 / 465) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password / app password |

### Optional

| Secret | Default | Purpose |
|--------|---------|---------|
| `SMTP_FROM_EMAIL` | `SMTP_USER` | From address in emails |
| `VAPID_PUBLIC_KEY` | Auto-generated | Web push public key |
| `VAPID_PRIVATE_KEY` | Auto-generated | Web push private key |
| `VAPID_EMAIL` | `mailto:admin@sahucsc.in` | VAPID contact email |

> VAPID keys are auto-generated on startup if not set, but are lost on server restart. Set real keys for production.

### Check configured status

```bash
curl http://localhost:8080/api/setup-status
# {"configured":true,"missing":[]}
```

---

## 8. Database Schema — Quick Reference

| Table | Purpose |
|-------|---------|
| `users` | Accounts (admin / operator / user) |
| `user_sessions` | V2 multi-device session rows |
| `session` | Express session store (connect-pg-simple) |
| `ledger` | Per-user transactions + running balance |
| `receipt_counters` | Atomic CSC-YYYY-NNNN counter per year |
| `aeps_daily` | AePS daily cash float sessions |
| `aeps_transactions` | Individual AePS withdrawals/deposits |
| `udhari_customers` | Udhari Khata customer records |
| `udhari_entries` | Gave/got entries per customer |
| `push_subscriptions` | VAPID Web Push subscription records |
| `notifications` | Per-user + system-wide notifications |
| `settings` | Global key-value config |
| `audit_logs` | Immutable sensitive action trail |
| `password_reset_tokens` | One-time OTP tokens |
| `broadcast_logs` | Admin push/email broadcast history |

Schema push: `pnpm --filter @workspace/db run push`  
⚠️ Can wipe data — always re-seed after.

---

## 9. API Routes — Complete Reference

### Public (no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/setup-status` | Missing secrets check |
| GET | `/api/healthz` | System diagnostics |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Self-registration |
| POST | `/api/auth/send-otp` | Send OTP (password reset) |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/reset-password` | Set new password |
| GET | `/api/receipts/verify/:token` | Public QR receipt verification |

### Authenticated

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| GET/POST/PATCH/DELETE | `/api/ledger` | Ledger CRUD |
| GET | `/api/ledger/balance` | Balance + totals |
| GET | `/api/ledger/summary` | Period summary |
| GET/POST/PATCH/DELETE | `/api/aeps/*` | AePS sessions + transactions |
| GET/POST/PATCH/DELETE | `/api/udhari/*` | Udhari customers + entries |
| GET | `/api/dashboard` | Dashboard stats |
| GET | `/api/reports/*` | Daily / Monthly / AePS / Service / Export |
| GET/POST/DELETE | `/api/push/*` | Push subscription CRUD |
| GET/PATCH | `/api/profile` | Own profile |
| GET/PATCH | `/api/preferences` | UI preferences |
| GET/PATCH/DELETE | `/api/notifications` | Notification inbox |
| GET/PATCH/DELETE | `/api/sessions` | Own multi-device sessions |
| GET | `/api/services` | Service catalog |

### Admin only

| Method | Path | Description |
|--------|------|-------------|
| GET/POST/PATCH/DELETE | `/api/users/*` | User management |
| GET | `/api/admin/users-overview` | Cross-user balance |
| GET | `/api/admin/users-overview/:id/ledger` | Single user's ledger |
| GET | `/api/admin/aeps-overview` | All users' AePS |
| GET/POST | `/api/admin/broadcast/*` | Push + email broadcast |
| GET | `/api/admin/receipts/export` | Bulk receipt export |
| GET/DELETE | `/api/admin/sessions/*` | Any user's sessions |
| GET/POST | `/api/admin/registrations/*` | Pending approvals |
| GET | `/api/audit-logs` | Audit trail |
| GET/PATCH | `/api/settings` | Global settings |
| POST/PATCH/DELETE | `/api/services/:id` | Manage services |

---

## 10. Frontend Pages Reference

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/forgot-password` | OTP password reset (4-step) | Public |
| `/receipts/verify/:token` | Receipt verification | Public |
| `/` | Dashboard | Auth |
| `/ledger` | Ledger | Auth |
| `/aeps` | AePS | Auth |
| `/udhari` | Udhari customer list | Auth |
| `/udhari/:id` | Per-customer ledger | Auth |
| `/services` | Service catalog | Auth |
| `/reports` | Reports | Auth |
| `/notifications` | Notifications | Auth |
| `/profile` | Profile + Settings | Auth |
| `/preferences` | Preferences | Auth |
| `/sessions` | My sessions | Auth |
| `/pwa-status` | App & Offline status | Auth |
| `/download-app` | Install guide | Auth |
| `/about` | Docs & changelog | Auth |
| `/users` | User management | Admin |
| `/users-overview` | Cross-user overview | Admin |
| `/audit-logs` | Audit trail | Admin |
| `/backups` | Backup & restore | Admin |
| `/server-health` | API health check | Admin |
| `/broadcast` | Broadcast center | Admin |

---

## 11. Authentication & Security

### Session management

- **Store:** PostgreSQL via `connect-pg-simple` (survives restarts)
- **Multi-device:** `user_sessions` table — one row per login per device
- **Durations:** Standard = 8 hours · Remember Me = 30 days
- **Account locking:** 5 failed attempts → locked 15 min (auto-unlocks)
- **Idle timeout:** 30 min → 2-min warning dialog → auto-logout

### RBAC

| Role | Permissions |
|------|------------|
| `admin` | `["*"]` — all |
| `operator` | ledger, aeps, reports, udhari, services, profile, notifications |
| `user` | view-only: ledger, reports, services, profile, notifications |

### Audit actions

`login.success` · `login.failed_*` · `logout` · `session.revoke*` · `ledger.*` · `aeps.*` · `profile.*` · `preferences.update` · `user.*` · `settings.update` · `backup.*` · `password.reset` · `REGISTER_REQUEST` · `udhari.*`

---

## 12. Business Modules

### Ledger

- Running balance: `SUM(credit) - SUM(debit)` of all prior entries — computed at insert, never from client
- Receipt number: `CSC-YYYY-NNNN` (atomic counter per year in `receipt_counters`)
- Receipt token: UUID → QR code → public verify at `/receipts/verify/:token`
- Offline: pending entries in IndexedDB; auto-sync on reconnect; `SyncStatusBar` shows status

### AePS

- `aeps_daily` (one session per user per day) + `aeps_transactions` (individual items)
- Opening balance: `OpeningBalanceHeroCard` — full-width navy gradient (not in stat grid)
- Aadhaar masking: `XXXX XXXX <last 4>` at rest; raw while focused

### Udhari Khata

- `balance > 0` = customer owes you (To Collect)
- `balance < 0` = you owe customer (To Pay)
- `recalcBalance()` runs `SUM` server-side after every change
- WhatsApp reminder + client-side PDF export

### Reports

- Command Center design: horizontal top nav, navy KPI strip, 2-col charts
- Excel export: `.xlsx` with Ledger + AePS sheets

---

## 13. Admin Features

| Feature | Where |
|---------|-------|
| User management (6 tabs) | `/users` |
| Pending registrations (bulk approve/reject) | `/users` → Pending tab |
| Bulk activate / suspend | `/users` → Active / All tabs |
| Admin password reset | `/users` → user row → KeyRound icon |
| CSV export | `/users` → Download button |
| Cross-user balance overview | `/users-overview` |
| AePS overview (all operators) | `/users` → AePS Overview tab |
| Session management (any user) | `/users` → Sessions tab |
| Audit trail | `/audit-logs` |
| Backup & restore | `/backups` |
| Server health / diagnostics | `/server-health` |
| Broadcast center (push + email) | `/broadcast` |
| Bulk receipt export | `/broadcast` → Admin tools |
| Business settings | `/profile` → Business Info section |

---

## 14. PWA, TWA & Offline

### PWA

- **Manifest:** `display: standalone` · `orientation: portrait-primary` · `theme_color: #0b2c60`
- **Icons:** 96 / 144 / 192 / 512px + maskable + 180px apple-touch-icon
- **Shortcuts:** Dashboard · New Ledger Entry · AePS Cash · Reports
- **Install:** Prompted via `pwa-install-banner.tsx`; guide at `/download-app`

### Offline capabilities

| Feature | How |
|---------|-----|
| Offline ledger entry | IndexedDB `pending_ledger` → auto-sync on reconnect |
| Offline auth | IndexedDB `user_session` cache (24 hr) |
| Offline dashboard | IndexedDB `cache_store` (5 min TTL) |
| Sync status | `SyncStatusBar` — 🟢/🟡/🔴/🔵 states |
| Network detection | `use-network-status.ts` — online/offline/slow + 30s probe |

### Service Worker Cache (10 buckets)

| Pattern | Strategy | TTL |
|---------|----------|-----|
| `/api/auth/*` | NetworkOnly | Never |
| `/api/dashboard` | StaleWhileRevalidate | 5 min |
| `/api/reports` | StaleWhileRevalidate | 10 min |
| `/api/settings` | StaleWhileRevalidate | 30 min |
| `/api/ledger` | NetworkFirst | 5 min (8s timeout) |
| `/api/services` | NetworkFirst | 1 hr (8s timeout) |
| Images | CacheFirst | 30 days |
| Fonts | CacheFirst | 1 year |

### Android TWA

1. `npm install -g @bubblewrap/cli`
2. `bubblewrap init --manifest https://<domain>/manifest.webmanifest`
3. Generate keystore → get SHA-256 fingerprint
4. Update `public/.well-known/assetlinks.json`
5. Deploy → `bubblewrap build` → upload to Play Console

Package: `com.sahucsc.app` · Min SDK: 21 · Target: 34 · Version: 3.0.0 (code: 3)

---

## 15. i18n

| Code | Language |
|------|----------|
| `en` | English |
| `hi` | Hindi (Devanagari) |
| `or` | Odia |

- `localStorage["sahu-lang"]` → read by `i18n.ts` on init
- Language switcher: **Profile → Preferences → Language** (not sidebar)
- All 25 pages + `layout.tsx` fully translated
- String constants with translations must be **inside** component functions (after `useTranslation()`) — never at module scope

---

## 16. Setup Wizard (V3)

Admin-only banner at top of every page when secrets are missing.

**Red banner** → critical missing (`SESSION_SECRET`, SMTP)  
**Yellow banner** → optional missing (VAPID)  
**Session-dismissed** → `sessionStorage.setItem("sahu-setup-banner-dismissed-v1", "1")`

```bash
# Check status
curl http://localhost:8080/api/setup-status
```

---

## 17. Key Architecture Decisions

| Rule | Why |
|------|-----|
| `connect-pg-simple` in esbuild `external` | Bundling breaks internal `table.sql` path → silent session failures |
| Auth loading uses `\|\|` not `&&` | `&&` = auto-logout on refresh (offline check finishes before live fetch) |
| Login uses `setQueryData`, not refetch | Avoids race condition through Replit proxy |
| `willChange: transform` forbidden on nav ancestors | Creates CSS containing block → breaks `position: fixed` nav |
| Money via `parseFloat()` from DB | Drizzle `numeric` returns strings; always convert before responding |
| Notification `userId = null` = all-user | Always pass explicit `userId` for user-specific notifications |
| i18n constants inside component body | Module-scope translated strings use wrong language |
| `send-otp` returns 200 for unknown user | Prevents account enumeration |
| VAPID auto-generated on startup | Dev-friendly; set real secrets for production |

---

## 18. Common Problems & Fixes

| Problem | Fix |
|---------|-----|
| `artifacts/api-server: API Server` shows "failed" | Expected — platform duplicate; `API Server` already holds port 8080. No action needed. |
| Port 21700 in use | `fuser -k 21700/tcp 2>/dev/null` → restart `artifacts/sahu-csc: web` |
| Login fails — "Invalid credentials" | DB may be empty. Run **Seed Database** workflow. |
| API changes not showing | `rm -rf artifacts/api-server/dist/` → restart `API Server` |
| Language not switching | Language is in **Profile → Preferences → Language** (removed from sidebar) |
| Stale frontend content | DevTools → Application → Storage → Clear site data → Reload |
| 502 Bad Gateway | Server still starting. Wait 15–20s. Check API Server logs. |
| Schema push wipes data | Always run **Seed Database** immediately after `drizzle-kit push` |
| Push subscriptions lost on restart | Set `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` in Replit Secrets |
| Setup banner keeps appearing | Add missing secrets → restart API Server → banner hides |
| `EADDRINUSE` on port 5000 | `fuser -k 5000/tcp` → restart `artifacts/sahu-csc: web` |

---

*Last updated: June 30, 2026 | Version 3.0.0*
