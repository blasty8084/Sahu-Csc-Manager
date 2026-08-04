# Task: Fix GitHub Actions Deploy Workflow

Read `AGENT.md` fully before starting.

## Problem

GitHub Actions workflow fails with:
```
Error: The "--prebuilt" option was used, but no prebuilt output found in ".vercel/output"
```

Also warning:
```
Node.js 20 is deprecated — being forced to Node.js 24
```

## Root Cause

The workflow runs `pnpm --filter @workspace/sahu-csc run build` which produces
`artifacts/sahu-csc/dist/` — but `vercel deploy --prebuilt` expects
`.vercel/output/` which is only created by `vercel build` command.

---

## Fix — Replace `.github/workflows/deploy.yml`

Replace the **entire file** with:

```yaml
name: Deploy to Vercel + Render

on:
  push:
    branches: [main]

jobs:
  deploy-vercel:
    name: Deploy Frontend to Vercel
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Pull Vercel environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: artifacts/sahu-csc
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Build via Vercel
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: artifacts/sahu-csc
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Deploy to Vercel (prebuilt)
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: artifacts/sahu-csc
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-render:
    name: Trigger Render Deploy
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render Deploy Hook
        run: |
          curl -f -X POST "${{ secrets.RENDER_DEPLOY_HOOK_URL }}" \
            -H "Accept: application/json" \
            --max-time 30
```

---

## What Changed

| Before | After |
|---|---|
| `pnpm build` → `dist/` | `vercel pull` + `vercel build` → `.vercel/output/` |
| `curl -X POST url` | `curl -f -X POST url` (fail on error) |

---

## Push to GitHub

```bash
bash scripts/push.sh "fix: github actions vercel prebuilt deploy workflow"
```

---

## Verify

GitHub → repo → **Actions tab** → latest run → both jobs green ✅

```
✅ Deploy Frontend to Vercel
✅ Trigger Render Deploy
```

---

## What NOT to Do

- **Do NOT** change `node-version: '22'` — correct version
- **Do NOT** remove `vercel pull` step — needed before `vercel build`
- **Do NOT** add `--yes` to `vercel deploy` — not needed with prebuilt
- **Do NOT** change `deploy-render` job — it is already correct
