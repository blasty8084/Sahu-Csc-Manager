# Task: Production Infrastructure Integration
## Neon PostgreSQL + Backblaze B2 + Upstash Redis + Nodemailer SMTP

Read `AGENT.md` fully before starting. This prompt restores and upgrades four
infrastructure services that were previously stubbed out. Each service is
**optional at runtime** — the app must start and work without any of them;
features gracefully degrade when the env vars are absent.

**Current state of stubs (do NOT break these import paths):**
- `artifacts/api-server/src/lib/b2.ts` — stub, `isB2Configured()` always false
- `artifacts/api-server/src/lib/mailer/index.ts` — stub, all sends are no-ops
- `artifacts/api-server/src/lib/cache/backend.ts` — always returns memory backend
- `artifacts/api-server/src/lib/queue-client.ts` — direct fire-and-forget, no queue

---

## Part 1 — Neon PostgreSQL (Already Works — Just Document)

The DB connection in `lib/db/src/index.ts` already reads:
```
process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
```
No code changes needed. Only env var action required:

**Add to Render / Vercel environment variables:**
```
NEON_DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
DB_POOL_MAX=5
```

> Get from: neon.tech → your project → Connection String → copy the `postgresql://...` URL.
> Use `DB_POOL_MAX=5` on free tier (Neon free tier allows max 5 connections).

**Also update `artifacts/api-server/src/lib/env.ts`** — add NEON_DATABASE_URL to the required check:

```typescript
const REQUIRED: [key: string, description: string][] = [
  ["SESSION_SECRET", "Session signing secret (long random string)"],
  // DATABASE is validated separately in lib/db/src/index.ts — it throws if both are absent
];
```

Leave as-is. The DB already throws clearly if both URL env vars are missing.

---

## Part 2 — Backblaze B2 File Storage

### 2a — Install packages

```bash
pnpm --filter @workspace/api-server add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2b — Replace `artifacts/api-server/src/lib/b2.ts`

Replace the entire stub file with this real implementation:

```typescript
/**
 * Backblaze B2 file storage — S3-compatible via @aws-sdk/client-s3.
 * All functions are no-ops / throw when B2_KEY_ID is not set.
 * isB2Configured() gates every call site.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Readable } from "stream";

const B2_ENDPOINT = process.env["B2_BUCKET_ENDPOINT"];
const B2_KEY_ID   = process.env["B2_KEY_ID"];
const B2_APP_KEY  = process.env["B2_APP_KEY"];

export const B2_BUCKET = process.env["B2_BUCKET_NAME"] ?? "";

export const b2Client =
  B2_KEY_ID && B2_APP_KEY && B2_ENDPOINT
    ? new S3Client({
        endpoint: B2_ENDPOINT,
        region: "auto",
        credentials: {
          accessKeyId: B2_KEY_ID,
          secretAccessKey: B2_APP_KEY,
        },
      })
    : null;

export function isB2Configured(): boolean {
  return b2Client !== null;
}

/** Upload a Buffer or Readable stream to B2 */
export async function uploadToB2(
  key: string,
  body: Buffer | Readable,
  contentType: string,
): Promise<void> {
  if (!b2Client) throw new Error("B2 not configured");
  await b2Client.send(
    new PutObjectCommand({ Bucket: B2_BUCKET, Key: key, Body: body, ContentType: contentType }),
  );
}

/** Pre-signed GET URL valid for `expiresIn` seconds (default 1 hour) */
export async function getB2SignedUrl(key: string, expiresIn = 3600): Promise<string> {
  if (!b2Client) throw new Error("B2 not configured");
  return getSignedUrl(
    b2Client,
    new GetObjectCommand({ Bucket: B2_BUCKET, Key: key }),
    { expiresIn },
  );
}

/** Delete an object — silently ignores not-found */
export async function deleteFromB2(key: string): Promise<void> {
  if (!b2Client) throw new Error("B2 not configured");
  await b2Client.send(new DeleteObjectCommand({ Bucket: B2_BUCKET, Key: key }));
}

