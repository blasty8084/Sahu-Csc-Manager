# SAHU CSC — Workflow Guide
**Version 3.5.0 — July 10, 2026**

> **Read this first.**
> This file is the single source of truth for how to start, seed, and troubleshoot the SAHU CSC platform. All workflow definitions live in `.replit`.

---

## Project Architecture at a Glance

```
monorepo root/
├── artifacts/api-server/     — Express 5 API (TypeScript, esbuild, port 8080)
├── artifacts/sahu-csc/       — React + Vite frontend PWA (port 5000)
├── artifacts/mockup-sandbox/ — Vite component preview server for Canvas UI mockups
├── lib/db/                   — Drizzle ORM schema + migrations
├── lib/api-spec/             — OpenAPI spec (source of truth for codegen)
└── lib/api-client-react/     — Auto-generated React Query hooks (Orval)
```

**v3.1.1 changes (July 3, 2026):** Replit environment migration · 7 workflows configured · Backup directory path fixed · Dev script port fixed (21700 → 5000) · TypeScript clean (0 errors across all packages) · ADMIN_PASSWORD + OPERATOR_PASSWORD secrets added · Typecheck, Build Production, Production Preview workflows added

**v3.1.0 changes:** Backup page complete redesign (Minimal Clean) · SQL backup download · Auto-backup scheduler · Selective table import · SQL backup import

**v3.0.0 changes:** Setup Wizard Banner · `/api/setup-status` public endpoint · SMTP configured · VAPID auto-generation · `scripts/post-merge.sh` auto-runs on import

---

## Quick Start (First Time)

Run these steps **in order** on a fresh clone or new Replit import:

```
1 — pnpm install                                  (install all workspace dependencies)
2 — pnpm --filter @workspace/db run push          (create DB tables from Drizzle schema)
3 — Run "Seed Database" workflow                   (insert users from ADMIN_PASSWORD + OPERATOR_PASSWORD secrets)
4 — Click the ▶ Run button                        (starts API Server + SAHU CSC together via Project workflow)
```

### Step 1 — Install dependencies

```bash
pnpm install
```

Run once after cloning. Safe to re-run at any time.

### Step 2 — Push database schema

```bash
pnpm --filter @workspace/db run push
```

Creates all PostgreSQL tables from the Drizzle schema.

> ⚠️ **WARNING:** Can wipe table data on destructive schema changes. Always re-seed immediately after running this.

### Step 3 — Seed the database

Run the **`Seed Database`** workflow in Replit, or run manually from the shell:

```bash
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts
```

Requires `ADMIN_PASSWORD` and `OPERATOR_PASSWORD` secrets to be set in Replit Secrets (🔒 tab).

| Username | Password | Role |
|----------|----------|------|
| `admin` | value of `ADMIN_PASSWORD` secret | Admin |
| `operator` | value of `OPERATOR_PASSWORD` secret | Operator |

### Step 4 — Start the application

Click the **▶ Run button** (Project workflow). Both servers start in parallel. Wait **10–15 seconds** before opening the app.

---

## All Workflows Reference

| Workflow | Port | Auto-starts | Purpose |
|----------|------|-------------|---------|
| `SAHU CSC` | 5000 → :80 | ✅ Yes | Vite frontend webview (dev server) |
| `API Server` | 8080 | ✅ Yes | Express API (pre-built dist/index.mjs) |
| `Build API` | — | ❌ Manual | Rebuild API after backend source changes |
| `Seed Database` | — | ❌ Manual | One-shot DB seeder (requires secrets) |
| `Typecheck` | — | ❌ Manual | TypeScript check across all packages |
| `Build Production` | — | ❌ Manual | Full production build (API + frontend + PWA) |
| `Production Preview` | 5000 | ❌ Manual | Build + serve production bundle on port 5000 |

---

### `SAHU CSC` ⭐ PRIMARY FRONTEND — Starts with Project

**Port:** `5000` → external `:80`
**Command:**
```bash
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run dev
```

**dev script (in `artifacts/sahu-csc/package.json`):**
```bash
fuser -k ${PORT:-5000}/tcp 2>/dev/null; sleep 1; vite --config vite.config.ts --host 0.0.0.0
```

