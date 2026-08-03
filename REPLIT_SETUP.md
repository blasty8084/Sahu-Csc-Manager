# Replit Setup Guide — SAHU CSC Manager

## Setup Status

| Step | Status |
|---|---|
| GitHub repo created | ✅ Done |
| Vercel frontend deployed | ✅ Done |
| Render backend deployed | ✅ Done |
| GitHub Actions secrets added | ✅ Done |
| Replit Secrets added | ⬜ Pending |
| Auto-deploy pipeline tested | ⬜ Pending |

---

## First Import (2 minutes only):
1. Import from GitHub: blasty8084/Sahu-Csc-Manager
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
3. Shell: `make push msg="feat: your change"`
4. GitHub Actions triggers auto-deploy:
   - Vercel builds frontend (2-3 min)
   - Render builds backend (3-5 min)
5. Check live at https://sahu-csc.vercel.app

---

## Required Secrets (Replit Secrets panel):

### Minimum Required (app won't start without these):
- `SESSION_SECRET` — koi bhi 32-char random string
- `ADMIN_PASSWORD` — admin login password
- `OPERATOR_PASSWORD` — operator login password
- `NEON_DATABASE_URL` — neon.tech se connection string

### Email:
- `RESEND_API_KEY` — resend.com se (OTP emails ke liye)

### File Storage (optional):
- `B2_KEY_ID`
- `B2_APP_KEY`

### Security:
- `ENCRYPTION_KEY` — 64-char hex string
- `JWT_SECRET` — 32-char random string

### Redis (optional, for caching/workers):
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### GeoIP:
- `ALLOW_NON_INDIA` — set to `true` for testing

---

## GitHub Actions Secrets (already added ✅):
- `VERCEL_TOKEN` ✅
- `VERCEL_ORG_ID` ✅
- `VERCEL_PROJECT_ID` ✅
- `RENDER_DEPLOY_HOOK_URL` ✅

---

## Test Auto-Deploy Pipeline:
```bash
make push msg="test: verify auto deploy pipeline"
```
GitHub → Actions tab → green ✓ aana chahiye

---

## DO NOT:
- Run production app on Replit
- Import project just to deploy
- Use Replit for hosting
- Keep Replit running 24/7

## Saves AI Credits:
- Import once, use many times
- Only use Agent for new features
- Use Shell commands for routine tasks
- Push to GitHub = auto deploy (no Agent needed)
