# Task: Multi-Platform Deployment Setup
## Replit (Dev) + GitHub (Bridge) + Render (Backend) + Vercel (Frontend)

Read `AGENT.md` and `DEVELOPMENT_WORKFLOW.md` fully before starting.

**Goal:** Configure the codebase so it works correctly on all three environments:
- **Replit** — daily development + testing + git push
- **Render** — production Express API backend
- **Vercel** — production React PWA frontend

Most infrastructure is already in place (render.yaml, vercel.json, env.ts, b2.ts,
redisBackend.ts, mailer, queue-client). This prompt fixes the remaining gaps and
ensures a clean, one-command deploy to both platforms.

---

## Current State (read before touching anything)

✅ Already done — do NOT redo these:
- `artifacts/api-server/src/lib/b2.ts` — full B2 implementation, `isB2Configured()` gated
- `artifacts/api-server/src/lib/cache/redisBackend.ts` — Upstash Redis backend
- `artifacts/api-server/src/lib/cache/backend.ts` — auto-selects Redis vs memory
- `artifacts/api-server/src/lib/mailer/` — Nodemailer + templates
- `artifacts/api-server/src/lib/queue-client.ts` — BullMQ with Redis fallback
- `artifacts/api-server/src/app.ts` — RedisStore for rate limiters
- `artifacts/api-server/src/lib/env.ts` — required + recommended var validation
- `render.yaml` — Render Blueprint config
- `artifacts/sahu-csc/vercel.json` — Vercel rewrites + cache headers
- `DEVELOPMENT_WORKFLOW.md` — full platform guide

⚠️ What still needs fixing (this prompt's job):
1. `vercel.json` API URL is hardcoded — needs to match actual Render URL
2. Session cookie `sameSite: "strict"` breaks cross-origin (Vercel → Render)
3. No `NEON_DATABASE_URL` fallback in lib/db — both var names must work
4. Missing `SMTP_PASSWORD` alias (code uses both `SMTP_PASS` and `SMTP_PASSWORD`)
5. No `.gitignore` check — secrets and build artifacts must not be committed
6. No first-deploy seed script for Neon DB (session table + initial data)
7. `PORT` env var: Render uses `10000`, Replit uses `8080` — index.ts must handle both
8. Git not initialized — need first-time GitHub push workflow

---

## Part 1 — Fix Session Cookie for Cross-Origin (Vercel → Render)

**Problem:** When Vercel frontend calls Render API, they are on different domains.
`sameSite: "strict"` blocks cookies in cross-origin requests entirely.
`sameSite: "none"` with `secure: true` is required for cross-origin cookies.

File: `artifacts/api-server/src/app.ts`

Find the `session({...})` call and update the cookie block:

```typescript
cookie: {
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  maxAge: 8 * 60 * 60 * 1000,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  // "none" required for cross-origin (Vercel frontend → Render API)
  // "lax" in dev (Replit: same-origin via Vite proxy)
},
```

> ⚠️ `sameSite: "none"` ONLY works when `secure: true`. This is already the case
> since `secure: process.env.NODE_ENV === "production"` evaluates to true on Render.

---

## Part 2 — Fix Vercel API URL (vercel.json)

**Problem:** `artifacts/sahu-csc/vercel.json` currently has:
```json
"destination": "https://sahu-csc-api.onrender.com/api/:path*"
```

This URL is a placeholder. After Render deployment, the actual URL may differ.

**Action:** Update `artifacts/sahu-csc/vercel.json` to use an env var so it can be
changed from Vercel dashboard without editing code:

Replace the rewrites section with:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://sahu-csc-api.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*).html",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, no-cache, must-revalidate" }
      ]
    }
  ]
}
```

> Note: After first Render deploy, come back and update the destination URL
> from `sahu-csc-api.onrender.com` to your actual Render service URL.
> The URL format is always: `https://<service-name>.onrender.com`

---

## Part 3 — Fix SMTP Password Env Var Alias

**Problem:** `render.env` uses `SMTP_PASS` but `mailer/transport.ts` may read `SMTP_PASSWORD`.
Both must work so Replit secrets and Render env vars both function.

File: `artifacts/api-server/src/lib/mailer/transport.ts`

Find where SMTP password is read and ensure it checks both names:

