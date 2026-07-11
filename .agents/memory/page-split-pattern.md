---
name: Large page file split pattern
description: How this project splits oversized pages/*.tsx files into components/<page>/ and hooks without changing behavior
---

When splitting a large `pages/<name>.tsx` file into smaller pieces in this project, the pattern that works cleanly:

- Create `components/<page-name>/` for extracted UI pieces (tabs, tables, filters, form dialogs, small confirm dialogs) and `hooks/use<Page>.ts` for non-UI data hooks (React Query wrappers) and shared types.
- Pull self-contained tab/section components out wholesale first (they have no prop-wiring cost), then extract prop-driven pieces (filters, tables, dialogs) with explicit props mirroring the original local variable names — this keeps the diff mentally traceable against the original.
- Keep in the orchestrator: all page-level state, all mutation/handler functions, header/tab-strip layout, and the wiring that renders child components. The orchestrator's default export and import path must stay unchanged.
- A `.tsx` (not `.ts`) extension is required for any extracted hook/util file that returns JSX (e.g. a `getDeviceIcon` helper returning an icon element).

**Why:** keeps behavior, routes, API calls, and data-testids provably identical while shrinking files by ~70%; consistent structure makes future splits in the same codebase predictable.

**How to apply:** after writing all extracted files and rewriting the orchestrator, run the project's Typecheck workflow, then restart the dev workflow. Verify functionality with authenticated `curl` calls to the backing API endpoints (login via the ADMIN_PASSWORD/OPERATOR_PASSWORD secret, then hit each endpoint the page calls) rather than the Screenshot tool — screenshots use an unauthenticated browser context and will only show the login page for any protected route.
