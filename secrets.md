# SAHU CSC — Secrets & Environment Variables Reference
**Version 4.10.2** · Last updated 2026-07-31

> Complete reference for every secret and environment variable in this project.
>
> - **Secrets** → Replit left sidebar → 🔒 Secrets tab (encrypted, never visible in UI or logs)
> - **Env Vars** → Replit left sidebar → Env Vars tab → Shared (visible, non-sensitive)
>
> Variables marked **auto-generated** are created at first server boot and persisted in the `settings`
> database table. You do not need to set them manually in development; set them explicitly only for
> production deployments where you need stable values across re-deploys.

---

## Table of Contents

1. [Critical Secrets — App will not boot without these](#1-critical-secrets--app-will-not-boot-without-these)
2. [Optional Secrets — Enable additional features](#2-optional-secrets--enable-additional-features)
3. [Resend / Email](#3-resend--email)
4. [Backblaze B2 File Storage](#4-backblaze-b2-file-storage)
5. [Upstash Redis (Cache + Rate Limiting + Queue)](#5-upstash-redis-cache--rate-limiting--queue)
6. [Core Environment Variables](#6-core-environment-variables)
7. [Database & Performance](#7-database--performance)
8. [Push Notifications (VAPID)](#8-push-notifications-vapid)
9. [Geo & Feature Flags](#9-geo--feature-flags)
10. [CORS](#10-cors)
11. [Seed Data](#11-seed-data)
12. [Observability](#12-observability)
13. [Runtime-Managed (Never Set Manually)](#13-runtime-managed-never-set-manually)
14. [Quick-Start Checklist](#14-quick-start-checklist)

---

## 1. Critical Secrets — App will not boot without these

Set in **Replit → Secrets tab**.

| Secret | Status | Format | Explanation |
|--------|--------|--------|-------------|
| `SESSION_SECRET` | ✅ Set | Any random string, 32+ chars | Signs and verifies every HTTP session cookie via Express-session. If this changes, all active user sessions are instantly invalidated and everyone is logged out. Use a long random string — it never needs to be human-readable. |
| `ADMIN_PASSWORD` | ✅ Set | Strong password | Password for the default `admin` account created by the **Seed Database** workflow. Must meet the password policy: 8+ chars, uppercase, lowercase, number. After seeding you can change it from the Profile page; the secret is only read during seeding. |
| `OPERATOR_PASSWORD` | ✅ Set | Strong password | Password for the default `operator` account created by the **Seed Database** workflow. Same policy as `ADMIN_PASSWORD`. |

> ⚠️ If either password secret is missing the Seed Database workflow exits immediately with an error and no accounts are created.

---

## 2. Optional Secrets — Enable additional features

| Secret | Status | Default if Absent | Explanation |
|--------|--------|-------------------|-------------|
| `VAPID_PRIVATE_KEY` | ⬜ Not set | Auto-generated & saved in DB | The private half of the VAPID key pair for Web Push notifications. Auto-generated at first boot and stored in the `settings` table. **Set this explicitly in production** — if the key changes (e.g. after a DB wipe), all existing push subscriptions become invalid and users must re-subscribe. |
| `ENCRYPTION_KEY` | ⬜ Not set | Auto-generated & saved in DB | 32-byte base64-encoded AES-256-GCM key. Used to encrypt PII fields at rest: `address`, `bio`, `notes`, `totpSecret`, `backupCodes`. Auto-generated at first boot. **Set explicitly in production** — changing this key renders all encrypted data in the DB permanently unreadable. |
| `JWT_SECRET` | ⬜ Not set | Auto-generated & saved in DB | Signing secret for internal JWT tokens. Auto-generated at first boot. Set explicitly in production for stability. |
| `MAXMIND_LICENSE_KEY` | ⬜ Not set | GeoIP uses bundled snapshot | MaxMind license key for weekly GeoIP database updates (runs every Sunday at 03:00 via node-cron). Without it, geo-blocking works from the bundled snapshot that may be a few months old. Get a free key at maxmind.com. |
| `SENTRY_DSN` | ⬜ Not set | Server-side error tracking disabled | Sentry DSN for capturing unhandled errors and exceptions in the API server. Get from sentry.io → Project → Settings → Client Keys. |

---

## 3. Resend / Email

Enables transactional emails: OTP delivery, account approval/rejection, admin alerts, broadcast emails, and password reset links. All send functions are graceful no-ops when `RESEND_API_KEY` is not configured.

Email is sent via **Resend HTTP API** (HTTPS port 443) — replaces Nodemailer SMTP which was blocked on Render free tier (port 587). Verified domain: `sahucsc.dpdns.org`.

**Secrets** (Replit → Secrets tab):

| Secret | Status | Explanation |
|--------|--------|-------------|
| `RESEND_API_KEY` | ✅ Set | API key from resend.com → API Keys. Format: `re_xxxxxxxxxxxxxxxxxxxx`. Required for all email delivery. |

**Environment Variables** (Replit → Env Vars → Shared):

| Variable | Status | Value | Explanation |
|----------|--------|-------|-------------|
| `RESEND_FROM` | ✅ Set | `SAHU CSC <noreply@sahucsc.dpdns.org>` | Sender address shown in From header. Must be from a verified Resend domain. |

> **Test endpoint**: `POST /api/settings/smtp/test` (admin auth required) sends a real test email via Resend. Confirmed working as of 2026-07-31.
>
> **Domain**: `sahucsc.dpdns.org` is verified on resend.com — all user email addresses receive OTP and notification emails.

---

## 4. Backblaze B2 File Storage

When configured, profile avatars are stored as compressed WebP objects in B2 (instead of base64 in the DB), and database backups are mirrored to B2 for redundancy. Bucket `SAHUCSCV2` (region `us-west-004`) is already created.

| Secret / Var | Type | Status | Explanation |
|---|---|---|---|
| `B2_KEY_ID` | Secret | ⬜ Not set | Application Key ID from Backblaze → App Keys page. |
| `B2_APP_KEY` | Secret | ⬜ Not set | Application Key (shown only once at creation). |
| `B2_BUCKET_NAME` | Env Var | — | `SAHUCSCV2` (set in `.env.example`; add to Render env vars). |
| `B2_BUCKET_ENDPOINT` | Env Var | — | `https://s3.us-west-004.backblazeb2.com` |

> Without these vars `isB2Configured()` returns false — avatars fall back to base64 in DB, backups stay local only.

---

## 5. Upstash Redis (Cache + Rate Limiting + Queue)

When configured, cache and rate-limit counters are shared across all server instances (required for Render multi-instance deployments). BullMQ uses the TCP Redis URL for background jobs.

| Secret / Var | Type | Status | Explanation |
|---|---|---|---|
| `UPSTASH_REDIS_REST_URL` | Secret | ⬜ Not set | REST URL from Upstash dashboard → REST API tab (e.g. `https://xxx.upstash.io`). Used by the cache backend and rate limiters. |
| `UPSTASH_REDIS_REST_TOKEN` | Secret | ⬜ Not set | REST token from the same tab. |
| `REDIS_URL` | Secret | ⬜ Not set | TCP connection URL from Upstash → Redis tab (e.g. `rediss://default:xxx@xxx.upstash.io:6379`). Used by BullMQ/ioredis for background notification jobs. |

> Free tier: 10,000 requests/day, 256 MB. Without these vars the app falls back to in-memory rate limiting and cache (fine for single-instance; not safe for multi-instance).

---

## 6. Core Environment Variables

Set in **Replit → Env Vars → Shared**.

| Variable | Status | Value | Explanation |
|----------|--------|-------|-------------|
| `PORT` | ✅ Set | `5000` | Port the frontend static server (`serve.mjs`) listens on. Must match the Replit preview port. |
| `API_PORT` | ✅ Set | `8080` | Reference port for the API server. The actual port is set in the workflow command (`PORT=8080 node ...`) — this env var is used in documentation and helper scripts only. |
| `BASE_PATH` | ✅ Set | `/` | URL base path for the frontend build. Change to `/subpath/` only if the app is served from a sub-directory. Leave as `/` for all standard Replit deployments. |
| `NODE_ENV` | Set by workflows | `development` | Runtime mode flag. Each workflow sets this explicitly in its command prefix — do **not** set it in shared Env Vars or it will conflict. |

---

## 7. Database & Performance

| Variable | Status | Value | Explanation |
|----------|--------|-------|-------------|
| `DB_POOL_MAX` | ✅ Set | `5` | Maximum number of simultaneous PostgreSQL connections the `pg` pool will hold open. Replit's free-tier PostgreSQL has a hard limit of ~20 connections shared across all repls on the account. Setting this to `5` prevents the API from exhausting the limit under concurrent load. Increase only if you are on a dedicated database with a higher connection limit. |
| `LOG_LEVEL` | ⬜ Not set | `info` | Pino structured log verbosity. Options: `trace` (everything) → `debug` → `info` (default, production-safe) → `warn` → `error` (quiet). Set to `debug` for troubleshooting; never use `trace` in production — it logs raw request bodies. |
| `SLOW_REQUEST_MS` | ⬜ Not set | `500` | Threshold in milliseconds. Any API request taking longer than this value is logged at `warn` level with its route and duration. Useful for spotting slow DB queries without a full profiler. |

---

## 8. Push Notifications (VAPID)

VAPID (Voluntary Application Server Identification) is the Web Push standard for identifying your server to browser push services.

| Variable | Status | Value | Explanation |
|----------|--------|-------|-------------|
| `VAPID_PUBLIC_KEY` | Auto-generated | *(auto-generated)* | The public half of the VAPID key pair. Safe to expose to the browser — it is sent to the client during push subscription. Auto-generated at first boot and persisted in the `settings` table. Copy the generated value here for stability across restarts. |
| `VAPID_EMAIL` | ⬜ Not set | — | Contact email sent to push services so they can reach you if there is an abuse issue. Must be in `mailto:email@example.com` format. Required by the Web Push standard — push will fail without it. |

> **Key rotation:** Rotating VAPID keys (via Admin → Settings → VAPID Rotate) invalidates all existing push subscriptions. All users must re-enable push notifications after a rotation.

---

## 9. Geo & Feature Flags

| Variable | Status | Value | Explanation |
|----------|--------|-------|-------------|
| `ALLOW_NON_INDIA` | ✅ Set | `true` | Set to `true` to bypass the India-only GeoIP block. The app rejects visitors whose IP resolves to a country other than India. This is set to `true` in the Replit development environment since Replit servers are outside India. Set to `false` or remove in production. |
| `DISABLE_2FA` | ✅ Set | `true` | When `true`, all 2FA/OTP challenges are bypassed globally. Useful for development. Remove or set to `false` in production. |

---

## 10. CORS

Cross-Origin Resource Sharing controls which domains the API will accept requests from.

| Variable | Status | Explanation |
|----------|--------|-------------|
| `CORS_ORIGIN` | ✅ Set | Extra allowed origins as a comma-separated list of URLs. Since v4.9.0, `REPLIT_DEV_DOMAIN` and `REPLIT_DOMAINS` are **auto-added at startup** from Replit's injected env vars — you no longer need to update this after every re-import. Only set this if you are serving the frontend from a **non-Replit custom domain**. |

> As of v4.9.0 this variable is only needed for custom (non-Replit) domains. Replit preview and deployed domains are handled automatically.

---

## 11. Seed Data

Used **only** by the `Seed Database` workflow. These set the default values for accounts and business info on first setup. After seeding, all values can be changed from the app UI (Admin → Settings, Profile page).

| Variable | Status | Default if Absent | Explanation |
|----------|--------|-------------------|-------------|
| `ADMIN_MOBILE` | ✅ Set | `9876543210` | Mobile number for the seeded `admin` account. Used as a login identifier and for AePS default contact. |
| `OPERATOR_EMAIL` | ✅ Set | `operator@sahucsc.in` | Email address for the seeded `operator` account. |
| `OPERATOR_MOBILE` | ✅ Set | `9876543211` | Mobile number for the seeded `operator` account. |
| `BUSINESS_NAME` | ✅ Set | `SAHU CSC Center` | Default business name written to the `settings` table. Appears in receipts and PDF exports. |
| `BUSINESS_ADDRESS` | ✅ Set | `Main Road, Bargarh...` | Default business address written to the `settings` table. Appears in receipts and PDF exports. |
| `BUSINESS_MOBILE` | ⬜ Not set | Falls back to `ADMIN_MOBILE` | Default business contact mobile in the `settings` table. Appears on public receipt pages and WhatsApp share links. |

---

## 12. Observability

| Variable | Status | Default | Explanation |
|----------|--------|---------|-------------|
| `SENTRY_TRACES_SAMPLE_RATE` | ⬜ Not set | `0.1` (10 %) | Fraction of requests to include in Sentry performance tracing (0.0 = none, 1.0 = all). Requires `SENTRY_DSN` secret. Keep low in production to avoid excessive Sentry quota usage. |
| `VITE_SENTRY_DSN` | ⬜ Not set | Client tracking disabled | Sentry DSN for the React frontend. Baked into the JS bundle at build time (`VITE_` prefix makes it available in browser code). Separate from the server-side `SENTRY_DSN`. |

---

## 13. Runtime-Managed (Never Set Manually)

Replit injects these automatically. Adding them to Secrets or Env Vars will cause conflicts.

| Variable | Injected By | Explanation |
|----------|-------------|-------------|
| `DATABASE_URL` | Replit PostgreSQL | Full `postgresql://user:pass@host:port/db` connection string injected by Replit's managed PostgreSQL. |
| `PGDATABASE` | Replit PostgreSQL | Database name component of the Replit-managed connection. |
| `PGHOST` | Replit PostgreSQL | Database server hostname of the Replit-managed instance. |
| `PGPORT` | Replit PostgreSQL | Database server port of the Replit-managed instance (usually `5432`). |
| `PGUSER` | Replit PostgreSQL | Database login username for the Replit-managed instance. |
| `PGPASSWORD` | Replit PostgreSQL | Database login password for the Replit-managed instance. |
| `REPLIT_DEV_DOMAIN` | Replit platform | The current dev preview domain (e.g. `abc123.replit.dev`). Changes on each re-import. Auto-added to CORS since v4.9.0. |
| `REPLIT_DOMAINS` | Replit platform | Comma-separated list of all domains assigned to this repl (dev + deployed). Auto-added to CORS since v4.9.0. |
| `REPL_ID` | Replit platform | Unique identifier for this repl. Used internally by Replit tooling. |
| `VAPID_KEYS_FROM_ENV` | `lib/vapid.ts` at boot | Internal flag set at runtime when VAPID keys are loaded from environment variables rather than the DB. Do not set manually. |

---

## 14. Quick-Start Checklist

Minimum required after importing the project fresh from GitHub:

### Secrets Tab (🔒)
```
☑ SESSION_SECRET      — 32+ character random string (e.g. openssl rand -base64 32)
☑ ADMIN_PASSWORD      — strong password for admin account
☑ OPERATOR_PASSWORD   — strong password for operator account
☑ SMTP_USER           — Gmail address (sahuuttam690@gmail.com)
☑ SMTP_PASSWORD       — Gmail App Password (16 chars)
☑ SMTP_FROM_EMAIL     — Display name + address for From: header
```

### Optional Secrets (enable extra services)
```
☐ B2_KEY_ID / B2_APP_KEY           — Backblaze B2 for avatar/backup storage
☐ UPSTASH_REDIS_REST_URL / TOKEN   — Shared cache + rate limiting
☐ REDIS_URL                        — BullMQ background jobs
```

### Setup Steps (run in order)
```bash
1.  pnpm install                              # install all dependencies
2.  pnpm --filter @workspace/db run push      # apply DB schema
3.  Run → Seed Database workflow              # create admin + operator accounts
4.  Run → API Server workflow                 # start backend on port 8080
5.  Run → Start application workflow          # start frontend on port 5000
```

### Not Required to Set
```
✓  DATABASE_URL      — auto-injected by Replit
✓  CORS_ORIGIN       — Replit domains auto-included since v4.9.0
✓  ENCRYPTION_KEY    — auto-generated at first boot, persisted in DB
✓  JWT_SECRET        — auto-generated at first boot, persisted in DB
✓  VAPID_PUBLIC_KEY  — auto-generated at first boot, persisted in DB
✓  VAPID_PRIVATE_KEY — auto-generated at first boot, persisted in DB
```

> **Production note:** For a deployed (published) app, explicitly set `ENCRYPTION_KEY`, `VAPID_PRIVATE_KEY`,
> and `JWT_SECRET` as Replit Secrets so their values survive database resets and re-deploys.
> Losing these keys means encrypted PII becomes unreadable and all push subscriptions are invalidated.
