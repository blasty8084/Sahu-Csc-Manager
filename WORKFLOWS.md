# SAHU CSC — Workflow Guide

> **Read this first.**
> This file is the single source of truth for how to start, seed, and troubleshoot the SAHU CSC platform. All workflow definitions live in `.replit`.

---

## Project Architecture at a Glance

```
monorepo root/
├── artifacts/api-server/   — Express 5 API (TypeScript, esbuild, port 8082 in dev)
├── artifacts/sahu-csc/     — React + Vite frontend PWA (port 5000 in dev)
├── artifacts/mockup-sandbox/ — Vite component preview server (port 8081)
├── lib/db/                 — Drizzle ORM schema + migrations
├── lib/api-spec/           — OpenAPI spec (source of truth for codegen)
└── lib/api-client-react/   — Auto-generated React Query hooks (Orval)
```

---

## Quick Start (First Time)

Run these four steps **in order** on a fresh clone or new Replit import:

```
1 — pnpm install                          (install all workspace dependencies)
2 — pnpm --filter @workspace/db run push  (create DB tables from Drizzle schema)
3 — Run "Seed Database" workflow           (insert users, services, settings)
4 — Run "Start application" workflow       (start API + frontend together)
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
pnpm --filter @workspace/api-server run seed
```

Default accounts seeded:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `operator` | `operator123` | Operator |

> ℹ️ **Note on the Seed Database workflow command:** The live workflow definition may show `PORT=8080 NODE_ENV=development npx tsx ...` which fails because `tsx` is not globally available. If this happens, run the shell command above directly instead. To permanently fix the workflow, run `removeWorkflow("Seed Database")` in Replit Agent's code_execution tool, then reconfigure it with `pnpm --filter @workspace/api-server run seed`.

### Step 4 — Start the application

Run the **`Start application`** workflow. Wait **20–30 seconds** for both servers to start before opening the app.

---

## All Workflows Reference

This project has **10 workflows** — the maximum allowed by Replit. They fall into two categories:

| Category | Count | Can be deleted? |
|----------|-------|----------------|
| **Artifact-managed** (auto-created by Replit) | 3 | ❌ No — system-managed |
| **User-defined** | 7 | ✅ Yes |

---

### ARTIFACT-MANAGED WORKFLOWS (System — Cannot Delete)

These are auto-created by Replit when artifacts are registered. They start automatically when the project loads and cannot be removed via the workflow panel or API.

---

#### `artifacts/api-server: API Server`

**Purpose:** Replit artifact preview for the API server  
**Command:** `pnpm --filter @workspace/api-server run dev`  
**Port:** `8080` → external `:8080`  
**Auto-start:** Yes (system-managed)

> ⚠️ This workflow **competes for port 8080** with the user-defined `API Server` workflow. Only one can run at a time. Start application uses port **8082** to avoid this conflict.

---

#### `artifacts/sahu-csc: web`

**Purpose:** Replit artifact preview for the frontend  
**Command:** `pnpm --filter @workspace/sahu-csc run dev`  
**Port:** `21700` → external `:3000`  
**Auto-start:** Yes (system-managed)

> ℹ️ This serves the frontend on port 21700. It is separate from `Start application` which serves on port 5000. For full development (with the API proxy), always use `Start application` — not this artifact workflow.

---

#### `artifacts/mockup-sandbox: Component Preview Server`

**Purpose:** Replit artifact preview for Canvas UI mockups  
**Command:** `pnpm --filter @workspace/mockup-sandbox run dev`  
**Port:** `8081` → external `:8081`  
**Auto-start:** Yes (system-managed)

---

### USER-DEFINED WORKFLOWS

---

#### `Start application` ⭐ PRIMARY — Use This for Development

**Mode:** sequential (runs API + Frontend in a single shell command)  
**Ports:** API on `8082`, Frontend on `5000` (mapped to external `:80`)  
**Preview URL:** The Replit preview pane (`.replit.dev` domain)

