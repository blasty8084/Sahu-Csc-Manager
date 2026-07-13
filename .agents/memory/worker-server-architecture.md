---
name: Worker Server Architecture
description: BullMQ worker-server setup — queues, connection, fallback pattern, and what was moved.
---

## What was built
`artifacts/worker-server/` — new `@workspace/worker-server` package (port 8081) with BullMQ workers consuming jobs from four queues: `notifications`, `emails`, `pdf-generation` (stub), `sms` (stub).

## Redis connection
- BullMQ requires a **direct TCP Redis connection** via `ioredis` and the `REDIS_URL` env var (e.g. `rediss://...upstash.io:6380`).
- This is **NOT** `UPSTASH_REDIS_REST_URL` (the HTTP REST endpoint used by `@upstash/redis`). Users get the direct URL from Upstash dashboard → Connect → ioredis.
- Worker-server exits immediately on startup if `REDIS_URL` is missing (clear error message).

## Graceful degradation in api-server
`artifacts/api-server/src/lib/queue-client.ts` — if `REDIS_URL` not set, all `enqueueNotification()` / `enqueueEmail()` calls fall back to direct in-process execution (previous behaviour). Queue client initialises lazily on first call.

**Why:** The api-server must stay functional in dev/Replit environments without Redis.

## What was offloaded to queues
- **Push notifications** — all `sendPushToUser` / `sendPushToAll` calls in `admin-appeals.ts`, `admin-registration.ts`, `broadcast.ts`
- **Emails** — approval, rejection (admin-appeals + admin-registration), OTP (auth/otp.ts)
- **Not queued** — `sendBroadcastEmail` (awaited for result count), `sendAdminResetLinkEmail` (awaited by route), `sendNewRegistrationAdminEmail` (already fire-and-forget, full template code not read)

## Template refactor pattern
`approval.ts`, `rejection.ts`, `otp.ts` — added `build*MailOptions()` (sync, pure, returns `{to,from,subject,html,text}` without sending). `send*` functions are now thin wrappers calling the builder + `createTransporter().sendMail()`. Both are exported; `mailer/index.ts` re-exports them.

**Why:** Email jobs are pre-rendered HTML/text in the api-server and queued as plain objects; the worker just calls `transporter.sendMail(job.data)`. No shared template lib needed.

## Build quirks
- `worker-server/build.mjs` needs `globalThis.require = createRequire(import.meta.url)` at the top — `esbuild-plugin-pino` calls `require()` internally.
- `drizzle-orm` must be in `worker-server/package.json` dependencies (it's a catalog dep, not auto-hoisted from `@workspace/db`).
- `@opentelemetry/api` also needed in worker-server deps (drizzle-orm peer).

## PM2 config
`pm2.config.js` in root — `api-server` in cluster mode (max instances), `worker-server` fork mode (1 instance, BullMQ handles internal concurrency).
