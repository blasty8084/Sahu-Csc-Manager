# SAHU CSC — Change Log v3 / v4
**Current version: 4.9.0 — July 18, 2026**

> Detailed record of every feature, change, and upgrade from v3.0.0 onward.  
> For v2.x history, see `docs/archive/changelogV2.md`.  
> For pre-v2 history, see `CHANGELOG.md`.  
> For full architecture reference, see `architectureV3.md`.

> **⚠️ On every version bump, update this file — and only this file — for the feature/version entry.**
> This is the single canonical changelog for v3.x / v4.x. Do not create parallel changelog files. If architecture or setup also changed, update `architectureV3.md` / `replit.md` directly instead of restating the change here.

---

## Table of Contents

0. [Refactor — Udhari page split into focused components (July 18, 2026)](#0-refactor--udhari-page-split-into-focused-components-july-18-2026)
0. [Fix — PermissionCard Continue/Skip single-tap UX (July 18, 2026)](#0-fix--permissioncard-continueskip-single-tap-ux-july-18-2026)
0. [Refactor — AePS DailyTab split into focused components + hook (July 18, 2026)](#0-refactor--aeps-dailytab-split-into-focused-components--hook-july-18-2026)
0. [Refactor — Dashboard page split into focused components (July 18, 2026)](#0-refactor--dashboard-page-split-into-focused-components-july-18-2026)
0. [Refactor — Users page over-limit files split into focused components (July 18, 2026)](#0-refactor--users-page-over-limit-files-split-into-focused-components-july-18-2026)
0. [Refactor — Register page split into focused components (July 18, 2026)](#0-refactor--register-page-split-into-focused-components-july-18-2026)
0. [Refactor — Profile page final split into focused components (July 18, 2026)](#0-refactor--profile-page-final-split-into-focused-components-july-18-2026)
0. [Refactor — Server Health page split into focused components (July 18, 2026)](#0-refactor--server-health-page-split-into-focused-components-july-18-2026)
0. [Refactor — Ledger page split into focused components (July 18, 2026)](#0-refactor--ledger-page-split-into-focused-components-july-18-2026)
0. [v4.9.0 — Platform Optimization & Setup Hardening (July 16, 2026)](#0-v490--platform-optimization--setup-hardening-july-16-2026)

---

## 0. Refactor — Udhari page split into focused components (July 18, 2026)

**Zero behaviour change — routes, API calls, and rendered output are identical.**

`pages/udhari.tsx` (464 lines) broken into a 71-line thin page plus 5 focused files in `components/udhari/`:

| New file | Lines | Role |
|---|---|---|
| `UdhariCustomerCard.tsx` | 86 | `fmt` helper, `BalanceBadge`, mobile `CustomerCard`, desktop `CustomerRow` |
| `UdhariAddCustomerDialog.tsx` | 197 | Mobile dialog + desktop full-screen split-panel add-customer form |
| `UdhariSearchBar.tsx` | 37 | Search input + sort select (Recent / Highest Balance / A–Z) |
| `UdhariCustomerList.tsx` | 61 | Mobile card list + desktop table with loading/empty states |
| `UdhariSummaryBanner.tsx` | 45 | To-collect / to-pay summary grid cards |

`pages/udhari.tsx` is now **71 lines** — state, data fetch, layout wrapper, component composition only.  
No import sites outside `pages/udhari.tsx` needed updating. TypeScript clean.

---

## 0. Refactor — App.tsx split into providers + focused components (July 18, 2026)

**Zero behaviour change — provider tree, routes, and rendered output are identical.**

`App.tsx` (562 lines) broken into a 69-line thin root plus 6 focused files:

| New file | Lines | Role |
|---|---|---|
| `providers/QueryProvider.tsx` | 69 | `queryClient` (exported), IDB persister, `PersistQueryClientProvider` wrapper |
| `providers/AuthProvider.tsx` | 153 | `AppAuthProvider` — bundles `HookAuthProvider` + `BadgeUpdater` + `EagerPreloader` + `SessionManager` + `FirstLoginGate` + `SyncBadge` |
| `components/Router.tsx` | 96 | All 30 `<Route>` definitions, every lazy page import, `ShareTargetHandler` |
| `components/ProtectedRoute.tsx` | 33 | Auth guard — redirects to `/login`; renders 403 for `adminOnly` routes |
| `components/LoadingScreen.tsx` | 168 | Branded full-screen spinner with phase-aware animation (loading / slow / timeout) |
| `components/AuthFade.tsx` | 15 | Enter-only opacity fade wrapper for public auth pages |

`App.tsx` is now **69 lines** — `GeoGate` inline (15 ln) + provider tree + `Router` mount.  
No import sites outside `App.tsx` needed updating; none of these were previously exported.

---

## 0. Refactor — AePS DailyTab split into focused components + hook (July 18, 2026)

**Zero behaviour change — identical output, identical exports.**

`pages/aeps/DailyTab.tsx` (563 lines) broken into an 87-line orchestrator plus a custom hook and 4 focused components:

| New file | Lines | Role |
|---|---|---|
| `hooks/useDailyTab.ts` | 249 | All state, queries, mutations, offline handlers, form logic; exports `UseDailyTabReturn` type |
| `components/aeps/daily/DailyTabEntryRow.tsx` | 68 | Date navigator row — prev/next arrows, date input, Today badge & jump button |
| `components/aeps/daily/DailyTabSummaryCard.tsx` | 43 | Three summary stat cards: Withdrawals / Deposits / Current Balance |
| `components/aeps/daily/DailyTabEntryList.tsx` | 68 | Withdrawal & Deposit action buttons + `AepsTransactionTable` |
| `components/aeps/daily/DailyTabForm.tsx` | 112 | All 6 dialog/form overlays (open-day, withdrawal, deposit, edit, delete, receipt) |

`pages/aeps/DailyTab.tsx` is now 87 lines — calls `useDailyTab()`, renders the date nav, no-session card (kept inline), session content via sub-components, and `DailyTabForm`.  
Import site (`pages/aeps.tsx:5`) unchanged — still `import DailyTab from "./aeps/DailyTab"`.

---

## 0. Refactor — Dashboard page split into focused components (July 18, 2026)

**Zero behaviour change — identical output, identical exports.**

`pages/dashboard.tsx` (565 lines) broken into a 13-line orchestrator plus 7 focused files under `components/dashboard/`:

| New file | Lines | Role |
|---|---|---|
| `components/dashboard/UdhariSummaryCard.tsx` | 49 | Udhari credit summary card (shared mobile + desktop) |
| `components/dashboard/DashboardStatCards.tsx` | 128 | `MobileStatCards` (2×2 grid) + `DesktopStatCards` (4-col grid) |
| `components/dashboard/DashboardWeeklyBar.tsx` | 60 | 7-day CSS bar chart with `useMemo`-computed week data |
| `components/dashboard/DashboardRecentActivity.tsx` | 91 | Recent ledger entries table with avatar initials |
| `components/dashboard/DashboardQuickActions.tsx` | 55 | FAB-style 4-button quick-action grid |
| `components/dashboard/MobileDashboard.tsx` | 96 | Mobile layout: offline cache, stat cards, quick actions, top services |
| `components/dashboard/DesktopDashboard.tsx` | 95 | Desktop layout: offline cache, stat cards, weekly bar, top services, recent activity |

`pages/dashboard.tsx` is now 13 lines — imports `MobileDashboard` / `DesktopDashboard` and branches on `useIsMobile`.  
No import sites changed (no other file imported from `pages/dashboard`).

---

## 0. Refactor — Users page over-limit files split into focused components (July 18, 2026)

**Zero behaviour change — identical output, identical exports.**

Three files that exceeded the 250-line limit were split. New files created:

| New file | Lines | Role |
|---|---|---|
| `components/users/UserTablePending.tsx` | 182 | Pending-tab UI: bulk action bar + mobile cards + desktop table |
| `components/users/UserFormDesktop.tsx` | 192 | Desktop split-layout form panel (navy info panel + right form) |
| `hooks/useResetLinkActions.ts` | 53 | Reset-link actions (open, close, generate, copy, email) |

Files trimmed:

| File | Before | After |
|---|---|---|
| `components/users/UserTable.tsx` | 383 | 249 — delegates `tab === "pending"` to `UserTablePending` |
| `components/users/UserFormDialog.tsx` | 259 | 104 — mobile Dialog unchanged; desktop delegates to `UserFormDesktop` |
| `hooks/useUserActions.ts` | 273 | 228 — reset-link group extracted to `useResetLinkActions`; spread into return |

`pages/users.tsx` (120 lines) and all other import sites unchanged.

---

## 0. Fix — PermissionCard Continue/Skip single-tap UX (July 18, 2026)

**Root cause:** `handleContinueStep1` set step to 2 then awaited all three permission requests sequentially. On Android, all three resolve near-instantly (location denied by OS/WebView policy, notifications already denied, `showOpenFilePicker` fails without a fresh user gesture after the async geolocation await). Step 2 appeared with an already-enabled Continue button — the user had to press Continue a **second time** to call `finish()`. Both presses felt like "going to the dashboard" with no visible permission activity, so the flow appeared broken.

**Fix — `PermissionCard.tsx`:**

| Before | After |
|---|---|
| `handleContinueStep1` requests permissions, transitions to step 2, stops. User must press Continue again to call `finish()`. | `handleContinueStep1` requests permissions then **auto-calls `finish()`** — one tap completes the entire flow. |
| Step 2 shows a "Continue" button (enabled when all permissions attempted). | Step 2 shows a non-interactive **"Setting up…" / "Saving…" spinner** — no second tap ever required. |
| Skip for now → `finish()` → dashboard (unchanged). | Skip for now → `finish()` → dashboard (unchanged). |

**No backend changes.** `PATCH /users/first-login-completed` contract unchanged. `usePermissions.ts` logic unchanged. `PermissionRow.tsx` unchanged. Individual per-row "Allow" buttons still work as before in step 1.

---

## 0. Refactor — Register page split into focused components (July 18, 2026)

**Zero behaviour change — identical output, identical exports.**

| File | Lines | Role |
|---|---|---|
| `pages/register.tsx` | 89 (was 729) | Thin orchestrator: status check, LoadingScreen, mobile/desktop layout wiring |
| `components/auth/registerTypes.ts` | 66 (new) | Schema, types (`RegisterStep`, `RegisterFormValues`), `maskEmail`, `useTwoFaDisabled`; re-exports `RESEND_COOLDOWN`/`OTP_RATE_LIMIT` from loginTypes |
| `components/auth/PasswordStrength.tsx` | 47 (new) | Animated strength bar + per-rule checklist; extracted from inline in register.tsx |
| `components/auth/RegisterPersonalForm.tsx` | 81 (new) | Username, full name, email, mobile fields (inside shadcn `<Form>`) |
| `components/auth/RegisterCredentialsForm.tsx` | 105 (new) | Password, confirm-password, error banner, submit button |
| `components/auth/RegisterStepIndicator.tsx` | 29 (new) | OTP step 2 header: shield icon + "Verify your email" + masked email |
| `components/auth/RegisterOtpStep.tsx` | 123 (new) | OTP digit grid, submit button, resend countdown ring, back link |
| `components/auth/RegisterMobileLayout.tsx` | 49 (new) | Navy header + slide-up white card (mobile wrapper) |
| `components/auth/RegisterDesktopLayout.tsx` | 97 (new) | Navy hero panel + form card (desktop split wrapper) |
| `components/auth/RegisterForm.tsx` | 235 (new) | All form state, timers, API calls; renders via sub-components |

**What moved where:**
- Duplicate `OtpRateLimitPanel` removed — now imports the existing shared one from `components/auth/`
- `RESEND_COOLDOWN` / `OTP_RATE_LIMIT` no longer re-declared — imported from `loginTypes`
- `mobileSection` state (drill-in nav) stays in `RegisterForm`; layout wrappers are stateless
- `register.tsx` no longer imports from `lucide-react`, `react-hook-form`, `framer-motion`, or `zod`

**Typecheck:** sahu-csc passes clean.

---

## 0. Refactor — Profile page final split into focused components (July 18, 2026)

**Zero behaviour change — identical output, identical exports.**

| File | Lines | Role |
|---|---|---|
| `pages/profile.tsx` | 82 (was 261) | Thin orchestrator: useProfileData, prop bundling, Layout wiring |
| `components/profile/ProfileSessionDialogs.tsx` | 95 (new) | Three AlertDialogs for single-revoke / logout-others / logout-everywhere |
| `components/profile/ProfileDesktopLayout.tsx` | 128 (new) | Desktop (md+) two-column grid: banner + all CmdCards |
| `components/profile/ProfileMobileLayout.tsx` | 177 (new) | Mobile nav list + drill-in per section; owns `mobileSection` state and `MOBILE_NAV` config |

**What moved where:**
- Session revoke dialogs → `ProfileSessionDialogs`
- Desktop grid (ProfileDesktopBanner + all CmdCards) → `ProfileDesktopLayout`
- `MobileTab` type, `MOBILE_NAV` config, `mobileSectionContent`, mobile nav/drill-in → `ProfileMobileLayout` (owns its own `useState`)
- `profile.tsx` no longer imports from `lucide-react`, shadcn `AlertDialog`, or `useState`

**Typecheck:** sahu-csc passes clean.

---

## 0. Refactor — Server Health page split into focused components (July 18, 2026)

**Zero behaviour change — identical output, identical exports.**

| File | Lines | Role |
|---|---|---|
| `pages/server-health.tsx` | 137 (was 765) | Thin orchestrator: fetch state, polling interval, layout |
| `components/server-health/health-types.ts` | 86 | Shared interfaces (`HealthData`, `DbStats`, `AuditRecent`, etc.) + `formatBytes` / `formatUptime` |
| `components/server-health/HealthMetricCard.tsx` | 157 | `useLiveFps`, `StatCell`, `StatusBadge`, `TierBadge`, `DevicePerformanceCard` |
| `components/server-health/HealthOverviewCard.tsx` | 109 | Overall status banner + API Server card (uptime, memory, CPU) |
| `components/server-health/HealthDatabaseSection.tsx` | 137 | Database connection card + Table Stats card with row-delta trends |
| `components/server-health/HealthAlertList.tsx` | 107 | Recent Activity / audit-log tail (scrollable, severity-coloured) |
| `components/server-health/HealthTimelineChart.tsx` | 109 | VAPID/Push card + Quick Fixes diagnostic tips |

**Typecheck:** sahu-csc passes clean.

---

---

## 0. Refactor — Ledger page split into focused components (July 18, 2026)

**Zero behaviour change — identical output, identical exports.**

| File | Lines | Role |
|---|---|---|
| `pages/ledger.tsx` | 215 (was 784) | Thin orchestrator: dialogs, form state, handlers |
| `hooks/useLedger.ts` | 210 (was ~130) | Data + filter/pagination + quick-add state |
| `components/ledger/LedgerSummaryCards.tsx` | 75 | 4-stat desktop card grid (balance, credits, debits, count) |
| `components/ledger/LedgerMobileHeader.tsx` | 79 | Mobile navy hero + tab switcher |
| `components/ledger/LedgerDesktopHeader.tsx` | 46 | Desktop gradient header with export/delete-all buttons |
| `components/ledger/LedgerQuickAddStrip.tsx` | 57 | Inline quick-add row (desktop) |
| `components/ledger/LedgerRightPanel.tsx` | 143 | Right sidebar: Quick Actions, summary donut, recent activity |
| `components/ledger/LedgerMobilePending.tsx` | 59 | Mobile offline-pending entries banner |
| `components/ledger/LedgerFilters.tsx` | 225 | Already existed |
| `components/ledger/LedgerEntryForm.tsx` | 278 | Already existed |
| `components/ledger/LedgerTable.tsx` | 606 | Already existed |

**What moved into `useLedger`:**
- Filter state: `page`, `startDate`, `endDate`, `customerName`, `serviceFilter`, `showFilters`
- Derived: `hasFilters`, `totalPages`, `clearFilters`
- Quick-add state: `quickAdd`, `quickAddSaving`, `saveQuickAdd`

**Typecheck:** sahu-csc passes clean.

---

0. [v4.8.0 — 2FA Security Upgrade: QR Codes, Replay Protection & Standard TOTP (July 16, 2026)](#0-v480--2fa-security-upgrade-qr-codes-replay-protection--standard-totp-july-16-2026)
0. [v4.7.1 — Security Score 100 & Login Code Display Fix (July 16, 2026)](#0-v471--security-score-100--login-code-display-fix-july-16-2026)
0. [v4.7.0 — Built-in Authenticator: No QR Code, No External App (July 16, 2026)](#0-v470--built-in-authenticator-no-qr-code-no-external-app-july-16-2026)
0. [v4.6.0 — Login-Time 2FA Method Choice (July 15, 2026)](#0-v460--login-time-2fa-method-choice-july-15-2026)
0. [v4.5.1 — File Manager Permission: Real Granted/Denied Signal (July 15, 2026)](#0-v451--file-manager-permission-real-granteddenied-signal-july-15-2026)
0. [v4.5.0 — Permission Card Redesign: File Manager Access & Continue Fix (July 15, 2026)](#0-v450--permission-card-redesign-file-manager-access--continue-fix-july-15-2026)
0. [v4.4.0 — First-Login Permissions, 2FA & Single-Device Enforcement (July 15, 2026)](#0-v440--first-login-permissions-2fa--single-device-enforcement-july-15-2026)
0. [v4.3.2 — Optimization Audit & Measurements (July 14, 2026)](#0-v432--optimization-audit--measurements-july-14-2026)
0. [v4.3.1 — Performance Pass: Bundle Size & Avatar Compression (July 14, 2026)](#0-v431--performance-pass-bundle-size--avatar-compression-july-14-2026)
0. [v4.3.1 — Config & Maintenance Fixes (July 14, 2026)](#0-v431--config--maintenance-fixes-july-14-2026)
0. [v4.3.0 — Security Hardening, Input Validation & Database Integrity (July 14, 2026)](#0-v430--security-hardening-input-validation--database-integrity-july-14-2026)
0. [Infra — Redis connected, rate-limiter fix & CORS update (July 14, 2026)](#0-infra--redis-connected-rate-limiter-fix--cors-update-july-14-2026)
0. [v4.2.0 — Running Balance, CDN Headers & Test Coverage (July 14, 2026)](#0-v420--running-balance-cdn-headers--test-coverage-july-14-2026)
0. [v4.1.2 — Security & Type-Safety Hardening (July 13, 2026)](#0-v412--security--type-safety-hardening-july-13-2026)
0. [v4.1.1 — Worker Server — BullMQ Async Processing (July 13, 2026)](#0-v411--worker-server--bullmq-async-processing-july-13-2026)
0. [v4.0.2 — Image & Loader Polish (July 13, 2026)](#0-v402--image--loader-polish-july-13-2026)
0. [v4.0.1 — Redis Rate Limiting & Multi-Instance Readiness (July 13, 2026)](#0-v401--redis-rate-limiting--multi-instance-readiness-july-13-2026)
0. [v4.0.0 — Full-Stack Performance Audit (July 12, 2026)](#0-v400--full-stack-performance-audit-july-12-2026)
0. [v3.5.10 — Navigation Performance — Instant Page Switching (July 12, 2026)](#0-v3510--navigation-performance--instant-page-switching-july-12-2026)
0. [v3.5.9 — Redis Cache Live, i18n Fixes & Build Hardening (July 12, 2026)](#0-v359--redis-cache-live-i18n-fixes--build-hardening-july-12-2026)
0. [v3.5.8 — Reports & Receipt Export Page Modularization (July 12, 2026)](#0-v358--reports--receipt-export-page-modularization-july-12-2026)

---

## 0. v4.9.0 — Platform Optimization & Setup Hardening (July 16, 2026)

Infrastructure and performance pass. No new user-facing features; no DB schema changes.

| Change | Detail |
|--------|--------|
| **CORS auto-detects Replit domain** | `artifacts/api-server/src/app.ts`: origin callback now reads `REPLIT_DEV_DOMAIN` and `REPLIT_DOMAINS` at startup and appends them automatically. `CORS_ORIGIN` env var still accepted as an extra-origins override, but no longer required to list the dev domain manually on each re-import. |
| **SMTP_PASSWORD secret** | `artifacts/api-server/src/lib/mailer/transport.ts`: mailer reads `process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS` — new canonical name is `SMTP_PASSWORD`; `SMTP_PASS` still accepted as a backwards-compatible alias. `setup-status.ts` updated to check `SMTP_PASSWORD` first. |
| **Admin polling 30 s → 60 s** | `artifacts/sahu-csc/src/hooks/useUsers.ts`: `staleTime` and `refetchInterval` for admin-sessions, pending-users, and appeal-users increased from 30 s to 60 s; added `refetchOnWindowFocus: true` as primary freshness trigger. |
| **DB pool cap** | `DB_POOL_MAX=5` added to shared env vars. `lib/db/src/index.ts` already reads this env var (`max: Number(process.env.DB_POOL_MAX ?? 20)`). Prevents connection exhaustion on Replit's shared PostgreSQL under burst load. |
| **Session expire index** | `CREATE INDEX IF NOT EXISTS session_expire_idx ON session (expire)` applied directly via psql. Hourly `connect-pg-simple` pruning scan is now O(log n) instead of O(n). |
| **Receipt export 90-day cap** | `artifacts/api-server/src/routes/admin-receipt-export.ts`: second `.refine()` added to `bulkExportQuerySchema` — rejects date ranges > 90 days with a 400 error before hitting the DB, preventing large in-memory ZIP/PDF builds. |
| **PWA precache −985 KB** | `artifacts/sahu-csc/vite.config.ts`: `injectManifest.globIgnores` added — excludes `jspdf*`, `html2canvas*`, `vendor-charts*` from precache manifest. Precache: 74 entries / 3.3 MB → 71 entries / 2.4 MB. Chunks are still runtime-cached via the existing NetworkFirst/StaleWhileRevalidate strategies on first use. |
| **Ledger backfill gated** | `artifacts/api-server/src/index.ts`: `ledgerBalanceBackfillDone` key written to `settings` table after first successful run. Subsequent boots skip the correlated-subquery UPDATE entirely instead of running it on every restart. |
| **pnpm install on fresh import** | Confirmed that `node_modules` is not committed (`.gitignore`); `pnpm install` is always required after a GitHub import before any build or workflow start. Documented in Getting Started. |

---

## 0. v4.8.0 — 2FA Security Upgrade: QR Codes, Replay Protection & Standard TOTP (July 16, 2026)

Full security audit and upgrade of the two-factor authentication system. Supersedes the v4.7.0 built-in soft-token approach — external authenticator apps are now the primary TOTP method. No DB schema changes.

| Change | Description |
|--------|-------------|
| **TOTP period 120 s → 30 s** | `authenticator.options = { step: 30 }` — aligns with RFC 6238. Google Authenticator, Authy, and Microsoft Authenticator all ignore a non-standard `period` param and always use 30 s, so the old 120-second codes were permanently invalid in those apps. `otpauth://` URIs no longer embed `period=120`. |
| **QR code export restored** | `POST /auth/2fa/setup-totp` and `POST /auth/2fa/setup-totp-pending` now call `qrcode.toDataURL()` and `authenticator.keyuri()` and return `{ qrCodeDataUrl, otpauthUri, secret }`. |
| **GET /auth/2fa/totp-qr (new)** | Authenticated endpoint — re-fetches the QR + secret for already-enrolled users (e.g. transferring to a new phone without disabling/re-enabling 2FA). |
| **POST /auth/2fa/regenerate-backup-codes (new)** | Requires `currentPassword`. Invalidates all existing backup codes and generates a fresh set of 8. Returns `{ backupCodes }`. Triggers on "Generate new backup codes" button in profile. |
| **TOTP replay protection** | In-memory `_usedTotpTokens` Map (per userId → last 6 tokens). Every successful TOTP verify stores the token; a second use within the same 30-second window returns 401. Intentionally in-memory (resets on restart, acceptable since sessions also reset). |
| **Timing-safe hash compare** | `crypto.timingSafeEqual(Buffer.from(a,"hex"), Buffer.from(b,"hex"))` replaces `===` for backup-code hash comparison in `2fa.ts` and OTP hash comparison in `otp.ts`. |
| **Clock-drift tolerance** | All `authenticator.verify()` calls now pass `window: 1` — accepts codes from ±1 window (±30 s). |
| **TotpLiveCode.tsx — dynamic step** | Component reads `step` from the server response instead of `const STEP = 120`. SVG countdown ring and label are now driven by the server value. |
| **TwoFactorSection.tsx rewrite** | (a) Shows scannable QR image after setup-totp; (b) reveal/copy manual secret key; (c) "Generate new backup codes" button with password confirm dialog; (d) backup-code health bar (available/used slots, regenerate CTA when ≤2 remain); (e) all "120 s" labels corrected to "30 s". |
| **TwoFactorStep.tsx update** | Mid-login first-time TOTP enrollment: if `setup-totp-pending` returns `qrCodeDataUrl`, the QR is shown inline above the code-entry field so the user can scan with their app before entering the confirmation code. |
| **use-auth.tsx** | `TotpSetupData` updated to `{ enrolled: boolean; qrCodeDataUrl?: string; secret?: string }`; `setupTotpPending()` passes through the full API response body. |

---

## 0. v4.7.0 — Built-in Authenticator: No QR Code, No External App (July 16, 2026)

> ⚠️ **Superseded by v4.8.0.** The built-in soft-token approach introduced here (no QR code, 120-second period) was found to be incompatible with all major authenticator apps, which hardcode a 30-second window. v4.8.0 reverts to the standard external-app QR-based flow with security improvements.

Replaced the external-authenticator (QR code / Google Authenticator / Authy) TOTP flow with a fully built-in soft token. No new DB schema changes — the existing `users.totp_secret` column is used as before.

| Change | Description |
|--------|-------------|
| **No QR code, no external app** | `POST /auth/2fa/setup-totp` and `POST /auth/2fa/setup-totp-pending` no longer generate a QR code or call `qrcode.toDataURL()`. They auto-generate the secret, store it, and return `{ enrolled: true }`. The `qrcode` package import removed from `2fa.ts`. |
| **GET /auth/2fa/totp-code (new)** | Authenticated endpoint — returns `{ code, remaining, step }` for the logged-in user's current TOTP window. Auto-generates a secret if one doesn't exist yet. |
| **GET /auth/2fa/totp-code-pending (new)** | Mid-login variant — works with `pendingUserId` session key; same response shape. Used by the login TOTP step to display the live code before a full session exists. |
| **120-second TOTP period** | `authenticator.options = { step: 120 }` applied at router creation — codes rotate every 120 s instead of the standard 30 s; the `otpauth://` URI embeds `period=120` for any app that still scans it. |
| **TotpLiveCode component (new)** | `src/components/auth/TotpLiveCode.tsx` — shared React component that fetches a code from a given API path, shows big monospace digits with a countdown SVG ring (green → orange → red), and auto-refetches the moment the current window expires. No external deps beyond React. |
| **Profile page (TwoFactorSection.tsx)** | QR setup stage replaced — no QR image, no scan countdown. "Enable Authenticator" calls `setup-totp`, then immediately renders `<TotpLiveCode apiPath="/api/auth/2fa/totp-code" />`. User reads the displayed code and enters it once to confirm enrollment. Removed `totpTimer`, `timerRef`, and `totpSetup` state; removed `useEffect` countdown. |
| **Login TOTP step (TwoFactorStep.tsx)** | QR enrollment phase removed entirely. `handleChooseMethod("totp")` now silently calls `setupTotpPending()` if the account has no TOTP secret yet, then sets `totpEnrolled = true`. Code-entry phase renders `<TotpLiveCode apiPath="/api/auth/2fa/totp-code-pending" />` above the input field so the user sees and types the rotating code. |
| **use-auth.tsx** | `TotpSetupData` type simplified to `{ enrolled: boolean }`; `setupTotpPending()` return value updated to match. |

---

## 0. v4.6.0 — Login-Time 2FA Method Choice (July 15, 2026)

The post-login 2FA / new-device challenge screen was upgraded from a fixed-method code entry to a method picker with inline TOTP enrollment support.

| Change | Description |
|--------|-------------|
| **Method picker UI** | `TwoFactorStep.tsx` now shows a phase-1 card picker — Email OTP (navy) or Authenticator App (orange) — before any code is requested. Either option can be chosen at login time regardless of the account's stored `twoFaMethod`. |
| **POST /auth/2fa/switch-method (new)** | Switches the pending 2FA method mid-login (or resends OTP for the email path). Reads `pendingUserId` from session; does not require a full session. For `method: "otp"` it sends a fresh OTP email and returns `maskedEmail`. For `method: "totp"` it returns `totpEnrolled` status so the frontend knows whether to show setup or code-entry. |
| **Email OTP resend cooldown** | 120-second client-side cooldown after OTP send/resend — same `RESEND_COOLDOWN` constant used by register and forgot-password. The button disables and shows a countdown during the cooldown period. |
| **Inline TOTP enrollment (mid-login)** | `POST /auth/2fa/setup-totp-pending` starts TOTP enrollment mid-login (only `pendingUserId` required, no full session). Completing it during login (`verify-totp`) flips `twoFaEnabled`/`twoFaMethod` and mints backup codes, mirroring the profile-settings enrollment flow. Backup codes shown once on-screen before the session is applied. |
| **completeLogin() split** | `verifyTwoFactor()` in `use-auth.tsx` now resolves with `{ backupCodes, user }` instead of applying the session immediately when backup codes are present — lets the caller show them first, then call `completeLogin(user)` to finish. |
| **Session flag** | `req.session.pendingTotpEnrolling = true` set by `setup-totp-pending`; checked by `verify-totp` Mode B to know it should also finalize enrollment (flip DB flags + mint backup codes) on the first successful code. |

---

## 0. v4.5.1 — File Manager Permission: Real Granted/Denied Signal (July 15, 2026)

Follow-up to v4.5.0 — File Manager permission previously always resolved to "granted" regardless of user action. Now gives a real granted/denied outcome, matching Location and Notifications. No API contract changes.

| Change | Description |
|--------|-------------|
| **File System Access API path (real signal)** | On browsers that support it (Chrome/Edge/Opera, desktop + Android), `requestFileManager()` in `usePermissions.ts` now calls `window.showOpenFilePicker()`. Picking a file resolves the promise → "granted". Cancelling/dismissing the picker throws a native `AbortError`, which is caught and mapped to "denied" — a genuine cancel signal the old hidden-input approach could never get. |
| **Fallback path unchanged (no real signal available)** | Safari, Firefox, and other browsers without the File System Access API keep the previous hidden `<input type="file">` approach — `change` and `cancel` events both settle as "granted", since those browsers don't fire a reliable cancel event that would let us tell a real denial from a dismissed picker. |
| **Safety-net timeout unchanged** | Both paths still race against the existing 10-second `SAFETY_TIMEOUT_MS` fallback (resolves "denied" on the FSA path, "granted" on the legacy path) so the Continue button can never get stuck regardless of browser behavior. |
| **In-app docs updated** | `about.tsx` changelog entry added for v4.5.1; `PermissionCard.tsx` header comment updated to describe the new per-browser behavior. |

---

## 0. v4.5.0 — Permission Card Redesign: File Manager Access & Continue Fix (July 15, 2026)

Redesigned the first-login permission overlay per an exact visual/behavior spec, added a third permission, and root-caused/fixed a real Continue-button bug. No API contract changes.

| Change | Description |
|--------|-------------|
| **PermissionCard component system** | Replaced `FirstLoginOverlay.tsx` (fullscreen/compact popup, Notifications + Files acknowledgement) with a new modal-with-backdrop `PermissionCard` under `src/components/PermissionCard/` (`PermissionCard.tsx`, `PermissionRow.tsx`, `usePermissions.ts`, `index.ts`). Two-step flow: "Permissions Required" intro (per-row Allow buttons, Skip for now, X close) → "Setting up Permissions" (requests fire one at a time, live status per row). |
| **File Manager permission (new)** | Added a third permission row — Location, Notifications, **File Manager**. Browsers have no standing Permissions API for generic photo/file access, so "Allow" opens a hidden native `<input type="file">` picker; any interaction with it (pick or cancel) is treated as granted, since there's no signal to distinguish denial from cancellation. |
| **Continue-button stuck bug (real fix)** | Root cause: permission requests — most notably `navigator.geolocation.getCurrentPosition` — could hang indefinitely in some browser/embed contexts without ever invoking either the success or error callback, leaving `canContinue` permanently `false`. Fixed by racing every permission request (location, notifications, file picker) against a 10-second `setTimeout` fallback in `usePermissions.ts`, guaranteeing each one always resolves. |
| **iOS Safari handling (unchanged)** | Notifications step is still skipped silently when the `Notification` API is unsupported (`isIOSSafari()` check), counted as satisfied for Continue-gating purposes. |
| **Backend / API contract** | Unchanged — still `PATCH /users/first-login-completed`. Per-permission grant/deny results are stored client-side in `localStorage` (`perm_location`, `perm_notifications`, `perm_files`), matching the design spec; no new DB columns added. |
| **In-app docs updated** | `about.tsx` changelog and `whats-new-modal.tsx` both updated to reflect v4.5.0. |

---

## 0. v4.4.0 — First-Login Permissions, 2FA & Single-Device Enforcement (July 15, 2026)

Audited the running app against a written security/UX feature spec covering three features. Found the backend, schema, and frontend for all three were already built in an earlier session; fixed the one real gap found during the audit (`security_logs` was defined but never written to). No new schema changes — all required columns/tables already existed and were already migrated.

| Change | Description |
|--------|-------------|
| **First-login permission overlay (verified, no code change)** | `FirstLoginOverlay.tsx` — fullscreen, non-skippable 2-step flow (notification permission, then a file/download-access acknowledgement) shown once per user, gated on `users.first_login_completed`; completes via `PATCH /users/first-login-completed`. |
| **Two-factor authentication (verified, no code change)** | `/api/auth/2fa/setup-totp`, `/verify-totp`, `/enable-otp`, `/verify-otp`, `/disable`, `/status` — TOTP via `otplib` + QR code via `qrcode`, email OTP alternative, 8 bcrypt-hashed single-use backup codes, TOTP secret encrypted at rest with AES-256-GCM. `TwoFactorSection.tsx` (enable/disable/QR/backup-code reveal) and `TwoFactorStep.tsx` (login-time code entry with backup-code fallback) already implemented. Login-time 2FA verification rate-limited to 5 attempts/15 min. |
| **Single-device login enforcement (verified, no code change)** | `device_sessions` table tracks device fingerprint/trust; new/unrecognized devices trigger a 2FA challenge on login; `finalizeLogin()` revokes every other active `user_sessions` row on each successful login, enforcing one active session per account; optional "trust this device for 30 days" skips the challenge on return visits. `DevicesSection.tsx` lists recognized devices with per-device and forget-all revoke actions. |
| **`security_logs` now actually written to (real fix)** | Added `securityLog(userId, event, success, ipAddress, deviceFingerprint?, details?)` in `lib/auth/utils.ts`, parallel to the existing `auditLog()`. Wired into every failed/successful login, device/2FA challenge issuance, 2FA code verification, and 2FA enable/disable path in `routes/auth/login.ts` and `routes/auth/2fa.ts`. Verified live — a wrong-password attempt now produces a `security_logs` row (`event: login.failed_password`, `success: false`). |

---

## 0. v4.3.2 — Optimization Audit & Measurements (July 14, 2026)

Follow-up to the v4.3.1 performance pass — turns earlier estimates into measured numbers and closes out the remaining audit items. No API contract changes.

| Change | Description |
|--------|-------------|
| **Load test (real numbers)** | Ran `loadtest.ts` at 50 connections / 20s against a logged-in session (previous script only ever ran at 20 connections and was never actually executed at scale). Results: `/api/dashboard` p50=143ms p95=345ms p99=476ms (302 req/s), `/api/admin/users-overview` p50=150ms p95=351ms (296 req/s), `/healthz` p50=45ms (1052 req/s) — 0 errors across all three at 50 concurrent connections. |
| **Missing DB indexes** | Schema audit found `users.mobile` and `services.category` were used in direct query filters/sorts with no index. Added `users_mobile_idx` and `services_category_idx` via `CREATE INDEX IF NOT EXISTS` (raw SQL, not `drizzle-kit push`, to avoid the known push-triggered data-loss risk in this project). All other flagged columns (`email_otps.email`, `settings.key`) already had adequate indexes from existing composite indexes / unique constraints — audit initially over-flagged these before the schema was checked directly. |
| **Other upload paths** | Audited every file/image upload route in the API server for the same raw-base64 issue the avatar fix addressed in v4.3.1. None found — profile pictures are the only user-uploaded images in the app; other binary paths (SQL backup import, generated PDF receipts) aren't images and don't need compression. |
| **Static asset caching / CDN** | Confirmed `artifacts/sahu-csc/scripts/serve.mjs` already sets `Cache-Control: public, max-age=31536000, immutable` on Vite's content-hashed JS/CSS/assets and `no-store` on the HTML shell/service worker — this is the caching behavior a CDN would rely on. A true CDN in front of the domain (e.g. Cloudflare) is a DNS/infrastructure decision, not a code change, so it was documented rather than implemented. |
| **Postgres read replica** | Investigated, not implemented. The DB layer connects via a single `pg` `Pool` with no read/write split logic, and setting up a replica requires provisioning a second database endpoint — an infrastructure decision outside what the codebase can self-provision. |

---

## 0. v4.3.1 — Performance Pass: Bundle Size & Avatar Compression (July 14, 2026)

Follow-up optimization pass after a codebase performance review. No API contract changes.

| Change | Description |
|--------|-------------|
| **Backend bundle size** | `dist/index.mjs` was 6.5MB — a single esbuild-bundled file that duplicated code already available as hoisted `node_modules` packages. Added `express`, `express-rate-limit`, `express-session`, `cors`, `helmet`, `hpp`, `cookie-parser`, `compression`, `zod`, `web-push`, `bcryptjs`, `ioredis`, `bullmq`, `rate-limit-redis` to `build.mjs`'s `external` array (pure-JS, no native bindings, already direct `package.json` dependencies so pnpm hoists them). Result: 6.5MB → 2.6MB (60% smaller). Deliberately left `drizzle-orm` and `@sentry/node` bundled — externalizing either would reopen known risk (drizzle-orm dual-peer TS-conflict bug, Sentry's un-hoisted transitive `@opentelemetry/*` deps) for a pass focused on quick wins. |
| **Avatar storage size** | `POST /profile/avatar` stored the uploaded image as a raw base64 data URL as-is (up to ~5MB), even though avatars only ever render as small thumbnails. Now resizes to 512×512 (`fit: cover`) and re-encodes as WebP (quality 80) via `sharp` before storing — shrinks typical phone-camera uploads dramatically and speeds up every profile fetch/render that includes the avatar. EXIF orientation is honored (`.rotate()`) before the metadata is stripped. Verified with a synthetic upload end-to-end (login → upload → confirm `image/webp` mime + reduced size → cleanup). |

---

## 0. v4.3.1 — Config & Maintenance Fixes (July 14, 2026)

Small config/maintenance bug-fix patch — three items from a maintenance audit (`BUGS.md`-derived config list). No user-visible features; no API contract changes.

| Change | Description |
|--------|-------------|
| **`/health` version hardcoded** | `routes/health.ts` returned a literal `version: "4.1.2"` string that had gone stale (app was already at 4.3.0). New `lib/version.ts` reads the version from `package.json` at runtime, the same way the frontend derives `__APP_VERSION__` from Vite's `define` at build time. |
| **Hardcoded personal email fallback** | `routes/health.ts` and `lib/push.ts` fell back to a hardcoded personal Gmail address when `VAPID_EMAIL` was unset. Replaced with a generic `mailto:support@example.com` placeholder — the real contact address is supplied via the `VAPID_EMAIL` env var (already set in shared env vars). |
| **`geoip-lite` database never updates** | `geoip-lite` ships a static MaxMind snapshot at install time with no refresh mechanism — IP→country data drifts stale within weeks, causing both false geo-blocks and false allows. Added `lib/geoip-updater.ts`: a weekly (`node-cron`, Sunday 03:00) job that runs the package's own `updatedb` script and hot-reloads the result via `geoip.reloadDataSync()` (no restart needed). Gated on an optional `MAXMIND_LICENSE_KEY` secret — skips with a warning if absent, so geo-blocking keeps working off the bundled snapshot either way. Added `src/types/geoip-lite.d.ts` (a minimal shim; the package ships no TypeScript types) to keep `tsc` clean. |

---

## 0. v4.3.0 — Security Hardening, Input Validation & Database Integrity (July 14, 2026)

Systematic bug-fix release covering six audited areas: data integrity, security, logic correctness, streaming robustness, input validation, and database schema. No new user-visible features; no API contract changes.

### Data Integrity

| Change | Description |
|--------|-------------|
| **Ledger POST transaction** | `POST /ledger` now runs balance update + receipt-counter increment + ledger insert + receipt-token write-back inside a single `db.transaction()`. Previously any mid-write failure (e.g. DB timeout) could leave a partial ledger row with a receipt number but no token, or update the balance without inserting the entry. `generateReceiptNumber()` accepts a `tx` parameter so it participates in the same transaction. |
| **AEPS ownership null-check** | `PATCH` and `DELETE` on `/api/aeps/transactions/:id` checked `if (session && session.createdBy !== userId)` — a null/missing `session` would silently pass the guard and allow any user to modify any transaction. Fixed to `if (!session \|\| session.createdBy !== userId)`. |
| **Worker job error propagation** | `pdf.worker.ts` and `sms.worker.ts` previously completed jobs silently on error (no-op). Changed to `throw new Error(...)` so failed jobs appear in the BullMQ dead-letter queue and can be retried or inspected. |

### Security

| Change | Description |
|--------|-------------|
| **`/api/geo` rate limit** | New `geoLimiter` (30 req/min) applied to `GET /api/geo` in `app.ts`. The endpoint was previously unlimited — unlike auth and ledger routes it had no rate-limiter at all. |
| **CORS startup guard** | `app.ts` now throws at startup if `CORS_ORIGIN` is unset in production. Previously it fell back silently to `http://localhost:5000`, which would pass every cross-origin request in production. |
| **Loopback bypass hardened** | Dev-mode rate-limiter skip compared `req.ip` (derived from X-Forwarded-For, spoofable behind a proxy with `trust proxy` set). Changed to `req.socket?.remoteAddress` (real TCP peer address, not forgeable). |
| **VAPID rotation env-write removed** | The VAPID rotation endpoint was writing `process.env.VAPID_PUBLIC_KEY = ...` / `process.env.VAPID_PRIVATE_KEY = ...` after rotation. These writes are per-process only and wrong in multi-instance deployments. Removed; `webPush.setVapidDetails()` is the correct and sufficient call. |

### Logic Fixes

| Change | Description |
|--------|-------------|
| **IST timezone for ledger summary** | `GET /ledger/summary` period boundaries (today, yesterday, week, month) were computed with `new Date().toISOString()` (UTC). UTC is up to 5h30m behind IST, so "today" on the backend could be yesterday in India for evening transactions. Added `IST_OFFSET_MS`, `nowInIST()`, and `istDateStr()` module-level helpers; all period calculations now use IST calendar dates. |
| **Configurable large-transaction threshold** | `POST /ledger` hardcoded `if (amount >= 10_000)` for the large-transaction notification trigger. Replaced with a `cached()` lookup from `settingsTable` key `largeTransactionThreshold` (30 s TTL, falls back to `10_000`). Operators can now configure the threshold from the admin settings panel without a deploy. |
| **Silent notification catch removed** | `notifyLargeTransaction(...).catch(() => {})` swallowed all failures invisibly. Replaced with `.catch((err) => logger.warn({ err, userId, amount, entryId }, "Large-transaction notification failed"))` so failures are grep-able in logs. |
| **Session maxAge aligned** | `express-session` default `maxAge` was 24 h in `app.ts` but `login.ts` sets 8 h for non-remember-me sessions via `req.session.cookie.maxAge`. Changed `app.ts` to 8 h with an inline comment linking both sites, so they stay in sync. |
| **Receipt export error / disconnect** | `archive.on("error")` in the bulk ZIP download now branches on `res.headersSent`: returns JSON 500 before streaming starts; calls `req.socket?.destroy(err)` after (prevents a silently-corrupt ZIP reaching the browser). A `clientDisconnected` flag set by `req.on("close")` aborts the PDF generation loop immediately when the client cancels the download. |

### Input Validation

| Change | Description |
|--------|-------------|
| **Zod schemas for receipt-export routes** | `routes/admin-receipt-export.ts` added three Zod schemas: `bulkExportQuerySchema` (count, ZIP, Excel endpoints) — `startDate`/`endDate` via `z.string().date()` (validates format **and** calendar value), `userId` coerced to positive int, `receiptNumbers` charset-validated, cross-field `startDate ≤ endDate` refine; `monthlyTriggerBodySchema` (POST trigger) — year `int().min(2000).max(2100)`, month `int().min(1).max(12)`; `monthlyDownloadQuerySchema` (GET download) — same year/month rules on query strings. All handlers do `safeParse` first and return 400 with the Zod error message on failure. |
| **Receipt token format validation** | `routes/receipts.ts` — both `/receipts/verify/:token` and `/receipts/verify/udhari/:token` previously guarded with `token.length < 16`. Any arbitrary string ≥ 16 chars would hit the database. Replaced with `isValidReceiptToken()` which requires either a UUID v4 pattern (`/^[0-9a-f]{8}-...-[0-9a-f]{12}$/i`) or a three-segment base64url JWT (`/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/`). Non-matching strings get a 400 immediately. |

### Frontend

| Change | Description |
|--------|-------------|
| **Ledger form reset on success** | `onSubmit` in `pages/ledger.tsx` now calls `form.reset({ date: today, customerName: "", ... })` after both the online-create and offline-save success paths. Previously stale field values persisted when the dialog was reopened for a new entry. |
| **Udhari AddCustomer reset on close** | `AddCustomerDialog` in `pages/udhari.tsx` adds `useEffect(() => { if (!open) setForm({...blank...}); }, [open])`. Covers the cancel/backdrop-dismiss path that had no reset — only the success path (which already called `setForm` inline) was previously cleaned up. |
| **Register form cleared before navigation** | `submitWithOtp` in `pages/register.tsx` calls `form.reset()`, clears `formValues` (which holds the raw password), and blanks `otpDigits` before `setLocation("/login")`. If the user navigates back, the form is empty. |
| **ShareTargetHandler stale closure** | `useEffect(fn, [])` in `App.tsx` referenced `setLocation` but excluded it from the dependency array. Added `setLocation` to the array — correct per exhaustive-deps; harmless with wouter's stable reference, but protects against a future wouter version returning a new reference per render. |

### Database Schema

| Change | Description |
|--------|-------------|
| **5 missing foreign keys** | Added via `ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY ... REFERENCES users(id)` (idempotent `DO $ IF NOT EXISTS $` block). All orphaned rows cleaned first (zero found on the seeded DB). |

| Table | Column | Strategy | Rationale |
|-------|--------|----------|-----------|
| `ledger` | `created_by` | `RESTRICT` | Financial records — cannot delete a user who has transaction history; deactivate instead |
| `audit_logs` | `user_id` | `CASCADE` | Secondary log — goes away with the user |
| `aeps_daily` | `created_by` | `RESTRICT` | Financial sessions — same rationale as ledger |
| `broadcast_logs` | `sent_by` | `RESTRICT` | Admin accountability record — kept even after account removal |
| `password_reset_tokens` | `user_id` | `CASCADE` | Ephemeral credential — meaningless without the user |

Tables already correct before this release (all with `onDelete: "cascade"`): `push_subscriptions`, `user_sessions`, `receipt_counters`, `user_notification_preferences`, `udhari_customers`, `udhari_entries`. `notifications.userId` is intentionally nullable (broadcasts to all users) — no FK.

---

## 0. Infra — Redis connected, rate-limiter fix & CORS update (July 14, 2026)

Operational setup changes after re-import; no application logic or API contract changed.

| Change | Description |
|--------|-------------|
| **Upstash Redis connected** | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and `REDIS_URL` added as Replit Secrets. `CACHE_BACKEND` env var set back to `redis`. All three servers confirmed healthy: API Server logs "Rate limiter: using shared Redis store", Worker Server logs all four BullMQ workers started. |
| **Rate-limiter Redis bridge fixed** | `app.ts` was supplying the `@upstash/redis` REST client to `rate-limit-redis`, which expects an ioredis-compatible `sendCommand(args: string[])` interface — the REST client has no such method, causing async init errors on all four rate limiters. Fixed by replacing the REST client with `ioredis` (already a dependency) pointed at `REDIS_URL`. The bridge now uses `client.call(args[0], ...args.slice(1))` which satisfies `rate-limit-redis`'s contract. |
| **CORS_ORIGIN updated** | Env var updated from the stale `pike.replit.dev` domain to the current `sisko.replit.dev` domain. Verified via `OPTIONS` preflight: API returns correct `Access-Control-Allow-Origin` header matching the preview URL. |
| **Docs updated** | `replit.md` first-time setup section expanded with full secrets table and a note to update `CORS_ORIGIN` after every re-import. `DOCS.md` env vars section updated with Redis and CORS sections. |

---

## 0. v4.2.0 — Running Balance, CDN Headers & Test Coverage (July 14, 2026)

Closes four remaining performance and quality gaps. No routes, UI behaviour, or external API contract changed.

| Change | Description |
|--------|-------------|
| **`users.ledger_balance` maintained column** | New `NUMERIC(15,2) NOT NULL DEFAULT 0` column on the `users` table (schema pushed via `drizzle-kit push`). `POST /ledger` now performs a single atomic `UPDATE users SET ledger_balance = ledger_balance + delta WHERE id = $userId RETURNING ledger_balance` (O(1), race-free) instead of the previous full-table `SUM(credit) - SUM(debit)` scan that grew with ledger history. `PATCH /ledger/:id` and `DELETE /ledger/:id` update the column inside the existing transaction alongside `recalculateBalances()`; `DELETE /ledger/all` resets it to 0. A startup backfill in `index.ts` corrects any users whose column is 0 but have existing entries (idempotent, skips already-correct rows). |
| **Dashboard O(1) balance** | `GET /api/dashboard` previously ran five `Promise.all` queries including an all-time `SUM()` scan for `currentBalance`. That aggregate is replaced by a `SELECT ledger_balance FROM users WHERE id = $userId` primary-key lookup — sub-millisecond on any dataset size. The four remaining queries (today/month totals, recent entries, service breakdown) are unchanged. |
| **`GET /api/ledger/balance` via JOIN** | Replaces a plain `SELECT SUM() FROM ledger` with a single `LEFT JOIN` against `users` — `balance` now comes from `users.ledger_balance` (authoritative maintained column) while `totalCredits` / `totalDebits` still come from the SUM (displayed in LedgerEntryForm stats). One round-trip, consistent source of truth. |
| **CDN-ready `Cache-Control` headers** | `/receipts/verify/:token` + `/receipts/verify/udhari/:token` → `public, max-age=60, stale-while-revalidate=300` (financial records; immutable after creation). `/healthz`, `/health`, `/setup-status` → `no-store` (live data that must never be served stale). Express weak ETags remain enabled globally on all other `res.json()` responses. |
| **28 new Vitest tests — 70 total** | `async-handler.test.ts` (6 cases): error forwarding to `next()`, type preservation, direct `next(err)` pass-through. `query-cache.test.ts` (8 cases): cache miss/hit, TTL expiry, falsy-value caching (`null`, `false`), prefix invalidation boundary checks. All 70 tests pass. |
| **PM2 multi-instance docs** | Workflow limit at 10/10; `MULTI_INSTANCE_SETUP.md` updated with a ready-to-paste foreground PM2 shell command for Replit (`--no-daemon`, explicit `PORT=8080`). |

---

## 0. v4.1.2 — Security & Type-Safety Hardening (July 13, 2026)

Closes the remaining open and partially-fixed issues from the v4.1.1 audit (C-2, H-2, M-5, M-9, M-10). No routes, UI, or data behavior changed.

| Change | Description |
|--------|-------------|
| **`asyncHandler` utility** | New `src/lib/async-handler.ts` — wraps an async Express callback so any rejected promise is forwarded to the Express error handler via `next(err)` instead of becoming an unhandled rejection that hangs the client or crashes the process. |
| **116 route handlers wrapped (C-2)** | All 32 route files (admin, auth, aeps, ledger, reports, notifications, settings, udhari, …) had their `async (req, res) =>` callbacks wrapped with `asyncHandler(...)`. Closes the critical gap where a DB error in an unwrapped handler sent no response and left the client hanging. |
| **Global `staleTime` default (H-2 / M-9)** | `QueryClient` in `App.tsx` already had `staleTime: 5 * 60_000` + `refetchOnWindowFocus: false` in `defaultOptions.queries` — confirmed applied to all 64 hooks, including `dashboard.tsx` and `layout.tsx`. All per-query staleTime settings are additive overrides only. |
| **`req.session as any` removed (M-10)** | `admin.ts` lines 168 & 225 cast `req.session as any` to access `userId`. Since `SessionData` is augmented in `middleware.ts`, both casts replaced with `req.session.userId` directly. |
| **`any[]` typed in `transactions.ts` (M-5)** | `sessionWhere: any[]` and `txWhere: any[]` in `aeps/transactions.ts` had their explicit `: any[]` annotations removed; TypeScript now infers the correct Drizzle SQL condition types from the initialiser, eliminating two of the remaining `any` cast sites. |

### asyncHandler pattern

```ts
// src/lib/async-handler.ts
export function asyncHandler(fn): RequestHandler {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Usage in every route file:
router.get("/path", requireAuth, asyncHandler(async (req, res) => {
  const data = await db.select()...;
  res.json(data);
}));
```

Any thrown error or rejected promise is now caught and passed to Express's global error middleware, which logs it and returns a structured `500` response instead of hanging the connection.

---

## 0. v4.1.1 — Worker Server — BullMQ Async Processing (July 13, 2026)

Isolates heavy background work (push notifications, email, PDF, SMS) into a dedicated `@workspace/worker-server` process so the main API can return responses immediately without waiting on SMTP or web-push delivery.

| Change | Description |
|--------|-------------|
| **`artifacts/worker-server/`** | New package — BullMQ worker process on port 8081. Four queues: `notifications`, `emails`, `pdf-generation` (stub), `sms` (stub). |
| **`notification.worker.ts`** | Consumes `notifications` queue; sends web-push to individual users or all subscribers using VAPID keys loaded from the settings table at startup. |
| **`email.worker.ts`** | Consumes `emails` queue; calls `nodemailer.sendMail()` with pre-rendered HTML/text. 3 retries, exponential backoff. |
| **`pdf.worker.ts`** | Stub — placeholder for future async PDF receipt generation via PDFKit. |
| **`sms.worker.ts`** | Stub — logs and completes; ready for MSG91/Twilio integration. |
| **`queue-client.ts`** | New `artifacts/api-server/src/lib/queue-client.ts` — produces BullMQ jobs when `REDIS_URL` is set; falls back to direct in-process execution when not. Zero API contract changes. |
| **Template builders** | `approval.ts`, `rejection.ts`, `otp.ts` — added `build*MailOptions()` (sync, pure HTML render) so api-server pre-renders emails before queuing. |
| **Routes updated** | `admin-appeals.ts`, `admin-registration.ts`, `broadcast.ts`, `auth/otp.ts` — push/email calls now go through `enqueueNotification()` / `enqueueEmail()`. |
| **`pm2.config.js`** | Root PM2 ecosystem config: `api-server` in cluster mode (max CPUs), `worker-server` in fork mode (1 instance). |
| **`Worker Server` workflow** | New Replit workflow (console, port 8081). Requires `REDIS_URL` secret (Upstash direct TCP URL — `rediss://...` — NOT the REST URL). |

### Activation
Set `REDIS_URL` secret → start **Worker Server** workflow → api-server logs `Queue client initialised (Redis-backed)`. Without `REDIS_URL` the api-server handles everything in-process as before.

---

## 0. v4.0.2 — Image & Loader Polish (July 13, 2026)

Completes all remaining Medium and Low priority items from the performance checklist. No routes, UI, or data behavior changed.

| Change | Description |
|--------|-------------|
| **`loading="lazy"` on remaining images** | Added to `layout.tsx` ×2 (desktop sidebar avatar + mobile header avatar) and `AppLogo` in `app-logo.tsx`. Splash screen, page-skeleton, and `LoginLogo` intentionally kept eager — they are first-paint-critical. |
| **`/admin/appeals` query limit** | `.limit(500)` added to `GET /admin/users/appeals` — the last unbounded list query on the medium-priority checklist. |
| **`sahu-logo-glow.png` deleted** | File had zero references in the codebase — not loaded on any page despite the issue saying it was. Removed from `public/`; 175 KB dropped from the build output. |
| **`EagerPreloader` upgraded to `requestIdleCallback`** | Replaced `setTimeout(3000)` with `requestIdleCallback(preload, { timeout: 5000 })` — chunk preloading now fires when the browser is genuinely idle rather than after a fixed 3s delay. On 2G/3G the browser stays busy longer, so `rIC` naturally waits; on a fast device it may fire sooner. Falls back to `setTimeout(3000)` on browsers without `requestIdleCallback` support (older Safari, iOS < 16). |

---

## 0. v4.0.1 — Redis Rate Limiting & Multi-Instance Readiness (July 13, 2026)

Completes multi-instance readiness: rate-limit counters are now shared across processes via Redis, so a client can no longer bypass per-IP limits by hitting different workers. No routes, UI, or data behavior changed.

| Change | Description |
|--------|-------------|
| **`rate-limit-redis` installed** | Added as a direct dependency of `@workspace/api-server`. |
| **4 rate limiters upgraded** | `general` (500/15 min), `login` (8/15 min), `auth-write` (10/15 min), `otp-verify` (8/15 min) — all now accept a `RedisStore` when `CACHE_BACKEND=redis` + Upstash secrets are present. Falls back to the default in-process `MemoryStore` when Redis is not configured, so local dev and single-instance deployments are unaffected. |
| **Redis key prefixes** | `rl:general:`, `rl:login:`, `rl:auth-write:`, `rl:otp-verify:` — namespaced so rate-limit counters never collide with query-cache or session-cache keys in the same Redis database. |
| **Startup log** | Server logs `"Rate limiter: using shared Redis store"` or `"…MemoryStore"` at boot so the active mode is immediately visible. |
| **`MULTI_INSTANCE_SETUP.md` added** | New guide documenting all 3 multi-instance options (PM2 cluster, Node cluster module, Replit Deployments scaling), readiness checklist, connection-pool tuning advice, and architecture diagram. |

---

## 0. v4.0.0 — Full-Stack Performance Audit (July 12, 2026)

Performance audit pass across the entire stack — database, API, frontend data layer, and image delivery. No routes, UI, or data behavior changed.

| Change | Description |
|--------|-------------|
| **6 new DB indexes** | `users_role_idx` + `users_status_idx` (admin user-list no longer full-scans); `aeps_tx_daily_id_idx` / `aeps_tx_type_idx` / `aeps_tx_created_at_idx` (AePS transaction queries gain index support); `push_subscriptions_user_id_idx` + `password_reset_tokens_user_id_idx` (notification broadcast and token lookup). All pushed live via `drizzle-kit push`. |
| **API caching expanded — 8 new endpoints** | Three new invalidation helpers added to `lib/query-cache.ts` (`invalidateAepsCaches`, `invalidateUdhariCaches`, `invalidateUserListCache`). Wrapped in `cached(key, 5_000, loader)` with immediate invalidation on every write: `GET /aeps/session` (key `aeps:session:{userId}:{date}`), `GET /aeps/transactions` (key `aeps:transactions:{userId}:{all-filters}`), `GET /admin/aeps-overview` (`admin:aeps-overview`), `GET /udhari/summary` (`udhari:summary:{userId}`), `GET /udhari/customers` (`udhari:customers:{userId}:{q}:{sort}`), `GET /udhari/customers/:id` (`udhari:customer:{id}`), `GET /udhari/customers/:id/entries` (`udhari:customer:{id}:entries`), `GET /users` (`admin:users`). Previously all hit the DB on every request. |
| **Async IndexedDB persister** | `createSyncStoragePersister` (blocking synchronous `sessionStorage` write on every React Query mutation) replaced with `createAsyncStoragePersister` backed by `idb-keyval` (IndexedDB). Main thread is no longer blocked after any mutation; `@tanstack/query-async-storage-persister` + `idb-keyval` added to `sahu-csc` dependencies. |
| **EagerPreloader deferred 3 s** | The post-login chunk preloader (`import("@/pages/dashboard")` etc.) now fires 3 seconds after login instead of immediately, so the first critical API calls (auth/me, dashboard stats) are not competing for bandwidth with preload requests. |
| **Unbounded query limits** | `GET /udhari/customers` and `GET /udhari/customers/:id/entries` both capped at `.limit(500)`. (`GET /users` was already `.limit(1000)`.) |
| **Lazy image loading** | `loading="lazy"` added to the logo on the About page and the icon on the Download App page. The splash-screen logo and the nav avatar remain eager (first-paint-critical). |

---

## 0. v3.5.10 — Navigation Performance — Instant Page Switching (July 12, 2026)

Pure frontend performance fix — no API routes, DB schema, or data behavior changed.

- **Removed `AnimatePresence mode="wait"`**: previously the outgoing page had to fully finish its 220 ms exit animation before the incoming page's mount even began, creating a mandatory ~440 ms black hole on every tab tap. With the default `"sync"` mode both animations run simultaneously, so the perceived switch delay drops to a single 150 ms fade.
- **`LiveClock` extracted as isolated `React.memo` component** (`layout.tsx`): the 1-second interval `setState` was living inside the main `Layout` function, causing the entire layout tree — header, nav, all children — to reconcile every second. The clock now self-contains its own state; only the `<span>` re-renders on each tick.
- **Removed `y`-translation from page transition**: the `y: 14 → 0` spring triggered a layout recalculation pass on every animation frame across the full page content area. Replaced with an opacity-only fade (`initial={{ opacity: 0 }}` / `animate={{ opacity: 1 }}`), which is GPU-composited and never touches layout.
- **Transition duration reduced 220 ms → 150 ms** via `scaleDuration(150)`: shorter duration further reduces the gap between tap and the new page being fully opaque; easing simplified to `"easeOut"`.

---
0. [v3.5.7 — Pluggable Cache Backend, Read-Replica Guidance & Load-Test Baseline (July 12, 2026)](#0-v357--pluggable-cache-backend-read-replica-guidance--load-test-baseline-july-12-2026)
0. [v3.5.6 — Documentation Consolidation, i18n Completion & CDN Setup Guide (July 11, 2026)](#0-v356--documentation-consolidation-i18n-completion--cdn-setup-guide-july-11-2026)
0. [v3.5.5 — Tests, Error Tracking & Bundle Audit (July 11, 2026)](#0-v355--tests-error-tracking--bundle-audit-july-11-2026)
0. [v3.5.4 — Ledger Page Modularization (July 11, 2026)](#0-v354--ledger-page-modularization-july-11-2026)
0. [v3.5.3 — Optimization Round 2: Query Caching, Load Testing & Safe Rate-Limiter Bypass (July 10, 2026)](#0-v353--optimization-round-2-query-caching-load-testing--safe-rate-limiter-bypass-july-10-2026)
0. [v3.5.2 — Asset & Delivery Hardening (July 10, 2026)](#0-v352--asset--delivery-hardening-july-10-2026)
0. [v3.5.1 — Performance & Scale Hardening (July 10, 2026)](#0-v351--performance--scale-hardening-july-10-2026)
0. [v3.5.0 — Backend File Split & Modularisation (July 10, 2026)](#0-v350--backend-file-split--modularisation-july-10-2026)
0. [v3.4.0 — Receipt Export Layout Refactor & TypeScript Hardening (July 10, 2026)](#1-v340--receipt-export-layout-refactor--typescript-hardening-july-10-2026)
1. [v3.3.1 — Re-import Setup & Bug Fixes (July 9, 2026)](#1-v331--re-import-setup--bug-fixes-july-9-2026)
1. [v3.3.0 — Email & Security Hardening (July 8, 2026)](#1-v330--email--security-hardening-july-8-2026)
2. [v3.2.4 – v3.2.5 — Security Upgrade & Password Policy Correction (July 6, 2026)](#2-v324--v325--security-upgrade--password-policy-correction-july-6-2026)
3. [v3.1.1 — Replit Environment Migration & TypeScript Clean (July 3, 2026)](#3-v311--replit-environment-migration--typescript-clean-july-3-2026)
4. [v3.1.0 — Backup & Restore Redesign + Download + Scheduler (June 30, 2026)](#4-v310--backup--restore-redesign--download--scheduler-june-30-2026)
5. [v3.0.0 — Setup Wizard, SMTP Integration & Auto-Import (June 30, 2026)](#5-v300--setup-wizard-smtp-integration--auto-import-june-30-2026)

---

## 0. v3.5.9 — Redis Cache Live, i18n Fixes & Build Hardening (July 12, 2026)

**Goal:** Activate Upstash Redis as the live cache backend, fix 5 missing i18n translation keys, harden the build pipeline against future Sentry/OpenTelemetry upgrade failures, and clean up stale workflow references.

| Change | Description |
|--------|-------------|
| **Redis cache activated** | `CACHE_BACKEND=redis` set in shared env. `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` added as Replit Secrets. Dashboard stats, session/role lookups, and report queries now persist in Upstash Redis across server restarts and are shared across any future additional instances. The Redis backend already existed (`lib/cache/redisBackend.ts`) — this change flips the switch. Fails open: any Redis error is logged as a warning and treated as a cache miss rather than a 500. Load test result with warm Redis: dashboard p50 98 ms / p95 197 ms / 182 req/s, admin overview p50 66 ms / p95 193 ms / 266 req/s, 0 errors at 20 concurrent connections. |
| **5 missing i18n keys** | Added to all 3 locales (en/hi/or): `common.platform` ("Management Platform" / "प्रबंधन प्लेटफ़ॉर्म" / "ପରିଚାଳନା ମଞ୍ଚ") used in register-closed and register-pending pages; `udhari.customer.settled`, `udhari.customer.edit_entry`, `udhari.customer.desc_gave`, `udhari.customer.desc_got` used in the Udhari customer page. A script-based key audit confirmed these were the only missing keys across all pages and components. |
| **Sentry/OTel upgrade guard** | Added `'@opentelemetry/api': ^1.9.1` to the `overrides` block in `pnpm-workspace.yaml` — forces a single version across the entire workspace, preventing `@sentry/node` upgrades from creating a second drizzle-orm peer-resolution variant. Added `checkDrizzlePeerSingleton()` to `build.mjs` (runs before every build): reads `pnpm-lock.yaml`, scans only the `snapshots:` section for `drizzle-orm@` entries, exits with a clear fix guide if more than one variant is found. The check correctly ignores the bare entry in the `packages:` section, which is metadata and not a variant. |
| **Build API workflow removed** | Permanently removed stale references to the non-existent "Build API" workflow: updated the `dev` script echo in `artifacts/api-server/package.json` to reference `Build Production` instead, and updated the `replit.md` note to say the workflow is permanently gone. The `API Server` workflow already runs `pnpm run build` before starting — a standalone "Build API" workflow was always redundant. |

---

## 0. v3.5.8 — Reports & Receipt Export Page Modularization (July 12, 2026)

**Goal:** Split the two remaining large frontend pages (`reports.tsx` at 1301 lines and `receipt-export.tsx` at 1219 lines) into focused modules following the project's established page-split pattern. No behavior, route, API call, `data-testid`, or visual output changed.

| Change | Description |
|--------|-------------|
| **`pages/reports.tsx` split** | Reduced from 1301 lines to a thin orchestrator. Extracted: `hooks/useReports.ts` — filter constants (`DATE_PRESETS`, `SERVICE_OPTIONS`), formatters (`fmtCurrency`, `fmtMonth`), `useFilterState` (all date/service/tab filter state + URL-sync), `useReportsData` (all React Query calls for daily/monthly/service-wise data + derived `summaryCards`, `chartData`, `serviceRows`). `components/reports/ReportSummaryCards.tsx` — `MobileStatCard`, `DesktopStatCard`, `Sparkline`, `KpiChip`, `SectionLabel`, `EmptyState`. `components/reports/ReportChart.tsx` — `ChartTooltip`. `components/reports/ReportFilters.tsx` — `MobileReportFilters`, `DesktopReportFilters`. |
| **`pages/receipt-export.tsx` split** | Reduced from 1219 lines to a thin orchestrator. Extracted: `components/receipt-export/types.ts` — shared interfaces (`PreviewEntry`, `CountResult`, `FullReceiptEntry`, `BusinessInfo`, `ModalAction`, `MobileTab`, `UserOverview`), constants (`NAVY`, `SAFFRON`, `MONTH_OPTIONS`), pure formatters (`fmtDate`, `fmtDateShort`). `hooks/useReceiptExport.ts` — all state (selections, filters, modal, preview list, tabs), `buildParams()` (single source of query param construction shared by all three bulk-export endpoints), all handlers including `/bulk-export/count` (count preview), `/bulk-export/download` (PDF ZIP), `/bulk-export/excel` (XLSX), and the two monthly export calls. `components/receipt-export/ExportFilters.tsx` — `DesktopExportFilters`, `MobileExportFilterToggle`, `MobileExportFilterPanel`, `MobileByDatePanel`. `components/receipt-export/ReceiptPreviewList.tsx` — `DesktopReceiptTable`, `DesktopReceiptExpandedPreview`, `MobileReceiptList`, local `Checkbox` helper. |
| **`Checkbox` placement** | `Checkbox` (CheckSquare/Square icon toggle) lives in `ReceiptPreviewList.tsx` — the only file that uses it — not in `types.ts`, keeping `types.ts` a plain `.ts` file with no JSX. |
| **Zero behavior change** | No routes, API calls, `data-testid`s, or visual output changed. All three bulk-export endpoint calls (`/count`, `/download`, `/excel`) use the same `buildParams()` helper in `useReceiptExport.ts` — verified query param construction is byte-for-byte identical to the original. |
| **Verified** | `tsc --noEmit` clean on all three workspace projects; app renders correctly with no browser console errors post-split. |

---

## 0. v3.5.7 — Pluggable Cache Backend, Read-Replica Guidance & Load-Test Baseline (July 12, 2026)

**Goal:** Scale-readiness groundwork (explicitly not urgent at current usage) — a swappable cache backend, corrected read-replica guidance, and a re-measured load test at realistic concurrency. No route, API, or visual behavior changed; default (memory) behavior is unchanged.

| Change | Description |
|--------|-------------|
| **Pluggable cache backend** | New `lib/cache/{types,backend,memoryBackend,redisBackend}.ts`. `lib/query-cache.ts` and `lib/auth/sessionCache.ts` now delegate to a `CacheBackend` selected via `CACHE_BACKEND` (`memory` default — same per-namespace `Map` logic as before; `redis` opt-in via `@upstash/redis`, needs `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`, fails open on Redis errors). Session/role cache methods became `async`; every call site (`middleware.ts` and 6 route files) updated to `await` them — same timing and outputs, only the signatures changed. |
| **drizzle-orm dual-peer bug, again** | Adding `@upstash/redis` to only `api-server` recreated the same class of bug as the earlier `@opentelemetry/api` case: drizzle-orm 0.45.2 lists `@upstash/redis` as an optional peer, so pnpm resolved a second drizzle-orm variant and TS types conflicted across unrelated files (`notificationService.ts`, `receiptExportService.ts`, etc.). Fixed by adding `@upstash/redis` to `lib/db` too. |
| **Read-replica guidance corrected & documented** | The originating scale-readiness prompt assumed Neon/read-replica support already existed; corrected — this app runs on Replit's built-in Postgres, which has no read-replica option today (unchanged from v3.5.3's note). Documented, for if/when that changes, which queries are safe to route to a replica (dashboard, reports, admin overview, receipt verification) vs. which must stay on the primary (ledger writes, auth/session, user role/status changes) — see `architectureV3.md` §5.6 and `replit.md`. |
| **Load test re-run at higher concurrency** | 50/100/200 connections, read-heavy and write-heavy mixes, disposable seeded data (not production data). Findings recorded in `LOADTEST_FINDINGS.md`. No architecture changes made based on the results in this pass — that's future work if/when it's needed. |
| **Zero behavior change** | Default `CACHE_BACKEND=memory` is byte-for-byte the same cache logic as before. Verified with `tsc --build` (clean across all three workspace projects) and the existing 42-test Vitest suite (all passing, including the auth-session middleware tests whose mocks continued to work unmodified since `await` on a synchronous mock return value resolves immediately). |

---

## 0. v3.5.6 — Documentation Consolidation, i18n Completion & CDN Setup Guide (July 11, 2026)

Docs-only + one missing translation key — no route, API, or visual behavior changed.

| Change | Description |
|--------|-------------|
| **Doc consolidation** | 9 parallel `.md` files reduced to 4 canonical + pointers: `CHANGELOG_V3.md` (this file, v3.x changelog), `architectureV3.md` (architecture/build), `replit.md` (Replit setup/workflows), `DOCS.md` (API/module reference). `BUILD.md`, `WORKFLOWS.md`, `ReplitV3.md` are now short pointer stubs. `CHANGELOG.md` trimmed to its unique content — the pre-v3 (v1.x/v2.x) feature archive — with the duplicate v3.x summary removed. |
| **Found & fixed the exact drift this task was meant to prevent** | The About page's changelog already had a `v3.5.5` entry ("Tests, Error Tracking & Bundle Audit" — Vitest suite, Sentry, ErrorBoundary) that was never added to this file. Backfilled it below as v3.5.5 so the two stay in sync going forward. |
| **Stale credentials fixed** | Literal `admin123`/`operator123` in `architectureV3.md`, `CHANGELOG.md`, `CHANGELOG_V3.md`, `ReplitV3.md` replaced with the correct "value of `ADMIN_PASSWORD`/`OPERATOR_PASSWORD` secret" — actual passwords have come from Replit Secrets since the v3.1.1 Replit migration, but several docs still showed the old literal defaults. |
| **i18n: 1 missing key filled** | `nav.admin` (used in `layout.tsx`) existed in `en/translation.json` but was missing from both `hi/translation.json` and `or/translation.json` — added ("एडमिन" / "ଆଡମିନ"). Full audit confirmed this was the *only* gap across all 793 keys in all three locales; no other pages/keys needed translation. |
| **CDN setup documented** | New `CDN_SETUP.md` — Cloudflare reverse-proxy setup guide for the existing single-origin VM deployment. Documentation only, not provisioned (requires external DNS/account access outside the codebase); confirms existing `serve.mjs` cache headers should be passed through, not overridden. |

---

## 0. v3.5.5 — Tests, Error Tracking & Bundle Audit (July 11, 2026)

| Change | Description |
|--------|-------------|
| **42 automated Vitest tests** | `artifacts/api-server/src/__tests__/`: `auth-session.test.ts` (25 tests — `requireAuth`/`requirePermission`/`requireRole`, lockout, session duration), `ledger-balance.test.ts` (9 tests — running-balance math), `receipt-numbering.test.ts` (8 tests — `CSC-YYYY-NNNN` generation). Run via `vitest.config.ts`. |
| **Sentry APM (opt-in, no-op by default)** | `@sentry/node` wired server-side (`app.ts`), `@sentry/react` wired client-side (`main.tsx`) — both no-op when `SENTRY_DSN` / `VITE_SENTRY_DSN` env vars are absent, so nothing changes for deployments that don't set them. No PII is sent. |
| **React ErrorBoundary** | `components/error-boundary.tsx` wraps the whole app in `App.tsx` — an unexpected render crash now shows a branded recovery screen instead of a blank white page. |
| **Bundle audit** | Confirmed `recharts` (420 KB), `jsPDF` (386 KB), `html2canvas` (201 KB) are already separate lazy-loaded chunks (not in the main bundle); main JS chunk is 438 KB, under Vite's 500 KB warning threshold. |

---

## 0. v3.5.4 — Ledger Page Modularization (July 11, 2026)

**Goal:** Split the oversized `pages/ledger.tsx` (1652 lines) into focused modules without changing any behavior, following the project's page-split pattern.

| Change | Description |
|--------|-------------|
| **`hooks/useLedger.ts` extracted** | All React Query data hooks/mutations (`useListLedgerEntries`, `useCreateLedgerEntry`, `useUpdateLedgerEntry`, `useDeleteLedgerEntry`, `useGetBalance`, `useListServices`, `useGetSettings`), the `EntryForm` type, `SERVICE_COLOR_MAP`/`getServiceColor`, `groupByDate`/`fmtDateGroup`, and derived data (customer suggestions, frequent customers, filtered receipt entries). |
| **`components/ledger/LedgerFilters.tsx` extracted** | `MobileSearchBar`, `MobileFrequentCustomers`, `DesktopSearchFilterBar`, `DesktopFilterPanel`, `MobileFilterPanel`. |
| **`components/ledger/LedgerEntryForm.tsx` extracted** | `MobileEntryFormDialog` and `DesktopEntryFormPanel`, sharing a common props interface. The balance-preview calculation ("Balance after this entry") is preserved exactly — it's a client-side estimate only; actual balances are always computed server-side and returned per-entry. |
| **`components/ledger/LedgerTable.tsx` extracted** | `TableTabsHeader`, `PendingSyncBanners`, `DesktopReceiptsPanel`, `DesktopTransactionsTable` (including inline-edit row logic), `TableFooterPagination`, `MobileReceiptsList`, `MobileTransactionsList`, `MobilePagination`. |
| **`pages/ledger.tsx` reduced to a thin orchestrator** | ~600 lines (from 1652). Holds page-level state, handlers (`openCreate`, `openEdit`, `saveInlineEdit`, `saveQuickAdd`, `onSubmit`, `confirmDelete`, `clearFilters`), and layout wiring only. Default export and import path unchanged. |
| **Zero behavior change** | No routes, API calls, `data-testid`s, or visual output changed. Verified with `tsc --noEmit` (clean on all three workspace projects) and an authenticated curl smoke test: login → create ledger entry → balance/list reflect it → delete removes it and resets balance. |

---

## 0. v3.5.3 — Optimization Round 2: Query Caching, Load Testing & Safe Rate-Limiter Bypass (July 10, 2026)

**Goal:** Push past the v3.5.1 performance baseline with query-level caching, a lightweight APM surrogate, and actual measured load-test numbers instead of estimates.

| Change | Description |
|--------|-------------|
| **Process-local TTL query cache** | New `lib/query-cache.ts` — plain `Map`-based 5s TTL cache (not Redis; single-process app) in front of `GET /api/dashboard`, `GET /api/admin/users-overview`, `GET /api/reports/daily`, `GET /api/reports/monthly`. Keys are user+date scoped for the per-user endpoints, global for the admin-only overview. Invalidated synchronously via `invalidateLedgerCaches()` on every ledger create/update/delete — never relies on TTL alone for correctness after a write. |
| **Lightweight APM surrogate** | `app.ts`'s `pinoHttp` now computes `customLogLevel` so requests over `SLOW_REQUEST_MS` (default 500ms, env-overridable) log at `warn` with a `slowRequest: true` prop, without adding a full tracing agent. |
| **Real load testing** | New `pnpm --filter @workspace/api-server run loadtest` script (`autocannon`) exercises `/api/dashboard`, `/api/admin/users-overview`, `/healthz`. Measured on this container, 20 concurrent connections for 8s, 0 errors: dashboard p50 47ms / p95 272ms / p99 362ms at ~278 req/s; admin overview p50 46ms / p95 251ms / p99 298ms at ~284 req/s; healthz p50 16ms / p95 32ms at ~1133 req/s. |
| **Rate-limiter loopback skip, safely scoped** | The general `express-rate-limit` (500/15min) now skips loopback IPs (127.0.0.1/::1) so the load-test tool can generate real concurrent traffic without tripping it — but only when `NODE_ENV !== "production"`. Since `trust proxy` is on, `req.ip` is derived from `X-Forwarded-For`, which is attacker-spoofable; gating the whole skip branch on non-production removes the bypass code path entirely once deployed, rather than trusting the IP check alone. |
| **CDN / read replicas — explicitly not done** | Both flagged as follow-ups rather than claimed complete. Static assets already have correct cache headers (see v3.5.2) but no edge/CDN layer sits in front of them; adding one is an infra choice, not an app-code change. Read replicas would require an external Postgres provider — Replit's built-in Postgres doesn't expose one. |

---

## 0. v3.5.2 — Asset & Delivery Hardening (July 10, 2026)

**Goal:** Close out the remaining items from a performance/security review — CSP, session overhead on health checks, image weight, and production cache correctness.

| Change | Description |
|--------|-------------|
| **CSP enabled** | `app.ts`'s `helmet()` call now sets `contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } }` instead of `false`. The API only ever returns JSON, so this has no functional impact and closes an otherwise-open header. |
| **Health checks skip session store** | `healthRouter` and `setupStatusRouter` moved out of `routes/index.ts` and mounted directly in `app.ts`, *before* `express-session`. They still run after `cors`/`helmet`/rate-limiting, but no longer pay the `connect-pg-simple` Postgres round-trip on every uptime-monitor or setup-status poll. |
| **`vite-plugin-image-optimizer` added** | New devDependency (with `sharp` + `svgo`) in `sahu-csc`'s `vite.config.ts`, quality 80 for png/jpeg/jpg/webp, `multipass` for svg. Runs on every production build against both bundled and `public/`-folder assets. |
| **One-off static image compression** | `public/sahu-logo-glow.png` 1.6MB → 144KB, `public/og-image.png`, `public/opengraph.jpg`, `public/logo.jpg.jpg` also shrunk via a one-time `sharp` pass before the plugin was wired in. |
| **`scripts/serve.mjs` replaces `sirv-cli`** | `sirv-cli`'s `--maxage`/`--immutable` flags apply uniformly to every served file, including `index.html` via SPA fallback — meaning a browser/CDN could cache the HTML shell for a year and miss new deploys. The new script uses the `sirv` package directly with a `setHeaders` callback that classifies responses by the *request* pathname (since sirv always passes that, not the fallback file, to `setHeaders`): extensionless paths (client routes), `/`, `.html`, and `sw.js`/`sw.mjs` get `no-store`; hashed build assets get `max-age=31536000, immutable`; everything else gets a short `max-age=300`. `sirv-cli` removed from dependencies. |
| **Package versions synced** | `sahu-csc` (was `3.4.0`) and `api-server` (was `3.5.0`) both bumped to `3.5.2` to match the platform-wide version going forward. |

---

## 0. v3.5.1 — Performance & Scale Hardening (July 10, 2026)

**Goal:** Fix N+1 query patterns, batch bulk writes, tune the DB pool, and cut a DB round-trip off the hot auth path.

| Change | Description |
|--------|-------------|
| **N+1 query fixes** | `GET /admin/users-overview` replaced N×2 per-user queries with one grouped aggregate query (credits/debits/transaction counts via `sum`/`count` + `groupBy`) and one `DISTINCT ON` query for each user's latest entry, joined in-memory via `Map`. |
| **Batched ledger balance recalc** | `recalculateBalances()` in `ledger.ts` uses a single `UPDATE ... FROM UNNEST(...)` with bound array parameters instead of one `UPDATE` per row. |
| **Batched notification writes** | `notificationService.ts` fetches all recipients' preferences in one query and performs a single multi-row insert instead of N per-user inserts/selects. |
| **Settings routes batched** | `backups.ts`, `smtp.ts`, `vapid.ts` each replaced a per-key `SELECT` + `INSERT`/`UPDATE` loop against the `settings` table with a single multi-row `INSERT ... ON CONFLICT DO UPDATE` upsert. |
| **API bundle externalized further** | `exceljs` added to `build.mjs`'s `external` list alongside `pdfkit`/`archiver` — bundle dropped from 5.1MB → 3.6MB. All three remain real `dependencies` so they resolve at runtime. |
| **pg pool tuned** | `lib/db/src/index.ts`: `max: 20` (env-overridable via `DB_POOL_MAX`), `idleTimeoutMillis: 30s`, `connectionTimeoutMillis: 5s`. |
| **Lightweight session/role cache** | New `lib/auth/sessionCache.ts` — 5s in-process TTL cache backing `requireAuth`'s session validation and `requireRole`/`requirePermission`'s role lookups. Explicitly invalidated on session revoke, logout, role/status change, and password change/reset. |
| **Password reset/change now revokes sessions** | Both reset-password flows revoke all sessions for the account; self-service profile password change revokes all other sessions. |

---

## 0. v3.5.0 — Backend File Split & Modularisation (July 10, 2026)

**Goal:** All backend source files over ~300 lines split into focused sub-modules, using the barrel pattern so zero import sites were changed.

### Splits performed

#### `routes/password-reset.ts` (424 lines) → `routes/auth/`
| New file | Responsibility |
|----------|---------------|
| `auth/otp.ts` | `POST /auth/send-otp`, `POST /auth/verify-otp` (email OTP + legacy admin OTP mode) |
| `auth/forgot-password.ts` | `POST /auth/forgot-password` (legacy admin-generated OTP flow) |
| `auth/reset-password.ts` | `POST /auth/reset-password` (new token mode + legacy identifier+OTP mode) |

`routes/auth/index.ts` updated to mount all three. `routes/password-reset.ts` replaced with an empty stub router (backward-compat import guard).

#### `routes/aeps.ts` (403 lines) → `routes/aeps/`
| New file | Responsibility |
|----------|---------------|
| `aeps/sessions.ts` | `GET/POST /aeps/session`, `GET /admin/aeps-overview` |
| `aeps/transactions.ts` | `GET/POST/PATCH/DELETE /aeps/transaction(s)`, `GET /receipts/verify/aeps/:token` |

`routes/aeps.ts` overwritten as barrel re-export → `routes/aeps/index.ts`.

#### `routes/udhari.ts` (400 lines) → `routes/udhari/`
| New file | Responsibility |
|----------|---------------|
| `udhari/customers.ts` | Customer CRUD + `GET /udhari/summary` + `recalcBalance` helper |
| `udhari/entries.ts` | Entry CRUD per customer (gave/got) |

`routes/udhari.ts` overwritten as barrel re-export → `routes/udhari/index.ts`.

#### `lib/monthly-export.ts` (395 lines) → `lib/monthly-export/`
| New file | Responsibility |
|----------|---------------|
| `monthly-export/pdf.ts` | `generateReceiptPdf()` — PDFKit A4 receipt renderer |
| `monthly-export/zip.ts` | `buildMonthlyZip()` — queries DB, generates PDFs, bundles ZIP |
| `monthly-export/email.ts` | `sendMonthlyExportEmail()` — sends ZIP to admin emails |
| `monthly-export/scheduler.ts` | `scheduleMonthlyExport()` — node-cron job (1st of month, 00:05) |

`lib/monthly-export.ts` overwritten as barrel re-export.

#### `routes/reports.ts` (327 lines) → dashboard extracted
- `/dashboard` handler moved to new `routes/dashboard.ts`
- `getServiceBreakdownData` and `getAepsData` now exported from `reports.ts` so `dashboard.ts` can import them
- `dashboard.ts` registered in `routes/index.ts`

#### `routes/admin-registration.ts` (321 lines) → appeals extracted
- Appeals routes (`GET /admin/users/appeals`, `PATCH re-approve`, `PATCH dismiss-appeal`, `POST dismiss-all`) moved to new `routes/admin-appeals.ts`
- `admin-registration.ts` now only handles registration settings + pending user approve/reject
- `admin-appeals.ts` registered in `routes/index.ts`

### Convention enforced
- **Barrel pattern** — original filename overwritten as re-export so all external import sites remain unchanged
- **No circular imports** — sub-modules import from `../../lib/auth` etc., never from each other's parents

---

## 1. v3.4.0 — Receipt Export Layout Refactor & TypeScript Hardening (July 10, 2026)

### Receipt Export Page — Full Layout Refactor (`receipt-export.tsx`)

The page previously built its own duplicate navy header, desktop stat-strip header, and mobile bottom nav bar — reproducing the app's shared layout chrome from scratch inside the page file.

**What changed:**
- Removed all custom header/nav markup (desktop navy header + stat band, mobile navy top bar, mobile 4-tab fixed bottom nav at `/receipt-export`)
- Added `import { Layout }` from `@/components/layout` — now uses the same sidebar, top header, and mobile bottom nav as every other page
- Added `import { useIsMobile }` from `@/hooks/use-mobile` — branches rendering at 768px breakpoint
- Removed `import { useLocation }` from `wouter` (was only used for back-button navigation in the now-removed custom headers)

**Desktop layout (≥768px):**
4-column KPI stat bar → filter row (date presets + operator dropdown) → two-column body: receipt table with checkboxes on the left, export panel + receipt preview card + monthly auto-export on the right.

**Mobile layout (<768px):**
KPI mini-strip → horizontal pill tab row (Receipts / By Date / Summary / Export) positioned at top of content area — no conflict with the global fixed bottom nav. Expandable filter sheet on the Receipts tab, full single-receipt preview overlay, sticky export CTA on the Export tab.

**No functional changes:** All state, handlers, data fetching, `ReceiptModal`, and export logic are unchanged.

### TypeScript Hardening

- Added `UserOverview` interface typed from the `GET /api/admin/users-overview` response shape (`userId`, `username`, `fullName`, `role`, `isActive`, `balance`, `totalCredits`, `totalDebits`, `totalTransactions`)
- Replaced `useQuery<any[]>` + `.map((u: any) => ...)` with fully-typed `useQuery<UserOverview[]>` and inferred map callbacks

---

## 1. v3.3.1 — Re-import Setup & Bug Fixes (July 9, 2026)

### Bug Fixes

- **`lib/vapid.ts` — persistence flag:** `VAPID_KEYS_FROM_ENV=true` now set when loading keys from the settings table, so `/api/healthz` no longer reports `ephemeral/degraded` after first boot
- **`lib/vapid.ts` — keypair atomicity:** Partial keypair detection (only one key in DB) deletes both and regenerates together — prevents mismatched public/private pair from silently breaking push subscriptions
- **`lib/push.ts` — base64 strip:** `initPush()` strips trailing `=` padding and whitespace from VAPID keys before `webPush.setVapidDetails()` — copy-paste artifact from secrets form no longer crashes the server
- **`lib/sanitize.ts`:** `xss.IFilterXSSOptions` → named import `IFilterXSSOptions` — resolved TypeScript TS2833 error; typecheck now passes with 0 errors
- **`sahu-csc/package.json`:** Production `sirv` serve path corrected from `dist/` to `dist/public/` (Vite's actual output directory)

### Workflow & Environment

- **Duplicate workflow eliminated:** `artifacts/api-server: API Server` (auto-generated by Replit from artifact registration) overridden in `.replit` with a no-op stub — no more port 8080 conflict
- **API Server workflow** simplified to direct `node --enable-source-maps artifacts/api-server/dist/index.mjs` launch
- **Missing workflows restored:** `Build API`, `Typecheck`, `Build Production`, `Production Preview`
- **postMerge timeout** increased from 20 s → 180 s
- **All secrets fully configured:** `SESSION_SECRET`, `ADMIN_PASSWORD`, `OPERATOR_PASSWORD`, `SMTP_PASS`, `VAPID_PRIVATE_KEY` as Replit Secrets; `VAPID_PUBLIC_KEY` as shared env var
- **Health:** `GET /api/healthz` → `status: ok`, `vapid.persistent: true`; `GET /api/setup-status` → `configured: true, missing: []`

---

## 1. v3.3.0 — Email & Security Hardening (July 8, 2026)

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
| `docs/archive/changelogV2.md` | ✅ V3 header added | Cross-reference to CHANGELOG_V3.md |
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
| Default accounts | ✅ Seeded (admin / operator, passwords from `ADMIN_PASSWORD` / `OPERATOR_PASSWORD` secrets) |
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
