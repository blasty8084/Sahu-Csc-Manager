# SAHU CSC — Workflow Guide

> **Read this first.**
> This file tells any developer or Replit Agent exactly how to start, stop, seed, and troubleshoot the SAHU CSC platform. All workflow definitions live in `.replit`.

---

## Quick Start (First Time)

Run these steps **in order** when setting up the project from scratch:

```
Step 1 — Install dependencies
Step 2 — Push database schema
Step 3 — Seed the database
Step 4 — Start the application
```

### Step 1 — Install dependencies

```bash
pnpm install
```

Run this once after cloning. Safe to re-run at any time.

### Step 2 — Push database schema

```bash
pnpm --filter @workspace/db run push
```

Creates all PostgreSQL tables from the Drizzle schema.
**WARNING:** Can wipe table data on destructive schema changes — always re-seed after running this.

### Step 3 — Seed the database

Run the **`Seed Database`** workflow in Replit, OR run manually:

```bash
pnpm --filter @workspace/api-server run seed
```

Inserts default users, services, and settings. Safe to re-run — uses `onConflictDoNothing()`.

Default accounts created:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `operator` | `operator123` | Operator |

### Step 4 — Start the application

Press the **Run** button in Replit (triggers the `Project` workflow), OR run the **`Start application`** workflow directly.

Wait **20–30 seconds** for both servers to fully start before opening the app.

---

## Workflows Reference

### `Project` — Run Button (default)

**Mode:** parallel  
**Triggered by:** Replit Run button  
**What it does:** Runs `Seed Database` and `Start application` simultaneously.

```toml
[[workflows.workflow]]
name = "Project"
mode = "parallel"

[[workflows.workflow.tasks]]
task = "workflow.run"
args = "Seed Database"

[[workflows.workflow.tasks]]
task = "workflow.run"
args = "Start application"
```

Use this for a full cold start (seed + serve). After the first run, you can use `Start application` alone for faster restarts.

---

### `Start application` — Main App Workflow

**Mode:** sequential  
**Ports:** API on `8082`, Frontend on `5000` (mapped to external `:80`)  
**Preview URL:** Replit's `.replit.dev` domain (shown in preview pane)

> **Why 8082?** Replit's auto-created `artifacts/api-server: API Server` workflow permanently holds port 8080. The `Start application` workflow uses **8082** to avoid that conflict. The Vite proxy in `vite.config.ts` is already set to `localhost:8082`.

**Full shell command:**
```bash
fuser -k 5000/tcp 2>/dev/null   # kill any stale process on port 5000
fuser -k 8082/tcp 2>/dev/null   # kill any stale process on port 8082
PORT=8082 pnpm --filter @workspace/api-server run dev &   # start API in background
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run dev  # start frontend
```

**What it starts:**

| Process | Port | Access |
|---------|------|--------|
| Express 5 API server | `8082` | Internal only (proxied via Vite) |
| Vite + React frontend | `5000` | External — mapped to `:80` (Replit proxy) |

**Startup sequence:**
1. Kill any process already holding ports 5000 and 8082
2. Start API server — esbuild compiles TypeScript → `dist/index.mjs` → Express listens on 8082
3. Start Vite — serves React app on 5000, proxies `/api/*` → `localhost:8082`
4. Replit waits for port 5000 (`waitForPort = 5000`) before marking the workflow ready

**API build time:** ~5–10 seconds (esbuild TypeScript compilation)  
**Total startup time:** ~15–20 seconds

---

### `Seed Database` — Database Seeder

**Mode:** sequential  
**Output:** console  
**Command:**
```bash
pnpm --filter @workspace/api-server run seed
```

**When to run:**
- First setup
- After `drizzle-kit push` (schema push may wipe data)
- After manually clearing the database

**What it seeds:**
- 2 users: `admin` (admin role) + `operator` (operator role)
- 22 CSC services across 5 categories
- Default app settings
- Sample notifications

---

### `artifacts/mockup-sandbox: Component Preview Server` — Canvas Previews

**Mode:** sequential  
**Port:** `8081` (external `:8081`)  
**Purpose:** Vite server for canvas UI component previews (used by Replit Canvas only)

```bash
PORT=8081 BASE_PATH=/__mockup pnpm --filter @workspace/mockup-sandbox run dev
```

Only needed when working on UI component mockups in the Replit Canvas. Not needed for normal app operation.

---

## Port Map

| Local Port | External Port | Used by |
|-----------|--------------|---------|
| `5000` | `:80` | Vite frontend (`Start application` — main app URL) |
| `8082` | `:8082` | Express API server (`Start application` workflow) |
| `8080` | `:8080` | **Held by Replit artifact** `artifacts/api-server: API Server` — do NOT use for `Start application` |
| `8081` | `:8081` | Mockup sandbox (Canvas only) |
| `21700` | — | Replit artifact `artifacts/sahu-csc: web` — not used for main app |

---

## Environment Variables

Set in `.replit` under `[userenv.shared]` — applied to all workflows automatically.

| Variable | Value | Purpose |
|----------|-------|---------|
| `PORT` | `5000` | Frontend Vite port |
| `BASE_PATH` | `/` | Vite base URL |
| `VAPID_PUBLIC_KEY` | set | Web push notification public key |
| `VAPID_PRIVATE_KEY` | set | Web push notification private key |
| `VAPID_EMAIL` | `mailto:admin@sahucsc.in` | VAPID contact email |

