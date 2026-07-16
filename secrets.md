# SAHU CSC — Secrets & Environment Variables Reference
**Version 4.9.0** · Last updated 2026-07-16

Complete list of every secret and environment variable used by this project.  
Set **Secrets** via the Replit Secrets tab (🔒 left sidebar) — values are encrypted and never visible.  
Set **Env Vars** via the Replit Env Vars tab (shared environment unless noted).

---

## 1. Replit Secrets (Sensitive — Encrypted)

These must be added in **Replit → Secrets** tab. Never put them in code or `.env` files.

### 1a. Required Secrets — App will not start or function without these

| Secret Key | Status | Purpose |
|---|---|---|
| `SESSION_SECRET` | ✅ Set | Signs and verifies Express HTTP session cookies. Any long random string (32+ chars). |
| `ADMIN_PASSWORD` | ✅ Set | Password for the default `admin` account. Used by the **Seed Database** workflow. |
| `OPERATOR_PASSWORD` | ✅ Set | Password for the default `operator` account. Used by the **Seed Database** workflow. |

### 1b. Required for Email / OTP — Without these, OTP login and password reset are disabled

| Secret Key | Status | Purpose |
|---|---|---|
| `SMTP_PASSWORD` | ✅ Set | Gmail app password (or SMTP server password). Legacy alias `SMTP_PASS` also accepted. |

### 1c. Optional Secrets — Enable additional features

| Secret Key | Status | Default if Absent | Purpose |
|---|---|---|---|
| `VAPID_PRIVATE_KEY` | ⬜ Not set | Auto-generated & persisted in DB | Web push notification private key. Set explicitly for production so push subscriptions survive re-deploys. |
| `REDIS_URL` | ⬜ Not set | Worker Server skipped | Direct TCP Redis URL (`rediss://default:PASSWORD@host:6379`). Required for BullMQ Worker Server and Redis rate limiter. |
| `UPSTASH_REDIS_REST_TOKEN` | ⬜ Not set | Cache uses in-memory | Upstash REST API token. Required if `CACHE_BACKEND=redis`. |
| `MAXMIND_LICENSE_KEY` | ⬜ Not set | GeoIP updates skipped | MaxMind license key for weekly GeoIP database refresh. Without it, geo-blocking uses the bundled snapshot (may be stale). |
| `ENCRYPTION_KEY` | ⬜ Not set | Auto-generated & persisted in DB | 32-byte base64 AES-256-GCM key for field-level PII encryption. Auto-generated at first boot if absent. |
| `JWT_SECRET` | ⬜ Not set | Auto-generated & persisted in DB | JWT signing secret for API tokens. Auto-generated at first boot if absent. |
| `SENTRY_DSN` | ⬜ Not set | Sentry disabled | Server-side Sentry error tracking DSN. |

---

## 2. Shared Environment Variables (Non-Sensitive)

Set in **Replit → Env Vars → Shared** tab. These are visible in the UI.

### 2a. SMTP / Email Configuration

| Env Var | Status | Current Value | Purpose |
|---|---|---|---|
| `SMTP_HOST` | ✅ Set | `smtp.gmail.com` | SMTP server hostname. |
| `SMTP_PORT` | ✅ Set | `587` | SMTP port (`587` for TLS / STARTTLS, `465` for SSL). |
| `SMTP_USER` | ✅ Set | *(Gmail address)* | SMTP login username / sender address. Also used as admin email fallback in seed. |
| `SMTP_FROM_EMAIL` | ✅ Set | `SAHU CSC Support <...>` | Display name + address shown in the From field of all outgoing emails. Defaults to `SMTP_USER`. |

### 2b. Server & Runtime

| Env Var | Status | Current Value | Purpose |
|---|---|---|---|
| `PORT` | ✅ Set | `5000` | Frontend static server port (serve.mjs). |
| `API_PORT` | ✅ Set | `8080` | API server port reference (used in docs/scripts; actual port set per workflow). |
| `BASE_PATH` | ✅ Set | `/` | URL base path for the frontend build. Change for sub-path deployments. |
| `NODE_ENV` | Set by workflows | `development` | Runtime mode. Workflows set this explicitly; do not override in shared env. |
| `DB_POOL_MAX` | ✅ Set | `5` | Maximum PostgreSQL connection pool size. Prevents exhaustion on Replit's shared DB. |
| `LOG_LEVEL` | ⬜ Not set | `info` | Pino log level: `trace` / `debug` / `info` / `warn` / `error`. |
| `SLOW_REQUEST_MS` | ⬜ Not set | `500` | Threshold (ms) above which API requests are logged as slow. |

### 2c. Cache & Background Jobs

| Env Var | Status | Current Value | Purpose |
|---|---|---|---|
| `CACHE_BACKEND` | ✅ Set | `memory` | Cache driver: `memory` (default, single-instance) or `redis` (requires Upstash secrets). |
| `UPSTASH_REDIS_REST_URL` | ⬜ Not set | Cache uses memory | Upstash REST endpoint (`https://xxx.upstash.io`). Required if `CACHE_BACKEND=redis`. |

### 2d. CORS

| Env Var | Status | Purpose |
|---|---|---|
| `CORS_ORIGIN` | ✅ Set *(legacy)* | Extra comma-separated allowed origins. `REPLIT_DEV_DOMAIN` and `REPLIT_DOMAINS` are **auto-included** at startup (v4.9.0+) — this var is only needed for non-Replit custom origins. No longer requires updating after re-imports. |

