# Replit Setup Guide — SAHU CSC Manager
**Last updated: 2026-08-03**

## Setup Status

| Step | Status |
|---|---|
| GitHub repo created | ✅ Done |
| Vercel frontend deployed | ✅ Done |
| Render backend deployed | ✅ Done |
| GitHub Actions secrets added | ✅ Done |
| GitHub Actions workflow fixed | ✅ Done |
| Auto-deploy pipeline live | ✅ Done |
| Replit Secrets added | ⬜ Pending |

---

## First Import (2 minutes only):
1. Import from GitHub: `blasty8084/Sahu-Csc-Manager`
2. Shell: `pnpm install --frozen-lockfile`
3. Shell: `pnpm --filter @workspace/db run push-force`
4. Run `Seed Database` workflow
5. Add Replit Secrets (see list below)
6. Start `API Server` workflow (port 8080)
7. Start `Start application` workflow (port 5000)
8. Done!

---

## Daily Workflow:
1. Write/edit code in Replit editor
2. Test locally using dev workflows
3. Push to GitHub using PAT token:
```bash
GIT_ASKPASS=true git push https://blasty8084:ghp_YourToken@github.com/blasty8084/Sahu-Csc-Manager.git main
```
4. GitHub Actions auto-deploys:
   - ✅ Vercel builds frontend (2-3 min)
   - ✅ Render rebuilds backend (3-5 min)
5. Check live at: `https://sahu-csc-manager-sahu-csc.vercel.app`

---

## GitHub PAT Token (for push from Replit Shell)

> Required scopes: ✅ `repo` + ✅ `workflow`
> Get from: github.com → Settings → Developer settings → Tokens (classic)

---

## Required Secrets (Replit Secrets panel):

### Minimum Required:
- `SESSION_SECRET` — 32-char random string
- `ADMIN_PASSWORD` — admin login password
- `OPERATOR_PASSWORD` — operator login password
- `NEON_DATABASE_URL` — neon.tech se connection string

### Email:
- `RESEND_API_KEY` — resend.com se (OTP emails ke liye)

### Security:
- `ENCRYPTION_KEY` — 64-char hex string
- `JWT_SECRET` — 32-char random string

### File Storage (optional):
- `B2_KEY_ID`
- `B2_APP_KEY`

### Redis (optional):
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### GeoIP:
- `ALLOW_NON_INDIA` — `true` for testing

---

## GitHub Actions Secrets (✅ All set):

| Secret | Status |
|---|---|
| `VERCEL_TOKEN` | ✅ |
| `VERCEL_ORG_ID` | ✅ |
| `VERCEL_PROJECT_ID` | ✅ |
| `RENDER_DEPLOY_HOOK_URL` | ✅ |

---

## GitHub Actions Workflow — Working Config

`.github/workflows/deploy.yml` — fixed and working:

| Setting | Value |
|---|---|
| Node.js | 22 (matches Render) |
| pnpm | 10 (matches package.json engines) |
| Vercel deploy | `vercel pull` → `vercel build` → `vercel deploy --prebuilt` |
| Render deploy | `curl -f -X POST` (deploy hook) |

### Fix History:
- pnpm v8 → v10 ✅
- Outdated `vercel-action` → direct Vercel CLI ✅
- `--prebuilt` without `.vercel/output` → added `vercel pull` + `vercel build` ✅
- Node 20 deprecated → Node 22 explicit ✅

---

## DO NOT:
- Run production app on Replit
- Import project just to deploy
- Use Replit for hosting
- Keep Replit running 24/7

## Saves AI Credits:
- Import once, use many times
- Only use Agent for new features
- Use Shell for routine tasks
- Push to GitHub = auto deploy (no Agent needed)