/** Download an object as a Node.js Readable stream */
export async function downloadFromB2(key: string): Promise<Readable> {
  if (!b2Client) throw new Error("B2 not configured");
  const res = await b2Client.send(new GetObjectCommand({ Bucket: B2_BUCKET, Key: key }));
  return res.Body as Readable;
}
```

### 2c — Add to `build.mjs` external array

In `artifacts/api-server/build.mjs`, add inside the `external: [...]` array:
```javascript
"@aws-sdk/client-s3",
"@aws-sdk/s3-request-presigner",
```

### 2d — Update `artifacts/api-server/src/routes/profile.ts`

**Goal**: When B2 is configured, store `b2:key` in DB instead of base64. Legacy `data:` rows still work unchanged.

Find the `fmtProfile` (or equivalent helper that builds the profile response object) and update it to resolve B2 keys:

```typescript
// Add import at top
import { getB2SignedUrl, isB2Configured, uploadToB2, deleteFromB2 } from "../lib/b2";

// In fmtProfile / profile formatter:
let profilePicture = user.profilePicture ?? null;
if (profilePicture?.startsWith("b2:") && isB2Configured()) {
  try {
    profilePicture = await getB2SignedUrl(profilePicture.slice(3), 3600);
  } catch {
    profilePicture = null; // B2 key missing or B2 down
  }
}
// Legacy base64 `data:image/...` rows pass through unchanged
```

**In the avatar upload handler**, after `sharp` produces `outputBuffer`, replace the DB write logic:

```typescript
let profilePicture: string;

if (isB2Configured()) {
  // Delete old B2 avatar if one exists
  const [existing] = await db
    .select({ profilePicture: usersTable.profilePicture })
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (existing?.profilePicture?.startsWith("b2:")) {
    try { await deleteFromB2(existing.profilePicture.slice(3)); } catch {}
  }
  const key = `avatars/user_${userId}_${Date.now()}.webp`;
  await uploadToB2(key, outputBuffer, "image/webp");
  profilePicture = `b2:${key}`;
} else {
  // Fallback: base64 in DB as before
  profilePicture = `data:image/webp;base64,${outputBuffer.toString("base64")}`;
}
```

**In the avatar DELETE handler**, before nulling the DB column:
```typescript
if (isB2Configured()) {
  const [existing] = await db
    .select({ profilePicture: usersTable.profilePicture })
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (existing?.profilePicture?.startsWith("b2:")) {
    try { await deleteFromB2(existing.profilePicture.slice(3)); } catch {}
  }
}
```

### 2e — Update `artifacts/api-server/src/services/backupCore.ts`

Add imports at top:
```typescript
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { uploadToB2, downloadFromB2, deleteFromB2, isB2Configured } from "../lib/b2";
```

**In `createBackup`**, after `execSync(pg_dump ...)` and before the DB insert:
```typescript
// Upload to B2 — failure is logged but does not abort the backup
if (isB2Configured()) {
  try {
    await uploadToB2(`backups/${filename}`, createReadStream(filepath), "application/octet-stream");
  } catch (err) {
    logger.warn({ err, filename }, "B2 upload failed — backup saved locally only");
  }
}
```

**Replace `getBackupForDownload`** to fall back to B2 when local file is missing:
```typescript
export async function getBackupForDownload(id: number) {
  const [backup] = await db.select().from(backupsTable).where(eq(backupsTable.id, id));
  if (!backup) throw Object.assign(new Error("Backup not found"), { status: 404 });
  const filepath = path.join(BACKUP_DIR, backup.filename);

  if (existsSync(filepath)) {
    return { filepath, filename: backup.filename, size: statSync(filepath).size };
  }
  if (isB2Configured()) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    const stream = await downloadFromB2(`backups/${backup.filename}`);
    await pipeline(stream, createWriteStream(filepath));
    return { filepath, filename: backup.filename, size: statSync(filepath).size };
  }
  throw Object.assign(new Error("Backup file not found on disk or B2"), { status: 404 });
}
```

**In `deleteBackup`**, after local `unlinkSync`:
```typescript
if (isB2Configured()) {
  try { await deleteFromB2(`backups/${backup.filename}`); } catch {}
}
```

**In `restoreBackup`**, before the `existsSync` check:
```typescript
if (!existsSync(filepath) && isB2Configured()) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const stream = await downloadFromB2(`backups/${backup.filename}`);
  await pipeline(stream, createWriteStream(filepath));
}
```

### 2f — Environment variables for B2

```
B2_KEY_ID=<keyID from Backblaze App Keys page>
B2_APP_KEY=<applicationKey — only shown once at creation>
B2_BUCKET_NAME=SAHUCSCV2
B2_BUCKET_ENDPOINT=https://s3.us-west-004.backblazeb2.com
```

> Bucket is already created: `SAHUCSCV2`, Private, region `us-west-004`.

---

## Part 3 — Upstash Redis Cache + Rate Limiting

### Why Redis for Vercel/Render

Vercel and Render may run **multiple instances** of the API. In-memory cache and
in-memory rate limiters are per-instance — each instance has its own state.
Redis fixes this: shared cache and shared rate-limit counters across all instances.

### 3a — Install packages

```bash
pnpm --filter @workspace/api-server add @upstash/redis rate-limit-redis ioredis bullmq
```

### 3b — Create `artifacts/api-server/src/lib/cache/redisBackend.ts`

```typescript
import { Redis } from "@upstash/redis";
import type { CacheBackend } from "./types";

