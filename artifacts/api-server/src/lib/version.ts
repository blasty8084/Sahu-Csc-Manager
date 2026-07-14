import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Reads the running app's version from package.json, the same way the
 * frontend derives __APP_VERSION__ at build time (see sahu-csc/vite.config.ts).
 *
 * At runtime the bundled entrypoint lives at artifacts/api-server/dist/index.mjs,
 * so package.json is one directory up from the bundle.
 */
let cachedVersion: string | undefined;

export function getAppVersion(): string {
  if (cachedVersion) return cachedVersion;
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    // here = .../dist  (bundled) or .../src/lib (unbundled/tsx) — package.json
    // is one level up from dist, two levels up from src/lib.
    const candidates = [
      path.resolve(here, "../package.json"),
      path.resolve(here, "../../package.json"),
    ];
    for (const p of candidates) {
      try {
        const pkg = JSON.parse(readFileSync(p, "utf-8"));
        if (pkg?.version) {
          cachedVersion = pkg.version;
          return cachedVersion!;
        }
      } catch {
        // try next candidate
      }
    }
  } catch {
    // fall through to default below
  }
  cachedVersion = "0.0.0";
  return cachedVersion;
}
