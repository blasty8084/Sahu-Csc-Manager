# Vercel Frontend Deployment Guide — SAHU CSC

> Hinglish guide for deploying the React/Vite frontend on Vercel.
> Backend/API is already deployed on Render at:
> `https://sahu-csc-api-02wn.onrender.com`

## Current deployment architecture

| Part | Platform | URL / location |
|---|---|---|
| Frontend | Vercel | `https://sahu-csc-manager-sahu-csc.vercel.app` (verified live) |
| Backend API | Render | `https://sahu-csc-api-02wn.onrender.com` |
| Database | Neon PostgreSQL | Configured through Render environment variables |

Vercel sirf frontend serve karega. Render API requests handle karega, aur
Vercel ka `/api/*` rewrite Render backend ko forward karega.

## Step 1 — GitHub repository ready karo

Latest code GitHub par push hona chahiye:

```bash
git add .
git commit -m "docs: add Render and Vercel deployment guides"
git push origin main
```

Repository:

```text
https://github.com/blasty8084/Sahu-Csc-Manager
```

## Step 2 — Vercel project create karo

1. [vercel.com](https://vercel.com) open karo.
2. **Add New → Project** par click karo.
3. GitHub repository `Sahu-Csc-Manager` select karo.
4. **Import** par click karo.
5. Project name set karo:

```text
sahu-csc
```

> Agar name available nahi hai, `sahu-csc-frontend` use kar sakte ho.

## Step 3 — Root Directory sahi set karo

**Root Directory → Edit** par click karo aur select karo:

```text
artifacts/sahu-csc
```

`./` select mat karo. `./` repository root hai, jahan frontend ka direct
`package.json` nahi hai; isi wajah se Vercel ka Application/Framework Preset
blank ho sakta hai.

Agar option dikhe:

```text
Include files outside of the root directory in the Build Step
```

to ise enabled rakho.

## Step 4 — Vercel build settings

Configure Project screen par ye exact values use karo:

| Setting | Value |
|---|---|
| Framework Preset | `Vite` |
| Root Directory | `artifacts/sahu-csc` |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm run build` |
| Output Directory | `dist/public` |
| Node.js Version | `20.x` |

Root Directory `artifacts/sahu-csc` hone ke baad Output Directory sirf
`dist/public` hogi. Full path `artifacts/sahu-csc/dist/public` nahi likhna hai.

### Agar `pnpm` command error aaye

Install Command ko isse replace karo:

```bash
corepack enable && pnpm install --frozen-lockfile
```

## Step 5 — Environment variables

Frontend Vercel build ke liye database ya password variables add mat karo.

Ye secrets Vercel par **nahi** rakhne hain:

```text
DATABASE_URL
NEON_DATABASE_URL
SESSION_SECRET
ADMIN_PASSWORD
OPERATOR_PASSWORD
```

Ye backend/Render environment ke secrets hain.

## Step 6 — Deploy karo

1. Settings verify karo.
2. **Deploy** click karo.
3. Build complete hone ka wait karo.
4. Deployment URL open karo.

Verified production URL:

```text
https://sahu-csc-manager-sahu-csc.vercel.app
```

## Step 7 — API rewrite verify karo

Root `vercel.json` aur frontend `artifacts/sahu-csc/vercel.json` mein ye
rewrite configured hai:

```text
/api/:path* → https://sahu-csc-api-02wn.onrender.com/api/:path*
```

Isliye frontend mein API calls relative `/api/...` path par hi rahengi.
Frontend code mein Render URL hardcode karne ki zaroorat nahi hai.

## Step 8 — Render CORS update karo

Vercel deploy ke baad Render dashboard mein:

1. `sahu-csc-api` service open karo.
2. **Environment** tab open karo.
3. `CORS_ORIGIN` ko exact Vercel URL par set karo:

```text
https://sahu-csc-manager-sahu-csc.vercel.app
```

4. **Save Changes** karo.
5. Render ko redeploy hone do.

Trailing slash mat lagao. Agar Replit preview bhi allow karna ho, to comma
separate karke origins add kar sakte ho:

```text
https://sahu-csc-manager-sahu-csc.vercel.app,https://your-replit-preview.replit.dev
```

## Step 9 — Production verification

Vercel URL par ye checks karo:

- SAHU CSC splash screen load hoti hai.
- Login page open hota hai.
- `admin` account se login hota hai.
- Dashboard load hota hai.
- Browser Network tab mein `/api/auth/login` request successful hai.
- Browser console mein CORS error nahi hai.
- Dashboard refresh karne par 404 nahi aata.
- Direct deep link, jaise `/ledger`, refresh ke baad bhi open hota hai.

Verified live URL:

```text
https://sahu-csc-manager-sahu-csc.vercel.app/
```

Render API health check:

```bash
curl https://sahu-csc-api-02wn.onrender.com/api/health
```

Expected response mein status `ok` hona chahiye.

## Common problems

| Problem | Fix |
|---|---|
| Application Preset blank | Root Directory `artifacts/sahu-csc` set karo, phir Framework Preset `Vite` select karo |
| `pnpm: command not found` | Install Command mein `corepack enable &&` add karo |
| `dist/public` missing | Build `pnpm run build` aur output `dist/public` verify karo |
| Login par CORS error | Render mein exact Vercel URL ka `CORS_ORIGIN` set karke redeploy karo |
| Refresh par 404 | `vercel.json` ka SPA rewrite `/index.html` present hona chahiye |
| First API request slow | Render free tier idle hone par sleep karta hai; cold start normal hai |

## Automatic deployments

Vercel project ko GitHub `main` branch se connect karne ke baad har new push
par frontend automatically build aur deploy hoga. Render bhi connected branch
ke new push par API redeploy karega.

### GitHub Actions deploy pipeline (`.github/workflows/deploy.yml`)

Har `git push origin main` ke baad automatically run hota hai:

```
✅ Node.js 22  (Render se match, package.json engines compatible)
✅ pnpm 10     (package.json engines: "pnpm": ">=10.0.0")
✅ vercel pull --yes --environment=production
✅ vercel build --prod
✅ vercel deploy --prebuilt --prod
✅ curl -f -X POST $RENDER_DEPLOY_HOOK_URL
```

### Replit se push karne ka sahi tarika

```bash
# PAT Token chahiye — github.com → Settings → Developer settings → Tokens (classic)
# Required scopes: repo + workflow

GIT_ASKPASS=true git push https://blasty8084:ghp_YourToken@github.com/blasty8084/Sahu-Csc-Manager.git main
```

### GitHub Actions fix history

| Problem | Fix | Date |
|---|---|---|
| pnpm v8 incompatible | pnpm version: 10 | 2026-08-03 |
| `vercel-action@v25` outdated (CLI <47.2.2) | Direct vercel CLI | 2026-08-03 |
| `--prebuilt` failed (no `.vercel/output`) | Added `vercel pull` + `vercel build` | 2026-08-03 |
| Node 20 deprecated (forced to Node 24) | `node-version: '22'` explicit | 2026-08-03 |