/**
 * Upstash Redis cache backend — used when UPSTASH_REDIS_REST_URL is set.
 * Uses Upstash REST API (HTTP-based, works in serverless and edge).
 */
export function createRedisBackend(namespace: string): CacheBackend {
  const redis = new Redis({
    url: process.env["UPSTASH_REDIS_REST_URL"]!,
    token: process.env["UPSTASH_REDIS_REST_TOKEN"]!,
  });

  const prefixed = (key: string) => `${namespace}:${key}`;

  return {
    async get<T>(key: string): Promise<T | undefined> {
      const val = await redis.get<T>(prefixed(key));
      return val ?? undefined;
    },
    async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
      await redis.set(prefixed(key), value, { px: ttlMs });
    },
    async delete(key: string): Promise<void> {
      await redis.del(prefixed(key));
    },
    async deleteByPrefix(prefix: string): Promise<void> {
      const keys = await redis.keys(`${namespace}:${prefix}*`);
      if (keys.length > 0) await redis.del(...keys);
    },
    async clear(): Promise<void> {
      const keys = await redis.keys(`${namespace}:*`);
      if (keys.length > 0) await redis.del(...keys);
    },
    async stats(): Promise<{ entries: number }> {
      const keys = await redis.keys(`${namespace}:*`);
      return { entries: keys.length };
    },
  };
}
```

### 3c — Update `artifacts/api-server/src/lib/cache/backend.ts`

Replace the entire file:

```typescript
import type { CacheBackend } from "./types";
import { createMemoryBackend } from "./memoryBackend";
import { createRedisBackend } from "./redisBackend";

const instances = new Map<string, CacheBackend>();

export function isRedisConfigured(): boolean {
  return !!(
    process.env["UPSTASH_REDIS_REST_URL"] &&
    process.env["UPSTASH_REDIS_REST_TOKEN"]
  );
}

/** One backend instance per namespace, created lazily and reused. */
export function getCacheBackend(namespace: string): CacheBackend {
  const existing = instances.get(namespace);
  if (existing) return existing;
  const backend = isRedisConfigured()
    ? createRedisBackend(namespace)
    : createMemoryBackend();
  instances.set(namespace, backend);
  return backend;
}
```

### 3d — Update rate limiters in `artifacts/api-server/src/app.ts`

Add import at top:
```typescript
import { RedisStore } from "rate-limit-redis";
import { Redis } from "@upstash/redis";
```

Add this helper above the limiter definitions:
```typescript
function makeRedisStore(prefix: string) {
  if (
    !process.env["UPSTASH_REDIS_REST_URL"] ||
    !process.env["UPSTASH_REDIS_REST_TOKEN"]
  ) {
    return undefined; // use default in-memory store
  }
  const redis = new Redis({
    url: process.env["UPSTASH_REDIS_REST_URL"]!,
    token: process.env["UPSTASH_REDIS_REST_TOKEN"]!,
  });
  return new RedisStore({
    prefix,
    // rate-limit-redis expects sendCommand(command, ...args)
    sendCommand: (...args: string[]) => redis.sendCommand(args as Parameters<typeof redis.sendCommand>[0]),
  });
}
```

Then update each `rateLimit({...})` call to include `store`:
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: makeRedisStore("rl:global"),
  // ... rest of config unchanged
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: makeRedisStore("rl:login"),
  // ... rest unchanged
});

// Apply same pattern to: authWriteLimiter, otpVerifyLimiter, twoFaVerifyLimiter, geoLimiter
// Give each a unique prefix string e.g. "rl:auth-write", "rl:otp", "rl:2fa", "rl:geo"
```

### 3e — Re-enable BullMQ Worker (optional, for background jobs)

In `artifacts/api-server/src/lib/queue-client.ts`, update `enqueueNotification` to use BullMQ when `REDIS_URL` is set:

