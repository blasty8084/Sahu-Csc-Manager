import type { CacheBackend } from "./types";
import { createMemoryBackend } from "./memoryBackend";
import { createRedisBackend } from "./redisBackend";

export type CacheBackendKind = "memory" | "redis";

/**
 * Selects the cache storage backend. Defaults to "memory" (today's
 * behavior, correct for the current single-instance VM deployment — see
 * replit.md). Set CACHE_BACKEND=redis (and UPSTASH_REDIS_REST_URL /
 * UPSTASH_REDIS_REST_TOKEN) only once the API actually runs as more than one
 * instance and needs a shared cache. This is groundwork, not a forced
 * migration — see CHANGELOG_V3.md v3.5.7 and the "Scaling to multiple
 * instances" note in replit.md.
 */
export function getCacheBackendKind(): CacheBackendKind {
  return (process.env.CACHE_BACKEND ?? "memory").trim().toLowerCase() === "redis" ? "redis" : "memory";
}

const instances = new Map<string, CacheBackend>();

/** One backend instance per namespace, created lazily and reused. */
export function getCacheBackend(namespace: string): CacheBackend {
  const existing = instances.get(namespace);
  if (existing) return existing;

  const backend =
    getCacheBackendKind() === "redis" ? createRedisBackend(namespace) : createMemoryBackend();
  instances.set(namespace, backend);
  return backend;
}
