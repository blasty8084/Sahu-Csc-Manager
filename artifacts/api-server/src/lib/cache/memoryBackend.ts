import type { CacheBackend } from "./types";

interface Entry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Process-local Map-backed cache. This is the default backend — correct and
 * simplest for a single Node instance (see replit.md / architectureV3.md).
 * Every namespace (query cache, session cache, role cache) gets its own Map
 * so prefix invalidation in one namespace can never touch another.
 */
export function createMemoryBackend(): CacheBackend {
  const store = new Map<string, Entry<unknown>>();

  return {
    async get<T>(key: string): Promise<T | undefined> {
      const hit = store.get(key);
      if (!hit) return undefined;
      if (hit.expiresAt <= Date.now()) {
        store.delete(key);
        return undefined;
      }
      return hit.value as T;
    },
    async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
    async delete(key: string): Promise<void> {
      store.delete(key);
    },
    async deleteByPrefix(prefix: string): Promise<void> {
      for (const key of store.keys()) {
        if (key.startsWith(prefix)) store.delete(key);
      }
    },
    async clear(): Promise<void> {
      store.clear();
    },
    async stats(): Promise<{ entries: number }> {
      const now = Date.now();
      let live = 0;
      for (const entry of store.values()) {
        if (entry.expiresAt > now) live++;
      }
      return { entries: live };
    },
  };
}
