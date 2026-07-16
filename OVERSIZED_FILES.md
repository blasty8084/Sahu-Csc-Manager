# SAHU CSC — Oversized File Registry
**Generated: July 16, 2026 | Threshold: 300+ lines**

> All actionable source files over 300 lines. Generated files (`api.ts`, `api.schemas.ts`),
> shadcn/ui primitives (`components/ui/*`), service worker (`sw.ts`), and mockup sandbox
> files are excluded — they cannot or should not be split.
>
> **Goal:** Every file under 250 lines after split.  
> **Rule:** No behaviour changes. Run `pnpm run typecheck` after each group.

---

## Summary

| Category | Files | Total lines |
|----------|-------|-------------|
| Frontend pages | 22 | 13,001 |
| Frontend components | 15 | 6,569 |
| Frontend hooks / lib | 2 | 701 |
| Frontend config | 1 | 332 |
| Backend routes | 5 | 1,953 |
| Backend test / scripts | 2 | 613 |
| **Total** | **47** | **23,169** |

---

## 1. Frontend Pages
`artifacts/sahu-csc/src/pages/`

### 1.01 `about.tsx` — 896 lines
**Extract into `components/about/`:**
- `AboutHeroSection.tsx` — headline, tagline, branding block
- `AboutFeatureCard.tsx` — reusable feature highlight card
- `AboutVersionHistory.tsx` — changelog / release notes display
- `AboutTeamSection.tsx` — team / contact block
- `AboutStats.tsx` — stats bar (users, services, uptime)

**Page file target:** ~80 lines (import + layout composition only)

---

### 1.02 `forgot-password.tsx` — 804 lines
> `ForgotPasswordPanel.tsx` (404 ln) already extracted but page still large.

**Extract into `components/auth/`:**
- `OtpRequestForm.tsx` — email/mobile input + send OTP button
- `OtpVerifyForm.tsx` — 6-digit OTP entry + resend
- `NewPasswordForm.tsx` — new password + confirm + strength meter
- `ForgotPasswordStepper.tsx` — step indicator (1 → 2 → 3)

**Page file target:** ~60 lines (step state + layout shell only)

---

### 1.03 `udhari-customer.tsx` — 803 lines
**Extract into `components/udhari/customer/`:**
- `UdhariCustomerHeader.tsx` — customer name, balance badge, back button
- `UdhariEntryList.tsx` — paginated entry rows with date/amount/note
- `UdhariEntryRow.tsx` — single entry row with edit/delete
- `UdhariAddEntryForm.tsx` — add credit/debit form (inline or dialog)
- `UdhariCustomerStats.tsx` — total given, total received, net balance

**Page file target:** ~80 lines

---

### 1.04 `ledger.tsx` — 784 lines
**Extract into `components/ledger/` + `hooks/`:**
- `LedgerFilterBar.tsx` — date range, type filter, search input
- `LedgerSummaryCards.tsx` — total income, total expense, net balance cards
- `LedgerAddEntryDialog.tsx` — new entry form (if not already extracted)
- `hooks/useLedger.ts` — data fetching, pagination, filter state

**Page file target:** ~80 lines

---

### 1.05 `server-health.tsx` — 765 lines
**Extract into `components/server-health/`:**
- `HealthOverviewCard.tsx` — uptime, status badge, last-checked
- `HealthMetricCard.tsx` — reusable metric tile (CPU, memory, DB pool)
- `HealthTimelineChart.tsx` — response-time sparkline
- `HealthAlertList.tsx` — recent errors/warnings list
- `HealthDatabaseSection.tsx` — pool stats, query times

**Page file target:** ~80 lines

---

### 1.06 `profile.tsx` — 713 lines
**Extract into `components/profile/`:**
- `ProfileAvatarUpload.tsx` — avatar display + upload button + crop
- `ProfileInfoForm.tsx` — name, email, mobile, bio fields
- `ProfilePasswordForm.tsx` — current + new + confirm password
- `ProfileSessionsList.tsx` — active sessions (if not in sessions page)
- `ProfileDangerZone.tsx` — delete account / deactivate

**Page file target:** ~80 lines

---

