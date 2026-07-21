# SAHU CSC — Architecture Reference
**Version 4.9.0 — July 20, 2026**

> This is the single authoritative reference for the SAHU CSC platform architecture.  
> It supersedes `docs/archive/architectureV2.md` and `docs/archive/ARCHITECTURE.md`.  
> For per-feature change history: `CHANGELOG.md` (v3/v4 current · v1/v2 archive at bottom) · `docs/archive/changelogV2.md` (v2 detail)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Monorepo Layout](#2-monorepo-layout)
3. [Runtime & Tech Stack](#3-runtime--tech-stack)
4. [Database Schema — 15 Tables](#4-database-schema--15-tables)
5. [Backend — Express API Server](#5-backend--express-api-server)
6. [Frontend — React SPA](#6-frontend--react-spa)
7. [3-Tier Data Architecture](#7-3-tier-data-architecture)
8. [PWA & Offline Architecture](#8-pwa--offline-architecture)
9. [Android TWA](#9-android-twa)
10. [Security Model](#10-security-model)
11. [Business Modules](#11-business-modules)
12. [i18n — Internationalisation](#12-i18n--internationalisation)
13. [Setup Wizard (V3)](#13-setup-wizard-v3)
14. [Automatic Import Setup](#14-automatic-import-setup)
15. [Environment & Secrets](#15-environment--secrets)
16. [Key Architecture Decisions](#16-key-architecture-decisions)

---

## 1. Overview

**SAHU CSC** is a full-stack business management platform for Common Service Centers (CSC) in rural Odisha, India. It runs as a React SPA frontend + Express API backend, backed by PostgreSQL, delivered as a PWA installable on Android/iOS/desktop with optional TWA packaging for Google Play.

### Core capabilities

| Domain | Features |
|--------|---------|
| **Ledger** | Per-user income/expense ledger · running balance · `CSC-YYYY-NNNN` receipts · QR public verification · offline queue |
| **AePS** | Daily cash float (Aadhaar Enabled Payment System) · opening balance · withdrawal/deposit |
| **Udhari Khata** | Customer credit ledger — "You Gave / You Got" · WhatsApp reminder · PDF statement |
| **Reports** | Daily / Monthly / AePS / Service breakdown · Excel export · Command Center mobile + desktop design |
| **Auth** | Session-based · V2 multi-device · OTP password reset · account locking · idle auto-logout · 2FA (email OTP + TOTP with QR code) |
| **Admin — Users** | Create/edit/delete · Pending registrations (bulk approve/reject) · email notifications |
| **Admin — Oversight** | Cross-user balance/ledger/AePS · audit trail |
| **Admin — Broadcast** | Push + email blast to all users · broadcast history log |
| **Profile** | Unified Profile+Settings (v2.3) · Personal Info · Security · Sessions · Preferences · Business Info |
| **PWA** | Installable · offline-first · VAPID push notifications · Android TWA |
| **i18n** | English / Hindi / Odia — all 25 pages fully translated |
| **Setup Wizard** | Admin-only banner for missing secrets · `/api/setup-status` public endpoint |

### Default credentials (seeded)

| Username | Password | Role |
|----------|----------|------|
| `admin` | value of `ADMIN_PASSWORD` secret | admin |
| `operator` | value of `OPERATOR_PASSWORD` secret | operator |

Credentials are never hardcoded — the seed script (`artifacts/api-server/src/scripts/seed.ts`) reads them from the `ADMIN_PASSWORD` / `OPERATOR_PASSWORD` Replit Secrets and fails loudly if either is missing.

---

## 2. Monorepo Layout

```
workspace/
├── artifacts/
│   ├── api-server/              # @workspace/api-server v4.1.2 — Express 5 (port 8080)
│   │   ├── src/
│   │   │   ├── app.ts           # Express app, middleware, connect-pg-simple session
│   │   │   ├── index.ts         # HTTP server entry point
│   │   │   ├── routes/
│   │   │   │   ├── index.ts                # Router composition
│   │   │   │   ├── setup-status.ts         # GET /api/setup-status (public, registered first)
│   │   │   │   ├── health.ts               # GET /api/healthz
│   │   │   │   ├── auth/                   # Auth sub-module (barrel: auth.ts → auth/index.ts)
│   │   │   │   │   ├── index.ts            # Mounts register/login/session/appeal/otp/forgot/reset/2fa/devices
│   │   │   │   │   ├── otp.ts              # POST /auth/send-otp, POST /auth/verify-otp
│   │   │   │   │   ├── forgot-password.ts  # POST /auth/forgot-password (legacy admin OTP)
│   │   │   │   │   ├── reset-password.ts   # POST /auth/reset-password (token + legacy OTP)
│   │   │   │   │   ├── 2fa.ts              # 2FA orchestrator: mounts sub-routers + POST /auth/2fa/disable, GET /auth/2fa/status
│   │   │   │   │   ├── 2fa-totp.ts         # POST setup-totp, setup-totp-pending; GET totp-qr, totp-code, totp-code-pending; exports replay helpers + buildQrData
│   │   │   │   │   ├── 2fa-backup.ts       # POST verify-totp (TOTP + backup-code), POST regenerate-backup-codes; exports generateBackupCodes/hashBackupCodes/tryConsumeBackupCode
│   │   │   │   │   └── 2fa-otp.ts          # POST switch-method, POST enable-otp, POST verify-otp
│   │   │   │   ├── password-reset.ts       # STUB — routes moved to auth/; empty router
│   │   │   │   ├── dashboard.ts            # GET /dashboard (extracted from reports.ts)
│   │   │   │   ├── sessions.ts             # V2 session list + revoke
│   │   │   │   ├── ledger.ts               # Ledger CRUD + balance/summary
│   │   │   │   ├── aeps.ts                 # BARREL → aeps/ sub-module
│   │   │   │   ├── aeps/                   # AePS sub-module
│   │   │   │   │   ├── sessions.ts         # GET/POST /aeps/session, GET /admin/aeps-overview
│   │   │   │   │   └── transactions.ts     # Transaction CRUD + public receipt verify
│   │   │   │   ├── services.ts             # Service catalog CRUD
│   │   │   │   ├── users.ts                # User management (admin)
│   │   │   │   ├── admin.ts                # Cross-user oversight endpoints
│   │   │   │   ├── admin-sessions.ts       # Admin session revocation
│   │   │   │   ├── admin-registration.ts   # Pending user approve/reject + registration settings
│   │   │   │   ├── admin-appeals.ts        # Appeals: GET/re-approve/dismiss-appeal/dismiss-all
│   │   │   │   ├── admin-receipt-export.ts # Bulk receipt export
│   │   │   │   ├── profile.ts              # Own profile + avatar
│   │   │   │   ├── preferences.ts          # Per-user UI preferences
│   │   │   │   ├── notifications.ts        # Notification inbox
│   │   │   │   ├── reports.ts              # Reports + Excel export (exports getServiceBreakdownData/getAepsData)
│   │   │   │   ├── audit.ts                # Audit log viewer (admin)
│   │   │   │   ├── settings.ts             # Global settings + backups
│   │   │   │   ├── push.ts                 # VAPID push subscription CRUD
│   │   │   │   ├── udhari.ts               # BARREL → udhari/ sub-module
│   │   │   │   ├── udhari/                 # Udhari Khata sub-module
│   │   │   │   │   ├── customers.ts        # Customer CRUD + summary + recalcBalance
│   │   │   │   │   └── entries.ts          # Entry CRUD (gave/got) per customer
│   │   │   │   ├── receipts.ts             # Public receipt verify (no auth)
│   │   │   │   └── broadcast.ts            # Admin push + email broadcast
│   │   │   └── lib/
│   │   │       ├── auth/                   # Auth lib sub-module (barrel: auth.ts)
│   │   │       │   ├── utils.ts            # hashPassword · getClientIp · parseDevice · auditLog
│   │   │       │   └── middleware.ts       # requireAuth · requireRole · requirePermission · ROLE_PERMISSIONS
│   │   │       ├── auth.ts                 # BARREL → auth/
│   │   │       ├── monthly-export/         # Monthly export sub-module (barrel: monthly-export.ts)
│   │   │       │   ├── pdf.ts              # generateReceiptPdf (PDFKit A4 renderer)
│   │   │       │   ├── zip.ts              # buildMonthlyZip (DB → PDFs → ZIP)
│   │   │       │   ├── email.ts            # sendMonthlyExportEmail (ZIP → admin emails)
│   │   │       │   └── scheduler.ts        # scheduleMonthlyExport (node-cron 1st of month)
│   │   │       ├── monthly-export.ts       # BARREL → monthly-export/
│   │   │       ├── notify.ts               # createNotification helper
│   │   │       ├── logger.ts               # Pino structured logger
│   │   │       ├── mailer.ts               # Nodemailer: sendOtpEmail · sendApprovalEmail · sendBroadcastEmail · isSmtpConfigured
│   │   │       ├── push.ts                 # web-push: sendPushToUser · sendPushToAll
│   │   │       ├── vapid.ts                # VAPID key auto-generation + env detection
│   │   │       ├── otp-cleanup.ts          # Hourly job: prunes expired OTP rows
│   │   │       ├── async-handler.ts        # asyncHandler(fn) — wraps async route handlers to forward rejections to next()
│   │   │       └── queue-client.ts         # enqueueNotification/enqueueEmail — BullMQ when REDIS_URL set, direct fallback otherwise
│   │   ├── build.mjs              # esbuild bundler (connect-pg-simple MUST be in external)
│   │   └── scripts/
│   │       ├── seed.ts            # DB seeder (users, services, settings, notifications)
│   │       ├── backup.ts          # pg_dump to /backups/
│   │       └── restore.ts         # psql restore from backup file
│   │
│   ├── worker-server/           # @workspace/worker-server v4.1.1 — BullMQ background processor (port 8081)
│   │   ├── src/
│   │   │   ├── index.ts         # HTTP server entry; starts all workers
│   │   │   ├── connection.ts    # Shared ioredis ConnectionOptions
│   │   │   └── workers/
│   │   │       ├── notification.worker.ts  # web-push jobs
│   │   │       ├── email.worker.ts         # nodemailer jobs
│   │   │       ├── pdf.worker.ts           # PDF generation (stub)
│   │   │       └── sms.worker.ts           # SMS (stub)
│   │   └── build.mjs
│   │
│   ├── sahu-csc/                # @workspace/sahu-csc v4.1.2 — React + Vite (port 5000)
│   │   ├── index.html
│   │   ├── vite.config.ts       # port from PORT env · VitePWA + Workbox · proxy /api → 8080
│   │   ├── public/
│   │   │   ├── sahu-logo.png
│   │   │   ├── apple-touch-icon.png
│   │   │   ├── pwa-{96,144,192,512}x{96,144,192,512}.png
│   │   │   └── .well-known/assetlinks.json   # Digital Asset Links for TWA
│   │   └── src/
│   │       ├── App.tsx          # 69 ln thin root — GeoGate + provider tree + Router mount
│   │       ├── providers/
│   │       │   ├── QueryProvider.tsx   # 69 ln — queryClient (exported), persister, PersistQueryClientProvider
│   │       │   └── AuthProvider.tsx    # 153 ln — AppAuthProvider wraps HookAuthProvider + BadgeUpdater
│   │       │   #     + EagerPreloader + SessionManager + FirstLoginGate + SyncBadge
│   │       ├── components/
│   │       │   ├── Router.tsx          # 96 ln — all lazy imports + 30 <Route> definitions + ShareTargetHandler
│   │       │   ├── ProtectedRoute.tsx  # 33 ln — auth guard; redirects to /login; renders 403 for adminOnly
│   │       │   ├── LoadingScreen.tsx   # 168 ln — branded full-screen loading with phase-aware spinner/rings
│   │       │   └── AuthFade.tsx        # 15 ln — enter-only opacity fade for public auth pages
│   │       ├── main.tsx         # createRoot + registerSW + syncEngine.init()
│   │       ├── pages/           # 25 pages — all fully translated
│   │       │   ├── login.tsx               # Mobile: navy header + white card + "Register here" CTA
│   │       │   ├── register.tsx            # Thin orchestrator (~89 lines): status check, mobile/desktop layout wiring
│   │       │   ├── forgot-password.tsx     # 4-step merged: identifier → OTP → new pw → success
│   │       │   ├── reset-password.tsx      # Token-based reset (legacy, merged into forgot-password)
│   │       │   ├── dashboard.tsx           # 13 ln thin orchestrator — mobile/desktop branch
│   │       │   │   # components/dashboard/: MobileDashboard (96), DesktopDashboard (95),
│   │       │   │   #   DashboardStatCards (128, MobileStatCards+DesktopStatCards), DashboardWeeklyBar (60),
│   │       │   │   #   DashboardRecentActivity (91), DashboardQuickActions (55), UdhariSummaryCard (49)
│   │       │   ├── ledger.tsx              # Transactions · offline queue · desktop split form
│   │       │   │   # components/ledger/: LedgerTable (125 barrel), LedgerRow (166 — tabs header,
│   │       │   │   #   sync banners, DesktopLedgerRow, MobileLedgerCard), LedgerRowEdit (79 —
│   │       │   │   #   DesktopLedgerRowEdit), LedgerRowActions (38 — shared icon buttons),
│   │       │   │   #   LedgerReceiptsPanel (86 — DesktopReceiptsPanel),
│   │       │   │   #   LedgerMobileReceipts (74 — MobileReceiptsList),
│   │       │   │   #   LedgerPagination (99 — TableFooterPagination + MobilePagination),
│   │       │   │   #   LedgerEmptyState (25 — DesktopLedgerEmptyState)
│   │       │   ├── aeps.tsx                # AePS daily session · withdrawal/deposit · desktop split
│   │       │   │   # pages/aeps/DailyTab.tsx (87 ln orchestrator) — hook: hooks/useDailyTab.ts (249)
│   │       │   │   #   components/aeps/daily/: DailyTabEntryRow (68), DailyTabSummaryCard (43),
│   │       │   │   #     DailyTabEntryList (68), DailyTabForm (112)
│   │       │   │   # components/aeps/AepsDepositForm.tsx (204 ln thin orchestrator) — desktop 3-step panel; assembles:
│   │       │   │   #   hooks/useAepsDeposit.ts          (43 ln) — all derived values + validation flags
│   │       │   │   #   aeps/DepositLeftPanel.tsx         (83 ln) — gradient info panel (branding, session stats, security badge)
│   │       │   │   #   aeps/DepositAmountField.tsx       (41 ln) — amount hero input + quick-denomination chips
│   │       │   │   #   aeps/DepositCustomerFields.tsx    (81 ln) — customer autocomplete + Aadhaar input + digit progress bar
│   │       │   │   #   aeps/DepositSummaryRow.tsx        (65 ln) — confirm-step summary card (amount hero + detail rows + caution)
│   │       │   │   #   aeps/DepositSuccessStep.tsx       (64 ln) — success panel (checkmark, recorded summary, New/Done buttons)
│   │       │   ├── udhari.tsx              # Udhari customer list · search/sort · To Collect/To Pay
│   │       │   ├── udhari-customer.tsx     # Per-customer ledger · WhatsApp · PDF · desktop split
│   │       │   │   # components/udhari-receipt-modal.tsx (239 ln thin orchestrator) — Dialog shell, all state/handlers/derived values; assembles:
│   │       │   │   #   receipt/UdhariReceiptDetails.tsx  (129 ln) — colored header, receipt-info row, amount hero, detail rows, QR block
│   │       │   │   #   receipt/UdhariReceiptFooter.tsx    (48 ln) — business contact (name/address/phone/website) + footer bar
│   │       │   │   #   receipt/UdhariReceiptActions.tsx   (48 ln) — Print/PDF/WhatsApp/Share action panel; WhatsAppIcon SVG lives here
│   │       │   │   # components/aeps-receipt-modal.tsx   (206 ln thin orchestrator) — Dialog shell, all state/handlers/derived values; assembles:
│   │       │   │   #   receipt/AepsReceiptDetails.tsx    (116 ln) — gradient header, receipt-info row, amount hero, detail rows, QR block
│   │       │   │   #   receipt/AepsReceiptFooter.tsx      (55 ln) — business contact (name/address/phone/website) + AePS footer bar
│   │       │   │   #   receipt/AepsReceiptActions.tsx     (50 ln) — Print/PDF/WhatsApp/Share action panel; WhatsAppIcon SVG lives here
│   │       │   ├── services.tsx            # Service catalog
│   │       │   ├── reports.tsx             # Command Center: thin page; delegates to DesktopReports / MobileReports
│   │       │   │   # components/reports/:
│   │       │   │   #   DesktopReports.tsx      (~50 ln thin orchestrator) — assembles sub-components below
│   │       │   │   #   ReportDatePicker.tsx    (79 ln) — DESKTOP_TABS + brand nav bar + DesktopReportFilters
│   │       │   │   #   IncomeExpenseChart.tsx  (132 ln) — DailyTabPanel + MonthlyTabPanel (charts, tables, AePS summary)
│   │       │   │   #   MonthlyBreakdownTable.tsx (66 ln) — AepsTabPanel + ServicesTabPanel (day-wise + service tables)
│   │       │   │   #   ReportSummaryCards.tsx  (193 ln) — KpiChip, DesktopStatCard, MobileStatCard, DesktopKpiStrip, EmptyState, Sparkline
│   │       │   │   #   useDesktopPrint.ts      (187 ln) — A4 print-window generator hook (all 4 tabs)
│   │       │   │   #   ReportsSummaryCards.tsx, ReportsFilters.tsx, ReportChart.tsx — barrel re-exports
│   │       │   │   #   ReportFilters.tsx       (154 ln) — MobileReportFilters + DesktopReportFilters
│   │       │   │   #   ReportsChart.tsx        (295 ln) — DailyCashflowChart, MonthlyRevenueChart, AepsBarChart, etc.
│   │       │   │   #   ReportsTable.tsx        (190 ln) — ServicesUsedTable, MonthlySummaryCard, AepsDayWiseTable, etc.
│   │       │   │   #   MobileReports.tsx       (289 ln) — mobile layout; uses ReportFilters + ReportsChart + MobileStatCard
│   │       │   │   #   hooks/useReports.ts     (74 ln)  — useFilterState, useReportsData, FilterState, fmt, formatINR, MONTHS
│   │       │   ├── notifications.tsx       # Notification inbox
│   │       │   ├── profile.tsx             # Unified Profile+Settings — thin orchestrator (~82 lines)
│   │       │   ├── preferences.tsx         # Standalone: language + theme + dashboard layout
│   │       │   ├── users.tsx               # User management (admin) — 6 tabs (120 ln thin orchestrator)
│   │       │   │   # components/users/:
│   │       │   │   #   UserTable.tsx       (131 ln thin orchestrator) — loading/empty states, pending delegation, bulk bar, mobile + desktop shells; assembles:
│   │       │   │   #     UserRow.tsx         (91 ln) — UserRowMobile (mobile card) + UserRowDesktop (desktop <tr>); both use badge + action sub-components below
│   │       │   │   #     UserRoleBadge.tsx   (13 ln) — colored role span (admin/operator/user) via ROLE_COLORS
│   │       │   │   #     UserStatusBadge.tsx (13 ln) — Active/Inactive badge
│   │       │   │   #     UserActionMenu.tsx  (66 ln) — Link2/KeyRound/Pencil/Trash2 icon buttons; mobile prop for h-8/h-7 sizing
│   │       │   │   #   UserTablePending (182), UserFormDialog (104),
│   │       │   │   #   UserFormDesktop (192), UserBulkActions, UserFilters, UserTabBar, UserPageDialogs,
│   │       │   │   #   AppealsTab, AdminSessionsTab, AepsOverviewTab, CashOverviewTab, + dialog components
│   │       │   │   # hooks/: useUsersPage, useUserActions (228), useResetLinkActions (53), useUsers
│   │       │   ├── users-overview.tsx      # Admin cross-user balance summary
│   │       │   ├── audit-logs.tsx          # Full audit trail (admin)
│   │       │   ├── settings.tsx            # Redirects to /profile (deprecated)
│   │       │   ├── backups.tsx             # Backup and restore (admin)
│   │       │   ├── sessions.tsx            # Standalone multi-device sessions page
│   │       │   ├── pwa-status.tsx          # App & Offline Status
│   │       │   ├── server-health.tsx       # Live API/DB/VAPID health check
│   │       │   ├── broadcast.tsx           # Admin broadcast center — thin page (~129 lines); logic in components/broadcast/
│   │       │   ├── receipt-export.tsx      # Bulk receipt export — thin orchestrator (~45 lines); logic in components/receipt-export/
│   │       │   ├── download-app.tsx        # PWA install guide (Android/iOS/Desktop/Web)
│   │       │   ├── receipts-verify.tsx     # Public receipt verification (no auth)
│   │       │   ├── about.tsx               # Docs & system requirements, changelog
│   │       │   ├── offline.tsx             # Offline fallback
│   │       │   └── not-found.tsx           # 404
│   │       ├── components/
│   │       │   ├── layout.tsx               # Sidebar + mobile nav + banners + idle timeout
│   │       │   ├── setup-wizard-banner.tsx  # Admin-only first-run banner (V3 new)
│   │       │   ├── sync-status-bar.tsx      # 🟢/🟡/🔴 global sync status
│   │       │   ├── pwa-install-banner.tsx   # PWA install prompt
│   │       │   ├── app-logo.tsx             # AppLogo (sidebar) + LoginLogo (auth); uses sahu-logo.png
│   │       │   ├── receipt-modal.tsx        # Receipt modal — thin orchestrator (~137 ln); assembles:
│   │       │   │   # receipt/ReceiptHeader.tsx          (52 ln) — navy gradient header + receipt-number/date row
│   │       │   │   # receipt/ReceiptLineItems.tsx        (77 ln) — amount hero + verification badge + detail-rows card
│   │       │   │   # receipt/ReceiptQrCode.tsx           (79 ln) — QR verify block + business contact + footer
│   │       │   │   # receipt/ReceiptDownloadButton.tsx  (243 ln) — generatePdfBlob, all handlers (print/PDF/WA/share), auto-action useEffect, 4-button action panel
│   │       │   ├── skeletons/               # Loading-skeleton library — split from skeletons.tsx (432 ln)
│   │       │   │   ├── Pulse.tsx            #   Internal helper: animated bg-slate-100 pulse div
│   │       │   │   ├── shared.tsx           #   Misc skeletons: Notifications, Services, Prefs, Sessions, AdminSessions, UsersOverview, Backup×2, Profile×2, AuditLogs (217 ln)
│   │       │   │   └── index.ts             #   Barrel — re-exports all symbols; "@/components/skeletons" resolves here
│   │       │   │   # Feature-colocated skeleton files (each imported by index.ts):
│   │       │   │   # ledger/LedgerSkeleton.tsx     (36 ln) — LedgerSkeleton, LedgerBalanceSkeleton
│   │       │   │   # aeps/AepsSkeleton.tsx          (40 ln) — AepsSkeleton
│   │       │   │   # udhari/UdhariSkeleton.tsx      (62 ln) — UdhariListSkeleton, UdhariSummarySkeleton, UdhariCustomerHeaderSkeleton
│   │       │   │   # reports/ReportsSkeleton.tsx    (24 ln) — ReportsSkeleton
│   │       │   │   # dashboard/DashboardSkeleton.tsx (54 ln) — DashboardServicesSkeleton, DashboardStatsSkeleton, RecentTxSkeleton
│   │       │   ├── language-switcher.tsx    # EN / हि / ଓ toggle
│   │       │   ├── theme-provider.tsx
│   │       │   ├── auth/                    # Auth sub-components (login + register)
│   │       │   │   ├── loginTypes.ts        # Shared: RESEND_COOLDOWN, OTP_RATE_LIMIT, apiPost, PWD_RULES, LoginFormValues
│   │       │   │   ├── registerTypes.ts     # Register: schema, RegisterFormValues, maskEmail, useTwoFaDisabled
│   │       │   │   ├── PasswordStrength.tsx # Animated strength bar + per-rule checklist
│   │       │   │   ├── RegisterPersonalForm.tsx   # username + fullName + email + mobile fields
│   │       │   │   ├── RegisterCredentialsForm.tsx # password + confirm + error + submit button
│   │       │   │   ├── RegisterStepIndicator.tsx   # OTP step 2 header (shield icon + masked email)
│   │       │   │   ├── RegisterOtpStep.tsx         # OTP digit grid + submit + resend countdown
│   │       │   │   ├── RegisterMobileLayout.tsx    # Navy header + slide-up white card (mobile)
│   │       │   │   ├── RegisterDesktopLayout.tsx   # Hero panel + form card split (desktop)
│   │       │   │   ├── RegisterForm.tsx            # All form state, timers, API calls (~235 lines)
│   │       │   │   ├── LoginForm.tsx        # Barrel re-export for login sub-components
│   │       │   │   ├── LoginCredentialsStep.tsx    # Thin orchestrator (~112 lines); assembles sub-components below
│   │       │   │   │   ├── UsernameField.tsx        # Identifier input (mobile/username/email)
│   │       │   │   │   ├── PasswordField.tsx        # Password input + show/hide toggle
│   │       │   │   │   ├── RememberMeRow.tsx        # Remember-me checkbox + forgot-password link
│   │       │   │   │   ├── RejectedPanel.tsx        # Registration-declined panel + WhatsApp/email appeal buttons
│   │       │   │   │   ├── PendingApprovalPanel.tsx # Awaiting-admin-approval panel
│   │       │   │   │   ├── LockoutPanel.tsx         # Account-locked countdown panel (draining progress bar)
│   │       │   │   │   └── AttemptCounter.tsx       # Failed-attempt dots + security/lockout-warning badge
│   │       │   │   ├── BiometricPrompt.tsx          # WebAuthn fingerprint/Face ID (ready; not yet wired into form)
│   │       │   │   ├── TwoFactorStep.tsx (114 ln thin orchestrator) — backup-codes screen, header, AnimatePresence; assembles:
│   │       │   │   │   ├── twofa/useTwoFactorStep.ts  (152 ln) — all state, refs, timers, handlers (choose, resend, submit, backup-codes, goBack, toggles, clipboard)
│   │       │   │   │   ├── twofa/MethodPicker.tsx     (64 ln)  — Email OTP vs Authenticator App choice cards + error + back-to-login
│   │       │   │   │   ├── twofa/OtpEntry.tsx         (83 ln)  — 6-digit OTP input, resend countdown, trust-device, verify, backup-code toggle
│   │       │   │   │   └── twofa/TotpEntry.tsx        (133 ln) — QR enrollment panel + manual-entry fallback, enrolled hint, 6-digit input, verify, backup-code toggle
│   │       │   │   ├── OtpRateLimitPanel.tsx       # Shared OTP rate-limit countdown panel
│   │       │   │   ├── OtpRequestForm.tsx / OtpVerifyForm.tsx
│   │       │   │   ├── ForgotPasswordPanel.tsx (221 ln thin orchestrator) — all state, timers, handlers; assembles:
│   │       │   │   │   ├── forgot/ForgotStepHeader.tsx   (47 ln) — back-to-login link + 3-dot step progress indicator
│   │       │   │   │   ├── forgot/StepRequestOtp.tsx     (66 ln) — identifier input + Send OTP button (step 1)
│   │       │   │   │   ├── forgot/StepVerifyOtp.tsx     (104 ln) — 6-digit OTP grid + paste + resend timer + rate-limit fallback (step 2)
│   │       │   │   │   └── forgot/StepNewPassword.tsx    (82 ln) — new password + strength rules + confirm + match indicator (step 3)
│   │       │   │   ├── AuthHero.tsx                # Desktop hero split for login
│   │       │   │   ├── TotpLiveCode.tsx            # SVG countdown ring + live TOTP digits
│   │       │   │   └── useLockoutCountdown.ts
│   │       │   ├── PermissionCard/          # First-login permission onboarding modal
│   │       │   │   ├── PermissionCard.tsx   # 2-step modal; step 1 = intro, step 2 = auto-requests + auto-finish
│   │       │   │   ├── PermissionRow.tsx    # Per-permission row with live status badge
│   │       │   │   ├── usePermissions.ts    # requestLocation / requestNotifications / requestFileManager hooks
│   │       │   │   └── index.ts             # Barrel export
│   │       │   ├── receipt-export/          # Receipt export page sub-components
│   │       │   │   ├── types.ts                 # Brand tokens (NAVY/SAFFRON), shared interfaces (PreviewEntry, CountResult, FullReceiptEntry, BusinessInfo, UserOverview), formatters (fmtDate, fmtDateShort)
│   │       │   │   ├── ExportFilters.tsx        # Barrel → DesktopExportFilters + MobileExportFilters
│   │       │   │   │   ├── DesktopExportFilters.tsx   (71 ln) — inline filter bar (date range, quick-range pills, operator select, Preview button)
│   │       │   │   │   └── MobileExportFilters.tsx   (140 ln) — MobileExportFilterToggle (search + toggle btn) · MobileExportFilterPanel (collapsible) · MobileByDatePanel (by-date tab)
│   │       │   │   ├── ReceiptMonthlyPanel.tsx  # Monthly auto-export card (month/year picker, Download + Email Admins buttons)
│   │       │   │   ├── ReceiptExportStats.tsx   # DesktopStatBar (4 KPI cards) · MobileKpiStrip (3 chips) · MobileSummaryCards
│   │       │   │   ├── ReceiptExportActions.tsx # Barrel → DesktopBulkBar + DesktopExportOptionsCard + MobileExportTab
│   │       │   │   │   ├── DesktopBulkBar.tsx          (39 ln) — selected-count + total + clear + download ZIP button
│   │       │   │   │   ├── DesktopExportOptionsCard.tsx (90 ln) — format toggle (PDF/Excel), scope radios, include checkboxes, export CTA
│   │       │   │   │   └── MobileExportTab.tsx         (110 ln) — scope summary, format cards, scope radios, monthly panel, download CTA
│   │       │   │   ├── DesktopReceiptTable.tsx  # Sortable table with checkbox + search + action buttons
│   │       │   │   ├── DesktopReceiptExpandedPreview.tsx # Right-sidebar receipt mini-preview card
│   │       │   │   ├── MobileReceiptList.tsx    # Swipeable receipt cards + bulk bar
│   │       │   │   ├── MobileReceiptPreview.tsx # Full-screen receipt detail overlay + Print/PDF/Share/WhatsApp
│   │       │   │   ├── DesktopExportLayout.tsx  # Full desktop layout orchestrator (uses ReceiptExportState)
│   │       │   │   ├── MobileExportLayout.tsx   # Full mobile layout + tab switcher (uses ReceiptExportState)
│   │       │   │   └── ReceiptPreviewList.tsx   # Barrel re-export → DesktopReceiptTable, DesktopReceiptExpandedPreview, MobileReceiptList
│   │       │   ├── broadcast/               # Broadcast page sub-components
│   │       │   │   ├── broadcastTypes.ts        # Shared interfaces (BroadcastStats, BroadcastLogEntry, HistoryResponse), constants (NOTIF_TYPES, NOTIF_PRIORITIES, BASE), Tab type
│   │       │   │   ├── useBroadcast.ts          # All state + queries + mutations (push/email/inapp/history)
│   │       │   │   ├── BroadcastStatsBar.tsx    # Subscriber/active-user stat cards + loading skeleton
│   │       │   │   ├── BroadcastPushForm.tsx    # Push notification compose card
│   │       │   │   ├── BroadcastEmailForm.tsx   # Email blast card + SMTP warning banner
│   │       │   │   ├── BroadcastInAppForm.tsx   # In-app notification card (type + priority pickers)
│   │       │   │   ├── BroadcastHistoryTable.tsx # Paginated broadcast log with ChannelBadge + expand/collapse
│   │       │   │   └── BroadcastPreviewCard.tsx  # Tips card shown below each compose tab
│   │       │   ├── profile/                 # Profile page sub-components
│   │       │   │   ├── ProfileSessionDialogs.tsx   # AlertDialogs: revoke-one / logout-others / logout-everywhere
│   │       │   │   ├── ProfileDesktopLayout.tsx    # Desktop two-column grid + all CmdCards
│   │       │   │   └── ProfileMobileLayout.tsx     # Mobile nav list + drill-in sections
│   │       │   └── ui/                      # shadcn/ui components
│   │       ├── hooks/
│   │       │   ├── backupTypes.ts           # Shared types (TableInfo, ImportStep, ScheduleConfig), constants (DAYS, DEFAULT_SCHEDULE), formatters (formatSize, relativeTime, parseBackupMeta)
│   │       │   ├── useBackups.ts            # Barrel + composite hook — re-exports sub-hooks + types; useBackups() spreads all three below
│   │       │   │   ├── useBackupList.ts     (87 ln) — list/create/delete backups; deleteId dialog state; totalSize + chartData derived values
│   │       │   │   ├── useBackupSchedule.ts (61 ln) — fetch/save schedule config; toggleDay; nextRunLabel derived value
│   │       │   │   └── useBackupRestore.ts (140 ln) — restore-from-record dialog + handler; full import workflow (analyze → select tables → selective-import → reset)
│   │       │   ├── use-auth.tsx             # AuthContext + offline session cache (IndexedDB)
│   │       │   ├── use-network-status.ts    # Online/offline/slow + 30s latency probe
│   │       │   ├── use-pwa.ts               # Install prompt · badge · periodic sync · share · wake lock
│   │       │   ├── use-sync.ts              # Sync queue state
│   │       │   ├── use-push-notifications.ts# Push subscribe/unsubscribe
│   │       │   ├── use-idle-timer.ts        # Auto-logout 30 min; 2-min warning
│   │       │   ├── use-device.tsx           # Device type detection
│   │       │   ├── use-wake-lock.ts         # Screen Wake Lock API
│   │       │   ├── use-file-handler.ts      # File Handler API
│   │       │   ├── use-mobile.tsx           # Mobile breakpoint hook
│   │       │   └── use-toast.ts             # Toast hook
│   │       ├── locales/
│   │       │   ├── en/translation.json      # English (~860 keys)
│   │       │   ├── hi/translation.json      # Hindi
│   │       │   └── or/translation.json      # Odia
│   │       └── lib/
│   │           ├── i18n.ts         # i18next init; reads localStorage "sahu-lang"
│   │           ├── offline-db/     # IndexedDB v2 wrapper — split into focused modules
│   │           │   ├── schema.ts  #   Types + DB constants + openDB() singleton (115 ln)
│   │           │   ├── queue.ts   #   Write queues: pending ledger, actions, notifications (174 ln)
│   │           │   ├── sync.ts    #   Read/write caches: KV cache, session, reports, storage stats (184 ln)
│   │           │   └── index.ts   #   Barrel — all symbols re-exported; "@/lib/offline-db" resolves here
│   │           ├── sync-engine.ts  # Offline queue processor; auto-syncs on window.online
│   │           ├── pwa-badge.ts    # App Badge API updater
│   │           └── utils.ts
│   │
│   └── mockup-sandbox/          # Canvas component preview server (port 8081)
│
├── lib/
│   ├── db/                      # @workspace/db — Drizzle ORM + PostgreSQL pool
│   │   └── src/schema/          # One .ts file per table
│   ├── api-spec/                # @workspace/api-spec — openapi.yaml (source of truth)
│   ├── api-client-react/        # @workspace/api-client-react — Orval-generated hooks (do not edit)
│   │   └── src/
│   │       ├── token-refresh.ts  # Base-URL + auth-token config; URL resolution helpers
│   │       ├── retry.ts          # ApiError + ResponseParseError classes; error-message helpers
│   │       ├── request-logger.ts # Media-type detection; response body deserialisation pipeline
│   │       ├── custom-fetch.ts   # Thin orchestrator: CustomFetchOptions type + customFetch(); re-exports all public symbols
│   │       ├── index.ts          # Package entry point
│   │       └── generated/        # Orval-generated React Query hooks (do not edit manually)
│   └── api-zod/                 # @workspace/api-zod — Zod schemas
│
├── infrastructure/
│   ├── pwa/manifest.json        # Full PWA manifest reference
│   └── twa/twa-config.json      # Android TWA config v3.0.0
│
├── scripts/
│   └── post-merge.sh            # Auto-runs pnpm install + drizzle-kit push on import
│
└── docs/
    └── archive/                 # Pre-v3 historical changelogs and architecture docs
```

---

## 3. Runtime & Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Runtime | Node.js 20, TypeScript 5.9 | |
| Frontend | React 19, Vite 7, Tailwind CSS v4, shadcn/ui | |
| Theme | Navy `#0b2c60` + Saffron `#f97316` | |
| API | Express 5, express-session, helmet, hpp, express-rate-limit | |
| Session store | connect-pg-simple (PostgreSQL) | Survives server restarts; must be in esbuild `external` |
| Database | PostgreSQL + Drizzle ORM | Replit-provisioned |
| Validation | Zod (`zod/v4`), drizzle-zod | |
| API contracts | OpenAPI 3.1 → Orval codegen → typed React Query hooks | |
| Push | web-push (VAPID) | Auto-generates keys on startup if not set |
| Email | Nodemailer (any SMTP provider) | Disabled gracefully if SMTP not configured |
| i18n | i18next + react-i18next (EN / HI / OR) | |
| Build | esbuild (API ESM bundle), Vite (frontend) | |
| PWA | vite-plugin-pwa + Workbox | generateSW strategy |
| Monorepo | pnpm workspaces | |

---

## 4. Database Schema — 15 Tables

### `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `username` | text UNIQUE | Primary login identifier |
| `email` | text UNIQUE | Also usable as login identifier |
| `mobile` | text NULL | Also usable as login identifier |
| `full_name` | text NULL | |
| `password_hash` | text | bcrypt 12 rounds |
| `role` | text | `admin` / `operator` / `user` |
| `is_active` | boolean | |
| `status` | text | `ACTIVE` / `PENDING` / `INACTIVE` / `SUSPENDED` / `DELETED` / `LOCKED` |
| `failed_login_attempts` | integer | Reset on success; 5 failures → lock 15 min |
| `locked_until` | timestamptz NULL | |
| `active_session_token` | text NULL | V1 backward-compat |
| `profile_picture` | text NULL | base64 data URL |
| `bio` | text NULL | Max 500 chars |
| `address` | text NULL | Max 500 chars |
| `ledger_balance` | numeric(15,2) NOT NULL DEFAULT 0 | Maintained running total of ledger credits − debits; updated atomically on every ledger write (O(1) alternative to full `SUM()` scan) |
| `created_at` / `updated_at` | timestamptz | |

### `user_sessions`
V2 multi-device session tracking — one row per active login.

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `session_id` | text UNIQUE | UUID; matches express-session sid |
| `user_id` | integer | FK → `users.id` |
| `device_info` | text | e.g. `"Chrome on Windows"` |
| `browser` / `os` | text | Parsed by `parseDevice()` from User-Agent |
| `ip_address` | text | X-Forwarded-For aware |
| `remember_me` | boolean | true = 30-day expiry; false = 8-hour |
| `is_active` | boolean | false after revoke |
| `expires_at` | timestamptz | |
| `last_activity` | timestamptz | Throttled (≤ once/min) |
| `created_at` | timestamptz | |

### `session`
Express session store — managed by `connect-pg-simple`. Auto-created at startup.

| Column | Type |
|--------|------|
| `sid` | varchar PK |
| `sess` | json |
| `expire` | timestamp(6) (indexed) |

### `ledger`
| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `date` | text | ISO `YYYY-MM-DD` |
| `customer_name` | text | |
| `service_type` | text | Should match a service name |
| `credit` / `debit` | numeric(12,2) | |
| `balance` | numeric(12,2) | Running balance snapshot at insert |
| `description` | text | |
| `receipt_number` | text NULL | `CSC-YYYY-NNNN` |
| `receipt_token` | text NULL | UUID for QR verification |
| `created_by` | integer | FK → `users.id` |
| `created_at` / `updated_at` | timestamptz | |

### `receipt_counters`
| Column | Type | Notes |
|--------|------|-------|
| `year` | integer PK | |
| `last_count` | integer | Atomic: `INSERT … ON CONFLICT DO UPDATE SET last_count = last_count + 1 RETURNING last_count` |

### `aeps_daily`
One session per operating day per user.

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `date` | date | UNIQUE per `(date, created_by)` |
| `opening_balance` | numeric(12,2) | |
| `notes` | text NULL | |
| `created_by` | integer | |
| `created_at` / `updated_at` | timestamptz | |

### `aeps_transactions`
| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `daily_id` | integer | FK → `aeps_daily.id` CASCADE DELETE |
| `type` | text | `withdrawal` / `deposit` |
| `amount` | numeric(12,2) | Always positive |
| `customer_name` | text | |
| `description` | text NULL | |
| `created_at` | timestamptz | |

### `udhari_customers`
| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `name` | text | |
| `phone` | text NULL | |
| `address` | text NULL | |
| `balance` | numeric(12,2) | Auto-recalculated server-side; `> 0` = owes you, `< 0` = you owe |
| `created_by` | integer | |
| `created_at` / `updated_at` | timestamptz | |

### `udhari_entries`
| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `customer_id` | integer | FK → `udhari_customers.id` |
| `date` | text | ISO |
| `type` | text | `gave` / `got` |
| `amount` | numeric(12,2) | |
| `note` | text NULL | |
| `created_by` | integer | |
| `created_at` | timestamptz | |

### `push_subscriptions`
| Column | Type |
|--------|------|
| `id` | serial PK |
| `user_id` | integer |
| `endpoint` | text UNIQUE |
| `p256dh` / `auth` | text |
| `created_at` | timestamptz |

### `notifications`
| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `user_id` | integer NULL | NULL = visible to all users (system-wide) |
| `title` / `message` | text | |
| `type` | text | `info` / `warning` / `success` / `error` |
| `is_read` | boolean | |
| `created_at` | timestamptz | |

### `settings`
Global key-value store. Known keys: `businessName`, `businessAddress`, `businessMobile`, `businessEmail`, `language`, `theme`, `currency`, `autoBackup`, `backupFrequencyDays`.

### `audit_logs`
Immutable. Written by `auditLog()` helper in `lib/auth.ts`.

| Column | Type |
|--------|------|
| `id` | serial PK |
| `user_id` | integer |
| `action` | text (dot-namespaced) |
| `details` | text NULL |
| `ip_address` | text |
| `created_at` | timestamptz |

Complete action codes: `login.success` · `login.failed_*` · `logout` · `session.revoke*` · `ledger.*` · `aeps.*` · `profile.*` · `preferences.update` · `user.*` · `settings.update` · `backup.*` · `password.reset` · `REGISTER_REQUEST` · `udhari.*`

### `password_reset_tokens`
| Column | Type |
|--------|------|
| `id` | serial PK |
| `token` | text UNIQUE |
| `user_id` | integer |
| `expires_at` | timestamptz |
| `used` | boolean |

### `broadcast_logs`
| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `sent_by` | integer | FK → `users.id` |
| `channel` | text | `push` / `email` |
| `subject` / `body` | text | |
| `recipient_filter` | text NULL | `all` / `active` (email only) |
| `recipient_count` | integer | |
| `failed_count` | integer | |
| `created_at` | timestamptz | |

---

## 5. Backend — Express API Server

### 5.1 Middleware Stack (in order)

```
helmet()                    — security headers
hpp()                       — HTTP parameter pollution protection
cors()                      — CORS (dev: all origins; prod: strict)
express.json()              — body parser
express-rate-limit          — global 500/15min, login 20/15min
session()                   — connect-pg-simple PostgreSQL session store
routes                      — all API routers (see Section 2 route list)
```

### 5.2 Authentication & Session System

**Login flow:**
1. Accepts `identifier` (username / email / mobile) + `password`
2. Looks up user; checks `is_active`, `status`, `locked_until`
3. bcrypt compare (12 rounds); increments `failed_login_attempts` on failure
4. On success: creates express-session row + `user_sessions` row with device info
5. Sets `active_session_token` on user (V1 backward-compat)

**Session durations:**
- Standard: 8 hours (`req.session.cookie.maxAge = 8 * 60 * 60 * 1000`)
- Remember Me: 30 days

**`requireAuth` middleware:**
1. Checks `req.session.userId` is set
2. Validates `session_id` against `user_sessions` table (V2)
3. Falls back to `active_session_token` match (V1 backward-compat)
4. Returns 401 if either check fails

### 5.3 RBAC — `requirePermission`

Applied at route level. Admin has wildcard `["*"]`.

```typescript
requirePermission("ledger")   // operator, admin
requirePermission("admin")    // admin only (via requireRole)
```

Permissions by role:
- `admin`: `["*"]`
- `operator`: `["ledger", "aeps", "reports", "udhari", "services", "profile", "notifications"]`
- `user`: `["ledger:view", "reports:view", "services:view", "profile:view", "notifications:view"]`

### 5.4 SMTP & Email

`lib/mailer.ts` provides:
- `isSmtpConfigured()` — returns `true` when `SMTP_HOST` + `SMTP_USER` + `SMTP_PASS` all set
- `sendOtpEmail(to, otp, type)` — 6-digit OTP email with copy block + auto-fill hint
- `sendApprovalEmail(to, status)` — registration approval/rejection
- `sendBroadcastEmail(recipients, subject, body)` — admin email blast

### 5.5 VAPID Push

`lib/vapid.ts`:
- On startup: checks `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` env vars
- If missing: auto-generates keys via `webpush.generateVAPIDKeys()`
- Configures `web-push` with keys + `VAPID_EMAIL` (default: `mailto:admin@sahucsc.in`)

`lib/push.ts`:
- `sendPushToUser(userId, payload)` — sends to all subscriptions for that user
- `sendPushToAll(payload)` — sends to all subscribed devices

### 5.6 Caching Architecture

Two independent TTL caches sit in front of hot read paths, both backed by a swappable `CacheBackend` interface (`lib/cache/backend.ts`, `lib/cache/memoryBackend.ts`, `lib/cache/redisBackend.ts`):

- **Query cache** (`lib/query-cache.ts`, 5s TTL) — `GET /api/dashboard`, `GET /api/admin/users-overview`, `GET /api/reports/daily`, `GET /api/reports/monthly`, `GET /api/aeps/*`, `GET /api/udhari/*`, `GET /api/users`. Invalidated via `invalidateLedgerCaches()` / `invalidateAepsCaches()` / `invalidateUdhariCaches()` / `invalidateUserListCache()` on every relevant write.
- **Maintained `ledger_balance` column** (`users.ledger_balance`) — `GET /api/dashboard` and `GET /api/ledger/balance` read the running total from this O(1) column instead of issuing a full `SUM()` aggregate scan across the entire ledger history. Updated atomically on every `POST`, `PATCH`, `DELETE /ledger/*` write; reset to 0 on `DELETE /ledger/all`. A startup backfill corrects any existing rows whose balance is 0 but have ledger entries.
- **Session/role cache** (`lib/auth/sessionCache.ts`, 5s TTL) — backs `requireAuth`/`requireRole`/`requirePermission`'s per-request session-validity and role lookups. Invalidated via `invalidateSessionCache()` / `invalidateUserCache()` on logout, password reset, session revocation, and role/status changes.

Backend selection is via `CACHE_BACKEND` env var:
- `memory` (default) — process-local `Map` per namespace. Correct for the current single-instance VM deployment (see Section 1).
- `redis` — Upstash Redis (REST API) via `@upstash/redis`, namespaced keys (`cache:<namespace>:<key>`), needed only if the API ever runs as more than one instance (a memory cache would otherwise let one instance serve stale data another instance already invalidated). Requires `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`; fails open (cache miss) on Redis errors rather than 500ing.

**Read replicas — guidance, not implemented.** This app runs on Replit's built-in Postgres, which has no read-replica option today (see Section 15 / `replit.md`). If it ever migrates to a provider that supports replicas, these reads are safe to route to one: `GET /api/dashboard`, `GET /api/reports/*`, `GET /api/admin/users-overview`, `GET /api/receipts/verify/:token`. These must stay on the primary because they read-after-write in the same request: `routes/ledger.ts` (balance recalculation immediately follows every write), `routes/auth/*` and `routes/sessions.ts` (session validation right after login/logout), `routes/users.ts` (role/status changes must take effect immediately, not after replica lag).

### 5.7 Route Registration Order

```typescript
// routes/index.ts
router.use(setupStatusRouter)     // FIRST — public, no auth, needed for banner
router.use(healthRouter)
router.use(authRouter)
router.use(passwordResetRouter)
router.use(sessionsRouter)
router.use(ledgerRouter)
router.use(aepsRouter)
router.use(receiptsRouter)        // public: /api/receipts/verify/:token
router.use(udhariRouter)
router.use(reportsRouter)
router.use(servicesRouter)
router.use(notificationsRouter)
router.use(pushRouter)
router.use(profileRouter)
router.use(preferencesRouter)
router.use(usersRouter)
router.use(adminRouter)
router.use(adminSessionsRouter)
router.use(adminRegistrationRouter)
router.use(adminReceiptExportRouter)
router.use(broadcastRouter)
router.use(auditRouter)
router.use(settingsRouter)
```

---

## 6. Frontend — React SPA

### 6.1 App Bootstrap (`App.tsx`)

`App.tsx` is now a 69-line thin root. Each concern lives in its own file:

| File | Role |
|---|---|
| `providers/QueryProvider.tsx` | `queryClient` singleton, IDB persister, `PersistQueryClientProvider` |
| `providers/AuthProvider.tsx` | `AppAuthProvider` — wraps `HookAuthProvider` + all session side-effects |
| `components/Router.tsx` | All 30 `<Route>` definitions + lazy page imports + `ShareTargetHandler` |
| `components/ProtectedRoute.tsx` | Auth guard — redirects to `/login`, renders 403 for `adminOnly` |
| `components/LoadingScreen.tsx` | Branded full-screen spinner used by `ProtectedRoute` while auth resolves |
| `components/AuthFade.tsx` | Enter-only opacity fade wrapper for public auth pages |

```
GeoGate (inline in App.tsx — 15 ln)
  ErrorBoundary
    PerformanceProvider
      SplashScreen (once per browser session)
      QueryProvider          ← providers/QueryProvider.tsx
        TooltipProvider
          ThemeProvider
            WouterRouter
              AppAuthProvider  ← providers/AuthProvider.tsx
                Router         ← components/Router.tsx
            Toaster
```

### 6.2 Routes & Access Control

| Path | Page | Access |
|------|------|--------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/forgot-password` | OTP password reset (4-step) | Public |
| `/receipts/verify/:token` | Receipt verification | Public |
| `/` | Dashboard | Auth |
| `/ledger` | Ledger | `ledger` permission |
| `/aeps` | AePS | `aeps` permission |
| `/udhari` | Udhari list | `udhari` permission |
| `/udhari/:id` | Udhari customer | `udhari` permission |
| `/services` | Services | `services:view` |
| `/reports` | Reports | `reports` permission |
| `/notifications` | Notifications | Auth |
| `/profile` | Profile+Settings | Auth |
| `/preferences` | Preferences | Auth |
| `/sessions` | Sessions | Auth |
| `/pwa-status` | PWA status | Auth |
| `/download-app` | Install guide | Auth |
| `/about` | About/docs | Auth |
| `/users` | User management | Admin |
| `/users-overview` | Cross-user overview | Admin |
| `/audit-logs` | Audit trail | Admin |
| `/backups` | Backups | Admin |
| `/server-health` | API health | Admin |
| `/broadcast` | Broadcast center | Admin |

### 6.3 Design System

**Colors:** Navy `#0b2c60` · Saffron `#f97316`  
**Components:** shadcn/ui (import from `@/components/ui/`)  
**Toast:** Custom Framer Motion renderer in `toaster.tsx` — 4 variants (default/navy, success, destructive, warning); shorthands `toast.success()`, `toast.error()`; mobile top-center, desktop bottom-right  
**Desktop forms:** Full-screen split layout (380px dark left panel + `flex: 1` right panel) — ledger, udhari, udhari-customer, aeps all use `position: fixed; inset: 0` with a dark info panel left and a scrollable form panel right

### 6.4 Auth Loading Guard

`isLoading = liveLoading || !offlineChecked`

Uses `||` not `&&` — so the guard stays up until BOTH checks complete. If `&&` used, offline check completes before live fetch → auto-logout on refresh.

After login: `queryClient.setQueryData(["auth/me"], userData)` called directly from response body — no separate `/api/auth/me` refetch (prevents race condition through Replit proxy).

---

## 7. 3-Tier Data Architecture

### Tier 1 — PostgreSQL (permanent, 15 tables)

Authoritative data store. All mutations go here.  
Applied via: `pnpm --filter @workspace/db run push`

### Tier 2 — IndexedDB (offline/browser, 5 stores)

| Store | Purpose | Expiry |
|-------|---------|--------|
| `pending_ledger` | Offline ledger entries queued for sync | Cleared after sync |
| `cache_store` | Generic KV cache (dashboard data, etc.) | Configurable (default 5 min) |
| `user_session` | Cached auth session for offline login | 24 hours |
| `cached_reports` | Previously generated reports | Configurable |
| `pending_notifications` | Notifications queued offline | Cleared when read |

Wrapper: `lib/offline-db/` (IndexedDB v2, no external library — split into schema / queue / sync; all consumer imports via `@/lib/offline-db` resolve to `index.ts`)  
Sync engine: `lib/sync-engine.ts` — singleton, auto-triggers on `window.online`, max 3 retries/entry

### Tier 3 — Service Worker Cache (speed/offline, 10 buckets)

| Route pattern | Strategy | Cache name | TTL |
|---------------|----------|------------|-----|
| `/api/auth/*` | NetworkOnly | — | Never cached |
| `/api/dashboard` | StaleWhileRevalidate | api-dashboard | 5 min |
| `/api/reports` | StaleWhileRevalidate | api-reports | 10 min |
| `/api/settings` | StaleWhileRevalidate | api-settings | 30 min |
| `/api/profile` | StaleWhileRevalidate | api-profile | 5 min |
| `/api/preferences` | StaleWhileRevalidate | api-preferences | 30 min |
| `/api/ledger` | NetworkFirst | api-ledger | 8s timeout, 5 min |
| `/api/services` | NetworkFirst | api-services | 8s timeout, 1 hr |
| `/api/notifications` | NetworkFirst | api-notifications | 8s timeout, 2 min |
| Images | CacheFirst | image-cache | 30 days |
| Fonts | CacheFirst | font-cache | 1 year |

---

## 8. PWA & Offline Architecture

### Service Worker

Strategy: `generateSW` (vite-plugin-pwa + Workbox).  
Dev mode: enabled (`devOptions.enabled: true, type: "module"`).

### Manifest (embedded in vite.config.ts + `infrastructure/pwa/manifest.json`)

```json
{
  "name": "SAHU CSC — Common Service Center",
  "short_name": "SAHU CSC",
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone", "minimal-ui", "browser"],
  "orientation": "portrait-primary",
  "theme_color": "#0b2c60",
  "id": "sahu-csc-app",
  "lang": "en-IN"
}
```

### App Shortcuts (4)

1. **Dashboard** → `/?source=shortcut`
2. **New Ledger Entry** → `/ledger?new=1&source=shortcut`
3. **AePS Cash** → `/aeps?source=shortcut`
4. **Reports** → `/reports?source=shortcut`

### Offline Ledger Flow

1. User adds entry while offline → `addPendingEntry()` → `pending_ledger` IDB store
2. Entry shown in ledger list as amber "Pending" card
3. On `window.online` → `syncEngine.sync()` POSTs each entry to `/api/ledger`
4. Max 3 retries; after that → `partial` error state
5. `SyncStatusBar` component shows live status (🔴 offline · 🟡 pending · 🔵 syncing · 🟠 partial error)

### Offline Auth

`user_session` IDB store caches the auth session for 24 hours. Users stay logged in offline; `isLoading` guard uses `||` to wait for both live and offline checks.

### Network Status Detection

`use-network-status.ts`:
- Listens to `window.online` / `window.offline`
- Listens to `navigator.connection` change events
- Probes latency every 30 seconds
- Detects `slow-2g` / `2g` as `isSlow: true`

---

## 9. Android TWA

### Digital Asset Links

`artifacts/sahu-csc/public/.well-known/assetlinks.json` — tells Android the website and native app are the same origin.

### Setup Steps

```bash
# 1. Install Bubblewrap
npm install -g @bubblewrap/cli

# 2. Init from manifest
bubblewrap init --manifest https://<your-domain>/manifest.webmanifest

# 3. Generate signing keystore
keytool -genkey -v -keystore android.keystore -alias sahucsc -keyalg RSA -keysize 2048 -validity 10000

# 4. Get SHA-256 fingerprint
keytool -list -v -keystore android.keystore | grep SHA256

# 5. Update assetlinks.json
# Set "package_name": "com.sahucsc.app" and SHA-256 fingerprint

# 6. Deploy (assetlinks.json must be live at /.well-known/assetlinks.json)
# 7. Build
bubblewrap build

# 8. Upload .aab to Google Play Console
```

### Config

- **Package ID:** `com.sahucsc.app`
- **Min SDK:** 21 (Android 5.0)
- **Target SDK:** 34
- **App version:** 4.2.0 (code: 5)
- **Config file:** `infrastructure/twa/twa-config.json`

---

## 10. Security Model

### Account Locking

5 failed login attempts → account locked for 15 minutes (auto-unlocks via `locked_until` timestamp check).

### Idle Timeout

`use-idle-timer.ts` — monitors `mousemove`, `keydown`, `touchstart`, `scroll`.  
30 min inactivity → 2-min warning dialog → auto-logout.

### Password Policy

Minimum 8 chars, uppercase, lowercase, number. Enforced on registration, password reset, and admin password reset dialog.

### OTP Resend Cooldown

120 seconds (`RESEND_COOLDOWN = 120`) on both `forgot-password.tsx` and `register.tsx`. Visual SVG progress ring counts down.

### OTP Security

- `send-otp` returns HTTP 200 with `{ maskedEmail: null }` for unknown identifiers — prevents enumeration
- OTP cleanup job (`otp-cleanup.ts`) runs hourly — deletes used/expired tokens
- OTP email includes copy block (CSS `user-select: all`) + `autoComplete="one-time-code"` for mobile auto-fill

### Per-User Data Isolation

`getUserFilter()` always filters by `userId`. Admin oversight uses separate `/api/admin/*` endpoints. Operators cannot access other operators' data.

### Admin Oversight (separate from admin's own data)

| Endpoint | Returns |
|----------|---------|
| `GET /api/admin/users-overview` | All users' balance summary |
| `GET /api/admin/users-overview/:userId/ledger` | Single user's ledger |
| `GET /api/admin/aeps-overview` | All users' AePS balances |

### Notification Isolation

- `userId = null` in notifications → visible to ALL users (system-wide broadcast)
- All user-specific events must pass explicit `userId` to `createNotification()`
- `notifyNewRegistration` fans out internally to all admin IDs

---

## 11. Business Modules

### 11.1 Ledger & Running Balance

Balance computed at insert time from `SUM(credit) - SUM(debit)` of all prior entries for that user. Never trusted from the client. Money stored as Drizzle `numeric` → returns as string from DB → always `parseFloat()` before returning from routes.

Receipt number: `CSC-YYYY-NNNN`. Atomic upsert:
```sql
INSERT INTO receipt_counters (year, last_count)
VALUES ($year, 1)
ON CONFLICT (year)
DO UPDATE SET last_count = receipt_counters.last_count + 1
RETURNING last_count;
```

Receipt token: UUID (prevents enumeration). QR encodes `https://domain/receipts/verify/<uuid>`. `GET /api/receipts/verify/:token` is public (no auth — customers scan QR without an account).

### 11.2 AePS Cash Management

One `aeps_daily` row per (user × date). Transactions reference the daily session via `daily_id`.

Opening balance hero: `OpeningBalanceHeroCard` — full-width navy gradient card (never in stat-card grid).

Aadhaar masking: `XXXX XXXX <last 4>` at rest; raw grouped value while focused. Store raw digits, derive masked display on render.

### 11.3 Udhari Khata

Balance sign convention:
- `balance > 0` → customer owes you ("To Collect")
- `balance < 0` → you owe customer ("To Pay")

`recalcBalance(customerId)` runs `SUM` of all entries after every change. Never trusts client-supplied balance.

### 11.4 Reports

Command Center design: horizontal top nav (not sidebar tabs), navy KPI strip, 2-col charts grid. All data user-scoped.

Excel export: two sheets — Ledger + AePS.

### 11.5 Receipt PDF

Client-side: `html2canvas` + `jsPDF`. Backend stays stateless.

---

## 12. i18n — Internationalisation

| Code | Language | Script |
|------|----------|--------|
| `en` | English | Latin |
| `hi` | Hindi | Devanagari |
| `or` | Odia | Odia |

- Single flat `translation.json` per locale (~860 keys) — do not split into namespace files
- `i18n.ts` reads `localStorage["sahu-lang"]`, falls back to `"en"`
- Language saved in both `localStorage` and `user_preferences.language`
- Language switcher: Profile → Preferences → Language (not sidebar)

**All 25 pages and `layout.tsx` are fully translated** (EN / HI / OR).

**Critical rule:** Translated string constants (arrays, config objects) must be declared **inside** the component function after `const { t } = useTranslation()` — never at module scope.

---

## 13. Setup Wizard (V3)

### `/api/setup-status`

```
GET /api/setup-status   — public, no auth required
```

Returns `{ configured: boolean, missing: Array<{ key, label, severity, description }> }`.

Checks:
- `SESSION_SECRET` → critical
- `SMTP_HOST` + `SMTP_USER` + `SMTP_PASS` → critical (SMTP group)
- VAPID keys + persistent flag → optional

### `SetupWizardBanner`

- Admin-only (wrapped in `{isAdmin && <SetupWizardBanner />}` in `layout.tsx`)
- Fetches `/api/setup-status` on mount
- Red = critical missing, Yellow = optional missing
- Collapsible per-secret list with descriptions
- Session-dismissed: `sessionStorage.setItem("sahu-setup-banner-dismissed-v1", "1")`
- Reappears on next login until all configured

---

## 14. Automatic Import Setup

`scripts/post-merge.sh` runs automatically on every GitHub import or task agent merge (configured in `.replit` under `[postMerge]`, 20-second timeout).

```bash
pnpm install --frozen-lockfile
pnpm --filter @workspace/db run push
```

**Idempotent** — safe to run multiple times. Schema push creates tables if missing, applies new columns, never drops unless schema deletes them.

**What still requires manual setup:**

| Item | Where |
|------|-------|
| `SESSION_SECRET` | Replit Secrets tab |
| `SMTP_*` (5 vars) | Replit Secrets tab |
| `VAPID_*` (optional) | Replit Secrets tab |
| Run "Seed Database" workflow | Replit Workflows panel (one-time) |

---

## 15. Environment & Secrets

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection (auto-provisioned by Replit) |
| `SESSION_SECRET` | ✅ | Express session signing secret |
| `SMTP_HOST` | ✅ for email | SMTP server hostname |
| `SMTP_PORT` | ✅ for email | SMTP port (587 / 465) |
| `SMTP_USER` | ✅ for email | SMTP username |
| `SMTP_PASS` | ✅ for email | SMTP password / app password |
| `SMTP_FROM_EMAIL` | Optional | From address (defaults to `SMTP_USER`) |
| `VAPID_PUBLIC_KEY` | Recommended | Web push public key |
| `VAPID_PRIVATE_KEY` | Recommended | Web push private key |
| `VAPID_EMAIL` | Optional | VAPID contact email |

---

## 16. Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Session-based auth, no JWT | Simpler for single-center CSC; server-controlled revocation |
| connect-pg-simple in esbuild `external` | Bundling breaks its internal `table.sql` path lookup → silent session failures |
| Cache backend pluggable but defaults to in-memory | Correct and simplest for today's single-instance deployment; Redis is opt-in groundwork for if/when the API scales to multiple instances, not a forced migration |
| `@upstash/redis` added to `lib/db` even though only `api-server` uses it | drizzle-orm 0.45.2 lists `@upstash/redis` as an optional peer — adding it to only one package creates a second drizzle-orm peer-resolution variant and cross-file TS conflicts (same class of bug as the `@opentelemetry/api` case). Both packages must share the same peer set. |
| `requireAuth` uses `\|\|` not `&&` for loading guard | `&&` causes auto-logout on refresh (offline check completes before live fetch) |
| Login sets auth via `setQueryData` | Avoids race condition: no separate `/api/auth/me` refetch through Replit proxy |
| `parseDevice` called once before all branches | Avoids duplicate-const esbuild error if called inside conditional branches |
| Money as Drizzle `numeric` | DB returns string → always `parseFloat()` in routes before responding |
| Running balance at insert time | `SUM` computed from prior entries; never trusted from client |
| Receipt token is UUID | Prevents enumeration; QR encodes the token not the sequential number |
| `GET /api/receipts/verify/:token` is public | Customers scan QR without needing an account |
| `GET /api/setup-status` is public | Called from admin banner before login flow; never exposes secret values |
| Setup banner is session-dismissed | `sessionStorage` key — reappears on each new login session until configured |
| Udhari balance recalculated server-side | `recalcBalance()` runs `SUM` after every entry change |
| `notification userId = null` = broadcast | All-user visibility; pass explicit `userId` for user-specific events |
| React Query cache cleared on logout | `queryClient.clear()` in `handleLogout` — prevents stale data across account switches |
| CSS for responsive layout, not JS `isMobile` | `useIsMobile()` has render-before-measure delay causing layout flicker |
| `willChange: transform` forbidden on ancestors of fixed nav | Creates CSS containing block → breaks `position: fixed` on bottom nav |
| PermissionCard Continue is single-tap (auto-finish) | On Android, all three permission requests resolve near-instantly (OS already denied, or no user gesture after async geo-await). A two-step "request then confirm" design required a second Continue tap that felt broken. `handleContinueStep1` now calls `finish()` automatically after all permissions are attempted; step 2 shows a non-interactive spinner instead of a second button. |
| i18n constants inside component function | Translated arrays/objects must be after `const { t } = useTranslation()` — module scope = wrong language |
| `POST /api/auth/send-otp` returns 200 for unknown identifier | Prevents account enumeration |
| OTP resend cooldown = 120 seconds | Email OTP resend (login/register/forgot-password): `RESEND_COOLDOWN = 120` in `loginTypes.ts`; unrelated to TOTP window |
| TOTP period = 30 seconds (RFC 6238) | Standard window; `window: 1` on verify for ±30 s clock drift; in-memory replay protection per userId |
| TOTP uses `crypto.timingSafeEqual` | Backup-code hash comparison and OTP hash comparison use constant-time compare to prevent timing oracle attacks |
| VAPID auto-generation | Dev-friendly; no manual key generation needed; production should use persistent secrets |
| `post-merge.sh` is idempotent | Safe to run multiple times; `--frozen-lockfile` never modifies lockfile |
| CDN sits in front of the single origin, doesn't split it | Single-VM deployment already sends correct per-asset-type cache headers (`serve.mjs`); a transparent reverse-proxy CDN (see `CDN_SETUP.md`) avoids CORS/asset-path-rewrite risk that a separate CDN-prefixed domain would add |
