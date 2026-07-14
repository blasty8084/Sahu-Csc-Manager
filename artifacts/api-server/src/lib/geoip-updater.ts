/**
 * geoip-updater.ts — keeps the bundled geoip-lite MaxMind database fresh.
 *
 * geoip-lite ships a static snapshot of the MaxMind GeoLite2 database at
 * install time; it never updates itself. Left alone, IP→country lookups
 * (used by geo-block.ts and /api/geo) silently drift stale — IP ranges get
 * reassigned between countries/ISPs over time, so both false "blocked
 * India" and false "allowed non-India" results creep in within weeks.
 *
 * A MaxMind license key is required to fetch fresh CSVs (free to obtain at
 * maxmind.com). Without MAXMIND_LICENSE_KEY set, updates are skipped and a
 * warning is logged — geo-blocking keeps working off the bundled snapshot,
 * it just won't get fresher.
 */

import cron, { type ScheduledTask } from "node-cron";
import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { promisify } from "node:util";
import geoip from "geoip-lite";
import { logger } from "./logger";

const execFileAsync = promisify(execFile);
const _require = createRequire(import.meta.url);

// Sunday 03:00 — low-traffic window, once a week (the underlying MaxMind
// GeoLite2 CSVs themselves are only republished a couple of times a month).
const CRON_EXPR = "0 3 * * 0";

let activeTask: ScheduledTask | null = null;

async function resolveUpdateDbScript(): Promise<string | null> {
  try {
    const geoipPkgPath = _require.resolve("geoip-lite/package.json");
    return path.resolve(path.dirname(geoipPkgPath), "scripts/updatedb.js");
  } catch (err) {
    logger.warn({ err }, "geoip-lite package not resolvable — skipping DB update");
    return null;
  }
}

export async function runGeoipUpdate(): Promise<void> {
  const licenseKey = process.env.MAXMIND_LICENSE_KEY;
  if (!licenseKey) {
    logger.warn(
      "MAXMIND_LICENSE_KEY not set — skipping geoip-lite database update " +
        "(geo-blocking still works off the bundled snapshot, but it will drift stale over time)",
    );
    return;
  }

  const scriptPath = await resolveUpdateDbScript();
  if (!scriptPath) return;

  try {
    logger.info("geoip-lite database update starting");
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [scriptPath, `license_key=${licenseKey}`],
      { timeout: 5 * 60 * 1000 },
    );
    if (stderr) logger.warn({ stderr }, "geoip-lite updatedb stderr output");
    logger.info({ stdout }, "geoip-lite database update finished");

    // Reload into memory without needing a full process restart.
    geoip.reloadDataSync();
    logger.info("geoip-lite in-memory database reloaded");
  } catch (err: any) {
    logger.error({ err: err?.message ?? err }, "geoip-lite database update failed");
  }
}

/** Schedules the weekly update and (if a license key is present) kicks off one now. */
export function initGeoipUpdater(): void {
  if (activeTask) activeTask.stop();

  activeTask = cron.schedule(CRON_EXPR, () => {
    void runGeoipUpdate();
  });
  logger.info({ expr: CRON_EXPR }, "geoip-lite update scheduler started");

  if (process.env.MAXMIND_LICENSE_KEY) {
    // Fire-and-forget on boot so a long-idle box doesn't run for weeks on a stale DB.
    void runGeoipUpdate();
  }
}