### 1.07 `register.tsx` — 679 lines
**Extract into `components/auth/`:**
- `RegisterPersonalForm.tsx` — name, email, mobile
- `RegisterCredentialsForm.tsx` — username, password, confirm
- `RegisterBusinessForm.tsx` — business name, address, CSC ID
- `RegisterStepIndicator.tsx` — step progress bar
- `RegisterMobileLayout.tsx` — mobile-specific slide-up card wrapper

**Page file target:** ~80 lines

---

### 1.08 `broadcast.tsx` — 665 lines
**Extract into `components/broadcast/`:**
- `BroadcastStatsBar.tsx` — subscriber count, last sent date
- `BroadcastPushForm.tsx` — title, body, icon fields for push
- `BroadcastEmailForm.tsx` — subject, HTML body, recipient filter
- `BroadcastHistoryTable.tsx` — paginated log of past broadcasts
- `BroadcastPreviewCard.tsx` — live preview of notification

**Page file target:** ~80 lines

---

### 1.09 `receipt-export.tsx` — 620 lines
**Extract into `components/receipt-export/`:**
- `ReceiptFilterForm.tsx` — date range, user selector, service filter
- `ReceiptExportActions.tsx` — download ZIP / PDF buttons + progress
- `ReceiptExportStats.tsx` — count, size estimate
- Already has `ReceiptPreviewList.tsx` (339 ln — split that too, see §2.15)

**Page file target:** ~80 lines

---

### 1.10 `users.tsx` — 615 lines
**Extract into `components/users/` + `hooks/`:**
- `UserFilters.tsx` — search, role filter, status filter
- `UserCreateDialog.tsx` — admin create-user form
- `UserBulkActions.tsx` — select all, bulk suspend/activate
- `hooks/useUsers.ts` — data fetching, pagination, filter state

**Page file target:** ~80 lines

---

### 1.11 `dashboard.tsx` — 565 lines
**Extract into `components/dashboard/`:**
- `DashboardStatCards.tsx` — income, expense, balance, AePS cards
- `DashboardWeeklyBar.tsx` — 7-day CSS bar chart
- `DashboardRecentActivity.tsx` — last 5 ledger entries
- `DashboardQuickActions.tsx` — FAB-style add buttons

**Page file target:** ~80 lines

---

### 1.12 `aeps/DailyTab.tsx` — 563 lines
**Extract into `components/aeps/daily/`:**
- `DailyTabSummaryCard.tsx` — daily total, agent balance
- `DailyTabEntryList.tsx` — paginated transactions for the day
- `DailyTabEntryRow.tsx` — single row with amount, type, time
- `DailyTabForm.tsx` — add daily summary form

**File target:** ~80 lines

---

### 1.13 `App.tsx` — 562 lines
**Extract into:**
- `providers/AuthProvider.tsx` — user state, login/logout, session
- `providers/QueryProvider.tsx` — TanStack QueryClient + persist config
- `components/ProtectedRoute.tsx` — auth guard wrapper
- `components/Router.tsx` — all `<Route>` definitions
- `components/AuthFade.tsx` — auth page transition wrapper

**App.tsx target:** ~60 lines (just mounts providers + Router)

---

### 1.14 `pwa-status.tsx` — 500 lines
**Extract into `components/pwa/`:**
- `PwaInstallCard.tsx` — install prompt, install state
- `PwaPermissionCard.tsx` — notification, camera, location permissions
- `PwaCacheStats.tsx` — cache size, precache entry count
- `PwaSubscriptionCard.tsx` — push subscription status + toggle
- `PwaSyncQueueCard.tsx` — offline queue count + clear

**Page file target:** ~80 lines

---

### 1.15 `udhari.tsx` — 464 lines
**Extract into `components/udhari/`:**
- `UdhariSearchBar.tsx` — customer search with autocomplete
- `UdhariCustomerList.tsx` — paginated card/row list
- `UdhariCustomerCard.tsx` — single customer with balance badge
- `UdhariAddCustomerDialog.tsx` — new customer form

**Page file target:** ~80 lines

---

### 1.16 `backups.tsx` — 411 lines
**Extract into `components/backups/`:**
- `BackupList.tsx` — table of existing backups with download/delete
- `BackupScheduleCard.tsx` — schedule config (cron, retention)
- `BackupRestoreDialog.tsx` — confirm + trigger restore
- `BackupManualTrigger.tsx` — "Run now" button + progress

**Page file target:** ~80 lines

