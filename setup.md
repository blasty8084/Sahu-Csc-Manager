# SAHU CSC — Setup Guide

> Step-by-step instructions for running the app in **Replit** after importing from GitHub.  
> Takes about 5–10 minutes on a fresh import.
>
> **Deployment (Vercel + Render) ke liye:** `DEVELOPMENT_WORKFLOW.md` dekho.

---

## Before You Start

Replit development ke liye sirf **Replit Secrets** tab mein passwords set karne hain.
Neon / Upstash / B2 accounts optional hain — app inke bina bhi dev mein kaam karta hai:

| Service | Purpose | Required for dev? |
|---------|---------|-----------|
| [neon.tech](https://neon.tech) | Production PostgreSQL | ❌ (Replit's own DB used) |
| [upstash.com](https://upstash.com) | Redis (cache + job queue) | ❌ (memory fallback) |
| [backblaze.com/b2](https://www.backblaze.com/b2/cloud-storage.html) | File storage (avatars, backups) | ❌ (local fallback) |

---

## Step 1 — Install Dependencies

Open the **Shell** tab in Replit and run:

```bash
pnpm install
```

This installs all 1 100+ packages across the monorepo. Takes about 20–30 seconds.

---

## Step 2 — Set Up Neon Database

1. Log in to [neon.tech](https://neon.tech) → **New Project** → give it a name (e.g. `sahu-csc`)
2. Go to **Connection Details** → select **Node.js** → copy the connection string:
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
3. In Replit → **Secrets** tab → add:
   - Key: `NEON_DATABASE_URL`
   - Value: the connection string you copied

> Replit also provides its own `DATABASE_URL` (built-in Postgres). The app prefers `NEON_DATABASE_URL` when both are present. Use Neon for all environments so dev and production share the same database engine.

---

## Step 3 — Set Up Upstash Redis

1. Log in to [upstash.com](https://upstash.com) → **Create Database** → pick a region close to you
2. Open your database → **Connect** tab — you need **three** values:

   **ioredis (TCP)** section:
   ```
   rediss://default:your-token@your-host.upstash.io:6379
   ```

   **@upstash/redis (REST)** section:
   ```
   UPSTASH_REDIS_REST_URL=https://your-host.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-rest-token
   ```

3. In Replit → **Secrets** tab → add all three:
   | Key | Value |
   |-----|-------|
   | `REDIS_URL` | `rediss://...` (ioredis TCP URL) |
   | `UPSTASH_REDIS_REST_URL` | `https://...` (REST URL) |
   | `UPSTASH_REDIS_REST_TOKEN` | REST token |

---

## Step 4 — Set Up Backblaze B2

1. Log in to [backblaze.com](https://www.backblaze.com) → **B2 Cloud Storage** → **Create a Bucket**
   - Bucket name: e.g. `sahu-csc-files`
   - Files in Bucket: **Private**
2. Note your **Bucket Name** and the **Endpoint** shown on the bucket page  
   (e.g. `s3.us-west-004.backblazeb2.com`)
3. Go to **App Keys** → **Add a New Application Key**
   - Name: `sahu-csc`
   - Allow access to: your bucket
   - Copy the **keyID** and **applicationKey** (shown only once)
4. In Replit → **Secrets** tab → add:
   | Key | Value |
   |-----|-------|
   | `B2_KEY_ID` | keyID from step 3 |
   | `B2_APP_KEY` | applicationKey from step 3 |
   | `B2_BUCKET_NAME` | your bucket name |
   | `B2_BUCKET_ENDPOINT` | e.g. `s3.us-west-004.backblazeb2.com` |

---

## Step 5 — Set Remaining Secrets

Still in Replit → **Secrets** tab, add these:

| Key | Value | Notes |
|-----|-------|-------|
| `SESSION_SECRET` | Any long random string | Generate: `openssl rand -base64 48` |
| `ADMIN_PASSWORD` | Your admin account password | Min 8 chars, upper+lower+number+symbol |
| `OPERATOR_PASSWORD` | Your operator account password | Min 8 chars, upper+lower+number+symbol |
| `SMTP_PASSWORD` | Gmail App Password | Optional — enables email OTP delivery |

> **`SESSION_SECRET`** — you can generate one in the Shell:
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
> ```

---

## Step 6 — Push the Database Schema

Run in the Shell:

```bash
pnpm --filter @workspace/db run push
```

This creates all 19 tables in your Neon database. Safe to re-run — it only applies changes.

---

## Step 7 — Seed the Database

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

## Step 8 — Start the App

Start these two workflows (they auto-start on import, but may need a restart after secrets are set):

1. **API Server** — Express backend on port 8080  
2. **artifacts/sahu-csc: web** — Vite frontend on port 5000

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

| Secret | Where to get it |
|--------|----------------|
| `NEON_DATABASE_URL` | Neon dashboard → Connection Details |
| `SESSION_SECRET` | Generate randomly (see Step 5) |
| `ADMIN_PASSWORD` | You choose |
| `OPERATOR_PASSWORD` | You choose |
| `REDIS_URL` | Upstash dashboard → Connect → ioredis |
| `UPSTASH_REDIS_REST_URL` | Upstash dashboard → Connect → @upstash/redis |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash dashboard → Connect → @upstash/redis |
| `B2_KEY_ID` | Backblaze → App Keys |
| `B2_APP_KEY` | Backblaze → App Keys (shown once at creation) |
| `B2_BUCKET_NAME` | Backblaze → Buckets |
| `B2_BUCKET_ENDPOINT` | Backblaze → Bucket details (e.g. `s3.us-west-004.backblazeb2.com`) |
| `SMTP_PASSWORD` | Google Account → Security → App Passwords *(optional)* |

> **Startup guard:** If any required secret is missing, the API server refuses to start and prints a list of exactly which ones are absent. Check the `API Server` workflow log.

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
| `artifacts/sahu-csc: web` | 5000 | ✅ | Vite frontend dev server |
| `Worker Server` | 8081 | ✅ | BullMQ background jobs (requires `REDIS_URL`) |
| `Seed Database` | — | ❌ Manual | Create / reset admin + operator accounts |
| `Typecheck` | — | ❌ Manual | Full TypeScript check across all packages |
| `Build Production` | — | ❌ Manual | Typecheck + full production build |

---

## Deploying to Production (Render + Vercel)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full Render (backend) + Vercel (frontend) deployment guide, including how to configure `NEON_DATABASE_URL` on Render and the `vercel.json` rewrite rules.

> **Key difference:** On Render, set `NEON_DATABASE_URL` (not `DATABASE_URL` — that name is reserved by Replit). All other secrets use the same names.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `API Server` workflow fails immediately | Check the log — it prints exactly which secrets are missing |
| Login says "invalid credentials" | Re-run **Seed Database** workflow |
| Frontend shows blank page | Restart `artifacts/sahu-csc: web` workflow |
| `pnpm install` fails | Delete `node_modules` and retry: `rm -rf node_modules && pnpm install` |
| Schema push fails | Check `NEON_DATABASE_URL` is set correctly in Secrets |
| Redis connection error | Verify `REDIS_URL` starts with `rediss://` (double-s for TLS) |
| B2 upload fails | Confirm `B2_BUCKET_ENDPOINT` does **not** include `https://` — just the hostname |
