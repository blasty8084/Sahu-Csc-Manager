# SAHU CSC — Workflow Guide
**Version 2.4.0 — June 2026**

> **Read this first.**
> This file is the single source of truth for how to start, seed, and troubleshoot the SAHU CSC platform. All workflow definitions live in `.replit`.

---

## Project Architecture at a Glance

```
monorepo root/
├── artifacts/api-server/     — Express 5 API (TypeScript, esbuild, port 8082 in dev)
├── artifacts/sahu-csc/       — React + Vite frontend PWA (port 5000 in dev)
├── artifacts/mockup-sandbox/ — Vite component preview server for Canvas UI mockups
├── lib/db/                   — Drizzle ORM schema + migrations
├── lib/api-spec/             — OpenAPI spec (source of truth for codegen)
└── lib/api-client-react/     — Auto-generated React Query hooks (Orval)
```

**v2.4.0 features:** Ledger · AePS · Udhari Khata · Receipts (CSC-YYYY-NNNN + QR + WhatsApp PDF) · V2 multi-device sessions · RBAC requirePermission · OTP password reset · Admin oversight · PWA Status page · Idle timeout · Notification isolation fixes · Unified Profile+Settings page · Reports redesign · Login UX overhaul · Admin registration management (pending bulk approve/reject + emails) · Admin Sessions tab (view + revoke any user's sessions)

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

> ℹ️ The seed script compiles `seed.ts` via esbuild and runs `dist/scripts/seed.mjs`. It uses `onConflictDoNothing()` — safe to re-run at any time.

### Step 4 — Start the application

Run the **`Start application`** workflow. Wait **20–30 seconds** for both servers to start before opening the app.

---

## All Workflows Reference

| Category | Count | Can be deleted? |
|----------|-------|----------------|
| **Artifact-managed** (auto-created by Replit) | 3 | ❌ No — system-managed |
| **User-defined** | 2 | ✅ Yes |

---

### ARTIFACT-MANAGED WORKFLOWS (System — Cannot Delete)

These are auto-created by Replit when artifacts are registered. They start automatically when the project loads and cannot be removed via the workflow panel or API.

---

#### `artifacts/api-server: API Server`

**Purpose:** Replit artifact preview for the API server  
**Command:** `pnpm --filter @workspace/api-server run dev`  
**Port:** `8080` → external `:8080`  
**Auto-start:** Yes (system-managed)

> ⚠️ This workflow **competes for port 8080** with any user workflow that also uses port 8080. `Start application` uses **8082** to avoid this conflict.

---

#### `artifacts/sahu-csc: web`

**Purpose:** Replit artifact preview for the frontend  
**Command:** `pnpm --filter @workspace/sahu-csc run dev`  
**Port:** `21700` → external `:3000`  
**Auto-start:** Yes (system-managed)

> ℹ️ This serves the frontend without the API proxy. For full development, always use `Start application` (port 5000 with proxy to API on 8082).

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

> 💡 Uses port **8082** (not 8080) because `artifacts/api-server: API Server` permanently holds port 8080.

---

#### `Seed Database`

**Mode:** sequential (one-shot, exits when done)  
**Output:** console  
**Command:** `pnpm --filter @workspace/api-server run seed`

**When to run:**
- First-time setup after `pnpm install` + schema push
- After `drizzle-kit push` (schema push may wipe table data)
- After manually clearing the database
- When login fails with "Invalid credentials" (empty DB)

**What it seeds:**
- Users: `admin` / `admin123` (admin) + `operator` / `operator123` (operator)
- 22 CSC services across 5 categories
- Default application settings
- Welcome notification
- 84 days of sample ledger entries (for admin user; only inserted if table is empty)

**How it works:** Builds `seed.ts` → `dist/scripts/seed.mjs` via esbuild, then runs the compiled output. Workspace package imports (`@workspace/db`) require the esbuild compile step — do NOT replace with `npx tsx` which cannot resolve workspace aliases.

---

## Port Map

| Local Port | External Port | Workflow | Notes |
|-----------|--------------|---------|-------|
| `5000` | `:80` | `Start application` (frontend) | **Main app URL** |
| `8082` | `:3001` | `Start application` (API) | Proxied via Vite `/api/*` |
| `8080` | `:8080` | `artifacts/api-server: API Server` | Auto-start artifact — holds this port |
| `8081` | `:8081` | `artifacts/mockup-sandbox: Component Preview Server` | Canvas UI previews |
| `21700` | `:3000` | `artifacts/sahu-csc: web` | Artifact frontend (no API proxy) |

---

## Environment Variables

Set in `.replit` under `[userenv.shared]` — applied to all workflows automatically:

| Variable | Value | Purpose |
|----------|-------|---------|
| `PORT` | `5000` | Default port for processes that don't override it |
| `BASE_PATH` | `/` | Vite base URL |
| `VAPID_PUBLIC_KEY` | set | Web push notification public key |
| `VAPID_EMAIL` | `mailto:admin@sahucsc.in` | VAPID contact email |

**Secrets** (set in Replit Secrets tab — NOT in `.replit`):

| Secret | Purpose |
|--------|---------|
| `DATABASE_URL` | PostgreSQL connection string (auto-provisioned by Replit) |
| `SESSION_SECRET` | Express session signing secret |
| `VAPID_PRIVATE_KEY` | Web push notification private key |

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

**Cause A — Port 8080:** The `artifacts/api-server: API Server` artifact workflow starts automatically and holds port 8080. Use `Start application` instead (it uses port 8082).

**Cause B — Port 5000:** `Start application` holds port 5000.

**Fix:**
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

Or run the **Seed Database** workflow from the Replit panel.

---

### Loading screen spins indefinitely

The auth loading screen has a built-in multi-phase timeout:
- **0–4 s** — normal spinner + "Loading..."
- **4–12 s** — spinner + "Server is starting up… This may take a few seconds"
- **12 s+** — spinner stops, "Server is taking too long to respond" + **Retry** button → `window.location.reload()`

If you see the Retry button, the API server did not respond in time. Check `Start application` logs and restart the workflow if needed.

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

After saving API changes, restart the `Start application` workflow — the esbuild compile step runs automatically on start.

---

### Login succeeds but stays on login page

**Cause:** Session not persisting to the database, or `connect-pg-simple` not in esbuild externals.

**Fix:**
1. Ensure `connect-pg-simple` is in the `external` array in `artifacts/api-server/build.mjs`
2. Ensure `app.ts` uses the shared `pool` from `@workspace/db`, not a raw connection string
3. Restart `Start application` — `createTableIfMissing: true` auto-creates the `session` table

---

### Push notifications not working after restart

VAPID keys are ephemeral unless set as Replit Secrets:

1. Generate keys: `node -e "const wp = require('web-push'); console.log(wp.generateVAPIDKeys())"`
2. Set `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` in Replit Secrets (🔒 tab)
3. Restart `Start application`

Check status at `/server-health` → VAPID section.

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
│     └── Run "Seed Database" workflow
│            OR: pnpm --filter @workspace/api-server run seed
│
├── 502 error / port conflict?
│     └── fuser -k 5000/tcp; fuser -k 8082/tcp → restart "Start application"
│
└── Working on Canvas UI mockups?
      └── "artifacts/mockup-sandbox: Component Preview Server" (runs alongside Start application)
```

---

## File Locations

| File | Purpose |
|------|---------|
| `.replit` | All workflow definitions, port maps, env vars |
| `WORKFLOWS.md` | This file — workflow guide |
| `ARCHITECTURE.md` | Complete app logic and architecture reference |
| `CHANGELOG.md` | Full history of features and changes |
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

### Active workflows (current)

```
ARTIFACT (system, cannot delete — 3 slots):
  artifacts/api-server: API Server          → port 8080 (auto-start, holds port permanently)
  artifacts/sahu-csc: web                   → port 21700 (auto-start)
  artifacts/mockup-sandbox: Component ...   → port 8081 (auto-start)

USER-DEFINED (2 active slots):
  Start application   ← PRIMARY: API on 8082 + Frontend on 5000
  Seed Database       ← one-shot: pnpm --filter @workspace/api-server run seed
```

**Never:**
- Run `pnpm --filter @workspace/db run push` without immediately re-seeding (it can wipe tables)
- Edit files in `lib/api-client-react/src/generated/` — auto-generated by Orval; run `pnpm --filter @workspace/api-spec run codegen` to regenerate
- Replace the seed workflow command with `npx tsx artifacts/api-server/src/scripts/seed.ts` — tsx cannot resolve `@workspace/db` workspace imports; the esbuild compile step is required
- Remove `connect-pg-simple` from `externals` in `build.mjs` — esbuild bundling it silently breaks all session persistence
- Add `willChange: transform` to any ancestor of the bottom `<nav>` — breaks `position: fixed`
