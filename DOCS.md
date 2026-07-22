# SAHU CSC — Complete Platform Documentation
**Version 4.9.0** — last updated 2026-07-22

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

### v4.9.0 — Platform Optimization & Setup Hardening (2026-07-16)

- **CORS auto-detects Replit domain** — `app.ts` now reads `REPLIT_DEV_DOMAIN` and `REPLIT_DOMAINS` at startup and adds them automatically; `CORS_ORIGIN` no longer needs manual updating on each re-import
- **SMTP secret renamed** — `SMTP_PASSWORD` is the new canonical secret name; `SMTP_PASS` still accepted as a backwards-compatible alias in `transport.ts`
- **DB connection pool capped** — `DB_POOL_MAX=5` added as shared env var (was defaulting to 20, which could exhaust Replit's PostgreSQL connection limit under load)
- **Admin polling intervals halved** — admin sessions, pending users, and appeal users now poll every 60 s (was 30 s) with `refetchOnWindowFocus` as primary freshness trigger
- **Session expire index** — `CREATE INDEX session_expire_idx ON session (expire)` applied; hourly session pruning is now an index scan instead of a full table scan
- **Receipt export 90-day cap** — bulk export endpoints now reject date ranges exceeding 90 days, preventing out-of-memory ZIP builds
- **PWA precache −985 KB** — `jspdf`, `html2canvas`, and `vendor-charts` excluded from SW precache manifest (71 entries / 2.4 MB, down from 74 entries / 3.3 MB); these chunks are still runtime-cached on first use
- **Ledger backfill gated** — `index.ts` writes a `ledgerBalanceBackfillDone` flag to the `settings` table after the first successful run; subsequent boots skip the UPDATE entirely
- **Fresh-import setup** — confirmed that `pnpm install` is always required after importing from GitHub (esbuild and other build tools are not committed); documented in Getting Started

### v4.8.0 — 2FA Security Upgrade: QR Codes, Replay Protection & Standard TOTP (2026-07-16)

Full security audit and upgrade of the two-factor authentication system. No DB schema changes.

- **TOTP period 120 s → 30 s** — RFC 6238 standard; Google Authenticator, Authy, Microsoft Authenticator all use 30 s regardless of the `period` param, so the old 120-second codes were never valid in those apps
- **QR code export** — `setup-totp` and `setup-totp-pending` now return `{ qrCodeDataUrl, otpauthUri, secret }` so users can scan with any TOTP app
- **New** `GET /auth/2fa/totp-qr` — re-fetch QR + secret for enrolled users (e.g. app transfer)
- **New** `POST /auth/2fa/regenerate-backup-codes` — invalidate old backup codes and generate a fresh set of 8 (requires current password)
- **TOTP replay protection** — in-memory token log per user; a code already used within its 30-second window is rejected
- **Timing-safe backup-code comparison** — `crypto.timingSafeEqual` replaces `===` for hash checks
- **Clock drift tolerance** — `window: 1` on all TOTP verify calls (±30 s)
- Profile 2FA section redesigned: QR image, copy/reveal secret, backup-code health bar, "Generate new codes" button
- Mid-login TOTP enrollment shows QR inline so users can scan before entering the confirmation code

### v4.7.1 — Security Score 100 & Login Code Display Fix (2026-07-16)

- TOTP security score corrected: 92 → **100/100** when authenticator app is active
- **Security fix**: removed `TotpLiveCode` from the login verification page — showing the rotating code on the same screen as the code-entry field defeated the purpose of 2FA; replaced with a hint card directing the user to their trusted device's profile page

### v4.7.0 — Built-in Authenticator: No QR Code, No External App (2026-07-16)

Two-factor authentication no longer requires an external authenticator app. The app now generates and displays the rotating 6-digit code directly.

- `GET /auth/2fa/totp-code` (new, authenticated) — returns `{ code, remaining, step }` for the logged-in user's current TOTP window
- `GET /auth/2fa/totp-code-pending` (new) — same for mid-login `pendingUserId` state
- `setup-totp` and `setup-totp-pending` no longer generate QR codes — auto-enroll and return `{ enrolled: true }`
- TOTP period: 120 s (extended from 30 s for easier entry)
- New `TotpLiveCode` React component: big monospace digits + SVG countdown ring, auto-refetches on window expiry
- Profile and login TOTP flows updated — QR scan replaced by live code card; enabling authenticator is now a single-step confirm

### v4.6.0 — Login-Time 2FA Method Choice (2026-07-15)

- Post-login verification screen shows a method picker (Email OTP / Authenticator App) at login time
- New: `POST /auth/2fa/switch-method` — switch method or resend OTP mid-login
- New: `POST /auth/2fa/setup-totp-pending` — inline TOTP enrollment during login (no full session required)
- Email OTP resend cooldown: 120 s; backup codes shown once on-screen before session is applied

### Fixes & Refactors — July 18, 2026

**PermissionCard Continue/Skip single-tap fix**

- **Root cause**: On Android, all three permission requests resolve near-instantly when already denied by OS, leaving step 2's Continue button enabled immediately — users had to press Continue twice, which felt like "nothing happened"
- **Fix**: `handleContinueStep1` auto-calls `finish()` after all permissions are attempted; step 2 now shows a non-interactive "Setting up…" spinner instead of a second Continue button
- One tap completes the full onboarding flow; Skip unchanged; no backend changes

**Register page split — `pages/register.tsx` 729 → 89 lines**

| New file | Role |
|---|---|
| `components/auth/registerTypes.ts` | Schema, types, `maskEmail`, `useTwoFaDisabled`; re-exports shared constants |
| `components/auth/PasswordStrength.tsx` | Animated strength bar + per-rule checklist |
| `components/auth/RegisterPersonalForm.tsx` | username + fullName + email + mobile fields |
| `components/auth/RegisterCredentialsForm.tsx` | password + confirm + error + submit button |
| `components/auth/RegisterStepIndicator.tsx` | OTP step 2 header (shield icon + masked email) |
| `components/auth/RegisterOtpStep.tsx` | OTP digit grid + submit + resend countdown ring |
| `components/auth/RegisterMobileLayout.tsx` | Navy header + slide-up white card (mobile) |
| `components/auth/RegisterDesktopLayout.tsx` | Hero panel + form card split (desktop) |
| `components/auth/RegisterForm.tsx` | All form state, timers, and API calls |

---

### v4.5.1 — File Manager Permission: Real Granted/Denied Signal (2026-07-15)

Follow-up fix — File Manager permission no longer always resolves to "granted". No API contract changes.

- Chrome/Edge/Opera: `requestFileManager()` now uses `showOpenFilePicker()` — a chosen file resolves "granted", a cancelled/dismissed picker throws `AbortError` → mapped to "denied"
- Safari/Firefox/other browsers without the File System Access API: unchanged hidden `<input type="file">` fallback, any interaction still counts as granted (no reliable cancel event exists there)
- 10-second safety-net timeout unchanged on both paths

### v4.5.0 — Permission Card Redesign: File Manager Access & Continue Fix (2026-07-15)

Redesigned the first-login permission flow and fixed a real bug in it. No API contract changes.

- Replaced `FirstLoginOverlay.tsx` (Notifications + Files acknowledgement) with a new `PermissionCard` component system (`PermissionCard.tsx`, `PermissionRow.tsx`, `usePermissions.ts`, `index.ts`) — two-step modal flow, per-row live status
- Added a third permission: File Manager (photo/file access) — no browser Permissions API exists for this, so "Allow" opens a hidden native file input; any interaction (pick or cancel) counts as granted
- Fixed a bug where the Continue button could stay disabled forever if a permission prompt (most notably `navigator.geolocation.getCurrentPosition`) never invoked either callback — added a 10-second `Promise.race` safety-net timeout to every permission request (location, notifications, file picker)
- Backend unchanged — still `PATCH /users/first-login-completed`; per-permission results stay client-side in `localStorage` per the design spec

### v4.4.0 — First-Login Permissions, 2FA & Single-Device Enforcement (2026-07-15)

Audited against a written feature spec — first-login permissions, 2FA (TOTP + email OTP), and single-device login enforcement were all already implemented from an earlier session; found and fixed one real gap (`security_logs` table existed but nothing wrote to it).

### v4.3.2 — Optimization Audit & Measurements (2026-07-14)

Follow-up to the v4.3.1 performance pass — measured numbers instead of estimates, plus closes out the remaining audit items.

- Load test at 50 connections/20s: `/api/dashboard` p50=143ms, `/api/admin/users-overview` p50=150ms, `/healthz` p50=45ms — 0 errors
- Added missing DB indexes on `users.mobile` and `services.category` (direct query filters with no index before)
- Audited all other upload paths — no other raw/uncompressed image storage found beyond the avatar path already fixed
- Confirmed static asset caching is already CDN-ready (immutable long-cache on hashed assets, no-store on the HTML shell)
- Investigated a Postgres read replica — not implemented, requires provisioning a second DB endpoint (infra decision, not a code change)

### v4.3.1 — Performance Pass: Bundle Size & Avatar Compression (2026-07-14)

Follow-up optimization pass after a codebase performance review. No API contract changes.

- Backend bundle (`dist/index.mjs`) cut from 6.5MB to 2.6MB by externalizing 14 pure-JS dependencies instead of bundling them
- Profile avatars now resized to 512×512 and re-encoded as WebP server-side via `sharp` before storage, instead of storing the raw upload as-is

### v4.3.1 — Config & Maintenance Fixes (2026-07-14)

Small config/maintenance patch, three items from a maintenance audit. No user-visible features; no API contract changes.

- `/health` version reported dynamically from `package.json` (was hardcoded and stale)
- Removed hardcoded personal email fallback for VAPID contact; falls back to a generic placeholder, real value comes from `VAPID_EMAIL`
- `geoip-lite` MaxMind database now refreshed weekly via a scheduled job (gated on optional `MAXMIND_LICENSE_KEY`) and hot-reloaded without a restart

### v4.3.0 — Security Hardening, Input Validation & Database Integrity (2026-07-14)

Systematic bug-fix release across six audited areas. No new user-visible features; no API contract changes.

- **Data integrity**: `POST /ledger` fully transactional; AEPS ownership null-check fixed; worker jobs throw on failure
- **Security**: `/api/geo` rate-limited (30 req/min); CORS startup guard; loopback bypass uses TCP socket address; VAPID rotation no longer writes to `process.env`
- **Logic**: Ledger summary periods use IST calendar dates; large-transaction threshold from settings table (configurable); session maxAge aligned to 8 h
- **Streaming**: Receipt export ZIP handles mid-stream errors and client disconnects correctly
- **Input validation**: Zod schemas on all admin receipt-export routes; receipt tokens validated as UUID or JWT before DB query
- **Frontend**: Ledger/Udhari/Register forms reset correctly; `ShareTargetHandler` dep array fixed
- **Schema**: 5 missing foreign keys added (ledger, audit_logs, aeps_daily, broadcast_logs, password_reset_tokens → users)

### v3.5.4 — Ledger Page Modularization (2026-07-11)

`pages/ledger.tsx` split from 1652 lines into a thin orchestrator (~600 lines) plus `hooks/useLedger.ts` (React Query data hooks/mutations, service-color map, date grouping, derived customer/receipt lists) and three new components — `components/ledger/LedgerFilters.tsx`, `components/ledger/LedgerEntryForm.tsx`, `components/ledger/LedgerTable.tsx`. No routes, API calls, `data-testid`s, or visual output changed — pure code-organization refactor. Verified via `tsc --noEmit` (clean on all three workspace projects) and an authenticated curl smoke test covering create/read/balance/delete.

### v3.5.3 — Optimization Round 2: Query Caching, Load Testing & Safe Rate-Limiter Bypass (2026-07-10)

Process-local 5s TTL query cache (`lib/query-cache.ts`) added in front of the heaviest read aggregates — `GET /api/dashboard`, `GET /api/admin/users-overview`, `GET /api/reports/daily`, `GET /api/reports/monthly` — invalidated immediately on any ledger create/update/delete. Added a lightweight APM surrogate: requests over `SLOW_REQUEST_MS` (default 500ms) now log at `warn` with a `slowRequest` flag. Added a real load-testing script (`pnpm --filter @workspace/api-server run loadtest`, autocannon-based) against `/api/dashboard`, `/api/admin/users-overview`, `/healthz`; measured 20 concurrent connections for 8s with 0 errors: dashboard p50 47ms/p95 272ms, admin overview p50 46ms/p95 251ms, healthz p50 16ms/p95 32ms. The general rate limiter now skips loopback IPs so the load test can run, but only when `NODE_ENV !== "production"` — the bypass code path does not exist at all in production, since `req.ip` under `trust proxy` is otherwise attacker-controllable. CDN and read-replica work were explicitly **not** done — they're infrastructure additions outside app code and are tracked as follow-ups rather than claimed as complete.

### v3.5.0 — Backend File Split & Modularisation (2026-07-10)

All backend source files over ~300 lines split into focused sub-modules using the barrel pattern: `routes/auth/` (otp + forgot-password + reset-password), `routes/aeps/` (sessions + transactions), `routes/udhari/` (customers + entries), `lib/monthly-export/` (pdf + zip + email + scheduler). `/dashboard` handler extracted from `reports.ts` → `routes/dashboard.ts`. Appeals routes extracted from `admin-registration.ts` → `routes/admin-appeals.ts`. Zero import-site changes — barrel re-exports preserve all existing call sites.

### v3.4.0 — Receipt Export Layout Refactor & TypeScript Hardening (2026-07-10)

| Change | Description |
|--------|-------------|
| **Receipt Export page refactored to use `<Layout>`** | Removed all duplicate header/sidebar/nav markup from `receipt-export.tsx`. The page now wraps in the shared `<Layout>` component — consistent with every other page. |
| **Desktop two-column layout** | KPI stat bar → filter row → left column (receipt table with checkboxes) + right column (export panel, receipt preview, monthly auto-export). |
| **Mobile top-pill tab navigation** | Replaced fixed bottom 4-tab nav with a top pill switcher (Receipts / By Date / Summary / Export) so it no longer conflicts with the global Layout bottom nav. |
| **`UserOverview` interface added** | Replaced `useQuery<any[]>` and `(u: any)` map callbacks with a fully-typed `UserOverview` interface matching the `GET /api/admin/users-overview` response shape. |

---

### v3.3.1 — Re-import Setup, VAPID Fix & Duplicate Workflow Removal (2026-07-09)

| Change | Description |
|--------|-------------|
| **VAPID persistence fix** | `vapid.ts` now sets `VAPID_KEYS_FROM_ENV=true` when loading keys from the settings table — health endpoint no longer reports `ephemeral/degraded` after first boot |
| **VAPID keypair atomicity** | Partial keypair in DB (only one key) is detected and both keys are deleted + regenerated together — prevents a mismatched public/private pair from causing push failures |
| **VAPID env var + secret** | `VAPID_PUBLIC_KEY` set as shared env var; `VAPID_PRIVATE_KEY` saved as Replit Secret — health `persistent: true` on all boots |
| **push.ts base64 strip** | `initPush()` strips trailing `=` padding and whitespace from VAPID keys before calling `webPush.setVapidDetails()` — copy-paste artifact no longer crashes the server |
| **Duplicate workflow removed** | `artifacts/api-server: API Server` auto-generated by the platform is now overridden with a no-op stub in `.replit` — no more port 8080 conflict on startup |
| **sirv serve path fix** | Production `sirv` was serving `dist/` instead of `dist/public/` (Vite's actual output directory) — fixed in `sahu-csc/package.json` |
| **sanitize.ts TS fix** | `xss.IFilterXSSOptions` → named import `IFilterXSSOptions` — resolved TypeScript error |
| **Workflow cleanup** | `API Server` command simplified to direct `node` launch; `Build API`, `Typecheck`, `Build Production`, `Production Preview` workflows restored |
| **postMerge timeout** | Increased from 20 s → 180 s — `pnpm install + drizzle push` reliably complete on future imports |
| **All secrets set** | `SESSION_SECRET`, `ADMIN_PASSWORD`, `OPERATOR_PASSWORD`, `SMTP_PASSWORD`, `VAPID_PRIVATE_KEY` confirmed in Replit Secrets; `VAPID_PUBLIC_KEY` set as shared env var |

---

### v3.3.0 — Email & Security Hardening (2026-07-08)

| Change | Description |
|--------|-------------|
| **V2 dark premium email templates** | All 7 transactional email types rewritten. Dark gradient page + dark navy card + per-type glow accent. `esc()` helper applied to all dynamic fields. |
| **OTP email copy strip** | Digit boxes joined to a copy strip showing the full OTP in large spaced monospace. Digit-only validation before render. |
| **SMTP live** | Gmail (`smtp.gmail.com:587`) configured via env vars + `SMTP_PASSWORD` secret. All transactional emails now deliver. |
| **Password policy** | 8+ chars, no max, upper + lower + number + special required. Frontend and backend in sync. |
| **Login lockout** | 3 failed attempts → 5-minute lock (was 5 / 15 min). |

---

### v3.2.5 — Password Policy Correction (2026-07-06)

| Feature | Description |
|---------|-------------|
| **Password length corrected to 6–8 chars** | The v3.2.4 policy required 10+ characters; adjusted to a 6–8 character range (still requires upper, lower, number, special character) across registration, password reset, profile self-service change, and admin user management |

### v3.2.4 — Security Upgrade (2026-07-06)

| Feature | Description |
|---------|-------------|
| **Unified password policy** | Shared `passwordPolicySchema` (`lib/password-policy.ts`) enforced everywhere a password is set — registration, password reset, profile self-service change, admin user management |
| **Tighter rate limiting** | Login limiter 20→8/15min; new `authWriteLimiter` (10/15min) on register/appeal/send-otp/forgot-password; new `otpVerifyLimiter` (8/15min) on verify-otp/reset-password |
| **Field-level encryption at rest** | AES-256-GCM (`lib/encryption.ts`) encrypts `udhari_customers.address/notes` and `users.address/bio` — fields that are never searched. Name/mobile/email stay plaintext since they're matched via `ILIKE`. Key auto-generates and persists in `settings`, overridable via `ENCRYPTION_KEY` secret |
| **Password hashing reviewed** | Confirmed bcrypt cost factor 12 already meets industry standard — no change needed |

### v3.2.3 — Server Health FPS Panel + Heap Check Fix (2026-07-05)

| Feature | Description |
|---------|-------------|
| **Device Performance card** | `server-health.tsx` gained a card showing live FPS (via new `useLiveFps` hook, sampled continuously with `requestAnimationFrame`), target FPS, tier badge, rich-animations status, and reduced-motion status — so an admin can confirm the adaptive tier on any real device without dev tools |
| **`/api/healthz` heap check fixed** | Was comparing `heapUsed` to `heapTotal` (currently-allocated heap, which V8 normally keeps 90–98% full between GC cycles) — a near-permanent false positive. Now compares against `v8.getHeapStatistics().heap_size_limit`, the actual out-of-memory ceiling |
| **`heapSizeLimitBytes` added to health response** | Exposed in `server.memory` so the frontend can show "X of Y limit" instead of a meaningless allocated-heap ratio |

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

1. **Add the `NEON_DATABASE_URL` secret** — paste your Neon connection string into Replit Secrets (🔒). `lib/db` reads this first and falls back to Replit's auto-injected `DATABASE_URL` if absent.
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
   | `SMTP_PASSWORD` | SMTP password or app password |

4. **Run the Seed Database workflow** (manual, one-shot) — creates admin and operator accounts.
5. **Start the project** — API Server + frontend start automatically.
6. Open the preview and log in with `admin` / your `ADMIN_PASSWORD`.

> The Setup Wizard Banner will appear at the top of every page (admin only) if any required secrets are still missing. It lists exactly what is needed.

---

## 4. Workflows

| Workflow | Port | Purpose | Auto-start |
|----------|------|---------|------------|
| `artifacts/sahu-csc: web` | 5000 → :80 | Vite frontend dev server (SAHU CSC FV1) | ✅ Yes |
| `API Server` | 8080 | Express API — builds then runs `dist/index.mjs` | ✅ Yes |
| `Seed Database` | — | One-shot DB seeder; requires `ADMIN_PASSWORD` + `OPERATOR_PASSWORD` secrets | ❌ Manual |
| `Typecheck` | — | TypeScript check across all packages | ❌ Manual |
| `Build Production` | — | Full production build: typecheck + API + Vite + PWA SW | ❌ Manual |
| `Worker Server` | 8081 | BullMQ background jobs — skips if `REDIS_URL` not set | ❌ Optional |
| `artifacts/api-server: API Server` | — | **No-op stub** — artifact-managed, cannot be removed; exits immediately | ✅ Auto (harmless) |
| `artifacts/mockup-sandbox: Component Preview Server` | 3000 | UI component preview sandbox | ✅ Auto (dev tool) |

> **Port note:** Port 5000 maps to external port 80 (Replit proxy). API runs on port 8080. Vite's `vite.config.ts` proxies `/api/*` → `http://localhost:8080`.
> After any backend code change: restart **API Server** (it rebuilds automatically on start).
>
> **`artifacts/api-server: API Server` — duplicate explained:** Replit auto-generates this for the `artifacts/api-server` artifact registration. It **cannot be removed** — `removeWorkflow` rejects artifact-managed workflows. Its `dev` command is overridden to a harmless `echo` stub so it never conflicts with the real `API Server` on port 8080. It will always show status `finished` immediately — this is correct.
>
> **Removed (2026-07-15):** `SAHU CSC` (manual dev server) and `Production Preview` — `artifacts/sahu-csc: web` is the sole frontend workflow.

### Workflow commands (exact)

```bash
# artifacts/sahu-csc: web — Vite frontend dev server (auto-start, SAHU CSC FV1)
pnpm --filter @workspace/sahu-csc run dev

# API Server — builds then runs the bundle (auto-start)
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server run build && PORT=8080 node --enable-source-maps artifacts/api-server/dist/index.mjs

# Seed Database — create/reset admin + operator (manual, requires secrets)
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts

# Typecheck (manual)
pnpm run typecheck:libs && pnpm -r --filter "./artifacts/**" --if-present run typecheck

# Build Production (manual)
pnpm run typecheck:libs && pnpm --filter @workspace/api-server run build && PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run build
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
| `NEON_DATABASE_URL` | Neon PostgreSQL connection string — set as a Replit Secret (takes priority over `DATABASE_URL`) |
| `DATABASE_URL` | Replit-managed PostgreSQL fallback — auto-injected; used only if `NEON_DATABASE_URL` is absent |
| `SESSION_SECRET` | Express session signing key — any long random string |
| `ADMIN_PASSWORD` | Default admin account password (used by Seed Database workflow) |
| `OPERATOR_PASSWORD` | Default operator account password (used by Seed Database workflow) |

### Required for email / OTP

| Variable | Purpose |
|----------|---------|
| `SMTP_HOST` | SMTP server hostname (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (`587` for TLS, `465` for SSL) |
| `SMTP_USER` | SMTP username / email address |
| `SMTP_PASSWORD` | SMTP password or app password (**new canonical name**; `SMTP_PASS` still accepted as alias) |
| `SMTP_FROM_EMAIL` | From address in sent emails (defaults to `SMTP_USER`) |

> Without SMTP, OTP login, password reset, and admin email broadcast are disabled. Username + password login still works.

### Required for Redis cache & background jobs

| Variable | Purpose |
|----------|---------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint (e.g. `https://xxx.upstash.io`) — used by `@upstash/redis` for the shared cache backend |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `REDIS_URL` | Upstash direct TCP URL (`rediss://default:PASSWORD@xxx.upstash.io:6379`) — required by the **Worker Server** (BullMQ / ioredis) and the rate-limiter Redis store |

> Without these, `CACHE_BACKEND` falls back to `memory` (per-process, lost on restart) and the Worker Server won't start. Set `CACHE_BACKEND=redis` in shared env vars once all three are added.

### Required for CORS

| Variable | Purpose |
|----------|---------|
| `CORS_ORIGIN` | Extra comma-separated allowed origins. `REPLIT_DEV_DOMAIN` and `REPLIT_DOMAINS` are now **auto-included** at startup — this var is only needed for non-Replit origins (e.g. a custom domain). No longer requires manual updating after re-imports. |

### Optional (recommended for production)

| Variable | Purpose |
|----------|---------|
| `VAPID_PUBLIC_KEY` | Web push notification public key (set as shared env var — not a secret) |
| `VAPID_PRIVATE_KEY` | Web push notification private key (set as Replit Secret) |
| `VAPID_EMAIL` | VAPID contact email (default: `mailto:sahuuttam690@gmail.com`) |

> VAPID keys auto-generate on first boot and persist in the `settings` DB table — the app works without them. Setting them explicitly as env var / secret ensures `GET /api/healthz` reports `vapid.persistent: true` and removes the yellow Setup Wizard banner. The public key is safe as a plain env var; the private key must be a Replit Secret.

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
| `POST` | `/api/auth/2fa/switch-method` | Switch OTP↔TOTP mid-login, or resend OTP |
| `POST` | `/api/auth/2fa/setup-totp` | Begin TOTP enrollment — returns `{ qrCodeDataUrl, otpauthUri, secret }` |
| `POST` | `/api/auth/2fa/setup-totp-pending` | Same, for mid-login `pendingUserId` state |
| `GET` | `/api/auth/2fa/totp-qr` | Re-fetch QR code + secret for enrolled user |
| `GET` | `/api/auth/2fa/totp-code` | Current TOTP code + countdown for authenticated user |
| `GET` | `/api/auth/2fa/totp-code-pending` | Same, for mid-login `pendingUserId` state |
| `POST` | `/api/auth/2fa/verify-totp` | Confirm TOTP enrollment or verify mid-login code |
| `POST` | `/api/auth/2fa/verify-otp` | Verify email OTP mid-login |
| `POST` | `/api/auth/2fa/enable-otp` | Enable email-OTP 2FA (requires current password) |
| `POST` | `/api/auth/2fa/disable` | Disable 2FA entirely (requires current password) |
| `GET` | `/api/auth/2fa/status` | 2FA enabled/method/backupCodesRemaining/totpConfigured |
| `POST` | `/api/auth/2fa/regenerate-backup-codes` | Invalidate old codes + generate fresh set (requires password) |
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
| `/receipt-export` | `receipt-export.tsx` | Admin | Bulk receipt export — desktop two-column layout (filter+table left, export panel right); mobile pill-tab layout using shared `<Layout>` |
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

### Two-factor authentication

| Feature | Detail |
|---------|--------|
| Methods | Email OTP or Authenticator App (TOTP) — chosen at login time via method picker |
| TOTP standard | RFC 6238 · 30-second window · `window: 1` clock-drift tolerance |
| TOTP apps | Any TOTP app (Google Authenticator, Authy, Microsoft Authenticator) via QR code or manual secret |
| QR export | `setup-totp` returns `qrCodeDataUrl` + `otpauthUri` + plain `secret`; QR re-fetchable via `GET /auth/2fa/totp-qr` |
| Replay protection | In-memory token log per user — a 30-second code already used once is rejected immediately |
| Timing-safe | Backup-code hash comparison uses `crypto.timingSafeEqual` to prevent timing oracle attacks |
| Backup codes | 8 single-use codes, bcrypt-hashed at rest, shown once on enrollment; regeneratable via password confirmation |
| Enrollment | Profile → Security (authenticated) or inline at first login (mid-login, before full session exists) |
| Audit | Every 2FA enable/disable/verify event written to `security_logs` and `audit_logs` |

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
      "description": "Required for OTP login and email notifications. Missing: SMTP_HOST, SMTP_USER, SMTP_PASSWORD."
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
2. `SMTP_HOST` + `SMTP_USER` + `SMTP_PASSWORD` (or `SMTP_PASS`) — required for email
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
| **VAPID base64 must be unpadded** | `initPush()` strips trailing `=` and whitespace from both VAPID keys before `webPush.setVapidDetails()` | `web-push` rejects URL-safe base64 with `=` padding — copy-paste from secrets form can introduce it |
| **VAPID keypair atomicity** | If only one VAPID key exists in `settings` (partial/corrupt state), both are deleted and regenerated together | A mismatched public/private pair silently breaks all push subscriptions |
| **Duplicate artifact workflow override** | `artifacts/api-server: API Server` entry in `.replit` is a no-op echo — not a real server | Replit auto-generates this from artifact registration; without the override it tries to start on port 8080 and crashes |

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
# Use the Replit workflow panel → restart "API Server"
# (NOT "artifacts/api-server: API Server" — that is a no-op stub)
```

---

*Documentation for SAHU CSC v3.3.1 — Built for Odisha / India rural Common Service Centers*
