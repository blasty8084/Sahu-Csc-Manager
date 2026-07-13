import IORedis from "ioredis";
import type { ConnectionOptions } from "bullmq";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error(
    "[worker-server] REDIS_URL environment variable is required but not set.\n" +
    "Set REDIS_URL to a Redis-compatible TCP connection string (e.g. rediss://...) and restart.\n" +
    "Note: UPSTASH_REDIS_REST_URL is the REST API endpoint and cannot be used here — " +
    "use the direct Redis URL from your Upstash dashboard instead.",
  );
  process.exit(1);
}

/**
 * Single ioredis connection shared across all BullMQ workers and queues in this
 * process.  BullMQ requires maxRetriesPerRequest: null.
 *
 * Cast to ConnectionOptions is needed due to a protected-member type mismatch
 * between ioredis@5 and BullMQ's ConnectionOptions union across pnpm's
 * deduplicated resolution. Runtime behaviour is unaffected.
 */
export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: redisUrl.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
}) as unknown as ConnectionOptions;

(connection as unknown as IORedis).on("error", (err) => {
  console.error("[worker-server] Redis error:", err.message);
});
