---
name: Query cache, rate-limiter bypass, and load testing
description: Process-local TTL cache pattern for hot aggregate reads, and how to safely load-test an app behind a per-IP rate limiter with trust proxy enabled.
---

## Process-local TTL cache for hot aggregates
Added `lib/query-cache.ts` — a plain `Map`-based TTL cache (not Redis) in front of endpoints that scan/group a full table on every request (dashboard summary, admin overview, daily/monthly reports). Invalidated synchronously on writes, not just TTL expiry.

**Why:** single-process app, so a shared cache tier is unneeded infra. Cache keys must be scoped per-user for user-filtered endpoints (`dashboard:{userId}:{date}`) vs global for admin-only aggregates (`admin:users-overview`) — mixing these up leaks data across users.

**How to apply:** if this API ever runs as multiple instances, this cache must move to Redis or the instances will serve inconsistent cached data.

## Rate limiter blocks load testing when trust proxy is on
A per-IP `express-rate-limit` (500/15min) makes any real load-testing tool (autocannon etc.) instantly hit 429s, since realistic concurrent load vastly exceeds that budget in seconds.

**Why it's tricky:** `app.set("trust proxy", 1)` makes `req.ip` derive from `X-Forwarded-For`, which is attacker-controllable. A naive `skip: (req) => req.ip === "127.0.0.1"` in the limiter is a real security bypass in production (spoofable header), not just a dev convenience.

**How to apply:** gate any loopback-based rate-limit skip on `process.env.NODE_ENV !== "production"` in addition to the IP check, so the bypass code path doesn't exist at all once deployed. Also double check any health-check route's actual mount path/prefix before pointing a load-test script at it (health routes are often mounted at root, not under `/api`).