**Secrets (set in Replit Secrets tab — NOT in `.replit`):**

| Secret | Purpose |
|--------|---------|
| `DATABASE_URL` | PostgreSQL connection string (auto-provisioned by Replit) |
| `SESSION_SECRET` | Express session signing secret |

---

## Verifying the App is Running

### Check via browser
Open the Replit preview pane — the login page should appear within 20–30 seconds of starting.

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

**Cause:** Server is still starting up, OR a stale process is holding the port.

```bash
# Fix: kill stale port processes, then restart the workflow
fuser -k 5000/tcp 2>/dev/null
fuser -k 8082/tcp 2>/dev/null
```

Then restart the `Start application` workflow. Wait 20–30 seconds before testing.

**On mobile:** Never use `localhost` — always use the `.replit.dev` URL from the Replit preview pane.

---

### Port already in use (`EADDRINUSE`)

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

The API server compiles TypeScript on every start via esbuild. After saving API changes, restart the `Start application` workflow — the build runs automatically.

---

### Push notifications not working after restart

VAPID keys are **ephemeral** (auto-generated on startup) unless set as Replit Secrets.  
To make them persistent:
1. Run: `node -e "const wp = require('web-push'); console.log(wp.generateVAPIDKeys())"`
2. Copy `publicKey` and `privateKey`
3. Set `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` in Replit Secrets (🔒 tab)
4. Restart `Start application`

Check status at `/server-health` → VAPID section.

---

## Workflow Decision Tree

```
Starting the project?
│
├── First time setup?
│     └── YES → pnpm install → db push → Run "Project" (seeds + starts)
│     └── NO  → Run "Start application" (faster, skips seed)
│
├── Schema changed?
│     └── YES → pnpm --filter @workspace/db run push → Run "Seed Database" → restart app
│
├── Data looks wrong / empty?
│     └── Run "Seed Database" workflow
│
├── 502 error?
│     └── fuser -k 5000/tcp; fuser -k 8082/tcp → restart "Start application"
│
└── Working on UI mockups?
      └── Start "artifacts/mockup-sandbox: Component Preview Server"
```

---

## File Locations

| File | Purpose |
|------|---------|
| `.replit` | All workflow definitions, port maps, env vars |
| `artifacts/api-server/src/index.ts` | Express app entry point |
| `artifacts/api-server/build.mjs` | esbuild compile script |
| `artifacts/sahu-csc/vite.config.ts` | Vite config (port, proxy, PWA, allowedHosts) |
| `lib/db/src/schema/` | Drizzle schema tables |
| `artifacts/api-server/src/scripts/seed.ts` | Database seeder source |

---

### Login Succeeds But Stays on Login Page

**Cause:** Session not persisting to the database, OR `connect-pg-simple` not in esbuild externals.

**Check:**
```bash
# Verify session table exists
curl -s http://localhost:8082/api/healthz | grep -i session
```

**Fix:**
1. Ensure `connect-pg-simple` is listed in `externals` in `artifacts/api-server/build.mjs` (esbuild bundles it otherwise, causing `table.sql` ENOENT errors)
2. Ensure `app.ts` uses the shared `pool` from `@workspace/db`, not `conString`
3. Restart `Start application` — `createTableIfMissing: true` will auto-create the `session` table

---

### Login Redirect Doesn't Happen (Stays on Login Page After Success)

**Cause:** Auth state not updating in the frontend React Query cache after login.

**How it works:**
- `handleLogin` in `use-auth.tsx` sets user data directly from the login response body via `queryClient.setQueryData(["auth/me"], userData)` — no separate `/auth/me` refetch
- `login.tsx` has a `useEffect` that watches `user` and calls `setLocation("/")` when it becomes truthy
- If the redirect isn't happening, check if both pieces are in place

---

## For Replit Agent

When a new agent session starts on this project, do the following before writing any code:

1. **Read this file** (`WORKFLOWS.md`) — understand how the app starts
2. **Read `replit.md`** — full project overview, tech stack, credentials, gotchas
3. **Read `CHANGELOG.md` Sections 20–23** — recent bug fixes applied during Replit migration
4. **Check workflow status** — use `getWorkflowStatus("Start application")` to confirm the app is running
5. **Verify ports** — `curl http://localhost:5000/` and `curl http://localhost:8082/api/healthz` must return 200 before making changes

**Never:**
- Run `pnpm --filter @workspace/db run push` without immediately re-seeding (it can wipe tables)
- Edit files in `lib/api-client-react/src/generated/` — these are auto-generated by Orval
- Start separate `api-server` or `sahu-csc` workflows alongside `Start application` — port conflicts will cause 502 errors
- Use port 21700 for the frontend — the correct frontend port is **5000**
- Remove `connect-pg-simple` from `externals` in `build.mjs` — esbuild bundling it causes a `table.sql ENOENT` error that silently breaks all session persistence
- Add `willChange: transform` to any ancestor of the bottom `<nav>` — this breaks `position: fixed` and causes the nav to scroll with the page (see CHANGELOG section 23)
