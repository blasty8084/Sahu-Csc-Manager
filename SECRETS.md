# SAHU CSC — Secrets & Environment Variables Reference

**Version: 4.10.1 — July 28, 2026**

Complete reference for every environment variable and secret the app reads, where to set it, how to generate it, and what happens when it is absent.

---

## 1. Quick Reference Table

| Variable | Required | Set on | Auto-generated | Source |
|----------|----------|--------|----------------|--------|
| `DATABASE_URL` | ✅ Required | Render / Neon / Supabase | Injected by platform | Platform PostgreSQL |
| `SESSION_SECRET` | ✅ Required | Render | No | Manual |
| `ADMIN_PASSWORD` | ✅ Required (seed) | Render | No | Manual |
| `OPERATOR_PASSWORD` | ✅ Required (seed) | Render | No | Manual |
| `NODE_ENV` | ✅ Required | Render | No | Set to `production` |
| `PORT` | ✅ Required | Render | No | Set to `8080` |
| `CORS_ORIGIN` | Recommended | Render | No | Your frontend URL |
| `ENCRYPTION_KEY` | Auto | Render (optional) | ✅ Yes — stored in DB | Leave blank |
| `SENTRY_DSN` | Optional | Render | No | sentry.io |
| `VITE_SENTRY_DSN` | Optional | Vercel | No | sentry.io |
| `MAXMIND_LICENSE_KEY` | Optional | Render | No | maxmind.com |
| `VITE_API_URL` | ✅ Required | Vercel | No | Your Render API URL |

---

## 2. Required Secrets (App Will Not Boot Without These)

