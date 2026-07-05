# SAHU CSC — Complete Platform Documentation
**Version 3.2.2** — last updated 2026-07-05

> Common Service Center (CSC) Business Management Platform for Odisha / India rural service centers.
> Full-stack · PWA · Offline-capable · Multilingual (English / Hindi / Odia)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Version History](#2-version-history)
3. [Quick Start](#3-quick-start)
4. [Workflows](#4-workflows)
5. [Default Login Credentials](#5-default-login-credentials)
6. [Environment Variables & Secrets](#6-environment-variables--secrets)
7. [Tech Stack](#7-tech-stack)
8. [Data Store Architecture](#8-data-store-architecture)
9. [API Routes Reference](#9-api-routes-reference)
10. [Frontend Pages Reference](#10-frontend-pages-reference)
11. [Components Reference](#11-components-reference)
12. [Hooks Reference](#12-hooks-reference)
13. [Directory Structure](#13-directory-structure)
14. [Authentication & Security](#14-authentication--security)
15. [Role-Based Access Control](#15-role-based-access-control)
16. [Setup Wizard Banner](#16-setup-wizard-banner)
17. [PWA & Offline Features](#17-pwa--offline-features)
18. [Internationalisation (i18n)](#18-internationalisation-i18n)
19. [Backup & Restore](#19-backup--restore)
20. [Android TWA Setup](#20-android-twa-setup)
21. [Architecture Decisions](#21-architecture-decisions)
22. [Common Commands](#22-common-commands)

---

## 1. Overview

SAHU CSC is a production-grade, full-stack platform designed for Indian Common Service Center operators. It handles the complete day-to-day workflow of a CSC business:

| Module | Description |
|--------|-------------|
| **Ledger** | Daily income/expense tracking with sequential receipt numbers and QR-verified receipts |
| **AePS Cash Management** | Aadhaar-enabled Payment System cash session tracking (opening balance, withdrawals, deposits) |
| **Udhari Khata** | Customer credit ledger — track who owes you and who you owe, with WhatsApp reminders and PDF statements |
| **Services Catalog** | List of CSC services offered (Aadhaar, PAN, insurance, etc.) |
| **Reports** | Daily and monthly income/expense reports with charts and Excel export |
| **User Management** | Multi-user support with admin, operator, and user roles |
| **Admin Oversight** | Cross-user balance, ledger, and AePS views for admin role |
| **Backup & Restore** | Scheduled pg_dump backups with selective-table import |
| **Notifications** | In-app + push (VAPID) + email broadcast |
| **Audit Logs** | Full security audit trail for all critical actions |

**Target environment:** Replit hosted, PostgreSQL-backed, deployable as a Replit app or Android TWA.

---

## 2. Version History

### v3.2.2 — Adaptive Animation Performance (2026-07-05)

| Feature | Description |
|---------|-------------|
| **Device performance tiers** | `PerformanceProvider` (`hooks/use-performance-tier.tsx`) buckets the session into `high` / `medium` / `low` using CPU cores, `deviceMemory`, network `saveData`/`effectiveType`, and a one-time `requestAnimationFrame` benchmark |
| **60-120fps on high-end, 30-40fps on low-end** | High tier keeps full decorative motion; low tier swaps infinite-loop animations (spinner ring, loading dots, progress sweep) for a cheap `animate-pulse` equivalent |
| **Shorter, not longer, transitions on weak hardware** | `scaleDuration()` trims page-transition/splash durations on lower tiers since long animations are what visibly drop frames on weak GPUs |
| **`prefers-reduced-motion` always wins** | Reduced-motion users get all animation durations forced to ~0 via global CSS — skips tier detection and benchmarking entirely |
| **`data-perf-tier` / `data-reduced-motion` on `<html>`** | Lets any component or CSS rule react to device capability without prop drilling |

### v3.2.1 — Skeleton Screens Everywhere (2026-07-04)

| Feature | Description |
|---------|-------------|
| **All remaining spinners replaced** | `backups.tsx`, `profile.tsx`, `udhari-customer.tsx`, `sessions.tsx` converted from spinner-based `SectionLoader`/`Loader2` to content-shaped skeletons |
| **7 new skeleton components** | `AdminSessionsSkeleton`, `UsersOverviewSkeleton`, `BackupHistorySkeleton`, `BackupScheduleSkeleton`, `ProfileToggleSkeleton`, `ProfilePageSkeleton`, `UdhariCustomerHeaderSkeleton` added to `skeletons.tsx` |
| **`SectionLoader` fully retired** | No page imports or renders the spinner component anymore; every loading state app-wide is now a shimmer skeleton matching final content shape |

### v3.2.0 — Persistent Cache & Skeleton Loading (2026-07-04)

| Feature | Description |
|---------|-------------|
| **Persistent React Query cache** | `PersistQueryClientProvider` + sessionStorage persister; 5 min staleTime / 30 min gcTime |
| **`EagerPreloader`** | Prefetches 7 key queries right after login so pages are warm before navigation |
| **14 initial skeleton components** | Dashboard, ledger, AePS, reports, notifications, udhari, services, preferences, sessions, audit logs |
| **Smooth page transitions** | 200ms enter / 80ms exit, opacity-only (no transform, to avoid breaking fixed bottom nav) |

### v3.1.1 — Receipt Export Mobile Redesign (2026-07-01)

| Feature | Description |
|---------|-------------|
| **Mobile screen fit** | Outer container uses `height: 100dvh` — fills exactly the dynamic viewport on all mobile browsers, no overflow |
| **4-tab bottom nav** | Persistent bottom nav: **Receipts** / **By Date** / **Summary** / **Export** — always visible, active tab highlighted with navy icon circle |
| **KPI strip** | Solid dark-navy (`#0d3272`) stat cards with orange icons — Total / Amount / Selected — always shown in header |
| **Empty state redesign** | Large centred receipt icon, "How it works" heading, **orange-numbered** step list, solid navy "Open Filters" pill button |
| **Preview overlay** | Receipt detail shown as a full-screen overlay; bottom nav remains visible underneath; back arrow collapses it |
| **By Date tab** | Standalone date range picker with 5 quick presets (Today / Week / This Month / Last Month / Year) + operator filter + Preview button |
| **Summary tab** | 4 colour-coded aggregate stat cards (Total Receipts, Total Amount, Credit Entries, Debit Entries) |
| **Export button style** | Orange `rounded-full` pill in header, matching the reference design |

### v3.1.0 — Backup & Restore Overhaul (2026-06-30)

| Feature | Description |
|---------|-------------|
| **Backup page redesign** | "Minimal Clean" UI — 2-column desktop grid (history left, schedule + import right), navy card borders, saffron CTAs, dashed import dropzone, expand-on-hover action buttons |
| **Backup download** | `GET /api/backups/:id/download` — streams `.sql` file to browser with `Content-Disposition: attachment` |
| **Auto-backup scheduler** | `node-cron` scheduler (`backup-scheduler.ts`) — daily/weekly/custom cron, configurable time + retention. `GET/POST /api/backups/schedule` endpoints |
| **Selective table import** | `POST /api/backups/analyze` parses pg_dump COPY blocks. `POST /api/backups/selective-import` replays chosen tables with FK checks disabled |

### v3.0.0 — Setup Wizard & Secrets Management (2026-06)

| Feature | Description |
|---------|-------------|
| **Setup Wizard Banner** | Admin-only banner shown after login when required secrets are missing. Red = critical, yellow = optional. Expandable with per-secret descriptions and Secrets docs link. Dismissed per session |
| **`/api/setup-status`** | Public endpoint (no auth) — returns `{ configured, missing[] }`. Checks SESSION_SECRET, SMTP, ADMIN_PASSWORD, OPERATOR_PASSWORD, and VAPID config |
| **Automatic DB migration** | `scripts/post-merge.sh` runs `pnpm install` + `drizzle-kit push` on every GitHub import / task merge |
| **Secure seed passwords** | `seed.ts` reads `ADMIN_PASSWORD` and `OPERATOR_PASSWORD` from Replit Secrets — hard-fails if missing, never prints passwords to logs |

### v2.x — Auth, Receipts, Udhari, i18n, PWA (2025–2026)

| Feature | Description |
|---------|-------------|
| **V2 multi-device sessions** | `user_sessions` table; device info, IP, browser, OS, expiry per session |
| **Receipt system** | CSC-YYYY-NNNN sequential numbers via atomic `receipt_counters` table; UUID receipt tokens for QR verification; public `/receipts/verify/:token` page |
| **Udhari Khata** | Customer credit/debit ledger with balance tracking, WhatsApp reminders, PDF export |
| **Full i18n** | EN / HI / OR translation across all 25+ pages and layout |
| **PWA / Offline** | IndexedDB offline queue, Workbox service worker, push notifications, sync engine |
| **AePS receipts** | Per-session AePS receipts with QR verification |
| **Password reset** | OTP-based email reset with 8-char policy enforcement |
| **Audit logging** | Full audit trail for all security and data events |
| **Admin broadcast** | Push + email broadcast to all users from admin panel |

---

## 3. Quick Start

### After importing to Replit

1. **PostgreSQL is auto-provisioned** — `DATABASE_URL` is set automatically.
2. `scripts/post-merge.sh` runs automatically — installs deps + applies DB schema.
3. **Add required secrets** in the Replit Secrets tab (🔒 left sidebar):

   | Secret | Value |
   |--------|-------|
   | `SESSION_SECRET` | Any long random string (e.g. 64 hex chars) |
   | `ADMIN_PASSWORD` | Strong password for the admin account |
   | `OPERATOR_PASSWORD` | Strong password for the operator account |
   | `SMTP_HOST` | Your SMTP server (e.g. `smtp.gmail.com`) |
   | `SMTP_PORT` | `587` (TLS) or `465` (SSL) |
   | `SMTP_USER` | SMTP email address |
   | `SMTP_PASS` | SMTP password or app password |

4. **Run the Seed Database workflow** (manual, one-shot) — creates admin and operator accounts.
5. **Start the project** — API Server + frontend start automatically.
6. Open the preview and log in with `admin` / your `ADMIN_PASSWORD`.

> The Setup Wizard Banner will appear at the top of every page (admin only) if any required secrets are still missing. It lists exactly what is needed.

---

## 4. Workflows

| Workflow | Port | Purpose | Auto-starts |
|----------|------|---------|-------------|
| `API Server` | 8080 | Express API server (main project workflow) | ✅ |
| `artifacts/sahu-csc: web` | 5000 → :80 | Vite frontend (Replit preview) | ✅ |
| `Seed Database` | — | One-shot: creates/resets admin + operator accounts | ❌ Manual |
| `artifacts/api-server: API Server` | 8080 | Platform-injected artifact API (same process) | ⚠️ Platform |
| `artifacts/mockup-sandbox: Component Preview Server` | 8081 | Design canvas sandbox | ⚠️ Platform |

> **Port note:** Port 5000 maps to external port 80 (Replit proxy). API runs on port 8080. Vite's `vite.config.ts` proxies `/api/*` → `http://localhost:8080`.

### Workflow commands (exact)

```bash
# API Server
pnpm install && PORT=8080 pnpm --filter @workspace/api-server run dev

# Frontend
pnpm install && fuser -k 5000/tcp 2>/dev/null; sleep 1; PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run dev

# Seed Database (manual only)
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts
```

---

## 5. Default Login Credentials

| Role | Username | Password source |
|------|----------|----------------|
| Admin | `admin` | `ADMIN_PASSWORD` Replit Secret |
| Operator | `operator` | `OPERATOR_PASSWORD` Replit Secret |

> Passwords are **never hardcoded**. The Seed Database workflow fails immediately with a clear error if either secret is missing. Re-run the workflow after changing a password secret to apply the new password.

---

## 6. Environment Variables & Secrets

All secrets are managed in the Replit Secrets tab (🔒 icon in left sidebar). Never put secrets in code or `.env` files.

### Required

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (auto-provisioned by Replit) |
| `SESSION_SECRET` | Express session signing key — any long random string |
| `ADMIN_PASSWORD` | Default admin account password (used by Seed Database workflow) |
| `OPERATOR_PASSWORD` | Default operator account password (used by Seed Database workflow) |

### Required for email / OTP

| Variable | Purpose |
|----------|---------|
| `SMTP_HOST` | SMTP server hostname (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (`587` for TLS, `465` for SSL) |
| `SMTP_USER` | SMTP username / email address |
| `SMTP_PASS` | SMTP password or app password |
| `SMTP_FROM_EMAIL` | From address in sent emails (defaults to `SMTP_USER`) |

> Without SMTP, OTP login, password reset, and admin email broadcast are disabled. Username + password login still works.

### Optional (recommended for production)

| Variable | Purpose |
|----------|---------|
| `VAPID_PUBLIC_KEY` | Web push notification public key |
| `VAPID_PRIVATE_KEY` | Web push notification private key |
| `VAPID_EMAIL` | VAPID contact email (default: `mailto:admin@sahucsc.in`) |

> Without VAPID keys, the API auto-generates temporary keys on startup. These are lost on restart — push subscriptions won't survive server restarts. Always set real keys for production.

### Setup Wizard Banner severity

| Secret(s) | Banner severity |
|-----------|----------------|
| `SESSION_SECRET`, `SMTP_*`, `ADMIN_PASSWORD`, `OPERATOR_PASSWORD` | 🔴 REQUIRED (red) |
| `VAPID_*` | 🟡 OPTIONAL (yellow) |

---

## 7. Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20, TypeScript 5.9 |
| Frontend | React 19 + Vite 6 + Tailwind CSS v4 + shadcn/ui |
| Theme | Navy `#0b2c60` + Saffron `#f97316` |
| API | Express 5, express-session, helmet, hpp, express-rate-limit |
| Session store | connect-pg-simple (PostgreSQL-backed; survives server restarts) |
| Database | PostgreSQL 16 + Drizzle ORM |
| Validation | Zod (v4), drizzle-zod |
| API contracts | OpenAPI spec → Orval codegen → typed React Query hooks |
| HTTP client | @tanstack/react-query v5 + custom fetch wrapper |
| PWA | vite-plugin-pwa + Workbox (injectManifest mode) |
| Push notifications | web-push (VAPID) |
| Email | nodemailer (SMTP) |
| Logging | Pino (structured JSON) |
| i18n | i18next + react-i18next (EN / HI / OR) |
| PDF / receipts | html2canvas + jsPDF (client-side) |
| Charts | Recharts |
| Build | esbuild (ESM bundle for API) |
| Monorepo | pnpm workspaces |
| Scheduler | node-cron (backup scheduler) |
| DB backup | pg_dump / psql |

---

## 8. Data Store Architecture

The app uses **3 tiers of storage** working together:

### Tier 1 — PostgreSQL (permanent data)

19 tables total: 16 in Drizzle schema + 1 from udhari (2 tables in one file) + 1 from aeps (2 tables in one file) + `session` (auto-created by connect-pg-simple, excluded from schema push).

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `users` | id, username, email, role, active_session_token | role: admin / operator / user |
| `user_sessions` | sessionId, userId, deviceInfo, browser, os, ipAddress, rememberMe, isActive, expiresAt | V2 multi-device sessions |
| `user_preferences` | userId, language, theme, dashboardLayout | Per-user UI preferences |
| `user_notification_preferences` | userId, pushEnabled, emailEnabled, inAppEnabled | Per-user notification settings |
| `session` | sid, sess, expire | Express session store (connect-pg-simple; not in Drizzle schema) |
| `ledger` | date, credit, debit, balance, created_by, receipt_number, receipt_token | Per-user; running balance at insert |
| `receipt_counters` | year (PK), last_count | Atomic sequential counter per fiscal year |
| `aeps_daily` | date, opening_balance, created_by | Unique per (date, created_by) |
| `aeps_transactions` | session_id, amount, type | Linked to aeps_daily session |
| `udhari_customers` | id, name, phone, address, balance, created_by | Per-user; balance auto-recalculated |
| `udhari_entries` | id, customer_id, date, type (gave/got), amount, note, created_by | Individual credit/debit entries |
| `services` | id, name, category, price, active | CSC services catalog |
| `settings` | key, value | Key-value store for business config |
| `notifications` | id, title, message, type, is_read, user_id | In-app notifications (null userId = broadcast) |
| `push_subscriptions` | user_id, endpoint, p256dh, auth | VAPID push subscription storage |
| `audit_logs` | id, action, entity, user_id, ip, details, created_at | Full security audit trail |
| `password_reset_tokens` | token, user_id, expires_at | One-time password reset tokens |
| `email_otps` | id, email, otp_hash, used, expires_at | OTP codes for email-based login |
| `broadcast_logs` | id, title, message, sent_by, sent_at, recipient_count | Admin broadcast history |

Schema applied via: `pnpm --filter @workspace/db run push`
Also runs automatically via `scripts/post-merge.sh` on every import or task merge.

### Tier 2 — IndexedDB (offline / browser)

| Store | Purpose | Cleared when |
|-------|---------|-------------|
| `pending_ledger` | Offline ledger entries queued for sync | After successful sync |
| `cache_store` | Generic KV cache (dashboard data, etc.) | Configurable TTL (default 5 min) |
| `user_session` | Cached auth session for offline login | 24 hours |
| `cached_reports` | Previously generated reports | Configurable TTL |
| `pending_notifications` | Notifications queued while offline | When read |

### Tier 3 — Service Worker Cache (speed / offline)

| Route pattern | Strategy | Cache name | TTL |
|---------------|----------|------------|-----|
| `/api/auth/*` | NetworkOnly | — | Never cached |
| `/api/dashboard` | StaleWhileRevalidate | api-dashboard | 5 min |
| `/api/reports` | StaleWhileRevalidate | api-reports | 10 min |
| `/api/settings` | StaleWhileRevalidate | api-settings | 30 min |
| `/api/profile` | StaleWhileRevalidate | api-profile | 5 min |
| `/api/preferences` | StaleWhileRevalidate | api-preferences | 30 min |
| `/api/ledger` | NetworkFirst | api-ledger | 5 min (8s timeout) |
| `/api/services` | NetworkFirst | api-services | 1 hr (8s timeout) |
| `/api/notifications` | NetworkFirst | api-notifications | 2 min (8s timeout) |
| Images | CacheFirst | image-cache | 30 days |
| Fonts | CacheFirst | font-cache | 1 year |

---

## 9. API Routes Reference

All routes are mounted under `/api/`. Auth middleware: `requireAuth` (session), `requireRole`, `requirePermission`.

### Public (no auth)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/setup-status` | Missing secrets list for Setup Wizard Banner |
| `GET` | `/api/healthz` | DB + VAPID + system health check |
| `POST` | `/api/auth/login` | Username + password login |
| `POST` | `/api/auth/logout` | Session destroy |
| `GET` | `/api/auth/me` | Current session user |
| `POST` | `/api/password-reset/request` | Request OTP email |
| `POST` | `/api/password-reset/verify` | Verify OTP |
| `POST` | `/api/password-reset/reset` | Set new password (with token) |
| `GET` | `/api/receipts/verify/:token` | Public receipt QR verification |

### Auth required — all roles

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/ledger` | List ledger entries (per-user) |
| `POST` | `/api/ledger` | Create ledger entry |
| `PUT` | `/api/ledger/:id` | Update ledger entry |
| `DELETE` | `/api/ledger/:id` | Delete ledger entry |
| `GET` | `/api/aeps/daily` | List AePS daily sessions (per-user) |
| `POST` | `/api/aeps/daily` | Create AePS session |
| `GET` | `/api/aeps/daily/:id/transactions` | List transactions for a session |
| `POST` | `/api/aeps/daily/:id/transactions` | Add transaction to session |
| `GET` | `/api/reports/daily` | Daily report |
| `GET` | `/api/reports/monthly` | Monthly report |
| `GET` | `/api/reports/export` | Excel export |
| `GET` | `/api/services` | Services catalog |
| `GET` | `/api/notifications` | User notifications |
| `PUT` | `/api/notifications/:id/read` | Mark notification read |
| `PUT` | `/api/notifications/read-all` | Mark all read |
| `GET` | `/api/profile` | User profile |
| `PUT` | `/api/profile` | Update profile |
| `PUT` | `/api/profile/password` | Change password |
| `GET` | `/api/preferences` | User preferences |
| `PUT` | `/api/preferences` | Update preferences |
| `GET` | `/api/sessions` | List user's active sessions |
| `DELETE` | `/api/sessions/:id` | Revoke a specific session |
| `DELETE` | `/api/sessions/others` | Revoke all except current |
| `DELETE` | `/api/sessions/all` | Revoke ALL → force logout |
| `GET` | `/api/udhari/customers` | List Udhari customers |
| `POST` | `/api/udhari/customers` | Create customer |
| `PUT` | `/api/udhari/customers/:id` | Update customer |
| `DELETE` | `/api/udhari/customers/:id` | Delete customer |
| `GET` | `/api/udhari/customers/:id/entries` | Customer ledger entries |
| `POST` | `/api/udhari/customers/:id/entries` | Add entry |
| `DELETE` | `/api/udhari/entries/:id` | Delete entry |
| `POST` | `/api/push/subscribe` | Subscribe to push notifications |
| `POST` | `/api/push/unsubscribe` | Unsubscribe from push |
| `GET` | `/api/push/subscriptions` | List user push subscriptions |

### Admin only

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/users` | List all users |
| `POST` | `/api/users` | Create user |
| `PUT` | `/api/users/:id` | Update user |
| `DELETE` | `/api/users/:id` | Delete user |
| `GET` | `/api/audit` | Audit log (filterable) |
| `GET` | `/api/settings` | All settings |
| `PUT` | `/api/settings` | Bulk update settings |
| `GET` | `/api/admin/users-overview` | All users' balance summary |
| `GET` | `/api/admin/users-overview/:userId/ledger` | Single user's ledger |
| `GET` | `/api/admin/aeps-overview` | All users' AePS balances |
| `GET` | `/api/admin/db-stats` | Row counts + last entry per table |
| `GET` | `/api/admin/sessions` | All active sessions across users |
| `DELETE` | `/api/admin/sessions/:id` | Revoke any user session |
| `GET` | `/api/admin/registrations` | Pending registration requests |
| `PUT` | `/api/admin/registrations/:id/approve` | Approve registration |
| `PUT` | `/api/admin/registrations/:id/reject` | Reject registration |
| `GET` | `/api/admin/receipt-export` | Export all receipts (admin) |
| `POST` | `/api/broadcast` | Send push + email to all users |
| `GET` | `/api/backups` | List backup files |
| `POST` | `/api/backups` | Create new backup (pg_dump) |
| `GET` | `/api/backups/:id/download` | Download backup `.sql` file |
| `DELETE` | `/api/backups/:id` | Delete backup file |
| `GET` | `/api/backups/schedule` | Get backup schedule config |
| `POST` | `/api/backups/schedule` | Update backup schedule |
| `POST` | `/api/backups/analyze` | Parse pg_dump COPY blocks |
| `POST` | `/api/backups/selective-import` | Restore selected tables |

---

## 10. Frontend Pages Reference

All pages are fully translated in English / Hindi / Odia.

### Public pages (no login)

| Route | File | Description |
|-------|------|-------------|
| `/login` | `login.tsx` | Mobile: navy header + white card; "Register here" CTA |
| `/register` | `register.tsx` | Registration form with PasswordStrength meter |
| `/register-pending` | `register-pending.tsx` | Shown after registration; waiting for admin approval |
| `/register-closed` | `register-closed.tsx` | Shown when admin has disabled new registrations |
| `/forgot-password` | `forgot-password.tsx` | OTP request form |
| `/reset-password` | `reset-password.tsx` | New password entry (with OTP token) |
| `/receipts/verify/:token` | `receipts-verify.tsx` | Public QR receipt verification (no auth) |
| `/aeps/verify/:token` | `aeps-receipt-verify.tsx` | Public AePS receipt QR verification |
| `/udhari/verify/:token` | `udhari-receipt-verify.tsx` | Public Udhari receipt QR verification |
| `/offline` | `offline.tsx` | Offline fallback page |
| `*` | `not-found.tsx` | 404 page |

### Authenticated pages

| Route | File | Roles | Description |
|-------|------|-------|-------------|
| `/dashboard` | `dashboard.tsx` | All | Real-time stats, offline cache fallback, Udhari summary card |
| `/ledger` | `ledger.tsx` | All | Transaction list with offline queue support |
| `/aeps` | `aeps.tsx` | Operator, Admin | AePS cash session management |
| `/udhari` | `udhari.tsx` | Operator, Admin | Customer credit list: search, sort, To Collect / To Pay banner |
| `/udhari/:id` | `udhari-customer.tsx` | Operator, Admin | Per-customer ledger, WhatsApp reminder, PDF export |
| `/services` | `services.tsx` | All | CSC services catalog |
| `/reports` | `reports.tsx` | All | Command Center design: horizontal nav, navy KPI strip, 2-col charts |
| `/notifications` | `notifications.tsx` | All | In-app notifications |
| `/profile` | `profile.tsx` | All | Unified Profile + Settings (v2.3): Desktop sticky side-nav, Mobile iOS drill-in |
| `/preferences` | `preferences.tsx` | All | Standalone Preferences: language, theme, dashboard layout |
| `/sessions` | `sessions.tsx` | All | Active sessions management |
| `/pwa-status` | `pwa-status.tsx` | All | App & Offline Status: network, sync queue, storage, push |
| `/download-app` | `download-app.tsx` | All | PWA install guide for Android / iOS / Desktop / Web |
| `/server-health` | `server-health.tsx` | Admin | Live API / DB / VAPID health + DB table stats with trend column |
| `/users` | `users.tsx` | Admin | User management |
| `/users-overview` | `users-overview.tsx` | Admin | All users' ledger/balance overview |
| `/audit-logs` | `audit-logs.tsx` | Admin | Full audit trail |
| `/backups` | `backups.tsx` | Admin | Backup & Restore v3.1: 2-col grid, schedule, selective import |
| `/broadcast` | `broadcast.tsx` | Admin | Push + email broadcast center |
| `/receipt-export` | `receipt-export.tsx` | Admin | Export all receipts |
| `/about` | `about.tsx` | All | Docs, system requirements, changelog |
| `/settings` | `settings.tsx` | — | Redirects to `/profile` (deprecated) |

---

## 11. Components Reference

| Component | File | Description |
|-----------|------|-------------|
| `Layout` | `layout.tsx` | App shell: sidebar, mobile nav, banners, idle timeout dialog |
| `SetupWizardBanner` | `setup-wizard-banner.tsx` | Admin-only first-run banner; fetches `/api/setup-status`; red = critical, yellow = optional; session-dismissed |
| `SyncStatusBar` | `sync-status-bar.tsx` | 🟢/🟡/🔴 global online/sync indicator + pending count |
| `PwaInstallBanner` | `pwa-install-banner.tsx` | PWA install prompt banner |
| `AppLogo` / `LoginLogo` | `app-logo.tsx` | Brand logos; both reference `public/sahu-logo.png` |
| `ReceiptModal` | `receipt-modal.tsx` | Receipt display: QR code, Print, PDF (html2canvas+jsPDF), Web Share API |
| `AepsReceiptModal` | `aeps-receipt-modal.tsx` | AePS session receipt modal with QR verification |
| `UdhariReceiptModal` | `udhari-receipt-modal.tsx` | Udhari customer statement modal |
| `LanguageSwitcher` | `language-switcher.tsx` | EN / हि / ଓ toggle in sidebar footer |
| `AutocompleteInput` | `autocomplete-input.tsx` | Searchable input with dropdown suggestions |
| `skeletons.tsx` | `skeletons.tsx` | Content-shaped shimmer skeletons for every page/section (dashboard, ledger, AePS, reports, notifications, udhari, services, preferences, sessions, audit logs, admin tabs, backups, profile) — replaces all spinner-based loaders app-wide |
| `SplashScreen` | `splash-screen.tsx` | App loading splash screen |
| `ThemeProvider` | `theme-provider.tsx` | Dark/light theme context |
| `ui/` | `ui/*.tsx` | shadcn/ui primitives (button, card, dialog, input, etc.) |

---

## 12. Hooks Reference

| Hook | File | Description |
|------|------|-------------|
| `useAuth` | `use-auth.tsx` | Auth context + offline session cache from IndexedDB |
| `usePerformanceTier` | `use-performance-tier.tsx` | Device performance tier (`high`/`medium`/`low`), target fps, `richAnimations` flag, `scaleDuration()` helper — set via `PerformanceProvider` in `App.tsx` |
| `useNetworkStatus` | `use-network-status.ts` | Online / offline / slow detection + 30s latency probe |
| `usePwa` | `use-pwa.ts` | Install prompt, badge, periodic sync, share, wake lock |
| `useSync` | `use-sync.ts` | Offline queue state and manual sync trigger |
| `usePushNotifications` | `use-push-notifications.ts` | Push subscribe / unsubscribe |
| `useIdleTimer` | `use-idle-timer.ts` | Auto-logout after 30 min; 2-min warning dialog |
| `useNotifications` | `use-notifications.ts` | Notification list fetch + mark-read |
| `usePendingCount` | `use-pending-count.ts` | Count of unread notifications + offline queue items |
| `useRegistrationStatus` | `use-registration-status.ts` | Checks if registration is open/closed |
| `useDevice` | `use-device.tsx` | Device type / screen size detection |
| `useWakeLock` | `use-wake-lock.ts` | Screen wake lock (prevent sleep during AePS session) |
| `useFileHandler` | `use-file-handler.ts` | File input and drag-and-drop handling |
| `useMobile` | `use-mobile.tsx` | Mobile breakpoint detection |
| `useToast` | `use-toast.ts` | Toast notification trigger |

---

## 13. Directory Structure

```
sahu-csc/                          ← monorepo root
├── artifacts/
│   ├── api-server/
│   │   └── src/
│   │       ├── routes/            ← 24 Express route files
│   │       │   ├── index.ts       ← mounts all routers
│   │       │   ├── auth.ts
│   │       │   ├── ledger.ts
│   │       │   ├── aeps.ts
│   │       │   ├── reports.ts
│   │       │   ├── services.ts
│   │       │   ├── users.ts
│   │       │   ├── admin.ts
│   │       │   ├── admin-registration.ts
│   │       │   ├── admin-sessions.ts
│   │       │   ├── admin-receipt-export.ts
│   │       │   ├── sessions.ts
│   │       │   ├── notifications.ts
│   │       │   ├── audit.ts
│   │       │   ├── settings.ts
│   │       │   ├── profile.ts
│   │       │   ├── preferences.ts
│   │       │   ├── push.ts
│   │       │   ├── password-reset.ts
│   │       │   ├── udhari.ts
│   │       │   ├── receipts.ts
│   │       │   ├── broadcast.ts
│   │       │   ├── health.ts
│   │       │   └── setup-status.ts
│   │       ├── lib/
│   │       │   ├── auth.ts        ← requireAuth / requireRole / requirePermission
│   │       │   ├── logger.ts      ← Pino structured logger
│   │       │   ├── mailer.ts      ← nodemailer: sendOtpEmail, sendApprovalEmail
│   │       │   ├── notify.ts      ← createNotification helper
│   │       │   ├── push.ts        ← sendPushToUser, sendPushToAll
│   │       │   ├── vapid.ts       ← VAPID key auto-generation on startup
│   │       │   └── otp-cleanup.ts ← Hourly job: delete expired OTP rows
│   │       └── scripts/
│   │           ├── seed.ts        ← DB seeder (reads ADMIN_PASSWORD + OPERATOR_PASSWORD)
│   │           ├── backup.ts      ← pg_dump backup to /backups/
│   │           └── restore.ts     ← psql restore from backup file
│   │
│   └── sahu-csc/
│       ├── public/
│       │   ├── sahu-logo.png      ← Primary brand logo
│       │   ├── pwa-*.png          ← PWA icons
│       │   ├── apple-touch-icon.png
│       │   └── .well-known/
│       │       └── assetlinks.json ← Digital Asset Links for Android TWA
│       └── src/
│           ├── pages/             ← 30+ page components (see §10)
│           ├── components/        ← Shared UI components (see §11)
│           ├── hooks/             ← Custom hooks (see §12)
│           ├── locales/
│           │   ├── en/translation.json  ← English (~860 keys)
│           │   ├── hi/translation.json  ← Hindi
│           │   └── or/translation.json  ← Odia
│           └── lib/
│               ├── i18n.ts        ← i18next init; reads localStorage "sahu-lang"
│               ├── offline-db.ts  ← IndexedDB v2 wrapper (5 stores)
│               ├── sync-engine.ts ← Offline queue processor; auto-syncs on online
│               ├── pwa-badge.ts   ← App badge updater
│               └── utils.ts
│
├── lib/
│   ├── db/
│   │   ├── src/schema/            ← Drizzle schema (16 files → 18 tables)
│   │   └── drizzle.config.ts      ← tablesFilter: ["!session"] (excludes session table)
│   ├── api-spec/
│   │   └── openapi.yaml           ← OpenAPI spec (source of truth)
│   └── api-client-react/
│       └── src/
│           ├── generated/         ← DO NOT EDIT — auto-generated by Orval
│           ├── custom-fetch.ts    ← Base fetch wrapper
│           └── index.ts
│
├── infrastructure/
│   ├── pwa/manifest.json          ← Full standalone PWA manifest
│   └── twa/twa-config.json        ← Android TWA Bubblewrap config
│
└── scripts/
    ├── post-merge.sh              ← Auto-runs on import: pnpm install + drizzle push
    └── start.sh                   ← Starts API (8080) + frontend (5000)
```

---

## 14. Authentication & Security

### Session system

- **PostgreSQL session store** — `connect-pg-simple` persists sessions in the `session` table. Sessions survive server restarts.
- **V2 multi-device tracking** — every login creates a row in `user_sessions` (device info, IP, browser, OS, expiry). Displayed in Profile → Sessions.
- **Session durations** — Standard: 8 hours. Remember Me: 30 days.
- **Session validation** — `requireAuth` checks `user_sessions.sessionId` first, then falls back to legacy `activeSessionToken` for backward compatibility.

### Account security

| Feature | Detail |
|---------|--------|
| Login lockout | 5 failed attempts → locked 15 min (auto-unlocks) |
| Idle timeout | Auto-logout after 30 min inactivity; 2-min warning dialog |
| Password policy | Min 8 chars, uppercase, lowercase, number |
| OTP reset | Email OTP for password reset; tokens expire and are single-use |
| Rate limiting | express-rate-limit on all auth endpoints |
| Security headers | helmet (CSP, HSTS, XSS protection, etc.) |

### Session endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sessions` | List all active sessions |
| `DELETE` | `/api/sessions/:id` | Revoke one session |
| `DELETE` | `/api/sessions/others` | Revoke all except current |
| `DELETE` | `/api/sessions/all` | Revoke ALL → force logout |

### Audit log events

| Action | Trigger |
|--------|---------|
| `login.success` / `login.failed_*` | All login attempts |
| `logout` | User logout |
| `session.revoke` / `.revoke_others` / `.revoke_all` | Session revocations |
| `user.create` / `.update` / `.role_change` / `.delete` | Admin user management |
| `password.reset` | Successful OTP password reset |
| `udhari.customer.create` / `.update` / `.delete` | Udhari customer changes |
| `udhari.entry.create` / `.delete` | Udhari entry changes |

---

## 15. Role-Based Access Control

| Role | Permissions |
|------|------------|
| `admin` | `["*"]` — all permissions including admin oversight |
| `operator` | ledger, aeps, reports, udhari, services, profile, notifications |
| `user` | ledger:view, reports:view, services:view, profile:view, notifications:view |

RBAC is enforced at the route level via `requirePermission(...)` middleware — not just in controller logic.

### Per-user data isolation

All data (ledger, balance, AePS, reports, Udhari) is filtered by `userId` at the query level. Admin oversight uses **separate** `/api/admin/*` endpoints and never mixes with the admin's own data.

| Admin endpoint | Description |
|----------------|-------------|
| `GET /api/admin/users-overview` | Balance summary for all users |
| `GET /api/admin/users-overview/:userId/ledger` | Single user's full ledger |
| `GET /api/admin/aeps-overview` | All users' AePS balances |
| `GET /api/admin/db-stats` | Row counts + last-entry timestamps per table |

---

## 16. Setup Wizard Banner

Shown at the top of every admin page when secrets are missing. Session-dismissed (won't reappear until next login once dismissed).

### How it works

1. `SetupWizardBanner` component (mounted in `layout.tsx`, admin-only) fetches `GET /api/setup-status` on mount
2. If `configured: false`, the banner renders
3. **Red banner** — critical secrets missing (SESSION_SECRET, SMTP, ADMIN_PASSWORD, OPERATOR_PASSWORD)
4. **Yellow banner** — only optional secrets missing (VAPID)
5. Expandable section lists each missing secret with label, severity badge, and description
6. "Open Secrets Docs" button links to Replit documentation
7. Dismissed via `sessionStorage` key `sahu-setup-banner-dismissed-v1`

### `/api/setup-status` response

```json
{
  "configured": false,
  "missing": [
    {
      "key": "SMTP",
      "label": "Email / SMTP",
      "description": "Required for OTP login and email notifications. Missing: SMTP_HOST, SMTP_USER, SMTP_PASS."
    },
    {
      "key": "VAPID",
      "label": "Push Notifications (VAPID)",
      "description": "Optional but recommended. Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL."
    }
  ]
}
```

Secrets checked (in order):
1. `SESSION_SECRET` — required
2. `SMTP_HOST` + `SMTP_USER` + `SMTP_PASS` — required for email
3. `ADMIN_PASSWORD` — required for Seed Database workflow
4. `OPERATOR_PASSWORD` — required for Seed Database workflow
5. `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` + persistent flag — optional

---

## 17. PWA & Offline Features

### Service Worker

Built with `vite-plugin-pwa` in **injectManifest** mode (custom `sw.ts`). Workbox handles caching strategies (see §8 Tier 3).

### Offline capabilities

| Feature | How |
|---------|-----|
| Offline ledger entry | Saved to IndexedDB `pending_ledger`; auto-synced on reconnect |
| Offline auth | Session cached in IndexedDB `user_session` for 24 hours |
| Offline dashboard | Reads from IndexedDB `cache_store` |
| Offline reports | Reads from IndexedDB `cached_reports` |
| Sync status | 🟢/🟡/🔴 `SyncStatusBar` component + pending count badge |
| Push notifications | VAPID via web-push; subscribe/unsubscribe in Profile |

### Network detection

`useNetworkStatus` hook probes every 30 seconds:
- **Online** 🟢 — fetch succeeds within threshold
- **Slow** 🟡 — fetch succeeds but latency is high
- **Offline** 🔴 — fetch fails

### App shortcuts (installed PWA)

- Dashboard
- New Ledger Entry
- AePS Cash
- Reports

### App & Offline Status page (`/pwa-status`)

Live view of: network state, sync queue length, storage usage, push notification subscription status.

---

## 18. Internationalisation (i18n)

| Code | Language | Script |
|------|----------|--------|
| `en` | English | Latin |
| `hi` | Hindi | Devanagari |
| `or` | Odia | Odia |

### Implementation

- `i18next` + `react-i18next`
- Single flat `translation.json` per locale (~860 keys each) — do **not** split into namespace files
- `i18n.ts` reads `localStorage["sahu-lang"]`, falls back to `"en"`
- Language preference saved in both `localStorage` and `user_preferences` DB table
- Language switcher: EN / हि / ଓ toggle in sidebar footer
- All 30+ pages and `layout.tsx` are fully translated

### Key rule

Translated string constants (arrays, config objects) must be **inside** the component function after `const { t } = useTranslation()` — never at module scope (they become stale and don't re-render on language change).

---

## 19. Backup & Restore

### Backup system (v3.1)

| Feature | Detail |
|---------|--------|
| Engine | `pg_dump` — creates portable `.sql` file |
| Storage | `/backups/` directory on server |
| Download | `GET /api/backups/:id/download` streams file with `Content-Disposition: attachment` |
| Schedule | `node-cron` scheduler; daily/weekly/custom cron; configurable time + retention count |
| UI | 2-column "Minimal Clean" layout: backup history left, schedule + import right |

### Restore / Import

| Feature | Detail |
|---------|--------|
| Full restore | Upload `.sql` file → `psql` replays all statements |
| Selective import | `POST /api/backups/analyze` parses COPY blocks from pg_dump; `POST /api/backups/selective-import` replays only chosen tables with FK checks disabled |
| UI | Dashed dropzone, table-picker checkboxes, progress feedback |

### Schedule configuration

```json
{
  "enabled": true,
  "frequency": "daily",
  "time": "02:00",
  "retention": 7
}
```

`GET /api/backups/schedule` — read config
`POST /api/backups/schedule` — write config

---

## 20. Android TWA Setup

Trusted Web Activity (TWA) packages the Replit-deployed PWA as a native Android APK for Google Play.

### Steps

1. Install Bubblewrap CLI:
   ```bash
   npm install -g @bubblewrap/cli
   ```
2. Initialise from manifest:
   ```bash
   bubblewrap init --manifest https://<your-domain>/manifest.webmanifest
   ```
3. Generate keystore and get SHA-256 fingerprint:
   ```bash
   keytool -list -v -keystore release.keystore
   ```
4. Update Digital Asset Links file with your fingerprint:
   ```
   artifacts/sahu-csc/public/.well-known/assetlinks.json
   ```
5. Deploy to Replit so `assetlinks.json` is publicly accessible.
6. Build APK:
   ```bash
   bubblewrap build
   ```
7. Upload APK to Google Play Console.

Full config: `infrastructure/twa/twa-config.json`

---

## 21. Architecture Decisions

These decisions are non-obvious and must be respected in future changes.

| Decision | Rule | Why |
|----------|------|-----|
| **No `willChange: transform` on page transitions** | Page-transition `motion.div` must NOT have `willChange: transform` | Creates a new CSS containing block for `position: fixed` — breaks bottom nav viewport pinning |
| **Contract-first API** | OpenAPI spec → Orval codegen. Never edit `lib/api-client-react/src/generated/` directly | Single source of truth; type safety guaranteed at codegen time |
| **Session-based auth, no JWT** | express-session + bcrypt | Simpler for single-center CSC; easier revocation; no token expiry edge cases |
| **PostgreSQL session store** | `connect-pg-simple` in `external[]` in `build.mjs` | esbuild bundling breaks its internal `table.sql` path lookup — sessions silently fail if bundled |
| **V2 multi-device sessions** | `user_sessions` table; `requireAuth` checks sessionId first, falls back to `activeSessionToken` | Supports concurrent devices; backward compatible with V1 tokens |
| **RBAC at route level** | `requirePermission` applied in route definitions | Defense in depth; access check can't be skipped by controller bugs |
| **Per-user data isolation** | `getUserFilter()` always appends `userId` to queries | Admin oversight uses separate `/api/admin/*` endpoints — never mixed |
| **Money as `numeric` string** | Drizzle `numeric` returns string from DB — always `parseFloat()` before returning from routes | Avoids floating-point precision errors |
| **Running balance at insert** | Computed from `SUM(credit) - SUM(debit)` of all prior entries for that user | Immutable historical record; recomputed correctly on delete |
| **Receipt number is atomic** | `receipt_counters` uses `INSERT … ON CONFLICT DO UPDATE SET last_count = last_count + 1 RETURNING last_count` | Race-condition-safe; year derived from transaction `date`, not wall clock |
| **Receipt token is UUID** | `receipt_token = uuid()` | Prevents enumeration; QR encodes `https://domain/receipts/verify/<uuid>` |
| **Receipt PDF is client-side** | `html2canvas` + `jsPDF` | Backend stays stateless; no file storage needed |
| **Auth loading guard uses `\|\|`** | `isLoading = liveLoading \|\| !offlineChecked` | Using `&&` causes auto-logout on refresh — offline check completes before live fetch |
| **Login sets auth cache via `setQueryData`** | After login, call `queryClient.setQueryData(["auth/me"], userData)` from login response body | No separate `/api/auth/me` refetch — race condition through Replit proxy |
| **Toast system** | Custom Framer Motion renderer (`toaster.tsx`) — replaces Radix UI toast | Variants: default (navy), success, destructive, warning. Shorthands: `toast.success()`, `toast.error()`. Mobile: top-center; Desktop: bottom-right |
| **Udhari balance server-side** | `recalcBalance(customerId)` runs `SUM` after every entry change | Never trust client-supplied balance |
| **Udhari balance sign** | `balance > 0` = customer owes you (To Collect). `balance < 0` = you owe customer (To Pay) | Consistent sign convention for display logic |
| **Notification `null` userId** | `userId = null` row is visible in every user's notification feed | Always pass explicit `userId` for user-specific events; use `null` only for genuine broadcasts |
| **`notifyNewRegistration` fans out** | Queries admin IDs → creates one notification per admin | Call it only once per registration event |
| **React Query cache cleared on logout** | `queryClient.clear()` in `handleLogout` | Switching accounts never shows stale data from previous user |
| **Always CSS for responsive layout** | Use `sm:hidden` / `hidden sm:block` Tailwind classes | `useIsMobile()` has render-before-measure delay causing layout flicker |
| **Mobile FAB clear bottom nav** | Use `bottom-20` (80px), not `bottom-6` | Bottom nav is ~64px tall |
| **Translated constants inside component** | Place arrays/config objects using `t()` inside component function, after `useTranslation()` | Module-scope constants don't re-render on language change |
| **`parseDevice` called once per request** | Before all failure/success branches in `auth.ts` login handler | esbuild treats duplicate `const` declarations as a build error |
| **`drizzle.config.ts` tablesFilter** | `tablesFilter: ["!session"]` | Excludes connect-pg-simple's `session` table from `drizzle push` — prevents it from being truncated |
| **`ADMIN_PASSWORD` / `OPERATOR_PASSWORD` from secrets** | `seed.ts` hard-fails if either secret is missing | Passwords are never printed to logs or hardcoded |

---

## 22. Common Commands

```bash
# ── Development ──────────────────────────────────────────────
pnpm --filter @workspace/api-server run dev      # API server (port 8080)
pnpm --filter @workspace/sahu-csc run dev         # Frontend (port 5000)

# ── Database ──────────────────────────────────────────────────
pnpm --filter @workspace/db run push              # Push Drizzle schema to DB
pnpm --filter @workspace/api-server run seed      # Seed DB (requires ADMIN_PASSWORD + OPERATOR_PASSWORD)

# ── API rebuild (required after route changes) ────────────────
cd artifacts/api-server && pnpm run build

# ── API codegen (after editing openapi.yaml) ─────────────────
pnpm --filter @workspace/api-spec run codegen     # Regenerate React Query hooks + Zod schemas

# ── Type checking ─────────────────────────────────────────────
pnpm run typecheck:libs                           # Build lib declarations first
pnpm run typecheck                                # Full typecheck all packages

# ── Build all ─────────────────────────────────────────────────
pnpm run build                                    # Typecheck + build all packages

# ── Database backup / restore (manual) ───────────────────────
pnpm --filter @workspace/api-server exec tsx src/scripts/backup.ts
pnpm --filter @workspace/api-server exec tsx src/scripts/restore.ts <file>

# ── Restart workflows after API rebuild ──────────────────────
# Use the Replit workflow panel or:
# Restart "artifacts/api-server: API Server"
```

---

*Documentation for SAHU CSC v3.1.0 — Built for Odisha / India rural Common Service Centers*
