// Shared cache-backend contract. Both the process-local (memory) and the
// optional Redis (Upstash) implementations satisfy this interface, so
// query-cache.ts / sessionCache.ts don't need to know which one is active.
export interface CacheBackend {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
  delete(key: string): Promise<void>;
  /** Delete every entry whose key starts with `prefix`. */
  deleteByPrefix(prefix: string): Promise<void>;
  /** Delete everything in this backend's namespace. */
  clear(): Promise<void>;
  /** Best-effort live/expired entry counts, for the debug cacheStats() helper. Not guaranteed exact for the redis backend. */
  stats(): Promise<{ entries: number }>;
}
