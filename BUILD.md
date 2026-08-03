# BUILD.md — SAHU CSC Manager

## Architecture

```
Replit (Code + Test)
    ↓ git push
GitHub (blasty8084/Sahu-Csc-Manager)
    ↓ GitHub Actions (auto on push to main)
    ├── Vercel  → Frontend (sahu-csc.vercel.app)
    └── Render  → Backend API (sahu-csc-api.onrender.com)
```

## Development Workflow

Code in Replit → Push GitHub → Auto deploy

| Tool | Purpose |
|---|---|
| Replit | Code writing + local dev testing only |
| GitHub | Source of truth (main = production) |
| Vercel | Frontend auto-deploy on every push to main |
| Render | Backend auto-deploy on every push to main |

**NEVER run production app on Replit.**
**NEVER import project just to deploy.**
**NEVER use Replit AI credits for deployment tasks.**

---

## Monorepo Structure

```
/
├── artifacts/
│   ├── sahu-csc/          → Frontend (Vercel)
│   ├── api-server/        → Backend (Render)
│   └── worker-server/     → Background workers (Render)
├── lib/                   → Shared libraries
├── .github/workflows/
│   └── deploy.yml         → Auto-deploy on push to main
├── scripts/               → Utility scripts
├── Makefile               → Quick commands
├── .env.example           → Secrets template
├── REPLIT_SETUP.md        → Setup guide
└── BUILD.md               → This file
```

---

## Quick Commands (Replit Shell)

```bash
make install               # pnpm install
make dev-api               # Start API server (port 8080)
make dev-web               # Start frontend (port 5000)
make build                 # Build both frontend + backend
make typecheck             # Run TypeScript checks
make push msg="feat: xyz"  # Commit + push → triggers auto deploy
make status                # git status + last 5 commits
```

---

## GitHub Actions Secrets (set ✅)

| Secret | Status |
|---|---|
| `VERCEL_TOKEN` | ✅ |
| `VERCEL_ORG_ID` | ✅ |
| `VERCEL_PROJECT_ID` | ✅ |
| `RENDER_DEPLOY_HOOK_URL` | ✅ |

---

## Deployment Flow

1. `make push msg="..."` → pushes to GitHub `main`
2. GitHub Actions runs `.github/workflows/deploy.yml`
3. Job 1: builds frontend → deploys to Vercel (`--prod`)
4. Job 2: hits Render deploy hook → Render rebuilds backend
5. Both live in ~3-5 minutes
