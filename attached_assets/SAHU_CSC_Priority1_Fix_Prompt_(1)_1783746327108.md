# SAHU CSC — Priority 1 Fix Prompt

Source: `OPTIMIZATION.md` Priority 1 section (highest risk, do first).
Scope: test coverage for ledger/receipt/auth, error tracking (Sentry), lazy-load verification for heavy libs.

**General rules:**
- Do not change any existing behavior, route, API contract, or visual output.
- After each phase, run the `Typecheck` workflow and fix all new errors before moving to the next phase.
- Restart `SAHU CSC` after each phase and check the browser console/preview for regressions before continuing.
- Do not mark anything in `OPTIMIZATION.md` as done — that file is edited by hand, not by the agent.

---

## Phase 1 — Automated tests for ledger/receipt/auth logic

**Goal:** cover the three zero-coverage areas — balance calculation, receipt-number generation, auth/session flows.

### 1a. Test setup
- Add Vitest as a dev dependency if not already present (check root `package.json` and each workspace package first — do not duplicate if already installed).
- Create `vitest.config.ts` at the workspace root (or per-package if the monorepo structure requires it) with a `node` test environment for server-side logic.
- Add a `test` script to `package.json`: `"test": "vitest run"`.

### 1b. Ledger balance math tests
- File: `server/__tests__/ledger-balance.test.ts` (adjust path to match actual location of the balance-calculation logic, likely in a service/util file used by `ledger.tsx`'s backend routes).
- Test cases:
  - Opening balance + credit entries = correct running balance.
  - Opening balance − debit entries = correct running balance.
  - Mixed credit/debit sequence produces correct final balance.
  - The specific recent bug-fix scenario (re-derive from the actual fix commit/diff — do not guess; locate the fix and write a regression test that would have caught it).
  - `numeric` columns returned as strings from Drizzle are parsed with `parseFloat()` correctly (no silent NaN).

### 1c. Receipt-number generation tests
- File: `server/__tests__/receipt-numbering.test.ts`.
- Test cases:
  - Format matches `CSC-YYYY-NNNN` exactly (year, zero-padded sequence).
  - Sequence increments correctly within the same year.
  - Sequence resets (or correctly continues, per actual intended behavior — verify against current code, don't assume) on year rollover.
  - Concurrent receipt generation does not produce duplicate numbers (test the actual locking/transaction mechanism in place).

### 1d. Auth/session integration tests
- File: `server/__tests__/auth-session.test.ts`.
- Test cases:
  - Login with valid credentials issues a valid session.
  - Login with invalid credentials is rejected (no session issued).
  - Account lockout triggers after the configured failed-attempt threshold.
  - Idle timeout invalidates a session after the configured duration.
  - RBAC: a role without permission for a given route receives a 403, not a 500 or silent pass-through.

### Acceptance checklist
- [ ] `pnpm test` runs and all new tests pass.
- [ ] Balance math tests cover the recent bug-fix scenario specifically.
- [ ] Receipt numbering tests cover concurrent generation.
- [ ] Auth tests cover login, lockout, idle timeout, and RBAC rejection.
- [ ] No existing behavior changed — only test files added.
- [ ] Typecheck passes.

---

## Phase 2 — Error tracking / APM (Sentry)

**Goal:** replace the log-line-only "slow request" flag with real error tracking and stack-trace capture in production.

### 2a. Setup
- Add `@sentry/node` (server) and `@sentry/react` (client) as dependencies.
- Initialize Sentry server-side at the app entrypoint, before other middleware, using `process.env.SENTRY_DSN` (do not hardcode a DSN; if the env var is absent, Sentry should no-op, not crash).
- Initialize Sentry client-side at the frontend entrypoint, same env-var-gated pattern (`VITE_SENTRY_DSN` or equivalent).

### 2b. Server integration
- Wrap Express error-handling middleware so unhandled errors are reported to Sentry with request context (route, method, user ID if authenticated — no sensitive fields like passwords or full card/account numbers).
- Keep the existing "slow request" log-line behavior as-is; add a Sentry breadcrumb or performance transaction alongside it, don't replace it.

### 2c. Client integration
- Wrap the React app's top-level error boundary so uncaught render errors report to Sentry with the current route and a sanitized user context (user ID/role, not PII like phone numbers).

### 2d. Environment config
- Document the two new env vars (`SENTRY_DSN`, `VITE_SENTRY_DSN`) in whatever env-var reference file the project already uses (check for `.env.example` or similar first).
- Ensure Sentry is disabled by default in local/dev unless the DSN is explicitly set.

### Acceptance checklist
- [ ] A deliberately thrown test error on both server and client appears in Sentry (verify manually, then remove the test trigger).
- [ ] No sensitive data (passwords, full financial account numbers, OTPs) appears in any captured event — confirm by inspecting a sample event payload.
- [ ] App behaves identically with `SENTRY_DSN` unset (no crash, no console spam).
- [ ] Typecheck passes.

---

## Phase 3 — Verify lazy-loading of heavy libraries

**Goal:** confirm `vendor-charts` (420KB), `jspdf` (386KB), and `html2canvas` (201KB) are only loaded when actually needed, not on every page load.

### 3a. Audit current imports
- Search the codebase for static top-level imports of the charting library, `jspdf`, and `html2canvas`.
- For each hit, identify which page/component imports it and whether that import is reachable from a route that loads by default (e.g. dashboard).

### 3b. Convert to dynamic imports where needed
- Any static import feeding a report/export/chart action should become a dynamic `import()` triggered by the user action (e.g. "Export PDF" button click, chart tab open) — not at component mount.
- Use `React.lazy()` + `Suspense` for chart *components*; use plain `await import(...)` inside the handler function for one-off library calls like `jspdf`/`html2canvas` usage in an export handler.

### 3c. Verify with build output
- Run the production build and inspect the output chunk list.
- Confirm `vendor-charts`, `jspdf`, and `html2canvas` each appear as separate chunks, not merged into the main/index bundle.
- Confirm the main bundle size drops accordingly (record before/after sizes).

### Acceptance checklist
- [ ] No page loads any of the three libraries unless the user triggers a chart/export/report action.
- [ ] Build output shows separate chunks for each library.
- [ ] Main bundle size documented before/after.
- [ ] No visual or behavioral regression on report/export/chart features.
- [ ] Typecheck passes.
