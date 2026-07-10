// Lightweight in-process TTL cache for hot, read-heavy aggregate queries
// (dashboard summary, admin users-overview, report breakdowns). These endpoints
// scan/group the entire ledger table on every request; a short TTL absorbs
// bursts of repeat reads (e.g. a user tabbing between dashboard widgets, or an
// admin refreshing the overview) without ever serving data more than a few
// seconds stale.
//
// This is intentionally NOT Redis: the app runs as a single Node process, so a
// process-local Map is simpler, has zero extra infra, and is invalidated
// synchronously on writes (see invalidate*() below) rather than relying on TTL
// alone. If this app ever runs as multiple instances, this cache must be
// replaced with a shared store (Redis) — see replit.md follow-ups.

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 5_000;

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value as T;
  }
  const value = await load();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export function cachedFor(ttlMs: number = DEFAULT_TTL_MS) {
  return <T>(key: string, load: () => Promise<T>) => cached(key, ttlMs, load);
}

/** Invalidate every cache entry whose key starts with the given prefix. */
export function invalidatePrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

/** Invalidate all caches derived from the ledger table (dashboard, reports, admin overview). */
export function invalidateLedgerCaches(): void {
  invalidatePrefix("dashboard:");
  invalidatePrefix("reports:");
  invalidatePrefix("admin:users-overview");
}

export function cacheStats() {
  const now = Date.now();
  let live = 0;
  let expired = 0;
  for (const entry of store.values()) {
    if (entry.expiresAt > now) live++;
    else expired++;
  }
  return { entries: store.size, live, expired };
}
