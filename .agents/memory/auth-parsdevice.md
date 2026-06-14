---
name: Auth route parseDevice placement
description: parseDevice must be called exactly once per route handler to avoid esbuild duplicate-const build errors.
---

`parseDevice(userAgent)` in `artifacts/api-server/src/lib/auth.ts` must be called **once per route handler**, before any early-return branches (failed-inactive, failed-locked, failed-password, success).

**Why:** esbuild treats duplicate `const` declarations within the same scope as a build error. If `parseDevice` were called inside each branch (e.g. inside the locked-check `if` and also inside the success block), esbuild would emit a compile error at bundle time.

**How to apply:** In the login handler in `artifacts/api-server/src/routes/auth.ts`, call `const { browser, os, deviceInfo, deviceType } = parseDevice(req.headers["user-agent"] ?? "")` at the very top of the handler before any `if`/`return` branches, and reuse the destructured values in all branches.
