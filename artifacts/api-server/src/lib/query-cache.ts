// TTL cache for hot, read-heavy aggregate queries (dashboard summary, admin
// users-overview, report breakdowns). These endpoints scan/group the entire
// ledger table on every request; a short TTL absorbs bursts of repeat reads
// (e.g. a user tabbing between dashboard widgets, or an admin refreshing the
// overview) without ever serving data more than a few seconds stale.
//
// Storage backend is pluggable (see lib/cache/backend.ts): process-local Map
// by default (correct for the current single-instance VM deployment), or
// Upstash Redis via CACHE_BACKEND=redis if this ever runs as multiple
// instances. TTL (5s) and invalidation triggers are unchanged either way —
// only the storage location changes. See replit.md's "Scaling to multiple
// instances" note and CDN_SETUP.md-adjacent docs for the full tradeoff.
import { getCacheBackend } from "./cache/backend";

const backend = getCacheBackend("querycache");

const DEFAULT_TTL_MS = 5_000;

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = await backend.get<T>(key);
  if (hit !== undefined) {
    return hit;
  }
  const value = await load();
  await backend.set(key, value, ttlMs);
  return value;
}

export function cachedFor(ttlMs: number = DEFAULT_TTL_MS) {
  return <T>(key: string, load: () => Promise<T>) => cached(key, ttlMs, load);
}

/** Invalidate every cache entry whose key starts with the given prefix. */
export async function invalidatePrefix(prefix: string): Promise<void> {
  await backend.deleteByPrefix(prefix);
}

/** Invalidate all caches derived from the ledger table (dashboard, reports, admin overview). */
export async function invalidateLedgerCaches(): Promise<void> {
  await Promise.all([
    invalidatePrefix("dashboard:"),
    invalidatePrefix("reports:"),
    invalidatePrefix("admin:users-overview"),
  ]);
}

/** Invalidate AePS session + transaction list caches for a specific user (or all users). */
export async function invalidateAepsCaches(userId?: number): Promise<void> {
  await Promise.all([
    userId !== undefined
      ? invalidatePrefix(`aeps:session:${userId}:`)
      : invalidatePrefix("aeps:session:"),
    invalidatePrefix("aeps:transactions:"),
    invalidatePrefix("admin:aeps-overview"),
  ]);
}

/** Invalidate Udhari customer list + individual customer caches for a user. */
export async function invalidateUdhariCaches(userId: number): Promise<void> {
  await Promise.all([
    invalidatePrefix(`udhari:customers:${userId}:`),
    invalidatePrefix("udhari:customer:"),
  ]);
}

/** Invalidate the admin user list cache. */
export async function invalidateUserListCache(): Promise<void> {
  await invalidatePrefix("admin:users");
}

export async function cacheStats() {
  return backend.stats();
}
