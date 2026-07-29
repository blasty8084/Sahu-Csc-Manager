import { Redis } from "@upstash/redis";
import type { CacheBackend } from "./types";

/**
 * Upstash Redis cache backend — used when UPSTASH_REDIS_REST_URL is set.
 * Uses Upstash REST API (HTTP-based, works in serverless and edge).
 */
export function createRedisBackend(namespace: string): CacheBackend {
  const redis = new Redis({
    url: process.env["UPSTASH_REDIS_REST_URL"]!,
    token: process.env["UPSTASH_REDIS_REST_TOKEN"]!,
  });

  const prefixed = (key: string) => `${namespace}:${key}`;

  return {
    async get<T>(key: string): Promise<T | undefined> {
      const val = await redis.get<T>(prefixed(key));
      return val ?? undefined;
    },
    async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
      await redis.set(prefixed(key), value, { px: ttlMs });
    },
    async delete(key: string): Promise<void> {
      await redis.del(prefixed(key));
    },
    async deleteByPrefix(prefix: string): Promise<void> {
      const keys = await redis.keys(`${namespace}:${prefix}*`);
      if (keys.length > 0) await redis.del(...keys);
    },
    async clear(): Promise<void> {
      const keys = await redis.keys(`${namespace}:*`);
      if (keys.length > 0) await redis.del(...keys);
    },
    async stats(): Promise<{ entries: number }> {
      const keys = await redis.keys(`${namespace}:*`);
      return { entries: keys.length };
    },
  };
}