Kills any stale process on the configured port before Vite starts, preventing `EADDRINUSE` on rapid restarts.

> 💡 Vite proxy in `vite.config.ts` forwards `/api/*` → `http://localhost:8080`.

---

### `API Server` ⭐ PRIMARY API — Starts with Project

**Port:** `8080`
**Command:**
```bash
PORT=8080 NODE_ENV=development node --enable-source-maps artifacts/api-server/dist/index.mjs
```

Runs the **pre-built** ESM bundle from `artifacts/api-server/dist/index.mjs`.

> 💡 After making backend source changes, run **Build API** workflow first, then restart **API Server**.

**To force a rebuild:**
```bash
# Run the Build API workflow, or:
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server run build
```

---

### `Build API`

**Purpose:** Rebuild the API server ESM bundle after source changes
**Command:**
```bash
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server run build
```

Run this after editing any file in `artifacts/api-server/src/`, then restart `API Server`.

---

### `Seed Database`

**Purpose:** Create/reset admin and operator user accounts
**Command:**
```bash
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts
```

**When to run:**
- First-time setup after schema push
- After `drizzle-kit push` (schema push may wipe table data)
- When login fails with "Invalid credentials" (empty DB)
- When you want to reset admin/operator passwords

**Requires:** `ADMIN_PASSWORD` and `OPERATOR_PASSWORD` Replit Secrets must be set.

**What it seeds:**
- Admin user (username: `admin`, password: from `ADMIN_PASSWORD` secret)
- Operator user (username: `operator`, password: from `OPERATOR_PASSWORD` secret)
- 22 CSC services across 5 categories
- Default application settings
- Welcome notification

---

### `Typecheck`

**Purpose:** Run TypeScript type checking across all packages
**Command:**
```bash
pnpm run typecheck:libs && pnpm -r --filter "./artifacts/**" --if-present run typecheck
```

Run this before submitting code or before a production build. Currently passes with **0 errors**.

---

### `Build Production`

**Purpose:** Full production build — API bundle + Vite frontend + PWA service worker
**Command:**
```bash
pnpm run typecheck:libs && pnpm --filter @workspace/api-server run build && PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run build
```

Runs typecheck → API esbuild → Vite build → Workbox SW. Output in `artifacts/api-server/dist/` and `artifacts/sahu-csc/dist/public/`.

---

### `Production Preview`

**Purpose:** Build everything and serve the production bundle on port 5000 (replace dev server)
**Command:**
```bash
fuser -k 5000/tcp 2>/dev/null; sleep 1; pnpm run typecheck:libs && pnpm --filter @workspace/api-server run build && PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run build && PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run serve
```

**How to use:**
1. Stop the **SAHU CSC** dev workflow
2. Run **Production Preview** — builds then serves the production bundle
3. When done, stop it and restart **SAHU CSC** to go back to dev mode

---

## Port Map

| Local Port | External Port | Workflow | Notes |
|-----------|--------------|---------|-------|
| `5000` | `:80` | `SAHU CSC` / `Production Preview` | Main app URL |
| `8080` | `:8080` | `API Server` | API server |
| `21700` | — | Platform canvas artifact | Remove via ⋮ → Delete in Preview |

---

## Environment Variables

Set in `.replit` under `[userenv.shared]` — applied to all workflows automatically:

| Variable | Value | Purpose |
|----------|-------|---------|
| `PORT` | `5000` | Default port |
| `BASE_PATH` | `/` | Vite base URL |
| `VAPID_PUBLIC_KEY` | set | Web push notification public key |
| `VAPID_PRIVATE_KEY` | set | Web push notification private key |
| `VAPID_EMAIL` | `mailto:uttamsahu0747@gmail.com` | VAPID contact email |
| `API_PORT` | `8080` | API server port reference |

**Secrets** (set in Replit Secrets — NOT in `.replit`):

| Secret | Purpose |
|--------|---------|
| `DATABASE_URL` | PostgreSQL connection string (auto-provisioned by Replit) |
| `SESSION_SECRET` | Express session signing secret |
| `ADMIN_PASSWORD` | Password for the admin account (used by Seed Database) |
| `OPERATOR_PASSWORD` | Password for the operator account (used by Seed Database) |

