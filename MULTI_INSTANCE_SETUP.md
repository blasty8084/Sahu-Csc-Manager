# SAHU CSC — Multi-Instance API Server Setup Guide

> **Goal:** Run multiple API server processes simultaneously so requests are spread across CPU cores, and one crash doesn't take the app offline.
>
> **Note (v4.10.1):** Redis, BullMQ, and the Upstash cache backend have been removed from this project. The sections below reflect the current state where all shared state lives in PostgreSQL only.

---

## Current Readiness Status

| Requirement | Status | Notes |
|---|---|---|
| Session store (Postgres) | ✅ Ready | `connect-pg-simple` is shared across all instances |
| VAPID push keys | ✅ Ready | Stored in `settings` DB table — shared |
| AES-256-GCM encryption key | ✅ Ready | Stored in `settings` DB table — shared |
| Query cache | ⚠️ In-memory only | Cache is per-process; multiple instances will each have their own cache. This is acceptable for a single-server PM2 cluster (stale hits are self-healing) but not for truly separate machines without a shared cache layer. |
| Rate limiter | ⚠️ In-memory only | Rate-limit counters are per-process. Under PM2 cluster mode this means per-worker limits, not aggregate. Sufficient for most single-server deployments. |

---

## Step 1 — Run Multiple Instances with PM2

PM2 automatically spawns one worker per CPU core, load-balances between them, and auto-restarts any worker that crashes.

### Install PM2

```bash
npm install -g pm2
```

### Use the existing `pm2.config.js` in the project root

A `pm2.config.js` file is already included in the repository root. It configures the API server in cluster mode (one worker per CPU core). Review and adjust the `env` block for your deployment, then:

### Build then start

```bash
node artifacts/api-server/build.mjs
pm2 start pm2.config.js
pm2 save      # persist across reboots
pm2 startup   # generate the startup hook command, then run it
```

### Running in Replit (single-command, foreground)

Replit workflows require the process to stay in the foreground. Use `--no-daemon` and pass `PORT` explicitly so PM2 workers don't inherit the shared `PORT=5000` env var:

```bash
PORT=8080 NODE_ENV=production pnpm --filter @workspace/api-server run build \
  && pm2 delete sahu-api 2>/dev/null; \
  PORT=8080 NODE_ENV=production pm2 start artifacts/api-server/dist/index.mjs \
    --name sahu-api --instances max --exec-mode cluster --no-daemon
```

### Useful PM2 commands

```bash
pm2 status            # see all workers and their CPU/RAM
pm2 logs sahu-api     # tail logs from all workers
pm2 reload sahu-api   # zero-downtime rolling restart (deploy new code)
pm2 stop sahu-api     # stop all workers
pm2 delete sahu-api   # remove from PM2 registry
```

---

## Step 2 — Node.js Cluster Module (no extra tools)

Add a thin cluster wrapper at `artifacts/api-server/src/cluster.ts`:

```ts
import cluster from "cluster";
import os from "os";

const NUM_WORKERS = parseInt(process.env.CLUSTER_WORKERS ?? "0") || os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} starting ${NUM_WORKERS} workers`);

  for (let i = 0; i < NUM_WORKERS; i++) cluster.fork();

  cluster.on("exit", (worker, code, signal) => {
    console.warn(`Worker ${worker.process.pid} died (${signal ?? code}). Restarting…`);
    cluster.fork();
  });
} else {
  // Import and start the existing Express app
  await import("./index.js");
  console.log(`Worker ${process.pid} started`);
}
```

Then in `build.mjs`, add `cluster.ts` as an additional entry point and set the `API Server` workflow to run `node dist/cluster.mjs` instead of `node dist/index.mjs`.

---

## Architecture (Current — PostgreSQL-only shared state)

```
  ┌─────────────────────────────────────┐
  │        Nginx / Replit LB            │
  └──────────┬──────────────────────────┘
             │ round-robin / least-conn
  ┌──────────▼──────────┐  ┌────────────▼────────────┐
  │  API Worker 1 :8080  │  │  API Worker 2 :8080      │
  │  (Node.js process)   │  │  (Node.js process)       │
  │  in-memory cache     │  │  in-memory cache         │
  └──────────┬──────────┘  └────────────┬─────────────┘
             │                           │
             └──────────┬────────────────┘
                        │
            ┌───────────▼──────────┐
            │   Replit PostgreSQL   │
            │  (sessions, data,     │
            │   keys, settings)     │
            └──────────────────────┘
```

---

## What Does NOT Need to Change

- **All routes, handlers, and business logic** — no changes needed
- **The frontend** — it talks to the same `/api/…` URL; routing is transparent
- **Drizzle ORM queries** — they use the shared Postgres connection pool (`DB_POOL_MAX=5` in the current setup; size the per-worker pool so the aggregate stays within the connection limit)

---

## Connection Pool Note with Multiple Workers

With `N` PM2 workers and `DB_POOL_MAX=5`, the database can see up to `N × 5` concurrent connections. Keep the aggregate within the plan's connection limit and lower the per-worker pool further if needed:

```
DB_POOL_MAX=3   # for 4 workers → max 12 DB connections total
```

---

## Summary — Recommended Sequence

1. ✅ Build API: `node artifacts/api-server/build.mjs`
2. ✅ Install PM2: `npm install -g pm2`
3. ✅ Launch: `pm2 start pm2.config.js && pm2 save`
4. ✅ Verify: `pm2 status` — all workers should show `online`
