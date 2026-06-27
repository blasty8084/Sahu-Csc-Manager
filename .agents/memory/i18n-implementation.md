---
name: i18n implementation
description: i18next + react-i18next multi-language support (en/hi/or); architecture decisions and translation key gotchas
---

## Architecture
- Library: `i18next` + `react-i18next` installed in `@workspace/sahu-csc`
- Init file: `artifacts/sahu-csc/src/lib/i18n.ts` — reads localStorage key `sahu-lang`, imports all 3 locale JSON files, exports `setLanguage(lang)`
- Locale files: `artifacts/sahu-csc/src/locales/{en,hi,or}/translation.json` (~200 keys each)
- Language switcher: `artifacts/sahu-csc/src/components/language-switcher.tsx` — 3-button pill (EN|हिं|ଓଡ଼), calls `setLanguage()` + PATCHes `/api/preferences` when logged in
- i18n imported as first import in `main.tsx` (side-effect init)
- No React Provider needed with react-i18next v12+ — the side-effect import handles init

## What's fully translated (t() calls throughout)
- `layout.tsx` — all nav labels, greeting, sidebar footer
- `sync-status-bar.tsx`, `pwa-install-banner.tsx`
- `dashboard.tsx` — both MobileDashboard and DesktopDashboard
- `login.tsx` — key visible strings (title, management platform, trusted/secure/reliable, remember me, forgot password, submit, register CTA)

## What has import + hook but no t() calls yet (English fallback)
All remaining pages: ledger, udhari, udhari-customer, aeps, reports, notifications, services, users, sessions, audit-logs, backups, broadcast, profile, register, forgot-password

## Key translation key gotchas
- Use `t('common.income')` and `t('common.expense')` for income/expense labels (NOT `dashboard.income` / `dashboard.expense`)
- Use `t('reports.income_vs_expenses')` for the chart title in dashboard (NOT `dashboard.income_vs_expenses`)
- `pwa.queued_n` has `{{n}}` interpolation: `t('pwa.queued_n', { n: count })`
- `pwa.failed_sync` has NO interpolation — prepend count as JSX: `{count} {t('pwa.failed_sync')}`
- reports.tsx MobileReports: MOBILE_TABS.find() parameter was named `t` — renamed to `tab` to avoid shadowing useTranslation's `t`

## Preferences API
- Backend already supports `language: z.enum(["en", "hi", "or"])` in user_preferences
- `setLanguage()` in language-switcher.tsx patches `/api/preferences` when user is logged in
- localStorage `sahu-lang` persists selection even when logged out

**Why:** No Provider-based setup needed because react-i18next v12+ uses module-level init; the side-effect import in main.tsx is the only setup required.