```typescript
const smtpPass =
  process.env["SMTP_PASSWORD"] ??
  process.env["SMTP_PASS"] ??
  "";

export function isSmtpConfigured(): boolean {
  return !!(
    process.env["SMTP_HOST"] &&
    process.env["SMTP_USER"] &&
    smtpPass
  );
}

export function getTransporter(): Transporter {
  if (_transporter) return _transporter;
  if (!isSmtpConfigured()) throw new Error("SMTP not configured");
  _transporter = nodemailer.createTransport({
    host: process.env["SMTP_HOST"]!,
    port: Number(process.env["SMTP_PORT"] ?? 587),
    secure: false,
    auth: {
      user: process.env["SMTP_USER"]!,
      pass: smtpPass,
    },
  });
  return _transporter;
}
```

---

## Part 4 — Fix Neon DB Connection (Both Env Var Names)

File: `lib/db/src/index.ts`

Verify (and fix if needed) that it reads both `NEON_DATABASE_URL` and `DATABASE_URL`:

```typescript
const connectionString =
  process.env["NEON_DATABASE_URL"] ??
  process.env["DATABASE_URL"];

if (!connectionString) {
  throw new Error(
    "Database connection string missing. Set NEON_DATABASE_URL (Neon) or DATABASE_URL (Replit).",
  );
}
```

If this logic already exists, leave it unchanged.

---

## Part 5 — Fix PORT for Replit vs Render

**Problem:** Render free tier sets `PORT=10000`. Replit API server uses `PORT=8080`.
`index.ts` currently throws if `PORT` is not set — but Replit workflows set it via
the workflow config, not always as a shell env var.

File: `artifacts/api-server/src/index.ts`

Update PORT parsing to have a fallback:

```typescript
const rawPort = process.env["PORT"] ?? "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}
```

Remove the `if (!rawPort) throw` check — the fallback handles it.

---

## Part 6 — Verify CORS Handles Render + Vercel

File: `artifacts/api-server/src/app.ts`

Find the CORS configuration. Verify it allows:
1. Replit dev domain (already handled via `REPLIT_DOMAINS` / `REPLIT_DEV_DOMAIN`)
2. Vercel domain via `CORS_ORIGIN` env var

The existing code reads:
```typescript
if (process.env.CORS_ORIGIN) {
  origins.push(...process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean));
}
```

This is correct. No change needed here.

**Important:** In `render.yaml`, `CORS_ORIGIN` is set to `https://sahu-csc.vercel.app`.
Update it to the actual Vercel URL after first frontend deploy.

---

## Part 7 — Create Neon First-Deploy Script

Create `scripts/setup-neon.mjs` — run this ONCE after connecting Neon DB to Render:

