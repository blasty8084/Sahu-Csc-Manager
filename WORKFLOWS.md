# SAHU CSC — Workflow Guide
**Version 3.1.1 — July 3, 2026**

> **Read this first.**
> This file is the single source of truth for how to start, seed, and troubleshoot the SAHU CSC platform. All workflow definitions live in `.replit`.

---

## Project Architecture at a Glance

```
monorepo root/
├── artifacts/api-server/     — Express 5 API (TypeScript, esbuild, port 8080 in dev)
├── artifacts/sahu-csc/       — React + Vite frontend PWA (port 5000 in dev)
├── artifacts/mockup-sandbox/ — Vite component preview server for Canvas UI mockups
├── lib/db/                   — Drizzle ORM schema + migrations
├── lib/api-spec/             — OpenAPI spec (source of truth for codegen)
└── lib/api-client-react/     — Auto-generated React Query hooks (Orval)
```

**v3.0.0 changes:** Setup Wizard Banner (admin-only, session-dismissed) · `/api/setup-status` public endpoint · SMTP fully configured · VAPID auto-generated on startup · `scripts/post-merge.sh` auto-runs on import · Full documentation overhaul (`architectureV3.md`, `ReplitV3.md`, `CHANGELOG_V3.md`, `BUILD.md`) · Package versions bumped to 3.0.0 · TWA config updated to v3.0.0 · Port 21700 conflict fix (fuser kills both 5000 + 21700 on frontend start)

**v2.7.1 changes:** Language switcher removed from sidebar (now only in Profile → Preferences → Language) · Language switching fixed (calls `setLanguage()` on select change + on prefs load) · Language indicator badge in Preferences section · API smart build check (skips esbuild if `dist/index.mjs` exists) · Frontend port-kill on startup

**v2.7.0 features:** AePS & Udhari receipt tokens (QR + public verify pages) · Toast redesign v2 (Framer Motion, 4 variants, shorthands, mobile-top, swipe-to-dismiss)

**v2.6.0 features:** Broadcast Center (push + email blast to all users) · Broadcast History log · OTP email copy block · OTP auto-fill · Resend OTP SVG progress ring

**v2.5.0 features:** User Management Enhancements (search + role filter, AePS Overview tab, bulk activate/suspend, CSV export, admin password reset)

**v2.4.0 features:** Ledger · AePS · Udhari Khata · Receipts · V2 multi-device sessions · RBAC requirePermission · OTP password reset · Admin oversight · PWA Status page · Idle timeout · Notification isolation fixes · Unified Profile+Settings page · Reports redesign · Login UX overhaul · Admin registration management · Admin Sessions tab

---

## Quick Start (First Time)

Run these four steps **in order** on a fresh clone or new Replit import:

```
1 — pnpm install                          (install all workspace dependencies)
2 — pnpm --filter @workspace/db run push  (create DB tables from Drizzle schema)
3 — Run "Seed Database" workflow           (insert users, services, settings)
4 — Click the ▶ Run button                (starts API + frontend together via Project workflow)
```

### Step 1 — Install dependencies

```bash
pnpm install
```

Run once after cloning. Both workflow commands also run `pnpm install` automatically, so this is optional if using the Run button.

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

Default accounts seeded:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `operator` | `operator123` | Operator |

> ℹ️ The seed script uses `onConflictDoNothing()` — safe to re-run at any time.

### Step 4 — Start the application

Click the **▶ Run button** (Project workflow). Wait **15–20 seconds** for both servers to start before opening the app.

---

## All Workflows Reference

| Workflow | Port | Starts with Project | Purpose |
|----------|------|---------------------|---------|
| `API Server` | 8080 | ✅ Yes | Express API (main) |
| `artifacts/sahu-csc: web` | 5000 → :80 | ✅ Yes | Vite frontend webview |
| `Seed Database` | — | ❌ Manual only | One-shot DB seeder |
| `artifacts/api-server: API Server` | 8080 | ⚠️ Platform-injected | Artifact-managed API (same as API Server) |
| `artifacts/mockup-sandbox: Component Preview Server` | 8081 | ⚠️ Platform-injected | Canvas UI mockups |

> **Platform-injected workflows** are added automatically by Replit when artifacts are registered. They cannot be deleted. To remove them from the Project task list, go to **Workflows → Project** in the Replit UI and remove them manually.

---

### `API Server` ⭐ PRIMARY API — Starts with Project

**Mode:** sequential  
**Port:** `8080` → external `:3000`  
**Command:**
```bash
pnpm install && PORT=8080 pnpm --filter @workspace/api-server run dev
```

