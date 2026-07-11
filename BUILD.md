# SAHU CSC Manager — BUILD.md
**Version 3.5.4 — July 11, 2026**

> Single source of truth for any developer, AI agent, or new contributor.  
> Read this file first — no other file analysis needed to understand the project.

---

## 1. Project Overview

**SAHU CSC Manager** is a full-stack business management platform for CSC (Common Service Centre) operators in Odisha, India. It helps rural CSC operators manage daily business operations digitally.

| | |
|---|---|
| **Target users** | CSC operators in rural / semi-urban Odisha, India |
| **Languages supported** | English · Hindi · Odia |
| **GitHub** | https://github.com/blasty8084/Sahu-Csc-Manager |
| **Hosting** | Replit (dev + production deploy) |
| **Version** | 3.5.0 |

### Core business domain

- AePS (Aadhaar-enabled Payment System) cash management
- Daily financial ledger (income / expense) with running balance
- Customer credit ledger — "Udhari Khata" (gave / got)
- Receipt generation: `CSC-YYYY-NNNN` number + QR code verification
- Service catalog management (22 services, 5 categories)
- Daily / monthly reports with Excel export
- Admin-controlled user registration, RBAC, multi-device sessions
- PWA (installable, offline-first) + Android TWA
- Push notifications (VAPID), email (SMTP), broadcast center

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Runtime | Node.js 20, TypeScript 5.9 |
| Frontend | React 19 + Vite 7 + Tailwind CSS v4 + shadcn/ui |
| Backend | Express 5 + TypeScript |
| Database | PostgreSQL via Replit DB (Drizzle ORM) |
| Session store | connect-pg-simple (PostgreSQL-backed) |
| Auth | express-session + bcrypt (session-based, no JWT) |
| Email | Nodemailer (SMTP — any provider) |
| PWA | vite-plugin-pwa + Workbox service worker |
| Push | web-push (VAPID keys, auto-generated on startup) |
| i18n | i18next + react-i18next (EN / HI / OR) |
| API design | Contract-first OpenAPI → Orval codegen → typed React Query hooks |
| Build | esbuild (API), Vite (frontend) |

> No Firebase, no Upstash Redis, no Neon — this version uses only Replit-provisioned PostgreSQL.

---

## 3. Monorepo Structure

