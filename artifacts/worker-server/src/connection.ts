import IORedis from "ioredis";

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
 */
export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  // TLS is implied by the rediss:// scheme; ioredis handles it automatically.
  tls: redisUrl.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
});

connection.on("error", (err) => {
  console.error("[worker-server] Redis error:", err.message);
});
