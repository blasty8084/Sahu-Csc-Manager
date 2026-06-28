---
name: i18n implementation
description: i18next + react-i18next multi-language support (en/hi/or); architecture decisions and translation key gotchas
---

## Architecture
- Library: `i18next` + `react-i18next` installed in `@workspace/sahu-csc`
- Init file: `artifacts/sahu-csc/src/lib/i18n.ts` — reads localStorage key `sahu-lang`, imports all 3 locale JSON files, exports `setLanguage(lang)`
- Locale files: `artifacts/sahu-csc/src/locales/{en,hi,or}/translation.json` (~875 keys each as of v2.8.0)
- Language switcher: `artifacts/sahu-csc/src/components/language-switcher.tsx` — 3-button pill (EN|हिं|ଓଡ଼), calls `setLanguage()` + PATCHes `/api/preferences` when logged in
- i18n imported as first import in `main.tsx` (side-effect init)
- No React Provider needed with react-i18next v12+ — the side-effect import handles init

## Translation status (v2.8.0) — ALL PAGES COMPLETE
Every page has `import { useTranslation } from "react-i18next"` + `const { t } = useTranslation()` and all visible UI strings use t() calls:
- layout.tsx, dashboard.tsx, login.tsx, register.tsx, forgot-password.tsx
- ledger.tsx, aeps.tsx (DailyTab + AllTransactionsTab), udhari.tsx, udhari-customer.tsx
- reports.tsx, notifications.tsx, services.tsx, profile.tsx, preferences.tsx
- users.tsx, users-overview.tsx, sessions.tsx, audit-logs.tsx
- backups.tsx, broadcast.tsx, pwa-status.tsx, server-health.tsx, download-app.tsx
- receipts-verify.tsx, about.tsx

## Top-level JSON sections in translation.json
common, nav, auth, dashboard, ledger, udhari, aeps, profile, sessions, reports,
notifications, services, users, audit, backups, broadcast, pwa, receipts,
download_app, server_health, language_switcher, about

## Key translation key gotchas
- Use `t('common.income')` and `t('common.expense')` (NOT `dashboard.income` / `dashboard.expense`)
- Use `t('reports.income_vs_expenses')` for the chart title (NOT `dashboard.income_vs_expenses`)
- `pwa.queued_n` has `{{n}}` interpolation: `t('pwa.queued_n', { n: count })`
- `pwa.failed_sync` has NO interpolation — prepend count as JSX: `{count} {t('pwa.failed_sync')}`
- reports.tsx MobileReports: MOBILE_TABS.find() parameter was renamed `tab` to avoid shadowing `t`
- `about.connectivity` labels reuse `t("pwa.offline")` for "Offline" state

## i18n string constant placement rules
- Arrays/objects containing translated strings (TYPE_CONFIG, PRIORITY_CONFIG, tab labels) must be declared INSIDE the component function body, after `const { t } = useTranslation()` — never at module scope
- Sub-components declared at file scope that render translated text must call their OWN `useTranslation()` hook (e.g. StatusBadge in server-health.tsx)

## Preferences API
- Backend: `language: z.enum(["en", "hi", "or"])` in user_preferences
- Language switcher patches `/api/preferences` when user is logged in
- localStorage `sahu-lang` persists selection even when logged out

**Why:** No Provider-based setup needed because react-i18next v12+ uses module-level init; the side-effect import in main.tsx is the only setup required.