### 2e. Push Notifications (VAPID)

| Env Var | Status | Current Value | Purpose |
|---|---|---|---|
| `VAPID_PUBLIC_KEY` | ✅ Set | *(auto-generated key)* | Web push VAPID public key. Safe to expose in client. Auto-generated and persisted in DB at first boot; copy it here for stability. |
| `VAPID_EMAIL` | ✅ Set | `mailto:...` | VAPID contact email in `mailto:email` format. Required by the Web Push standard. |
| `VAPID_SUBJECT` | ⬜ Not set | Derived from `SMTP_FROM_EMAIL` | Override for the VAPID subject field. Defaults to `mailto:{SMTP_FROM_EMAIL}`. |

### 2f. Seed Data (Initial Setup)

These are used **only** by the `Seed Database` workflow to populate default accounts and business settings. Values can be changed via the app UI after seeding.

| Env Var | Status | Current Value | Purpose |
|---|---|---|---|
| `ADMIN_EMAIL` | ⬜ Not set | Falls back to `SMTP_USER` | Email address for the default `admin` account. |
| `ADMIN_MOBILE` | ✅ Set | `9876543210` | Mobile number for the default `admin` account. |
| `OPERATOR_EMAIL` | ✅ Set | `operator@sahucsc.in` | Email address for the default `operator` account. |
| `OPERATOR_MOBILE` | ✅ Set | `9876543211` | Mobile number for the default `operator` account. |
| `BUSINESS_NAME` | ✅ Set | `SAHU CSC Center` | Default business name seeded into settings table. |
| `BUSINESS_ADDRESS` | ✅ Set | `Main Road, Bargarh...` | Default business address seeded into settings table. |
| `BUSINESS_MOBILE` | ⬜ Not set | Falls back to `ADMIN_MOBILE` | Default business contact mobile in settings table. |

### 2g. Observability & Debugging

| Env Var | Status | Purpose |
|---|---|---|
| `SENTRY_TRACES_SAMPLE_RATE` | ⬜ Not set | Sentry performance sampling rate (0.0–1.0). Defaults to `0.1` (10 %). Requires `SENTRY_DSN` secret. |
| `VITE_SENTRY_DSN` | ⬜ Not set | Client-side Sentry DSN for frontend error tracking. Baked into the frontend bundle at build time. |

### 2h. Feature Flags

| Env Var | Status | Default | Purpose |
|---|---|---|---|
| `ALLOW_NON_INDIA` | ⬜ Not set | `false` | Set to `true` to bypass the India-only geo-block. Useful for testing from outside India. |

---

## 3. Runtime-Managed Variables (Never Set Manually)

Replit injects these automatically. Do not add them to Secrets or Env Vars.

| Variable | Source | Notes |
|---|---|---|
| `DATABASE_URL` | Replit PostgreSQL | Full connection string including credentials. |
| `PGDATABASE` | Replit PostgreSQL | Database name component. |
| `PGHOST` | Replit PostgreSQL | Database host. |
| `PGPORT` | Replit PostgreSQL | Database port. |
| `PGUSER` | Replit PostgreSQL | Database username. |
| `PGPASSWORD` | Replit PostgreSQL | Database password. |
| `REPLIT_DEV_DOMAIN` | Replit platform | Current dev preview domain (changes on each re-import). Auto-added to CORS. |
| `REPLIT_DOMAINS` | Replit platform | Comma-separated list of all domains for this repl. Auto-added to CORS. |
| `REPL_ID` | Replit platform | Unique repl identifier. |
| `VAPID_KEYS_FROM_ENV` | Set by `lib/vapid.ts` | Internal runtime flag — set automatically when VAPID keys are loaded. Do not set manually. |

---

## 4. Quick-Start Checklist

Minimum required for a fresh setup after importing from GitHub:

```
Replit Secrets tab:
  ☐ SESSION_SECRET    — any 32+ char random string
  ☐ ADMIN_PASSWORD    — strong password for admin login
  ☐ OPERATOR_PASSWORD — strong password for operator login
  ☐ SMTP_PASSWORD     — Gmail app password (enable 2FA + App Passwords first)

Replit Env Vars tab (shared):
  ☐ SMTP_HOST         = smtp.gmail.com
  ☐ SMTP_PORT         = 587
  ☐ SMTP_USER         = your-gmail@gmail.com
  ☐ SMTP_FROM_EMAIL   = Your Name <your-gmail@gmail.com>
  ☐ VAPID_EMAIL       = mailto:your-gmail@gmail.com
  ☐ DB_POOL_MAX       = 5
  ☐ PORT              = 5000
  ☐ BASE_PATH         = /
  ☐ CACHE_BACKEND     = memory

Then run:
  1. pnpm install
  2. pnpm --filter @workspace/db run push-force   (or run Typecheck workflow)
  3. Seed Database workflow
  4. API Server workflow
  5. Start application workflow
```

> **Not required to set:** `DATABASE_URL` (auto), VAPID keys (auto-generated), `ENCRYPTION_KEY` (auto-generated), `JWT_SECRET` (auto-generated), `CORS_ORIGIN` (Replit domains auto-included since v4.9.0).