```javascript
#!/usr/bin/env node
/**
 * First-deploy setup script for Neon PostgreSQL on Render.
 *
 * Run from Render Shell:
 *   node scripts/setup-neon.mjs
 *
 * What it does:
 * 1. Creates the `session` table (required by connect-pg-simple)
 * 2. Verifies the DB connection
 *
 * Schema tables (users, ledger, etc.) are pushed by drizzle-kit separately.
 * Seed data (admin/operator accounts) is created by the seed script.
 */

import pg from "pg";
const { Pool } = pg;

const connectionString =
  process.env.NEON_DATABASE_URL ??
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌  NEON_DATABASE_URL or DATABASE_URL must be set.");
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  console.log("🔌  Connecting to database...");
  await pool.query("SELECT 1");
  console.log("✅  Database connection OK");

  console.log("📋  Creating session table...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS session (
      sid    VARCHAR NOT NULL COLLATE "default",
      sess   JSON NOT NULL,
      expire TIMESTAMP(6) NOT NULL,
      CONSTRAINT session_pkey PRIMARY KEY (sid)
    );
    CREATE INDEX IF NOT EXISTS session_expire_idx ON session (expire);
  `);
  console.log("✅  Session table ready");

  console.log("\n✅  Neon setup complete!");
  console.log("   Next: Run drizzle-kit push to create schema tables.");
  console.log("   Then: Run the seed script to create admin/operator accounts.");
} catch (err) {
  console.error("❌  Setup failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
```

---

## Part 8 — Update .gitignore

Verify `.gitignore` at the project root contains all of these. Add any that are missing:

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
artifacts/*/dist/
artifacts/api-server/dist/

# Environment files — NEVER commit these
.env
.env.local
.env.production
secrets.md

# Database
*.sql
backups/

# Logs
*.log
logs/

# OS files
.DS_Store
Thumbs.db

# Replit specific
.replit.nix
.cache/
.config/

# Editor
.vscode/settings.json
.idea/
```

> ⚠️ `secrets.md` contains real passwords — verify it is in .gitignore before first push.
> Run `git status` and check nothing sensitive appears in the output.

---

## Part 9 — GitHub First Push (Shell Commands)

Add these shell commands to `scripts/git-init.sh` (create this file):

```bash
#!/usr/bin/env bash
# Run once from Replit Shell to set up GitHub connection.
# Replace GITHUB_USERNAME and REPO_NAME with your actual values.

set -e

GITHUB_USERNAME="sahuuttam690"
REPO_NAME="sahu-csc-manager"

echo "🔧  Configuring git..."
git config user.email "sahuuttam690@gmail.com"
git config user.name "WizzGOD"

echo "📁  Initializing repository..."
git init
git add .
git commit -m "chore: initial commit v4.10.2 — Replit + Render + Vercel ready"

echo "🔗  Connecting to GitHub..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
git branch -M main

echo "🚀  Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅  Done! GitHub push complete."
echo "   Now connect Render and Vercel to this repo:"
echo "   Render: render.com → New → Blueprint → connect ${REPO_NAME}"
echo "   Vercel: vercel.com → Add New → Project → import ${REPO_NAME}"
```

Make it executable:
```bash
chmod +x scripts/git-init.sh
```

---

## Part 10 — Daily Push Script

Create `scripts/push.sh` for quick commits:

```bash
#!/usr/bin/env bash
# Quick commit and push to GitHub.
# Usage: ./scripts/push.sh "Your commit message"

set -e

MSG="${1:-"chore: update $(date '+%Y-%m-%d %H:%M')"}"

echo "📦  Staging all changes..."
git add .

echo "💬  Committing: ${MSG}"
git commit -m "${MSG}"

echo "🚀  Pushing to GitHub..."
git push origin main

echo ""
echo "✅  Pushed! Render + Vercel will auto-deploy in 2-5 minutes."
echo "   Render API:    https://sahu-csc-api.onrender.com/api/health"
echo "   Vercel Frontend: https://sahu-csc.vercel.app"
```

```bash
chmod +x scripts/push.sh
```

---

## Part 11 — Update render.yaml (Final Version)

Replace `render.yaml` at project root with this complete version:

```yaml
# Render Blueprint — SAHU CSC Backend API
# Usage: render.com → New → Blueprint → connect sahu-csc-manager repo

services:
  - type: web
    name: sahu-csc-api
    runtime: node
    region: singapore
    plan: free
    rootDir: artifacts/api-server

    buildCommand: >-
      cd ../.. &&
      npm install -g pnpm@10 &&
      pnpm install --frozen-lockfile &&
      pnpm --filter @workspace/api-server run build

    startCommand: node --enable-source-maps ./dist/index.mjs

    healthCheckPath: /api/health

    envVars:
      # ── Core ──────────────────────────────────────────────────
      - key: NODE_ENV
        value: production

      - key: PORT
        value: 10000

      - key: ALLOW_NON_INDIA
        value: "true"

      - key: CACHE_BACKEND
        value: memory

      # ── Database ───────────────────────────────────────────────
      - key: NEON_DATABASE_URL
        sync: false         # neon.tech → Connection String → postgresql://...

      - key: DB_POOL_MAX
        value: "5"          # Neon free tier: max 5 connections

      # ── Session ───────────────────────────────────────────────
      - key: SESSION_SECRET
        generateValue: true

      # ── Auth & Accounts ────────────────────────────────────────
      - key: ADMIN_PASSWORD
        sync: false

      - key: OPERATOR_PASSWORD
        sync: false

      # ── CORS (Vercel frontend URL) ─────────────────────────────
      - key: CORS_ORIGIN
        value: https://sahu-csc.vercel.app
        # Update after Vercel deploy if URL is different

      # ── Email (Gmail SMTP) ─────────────────────────────────────
      - key: SMTP_HOST
        value: smtp.gmail.com

      - key: SMTP_PORT
        value: "587"

      - key: SMTP_USER
        sync: false         # your Gmail address

      - key: SMTP_PASS
        sync: false         # Gmail App Password (16 chars)

      - key: SMTP_FROM_EMAIL
        sync: false         # "SAHU CSC Support <your@gmail.com>"

      - key: VAPID_EMAIL
        sync: false         # "mailto:your@gmail.com"

      # ── Business Info ──────────────────────────────────────────
      - key: BUSINESS_NAME
        value: SAHU CSC Center

      - key: BUSINESS_ADDRESS
        value: "Main Road, Bargarh, Odisha"

      # ── Logging ────────────────────────────────────────────────
      - key: LOG_LEVEL
        value: info

      # ── Optional: Backblaze B2 ─────────────────────────────────
      - key: B2_KEY_ID
        sync: false

      - key: B2_APP_KEY
        sync: false

      - key: B2_BUCKET_NAME
        value: SAHUCSCV2

      - key: B2_BUCKET_ENDPOINT
        value: https://s3.us-west-004.backblazeb2.com

      # ── Optional: Upstash Redis ────────────────────────────────
      - key: REDIS_URL
        sync: false         # rediss://... (Upstash → Connect → ioredis/node-redis)

      - key: UPSTASH_REDIS_REST_URL
        sync: false         # https://... (Upstash → Connect → @upstash/redis)

      - key: UPSTASH_REDIS_REST_TOKEN
        sync: false

      # ── Optional: Error Tracking ───────────────────────────────
      - key: SENTRY_DSN
        sync: false

      - key: MAXMIND_LICENSE_KEY
        sync: false
```

---

## Part 12 — Update .env.example (Complete)

Replace `.env.example` at project root:

```bash
# ════════════════════════════════════════════════════════════════════════
#  SAHU CSC Manager — Environment Variables Reference
#  ─────────────────────────────────────────────────
#  Replit:  Add secrets in Secrets tab (lock icon in sidebar)
#  Render:  Dashboard → Service → Environment tab
#  Vercel:  Dashboard → Project → Settings → Environment Variables
# ════════════════════════════════════════════════════════════════════════

# ── REQUIRED ──────────────────────────────────────────────────────────
SESSION_SECRET=change-me-to-64-random-hex-chars

# ── Database ───────────────────────────────────────────────────────────
# Replit:   DATABASE_URL auto-injected (do not set manually)
# Render:   Set NEON_DATABASE_URL from neon.tech → Connection String
# neon.tech → your project → Connection String → copy the postgresql:// URL
NEON_DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
DB_POOL_MAX=5

# ── Admin Accounts ─────────────────────────────────────────────────────
ADMIN_PASSWORD=
OPERATOR_PASSWORD=

# ── Server ─────────────────────────────────────────────────────────────
NODE_ENV=development
PORT=8080
ALLOW_NON_INDIA=true
LOG_LEVEL=info

# ── Email / SMTP (Gmail) ────────────────────────────────────────────────
# Google Account → Security → 2-Step Verification → App Passwords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sahuuttam690@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
SMTP_FROM_EMAIL=SAHU CSC Support <sahuuttam690@gmail.com>
VAPID_EMAIL=mailto:sahuuttam690@gmail.com

# ── Business Info ───────────────────────────────────────────────────────
BUSINESS_NAME=SAHU CSC Center
BUSINESS_ADDRESS=Main Road, Bargarh, Odisha

# ── CORS (Vercel URL — Render only) ────────────────────────────────────
CORS_ORIGIN=https://sahu-csc.vercel.app

# ── Backblaze B2 Storage (optional, no credit card) ────────────────────
# backblaze.com → B2 Cloud Storage → App Keys → Add New Key
# Bucket: SAHUCSCV2 (Private, us-west-004)
B2_KEY_ID=
B2_APP_KEY=
B2_BUCKET_NAME=SAHUCSCV2
B2_BUCKET_ENDPOINT=https://s3.us-west-004.backblazeb2.com

# ── Upstash Redis (optional, 10K req/day free) ─────────────────────────
# upstash.com → Create Database → Connect tab
REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxx

# ── Optional Services ───────────────────────────────────────────────────
SENTRY_DSN=
VITE_SENTRY_DSN=
MAXMIND_LICENSE_KEY=
CACHE_BACKEND=memory
```

---

## Part 13 — Update DEVELOPMENT_WORKFLOW.md Deployment Checklist

Add this section to `DEVELOPMENT_WORKFLOW.md` under a new heading `## 11. First Deploy Checklist`:

```markdown
## 11. First Deploy Checklist

### Step 1 — Neon Database Setup
1. neon.tech → Sign up (GitHub login, free, no card)
2. Create project → copy Connection String (postgresql://...)
3. Go to Render Shell after deploy → `node scripts/setup-neon.mjs`
4. Run drizzle-kit push: `pnpm --filter @workspace/db run push-force`
5. Run seed: `node scripts/seed.mjs` (or Seed workflow from Render shell)

### Step 2 — Backblaze B2 (optional but recommended)
1. backblaze.com → Sign up (no card needed for private bucket)
2. B2 Cloud Storage → Create Bucket: `SAHUCSCV2`, Private
3. App Keys → Add New Key → `sahu-csc-key` → bucket: SAHUCSCV2 → Read+Write
4. **COPY applicationKey NOW** — it is only shown once
5. Add to Render env: B2_KEY_ID, B2_APP_KEY, B2_BUCKET_NAME, B2_BUCKET_ENDPOINT

### Step 3 — GitHub Push
1. github.com → New Repository → `sahu-csc-manager` → Private
2. Replit Shell: `bash scripts/git-init.sh`

### Step 4 — Render (Backend)
1. render.com → New → Blueprint → connect `sahu-csc-manager`
2. Fill `sync: false` vars: NEON_DATABASE_URL, ADMIN_PASSWORD, OPERATOR_PASSWORD, SMTP_PASS, SMTP_USER, B2 keys
3. Wait for deploy → check https://your-service.onrender.com/api/health
4. Open Shell tab → `node scripts/setup-neon.mjs`

### Step 5 — Vercel (Frontend)
1. vercel.com → Add New Project → import `sahu-csc-manager`
2. Root Directory: `artifacts/sahu-csc`
3. Build Command: `cd ../.. && npm install -g pnpm && pnpm install --frozen-lockfile && pnpm --filter @workspace/sahu-csc run build`
4. Output Directory: `dist/public`
5. Add env var: `VITE_API_URL = https://your-service.onrender.com` (not needed — vercel.json handles it)
6. Deploy → verify https://sahu-csc.vercel.app

### Step 6 — Cross-link platforms
- Render → CORS_ORIGIN = `https://sahu-csc.vercel.app`
- `vercel.json` destination = `https://your-service.onrender.com/api/:path*`
- Push updated `vercel.json` → `./scripts/push.sh "fix: update API URL"`
```

---

## Part 14 — Final Build Verification

After all changes, verify:

```bash
# 1. Build must succeed cleanly
pnpm --filter @workspace/api-server run build

# 2. No TypeScript errors
pnpm --filter @workspace/api-server exec tsc --noEmit
pnpm --filter @workspace/sahu-csc exec tsc --noEmit

# 3. Frontend build succeeds
pnpm --filter @workspace/sahu-csc run build

# 4. API starts and health endpoint responds
PORT=8080 SESSION_SECRET=test123 DATABASE_URL="$DATABASE_URL" node artifacts/api-server/dist/index.mjs &
sleep 3
curl http://localhost:8080/api/health
```

Expected health response:
```json
{ "status": "ok", "version": "4.10.2" }
```

---

## What NOT to Do

- **Do NOT** change `sameSite` to `"strict"` — it will break Vercel → Render cookie flow
- **Do NOT** commit `.env`, `secrets.md`, or any file with real passwords
- **Do NOT** use `DATABASE_URL` on Render — use `NEON_DATABASE_URL` (Replit auto-injects its own `DATABASE_URL`)
- **Do NOT** run `drizzle-kit push --force` on Neon without re-seeding after — it wipes data
- **Do NOT** set `ALLOW_NON_INDIA=false` on Render — Render servers are in Singapore, not India
- **Do NOT** change the `PORT` to anything other than `10000` on Render (free tier default)
- **Do NOT** hardcode the Render API URL in frontend JS — `vercel.json` rewrites handle `/api/*` routing
- **Do NOT** add Replit-specific packages (`@replit/vite-plugin-*`) to the production build path