**`dev` script (in `artifacts/api-server/package.json`):**
```bash
export NODE_ENV=development && (test -f ./dist/index.mjs || pnpm run build) && fuser -k 8080/tcp 2>/dev/null; pnpm run start
```

**Smart build check:** Skips esbuild rebuild on restart if `dist/index.mjs` already exists — reduces restart from ~90 s to ~2 s.
To force a full rebuild: `rm -rf artifacts/api-server/dist/` then restart.

---

### `artifacts/sahu-csc: web` ⭐ PRIMARY FRONTEND — Starts with Project

**Mode:** sequential  
**Port:** `5000` → external `:80`  
**Command:**
```bash
pnpm install && fuser -k 5000/tcp 2>/dev/null; sleep 1; PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run dev
```

**Port-kill on start:** Clears any stale process on port 5000 before Vite starts — prevents `EADDRINUSE` on rapid restarts.

> 💡 The Vite proxy in `vite.config.ts` forwards `/api/*` → `http://localhost:8080`.

---

### `Seed Database`

**Mode:** sequential (one-shot, exits when done)  
**Output:** console  
**Command:**
```bash
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts
```

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

---

### `artifacts/api-server: API Server` (Platform-injected)

**Purpose:** Replit artifact preview for the API server  
**Command:** `pnpm install && pnpm --filter @workspace/api-server run dev`  
**Port:** `8080` → external `:3000`  
**Auto-start:** Yes (system-managed, cannot delete)

> ⚠️ Competes for port 8080 with `API Server`. The `fuser -k 8080/tcp` step in the `dev` script handles this — whichever starts later wins the port. Both run identical code.

---

### `artifacts/mockup-sandbox: Component Preview Server` (Platform-injected)

**Purpose:** Replit artifact preview for Canvas UI mockups  
**Command:** `pnpm --filter @workspace/mockup-sandbox run dev`  
**Port:** `8081` → external `:8081`  
**Auto-start:** Yes (system-managed, cannot delete)

---

## Preview Panel

The Replit Preview panel may show two entries for the frontend:

| Entry | Port | Description |
|-------|------|-------------|
| `artifacts/sahu-csc: web` | 5000 → :80 | **Real app — use this** |
| `SAHU CSC FV1` | 21700 | Canvas artifact duplicate — remove via ⋮ → Delete |

---

## Port Map

| Local Port | External Port | Workflow | Notes |
|-----------|--------------|---------|-------|
| `5000` | `:80` | `artifacts/sahu-csc: web` | **Main app URL** |
| `8080` | `:3000` | `API Server` / `artifacts/api-server: API Server` | API — both compete, whichever starts later wins |
| `8081` | `:8081` | `artifacts/mockup-sandbox: Component Preview Server` | Canvas UI previews |

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
Open the Replit preview pane → select `artifacts/sahu-csc: web` — the SAHU CSC splash screen and then login page should appear within 15–20 seconds of starting.

### Check via shell

```bash
# Check frontend (port 5000)
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/
# Expected: 200

# Check API health (port 8080)
curl -s http://localhost:8080/api/healthz
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
fuser -k 8080/tcp 2>/dev/null
```

Restart the `artifacts/sahu-csc: web` and `API Server` workflows. Wait 15–20 seconds before testing.

**On mobile:** Never use `localhost` — always use the `.replit.dev` URL from the Replit preview pane.

---

### Port already in use (`EADDRINUSE`)

**Port 8080:** Both `API Server` and `artifacts/api-server: API Server` compete for 8080. The `fuser -k 8080/tcp` in the dev script resolves this automatically — the later-starting workflow wins. This is expected behaviour.

**Port 5000:** The `artifacts/sahu-csc: web` workflow's dev script already runs `fuser -k 5000/tcp` before Vite starts.

---

### API Server workflow shows "failed"

The `API Server` workflow may show failed in the panel if `artifacts/api-server: API Server` started first and holds port 8080 before `API Server` can grab it. The app still works — `artifacts/api-server: API Server` is serving the API correctly. This is a cosmetic display issue with no functional impact.

---

### Login fails / "Invalid credentials"

The database may be empty (schema push wiped data). Re-seed:

```bash
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts
```

Or run the **Seed Database** workflow from the Replit panel.

---

### Loading screen spins indefinitely

The auth loading screen has a built-in multi-phase timeout:
- **0–4 s** — normal spinner + "Loading..."
- **4–12 s** — spinner + "Server is starting up… This may take a few seconds"
- **12 s+** — spinner stops, "Server is taking too long to respond" + **Retry** button → `window.location.reload()`

If you see the Retry button, the API server did not respond in time. Check `API Server` or `artifacts/api-server: API Server` logs and restart.