**Command:**
```bash
fuser -k 5000/tcp 2>/dev/null; fuser -k 8082/tcp 2>/dev/null; \
PORT=8082 pnpm --filter @workspace/api-server run dev & \
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run dev
```

**What it starts:**

| Process | Port | Access |
|---------|------|--------|
| Express 5 API server | `8082` | Internal — proxied to `/api/*` by Vite |
| Vite + React frontend | `5000` | External — mapped to `:80` (Replit proxy) |

**Startup sequence:**
1. Kill any stale process on ports 5000 and 8082
2. Start API server in background — esbuild compiles TypeScript → `dist/index.mjs` → Express on 8082
3. Start Vite in foreground — serves React app on 5000, proxies `/api/*` → `localhost:8082`
4. Replit waits for port 5000 to open before marking the workflow ready

**API build time:** ~5–10 s (esbuild TypeScript compilation)  
**Total startup time:** ~15–20 s

> 💡 This uses port **8082** (not 8080) because `artifacts/api-server: API Server` permanently holds port 8080. The Vite proxy in `vite.config.ts` already points to 8082.

---

#### `Seed Database`

**Mode:** sequential (one-shot, exits when done)  
**Output:** console  
**Command:** `pnpm --filter @workspace/api-server run seed`

**When to run:**
- First-time setup
- After `drizzle-kit push` (schema push may wipe table data)
- After manually clearing the database
- When login fails with "Invalid credentials" (empty DB)

**What it seeds:**
- Users: `admin` / `admin123` (admin) + `operator` / `operator123` (operator)
- 22 CSC services across 5 categories
- Default application settings
- Welcome notification

> ⚠️ The live workflow definition may show a broken command (`npx tsx ...`). Run `pnpm --filter @workspace/api-server run seed` directly from the shell if the workflow fails.

---

#### `API Server`

**Mode:** sequential  
**Output:** console  
**Command:** `PORT=8080 pnpm --filter @workspace/api-server run dev`  
**Port:** `8080`

**Purpose:** Run only the API server in isolation, on port 8080.

> ⚠️ **Port conflict:** The `artifacts/api-server: API Server` artifact workflow also uses port 8080 and starts automatically. This means `API Server` will almost always fail with `EADDRINUSE: 8080` unless the artifact workflow has stopped. Use `Start application` instead for normal development — it runs the API on port 8082 which is conflict-free.

---

#### `API Server (artifacts/api-server)`

**Mode:** sequential  
**Output:** console  
**Command:** `pnpm --filter @workspace/api-server run dev`  
**Port:** `5000` (inherits global `PORT=5000` from `[userenv.shared]`)

**Purpose:** Run the API server using the default global port (5000). Intended for isolated use when the frontend is not needed.

> ⚠️ **Port conflict:** When `Start application` is running, port 5000 is held by the Vite frontend. Stop `Start application` before running this workflow.

---

#### `Web (artifacts/sahu-csc)`

**Mode:** sequential  
**Output:** console (webview-capable when port 5000 is free)  
**Command:** `pnpm --filter @workspace/sahu-csc run dev`  
**Port:** `5000` (strict — will not auto-pick another port)

**Purpose:** Run only the frontend in isolation.

> ⚠️ **Port conflict:** Fails if `Start application` is already running (Vite has `strictPort: true`). Stop `Start application` first.

---

#### `Component Preview Server (artifacts/mockup-sandbox)`

**Mode:** sequential  
**Output:** console  
**Command:** `pnpm --filter @workspace/mockup-sandbox run dev`  
**Port:** auto-assigned (tries 5000, then 5001, 5002… until free)

**Purpose:** Vite preview server for Canvas UI component mockups. Can run alongside `Start application` — it auto-picks a free port.

---

#### `Read Docs`

**Mode:** sequential (one-shot, exits immediately)  
**Output:** console  
**Command:** `cat WORKFLOWS.md`

**Purpose:** Print this file to the Replit console for quick reference.

---

## Workflow Conflict Matrix

Workflows that **cannot run simultaneously** due to port collisions:

