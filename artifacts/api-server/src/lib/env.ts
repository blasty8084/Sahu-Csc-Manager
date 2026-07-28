/**
 * Central environment validation — imported first in index.ts.
 *
 * The process exits immediately with a clear, grouped list of missing
 * variables rather than failing silently deep inside a module at runtime.
 * Add any new required variable here; optional ones stay in process.env.
 */

const REQUIRED: [key: string, description: string][] = [
  ["SESSION_SECRET", "Session signing secret (long random string)"],
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
  SESSION_SECRET: process.env["SESSION_SECRET"]!,
} as const;
