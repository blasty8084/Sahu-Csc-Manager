---
name: External services removed
description: Redis/BullMQ, Backblaze B2, and SMTP/nodemailer were all removed in v4.10.1. Summarises what replaced each and what callers should expect.
---

# External services removed (v4.10.1)

## What was removed and what replaced it

### Redis / BullMQ / rate-limit-redis / @upstash/redis
- `ioredis`, `bullmq`, `rate-limit-redis`, `@upstash/redis` are no longer dependencies.
- `queue-client.ts` — `enqueueNotification` calls `sendPushToUser`/`sendPushToAll` directly (fire-and-forget). `enqueueEmail` is a no-op.
- `app.ts` — all rate limiters use express-rate-limit's default in-memory store. No Redis client exists.
- `cache/backend.ts` — always returns memory backend. `redisBackend.ts` deleted.
- `env.ts` — `REDIS_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` no longer in the env object.
- Worker server (`artifacts/worker-server/`) still exists but skips cleanly without `REDIS_URL`.

### Backblaze B2 (@aws-sdk/client-s3, @aws-sdk/s3-request-presigner)
- `b2.ts` is now a stub: `isB2Configured()` always returns `false`; other functions throw.
- `routes/profile.ts` — avatars always stored as `data:image/webp;base64,...` in the database.
- `routes/auth/helpers.ts` — `b2:` prefixed `profilePicture` values are returned as `null` (user must re-upload).
- `services/backupCore.ts` — backups are local-only (`./backups/` directory); no B2 upload or download.
- `env.ts` — `B2_KEY_ID`, `B2_APP_KEY`, `B2_BUCKET_NAME`, `B2_BUCKET_ENDPOINT` removed from env object.

### SMTP / nodemailer
- `nodemailer` is no longer a dependency.
- `mailer/index.ts` — all `send*` and `build*MailOptions` functions are no-ops returning `undefined`/`null`.
- `mailer/transport.ts` — `isSmtpConfigured()` returns `false`; `createTransporter()` throws.
- `routes/settings/smtp.ts` — GET returns `{ configured: false }`; PATCH and POST /test return `501`.
- `routes/broadcast.ts` — email broadcast already guarded by `!isSmtpConfigured()` → always returns 503.
- `monthly-export/email.ts` — no-op; ZIP is still built locally.

**Why:** simplify the deployment to zero external service dependencies. The app is fully functional without Redis, B2, or email.

**How to apply:** If you see any import of `ioredis`, `bullmq`, `@aws-sdk/client-s3`, `nodemailer`, or `@upstash/redis` in new code, do NOT add them back without explicit user instruction.
