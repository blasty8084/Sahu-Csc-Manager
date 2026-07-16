# SAHU CSC — Improvements & Fix List
**Last updated: July 16, 2026 | Current version: v4.9.0**

> Prioritised list of everything that needs fixing or improving.
> Check off items as they are completed.

---

## 🔴 High Priority

### 1. Split oversized files (300+ lines)
> ~50 source files exceed 300 lines. Hurts readability, tree-shaking, and code review.

#### Start with these 5 (highest impact):

| File | Lines | Action |
|------|-------|--------|
| `artifacts/sahu-csc/src/App.tsx` | 562 | Extract `AuthProvider` → `providers/AuthProvider.tsx`, `ProtectedRoute` → `components/ProtectedRoute.tsx`, `Router` → `components/Router.tsx` |
| `artifacts/sahu-csc/src/components/layout.tsx` | 700 | Extract `Sidebar` → `layout/Sidebar.tsx`, `BottomNav` → `layout/BottomNav.tsx`, `TopHeader` → `layout/TopHeader.tsx` |
| `artifacts/sahu-csc/src/pages/ledger.tsx` | 784 | Extract `LedgerFilterBar`, `LedgerSummaryCards` → `components/ledger/`; logic → `hooks/useLedger.ts` |
| `artifacts/sahu-csc/src/components/ledger/LedgerTable.tsx` | 606 | Extract `LedgerRow`, `LedgerRowActions`, `LedgerPagination` |
| `artifacts/api-server/src/routes/auth/2fa.ts` | 465 | Split into `2fa-totp.ts`, `2fa-otp.ts`, `2fa-backup.ts` under same router prefix |

#### Full oversized file list (frontend pages):

| File | Lines | Split plan |
|------|-------|--------|
| `pages/about.tsx` | 896 | Extract `AboutFeatureCard`, `AboutTeamSection`, `AboutVersionHistory` → `components/about/` |
| `pages/forgot-password.tsx` | 804 | Finish split into `ForgotPasswordPanel`, `ResetPasswordForm` |
| `pages/udhari-customer.tsx` | 803 | Extract `UdhariEntryList`, `UdhariAddEntryForm`, `UdhariCustomerHeader` → `components/udhari/` |
| `pages/ledger.tsx` | 784 | See above |
| `pages/server-health.tsx` | 765 | Extract `HealthMetricCard`, `HealthTimelineChart`, `HealthAlertList` → `components/server-health/` |
| `pages/profile.tsx` | 713 | Extract `ProfileForm`, `SecuritySection`, `SessionsSection` → `components/profile/` |
| `pages/register.tsx` | 679 | Extract `RegisterForm`, `RegisterStepIndicator` → `components/auth/` |
| `pages/broadcast.tsx` | 665 | Extract `BroadcastForm`, `BroadcastHistory`, `BroadcastStatsBar` → `components/broadcast/` |
| `pages/receipt-export.tsx` | 620 | Extract `ReceiptFilterForm`, `ReceiptExportActions` → `components/receipt-export/` |
| `pages/users.tsx` | 615 | Extract `UserFilters`, `UserCreateDialog` → `components/users/`; logic → `hooks/useUsers.ts` |
| `pages/dashboard.tsx` | 565 | Extract `DashboardStatCards`, `DashboardRecentActivity`, `DashboardWeeklyBar` → `components/dashboard/` |
| `pages/aeps/DailyTab.tsx` | 563 | Extract `DailyTabSummaryCard`, `DailyTabEntryList` → `components/aeps/daily/` |
| `pages/pwa-status.tsx` | 500 | Extract `PwaPermissionCard`, `PwaCacheStats`, `PwaSubscriptionCard` → `components/pwa/` |
| `pages/udhari.tsx` | 464 | Extract `UdhariCustomerList`, `UdhariSearchBar`, `UdhariAddCustomerDialog` → `components/udhari/` |
| `pages/backups.tsx` | 411 | Extract `BackupList`, `BackupScheduleCard`, `BackupRestoreDialog` → `components/backups/` |
| `pages/receipts-verify.tsx` | 407 | Extract `ReceiptVerifyCard`, `ReceiptQrSection` → `components/receipts/` |
| `pages/sessions.tsx` | 377 | Extract `SessionCard`, `SessionRevokeDialog` → `components/sessions/` |
| `pages/aeps/AllTransactionsTab.tsx` | 372 | Extract `AllTxFilterBar`, `AllTxTable` → `components/aeps/all-tx/` |
| `pages/udhari-receipt-verify.tsx` | 358 | Extract `UdhariReceiptCard` → `components/receipts/` |
| `pages/aeps-receipt-verify.tsx` | 333 | Extract `AepsReceiptCard` → `components/receipts/` |
| `pages/services.tsx` | 332 | Extract `ServiceCard`, `ServiceEditDialog` → `components/services/` |

