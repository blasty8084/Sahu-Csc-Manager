# BUILD.md — SAHU CSC Manager
**Last updated: 2026-08-03 | Version: 4.10.7+**

## Architecture

```
Replit (Code + Test)
    ↓ git push (with PAT token)
GitHub (blasty8084/Sahu-Csc-Manager)
    ↓ GitHub Actions — .github/workflows/deploy.yml
    ├── Vercel  → Frontend (sahu-csc-manager-sahu-csc.vercel.app)
    └── Render  → Backend API (sahu-csc-api-02wn.onrender.com)
```

## Development Workflow

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

## Quick Push Command (Replit Shell)

```bash
GIT_ASKPASS=true git push https://blasty8084:ghp_YourToken@github.com/blasty8084/Sahu-Csc-Manager.git main
```

Or after setting remote URL once:
```bash
git remote set-url origin https://blasty8084:ghp_YourToken@github.com/blasty8084/Sahu-Csc-Manager.git
make push msg="feat: your change"
```

---

## GitHub Actions — deploy.yml

### Current Working Configuration
```yaml
Node.js:   22  (matches Render production)
pnpm:      10  (matches package.json engines requirement)
Vercel:    vercel pull → vercel build → vercel deploy --prebuilt
Render:    curl -f -X POST (deploy hook with error checking)
```

### Flow
1. `git push` → GitHub Actions trigger
2. **Job 1** — Deploy Frontend to Vercel:
   - `pnpm install --frozen-lockfile`
   - `vercel pull --yes --environment=production` → downloads `.vercel/output` config
   - `vercel build --prod` → creates `.vercel/output/` directory
   - `vercel deploy --prebuilt --prod` → uploads prebuilt output
3. **Job 2** — Trigger Render Deploy:
   - `curl -f -X POST $RENDER_DEPLOY_HOOK_URL` → Render rebuilds backend
4. Both live in ~3-5 minutes

---

## GitHub Actions Secrets (set ✅)

| Secret | Status |
|---|---|
| `VERCEL_TOKEN` | ✅ |
| `VERCEL_ORG_ID` | ✅ |
| `VERCEL_PROJECT_ID` | ✅ |
| `RENDER_DEPLOY_HOOK_URL` | ✅ |

---

## GitHub Actions Fix History

| Issue | Fix | Date |
|---|---|---|
| pnpm v8 incompatible | Upgraded to pnpm v10 | 2026-08-03 |
| `amondnet/vercel-action@v25` outdated (Vercel CLI <47.2.2) | Switched to direct `vercel` CLI | 2026-08-03 |
| `--prebuilt` failed — no `.vercel/output/` | Added `vercel pull` + `vercel build` before deploy | 2026-08-03 |
| Node 20 deprecated → forced to Node 24 | Set explicit `node-version: '22'` | 2026-08-03 |

---

## PAT Token Setup (for git push from Replit)

1. github.com → Settings → Developer settings → **Tokens (classic)**
2. Scopes: ✅ `repo` + ✅ `workflow`
3. Token starts with `ghp_`
4. Use in push URL: `https://blasty8084:ghp_token@github.com/...`
