// ─── Lightweight in-memory TTL cache for auth hot paths ────────────────────────
//
// requireAuth/requireRole/requirePermission run on nearly every request and
// previously issued a fresh DB query each time to re-validate a session or
// look up a user's role. Under real traffic that turns into one extra
// round-trip per request just to answer "is this session still valid" /
// "what role does this user have" — questions that rarely change between
// two requests from the same session a few seconds apart.
//
// This is a small process-local cache, not a distributed cache (e.g. Redis):
// fine for a single API instance, and simple enough to reason about. If the
// service is ever scaled to multiple instances, session revocation still
// takes effect everywhere within TTL_MS, and instances that haven't seen the
// revocation yet will only serve stale reads for a few seconds — an
// acceptable trade-off for the reduced DB load. If tighter revocation
// guarantees are needed across instances, swap this for a shared cache.
const TTL_MS = 5_000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TtlCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + TTL_MS });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

/** sessionId -> whether the V2 user_sessions row is currently active & unexpired. */
export const sessionValidityCache = new TtlCache<boolean>();

/** userId -> role, for requireRole/requirePermission's role lookups. */
export const userRoleCache = new TtlCache<{ role: string; activeSessionToken: string | null }>();

export function invalidateSessionCache(sessionId: string): void {
  sessionValidityCache.delete(sessionId);
}

export function invalidateUserCache(userId: number): void {
  userRoleCache.delete(String(userId));
}