#### Full oversized file list (frontend components):

| File | Lines | Split plan |
|------|-------|--------|
| `components/layout.tsx` | 700 | See above |
| `components/profile/TwoFactorSection.tsx` | 617 | Extract `TotpSetupCard`, `BackupCodesCard`, `OtpToggleCard` |
| `components/ledger/LedgerTable.tsx` | 606 | See above |
| `components/auth/LoginCredentialsStep.tsx` | 511 | Extract `UsernameField`, `PasswordField`, `BiometricPrompt` |
| `components/reports/DesktopReports.tsx` | 463 | Extract `IncomeExpenseChart`, `MonthlyBreakdownTable`, `ReportDatePicker` |
| `lib/offline-db.ts` | 457 | Split into `offline-db/schema.ts`, `offline-db/queue.ts`, `offline-db/sync.ts` |
| `components/receipt-modal.tsx` | 443 | Extract `ReceiptHeader`, `ReceiptQrCode`, `ReceiptDownloadButton` |
| `components/skeletons.tsx` | 432 | Split per-feature: `ledger/LedgerSkeleton.tsx`, `aeps/AepsSkeleton.tsx`, etc. |
| `components/aeps/AepsDepositForm.tsx` | 420 | Extract `DepositAmountField`, `DepositCustomerFields`; logic → `hooks/useAepsDeposit.ts` |
| `components/udhari-receipt-modal.tsx` | 418 | Extract `UdhariReceiptDetails`, `UdhariReceiptFooter` |
| `components/auth/ForgotPasswordPanel.tsx` | 404 | Extract `OtpRequestForm`, `OtpVerifyForm`, `NewPasswordForm` as step components |
| `components/auth/TwoFactorStep.tsx` | 395 | Extract `MethodPicker`, `OtpEntry`, `TotpEntry` |
| `components/aeps-receipt-modal.tsx` | 392 | Extract `AepsReceiptDetails`, `AepsReceiptFooter` |
| `components/users/UserTable.tsx` | 407 | Extract `UserRow`, `UserStatusBadge`, `UserActionMenu` |
| `components/receipt-export/ReceiptPreviewList.tsx` | 339 | Extract `ReceiptPreviewCard`, `ReceiptPreviewPaginator` |

#### Full oversized file list (backend routes):

| File | Lines | Split plan |
|------|-------|--------|
| `routes/auth/2fa.ts` | 465 | Split into `2fa-totp.ts`, `2fa-otp.ts`, `2fa-backup.ts` |
| `routes/admin-receipt-export.ts` | 451 | Extract DB query logic → `services/receiptExportService.ts` |
| `routes/settings/backups.ts` | 411 | Extract job logic → `services/backupService.ts` |
| `routes/ledger.ts` | 407 | Extract helpers → `lib/ledgerHelpers.ts` |
| `routes/admin.ts` | 313 | Extract queries → `services/adminStatsService.ts` |

**Rule for all splits:** No behaviour changes. Each resulting file must be under 250 lines. Run `pnpm run typecheck` after each group.

---

### 2. Reduce main bundle: 232 kB → 150 kB

> Splitting `App.tsx` + `layout.tsx` enables lazy-loading `AuthProvider` and layout shell — the biggest remaining gain.

- [ ] Split `App.tsx` first (item above)
- [ ] Lazy-load `AuthProvider` after split
- [ ] Lazy-load `layout.tsx` shell after split
- [ ] Re-run production build and verify with `pnpm --filter @workspace/sahu-csc run build`

---

### 3. Fix pre-existing TypeScript errors

| File | Error |
|------|-------|
| `src/components/aeps/AepsTransactionTable.tsx` | `session` possibly null — add null guard |
| `artifacts/api-server/src/lib/queue-client.ts` | ioredis / BullMQ type conflict — add type cast or update types |

Run `pnpm run typecheck` to confirm after fixing.