```
workspace/
├── artifacts/
│   ├── api-server/              # @workspace/api-server — Express 5 backend (port 8080)
│   │   ├── src/
│   │   │   ├── app.ts           # Express app, middleware, session store
│   │   │   ├── index.ts         # HTTP server entry point
│   │   │   ├── routes/          # One file per resource group
│   │   │   │   ├── index.ts                 # Router composition
│   │   │   │   ├── auth.ts                  # Login / logout / me / register
│   │   │   │   ├── password-reset.ts        # OTP-based forgot/reset
│   │   │   │   ├── sessions.ts              # V2 multi-device session list + revoke
│   │   │   │   ├── ledger.ts                # Ledger CRUD + balance/summary
│   │   │   │   ├── aeps.ts                  # AePS daily sessions + transactions
│   │   │   │   ├── services.ts              # Service catalog CRUD
│   │   │   │   ├── users.ts                 # User management (admin)
│   │   │   │   ├── admin.ts                 # Admin oversight (cross-user views)
│   │   │   │   ├── admin-sessions.ts        # Admin session revocation
│   │   │   │   ├── admin-registration.ts    # Pending user approvals
│   │   │   │   ├── admin-receipt-export.ts  # Bulk receipt export (admin)
│   │   │   │   ├── profile.ts               # Own profile + avatar
│   │   │   │   ├── preferences.ts           # Per-user UI preferences
│   │   │   │   ├── notifications.ts         # Notification inbox
│   │   │   │   ├── reports.ts               # Reports, dashboard, export
│   │   │   │   ├── audit.ts                 # Audit log viewer (admin)
│   │   │   │   ├── settings.ts              # Global settings + backups
│   │   │   │   ├── push.ts                  # Push subscription CRUD (VAPID)
│   │   │   │   ├── udhari.ts                # Udhari Khata CRUD
│   │   │   │   ├── receipts.ts              # Public receipt verify endpoint
│   │   │   │   ├── broadcast.ts             # Admin push + email broadcast
│   │   │   │   ├── health.ts                # GET /api/healthz (diagnostics)
│   │   │   │   └── setup-status.ts          # GET /api/setup-status (public)
│   │   │   └── lib/
│   │   │       ├── auth.ts      # requireAuth / requireRole / requirePermission / parseDevice
│   │   │       ├── notify.ts    # createNotification helper
│   │   │       ├── logger.ts    # Pino structured logger
│   │   │       ├── mailer.ts    # Nodemailer SMTP helpers (OTP, approval, broadcast)
│   │   │       ├── push.ts      # web-push helpers (sendPushToUser, sendPushToAll)
│   │   │       ├── vapid.ts     # VAPID key auto-generation / env detection
│   │   │       └── otp-cleanup.ts # Hourly job: deletes expired OTP rows
│   │   ├── build.mjs            # esbuild bundler (connect-pg-simple in external)
│   │   └── scripts/
│   │       ├── seed.ts          # DB seeder (users, services, settings, notifications)
│   │       ├── backup.ts        # pg_dump to /backups/
│   │       └── restore.ts       # psql restore from backup
│   │
│   ├── sahu-csc/                # @workspace/sahu-csc — React + Vite frontend (port 5000)
│   │   ├── index.html
│   │   ├── vite.config.ts       # Vite + VitePWA + Workbox + proxy → 8080
│   │   ├── public/
│   │   │   ├── sahu-logo.png        # Primary brand logo
│   │   │   ├── apple-touch-icon.png # 180×180 iOS icon
│   │   │   ├── pwa-*.png            # PWA icons (96/144/192/512)
│   │   │   └── .well-known/
│   │   │       └── assetlinks.json  # Digital Asset Links for TWA (Android)
│   │   └── src/
│   │       ├── App.tsx          # QueryClient, providers, router
│   │       ├── main.tsx         # createRoot + registerSW + syncEngine init
│   │       ├── pages/           # 25 pages (all fully translated EN/HI/OR)
│   │       ├── components/      # Layout, banners, UI components
│   │       ├── hooks/           # Auth, network, PWA, sync, push, idle, device
│   │       ├── locales/         # {en,hi,or}/translation.json (~860 keys each)
│   │       └── lib/             # offline-db, sync-engine, pwa-badge, utils, i18n
│   │
│   └── mockup-sandbox/          # Canvas component preview server (port 8081)
│
├── lib/
│   ├── db/                      # @workspace/db — Drizzle ORM schema + pool
│   ├── api-spec/                # @workspace/api-spec — openapi.yaml (source of truth)
│   ├── api-client-react/        # @workspace/api-client-react — Orval-generated hooks
│   └── api-zod/                 # @workspace/api-zod — Zod schemas
│
├── infrastructure/
│   ├── pwa/manifest.json        # Full standalone PWA manifest reference
│   └── twa/twa-config.json      # Android TWA config (Bubblewrap CLI)
│
├── docs/
│   └── DESKTOP_FORMS_V2.md      # Full-screen split layout spec for desktop forms
│
├── scripts/
│   └── post-merge.sh            # Auto-runs pnpm install + drizzle-kit push on import
│
├── BUILD.md                     # This file — project overview
├── CHANGELOG.md                 # Full feature changelog (pre-v3)
├── docs/archive/changelogV2.md  # v2.x detailed changelog (archived)
├── CHANGELOG_V3.md              # v3.x detailed changelog
├── docs/archive/ARCHITECTURE.md    # Full architecture reference (legacy, see architectureV3.md)
├── docs/archive/architectureV2.md  # v2 architecture reference (archived)
├── architectureV3.md            # v3 authoritative architecture (current)
├── WORKFLOWS.md                 # Workflow guide (port map, quick-start, troubleshooting)
├── ReplitV3.md                  # Quick-reference for agents and developers
└── replit.md                    # Project README + user preferences
```

---

## 4. Environment Variables & Secrets

All secrets are stored in **Replit Secrets** (🔒 tab in sidebar) — never in `.env` files.

### Required Secrets