---

### 1.17 `receipts-verify.tsx` — 407 lines
**Extract into `components/receipts/`:**
- `ReceiptVerifyCard.tsx` — main receipt display (date, amount, service)
- `ReceiptQrSection.tsx` — QR re-display + share button
- `ReceiptVerifyBadge.tsx` — "Verified ✓" / "Invalid ✗" badge

**Page file target:** ~60 lines

---

### 1.18 `sessions.tsx` — 377 lines
**Extract into `components/sessions/`:**
- `SessionCard.tsx` — device, browser, IP, last active, revoke button
- `SessionRevokeDialog.tsx` — confirm revoke dialog
- `SessionCurrentBadge.tsx` — "This device" indicator

**Page file target:** ~80 lines

---

### 1.19 `aeps/AllTransactionsTab.tsx` — 372 lines
**Extract into `components/aeps/all-tx/`:**
- `AllTxFilterBar.tsx` — date range, type, search
- `AllTxTable.tsx` — paginated transaction table
- `AllTxExportButton.tsx` — CSV/Excel export

**File target:** ~80 lines

---

### 1.20 `udhari-receipt-verify.tsx` — 358 lines
**Extract into `components/receipts/`:**
- `UdhariReceiptCard.tsx` — customer name, amount, balance snapshot
- `UdhariReceiptFooter.tsx` — business info, CSC ID, timestamp

**Page file target:** ~60 lines

---

### 1.21 `aeps-receipt-verify.tsx` — 333 lines
**Extract into `components/receipts/`:**
- `AepsReceiptCard.tsx` — transaction details, amount, type
- `AepsReceiptFooter.tsx` — agent info, reference number

**Page file target:** ~60 lines

---

### 1.22 `services.tsx` — 332 lines
**Extract into `components/services/`:**
- `ServiceCard.tsx` — icon, name, rate, status toggle
- `ServiceEditDialog.tsx` — edit name, rate, description
- `ServiceAddDialog.tsx` — new service form

**Page file target:** ~80 lines

---

## 2. Frontend Components
`artifacts/sahu-csc/src/components/`

### 2.01 `layout.tsx` — 700 lines
**Extract into `components/layout/`:**
- `layout/Sidebar.tsx` — desktop 240px nav with links, user menu, language switcher
- `layout/BottomNav.tsx` — mobile 5-tab fixed bottom bar
- `layout/TopHeader.tsx` — mobile 3-layer header (accent stripe + white + navy)
- `layout/UserMenu.tsx` — avatar + dropdown (profile, settings, logout)
- `layout/NavLink.tsx` — reusable nav item with active state

**`layout.tsx` target:** ~60 lines (composition only)

---

### 2.02 `profile/TwoFactorSection.tsx` — 617 lines
**Extract:**
- `profile/totp/TotpSetupCard.tsx` — QR display, secret reveal, enrollment flow
- `profile/totp/TotpRegenCard.tsx` — regenerate backup codes dialog
- `profile/otp/OtpToggleCard.tsx` — enable/disable OTP 2FA
- `profile/BackupCodesHealthBar.tsx` — used/available slots bar

**File target:** ~80 lines

---

### 2.03 `ledger/LedgerTable.tsx` — 606 lines
**Extract:**
- `ledger/LedgerRow.tsx` — single entry row (date, description, amount, type badge)
- `ledger/LedgerRowActions.tsx` — edit, delete, receipt buttons
- `ledger/LedgerPagination.tsx` — prev/next + page size selector
- `ledger/LedgerEmptyState.tsx` — empty state illustration

**File target:** ~80 lines

---

### 2.04 `auth/LoginCredentialsStep.tsx` — 511 lines
**Extract:**
- `auth/UsernameField.tsx` — identifier input (mobile/username/email)
- `auth/PasswordField.tsx` — password input + show/hide toggle
- `auth/BiometricPrompt.tsx` — fingerprint/face ID prompt + fallback
- `auth/RememberMeRow.tsx` — remember me checkbox + forgot password link

**File target:** ~80 lines

---

### 2.05 `reports/DesktopReports.tsx` — 463 lines
**Extract into `components/reports/`:**
- `reports/ReportDatePicker.tsx` — month/year selector with presets
- `reports/IncomeExpenseChart.tsx` — recharts bar/line chart
- `reports/MonthlyBreakdownTable.tsx` — per-service breakdown table
- `reports/ReportSummaryCards.tsx` — total income, expense, net cards