---

### Database tables missing (`relation "users" does not exist`)

Schema has not been pushed, or was wiped. Run in order:

```bash
pnpm --filter @workspace/db run push
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts
```

---

### Language not switching

Language switching was moved from the sidebar to **Profile → Preferences → Language**. Select a language from the dropdown — it switches immediately without needing to click "Save Preferences". Saving persists the choice to the backend for cross-device consistency.

---

### Frontend shows blank page or old version

Clear the service worker cache:
Browser DevTools → Application → Storage → Clear site data → Reload

---

### API changes not reflected

The `dev` script skips rebuilding if `dist/index.mjs` already exists. To force a full rebuild after source changes:

```bash
rm -rf artifacts/api-server/dist/
```

Then restart the `API Server` workflow — esbuild will compile fresh.

---

### Push notifications not working after restart

VAPID keys are already set in `.replit` `[userenv.shared]`. If they were lost, regenerate:

```bash
node -e "const wp = require('web-push'); console.log(wp.generateVAPIDKeys())"
```

Set `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` in Replit Secrets (🔒 tab) and restart.
Check status at `/server-health` → VAPID section.

---

## Workflow Decision Tree

```
Starting the project?
│
├── First time / fresh clone?
│     └── pnpm install → db push → "Seed Database" workflow → ▶ Run button
│
├── Normal day / already set up?
│     └── ▶ Run button (skips seed — faster)
│
├── Schema changed (added/removed columns)?
│     └── pnpm --filter @workspace/db run push → "Seed Database" → restart workflows
│
├── Data looks wrong / empty DB?
│     └── Run "Seed Database" workflow
│
├── Port conflict / 502?
│     └── fuser -k 5000/tcp; fuser -k 8080/tcp → restart workflows
│
├── API changes not showing?
│     └── rm -rf artifacts/api-server/dist/ → restart "API Server"
│
└── Working on Canvas UI mockups?
      └── "artifacts/mockup-sandbox: Component Preview Server" (runs alongside main app)
```

---

## File Locations

| File | Purpose |
|------|---------|
| `.replit` | All workflow definitions, port maps, env vars |
| `WORKFLOWS.md` | This file — workflow guide |
| `replit.md` | Project overview, full tech stack, credentials, gotchas |
| `architectureV2.md` | Authoritative architecture reference |
| `changelogV2.md` | Full history of v2 features and changes |
| `artifacts/api-server/package.json` | `dev` script (smart build check) |
| `artifacts/api-server/src/index.ts` | Express app entry point |
| `artifacts/api-server/build.mjs` | esbuild compile script (keep `connect-pg-simple` in `external`) |
| `artifacts/sahu-csc/vite.config.ts` | Vite config (port, proxy to 8080, PWA, allowedHosts) |
| `lib/db/src/schema/` | Drizzle ORM table definitions |
| `lib/api-spec/openapi.yaml` | OpenAPI spec — source of truth for codegen |
| `lib/api-client-react/src/generated/` | Auto-generated hooks/schemas — do NOT edit |

---

## For Replit Agent

When a new agent session starts on this project, do the following **before writing any code**:

1. **Read `WORKFLOWS.md`** — understand how the app starts and what workflows exist
2. **Read `replit.md`** — full project overview, tech stack, credentials, gotchas
3. **Check workflow status** — confirm `artifacts/api-server: API Server` or `API Server` is running
4. **Verify ports** — `curl http://localhost:5000/` and `curl http://localhost:8080/api/healthz` must return 200/401

### Active workflows (current state — v2.7.1)

```
RUNNING (system-managed, cannot delete):
  artifacts/api-server: API Server          → port 8080 (auto-start, holds port on startup)
  artifacts/sahu-csc: web                   → port 5000 → :80 (auto-start, main app)
  artifacts/mockup-sandbox: Component ...   → port 8081 (auto-start, Canvas previews)

USER-DEFINED:
  API Server        ← PRIMARY: pnpm install && PORT=8080 pnpm --filter @workspace/api-server run dev
  Seed Database     ← one-shot, manual only
```

**Never:**
- Run `pnpm --filter @workspace/db run push` without immediately re-seeding (it can wipe tables)
- Edit files in `lib/api-client-react/src/generated/` — auto-generated by Orval; run `pnpm --filter @workspace/api-spec run codegen` to regenerate
- Remove `connect-pg-simple` from `externals` in `build.mjs` — esbuild bundling it silently breaks all session persistence
- Add `willChange: transform` to any ancestor of the bottom `<nav>` — breaks `position: fixed`
- Call `setLanguage()` without also calling `prefsForm.setValue()` in profile — or the badge won't update