| If this is running → | These will fail |
|---|---|
| `Start application` | `Web (artifacts/sahu-csc)` (port 5000), `API Server (artifacts/api-server)` (port 5000), `API Server` (port 8080 — see artifact note) |
| `artifacts/api-server: API Server` (auto) | `API Server` (both port 8080) |
| `Web (artifacts/sahu-csc)` | `Start application`, `API Server (artifacts/api-server)` |
| `API Server` | `artifacts/api-server: API Server` |

**Safe to run together with `Start application`:**
- `Component Preview Server (artifacts/mockup-sandbox)` — auto-picks a free port ✅
- `artifacts/mockup-sandbox: Component Preview Server` — runs on 8081 ✅
- `Seed Database` — no port, exits after seeding ✅
- `Read Docs` — no port, exits immediately ✅

---

## Port Map

| Local Port | External Port | Workflow | Notes |
|-----------|--------------|---------|-------|
| `5000` | `:80` | `Start application` (frontend) | **Main app URL** |
| `8082` | `:3001` | `Start application` (API) | Proxied via Vite `/api/*` |
| `8080` | `:8080` | `artifacts/api-server: API Server` | Auto-start artifact — holds this port permanently |
| `8081` | `:8081` | `artifacts/mockup-sandbox: Component Preview Server` | Canvas UI previews |
| `21700` | `:3000` | `artifacts/sahu-csc: web` | Artifact frontend (no API proxy) |
| `5001–5002` | — | `Component Preview Server (artifacts/mockup-sandbox)` | Auto-assigned when 5000 is taken |

---

## Environment Variables

Set in `.replit` under `[userenv.shared]` — applied to all workflows automatically:

| Variable | Value | Purpose |
|----------|-------|---------|
| `PORT` | `5000` | Default port for processes that don't override it |
| `BASE_PATH` | `/` | Vite base URL |
| `VAPID_PUBLIC_KEY` | set | Web push notification public key |
| `VAPID_PRIVATE_KEY` | set | Web push notification private key |
| `VAPID_EMAIL` | `mailto:admin@sahucsc.in` | VAPID contact email |

**Secrets** (set in Replit Secrets tab — NOT in `.replit`):

| Secret | Purpose |
|--------|---------|
| `DATABASE_URL` | PostgreSQL connection string (auto-provisioned by Replit) |
| `SESSION_SECRET` | Express session signing secret |

---

## Verifying the App is Running

### Check via browser
Open the Replit preview pane — the SAHU CSC splash screen and then login page should appear within 20–30 seconds of starting.

### Check via shell

```bash
# Check frontend (port 5000)
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/
# Expected: 200

# Check API health (Start application uses port 8082)
curl -s http://localhost:8082/api/healthz
# Expected: {"status":"ok","database":{"status":"ok"},...}

# Check artifact API (port 8080)
curl -s http://localhost:8080/api/healthz
# Expected: 200 if artifact workflow is running
```

### Check via the app
Log in as `admin` / `admin123` → go to **Server Health** in the admin sidebar.
Shows live: server uptime, DB latency, VAPID status, memory usage, CPU load.

---

## Common Problems & Fixes

### 502 Bad Gateway

**Cause:** Server is still starting up, or a stale process is holding the port.

```bash
fuser -k 5000/tcp 2>/dev/null
fuser -k 8082/tcp 2>/dev/null
```

Restart `Start application`. Wait 20–30 seconds before testing.

**On mobile:** Never use `localhost` — always use the `.replit.dev` URL from the Replit preview pane.

---

### Port already in use (`EADDRINUSE`)

**Cause A — Port 8080:** The `artifacts/api-server: API Server` artifact workflow starts automatically and holds port 8080. The user-defined `API Server` workflow will always fail if the artifact is running. Use `Start application` instead (it uses port 8082).

**Cause B — Port 5000:** `Start application` holds port 5000. `Web (artifacts/sahu-csc)` and `API Server (artifacts/api-server)` will fail while `Start application` is running.