```typescript
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { logger } from "./logger";
import { sendPushToUser, sendPushToAll } from "./push";
// ... keep existing imports

let notificationQueue: Queue | null = null;

function getQueue(): Queue | null {
  if (notificationQueue) return notificationQueue;
  const url = process.env["REDIS_URL"];
  if (!url) return null;
  try {
    const connection = new IORedis(url, { maxRetriesPerRequest: null });
    notificationQueue = new Queue("notifications", { connection });
  } catch {
    notificationQueue = null;
  }
  return notificationQueue;
}

export async function enqueueNotification(data: NotificationJobData): Promise<void> {
  const queue = getQueue();
  if (queue) {
    try {
      await queue.add("notify", data);
      return;
    } catch (err: any) {
      logger.warn({ err: err.message }, "BullMQ enqueue failed — falling back to direct send");
    }
  }
  // Direct fire-and-forget fallback
  try {
    if (data.kind === "send-to-user") {
      await sendPushToUser(data.userId, data.payload);
    } else {
      await sendPushToAll(data.payload);
    }
  } catch (err: any) {
    logger.warn({ err: err.message }, "enqueueNotification direct-send failed");
  }
}
```

### 3f — Add to `build.mjs` external array

```javascript
"@upstash/redis",
"rate-limit-redis",
"ioredis",
"bullmq",
```

### 3g — Environment variables for Upstash Redis

```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxx
REDIS_URL=rediss://default:xxxx@xxx.upstash.io:6379
```

> Get from: upstash.com → Create Database → REST API tab (REST URL + Token) and Redis tab (TCP URL for BullMQ).
> Free tier: 10,000 commands/day, 256MB — enough for cache + rate limiting.

---

## Part 4 — Nodemailer SMTP (Gmail)

### 4a — Install package

```bash
pnpm --filter @workspace/api-server add nodemailer
pnpm --filter @workspace/api-server add -D @types/nodemailer
```

### 4b — Create `artifacts/api-server/src/lib/mailer/transport.ts`

```typescript
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let _transporter: Transporter | null = null;

export function isSmtpConfigured(): boolean {
  return !!(
    process.env["SMTP_HOST"] &&
    process.env["SMTP_USER"] &&
    (process.env["SMTP_PASSWORD"] ?? process.env["SMTP_PASS"])
  );
}

export function getTransporter(): Transporter {
  if (_transporter) return _transporter;
  if (!isSmtpConfigured()) throw new Error("SMTP not configured");
  _transporter = nodemailer.createTransport({
    host: process.env["SMTP_HOST"]!,
    port: Number(process.env["SMTP_PORT"] ?? 587),
    secure: false,
    auth: {
      user: process.env["SMTP_USER"]!,
      pass: (process.env["SMTP_PASSWORD"] ?? process.env["SMTP_PASS"])!,
    },
  });
  return _transporter;
}
```

### 4c — Replace `artifacts/api-server/src/lib/mailer/index.ts`

Replace the entire stub file:

```typescript
import { isSmtpConfigured, getTransporter } from "./transport";
import { logger } from "../logger";

export { isSmtpConfigured };

const FROM = process.env["SMTP_FROM_EMAIL"] ?? `SAHU CSC <${process.env["SMTP_USER"]}>`;

async function send(to: string, subject: string, html: string, text: string): Promise<void> {
  if (!isSmtpConfigured()) return; // graceful no-op
  try {
    await getTransporter().sendMail({ from: FROM, to, subject, html, text });
  } catch (err) {
    logger.warn({ err, to, subject }, "Email send failed");
  }
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  await send(
    to,
    "Your SAHU CSC verification code",
    `<p>Your OTP is: <strong>${otp}</strong></p><p>Valid for 10 minutes.</p>`,
    `Your OTP is: ${otp}. Valid for 10 minutes.`,
  );
}

export async function sendApprovalEmail(to: string, name: string): Promise<void> {
  await send(
    to,
    "Your SAHU CSC account has been approved",
    `<p>Hello ${name},</p><p>Your account has been approved. You can now log in.</p>`,
    `Hello ${name}, your account has been approved. You can now log in.`,
  );
}

export async function sendRejectionEmail(to: string, name: string, reason?: string): Promise<void> {
  await send(
    to,
    "SAHU CSC account application update",
    `<p>Hello ${name},</p><p>Your account application was not approved.</p>${reason ? `<p>Reason: ${reason}</p>` : ""}`,
    `Hello ${name}, your account application was not approved.${reason ? ` Reason: ${reason}` : ""}`,
  );
}

export async function sendNewRegistrationAdminEmail(adminEmails: string[], username: string): Promise<void> {
  for (const email of adminEmails) {
    await send(
      email,
      "New registration pending approval",
      `<p>New user <strong>${username}</strong> has registered and is pending approval.</p>`,
      `New user ${username} has registered and is pending approval.`,
    );
  }
}

export async function sendBroadcastEmail(to: string, subject: string, html: string, text: string): Promise<void> {
  await send(to, subject, html, text);
}

export async function sendAdminResetLinkEmail(to: string, link: string): Promise<void> {
  await send(
    to,
    "SAHU CSC password reset link",
    `<p>Click the link to reset your password: <a href="${link}">${link}</a></p><p>Valid for 1 hour.</p>`,
    `Password reset link: ${link} (valid for 1 hour)`,
  );
}

export function buildOtpMailOptions(_to: string, _otp: string): null { return null; }
export function buildApprovalMailOptions(_to: string, _name: string): null { return null; }
export function buildRejectionMailOptions(_to: string, _name: string, _reason?: string): null { return null; }
```

