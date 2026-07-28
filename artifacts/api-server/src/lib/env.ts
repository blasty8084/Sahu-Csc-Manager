/**
 * Central environment validation — imported first in index.ts.
 *
 * The process exits immediately with a clear, grouped list of missing
 * variables rather than failing silently deep inside a module at runtime.
 * Add any new required variable here; optional ones stay in process.env.
 */

const REQUIRED: [key: string, description: string][] = [
  ["SESSION_SECRET",           "Session signing secret (long random string)"],
  // ── Redis / Upstash and Backblaze B2 are optional; the server falls back
  //    to in-memory cache and local storage respectively when absent.
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

/** Required environment variables (non-nullable). */
export const env = {
  SESSION_SECRET:           process.env["SESSION_SECRET"]!,
  // Optional — fall back to in-memory / local storage when absent
  REDIS_URL:                process.env["REDIS_URL"],
  UPSTASH_REDIS_REST_URL:   process.env["UPSTASH_REDIS_REST_URL"],
  UPSTASH_REDIS_REST_TOKEN: process.env["UPSTASH_REDIS_REST_TOKEN"],
  B2_KEY_ID:                process.env["B2_KEY_ID"],
  B2_APP_KEY:               process.env["B2_APP_KEY"],
  B2_BUCKET_NAME:           process.env["B2_BUCKET_NAME"],
  B2_BUCKET_ENDPOINT:       process.env["B2_BUCKET_ENDPOINT"],
} as const;