---

## Verifying the App is Running

```bash
# Check API health
curl -s http://localhost:8080/api/healthz
# Expected: {"status":"ok","database":{"status":"ok"},...}

# Check frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/
# Expected: 200
```

Or open the **SAHU CSC** preview tab → the splash screen + login page should appear within 10–15 seconds.

---

## Common Problems & Fixes

### Port already in use (`EADDRINUSE`)

```bash
fuser -k 5000/tcp 2>/dev/null   # free frontend port
fuser -k 8080/tcp 2>/dev/null   # free API port
```

Then restart the affected workflow.

### Login fails / "Invalid credentials"

The database may be empty. Ensure `ADMIN_PASSWORD` and `OPERATOR_PASSWORD` are set in Secrets, then run **Seed Database** workflow.

### API changes not reflected

Run **Build API** workflow, then restart **API Server**.

### Frontend shows blank page or old version

Clear the service worker cache:
Browser DevTools → Application → Storage → Clear site data → Reload

### Database tables missing

```bash
pnpm --filter @workspace/db run push
# Then run Seed Database workflow
```

### TypeScript errors

Run **Typecheck** workflow to see all errors. The codebase is currently clean (0 errors).

---

## Workflow Decision Tree

```
Starting the project?
│
├── First time / fresh clone?
│     └── pnpm install → db push → Seed Database → ▶ Run button
│
├── Normal day / already set up?
│     └── ▶ Run button
│
├── Made backend code changes?
│     └── Run "Build API" → restart "API Server"
│
├── Schema changed (added/removed columns)?
│     └── pnpm db push → Seed Database → restart workflows
│
├── Data looks wrong / empty DB?
│     └── Run "Seed Database" workflow
│
├── Want to check TypeScript?
│     └── Run "Typecheck" workflow
│
├── Ready to deploy?
│     └── Run "Build Production" → click Deploy
│
└── Testing production build locally?
      └── Stop "SAHU CSC" → Run "Production Preview"
```

---

## For AI Agents

When starting a new session on this project:

1. **Read `WORKFLOWS.md`** — understand workflows and ports
2. **Read `BUILD.md`** — full project overview, tech stack, architecture
3. **Check workflow status** — confirm `API Server` and `SAHU CSC` are running
4. **Verify API** — `curl http://localhost:8080/api/healthz` must return 200

### Current workflow state (v3.1.1)

```
AUTO-STARTS (via Project run button):
  SAHU CSC      → PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run dev
  API Server    → PORT=8080 NODE_ENV=development node --enable-source-maps artifacts/api-server/dist/index.mjs

MANUAL ONLY:
  Build API         → rebuild API ESM bundle
  Seed Database     → requires ADMIN_PASSWORD + OPERATOR_PASSWORD secrets
  Typecheck         → 0 errors as of 2026-07-03
  Build Production  → typecheck + API build + Vite build + PWA SW
  Production Preview → build + vite preview on port 5000
```

### Never do

- Run `pnpm --filter @workspace/db run push` without immediately re-seeding
- Edit files in `lib/api-client-react/src/generated/` — auto-generated by Orval
- Remove `connect-pg-simple` from `external` in `build.mjs` — breaks all session persistence
- Add `willChange: transform` to any ancestor of the bottom `<nav>` — breaks `position: fixed`

---

## File Locations

| File | Purpose |
|------|---------|
| `.replit` | All workflow definitions, port maps, env vars |
| `WORKFLOWS.md` | This file — workflow guide |
| `BUILD.md` | Full project overview, tech stack, architecture |
| `CHANGELOG_V3.md` | v3.x detailed changelog |
| `UPDATES.md` | Automatic session-by-session change log |
| `replit.md` | Project README + user preferences |
| `artifacts/api-server/package.json` | API build/start scripts |
| `artifacts/sahu-csc/package.json` | Frontend dev/build/serve scripts |
| `artifacts/sahu-csc/vite.config.ts` | Vite config (port, proxy, PWA, allowedHosts) |
| `lib/db/src/schema/` | Drizzle ORM table definitions |
| `lib/api-spec/openapi.yaml` | OpenAPI spec — source of truth for codegen |
