# SAHU CSC — Render Deployment Guide

This guide walks you through deploying the SAHU CSC backend API to Render (free tier).

---

## Overview

| What | Where |
|---|---|
| Backend API | Render (this guide) |
| Frontend | Vercel (see `VERCEL_SETUP_GUIDE.md`) |
| Database | Neon PostgreSQL (free tier) |

---

## Step 1 — Create a Neon Database

The app needs an external PostgreSQL database that survives re-deploys.

1. Go to [neon.tech](https://neon.tech) → Sign up (free)
2. Click **New Project** → give it a name (e.g. `sahu-csc`)
3. Select region: **AWS ap-southeast-1 (Singapore)** — closest to India
4. Once created, go to **Dashboard** → **Connection Details**
5. Copy the **Connection String** — looks like:
   ```
   postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```
6. Save it — you'll need it in Step 3

---

## Step 2 — Push Code to GitHub

Render deploys from GitHub. Your repo must be pushed before connecting.

```bash
git add .
git commit -m "production setup"
git push origin main
```

---

## Step 3 — Create Render Service

### Option A — Using Blueprint (recommended)

`render.yaml` is already in the repo root. Render reads it automatically.

1. Go to [render.com](https://render.com) → Sign up / Log in
2. Click **New +** → **Blueprint**
3. Connect your GitHub account and select the repo
4. Render reads `render.yaml` and pre-fills everything
5. Fill in the `sync: false` fields (Render will prompt you):

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Neon connection string from Step 1 |
   | `ADMIN_PASSWORD` | Your chosen admin password |
   | `OPERATOR_PASSWORD` | Your chosen operator password |
   | `SMTP_USER` | Your Gmail address (optional) |
   | `SMTP_PASSWORD` | Gmail App Password (optional) |
   | `SMTP_FROM_EMAIL` | `SAHU CSC <you@gmail.com>` (optional) |
   | `VAPID_EMAIL` | `mailto:you@gmail.com` |

6. Click **Apply** — Render builds and deploys automatically

### Option B — Manual Setup

1. Render Dashboard → **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure:

   | Setting | Value |
   |---|---|
   | **Name** | `sahu-csc-api` |
   | **Region** | Singapore |
   | **Branch** | `main` |
   | **Root Directory** | `artifacts/api-server` |
   | **Runtime** | Node |
   | **Build Command** | `cd ../.. && npm install -g pnpm@10 && pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build` |
   | **Start Command** | `node --enable-source-maps ./dist/index.mjs` |
   | **Plan** | Free |

4. Under **Advanced** → set **Health Check Path** to `/api/health`
5. Add all environment variables from `render.env` (see Step 4)
6. Click **Create Web Service**

---

## Step 4 — Add Environment Variables

Go to your Render service → **Environment** tab → add each variable from `render.env`.

### Required (app will not start without these)

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | Neon connection string |
| `SESSION_SECRET` | Long random string — run `openssl rand -base64 48` |
| `ADMIN_PASSWORD` | Your admin login password |
| `OPERATOR_PASSWORD` | Your operator login password |
| `CORS_ORIGIN` | Your Vercel URL e.g. `https://your-app.vercel.app` |
| `VAPID_EMAIL` | `mailto:you@gmail.com` |
| `CACHE_BACKEND` | `memory` |
| `ALLOW_NON_INDIA` | `true` (Render servers are outside India) |
| `DISABLE_2FA` | `false` |

### Optional (safe to leave blank — features degrade gracefully)

| Variable | Purpose |
|---|---|
| `SMTP_HOST` | Email sending (default: `smtp.gmail.com`) |
| `SMTP_PORT` | Email port (default: `587`) |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASSWORD` | Gmail App Password |
| `SMTP_FROM_EMAIL` | Display name + address for sent emails |
| `B2_KEY_ID` | Backblaze B2 — cloud storage for avatars & backups |
| `B2_APP_KEY` | Backblaze B2 app key |
| `B2_BUCKET_NAME` | B2 bucket name |
| `B2_BUCKET_ENDPOINT` | B2 endpoint URL |
| `REDIS_URL` | Upstash Redis TCP URL — enables background jobs |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL — needed if `CACHE_BACKEND=redis` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token |
| `SENTRY_DSN` | Sentry error tracking DSN |
| `MAXMIND_LICENSE_KEY` | Weekly GeoIP updates (free at maxmind.com) |
| `LOG_LEVEL` | `trace` / `debug` / `info` / `warn` / `error` (default: `info`) |
| `DB_POOL_MAX` | Max DB connections (default: `10`) |

---

## Step 5 — Apply Database Schema

After the first deploy succeeds, you need to push the database schema to Neon.

Run this **once** from your local machine or Replit shell:

```bash
cd lib/db
NEON_DATABASE_URL="your-neon-connection-string" pnpm exec drizzle-kit push --force
```

Or from Replit (if `NEON_DATABASE_URL` is set as a secret):
```bash
cd lib/db && pnpm exec drizzle-kit push --force
```

---

## Step 6 — Seed the Database

This creates the admin and operator accounts plus default services and settings.

Run this **once** from Render's Shell tab:

1. Render Dashboard → your service → **Shell**
2. Run:
   ```bash
   node dist/scripts/seed.mjs
   ```
3. Expected output:
   ```
   🌱 Seeding database...
   ✅ Admin user created/reset
   ✅ Operator user created/reset
   ✅ Services seeded
   ✅ Settings seeded
   ✅ Welcome notification created
   🎉 Seed complete!
   ```

> Re-run this anytime to reset admin/operator passwords back to the values in your env vars.

---

## Step 7 — Save Auto-Generated Keys (Important)

On first boot the server generates three security keys and stores them in the database:

- `ENCRYPTION_KEY` — encrypts sensitive fields (addresses, TOTP secrets)
- `JWT_SECRET` — signs JWT tokens
- `VAPID_PRIVATE_KEY` — push notification subscription key

**If these rotate (e.g. on a database reset), encrypted data becomes unreadable and all push notification subscriptions break.**

After first deploy:

1. Render Dashboard → your service → **Shell**
2. Run:
   ```bash
   node -e "
   const { Pool } = require('pg');
   const p = new Pool({ connectionString: process.env.DATABASE_URL });
   p.query(\"SELECT key, value FROM settings WHERE key IN ('encryptionKeyBase64','jwtSecret','vapidPrivateKey')\")
     .then(r => { r.rows.forEach(row => console.log(row.key + '=' + row.value)); p.end(); });
   "
   ```
3. Copy the three values and add them as env vars on Render:
   - `ENCRYPTION_KEY` = value of `encryptionKeyBase64`
   - `JWT_SECRET` = value of `jwtSecret`
   - `VAPID_PRIVATE_KEY` = value of `vapidPrivateKey`

---

## Step 8 — Update CORS After Vercel Deploy

Once your Vercel frontend is live, update `CORS_ORIGIN` on Render to the exact Vercel URL:

1. Render Dashboard → your service → **Environment**
2. Update `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://your-actual-app.vercel.app
   ```
3. Render automatically redeploys with the new value

---

## Verify Everything Works

After setup, check these endpoints:

| URL | Expected |
|---|---|
| `https://sahu-csc-api.onrender.com/api/health` | `{"status":"ok"}` |
| `https://sahu-csc-api.onrender.com/api/geo` | `{"allowed":true}` |
| Your Vercel URL | Login page loads |

---

## Free Tier Limits

| Resource | Render Free Tier |
|---|---|
| **Sleep** | Service sleeps after 15 min of inactivity — first request takes ~30s to wake up |
| **Hours** | 750 hours/month (enough for one always-on service) |
| **Bandwidth** | 100 GB/month |

> **Tip:** Upgrade to Render's $7/month Starter plan to avoid the sleep delay.

---

## Re-deploy (future updates)

Render auto-deploys on every push to `main`. No manual steps needed.

To manually trigger a deploy:
Render Dashboard → your service → **Manual Deploy** → **Deploy latest commit**

---

## Troubleshooting

**Service won't start**
- Check **Logs** tab in Render dashboard for the exact error
- Most common cause: missing required env var — check `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `OPERATOR_PASSWORD`

**`relation does not exist` error**
- Database schema not pushed — run Step 5 again

**Login fails after deploy**
- Seed not run — run Step 6

**Push notifications break after re-deploy**
- `VAPID_PRIVATE_KEY` rotated — run Step 7 to save and pin the key

**CORS error in browser**
- `CORS_ORIGIN` on Render doesn't match your Vercel URL — update it (Step 8)

**Encrypted fields show garbled data**
- `ENCRYPTION_KEY` rotated — restore the original key from a DB backup
