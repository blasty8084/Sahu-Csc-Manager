import { Redis } from "@upstash/redis";
import type { CacheBackend } from "./types";
import { logger } from "../logger";

/**
 * Upstash Redis (REST API) backed cache, for when the API runs as more than
 * one instance and the process-local Map cache would serve stale/inconsistent
 * reads across instances. Opt-in via CACHE_BACKEND=redis — see
 * lib/cache/backend.ts. Preserves the exact same TTL/invalidation semantics
 * as the memory backend; only the storage location changes.
 *
 * Keys are namespaced (`cache:<namespace>:<key>`) so the query cache, session
 * cache, and role cache never collide inside the same Redis database.
 */
export function createRedisBackend(namespace: string): CacheBackend {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "CACHE_BACKEND=redis requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to be set."
    );
  }
  const redis = new Redis({ url, token });
  const nsKey = (key: string) => `cache:${namespace}:${key}`;

  const deleteByPrefix = async (prefix: string): Promise<void> => {
    // Invalidation only runs on ledger writes / logout / role changes —
    // low-frequency, so a SCAN here (rather than maintaining a separate
    // key index) is an acceptable tradeoff for simplicity.
    try {
      let cursor: string | number = 0;
      const pattern = `${nsKey(prefix)}*`;
      do {
        const scanResult: [string | number, string[]] = await redis.scan(cursor, {
          match: pattern,
          count: 100,
        });
        if (scanResult[1].length) await redis.del(...scanResult[1]);
        cursor = scanResult[0];
      } while (String(cursor) !== "0");
    } catch (err) {
      logger.warn({ err, namespace, prefix }, "redis cache deleteByPrefix failed");
    }
  };

  return {
    async get<T>(key: string): Promise<T | undefined> {
      try {
        const value = await redis.get<T>(nsKey(key));
        return value === null || value === undefined ? undefined : value;
      } catch (err) {
        // Fail open: a cache miss (re-run the query) is far safer than a
        // 500 if Redis is briefly unavailable.
        logger.warn({ err, namespace, key }, "redis cache get failed, treating as miss");
        return undefined;
      }
    },
    async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
      try {
        await redis.set(nsKey(key), value as unknown, { px: ttlMs });
      } catch (err) {
        logger.warn({ err, namespace, key }, "redis cache set failed, continuing without caching this entry");
      }
    },
    async delete(key: string): Promise<void> {
      try {
        await redis.del(nsKey(key));
      } catch (err) {
        logger.warn({ err, namespace, key }, "redis cache delete failed");
      }
    },
    deleteByPrefix,
    async clear(): Promise<void> {
      await deleteByPrefix("");
    },
    async stats(): Promise<{ entries: number }> {
      try {
        let cursor: string | number = 0;
        let count = 0;
        const pattern = `${nsKey("")}*`;
        do {
          const scanResult: [string | number, string[]] = await redis.scan(cursor, {
            match: pattern,
            count: 100,
          });
          count += scanResult[1].length;
          cursor = scanResult[0];
        } while (String(cursor) !== "0");
        return { entries: count };
      } catch (err) {
        logger.warn({ err, namespace }, "redis cache stats scan failed");
        return { entries: 0 };
      }
    },
  };
}
