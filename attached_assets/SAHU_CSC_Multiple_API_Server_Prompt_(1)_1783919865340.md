# Replit Agent 4 Prompt — Multiple API Server Setup

## Overview
Set up a separate worker server in this pnpm monorepo to isolate heavy
background processing from the main API server.
No UI, business logic, or API contract changes.

---

## Architecture

```
                    [Cloudflare / Nginx]
                           |
              +------------+------------+
              |                         |
   [Main API Server :8080]   [Worker Server :8081]
   - Auth/Login               - PDF Generation
   - Ledger CRUD              - Push Notifications
   - AePS                     - Email Sending
   - Udhari Khata             - SMS Sending
   - Dashboard                          |
              |                         |
              +------------+------------+
                           |
                  [Shared Resources]
                  - PostgreSQL (Neon)
                  - Redis (Upstash)
                  - BullMQ Job Queue
```

---

## 1. New Package — @workspace/worker-server

Create `artifacts/worker-server/` with:
- `package.json`
- `tsconfig.json`
- `src/index.ts` (entry point)
- Port: `8081`

Install dependencies:

```bash
pnpm --filter @workspace/worker-server add bullmq ioredis
```

---

## 2. BullMQ Queue Setup

Create `artifacts/worker-server/src/queues/index.ts`:

```typescript
import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.UPSTASH_REDIS_REST_URL!, {
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: null,
});

// Queue definitions
export const pdfQueue          = new Queue('pdf-generation',  { connection });
export const notificationQueue = new Queue('notifications',   { connection });
export const emailQueue        = new Queue('emails',          { connection });
export const smsQueue          = new Queue('sms',             { connection });
```

---

## 3. Move These Out of Main API → Into Worker Server

| Feature | From | To |
|---|---|---|
| PDF/Receipt generation (Puppeteer) | api-server | worker-server |
| Push notification sending | api-server | worker-server |
| Email sending (Nodemailer) | api-server | worker-server |
| SMS sending | api-server | worker-server |

---

## 4. Worker Implementations

Create in `artifacts/worker-server/src/workers/`:

### pdf.worker.ts
Listens to `pdf-generation` queue. Runs Puppeteer. Generates receipt PDF.
Saves URL to database. Marks job complete.

### notification.worker.ts
Listens to `notifications` queue. Sends Web Push notification using
existing VAPID keys from database/secrets.

### email.worker.ts
Listens to `emails` queue. Sends email via existing Nodemailer +
Gmail SMTP config using existing SMTP secrets.

### sms.worker.ts
Listens to `sms` queue. Handles SMS sending.

---

## 5. Main API — Replace Direct Calls with Queue Push

In `artifacts/api-server/`, replace every direct call to
PDF/email/notification/SMS functions with a queue job push:

```typescript
// Instead of directly generating PDF:
// await generatePDF(receiptId);  ← REMOVE

// Push job to queue:
await pdfQueue.add('generate', {
  receiptId,
  userId,
  timestamp: Date.now(),
});
// Return immediately — worker handles it async
```

---

## 6. Redis Rate Limiter (Fix Before Scaling)

Install:

```bash
pnpm --filter @workspace/api-server add rate-limit-redis
```

Configure:

```typescript
import { RateLimitRedis } from 'rate-limit-redis';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: new RateLimitRedis({
    sendCommand: (...args) => redis.call(...args),
  }),
});
```

Apply to: login, OTP, password reset endpoints.

---

## 7. PM2 Cluster Config

Create `pm2.config.js` in root:

```javascript
module.exports = {
  apps: [
    {
      name: 'api-server',
      script: 'artifacts/api-server/dist/index.mjs',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      restart_delay: 1000,
      env: { NODE_ENV: 'production', PORT: 8080 },
    },
    {
      name: 'worker-server',
      script: 'artifacts/worker-server/dist/index.mjs',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      restart_delay: 2000,
      env: { NODE_ENV: 'production', PORT: 8081 },
    },
  ],
};
```

---

## 8. Replit Workflows (Update .replit)

| Workflow | Command |
|---|---|
| Main API Server | `PORT=8080 pnpm --filter @workspace/api-server run dev` |
| Worker Server | `PORT=8081 pnpm --filter @workspace/worker-server run dev` |
| Web Frontend | `pnpm --filter @workspace/sahu-csc run dev` |
| PM2 Production | `pm2 start pm2.config.js` |
| PM2 Monitor | `pm2 monit` |

---

## 9. Shared State Rules

| State | Storage | Shared By |
|---|---|---|
| Sessions | PostgreSQL | All instances |
| Cache | Upstash Redis | All instances |
| Rate limits | Upstash Redis | All instances |
| Job queue | Upstash Redis + BullMQ | Main API + Worker |
| VAPID keys | PostgreSQL settings table | All instances |
| Encryption key | PostgreSQL settings table | All instances |

---

## 10. Error Handling in Workers

```typescript
worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
  // Log to database error_logs table
  // Do NOT crash worker process on job failure
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});
```

---

## 11. New Packages Required

| Package | Server | Purpose |
|---|---|---|
| `bullmq` | worker-server | Job queue manager |
| `ioredis` | worker-server | Redis client for BullMQ |
| `rate-limit-redis` | api-server | Redis-backed rate limiter |

No new Redis account needed — uses existing Upstash Redis secrets.

---

## 12. After Setup — Test This Flow

1. Start both workflows (Main API :8080 + Worker :8081)
2. Generate a receipt → confirm PDF job goes to queue
   → worker picks it up → PDF generated
3. Send OTP email → confirm email job goes to queue
   → worker sends email
4. Send push notification → confirm notification queued
   → worker delivers it
5. Crash worker server → confirm main API still responds normally
6. Restart worker → confirm it picks up pending jobs automatically

---

## Do Not Change

- Any existing UI or branding
- Any existing API contracts
- Any existing database schema
- Any existing authentication flow

---

## Result After Setup

```
Before: 1 server handles everything
        PDF job blocks login requests
        Puppeteer crash = app down

After:  2 servers, isolated concerns
        PDF generation never blocks API
        Worker crash = main API still running
        Independent scaling possible
        2-4x better response times under load
```

---

*SAHU CSC Manager | blasty8084 | July 2026*
