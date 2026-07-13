# SAHU CSC — Multi-Instance API Server Setup Guide

> **Goal:** Run multiple API server processes simultaneously so requests are spread across CPU cores, and one crash doesn't take the app offline.

---

## Current Readiness Status

| Requirement | Status | Action Needed |
|---|---|---|
| Session store (Postgres) | ✅ Ready | Nothing — `connect-pg-simple` is already shared |
| VAPID push keys | ✅ Ready | Nothing — stored in `settings` DB table |
| AES-256-GCM encryption key | ✅ Ready | Nothing — stored in `settings` DB table |
| Query cache | ⚠️ Needs flip | Switch `CACHE_BACKEND=memory` → `redis` |
| Rate limiter | ⚠️ Needs work | Add Redis-backed store to `express-rate-limit` |

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

## Step 2 — Add a Redis-Backed Rate Limiter

The current `express-rate-limit` uses an in-memory counter per process. With 4 instances, each instance counts separately — a client can make 4× the allowed requests. Fix this by sharing counters in Redis.

### Install the Redis store package

```bash
pnpm --filter @workspace/api-server add rate-limit-redis
```

### Update `artifacts/api-server/src/app.ts`

```ts
import { RedisStore } from "rate-limit-redis";
import { redis } from "./lib/cache/redisBackend.js"; // existing Upstash client

// Replace the existing rate limiter config:
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
  }),
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
    prefix: "rl:login:",
  }),
});
```

> **Note:** Only add the Redis store when `CACHE_BACKEND=redis` — keep a `|| new MemoryStore()` fallback for local dev without Upstash credentials.

---

## Step 3 — Run Multiple Instances

### Option A: PM2 Cluster Mode (recommended for single server)

PM2 automatically spawns one worker per CPU core, load-balances between them, and auto-restarts any worker that crashes.

#### Install PM2

```bash
npm install -g pm2
```

#### Create `pm2.config.cjs` in the project root

```js
module.exports = {
  apps: [
    {
      name: "sahu-api",
      script: "./artifacts/api-server/dist/index.mjs",
      instances: "max",        // one per CPU core
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 8080,
        CACHE_BACKEND: "redis",
      },
      max_memory_restart: "512M",  // restart a worker if it leaks memory
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
```

#### Build then start

```bash
node artifacts/api-server/build.mjs
pm2 start pm2.config.cjs
pm2 save      # persist across reboots
pm2 startup   # generate the startup hook command, then run it
```

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
     PostgreSQL      Upstash        (shared state)
     (sessions,      Redis
      data, keys)   (cache,
                     rate-limit
                     counters)
```

---

## What Does NOT Need to Change

- **All routes, handlers, and business logic** — no changes needed
- **The frontend** — it talks to the same `/api/…` URL; routing is transparent
- **Drizzle ORM queries** — they use the shared Postgres connection pool (`max: 20` per process — with 4 workers that's up to 80 total connections; adjust `DB_POOL_MAX` downward if needed, e.g. `DB_POOL_MAX=5` per worker)

---

## Connection Pool Note with Multiple Workers

With `N` PM2 workers and `DB_POOL_MAX=20` (default), the database will see up to `N × 20` concurrent connections. Replit's built-in Postgres handles this fine for small deployments. If you hit connection limits, lower the per-worker pool:

```
DB_POOL_MAX=5   # for 4 workers → max 20 DB connections total
```

---

## Summary — Recommended Sequence

1. ✅ Create Upstash Redis database (free tier is enough)
2. ✅ Set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` secrets
3. ✅ Set `CACHE_BACKEND=redis`
4. ✅ Install `rate-limit-redis`, update limiters in `app.ts`
5. ✅ Install PM2 globally, create `pm2.config.cjs`
6. ✅ Build API: `node artifacts/api-server/build.mjs`
7. ✅ Launch: `pm2 start pm2.config.cjs && pm2 save`
