# SAHU CSC — Multi-Instance API Server Setup Guide

> **Goal:** Run multiple API server processes simultaneously so requests are spread across CPU cores, and one crash doesn't take the app offline.

---

## Current Readiness Status

| Requirement | Status | Action Needed |
|---|---|---|
| Session store (Postgres) | ✅ Ready | Nothing — `connect-pg-simple` is already shared |
| VAPID push keys | ✅ Ready | Nothing — stored in `settings` DB table |
| AES-256-GCM encryption key | ✅ Ready | Nothing — stored in `settings` DB table |
| Query cache | ⚠️ Needs flip | Switch `CACHE_BACKEND=memory` → `redis` (backend already wired) |
| Rate limiter | ✅ Ready | Done — `rate-limit-redis` installed; all 4 limiters use shared Redis when `CACHE_BACKEND=redis` (v4.0.1) |

---

## Step 1 — Switch the Query Cache to Redis

The app already has a Redis backend wired (`lib/cache/redisBackend.ts`). The only change needed is the environment variable.

### Set Replit Secrets

Add these two secrets in Replit → Secrets:

| Secret | Value |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Your Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash Redis REST token |

Create a free Redis database at **[upstash.com](https://upstash.com)** → New Database → choose a region close to your Replit server.

### Set the env variable

In `.replit` or via Replit shared env vars, set:

```
CACHE_BACKEND=redis
```

The app **fails open** — if Redis is unreachable, it falls back to a fresh DB query instead of returning an error. No risk of downtime from Redis being unavailable.

---

## Step 2 — Add a Redis-Backed Rate Limiter ✅ Done (v4.0.1)

> **Already implemented.** `rate-limit-redis` is installed and all 4 rate limiters (`rl:general:`, `rl:login:`, `rl:auth-write:`, `rl:otp-verify:`) use `RedisStore` when `CACHE_BACKEND=redis`, falling back to `MemoryStore` when Redis is absent. No changes needed.

For reference, the implementation is in `artifacts/api-server/src/app.ts` — the `makeRlStore` helper selects `RedisStore` or `MemoryStore` based on whether the Upstash Redis client is available.

---

## Step 3 — Run Multiple Instances

### Option A: PM2 Cluster Mode (recommended for single server)

PM2 automatically spawns one worker per CPU core, load-balances between them, and auto-restarts any worker that crashes.

#### Install PM2

```bash
npm install -g pm2
```

#### Use the existing `pm2.config.js` in the project root

A `pm2.config.js` file is already included in the repository root. It
configures both the API server (cluster mode, one worker per CPU core) and
the worker server. Review and adjust the `env` block for your deployment, then:

#### Build then start

```bash
node artifacts/api-server/build.mjs
node artifacts/worker-server/build.mjs
pm2 start pm2.config.js
pm2 save      # persist across reboots
pm2 startup   # generate the startup hook command, then run it
```

#### Running in Replit (single-command, foreground)

Replit workflows require the process to stay in the foreground. Use `--no-daemon` and pass `PORT` explicitly so PM2 workers don't inherit the shared `PORT=5000` env var:

```bash
PORT=8080 NODE_ENV=production pnpm --filter @workspace/api-server run build \
  && pm2 delete sahu-api 2>/dev/null; \
  PORT=8080 NODE_ENV=production pm2 start artifacts/api-server/dist/index.mjs \
    --name sahu-api --instances max --exec-mode cluster --no-daemon
```

> **Note:** The Replit workflow limit (10 max) is currently full. Run the above in the **Shell** tab directly, or free a slot by removing an unused workflow first.

#### Useful PM2 commands

```bash
pm2 status            # see all workers and their CPU/RAM
pm2 logs sahu-api     # tail logs from all workers
pm2 reload sahu-api   # zero-downtime rolling restart (deploy new code)
pm2 stop sahu-api     # stop all workers
pm2 delete sahu-api   # remove from PM2 registry
```

---

### Option B: Node.js Cluster Module (no extra tools)

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

### Option C: Multiple Containers / Replit Scale (cloud scale)

If the app is deployed via Replit Deployments:

1. Go to **Deployments → Settings → Scaling**
2. Set **Min instances** and **Max instances** (e.g. 1–4)
3. Replit's load balancer distributes traffic automatically

No code changes needed — the load balancer handles routing. Redis cache (Step 1) is required for this to work correctly.

---

## Architecture After Multi-Instance Setup

```
  ┌─────────────────────────────────────┐
  │        Nginx / Replit LB            │
  └──────────┬──────────────────────────┘
             │ round-robin / least-conn
  ┌──────────▼──────────┐  ┌────────────▼────────────┐
  │  API Worker 1 :8080  │  │  API Worker 2 :8080      │
  │  (Node.js process)   │  │  (Node.js process)       │
  └──────────┬──────────┘  └────────────┬─────────────┘
             │                           │
             └──────────┬────────────────┘
                        │
          ┌─────────────┼──────────────┐
          ▼             ▼              ▼
      Neon PostgreSQL  Upstash        (shared state)
      (sessions,      Redis
      data, keys)   (cache,
                     rate-limit
                     counters)
```

---

## What Does NOT Need to Change

- **All routes, handlers, and business logic** — no changes needed
- **The frontend** — it talks to the same `/api/…` URL; routing is transparent
- **Drizzle ORM queries** — they use the shared Neon Postgres connection pool (`DB_POOL_MAX=5` in the current setup; size the per-worker pool so the aggregate stays within the Neon plan's connection limit)

---

## Connection Pool Note with Multiple Workers

With `N` PM2 workers and `DB_POOL_MAX=5`, the database can see up to `N × 5` concurrent connections. Keep the aggregate within the Neon plan's connection limit and lower the per-worker pool further if needed:

```
DB_POOL_MAX=5   # for 4 workers → max 20 DB connections total
```

---

## Summary — Recommended Sequence

1. ✅ Create Upstash Redis database (free tier is enough)
2. ✅ Set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` secrets
3. ✅ Set `CACHE_BACKEND=redis`
4. ✅ Install `rate-limit-redis`, update limiters in `app.ts`
5. ✅ Install PM2 globally
6. ✅ Build API: `node artifacts/api-server/build.mjs`
7. ✅ Launch: `pm2 start pm2.config.js && pm2 save`