---

## 🟡 Medium Priority

### 4. Enable email features (Task #2)

Password reset and OTP delivery are implemented but **SMTP is not fully configured** — `SMTP_PASSWORD` secret is missing.

Steps:
1. Generate a Gmail App Password (Google Account → Security → 2-Step Verification → App passwords)
2. Add `SMTP_PASSWORD` as a Replit Secret
3. Restart `API Server` workflow
4. Test via **Forgot Password** flow

> `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_FROM_EMAIL` are already set as shared env vars.

---

### 5. Add `/api/health` route

Logs show repeated `HEAD /api/health → 404`. A health endpoint is common for load balancers and uptime monitors.

```typescript
// artifacts/api-server/src/routes/health.ts
router.get("/health", (req, res) => res.json({ status: "ok" }));
// (GET /api/healthz already exists — just add /api/health as an alias)
```

---

### 6. Fix `autocomplete` attribute on password field

Browser console warning on login page:
> Input elements should have autocomplete attributes (suggested: "current-password")

Fix in `artifacts/sahu-csc/src/components/auth/LoginCredentialsStep.tsx`:
```tsx
<Input type="password" autoComplete="current-password" ... />
```

---

### 7. `dev-dist/` in .gitignore

`artifacts/sahu-csc/dev-dist/workbox-*.js` are large generated files (~5000 lines each).
Confirm they are excluded from git:

```bash
grep "dev-dist" artifacts/sahu-csc/.gitignore
# if missing, add:
echo "dev-dist/" >> artifacts/sahu-csc/.gitignore
```

---

## 🟢 Nice to Have

### 8. Activate Worker Server (BullMQ async)

Without `REDIS_URL`, all notifications/emails run in-process (synchronous). With Redis:
- Emails queue async → API responds faster
- Push notifications are retried automatically on failure
- PDF export jobs offloaded from main process

Steps:
1. Create a free [Upstash Redis](https://upstash.com) database
2. Add `REDIS_URL` (direct TCP `rediss://...`) as a Replit Secret
3. Start `Worker Server` workflow

---

### 9. Sync outdated docs

| File | Issue |
|------|-------|
| `DOCS.md` | Last updated at v3.3.1 — completely out of date |
| `replit.md` | Two re-import notes from July 15 are now stale |
| `architectureV3.md` | Check if new chunks / lazy routes are reflected |

---

### 10. Consolidate doc sprawl

Currently 7 active `.md` files with overlapping content:
`replit.md`, `PROJECT.md`, `DOCS.md`, `CHANGELOG_V3.md`, `architectureV3.md`, `BUGS.md`, `BUILD.md`

Suggested consolidation:
- **`PROJECT.md`** — canonical setup + architecture reference ✅ (already good)
- **`CHANGELOG_V3.md`** — version history ✅ (already good)
- **`replit.md`** — Replit-specific quick-start only (trim to ~200 lines)
- **Archive** `DOCS.md`, `BUILD.md`, `architectureV3.md` into `docs/archive/`

---

## ✅ Already Done (this session)

- [x] `og-image.webp` — OG/Twitter meta tags updated
- [x] `Login` page made lazy — 54 kB removed from main bundle
- [x] `reports.tsx` — recharts lazy via `React.lazy` + `IntersectionObserver`
- [x] New `manualChunks`: `vendor-idb`, `vendor-pdf`, `vendor-pdf-canvas`, `vendor-query-persist`
- [x] SW `globIgnores` updated with stable chunk names
- [x] `Seed Database` workflow — now pushes schema before seeding
- [x] `Worker Server` — clean `exit 0` (no noisy echo)
- [x] `Start application` workflow — removed (was broken duplicate)
- [x] `Project` runButton — now launches `artifacts/sahu-csc: web` correctly
- [x] `PROJECT.md`, `replit.md`, `CHANGELOG_V3.md` — updated to reflect all changes

---

## App rating: 8.2 / 10

| Dimension | Score |
|-----------|-------|
| Features | 9.5/10 |
| Security | 9/10 |
| Architecture | 8/10 |
| PWA / Offline | 8/10 |
| UI / Design | 8/10 |
| Performance | 7/10 |
| Code quality | 6.5/10 |
| DX / Maintainability | 7/10 |

> Fix items 1–3 (oversized files + bundle + TS errors) → rating goes to **9/10**.
