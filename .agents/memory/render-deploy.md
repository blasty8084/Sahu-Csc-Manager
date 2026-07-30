---
name: Render free-tier deploy
description: How the SAHU CSC API is configured for Render free-tier — build script, sharp binary, startup-init seeding pattern.
---

# Render Free-Tier Deploy

## Rule
`rootDir` in `render.yaml` must be `.` (workspace root) so pnpm workspace resolution works.
Build command calls `bash render-build.sh` (workspace root script).
Start command: `node --enable-source-maps artifacts/api-server/dist/index.mjs`.

**Why:** `rootDir: artifacts/api-server` breaks `pnpm install` — the lockfile and workspace config live at the repo root.

## Key files
- `render.yaml` — Blueprint config; all env vars with `sync: false` require manual entry on first deploy
- `render-build.sh` — installs pnpm, runs `pnpm install --frozen-lockfile`, then builds
- `render.env` — reference file for manual env var setup (not loaded automatically)
- `RENDER_DEPLOY.md` — step-by-step guide for deploying

## Sharp native binary
`sharp` must be listed in `onlyBuiltDependencies` in `pnpm-workspace.yaml`.
If omitted, pnpm skips its postinstall script and the Linux native binary is never downloaded → runtime crash.

## No-SSH first-boot seeding
Render free tier has no SSH shell. `startup-init.ts` runs at every server start:
- Reads `ADMIN_PASSWORD` + `OPERATOR_PASSWORD` from env
- Creates admin/operator if they don't exist, or resets their passwords
- Writes `startupSeedDone` to the `settings` table to skip bcrypt hashing on subsequent boots
- Called from `src/index.ts` before `ensureEncryptionKey()`

## Session table
`connect-pg-simple` with `createTableIfMissing: true` auto-creates the `session` table. No manual SQL needed on Render.

## How to apply
Any future Render service in this workspace: copy the rootDir + build script pattern. Any new service that needs first-boot seeding: follow the startup-init pattern (check existence → hash → insert → flag in settings).
