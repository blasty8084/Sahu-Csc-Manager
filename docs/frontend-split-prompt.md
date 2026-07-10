# Frontend Oversized-File Split Prompt

Status: written plan only — not executed yet.

**General rules for every file below:**
- Do not change any behavior, route, API call, `data-testid`, or visual output.
- Extract into a `<page-name>/` folder next to the original file, or a `components/<page-name>/` subfolder — keep the original file as a thin orchestrator that imports and composes the extracted pieces.
- Move pure UI subsections into their own components; move non-UI logic (data fetching hooks, formatters, validators, constants) into their own hooks/utils files.
- Preserve all existing imports elsewhere in the codebase — the original file path and default export must keep working unchanged.
- After each file, run the `Typecheck` workflow and fix all new errors before moving to the next file.
- Restart `SAHU CSC` after each split and check the browser console/preview for regressions before continuing.

---

## 1. `src/pages/aeps.tsx` (2470 lines) — split first, largest
Identify the distinct AEPS operation sections (e.g. cash withdrawal, mini statement, balance enquiry, transaction history/table, any modals). Extract:
- Each operation form/section into `components/aeps/<Section>Form.tsx`
- Shared AEPS state/logic (mutations, query hooks) into `hooks/useAeps.ts` or similar
- Any large constants (service lists, validation schemas) into `aeps.constants.ts`

Keep `aeps.tsx` as the page shell that wires sections together with tabs/state.

## 2. `src/pages/users.tsx` (2111 lines)
Split into:
- `components/users/UserTable.tsx` (list/table rendering)
- `components/users/UserFormDialog.tsx` (create/edit form modal)
- `components/users/UserFilters.tsx` (search/filter bar)
- `hooks/useUsers.ts` for query/mutation logic

Keep role-based permission checks exactly where they are today; do not relocate access-control logic into a shared file without verifying it's not duplicated elsewhere.

## 3. `src/pages/ledger.tsx` (1652 lines)
Split into:
- `components/ledger/LedgerTable.tsx`
- `components/ledger/LedgerEntryForm.tsx` (add/edit modal)
- `components/ledger/LedgerFilters.tsx`
- `hooks/useLedger.ts`

Note: this file was recently touched for a balance-recalculation bug fix — preserve that logic exactly; do not re-derive balance calculations independently in the split.

## 4. `src/pages/login.tsx` (1340 lines)
Split into:
- `components/auth/LoginForm.tsx`
- `components/auth/RegisterForm.tsx` (if register is inline here)
- `components/auth/AuthHero.tsx` (marketing/illustration side panel)

Preserve the documented mobile design (h-screen + compact navy header + slide-up card, "Forgot Password?" styling, dashed blue "Register here" card) and the `setQueryData`-based login redirect logic exactly — do not refactor that flow's timing.

## 5. `src/pages/reports.tsx` (1301 lines)
Split into:
- `components/reports/ReportFilters.tsx`
- `components/reports/ReportChart.tsx` (or per-chart-type components if there are several)
- `components/reports/ReportSummaryCards.tsx`
- `hooks/useReports.ts`

Preserve i18n keys exactly as-is (`reports.income_vs_expenses`, not `dashboard.*`).

## 6. `src/pages/receipt-export.tsx` (1219 lines)
Split into:
- `components/receipt-export/ExportFilters.tsx` (date range, user filter)
- `components/receipt-export/ReceiptPreviewList.tsx`
- `hooks/useReceiptExport.ts` (count/download/excel API calls)

This page calls the backend routes recently split in `admin-receipt-export.ts` — verify all three endpoints (`/count`, `/download`, `/excel`) still get called with identical query params after the split.

## 7. `src/pages/profile.tsx` (895 lines)
Split into:
- `components/profile/ProfileInfoForm.tsx`
- `components/profile/PasswordChangeForm.tsx`
- `components/profile/NotificationSettings.tsx` (if present)

## 8. `src/pages/backups.tsx` (892 lines)
Split into:
- `components/backups/BackupList.tsx`
- `components/backups/BackupActions.tsx` (create/restore/download buttons + confirmation dialogs)
- `hooks/useBackups.ts`
