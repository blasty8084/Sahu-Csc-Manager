# Sahu CSC — Deployment Guide
## Replit (Dev) → Vercel (Frontend) + Render (Backend)

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│           DEVELOPMENT (Replit)               │
│  Code likho → Test karo → GitHub push karo  │
└──────────────────┬──────────────────────────┘
                   │ git push
          ┌────────┴────────┐
          ▼                 ▼
┌─────────────────┐  ┌─────────────────────┐
│     VERCEL      │  │       RENDER        │
│  Frontend PWA   │  │   Backend API       │
│  (sahu-csc)     │  │   (api-server)      │
│  Free forever   │  │   Free tier         │
└────────┬────────┘  └──────────┬──────────┘
         │                      │
         └──────────┬───────────┘
                    ▼
        ┌───────────────────────┐
        │   External Services   │
        │  Neon PostgreSQL      │
        │  Backblaze B2         │
        │  Upstash Redis        │
        └───────────────────────┘
```

---

## Step 1 — GitHub Setup (One Time)

### 1a. GitHub pe repo banao
1. **github.com** → "New Repository"
2. Name: `sahu-csc-manager`
3. Private ✅
4. "Create Repository"

### 1b. Replit se GitHub connect karo
Replit mein Shell open karo:

```bash
# Git init (agar pehle se nahi hai)
git init
git add .
git commit -m "Initial commit v4.10.0"

# GitHub remote add karo
git remote add origin https://github.com/TUMHARA_USERNAME/sahu-csc-manager.git
git branch -M main
git push -u origin main
```

### 1c. Future mein code push karna
```bash
git add .
git commit -m "Feature ya fix description"
git push origin main
```

Auto-deploy hoga — Vercel aur Render automatically new code pick up karenge.

---

## Step 2 — Render Setup (Backend API)

### 2a. Account banao
**render.com** → "Get Started for Free" → GitHub se login karo (no card needed)

### 2b. New Web Service banao
1. Dashboard → **"New +"** → **"Web Service"**
2. **"Connect a repository"** → apna `sahu-csc-manager` repo select karo
3. Fill karo:

| Field | Value |
|---|---|
| **Name** | `sahu-csc-api` |
| **Region** | Singapore (India ke sabse paas) |
| **Branch** | `main` |
| **Root Directory** | `artifacts/api-server` |
| **Runtime** | Node |
| **Build Command** | `cd ../.. && npm install -g pnpm && pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build` |
| **Start Command** | `node --enable-source-maps ./dist/index.mjs` |
| **Instance Type** | Free |

### 2c. Environment Variables add karo
Render Dashboard → apni service → **"Environment"** tab → **"Add Environment Variable"**

```
NODE_ENV              = production
PORT                  = 8082
NEON_DATABASE_URL     = <neon connection string>
SESSION_SECRET        = <32+ char random string>
ADMIN_PASSWORD        = <strong password>
OPERATOR_PASSWORD     = <strong password>
CORS_ORIGIN           = https://sahu-csc.vercel.app
B2_KEY_ID             = <backblaze key id>
B2_APP_KEY            = <backblaze app key>
B2_BUCKET_NAME        = SAHUCSCV2
B2_BUCKET_ENDPOINT    = https://s3.us-west-004.backblazeb2.com
SMTP_HOST             = smtp.gmail.com
SMTP_PORT             = 587
SMTP_USER             = <gmail address>
SMTP_PASS             = <gmail app password>
SMTP_FROM_EMAIL       = <gmail address>
VAPID_EMAIL           = mailto:<gmail address>
ALLOW_NON_INDIA       = true
```

> **SESSION_SECRET generate karna**: Replit shell mein `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` run karo

### 2d. Deploy karo
**"Create Web Service"** → Render automatically build + deploy karega (3-5 min)

Tumhara API URL milega: `https://sahu-csc-api.onrender.com`

---

## Step 3 — Vercel Setup (Frontend PWA)

### 3a. Account banao
**vercel.com** → "Start Deploying" → GitHub se login karo (no card needed)

### 3b. New Project banao
1. Dashboard → **"Add New..."** → **"Project"**
2. Apna `sahu-csc-manager` repo import karo
3. Fill karo:

| Field | Value |
|---|---|
| **Project Name** | `sahu-csc` |
| **Framework Preset** | Vite |
| **Root Directory** | `artifacts/sahu-csc` |
| **Build Command** | `cd ../.. && npm install -g pnpm && pnpm install --frozen-lockfile && pnpm --filter @workspace/sahu-csc run build` |
| **Output Directory** | `dist/public` |
| **Install Command** | *(leave empty)* |

### 3c. Environment Variables add karo
Vercel → Project → **"Settings"** → **"Environment Variables"**

```
VITE_API_URL    = https://sahu-csc-api.onrender.com
NODE_ENV        = production
BASE_PATH       = /
```

### 3d. vercel.json banao
`artifacts/sahu-csc/vercel.json` file banao:

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
    }
  ]
}
```

### 3e. Deploy karo
**"Deploy"** → Vercel automatically build karega (2-3 min)

Tumhara frontend URL milega: `https://sahu-csc.vercel.app`

---

## Step 4 — CORS Fix

Deploy hone ke baad Render mein `CORS_ORIGIN` update karo:

```
CORS_ORIGIN = https://sahu-csc.vercel.app
```

Render service restart karega automatically.

---

## Step 5 — Replit mein Development Workflow

### Replit ka role sirf development hai:
```
Replit = Code editor + Testing environment
Vercel + Render = Production deployment
```

### Daily workflow:

```bash
# 1. Replit mein code karo
# 2. Replit pe test karo (localhost)
# 3. Sab theek laga toh GitHub push karo

git add .
git commit -m "Fix: login page bug"
git push origin main

# 4. Auto-deploy hoga:
#    - Vercel: frontend 2-3 min mein live
#    - Render: backend 3-5 min mein live
```

### Replit pe local testing ke liye secrets:
```
# Replit Secrets (development only)
DATABASE_URL or NEON_DATABASE_URL   ← same Neon DB (ya alag dev DB)
SESSION_SECRET                      ← same as production
ALLOW_NON_INDIA = true              ← already set hai
B2_KEY_ID, B2_APP_KEY etc          ← same B2 bucket
```

---

## Step 6 — Session Table (One Time Only)

Render pe pehli baar deploy ke baad Render Shell mein run karo:

```bash
node -e "
const { Pool } = await import('pg');
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });
await pool.query(\`
  CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR NOT NULL COLLATE \"default\",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL,
    CONSTRAINT session_pkey PRIMARY KEY (sid)
  );
  CREATE INDEX IF NOT EXISTS session_expire_idx ON session(expire);
\`);
console.log('Session table created');
await pool.end();
"
```

---

## Summary — Kya Kahan Hoga

| Cheez | Platform | URL |
|---|---|---|
| Code likhna | **Replit** | replit.com |
| Testing | **Replit** | replit.dev preview |
| Frontend (PWA) | **Vercel** | sahu-csc.vercel.app |
| Backend (API) | **Render** | sahu-csc-api.onrender.com |
| Database | **Neon** | neon.tech |
| File Storage | **Backblaze B2** | backblaze.com |
| Push to deploy | **GitHub** | github.com |

## Cost — Sab Free!

| Service | Cost |
|---|---|
| Replit | Free (dev only) |
| Vercel | Free forever |
| Render | Free (cold start hoga) |
| Neon | Free (0.5GB) |
| Backblaze B2 | Free (10GB) |
| GitHub | Free (private repo) |
| **Total** | **₹0/month** |
