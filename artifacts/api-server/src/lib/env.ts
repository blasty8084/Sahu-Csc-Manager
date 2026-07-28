/**
 * Central environment validation — imported first in index.ts.
 *
 * The process exits immediately with a clear, grouped list of missing
 * variables rather than failing silently deep inside a module at runtime.
 * Add any new required variable here; optional ones stay in process.env.
 */

const REQUIRED: [key: string, description: string][] = [
  ["SESSION_SECRET",           "Session signing secret (long random string)"],
  // ── Redis / Upstash ───────────────────────────────────────────────────────
  ["REDIS_URL",                "Upstash Redis TCP URL  — rediss://... (Dashboard → Connect → ioredis)"],
  ["UPSTASH_REDIS_REST_URL",   "Upstash Redis REST URL — https://...  (Dashboard → Connect → @upstash/redis)"],
  ["UPSTASH_REDIS_REST_TOKEN", "Upstash Redis REST token"],
  // ── Backblaze B2 ─────────────────────────────────────────────────────────
  ["B2_KEY_ID",                "Backblaze B2 key ID"],
  ["B2_APP_KEY",               "Backblaze B2 application key"],
  ["B2_BUCKET_NAME",           "Backblaze B2 bucket name"],
  ["B2_BUCKET_ENDPOINT",       "Backblaze B2 S3-compatible endpoint (e.g. s3.us-west-004.backblazeb2.com)"],
];

const missing = REQUIRED
  .filter(([key]) => !process.env[key]?.trim())
  .map(([key, desc]) => `  • ${key}  —  ${desc}`);

if (missing.length > 0) {
  console.error(
    [
      "",
      `❌  STARTUP FAILED — ${missing.length} required environment variable${missing.length === 1 ? " is" : "s are"} not set:`,
      "",
      ...missing,
      "",
      "Set them in Replit Secrets / Render Environment Variables, then restart.",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

/** All required environment variables, typed non-nullable. */
export const env = {
  SESSION_SECRET:           process.env["SESSION_SECRET"]!,
  REDIS_URL:                process.env["REDIS_URL"]!,
  UPSTASH_REDIS_REST_URL:   process.env["UPSTASH_REDIS_REST_URL"]!,
  UPSTASH_REDIS_REST_TOKEN: process.env["UPSTASH_REDIS_REST_TOKEN"]!,
  B2_KEY_ID:                process.env["B2_KEY_ID"]!,
  B2_APP_KEY:               process.env["B2_APP_KEY"]!,
  B2_BUCKET_NAME:           process.env["B2_BUCKET_NAME"]!,
  B2_BUCKET_ENDPOINT:       process.env["B2_BUCKET_ENDPOINT"]!,
} as const;
