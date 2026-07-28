# SAHU CSC — Vercel Deployment Guide

> **What Vercel hosts:** Frontend only (`artifacts/sahu-csc`)
> **Backend API** runs on Render separately — see `RENDER_SETUP_GUIDE.md`

---

## Overview

```
GitHub Repo
    │
    ├── Vercel (Frontend)      →  https://your-app.vercel.app
    │       │
    │       └── /api/* proxied to Render backend automatically
    │
    └── Render (Backend API)   →  https://sahu-csc-api.onrender.com
```

Vercel serves the React app as a static build. All `/api/*` requests are transparently proxied to your Render backend via `vercel.json` — the browser never makes a cross-origin request.

---

## Method 1 — Auto Setup (Import from GitHub) ✅ Recommended

### Step 1 — Connect GitHub

1. Go to [vercel.com](https://vercel.com) → **Start Deploying**
2. Sign up / log in with GitHub
3. Click **Add New Project** → **Import Git Repository**
4. Select your GitHub repo → click **Import**

### Step 2 — Configure Project Settings

Vercel may auto-detect Vite. Override these settings to be sure:

| Setting | Value |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `artifacts/sahu-csc` |
| **Build Command** | see below |
| **Output Directory** | `dist/public` |
| **Install Command** | *(leave blank — handled by build command)* |

**Build Command:**
```bash
cd ../.. && npm install -g pnpm@10 && pnpm install --frozen-lockfile && pnpm --filter @workspace/sahu-csc run build
```

### Step 3 — Add Environment Variables

Still on the same setup screen, scroll to **Environment Variables** and add:

| Variable | Value |
|---|---|
| `BASE_PATH` | `/` |
| `VITE_SENTRY_DSN` | your Sentry DSN *(optional — leave blank to skip)* |

### Step 4 — Deploy

Click **Deploy**. Vercel builds the app and gives you a live URL.

First deploy takes ~2-3 minutes. You'll see the build logs live.

### Step 5 — Update Render CORS

After deploy, copy your Vercel URL (e.g. `https://your-app.vercel.app`) and go to:

**Render Dashboard → your service → Environment → `CORS_ORIGIN`**

```
CORS_ORIGIN=https://your-app.vercel.app
```

Save — Render auto-redeploys in ~1 minute.

---

## Method 2 — Manual Setup (Vercel CLI)

### Step 1 — Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2 — Login

```bash
vercel login
```

### Step 3 — Deploy from project root

```bash
cd /path/to/your/repo
vercel
```

Answer the prompts:

```
Set up and deploy? Yes
Which scope? (select your account)
Link to existing project? No
Project name: sahu-csc
In which directory is your code? artifacts/sahu-csc
Want to modify settings? Yes
  Build Command: cd ../.. && npm install -g pnpm@10 && pnpm install --frozen-lockfile && pnpm --filter @workspace/sahu-csc run build
  Output Directory: dist/public
  Development Command: (leave blank)
```

### Step 4 — Add Environment Variables via CLI

```bash
vercel env add BASE_PATH
# enter: /
# select: Production, Preview, Development

vercel env add VITE_SENTRY_DSN
# enter: your DSN (or leave blank and press Enter to skip)
```

### Step 5 — Redeploy with env vars applied

```bash
vercel --prod
```

---

## How `vercel.json` Works

Already present at `artifacts/sahu-csc/vercel.json`. Vercel reads it automatically — no manual config needed.

### API Proxy
```json
{ "source": "/api/:path*", "destination": "https://sahu-csc-api.onrender.com/api/:path*" }
```
Every `/api/*` request from the React app is forwarded to Render. The browser sees it as same-origin — no CORS issues.

> ⚠️ **If your Render URL is different**, update this line before deploying:
> ```
> "destination": "https://YOUR-SERVICE-NAME.onrender.com/api/:path*"
> ```

### SPA Routing
```json
{ "source": "/(.*)", "destination": "/index.html" }
```
All URLs serve `index.html` so React Router handles navigation correctly.

### Cache Headers (auto-configured)

| Path | Cache Policy | Reason |
|---|---|---|
| `/sw.js` | No cache | Service worker must always be fresh |
| `/assets/*` | 1 year, immutable | Vite hashes filenames — safe to cache forever |
| `/*.html` | No cache | Always fetch the latest shell |

---

## Auto-Deploy (GitHub → Vercel)

Every `git push` to `main` triggers a Vercel re-deploy automatically:

```bash
git add .
git commit -m "your changes"
git push origin main
# Vercel redeploys in ~1-2 minutes
```

Pull requests also get a **preview URL** automatically — useful for testing changes before merging.

---

## Custom Domain (Optional)

1. **Vercel Dashboard → your project → Settings → Domains**
2. Click **Add Domain** → enter your domain (e.g. `app.sahucsc.in`)
3. Add the DNS records Vercel shows you at your domain registrar
4. SSL is provisioned automatically

After adding a custom domain, update Render:
```
CORS_ORIGIN=https://app.sahucsc.in
```

---

## Verify Everything Works

After deploy, open your Vercel URL in the browser. You should see the login page.

Check the API connection:
```bash
curl https://your-app.vercel.app/api/health
# Expected: {"status":"ok","uptime":...}
```

If `/api/health` returns HTML instead of JSON, the proxy in `vercel.json` is not pointing to the correct Render URL.

---

## Environment Variables Reference

| Variable | Required | Value |
|---|---|---|
| `BASE_PATH` | ✅ Yes | `/` |
| `VITE_SENTRY_DSN` | ❌ Optional | Sentry DSN from sentry.io |

That's all. The frontend has no database, no passwords, no secrets — everything sensitive lives on Render.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Build fails — `pnpm not found` | Check build command includes `npm install -g pnpm@10` |
| Build fails — `dist/public not found` | Output directory must be `dist/public`, not `dist` |
| `/api/*` returns HTML (login page) | `vercel.json` destination URL doesn't match your Render service URL |
| Blank white screen | Check browser console — likely a JS chunk failed to load; redeploy |
| React Router shows 404 on refresh | SPA rewrite rule missing — check `vercel.json` exists in `artifacts/sahu-csc/` |
| CORS error in browser console | `CORS_ORIGIN` on Render doesn't match your exact Vercel URL |
| Old version still showing after deploy | Hard refresh (`Ctrl+Shift+R`) — or check Vercel deployment completed successfully |
| Push notifications not working | `VAPID_PRIVATE_KEY` not set on Render — see `RENDER_SETUP_GUIDE.md` |

---

## Free Tier Limits

| Limit | Value |
|---|---|
| Deployments | Unlimited |
| Bandwidth | 100 GB/month |
| Build minutes | 6,000 min/month |
| Serverless functions | 100 GB-hrs/month |
| Custom domains | Unlimited |

> Vercel free tier is generous — a typical CSC app will stay well within limits.