**File target:** ~80 lines

---

### 2.06 `lib/offline-db.ts` — 457 lines
**Split into `lib/offline-db/`:**
- `offline-db/schema.ts` — Dexie DB class + table definitions
- `offline-db/queue.ts` — enqueue, dequeue, peek, clear operations
- `offline-db/sync.ts` — replay logic, conflict resolution
- `offline-db/index.ts` — re-exports for backward-compatible imports

**Each file target:** ~100 lines

---

### 2.07 `receipt-modal.tsx` — 443 lines
**Extract:**
- `receipt/ReceiptHeader.tsx` — CSC logo, receipt number, date
- `receipt/ReceiptLineItems.tsx` — service, amount, tax rows
- `receipt/ReceiptQrCode.tsx` — QR code + verify URL
- `receipt/ReceiptDownloadButton.tsx` — jsPDF download logic

**File target:** ~80 lines

---

### 2.08 `skeletons.tsx` — 432 lines
**Split into per-feature files:**
- `ledger/LedgerSkeleton.tsx`
- `aeps/AepsSkeleton.tsx`
- `udhari/UdhariSkeleton.tsx`
- `reports/ReportsSkeleton.tsx`
- `dashboard/DashboardSkeleton.tsx`
- `skeletons/index.ts` — re-exports for backward compat

**Each file target:** ~50 lines

---

### 2.09 `aeps/AepsDepositForm.tsx` — 420 lines
**Extract:**
- `aeps/DepositAmountField.tsx` — amount input + denomination display
- `aeps/DepositCustomerFields.tsx` — customer name, Aadhaar last 4
- `aeps/DepositSummaryRow.tsx` — before-submit summary card
- `hooks/useAepsDeposit.ts` — form state, submit, API call

**File target:** ~80 lines

---

### 2.10 `udhari-receipt-modal.tsx` — 418 lines
**Extract:**
- `receipt/UdhariReceiptDetails.tsx` — customer, entries, balance
- `receipt/UdhariReceiptFooter.tsx` — business info, CSC ID, date
- `receipt/UdhariReceiptActions.tsx` — download, share, close buttons

**File target:** ~80 lines

---

### 2.11 `auth/ForgotPasswordPanel.tsx` — 404 lines
> This component was extracted from `forgot-password.tsx` but is still too large.

**Extract:**
- `auth/forgot/StepRequestOtp.tsx` — identifier input + send button
- `auth/forgot/StepVerifyOtp.tsx` — OTP code entry + resend timer
- `auth/forgot/StepNewPassword.tsx` — new password + strength indicator

**File target:** ~80 lines

---

### 2.12 `auth/TwoFactorStep.tsx` — 395 lines
**Extract:**
- `auth/twofa/MethodPicker.tsx` — OTP vs TOTP choice cards
- `auth/twofa/OtpEntry.tsx` — 6-digit OTP input + resend
- `auth/twofa/TotpEntry.tsx` — 6-digit TOTP input + live code display

**File target:** ~80 lines

---

### 2.13 `aeps-receipt-modal.tsx` — 392 lines
**Extract:**
- `receipt/AepsReceiptDetails.tsx` — transaction type, amount, reference
- `receipt/AepsReceiptFooter.tsx` — agent ID, terminal, timestamp
- `receipt/AepsReceiptActions.tsx` — download, share, close

**File target:** ~80 lines

---

### 2.14 `users/UserTable.tsx` — 407 lines
**Extract:**
- `users/UserRow.tsx` — avatar, name, role, status, last active
- `users/UserStatusBadge.tsx` — ACTIVE/INACTIVE/SUSPENDED/LOCKED badge
- `users/UserActionMenu.tsx` — approve, suspend, reset password, delete dropdown
- `users/UserRoleBadge.tsx` — admin/operator/user badge

**File target:** ~80 lines

---

### 2.15 `receipt-export/ReceiptPreviewList.tsx` — 339 lines
**Extract:**
- `receipt-export/ReceiptPreviewCard.tsx` — single receipt thumbnail
- `receipt-export/ReceiptPreviewPaginator.tsx` — prev/next with page count
- `receipt-export/ReceiptPreviewEmpty.tsx` — no results state