### `DATABASE_URL`
- **What it does:** PostgreSQL connection string used by every DB query in the app.
- **Format:** `postgresql://user:password@host:5432/dbname?sslmode=require`
- **How to get it:**
  - **Render PostgreSQL:** Dashboard → your service → Environment → *Add from Database* → Render injects it automatically.
  - **Neon:** [neon.tech](https://neon.tech) → project → Connection Details → copy URI.
  - **Supabase:** Project Settings → Database → Connection string (Session mode, port 5432).
- **Where to set:** Render environment variables.
- **If absent:** App crashes at startup — `lib/db` cannot connect.

---

### `SESSION_SECRET`
- **What it does:** Signs and verifies HTTP session cookies. Must be secret and stable — changing it invalidates all active sessions.
- **Format:** Any long random string; 64 hex characters recommended.
- **How to generate:**
  ```bash
  openssl rand -hex 32
  ```
- **Where to set:** Render environment variables.
- **If absent:** App refuses to start (express-session throws).

---

### `ADMIN_PASSWORD`
- **What it does:** Password for the built-in `admin` account created during database seeding.
- **Format:** Any string; use something strong.
- **How to generate:** Choose manually or use `openssl rand -base64 16`.
- **Where to set:** Render environment variables.
- **If absent:** Seed script uses a fallback default — insecure for production.
- **Note:** Only used at seed time. Changing it after seeding has no effect unless you re-seed or manually update the DB.

---

### `OPERATOR_PASSWORD`
- **What it does:** Password for the built-in `operator` account created during database seeding.
- **Format / generation:** Same as `ADMIN_PASSWORD`.
- **Where to set:** Render environment variables.
- **If absent:** Same behaviour as `ADMIN_PASSWORD`.

---

### `NODE_ENV`
- **What it does:** Switches the app between development and production mode (error detail, cache headers, rate-limit loopback skip).
- **Value:** `production`
- **Where to set:** Render environment variables.

---

### `PORT`
- **What it does:** Port the Express server listens on.
- **Value:** `8080`
- **Where to set:** Render environment variables.

---

## 3. Recommended — Set Before Going Live

### `CORS_ORIGIN`
- **What it does:** Adds extra allowed origins to the CORS policy. Render/Replit domains are auto-detected; this is only needed for external frontend URLs (e.g. Vercel).
- **Format:** Comma-separated URLs — `https://your-app.vercel.app` or `https://your-app.vercel.app,https://custom-domain.com`
- **Where to set:** Render environment variables.
- **If absent:** API rejects requests from your Vercel frontend → login/auth calls fail.

---

### `VITE_API_URL` *(Vercel only)*
- **What it does:** Build-time variable baked into the frontend bundle — tells the SPA where the API lives.
- **Format:** `https://your-api-service.onrender.com` (no trailing slash)
- **Where to set:** Vercel → Settings → Environment Variables → ✅ Production ✅ Preview ✅ Development.
- **If absent:** Frontend falls back to relative URLs — works only when API and frontend are on the same domain (not the case with Render + Vercel split).
- **Important:** Requires a **Vercel redeploy** after adding — `VITE_*` vars are baked at build time, not runtime.

---

## 4. Auto-Generated (Leave Blank — App Handles These)

### `ENCRYPTION_KEY`
- **What it does:** 32-byte AES-256-GCM key used to encrypt PII fields (`address`, `bio`, `notes`, `totpSecret`, `backupCodes`) at rest.
- **How it works:** On first boot, `ensureEncryptionKey()` checks the `settings` table. If absent, generates a new key and persists it there. Subsequent boots load it from the DB.
- **Where to set:** Nowhere — leave blank. Optionally set in Render if you want to manage the key externally (e.g. for key rotation across multiple instances).
- **Format if set manually:** 32-byte value encoded as base64 — `openssl rand -base64 32`
- **⚠️ Warning:** If you change or lose this key, all encrypted fields become unreadable. Back it up.

### VAPID Keys (Push Notifications)
- **Variables:** `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
- **How it works:** Auto-generated by `ensureVapidKeys()` on first boot, stored in `settings` table.
- **Where to set:** Nowhere — fully automatic.
- **Note:** Rotating VAPID keys invalidates all existing push subscriptions (users must re-subscribe).

---

## 5. Optional External Services

### `SENTRY_DSN` — Server Error Tracking
- **What it does:** Sends unhandled server exceptions to Sentry.
- **How to get:**
  1. [sentry.io](https://sentry.io) → New Project → **Node.js**
  2. Copy the DSN shown on setup (format: `https://abc@o123.ingest.sentry.io/456`)
- **Where to set:** Render environment variables.
- **If absent:** Errors log to console only — no Sentry tracking.

---

### `VITE_SENTRY_DSN` — Client Error Tracking
- **What it does:** Sends unhandled frontend exceptions to Sentry.
- **How to get:**
  1. [sentry.io](https://sentry.io) → New Project → **React**
  2. Copy the DSN (create a separate project from the server DSN above)
- **Where to set:** Vercel environment variables.
- **If absent:** Client errors are silent — no Sentry tracking.

---

### `MAXMIND_LICENSE_KEY` — GeoIP
- **What it does:** Allows the app to download updated GeoLite2 IP databases weekly (Sunday 3am cron).
- **How to get:**
  1. [maxmind.com](https://www.maxmind.com) → Create account → **Manage License Keys** → Generate
- **Where to set:** Render environment variables.
- **If absent:** GeoIP works with the bundled database; just won't auto-update weekly.

---

## 6. Removed Secrets (Do Not Set)

These were used by services removed in v4.10.1. Setting them has no effect — the code no longer reads them.

| Variable | Previously Used For |
|----------|-------------------|
| `SMTP_PASSWORD` / `SMTP_PASS` | Nodemailer Gmail SMTP (removed) |
| `SMTP_HOST` | SMTP server hostname (removed) |
| `SMTP_PORT` | SMTP server port (removed) |
| `SMTP_USER` | SMTP login username (removed) |
| `SMTP_FROM_EMAIL` | From address for outbound emails (removed) |
| `REDIS_URL` | BullMQ / ioredis job queue (removed) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST cache (removed) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token (removed) |
| `B2_KEY_ID` | Backblaze B2 avatar/backup storage (removed) |
| `B2_APP_KEY` | Backblaze B2 application key (removed) |
| `B2_BUCKET_NAME` | B2 bucket name (removed) |
| `B2_BUCKET_ENDPOINT` | B2 S3-compatible endpoint (removed) |
| `CACHE_BACKEND` | `memory` vs `redis` cache switch (removed) |
| `VAPID_EMAIL` | VAPID contact email (removed) |

---

## 7. Platform Setup Guides

### Render — Step by Step

1. Create a **PostgreSQL** service → note the internal connection string.
2. Create a **Web Service**, connect your repo.
   - Build: `pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build`
   - Start: `node artifacts/api-server/dist/index.mjs`
3. In the Web Service → **Environment** tab:
   - Click **Add from Database** → select your PostgreSQL service (`DATABASE_URL` auto-added).
   - Add remaining variables manually (see §2 and §3).
4. **First deploy** — once running, open the **Shell** tab and seed:
   ```bash
   pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts
   ```
5. Optionally add a **Persistent Disk** (mount path `/app/backups`) for durable backup storage.

---

### Vercel — Step by Step

1. Import your repo in the Vercel dashboard.
2. **Settings → Environment Variables** — add:
   ```
   VITE_API_URL   →  https://your-api.onrender.com
   ```
3. **Settings → Build & Development Settings**:
   - Build command: `pnpm install --frozen-lockfile && PORT=5000 BASE_PATH=/ pnpm --filter @workspace/sahu-csc run build`
   - Output directory: `artifacts/sahu-csc/dist`
4. Add `vercel.json` to the repo root:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
5. Deploy — after deploy copy the production URL and add it to `CORS_ORIGIN` on Render.

---

### Neon — Step by Step

1. [neon.tech](https://neon.tech) → Create account → **New Project**.
2. Pick a region matching your Render region (e.g. `us-east-1`).
3. Dashboard → **Connection Details** → copy the **Connection string**.
4. Paste as `DATABASE_URL` in Render environment variables.
5. *(Vercel users)* Vercel Marketplace → **Neon** → Add Integration — `DATABASE_URL` auto-added to your project.

---

### Supabase — Step by Step

1. [supabase.com](https://supabase.com) → New project.
2. **Project Settings → Database → Connection string** — choose **URI**, copy it.
   - Use **Session mode** (port `5432`), not Transaction mode.
3. Paste as `DATABASE_URL` in Render environment variables.

---

## 8. Generating Secrets Locally

```bash
# SESSION_SECRET — 64 hex chars
openssl rand -hex 32

# ENCRYPTION_KEY — 32 bytes base64 (only if managing manually)
openssl rand -base64 32

# ADMIN_PASSWORD / OPERATOR_PASSWORD — readable random
openssl rand -base64 16
```

---

## 9. Secrets Checklist Before Go-Live

- [ ] `DATABASE_URL` set and database reachable
- [ ] `SESSION_SECRET` set (random, 64+ chars)
- [ ] `ADMIN_PASSWORD` set
- [ ] `OPERATOR_PASSWORD` set
- [ ] `NODE_ENV=production` set on Render
- [ ] `PORT=8080` set on Render
- [ ] `CORS_ORIGIN` set to Vercel frontend URL
- [ ] `VITE_API_URL` set on Vercel to Render API URL
- [ ] Database seeded (seed script run once after first deploy)
- [ ] Vercel redeployed after adding `VITE_*` variables
- [ ] None of the removed secrets (§6) are set