**Fix for Start application itself:**
```bash
fuser -k 5000/tcp
fuser -k 8082/tcp
```
Then restart `Start application`.

---

### Login fails / "Invalid credentials"

The database may be empty (schema push wiped data). Re-seed:

```bash
pnpm --filter @workspace/api-server run seed
```

Then try `admin` / `admin123` again.

---

### Seed Database workflow fails with "tsx: not found"

The workflow command was set to use `npx tsx` which is not available. Run this from the shell directly:

```bash
pnpm --filter @workspace/api-server run seed
```

To permanently fix the workflow:
1. In Replit Agent, use `removeWorkflow({ name: "Seed Database" })` then `configureWorkflow({ name: "Seed Database", command: "pnpm --filter @workspace/api-server run seed", outputType: "console" })`
2. Or delete and re-add it manually from the workflow panel with the correct command

---

### Database tables missing (`relation "users" does not exist`)

Schema has not been pushed, or was wiped. Run in order:

```bash
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run seed
```

---

### Frontend shows blank page or old version

Clear the service worker cache:
Browser DevTools → Application → Storage → Clear site data → Reload

---

### API changes not reflected

The API server compiles TypeScript via esbuild on every start. After saving API changes, restart the `Start application` workflow — the build runs automatically.

---

### Login succeeds but stays on login page

**Cause:** Session not persisting to the database, or `connect-pg-simple` not in esbuild externals.

```bash
curl -s http://localhost:8082/api/healthz | grep -i session
```

**Fix:**
1. Ensure `connect-pg-simple` is in the `external` array in `artifacts/api-server/build.mjs` (esbuild bundling it causes a `table.sql ENOENT` error that silently breaks all session persistence)
2. Ensure `app.ts` uses the shared `pool` from `@workspace/db`, not a raw connection string
3. Restart `Start application` — `createTableIfMissing: true` will auto-create the `session` table

---

### Login redirect doesn't happen (stays on login page after success)

**Cause:** Auth state not updating in the React Query cache after login.

**How it works:**
- `handleLogin` in `use-auth.tsx` sets user data directly from the login response via `queryClient.setQueryData(["auth/me"], userData)` — no separate `/auth/me` refetch
- `login.tsx` has a `useEffect` that watches `user` and calls `setLocation("/")` when it becomes truthy
- If the redirect isn't happening, verify both pieces are in place

---

### Push notifications not working after restart

VAPID keys are ephemeral (auto-generated on startup) unless set as Replit Secrets. To persist them:

1. Generate keys: `node -e "const wp = require('web-push'); console.log(wp.generateVAPIDKeys())"`
2. Set `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` in Replit Secrets (🔒 tab)
3. Restart `Start application`

Check status at `/server-health` → VAPID section.

---

### "Workflow limit exceeded (10/10)" in Replit Agent

The project is at the 10-workflow maximum. 3 slots are permanently occupied by artifact workflows that cannot be deleted (`artifacts/api-server: API Server`, `artifacts/sahu-csc: web`, `artifacts/mockup-sandbox: Component Preview Server`). This leaves 7 user-defined workflow slots.

**To add a new workflow**, first remove one of the 7 user-defined workflows:
```javascript
await removeWorkflow({ name: "Read Docs" }); // example — lowest priority
// Wait 3+ seconds before calling configureWorkflow
await new Promise(r => setTimeout(r, 3000));
await configureWorkflow({ name: "New Workflow", command: "...", outputType: "console" });
```

---

## Workflow Decision Tree

