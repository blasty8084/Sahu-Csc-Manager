# SAHU CSC — Automatic Update Log
**Auto-generated. Updated every session.**

> This file records every meaningful change made to the codebase, session by session.
> Most recent changes are at the top. One section per work session.
> For full feature history see `CHANGELOG_V3.md` (v3.x) and `changelogV2.md` (v2.x).

---

## Session: 2026-07-03 — Replit Environment Migration & TypeScript Clean

**Version:** 3.1.1
**Status:** ✅ Complete — 0 TypeScript errors, all workflows running

### What Was Done

#### 1. Replit Environment Migration
- Ran `pnpm install` — all monorepo workspace dependencies installed
- Pushed Drizzle schema via `pnpm --filter @workspace/db run push` — all 15 PostgreSQL tables created
- Built API bundle via `pnpm --filter @workspace/api-server run build` — `dist/index.mjs` generated
- Seeded database — admin and operator accounts created from `ADMIN_PASSWORD` + `OPERATOR_PASSWORD` secrets
- Configured `ADMIN_PASSWORD` and `OPERATOR_PASSWORD` in Replit Secrets

#### 2. Workflow Setup (7 workflows configured)

| Workflow | Change |
|----------|--------|
| `SAHU CSC` | Configured — auto-starts frontend dev server on port 5000 |
| `API Server` | Configured — auto-starts pre-built API bundle on port 8080 |
| `Build API` | Added — rebuilds API esbuild bundle on demand |
| `Seed Database` | Configured — uses tsx to run seed.ts, requires secrets |
| `Typecheck` | Added — runs typecheck:libs + typecheck across all artifacts |
| `Build Production` | Added — full typecheck + API + Vite + PWA build |
| `Production Preview` | Added — build + vite preview on port 5000 |

#### 3. Bug Fixes

**Backup directory path (`artifacts/api-server/src/routes/settings.ts`)**
- Was: `../../backups` (resolved to workspace root — wrong when running from dist/)
- Fixed: `backups` (relative to `process.cwd()` which is `artifacts/api-server/`)
- Added: `mkdirSync(BACKUP_DIR, { recursive: true })` before multer init (prevents crash on missing dir)
- Same fix applied to: `backup-scheduler.ts`, `scripts/backup.ts`, `scripts/restore.ts`

**Frontend dev script port (`artifacts/sahu-csc/package.json`)**
- Was: `fuser -k ${PORT:-21700}/tcp` (wrong port — killed canvas artifact instead of self)
- Fixed: `fuser -k ${PORT:-5000}/tcp`

**Missing `logger` import (`artifacts/api-server/src/routes/settings.ts`)**
- Added: `import { logger } from "../lib/logger.js"`

#### 4. TypeScript Fixes — API Server (6 errors → 0)

| File | Error | Fix |
|------|-------|-----|
| `routes/settings.ts` | `logger` used but not imported | Added `import { logger }` |
| `routes/broadcast.ts` | `url` typed `string \| null` but param needs `string \| undefined` | Changed to `url ?? undefined` |
| `lib/auth.ts` | `auditLog` called with `null` userId but type was `number` | Changed signature to `userId: number \| null`, added null guard |
| `routes/admin-receipt-export.ts` | `archiver()` not callable as function | Cast: `(archiver as any)('zip', ...)` |
| `lib/monthly-export.ts` | Same archiver callable issue | Same cast fix |
| `routes/admin-receipt-export.ts` | `err` in catch block typed as `unknown` | Annotated as `err: Error` |

#### 5. TypeScript Fixes — Frontend (7 errors → 0)

| File | Error | Fix |
|------|-------|-----|
| `pages/aeps.tsx` | `useEffect` used but not imported | Added `useEffect` to React import |
| `pages/reports.tsx` | `AreaChart`, `Area` used but not imported | Added imports from recharts |
| `pages/reports.tsx` | `Skeleton` used but not imported | Added `Skeleton` import from `@/components/ui/skeleton` |
| `pages/udhari.tsx` | `Skeleton` used but not imported | Added `Skeleton` import |
| `pages/users.tsx` | `Skeleton` used but not imported | Added `Skeleton` import |
| `pages/ledger.tsx` | `mutateAsync` called with flat object, expected `{data:{...}}` | Wrapped args in `{ data: { ... } }` (Orval-generated wrapper) |
| `hooks/use-toast.ts` | `ReactNode` passed where `string` expected | Cast to `as string` |
| `components/whats-new-modal.tsx` | Function not guaranteed to return `ReactNode` | Added `return undefined` to all code paths |

#### 6. Production Build Verification
- Full `Build Production` workflow run: ✅ passed
- API bundle: 5.0 MB (esbuild ESM)
- Frontend: all chunks under Vite threshold
- PWA service worker: 76 precache entries, 5254 KiB

---

## Session: 2026-06-30 — v3.1.0 Backup & Restore + v3.0.0 Setup Wizard

**Version:** 3.1.1 (tagged post-session)

### What Was Done

- Backup page complete redesign (Minimal Clean — 2-col grid, navy borders, saffron CTAs)
- `GET /api/backups/:id/download` — streams `.sql` to browser
- `POST /api/backups/analyze` — parse pg_dump COPY blocks, return table list
- `POST /api/backups/selective-import` — replay chosen tables, FK checks disabled
- `GET/POST /api/backups/schedule` — read/write cron schedule
- `backup-scheduler.ts` — `node-cron` daily/weekly/custom auto-backup with retention
- Setup Wizard Banner (admin-only, session-dismissed, red/yellow severity)
- `GET /api/setup-status` — public endpoint, no auth, returns missing secrets list
- `scripts/post-merge.sh` — auto-runs `pnpm install` + `drizzle-kit push` on import
- Backup page redesign documented in `CHANGELOG_V3.md`

---

## How This File Is Maintained

This file is updated at the end of every agent work session. Each entry records:
- What was built or changed and why
- Any bug fixes with before/after detail
- New workflows, endpoints, or pages added
- TypeScript or build issues resolved

**Format:**
```
## Session: YYYY-MM-DD — Short Title

**Version:** x.x.x
**Status:** ✅ / 🚧 / ❌

### What Was Done
...sections as needed...
```