### 4d — Add to `build.mjs` external array

```javascript
"nodemailer",
```

### 4e — Environment variables for SMTP

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sahuuttam690@gmail.com
SMTP_PASSWORD=<Gmail App Password — 16 chars, no spaces>
SMTP_FROM_EMAIL=SAHU CSC Support <sahuuttam690@gmail.com>
```

> **Gmail App Password**: Google Account → Security → 2-Step Verification → App Passwords → create one named "SAHU CSC". Use that 16-char password, NOT your Gmail login password.

---

## Part 5 — Update `env.ts` and `.env.example`

### 5a — Update `artifacts/api-server/src/lib/env.ts`

```typescript
const REQUIRED: [key: string, description: string][] = [
  ["SESSION_SECRET", "Session signing secret (long random string)"],
];

// Soft-warn for optional but strongly recommended vars
const RECOMMENDED: [key: string, description: string][] = [
  ["NEON_DATABASE_URL", "Neon PostgreSQL connection string (falls back to DATABASE_URL)"],
  ["B2_KEY_ID",         "Backblaze B2 key ID for file storage"],
  ["SMTP_USER",         "Gmail address for sending emails"],
  ["UPSTASH_REDIS_REST_URL", "Upstash Redis REST URL for shared cache"],
];

const missing = REQUIRED
  .filter(([key]) => !process.env[key]?.trim())
  .map(([key, desc]) => `  • ${key}  —  ${desc}`);

