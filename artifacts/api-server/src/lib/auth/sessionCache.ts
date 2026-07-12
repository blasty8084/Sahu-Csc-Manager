// ─── TTL cache for auth hot paths ───────────────────────────────────────────
//
// requireAuth/requireRole/requirePermission run on nearly every request and
// would otherwise issue a fresh DB query each time to re-validate a session
// or look up a user's role. Under real traffic that's one extra round-trip
// per request just to answer "is this session still valid" / "what role does
// this user have" — questions that rarely change between two requests from
// the same session a few seconds apart.
//
// Storage backend is pluggable (see ../cache/backend.ts): process-local Map
// by default (fine for a single API instance, and simple to reason about),
// or Upstash Redis via CACHE_BACKEND=redis if the service is ever scaled to
// multiple instances — session revocation then takes effect everywhere
// within TTL_MS instead of only on the instance that saw the revocation.
// TTL (5s) is unchanged either way; only the storage location changes.
import { getCacheBackend } from "../cache/backend";
import type { CacheBackend } from "../cache/types";

const TTL_MS = 5_000;

class TtlCache<T> {
  constructor(private backend: CacheBackend) {}

  async get(key: string): Promise<T | undefined> {
    return this.backend.get<T>(key);
  }

  async set(key: string, value: T): Promise<void> {
    await this.backend.set(key, value, TTL_MS);
  }

  async delete(key: string): Promise<void> {
    await this.backend.delete(key);
  }

  async clear(): Promise<void> {
    await this.backend.clear();
  }
}

/** sessionId -> whether the V2 user_sessions row is currently active & unexpired. */
export const sessionValidityCache = new TtlCache<boolean>(getCacheBackend("session-validity"));

/** userId -> role, for requireRole/requirePermission's role lookups. */
export const userRoleCache = new TtlCache<{ role: string; activeSessionToken: string | null }>(
  getCacheBackend("user-role")
);

export async function invalidateSessionCache(sessionId: string): Promise<void> {
  await sessionValidityCache.delete(sessionId);
}

export async function invalidateUserCache(userId: number): Promise<void> {
  await userRoleCache.delete(String(userId));
}
