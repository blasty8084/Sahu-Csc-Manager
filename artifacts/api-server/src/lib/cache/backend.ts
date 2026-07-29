import type { CacheBackend } from "./types";
import { createMemoryBackend } from "./memoryBackend";
import { createRedisBackend } from "./redisBackend";

const instances = new Map<string, CacheBackend>();

export function isRedisConfigured(): boolean {
  return !!(
    process.env["UPSTASH_REDIS_REST_URL"] &&
    process.env["UPSTASH_REDIS_REST_TOKEN"]
  );
}

/** One backend instance per namespace, created lazily and reused. */
export function getCacheBackend(namespace: string): CacheBackend {
  const existing = instances.get(namespace);
  if (existing) return existing;
  const backend = isRedisConfigured()
    ? createRedisBackend(namespace)
    : createMemoryBackend();
  instances.set(namespace, backend);
  return backend;
}
