# Render Deployment Guide — SAHU CSC API

> **Free tier compatible** — no SSH shell needed at any step.
> Everything (schema, admin account, session table) runs automatically on first boot.
>
> **Current confirmed deployment:** `https://sahu-csc-api-02wn.onrender.com`
> Frontend deployment guide: [`VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md)

---

## Step 1 — Neon Database setup (required first)

1. Go to **neon.tech** → create a free project → pick region **AWS ap-southeast-1 (Singapore)**
2. Open your project → **Connection Details** → copy the **Connection string**
   - It looks like: `postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
3. Keep this URL handy — you'll paste it into Render in the next step.

---

## Step 2 — Deploy on Render (Blueprint method — recommended)

1. Push this repo to GitHub (if not already done)
2. Go to **render.com → New → Blueprint**
3. Connect your GitHub repo — Render detects `render.yaml` automatically
4. When prompted for **sync: false** secrets, fill in:

| Secret | Value |
|---|---|
| `NEON_DATABASE_URL` | Connection string from Neon (Step 1) |
| `ADMIN_PASSWORD` | Strong password for the admin account (8+ chars, upper+lower+number+symbol) |
| `OPERATOR_PASSWORD` | Strong password for the operator account (same policy) |
| `CORS_ORIGIN` | Your Vercel frontend URL, e.g. `https://sahu-csc-manager-sahu-csc.vercel.app` |
| `RESEND_API_KEY` | API key from resend.com → API Keys (format: `re_xxx…`) — required for OTP email |
| `VAPID_EMAIL` | e.g. `mailto:you@gmail.com` |

> ⚠️ **Do NOT wrap values in quotes.** Render stores whatever you type literally — if you type `"Admin@2024"` the password becomes `"Admin@2024"` with the quote characters, which will break login.

Optional (skip if not using):

| Secret | Value |
|---|---|
| `B2_KEY_ID` | Backblaze B2 Application Key ID |
| `B2_APP_KEY` | Backblaze B2 Application Key |
| `UPSTASH_REDIS_REST_URL` | From Upstash → REST API tab (e.g. `https://xxx.upstash.io`) |
| `UPSTASH_REDIS_REST_TOKEN` | From Upstash → REST API tab |
| `ADMIN_EMAIL` | Email for admin account |
| `ADMIN_MOBILE` | Mobile number for admin account (10 digits) |
| `OPERATOR_EMAIL` | Email for operator account |
| `OPERATOR_MOBILE` | Mobile number for operator account (10 digits) |
| `SENTRY_DSN` | Sentry error tracking DSN |

5. Click **Apply** → Render builds and deploys automatically.

---

## What happens automatically (no shell needed)

### During Build (`render-build.sh`)
1. Installs pnpm@10
2. `pnpm install --frozen-lockfile` — installs all deps including sharp native binary
3. **`drizzle-kit push --force`** — pushes the full DB schema to Neon (**all tables created automatically**)
4. `pnpm --filter @workspace/api-server run build` — bundles with esbuild

### On First Boot (`startup-init.ts`)
- Creates admin and operator accounts from `ADMIN_PASSWORD` / `OPERATOR_PASSWORD` env vars
- Auto-generates encryption key, JWT secret, VAPID keys — stored in `settings` table
- Session table auto-created by `connect-pg-simple` (`createTableIfMissing: true`)
- Subsequent boots skip seeding (gated by `startupSeedDone` flag in `settings` table)

**No manual database setup, no shell commands, no drizzle-kit run needed manually.**

---

## Alternative — Manual deployment (without Blueprint)

1. Render Dashboard → **New → Web Service** → connect your GitHub repo
2. Set these in the service settings:
   - **Root Directory**: `.`
   - **Build Command**: `bash render-build.sh`
   - **Start Command**: `node --dns-result-order=ipv4first --enable-source-maps artifacts/api-server/dist/index.mjs`
   - **Health Check Path**: `/api/health`
3. Add all environment variables from `render.env` (reference file)

---

## Free tier notes

| Limitation | How it's handled |
|---|---|
| **No SSH shell** | All setup is automatic via build script + startup-init.ts |
| **Spins down after 15 min** | Cold start ~30 s — first request after idle wakes the server |
| **No persistent disk** | Avatars stored as base64 in Neon DB |
| **750 hrs/month free** | Enough for one always-on service |
| **Singapore region** | Closest to Odisha, India (low latency) |

---

## After deploy

1. Copy your Render service URL: `https://sahu-csc-api-02wn.onrender.com`
2. Test health check: `curl https://sahu-csc-api-02wn.onrender.com/api/health`
   - Should return: `{"status":"ok",...}`
3. Set `CORS_ORIGIN` in Render env to your Vercel frontend URL
4. Deploy the frontend using [`VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md). The Vercel rewrite forwards `/api/*` to this Render service URL.

---

## Re-deploying

Every push to the connected GitHub branch triggers a redeploy automatically.

- `render-build.sh` runs `drizzle-kit push` on every deploy — safe, only adds missing tables/columns, never deletes data
- `startup-init.ts` resets admin/operator passwords from env vars if they changed — safe to redeploy anytime

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails with "No database URL found" | Set `NEON_DATABASE_URL` in Render → Environment before deploying |
| Server starts but login fails | Check `ADMIN_PASSWORD` / `OPERATOR_PASSWORD` are set correctly |
| OTP emails not sending | Set `RESEND_API_KEY` secret and `RESEND_FROM` env var in Render → Environment |
| Env var shows literal quotes | Remove surrounding `"..."` from values in Render → Environment — Render stores them literally |
| CORS errors from frontend | Set `CORS_ORIGIN` to your exact frontend URL (no trailing slash) |
| Cold start timeout | Normal on free tier — first request after 15 min idle takes ~30 s |