```
Starting the project?
│
├── First time / fresh clone?
│     └── pnpm install → db push → "Seed Database" workflow → "Start application"
│
├── Normal day / already set up?
│     └── Run "Start application" (skips install and seed — faster)
│
├── Schema changed (added/removed columns)?
│     └── pnpm --filter @workspace/db run push → "Seed Database" → restart "Start application"
│
├── Data looks wrong / empty DB?
│     └── Run: pnpm --filter @workspace/api-server run seed
│
├── 502 error / port conflict?
│     └── fuser -k 5000/tcp; fuser -k 8082/tcp → restart "Start application"
│
├── Working on isolated API changes (no frontend)?
│     └── Stop "Start application" → run "API Server (artifacts/api-server)" (port 5000)
│        OR keep "Start application" running (API auto-rebuilds on restart)
│
├── Working on isolated frontend changes (no API)?
│     └── Stop "Start application" → run "Web (artifacts/sahu-csc)" (port 5000)
│
└── Working on Canvas UI mockups?
      └── "Component Preview Server (artifacts/mockup-sandbox)" (runs alongside Start application)
```

---

## File Locations

| File | Purpose |
|------|---------|
| `.replit` | All workflow definitions, port maps, env vars |
| `WORKFLOWS.md` | This file — workflow guide |
| `artifacts/api-server/src/index.ts` | Express app entry point |
| `artifacts/api-server/build.mjs` | esbuild compile script (keep `connect-pg-simple` in `external`) |
| `artifacts/sahu-csc/vite.config.ts` | Vite config (port, proxy, PWA, allowedHosts, strictPort) |
| `lib/db/src/schema/` | Drizzle ORM table definitions |
| `lib/api-spec/openapi.yaml` | OpenAPI spec — source of truth for codegen |
| `lib/api-client-react/src/generated/` | Auto-generated hooks/schemas — do NOT edit |
| `artifacts/api-server/src/scripts/seed.ts` | Database seeder source |

---

## For Replit Agent

When a new agent session starts on this project, do the following **before writing any code**:

1. **Read this file** (`WORKFLOWS.md`) — understand how the app starts and what workflows exist
2. **Read `replit.md`** — full project overview, tech stack, credentials, gotchas
3. **Check workflow status** — confirm `Start application` is running
4. **Verify ports** — `curl http://localhost:5000/` and `curl http://localhost:8082/api/healthz` must return 200

### Workflow landscape summary for agents

```
ARTIFACT (system, cannot delete — 3 slots):
  artifacts/api-server: API Server          → port 8080 (auto-start)
  artifacts/sahu-csc: web                   → port 21700 (auto-start)
  artifacts/mockup-sandbox: Component ...   → port 8081 (auto-start)

USER-DEFINED (7 slots, at the 10-workflow limit):
  Start application     ← PRIMARY dev workflow (API:8082 + Frontend:5000)
  Seed Database         ← seeds DB; correct command: pnpm --filter @workspace/api-server run seed
  API Server            ← isolated API on port 8080 (conflicts with artifact on 8080)
  API Server (artifacts/api-server) ← isolated API on port 5000 (conflicts with Start application)
  Web (artifacts/sahu-csc)          ← isolated frontend on port 5000 (conflicts with Start application)
  Component Preview Server (artifacts/mockup-sandbox) ← UI mockups, auto-ports, safe alongside Start application
  Read Docs             ← prints this file to console
```

**Never:**
- Run `pnpm --filter @workspace/db run push` without immediately re-seeding (it can wipe tables)
- Edit files in `lib/api-client-react/src/generated/` — auto-generated by Orval; run `pnpm --filter @workspace/api-spec run codegen` to regenerate
- Start `API Server`, `Web (artifacts/sahu-csc)`, or `API Server (artifacts/api-server)` while `Start application` is running — port conflicts will cause failures
- Remove `connect-pg-simple` from `externals` in `build.mjs` — esbuild bundling it silently breaks all session persistence
- Add `willChange: transform` to any ancestor of the bottom `<nav>` — breaks `position: fixed`, causing the nav to scroll with the page
- Exceed 10 workflows total — 3 artifact slots are permanent; you have 7 user slots max

**Seed Database note for agents:** If the live `Seed Database` workflow fails with `tsx: not found`, the workflow command was set incorrectly. Run `pnpm --filter @workspace/api-server run seed` from the shell directly. To fix the workflow: `removeWorkflow("Seed Database")` → wait 3 s → `configureWorkflow("Seed Database", "pnpm --filter @workspace/api-server run seed", "console")`.
