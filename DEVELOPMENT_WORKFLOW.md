# SAHU CSC — Development & Deployment Workflow
**Version 4.10.3 · Updated 2026-08-02**

> **TL;DR — Teen platform, ek kaam:**
> - **Replit** = Code likhna + test karna (development)
> - **GitHub** = Code store karna + auto-deploy trigger
> - **Vercel** = Frontend live karna (PWA, free forever)
> - **Render** = Backend API live karna (free tier)

---

## Table of Contents

1. [Big Picture — Kya kahan hoga](#1-big-picture)
2. [Platform Roles — Har platform ka kaam](#2-platform-roles)
3. [Replit — Daily Development](#3-replit-daily-development)
4. [GitHub — Code Bridge](#4-github-code-bridge)
5. [Render — Backend Deployment](#5-render-backend-deployment)
6. [Vercel — Frontend Deployment](#6-vercel-frontend-deployment)
7. [Environment Variables — Kahan kya set karo](#7-environment-variables)
8. [Daily Workflow — Step by step](#8-daily-workflow)
9. [Troubleshooting — Common problems](#9-troubleshooting)
10. [Cost — Sab free!](#10-cost)

---

## 1. Big Picture

```
┌─────────────────────────────────────────────────────────┐
│                  REPLIT (Development)                    │
│                                                          │
│  Code likhte hain  →  Test karte hain  →  Push karte hain│
│                                                          │
│  • API Server (port 8080)   ← Express/Node backend       │
│  • Frontend (port 5000)     ← React/Vite dev server      │
│  • Replit DB (PostgreSQL)   ← Development database       │
└──────────────────────────┬──────────────────────────────┘
                           │  git push origin main
                           │
              ┌────────────▼────────────┐
              │    GITHUB (Code Store)   │
              │  sahu-csc-manager repo   │
              └────────┬────────┬───────┘
                       │        │
            Auto-deploy│        │Auto-deploy
                       ▼        ▼
         ┌─────────────────┐  ┌─────────────────────┐
         │    VERCEL       │  │       RENDER         │
         │  Frontend PWA   │  │   Backend API        │
         │  (React build)  │  │   (Express server)   │
         │  Free forever   │  │   Free tier          │
         └────────┬────────┘  └──────────┬───────────┘
                  │                      │
                  └──────────┬───────────┘
                             ▼
              ┌──────────────────────────┐
              │    External Services     │
              │  • Neon PostgreSQL       │  ← Production DB
              │  • Upstash Redis         │  ← Cache + Jobs (optional)
              │  • Backblaze B2          │  ← File storage (optional)
              │  • Gmail SMTP            │  ← Email OTP
              └──────────────────────────┘
```

---

## 2. Platform Roles

| Platform | Role | URL |
|----------|------|-----|
| **Replit** | Code likhna, locally test karna | replit.com |
| **GitHub** | Code store + auto-deploy bridge | github.com |
| **Vercel** | Frontend (React PWA) host karna | https://sahu-csc-manager-sahu-csc.vercel.app |
| **Render** | Backend API host karna | https://sahu-csc-api-02wn.onrender.com |
| **Neon** | Production PostgreSQL database | neon.tech |
| **Upstash** | Redis (optional, background jobs) | upstash.com |
| **Backblaze B2** | File storage for avatars/backups | backblaze.com |

### Why alag-alag platforms?

- **Replit** mein live server continuously run karna expensive hoga
- **Vercel** static React build ko globally fast serve karta hai — free
- **Render** Node.js API ko reliable serve karta hai — free tier available
- **GitHub** ek jagah se dono ko auto-update karta hai — push karo, baaki sab apne aap

---

## 3. Replit — Daily Development

Replit sirf development ke liye hai. Yahan tum code likhte ho aur test karte ho.

### Running Workflows (Port map)

| Workflow | Port | Kya karta hai |
|----------|------|----------------|
| **API Server** | 8080 | Express backend build + run karta hai |
| **artifacts/sahu-csc: web** | 5000 | React frontend Vite dev server |
| **Seed Database** | — | Admin/operator accounts + services seed karta hai |
| **Worker Server** | 8081 | BullMQ background jobs (sirf REDIS_URL set hone par) |

### Preview kaise kaam karta hai

```
Browser (Replit preview)
    → http://localhost:5000          (Vite dev server)
        → /api/* requests            (proxied to localhost:8080)
            → Express API Server
                → Replit PostgreSQL DB
```

### Development ke liye zaruri secrets (Replit Secrets tab mein set karo)

| Secret | Description |
|--------|-------------|
| `SESSION_SECRET` | Auto-set hai (session signing) |
| `ADMIN_PASSWORD` | Admin login password |
| `OPERATOR_PASSWORD` | Operator login password |
| `SMTP_PASSWORD` | Gmail App Password (optional, OTP ke liye) |

### Re-import ke baad kya karna hai (har baar)

```bash
# 1. Dependencies install karo
pnpm install

# 2. Database schema push karo
cd lib/db && pnpm exec drizzle-kit push --force

# 3. Seed Database workflow run karo (Replit sidebar se)

# 4. API Server workflow start karo

# 5. Preview tab mein app check karo
```

> **Note:** Replit ka `DATABASE_URL` automatically set hota hai — manually set karne ki zarurat nahi.

---

## 4. GitHub — Code Bridge

GitHub ka kaam sirf ek hai: code store karna aur Vercel/Render ko auto-deploy ke liye signal dena.

### First time setup

```bash
# Replit Shell mein run karo:

# 1. Git initialize (agar pehle se nahi hai)
git init

# 2. Sab files add karo
git add .
git commit -m "Initial commit v4.10.0"

# 3. GitHub pe repo banao (github.com → New Repository)
#    Name: sahu-csc-manager
#    Private: ✅
#    README: ❌ (already have one)

# 4. Remote connect karo
git remote add origin https://github.com/TUMHARA_USERNAME/sahu-csc-manager.git
git branch -M main
git push -u origin main
```

### Har baar code push karna

```bash
git add .
git commit -m "Fix: login page bug" 
git push origin main
# → Vercel aur Render automatically 2-5 min mein update ho jayenge
```

### .gitignore — Kya push nahi hota

`.gitignore` already configured hai. Ye cheezein kabhi push nahi hongi:
- `node_modules/` (too large, re-installed on each platform)
- `dist/` (built on each platform)
- `.env` files
- `*.log` files

---

## 5. Render — Backend Deployment

Render pe Express API server (`artifacts/api-server`) deploy hota hai.

### One-time setup — Option A: Blueprint (easiest)

`render.yaml` already exists in this repo. Render ise auto-read karega:

1. **render.com** → "Get Started for Free" → GitHub se login
2. Dashboard → **"New +"** → **"Blueprint"**
3. `sahu-csc-manager` repo select karo
4. Render `render.yaml` read karega aur service auto-configure karega
5. `sync: false` wale variables manually enter karo (DB URL, passwords etc.)

### One-time setup — Option B: Manual Web Service

1. Dashboard → **"New +"** → **"Web Service"**
2. `sahu-csc-manager` repo connect karo
3. Fill in settings:

| Field | Value |
|-------|-------|
| **Name** | `sahu-csc-api` |
| **Region** | Singapore |
| **Branch** | `main` |
| **Root Directory** | `artifacts/api-server` |
| **Runtime** | Node |
| **Build Command** | `cd ../.. && npm install -g pnpm@10 && pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build` |
| **Start Command** | `node --dns-result-order=ipv4first --enable-source-maps ./dist/index.mjs` |
| **Instance Type** | Free |

### Render Environment Variables

Render Dashboard → Service → **"Environment"** tab mein ye sab add karo:

```
NODE_ENV              = production
PORT                  = 10000
DATABASE_URL          = <neon connection string>
SESSION_SECRET        = <node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
ADMIN_PASSWORD        = <strong password>
OPERATOR_PASSWORD     = <strong password>
CORS_ORIGIN           = https://sahu-csc-manager-sahu-csc.vercel.app
SMTP_HOST             = smtp.gmail.com
SMTP_PORT             = 587
SMTP_USER             = <gmail>
SMTP_PASS             = <gmail app password>
SMTP_FROM_EMAIL       = SAHU CSC <your@gmail.com>
VAPID_EMAIL           = mailto:your@gmail.com
ALLOW_NON_INDIA       = true
CACHE_BACKEND         = memory
```

Optional (B2, Redis):
```
B2_KEY_ID             = <backblaze key id>
B2_APP_KEY            = <backblaze app key>
B2_BUCKET_NAME        = SAHUCSCV2
B2_BUCKET_ENDPOINT    = https://s3.us-west-004.backblazeb2.com
REDIS_URL             = rediss://... (upstash TCP URL)
UPSTASH_REDIS_REST_URL    = https://...
UPSTASH_REDIS_REST_TOKEN  = ...
```

### Session table (first deploy ke baad ek baar)

Render Dashboard → Service → **"Shell"** tab mein run karo:

```bash
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query(\`
  CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR NOT NULL COLLATE \"default\",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL,
    CONSTRAINT session_pkey PRIMARY KEY (sid)
  );
  CREATE INDEX IF NOT EXISTS session_expire_idx ON session(expire);
\`).then(() => { console.log('Done'); pool.end(); });
"
```

### Render API URL

Deploy hone ke baad: `https://sahu-csc-api-02wn.onrender.com`

> ⚠️ **Free tier cold start:** Render free tier pe 15 min inactivity ke baad server "sleep" ho jaata hai.
> First request aane par 30-60 sec ka cold start hoga. Paid tier pe ye nahi hota.

---

## 6. Vercel — Frontend Deployment

Vercel pe React frontend (`artifacts/sahu-csc`) deploy hota hai.

### One-time setup

1. **vercel.com** → "Start Deploying" → GitHub se login
2. Dashboard → **"Add New..."** → **"Project"**
3. `sahu-csc-manager` repo import karo
4. Fill in settings:

| Field | Value |
|-------|-------|
| **Project Name** | `sahu-csc` |
| **Framework Preset** | Vite |
| **Root Directory** | `artifacts/sahu-csc` |
| **Build Command** | `cd ../.. && npm install -g pnpm && pnpm install --frozen-lockfile && pnpm --filter @workspace/sahu-csc run build` |
| **Output Directory** | `dist/public` |
| **Install Command** | *(empty rakhna)* |

### Vercel Environment Variables

Vercel → Project → **"Settings"** → **"Environment Variables"**:

```
VITE_API_URL = https://sahu-csc-api-02wn.onrender.com
NODE_ENV     = production
BASE_PATH    = /
```

### vercel.json (already created ✅)

`artifacts/sahu-csc/vercel.json` already exists:

```json
{
  "rewrites": [
    { "source": "/api/:path*",
      "destination": "https://sahu-csc-api-02wn.onrender.com/api/:path*" },
    { "source": "/(.*)",
      "destination": "/index.html" }
  ]
}
```

Ye file browser se `/api/*` requests ko automatically Render API pe forward kar deta hai.
React Router ke routes bhi is file ki wajah se 404 se bachte hain.

### Vercel Frontend URL

Deploy hone ke baad: `https://sahu-csc-manager-sahu-csc.vercel.app`

---

## 7. Environment Variables

### Kahan kya set karna hai

| Variable | Replit | Render | Vercel |
|----------|--------|--------|--------|
| `DATABASE_URL` | Auto (Replit DB) | Neon URL | ❌ |
| `SESSION_SECRET` | Replit Secret | Render Env | ❌ |
| `ADMIN_PASSWORD` | Replit Secret | Render Env | ❌ |
| `OPERATOR_PASSWORD` | Replit Secret | Render Env | ❌ |
| `SMTP_PASS` | Replit Secret | Render Env | ❌ |
| `CORS_ORIGIN` | Replit Env Var | Render Env | ❌ |
| `VITE_API_URL` | ❌ (Vite proxy used) | ❌ | Vercel Env |
| `CACHE_BACKEND` | `memory` | `memory` (or `redis`) | ❌ |
| `ALLOW_NON_INDIA` | `true` | `true` | ❌ |
| `PORT` | 8080 (API) | 10000 | ❌ |

### CORS — Kahan se kahan request allowed hai

```
CORS_ORIGIN in Render = https://sahu-csc-manager-sahu-csc.vercel.app
```

Ye set karo render pe, nahi toh browser "CORS error" dikhayega jab Vercel frontend,
Render API ko call karta hai.

---

## 8. Daily Workflow

### Normal development day

```
1. Replit mein code karo
   → API Server + web workflows already running hain
   → Preview tab mein test karo (localhost:5000)
   → Console mein errors check karo

2. Sab kuch theek lage toh commit karo
   git add .
   git commit -m "Feature: added new report chart"
   git push origin main

3. Auto-deploy hoga:
   → Vercel: 2-3 min mein live
   → Render: 3-5 min mein live

4. Live URL pe verify karo:
   → https://sahu-csc-manager-sahu-csc.vercel.app
```

### Naya feature banana

```
1. Replit mein feature likho
2. Local test karo (Replit preview)
3. Koi bug mile toh fix karo
4. Satisfied ho toh push karo
5. Production verify karo
```

### Database schema change karna

```
# Replit development DB:
cd lib/db
pnpm exec drizzle-kit push --force

# Production (Neon) — Render Shell se:
# Same drizzle command, but NEON_DATABASE_URL ke saath
```

---

## 9. Troubleshooting

### "App blank screen" on Replit preview
```
Cause: API Server workflow failed ya start nahi hua
Fix:
  1. API Server workflow restart karo (Replit sidebar)
  2. Logs check karo: errors dikhenge
  3. /api/health curl karo: curl http://localhost:8080/api/health
```

### "CORS error" in browser console
```
Cause: Render pe CORS_ORIGIN sahi set nahi hai
Fix: Render → Environment → CORS_ORIGIN = https://sahu-csc-manager-sahu-csc.vercel.app
     Phir service restart karo
```

### Render app not responding (504/502)
```
Cause: Free tier cold start (15 min sleep)
Fix: 30-60 sec wait karo, phir refresh karo
     Ya paid tier upgrade karo (no cold starts)
```

### "Session expired" on every login
```
Cause: SESSION_SECRET alag hai Render aur Replit mein
Fix: Same SESSION_SECRET dono jagah use karo
     Ya SESSION_SECRET change mat karo production mein
```

### Login kaam nahi kar raha after deploy
```
Cause: Session table exist nahi karta Neon DB mein
Fix: Section 5 ka "Session table" SQL run karo (Render Shell se)
```

### Vercel build fail
```
Cause: Build command ya output directory wrong
Fix:
  Output Directory: dist/public  (dist nahi, dist/public)
  Root Directory: artifacts/sahu-csc
```

### GitHub push rejected
```
Cause: Remote mein changes hain jo local mein nahi hain
Fix:
  git pull origin main --rebase
  git push origin main
```

---

## 10. Cost

| Service | Plan | Cost |
|---------|------|------|
| Replit | Free (dev only) | ₹0 |
| GitHub | Free (private repo) | ₹0 |
| Vercel | Free (Hobby) | ₹0 |
| Render | Free (cold starts) | ₹0 |
| Neon PostgreSQL | Free (0.5GB) | ₹0 |
| Backblaze B2 | Free (10GB) | ₹0 |
| Upstash Redis | Free (10K cmds/day) | ₹0 |
| **Total** | | **₹0/month** |

> **Upgrade kab karo?**
> - Render paid ($7/mo): No cold starts, always-on API
> - Neon paid ($19/mo): More storage, multiple DBs
> - Replit Core: Better performance for development

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│              SAHU CSC — Quick Reference              │
├─────────────────┬───────────────────────────────────┤
│ Dev URL         │ Replit preview (port 5000)         │
│ Prod Frontend   │ https://sahu-csc-manager-sahu-csc.vercel.app │
│ Prod API        │ https://sahu-csc-api-02wn.onrender.com       │
│ API Health      │ /api/health                        │
├─────────────────┼───────────────────────────────────┤
│ Code push       │ git push origin main               │
│ DB schema push  │ drizzle-kit push --force (lib/db/) │
│ Re-seed         │ Run "Seed Database" workflow        │
├─────────────────┼───────────────────────────────────┤
│ Admin login     │ admin / <ADMIN_PASSWORD>           │
│ Operator login  │ operator / <OPERATOR_PASSWORD>     │
└─────────────────┴───────────────────────────────────┘
```

---

### OTP email nahi aa raha (`ENETUNREACH` / IPv6 error)
```
Cause: Render free tier Gmail SMTP ko IPv6 resolve karta hai (outbound blocked)
Fix (baked in v4.10.3):
  - src/index.ts → setDefaultResultOrder("ipv4first") is the very first line
  - render.yaml  → --dns-result-order=ipv4first flag in startCommand
  - transport.ts → resolve4() se direct IPv4 address pin karo
Verify: Latest commit push + Render redeploy karo.
        SMTP_PASS must be a Gmail App Password (not your Gmail login password).
```

### Health check (sabhi 3 environments at once)
```bash
bash scripts/health-check.sh
# Checks: Render API + Vercel frontend + Vercel→Render proxy
# All should return HTTP 200
```

*Related files:*
- `setup.md` — Replit first-time setup (detailed)
- `secrets.md` — All environment variables reference
- `ARCHITECTURE.md` — Technical architecture deep-dive
- `DOCS.md` — Full platform documentation
- `RENDER_DEPLOY.md` — Render-specific guide (includes SMTP IPv4 fix section)

---

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
6. Deploy → verify https://sahu-csc-manager-sahu-csc.vercel.app

### Step 6 — Cross-link platforms
- Render → CORS_ORIGIN = `https://sahu-csc-manager-sahu-csc.vercel.app`
- `vercel.json` destination = `https://your-service.onrender.com/api/:path*`
- Push updated `vercel.json` → `./scripts/push.sh "fix: update API URL"`
