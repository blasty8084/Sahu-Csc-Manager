# Render Deployment Guide — SAHU CSC API

## Quick Start (Blueprint — recommended)

1. Push this repo to GitHub (if not already done)
2. Go to **render.com → New → Blueprint**
3. Connect your GitHub repo — Render detects `render.yaml` automatically
4. Fill in the **sync: false** secrets when prompted (see list below)
5. Click **Apply** — Render builds and deploys automatically

---

## Secrets to set manually (sync: false in render.yaml)

| Secret | Value |
|---|---|
| `NEON_DATABASE_URL` | `postgresql://user:pass@host.neon.tech/db?sslmode=require` |
| `ADMIN_PASSWORD` | Strong password for the admin account |
| `OPERATOR_PASSWORD` | Strong password for the operator account |
| `CORS_ORIGIN` | Your Vercel frontend URL, e.g. `https://sahu-csc.vercel.app` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Gmail App Password (16 chars — not your account password) |
| `SMTP_FROM_EMAIL` | e.g. `SAHU CSC Support <you@gmail.com>` |
| `VAPID_EMAIL` | e.g. `mailto:you@gmail.com` |
| `B2_KEY_ID` | Backblaze B2 Application Key ID |
| `B2_APP_KEY` | Backblaze B2 Application Key |
| `UPSTASH_REDIS_REST_URL` | From Upstash → Connect tab |
| `UPSTASH_REDIS_REST_TOKEN` | From Upstash → Connect tab |

Optional: `ADMIN_EMAIL`, `ADMIN_MOBILE`, `OPERATOR_EMAIL`, `OPERATOR_MOBILE`, `SENTRY_DSN`, `MAXMIND_LICENSE_KEY`

---

## What happens automatically

### Build (render-build.sh)
1. Installs pnpm@10
2. `pnpm install --frozen-lockfile` — installs all deps including sharp native binary
3. `pnpm --filter @workspace/api-server run build` — bundles with esbuild

### First boot (startup-init.ts)
- Reads `ADMIN_PASSWORD` + `OPERATOR_PASSWORD` from env
- Creates admin and operator accounts if they don't exist
- If accounts already exist, just resets their passwords
- Flags completion in the `settings` table so subsequent boots skip bcrypt hashing
- Session table is auto-created by `connect-pg-simple` (`createTableIfMissing: true`)

**No manual database setup needed — everything runs on first boot.**

---

## Manual deployment (without Blueprint)

1. In Render Dashboard → **New → Web Service**
2. Connect your GitHub repo
3. Set:
   - **Root Directory**: `.` (workspace root)
   - **Build Command**: `bash render-build.sh`
   - **Start Command**: `node --enable-source-maps artifacts/api-server/dist/index.mjs`
   - **Health Check Path**: `/api/health`
4. Add all environment variables from `render.env`

---

## Free tier notes

| Limitation | Details |
|---|---|
| **No SSH shell** | Accounts are created automatically via `startup-init.ts` |
| **Spins down** | Service sleeps after 15 min inactivity; cold start takes ~30 s |
| **No persistent disk** | Avatars stored as base64 in Neon DB (already the case) |
| **750 hrs/month free** | Enough for one always-on service |
| **Singapore region** | Closest to Odisha, India |

---

## After deploy

1. Note your Render service URL (e.g. `https://sahu-csc-api.onrender.com`)
2. Set it as the API base URL in your Vercel frontend env vars
3. Add your Vercel frontend URL to `CORS_ORIGIN` in Render env vars
4. Test: `curl https://sahu-csc-api.onrender.com/api/health`

---

## Re-deploying

- Every push to the connected GitHub branch triggers a redeploy automatically
- `startup-init.ts` will reset admin/operator passwords from env vars on each deploy if the `startupSeedDone` settings flag is found but the password env vars have changed — safe to redeploy anytime