**File target:** ~80 lines

---

## 3. Frontend Hooks / Lib
`artifacts/sahu-csc/src/`

### 3.01 `hooks/useBackups.ts` — 330 lines
**Extract:**
- `hooks/useBackupList.ts` — fetch + delete backup records
- `hooks/useBackupSchedule.ts` — get/set schedule config
- `hooks/useBackupRestore.ts` — trigger restore + poll status
- `hooks/useBackups.ts` — re-export barrel (backward compat)

**Each file target:** ~80 lines

---

### 3.02 `lib/api-client-react/src/custom-fetch.ts` — 371 lines
**Split:**
- `lib/retry.ts` — exponential backoff + retry condition logic
- `lib/token-refresh.ts` — session token refresh flow
- `lib/request-logger.ts` — dev-mode request/response logging
- `custom-fetch.ts` — thin orchestrator that imports all three

**Each file target:** ~80 lines

---

## 4. Frontend Config

### 4.01 `vite.config.ts` — 332 lines
> Config files are acceptable at this size. **No action required.**
> Document is listed here for completeness.

---

## 5. Backend Routes
`artifacts/api-server/src/routes/`

### 5.01 `auth/2fa.ts` — 465 lines
**Split into `routes/auth/`:**
- `auth/2fa-totp.ts` — setup-totp, setup-totp-pending, totp-qr, totp-code, totp-code-pending
- `auth/2fa-otp.ts` — send-otp, verify-otp, switch-method
- `auth/2fa-backup.ts` — regenerate-backup-codes, verify-backup-code
- `auth/2fa.ts` — mounts all three sub-routers under same prefix

**Each file target:** ~120 lines

---

### 5.02 `admin-receipt-export.ts` — 451 lines
**Extract:**
- `services/receiptExportService.ts` — DB queries, ZIP/PDF build logic
- `admin-receipt-export.ts` — request validation, auth check, calls service, streams response

**Route file target:** ~80 lines | Service file: ~300 lines (further splittable)

---

### 5.03 `settings/backups.ts` — 411 lines
**Extract:**
- `services/backupService.ts` — pg_dump execution, file upload, schedule management
- `settings/backups.ts` — route handlers only (validate → call service → respond)

**Route file target:** ~80 lines

---

### 5.04 `routes/ledger.ts` — 407 lines
**Extract:**
- `lib/ledgerHelpers.ts` — balance recalculation, running total query, date helpers
- `routes/ledger.ts` — route handlers only

**Route file target:** ~150 lines | Helper file: ~150 lines

---

### 5.05 `routes/admin.ts` — 313 lines
**Extract:**
- `services/adminStatsService.ts` — cross-user balance summary, AePS overview queries
- `routes/admin.ts` — route handlers only

**Route file target:** ~100 lines

---

## 6. Backend Tests / Scripts

### 6.01 `src/__tests__/auth-session.test.ts` — 312 lines
> Test files at this length are normal. Splitting reduces readability.
> **Optional:** Group into `describe` blocks by scenario if not already done.

---

### 6.02 `scripts/test-api.ts` — 301 lines
> Manual test script. Acceptable at this size.
> **Optional:** Split into `scripts/test-auth.ts`, `scripts/test-ledger.ts`, etc.

---

## How to work through this list

```bash
# 1. Pick a file from the list
# 2. Extract components/hooks into new files
# 3. Update imports in the original file
# 4. Verify no behaviour change
pnpm run typecheck
# 5. Check the original file is now under 250 lines
wc -l <file>
# 6. Tick it off and move to the next
```

### Suggested order (highest impact first)

1. `App.tsx` → providers + Router + ProtectedRoute
2. `layout.tsx` → Sidebar + BottomNav + TopHeader
3. `ledger.tsx` + `LedgerTable.tsx` (same feature, do together)
4. `profile.tsx` + `TwoFactorSection.tsx` (same feature)
5. `auth/2fa.ts` backend (unlock type error in queue-client too)
6. `about.tsx`, `server-health.tsx` (large but isolated, safe to do solo)
7. Remaining pages top-down by line count
8. Components top-down by line count
9. Backend routes

---

*Total files: 47 | Total lines to refactor: ~23,000*
*Target after splits: ~190 files averaging ~120 lines each*