if (missing.length > 0) {
  console.error(
    [
      "",
      `❌  STARTUP FAILED — ${missing.length} required environment variable${missing.length === 1 ? " is" : "s are"} not set:`,
      "",
      ...missing,
      "",
      "Set them in Render / Vercel / Replit environment variables, then restart.",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

const missingRec = RECOMMENDED.filter(([key]) => !process.env[key]?.trim());
if (missingRec.length > 0) {
  console.warn(
    [
      "",
      `⚠️  Optional services not configured (${missingRec.length}):`,
      ...missingRec.map(([key, desc]) => `  • ${key}  —  ${desc}`),
      "",
    ].join("\n"),
  );
}

export const env = {
  SESSION_SECRET: process.env["SESSION_SECRET"]!,
} as const;
```

### 5b — Update `.env.example`

Replace the entire `.env.example` with:

```bash
# ════════════════════════════════════════════════════════════════════
#  SAHU CSC Manager — Environment Variables
#  Copy this file to .env for local dev. For Render/Vercel add each
#  key to the platform's environment variable settings.
# ════════════════════════════════════════════════════════════════════

# ── Required ──────────────────────────────────────────────────────
SESSION_SECRET=change-me-to-a-long-random-string-at-least-32-chars

# ── PostgreSQL (Neon) ──────────────────────────────────────────────
# Get from: neon.tech → project → Connection Details → Connection string
NEON_DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
DB_POOL_MAX=5

# ── Backblaze B2 File Storage ──────────────────────────────────────
# Get from: backblaze.com → B2 Cloud Storage → Application Keys
# Private bucket = no credit card needed (10 GB free)
B2_KEY_ID=
B2_APP_KEY=
B2_BUCKET_NAME=SAHUCSCV2
B2_BUCKET_ENDPOINT=https://s3.us-west-004.backblazeb2.com

# ── Upstash Redis (Cache + Rate Limiting + Queue) ──────────────────
# Get from: upstash.com → Database → REST API tab + Redis tab
# Free tier: 10,000 req/day, 256 MB
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxx
REDIS_URL=rediss://default:xxxx@xxx.upstash.io:6379

# ── SMTP (Gmail) ───────────────────────────────────────────────────
# Gmail App Password: Google Account → Security → 2-Step Verification → App Passwords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sahuuttam690@gmail.com
SMTP_PASSWORD=
SMTP_FROM_EMAIL=SAHU CSC Support <sahuuttam690@gmail.com>

# ── App ────────────────────────────────────────────────────────────
PORT=8080
NODE_ENV=production
BASE_PATH=/
ALLOW_NON_INDIA=false

# ── Optional ───────────────────────────────────────────────────────
# SENTRY_DSN=
# VITE_SENTRY_DSN=
# MAXMIND_LICENSE_KEY=
# ADMIN_PASSWORD=
# OPERATOR_PASSWORD=
```

---

## Part 6 — Vercel / Render Deployment Notes

### Render (Recommended for this app)

Render supports persistent disk, long-running Node servers, and free PostgreSQL.

**`render.yaml`** — create at project root:

```yaml
services:
  - type: web
    name: sahu-csc-api
    runtime: node
    buildCommand: pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build
    startCommand: node artifacts/api-server/dist/index.mjs
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 8080
      - key: SESSION_SECRET
        generateValue: true
      - key: NEON_DATABASE_URL
        sync: false   # set manually in Render dashboard
      - key: B2_KEY_ID
        sync: false
      - key: B2_APP_KEY
        sync: false
      - key: B2_BUCKET_NAME
        value: SAHUCSCV2
      - key: B2_BUCKET_ENDPOINT
        value: https://s3.us-west-004.backblazeb2.com
      - key: UPSTASH_REDIS_REST_URL
        sync: false
      - key: UPSTASH_REDIS_REST_TOKEN
        sync: false
      - key: REDIS_URL
        sync: false
      - key: SMTP_HOST
        value: smtp.gmail.com
      - key: SMTP_PORT
        value: 587
      - key: SMTP_USER
        sync: false
      - key: SMTP_PASSWORD
        sync: false
      - key: SMTP_FROM_EMAIL
        sync: false
      - key: ALLOW_NON_INDIA
        value: false
      - key: DB_POOL_MAX
        value: 5
```

### Vercel

Vercel is serverless — **not ideal** for this app (sessions, cron, pg_dump, long-running connections). If you must use Vercel:

1. The frontend (`artifacts/sahu-csc`) deploys fine as a static Vite build.
2. The API (`artifacts/api-server`) needs a separate Render/Railway/Fly.io deployment.
3. Set `VITE_API_URL=https://your-api.onrender.com` in Vercel env vars.
4. Update `vite.config.ts` proxy to use `process.env.VITE_API_URL` in production.

---

## Part 7 — Final Verification Checklist

After all changes, run:

```bash
# 1. Build must succeed
pnpm --filter @workspace/api-server run build

# 2. Start and check startup logs for warnings about missing optional vars
PORT=8080 node artifacts/api-server/dist/index.mjs

# 3. Test with B2 vars set — upload a profile picture
# DB should store: b2:avatars/user_1_xxx.webp (not a long base64 string)

# 4. Test with Redis vars set — check rate limit headers are present
# X-RateLimit-Limit and X-RateLimit-Remaining in API responses

# 5. Test email — POST /api/settings/smtp/test
# Should send a real email if SMTP vars are set

# 6. Test without any optional vars — app should start and work
# Only SESSION_SECRET is required; everything else degrades gracefully
```

---

## What NOT to Do

- **Do NOT** make any of the 4 services required — `isB2Configured()`, `isSmtpConfigured()`, `isRedisConfigured()` must all gate their usage
- **Do NOT** change the `users` table schema — `profilePicture` column stays `TEXT`
- **Do NOT** bundle AWS SDK, nodemailer, ioredis, or bullmq via esbuild — they must be in `external[]`
- **Do NOT** add `@aws-sdk/client-s3` or `@upstash/redis` to `lib/db` — they are not drizzle-orm peer deps
- **Do NOT** remove the local `./backups/` disk logic — B2 is a redundant copy, not a replacement
- **Do NOT** break existing base64 avatar rows — `fmtProfile` must pass `data:image/...` through unchanged
- **Do NOT** use Upstash REST URL for BullMQ/ioredis — BullMQ needs the direct TCP `rediss://` URL (`REDIS_URL`), not the HTTP REST URL
