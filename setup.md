# SAHU CSC — Setup Guide

> Step-by-step instructions for running the app in **Replit** after importing from GitHub.  
> Takes about 5–10 minutes on a fresh import.

---

## Before You Start

Replit development ke liye sirf **Replit Secrets** tab mein passwords set karne hain.
Replit ka built-in PostgreSQL (`DATABASE_URL`) automatic injected hota hai — koi external database setup nahi chahiye.

---

## Step 1 — Install Dependencies

Open the **Shell** tab in Replit and run:

```bash
pnpm install
```

This installs all packages across the monorepo. Takes about 20–30 seconds.

---

## Step 2 — Set Secrets

In Replit → **Secrets** tab, add:

| Key | Value | Notes |
|-----|-------|-------|
| `SESSION_SECRET` | Any long random string | Generate: `openssl rand -base64 48` |
| `ADMIN_PASSWORD` | Your admin account password | Min 8 chars, upper+lower+number+symbol |
| `OPERATOR_PASSWORD` | Your operator account password | Min 8 chars, upper+lower+number+symbol |
| `SMTP_PASSWORD` | Gmail App Password | Google Account → Security → 2-Step → App Passwords |

> **`SESSION_SECRET`** — you can generate one in the Shell:
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
> ```

In Replit → **Env Vars** tab → Shared, also add:

| Key | Value | Notes |
|-----|-------|-------|
| `SMTP_HOST` | `smtp.gmail.com` | Already set by default |
| `SMTP_PORT` | `587` | Already set by default |
| `SMTP_USER` | `youraddress@gmail.com` | Gmail address used to send emails |
| `SMTP_FROM_EMAIL` | `SAHU CSC Support <youraddress@gmail.com>` | Display name in From header |
| `ADMIN_EMAIL` | admin's email address | Saved to admin account at seed time |
| `OPERATOR_EMAIL` | operator's email address | Saved to operator account at seed time |

---

## Step 3 — Push the Database Schema

Run in the Shell:

```bash
pnpm --filter @workspace/db run push
```

This creates all tables in the Replit-managed PostgreSQL database. Safe to re-run — it only applies changes.

---

## Step 4 — Seed the Database

Run the **Seed Database** workflow:
- Click **Run** next to `Seed Database` in the Workflows panel  
  OR run in the Shell:
  ```bash
  PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts
  ```

This creates the default accounts:
| Role | Username | Password |
|------|----------|---------|
| Admin | `admin` | your `ADMIN_PASSWORD` secret |
| Operator | `operator` | your `OPERATOR_PASSWORD` secret |

Safe to re-run — it resets passwords without deleting data.

---

## Step 5 — Start the App

Start these two workflows (they auto-start on import, but may need a restart after secrets are set):

1. **API Server** — Express backend on port 8080  
2. **Start application** — Static frontend + `/api` proxy on port 5000

Click the **Restart** button on each, or run in Shell:
```bash
# Check API is healthy
curl http://localhost:8080/api/health
```

You should see `{"status":"ok"}`.

Open the **Preview** pane → you'll see the SAHU CSC login page.

---

## Verify Everything Works

```bash
# API health check
curl http://localhost:8080/api/health

# Check which secrets/env vars are missing (public endpoint)
curl http://localhost:8080/api/setup-status
```

Then log in with `admin` / your `ADMIN_PASSWORD`.

---

## All Required Secrets — Quick Reference

| Secret | Purpose |
|--------|---------|
| `SESSION_SECRET` | Signs every HTTP session cookie |
| `ADMIN_PASSWORD` | Default admin account password (used by Seed workflow) |
| `OPERATOR_PASSWORD` | Default operator account password (used by Seed workflow) |

> **Startup guard:** If any required secret is missing, the API server refuses to start and prints exactly which ones are absent. Check the `API Server` workflow log.

---

## Daily Development Workflow

| Task | How |
|------|-----|
| Write & test code | Edit in Replit — Vite HMR reloads the frontend instantly |
| Backend change | Restart **API Server** workflow (rebuilds automatically) |
| Schema change | Run `pnpm --filter @workspace/db run push` then restart API Server |
| Type check | Run **Typecheck** workflow |
| Full production build | Run **Build Production** workflow |
| Reset admin password | Re-run **Seed Database** workflow |

---

## Workflows Reference

| Workflow | Port | Auto-start | Purpose |
|----------|------|-----------|---------|
| `API Server` | 8080 | ✅ | Express API — builds then serves |
| `Start application` | 5000 | ✅ | Static frontend + `/api` reverse proxy |
| `Worker Server` | 8081 | ✅ | Skips cleanly (requires `REDIS_URL` — not configured) |
| `Seed Database` | — | ❌ Manual | Create / reset admin + operator accounts |
| `Typecheck` | — | ❌ Manual | Full TypeScript check across all packages |
| `Build Production` | — | ❌ Manual | Typecheck + full production build |

---

## Deploying to Production (Render + Vercel)

See **[DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)** for the full Render (backend) + Vercel (frontend) deployment guide.

> **Key difference:** On Render, set `DATABASE_URL` with your production PostgreSQL connection string. All other secrets use the same names.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `API Server` workflow fails immediately | Check the log — it prints exactly which secrets are missing |
| Login says "invalid credentials" | Re-run **Seed Database** workflow |
| Frontend shows blank page | Restart `Start application` workflow |
| `pnpm install` fails | Delete `node_modules` and retry: `rm -rf node_modules && pnpm install` |
| Schema push fails | Check `DATABASE_URL` is injected by Replit (visible in Env Vars tab) |