| Secret | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string — auto-provisioned by Replit |
| `SESSION_SECRET` | Express session signing secret — any long random string |
| `SMTP_HOST` | SMTP server hostname (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (`587` for TLS, `465` for SSL) |
| `SMTP_USER` | SMTP username / email address |
| `SMTP_PASS` | SMTP password or app password |

### Optional Secrets

| Secret | Default | Description |
|---|---|---|
| `SMTP_FROM_EMAIL` | `SMTP_USER` | From address shown in emails |
| `VAPID_PUBLIC_KEY` | Auto-generated | Web push public key (lost on restart if not set) |
| `VAPID_PRIVATE_KEY` | Auto-generated | Web push private key |
| `VAPID_EMAIL` | `mailto:admin@sahucsc.in` | VAPID contact email |

> **VAPID auto-generation:** If VAPID keys are not set, the API generates temporary keys on startup. These are lost on server restart, so push subscriptions won't survive restarts. Set real keys for production via `node -e "const wp = require('web-push'); console.log(wp.generateVAPIDKeys())"`.

> **SMTP:** If SMTP is not configured, OTP login, password reset, and admin email notifications are disabled. Username+password login still works.

---

## 5. Database Schema — 15 Tables

| Table | Purpose |
|---|---|
| `users` | All user accounts (admin / operator / user roles) |
| `user_sessions` | V2 multi-device session tracking — one row per active login |
| `session` | Express session store (connect-pg-simple, auto-created) |
| `ledger` | Per-user income/expense transactions with running balance |
| `receipt_counters` | Atomic sequential counter per year for CSC-YYYY-NNNN |
| `aeps_daily` | AePS daily cash float sessions (one per user per day) |
| `aeps_transactions` | Individual AePS withdrawals/deposits per session |
| `udhari_customers` | Udhari Khata customer records per user |
| `udhari_entries` | Individual credit/debit entries per customer |
| `push_subscriptions` | VAPID Web Push subscription records per device |
| `notifications` | Per-user + system-wide notification records |
| `settings` | Global key-value config store |
| `audit_logs` | Immutable audit trail of all sensitive actions |
| `password_reset_tokens` | One-time OTP tokens for password reset |
| `broadcast_logs` | History of admin push/email broadcasts |

Schema applied via:
```bash
pnpm --filter @workspace/db run push
```

> ⚠️ `drizzle-kit push` can wipe table data on destructive changes. Always re-seed immediately after.

---

## 6. API Architecture (Contract-First)

This project uses a **contract-first OpenAPI** approach — spec is written first, code generated from it.

### Workflow for every new endpoint

```
1. Update OpenAPI spec  →  lib/api-spec/openapi.yaml
2. Run codegen          →  pnpm --filter @workspace/api-spec run codegen
3. Update Drizzle schema→  lib/db/src/schema/<table>.ts
4. Push schema          →  pnpm --filter @workspace/db run push
5. Implement route      →  artifacts/api-server/src/routes/<resource>.ts
6. Build React UI       →  artifacts/sahu-csc/src/pages/ or components/
```

> ⚠️ Never edit `lib/api-client-react/src/generated/` directly — auto-generated by Orval. Run codegen to regenerate.

---

## 7. Running the Project

### Workflows (configured in `.replit`)

| Workflow | Port | Auto-start | Purpose |
|---|---|---|---|
| `SAHU CSC` | 5000 → :80 | ✅ Yes | Vite frontend dev server |
| `API Server` | 8080 | ✅ Yes | Express API (pre-built dist/index.mjs) |
| `Build API` | — | ❌ Manual | Rebuild API ESM bundle after source changes |
| `Seed Database` | — | ❌ Manual | One-shot DB seeder (requires ADMIN_PASSWORD + OPERATOR_PASSWORD secrets) |
| `Typecheck` | — | ❌ Manual | TypeScript check across all packages (0 errors as of 2026-07-03) |
| `Build Production` | — | ❌ Manual | Full production build: typecheck + API + Vite + PWA SW |
| `Production Preview` | 5000 | ❌ Manual | Build + serve production bundle on port 5000 |

> **After backend source changes:** Run `Build API` → restart `API Server`.

### First-time setup (after import)

```bash
# 1. Install dependencies (auto-runs via post-merge.sh on GitHub import)
pnpm install

# 2. Push schema (auto-runs via post-merge.sh)
pnpm --filter @workspace/db run push

# 3. Seed (manual — requires ADMIN_PASSWORD + OPERATOR_PASSWORD in Replit Secrets)
# Run "Seed Database" workflow, or:
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts

# 4. Start
# Click ▶ Run button — starts SAHU CSC + API Server
```

### Default login credentials

| Username | Password | Role |
|---|---|---|
| `admin` | value of `ADMIN_PASSWORD` secret | Admin |
| `operator` | value of `OPERATOR_PASSWORD` secret | Operator |

---

## 8. Authentication Flow

### Login
1. User submits username / email / mobile + password
2. Server verifies credentials, bcrypt 12 rounds
3. Creates `express-session` row (PostgreSQL via connect-pg-simple)
4. Creates `user_sessions` row (V2 multi-device tracking)
5. Session cookie set: `httpOnly`, `sameSite: strict` in production

### Registration
1. User submits registration form (self-signup)
2. OTP sent via SMTP email
3. Admin reviews pending registrations (approve / reject)
4. Approved users receive email notification and can log in

### Password Reset (4-step)
1. `/forgot-password` — enter username or email
2. OTP sent via SMTP
3. Enter OTP (6-digit, 2-minute resend cooldown, SVG progress ring)
4. Set new password (8+ chars, uppercase, lowercase, number)

### RBAC Roles

| Role | Access |
|---|---|
| `admin` | All permissions (`["*"]`) |
| `operator` | ledger, aeps, reports, udhari, services, profile, notifications |
| `user` | Read-only: ledger, reports, services, profile, notifications |

---

## 9. Features — Complete Reference

| Feature | Key Files |
|---|---|
| Dashboard | `pages/dashboard.tsx` |
| Ledger (offline-capable) | `pages/ledger.tsx`, `lib/offline-db.ts`, `lib/sync-engine.ts` |
| AePS cash management | `pages/aeps.tsx`, `routes/aeps.ts` |
| Udhari Khata | `pages/udhari.tsx`, `pages/udhari-customer.tsx`, `routes/udhari.ts` |
| Receipt generation (CSC-YYYY-NNNN) | `components/receipt-modal.tsx`, `routes/receipts.ts` |
| QR code + public verify | `pages/receipts-verify.tsx`, `GET /api/receipts/verify/:token` |
| Reports + Excel export | `pages/reports.tsx`, `routes/reports.ts` |
| Push notifications (VAPID) | `routes/push.ts`, `lib/push.ts`, `lib/vapid.ts` |
| Broadcast Center | `pages/broadcast.tsx`, `routes/broadcast.ts` |
| Multi-device sessions | `pages/sessions.tsx`, `routes/sessions.ts` |
| Admin user management | `pages/users.tsx`, `routes/users.ts` |
| Admin oversight | `pages/users-overview.tsx`, `routes/admin.ts` |
| Admin registration management | `routes/admin-registration.ts` |
| Audit logs | `pages/audit-logs.tsx`, `routes/audit.ts` |
| Bulk receipt export | `routes/admin-receipt-export.ts` |
| Profile + Settings (unified) | `pages/profile.tsx` |
| Preferences (language + theme) | `pages/preferences.tsx` |
| Notifications | `pages/notifications.tsx`, `routes/notifications.ts` |
| Server health check | `pages/server-health.tsx`, `routes/health.ts` |
| PWA install guide | `pages/download-app.tsx` |
| About / docs | `pages/about.tsx` |
| Offline status | `pages/pwa-status.tsx` |
| Setup Wizard Banner | `components/setup-wizard-banner.tsx`, `routes/setup-status.ts` |
| OTP email + auto-fill | `lib/mailer.ts`, `pages/forgot-password.tsx`, `pages/register.tsx` |
| i18n (EN/HI/OR) | `locales/`, `lib/i18n.ts`, `components/language-switcher.tsx` |

---

## 10. Branding & UI Guidelines

### Colors

| Token | Value | Usage |
|---|---|---|
| Navy (Primary) | `#0b2c60` | Header, sidebar, buttons, stat cards |
| Saffron (Accent) | `#f97316` | CTAs, active states, highlights, icon badges |

### Layout rules

- Use Tailwind responsive classes (`sm:hidden` / `hidden sm:block`) — not JS `isMobile` (causes flicker)
- Mobile FAB: `bottom-20` (80px) — bottom nav is ~64px tall
- **Never** add `willChange: transform` to any ancestor of the bottom `<nav>` — creates a CSS containing block that breaks `position: fixed`
- Page transitions: no `willChange: transform` on motion.div wrappers

### Desktop forms

Full-screen split layout: 380px dark gradient left panel (stats) + `flex: 1` white right panel (form). Documented in `docs/DESKTOP_FORMS_V2.md`.

### Component library

shadcn/ui — import from `@/components/ui/`. Toast system: custom Framer Motion renderer in `toaster.tsx` (4 variants: default/navy, success, destructive, warning).

---

## 11. PWA & TWA

### PWA

- `vite-plugin-pwa` + Workbox (generateSW strategy)
- Manifest: `display: standalone`, `orientation: portrait-primary`
- Icons: 96 / 144 / 192 / 512px + 180px apple-touch-icon + maskable
- 4 App Shortcuts: Dashboard, New Ledger Entry, AePS Cash, Reports
- Offline-first: IndexedDB pending queue + Workbox caching
- Push: VAPID via web-push; subscribe at `/api/push/*`

### TWA (Android)

1. Install Bubblewrap: `npm install -g @bubblewrap/cli`
2. `bubblewrap init --manifest https://<your-domain>/manifest.webmanifest`
3. Generate keystore: `keytool -genkey -v -keystore android.keystore -alias sahucsc -keyalg RSA -keysize 2048 -validity 10000`
4. Get SHA-256: `keytool -list -v -keystore android.keystore | grep SHA256`
5. Update `artifacts/sahu-csc/public/.well-known/assetlinks.json` with package name + fingerprint
6. Deploy so assetlinks.json is live at `/.well-known/assetlinks.json`
7. `bubblewrap build` → upload `.aab` to Google Play Console

Config: `infrastructure/twa/twa-config.json`  
Package ID: `com.sahucsc.app`  
Min SDK: 21 (Android 5.0), Target SDK: 34

---

## 12. Setup Wizard Banner (V3)

When an admin logs in with missing secrets, a banner appears at the top of every page (admin only):

- **Red banner** — critical secrets missing (`SESSION_SECRET`, SMTP)
- **Yellow banner** — only optional secrets missing (VAPID)
- Expandable: lists each missing secret with label, severity, description
- Dismissed per-session via `sessionStorage` — reappears on next login until fixed

Detection: `GET /api/setup-status` (public endpoint, no auth required).

---

## 13. Known Issues & Workarounds

| Issue | Workaround |
|---|---|
| `drizzle-kit push` wipes data | Always run "Seed Database" workflow immediately after schema push |
| API changes not reflected | Run **Build API** workflow → restart **API Server** |
| Login fails / "Invalid credentials" | Ensure `ADMIN_PASSWORD` + `OPERATOR_PASSWORD` secrets are set, then run **Seed Database** |
| VAPID keys lost on restart | Set `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` in Replit Secrets (see Section 4) |
| Language not switching | Language is in Profile → Preferences → Language (not sidebar) |
| Frontend shows stale content | Clear service worker: DevTools → Application → Storage → Clear site data → Reload |
| TypeScript errors | Run **Typecheck** workflow — 0 errors as of 2026-07-03 |

---

## 14. Common Commands

```bash
# Development
pnpm --filter @workspace/api-server run dev      # API server (port 8080)
pnpm --filter @workspace/sahu-csc run dev         # Frontend (port 5000)

# Database
pnpm --filter @workspace/db run push              # Push schema to DB
pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts  # Seed data

# Type checking
pnpm run typecheck:libs                           # Build lib declarations first
pnpm run typecheck                                # Full typecheck all packages

# API codegen
pnpm --filter @workspace/api-spec run codegen     # Regenerate React Query hooks + Zod schemas

# Build
pnpm run build                                    # Typecheck + build all packages

# Force API rebuild
rm -rf artifacts/api-server/dist/                 # Delete cached bundle

# Port cleanup
fuser -k 8080/tcp 2>/dev/null                     # Free API port
fuser -k 5000/tcp 2>/dev/null                     # Free frontend port
fuser -k 21700/tcp 2>/dev/null                    # Free canvas artifact port

# Generate VAPID keys
node -e "const wp = require('web-push'); console.log(wp.generateVAPIDKeys())"
```

---

## 15. How to Add New Features

```
Step 1: Update OpenAPI spec    →  lib/api-spec/openapi.yaml
Step 2: Run codegen            →  pnpm --filter @workspace/api-spec run codegen
Step 3: Add Drizzle schema     →  lib/db/src/schema/<table>.ts + schema/index.ts
Step 4: Push schema            →  pnpm --filter @workspace/db run push
Step 5: Implement route        →  artifacts/api-server/src/routes/<resource>.ts
Step 6: Register route         →  artifacts/api-server/src/routes/index.ts
Step 7: Build React UI         →  artifacts/sahu-csc/src/pages/ or components/
Step 8: Add i18n keys          →  src/locales/{en,hi,or}/translation.json
Step 9: Test mobile (375px)
Step 10: Force API rebuild     →  rm -rf artifacts/api-server/dist/ + restart API Server
```

### Rules for every UI change

- Always use `#0b2c60` (navy) and `#f97316` (saffron) — never hardcode other brand colors
- Always mobile-first — test at 375px width
- Translated string constants (arrays, config objects) must be **inside** the component function after `const { t } = useTranslation()` — never at module scope
- After every layout change, verify bottom nav is still visible and fixed position

---

*Last updated: July 3, 2026 | Version 3.1.1 | Maintained by: Uttam Sahu (blasty8084)*
*See `UPDATES.md` for session-by-session change log. See `CHANGELOG_V3.md` for full v3.x feature history.*
