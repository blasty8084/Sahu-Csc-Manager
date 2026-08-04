/**
 * Central environment validation — imported first in index.ts.
 *
 * The process exits immediately with a clear, grouped list of missing
 * variables rather than failing silently deep inside a module at runtime.
 * Add any new required variable here; optional ones stay in process.env.
 */

// Force Node.js DNS resolver to prefer IPv4 addresses process-wide.
// Render's DNS can sometimes resolve hostnames to IPv6 addresses that
// Render cannot route outbound. Setting ipv4first guarantees all DNS
// lookups return IPv4 first.
import { setDefaultResultOrder } from "node:dns";
setDefaultResultOrder("ipv4first");

const REQUIRED: [key: string, description: string][] = [
  ["SESSION_SECRET", "Session signing secret (long random string)"],
];

// Soft-warn for optional but strongly recommended vars
const RECOMMENDED: [key: string, description: string][] = [
  ["NEON_DATABASE_URL",      "Neon PostgreSQL connection string (falls back to DATABASE_URL)"],
  ["B2_KEY_ID",              "Backblaze B2 key ID for file storage"],
  ["RESEND_API_KEY",         "Resend API key for sending emails (OTP, approvals, broadcasts)"],
  ["UPSTASH_REDIS_REST_URL", "Upstash Redis REST URL for shared cache"],
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
      "Set them in Render / Vercel / Replit environment variables, then restart.",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

const missingRec = RECOMMENDED.filter(([key]) => !process.env[key]?.trim());
if (missingRec.length > 0) {
  console.warn(
    [
      "",
      `⚠️  Optional services not configured (${missingRec.length}):`,
      ...missingRec.map(([key, desc]) => `  • ${key}  —  ${desc}`),
      "",
    ].join("\n"),
  );
}

// Warn if RESEND_API_KEY is set but RESEND_FROM is missing or still points at
// the Resend sandbox address — sandbox mode can only deliver to the account
// owner's own verified email and 403s on every real recipient.
const resendKey = process.env["RESEND_API_KEY"];
const resendFrom = process.env["RESEND_FROM"];

if (resendKey && (!resendFrom || resendFrom.includes("onboarding@resend.dev"))) {
  console.warn(
    [
      "",
      "⚠️  RESEND_API_KEY is set but RESEND_FROM is missing or still points",
      "    at the Resend sandbox address (onboarding@resend.dev).",
      "    Sandbox mode can only deliver to your own Resend account email —",
      "    every real send will fail with a 403 until RESEND_FROM is set to",
      '    a verified domain address, e.g. "SAHU CSC <info@sahucsc.dpdns.org>".',
      "",
    ].join("\n"),
  );
}

/** Required environment variables (non-nullable). */
export const env = {
  SESSION_SECRET: process.env["SESSION_SECRET"]!,
} as const;
