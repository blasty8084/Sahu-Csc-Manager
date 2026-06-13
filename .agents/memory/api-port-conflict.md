---
name: API port conflict fix
description: Replit artifact workflow permanently holds port 8080; Start application must use 8082 for API instead
---

## Rule
The `artifacts/api-server: API Server` Replit artifact workflow is platform-managed, always running, and permanently holds port 8080. The `Start application` workflow must use **port 8082** for the API server.

**Why:** The Replit platform creates and respawns artifact workflows automatically — `fuser -k 8080/tcp` kills the process but the platform restarts it within milliseconds. There is no user-space way to stop a platform artifact workflow.

**How to apply:**
- `Start application` command uses `PORT=8082 pnpm --filter @workspace/api-server run dev`
- `artifacts/sahu-csc/vite.config.ts` proxy target: `http://localhost:8082`
- `artifacts/api-server/package.json` dev script: `... && fuser -k 8082/tcp 2>/dev/null; pnpm run start` (kills 8082 just before binding)
- Do NOT try to reclaim port 8080 for the main app workflow — it belongs to the artifact workflow
- The `replit.md` and `WORKFLOWS.md` references to port 8080 should be understood as the artifact workflow's port, not the main app API
