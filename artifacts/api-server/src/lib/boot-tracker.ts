import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const BOOT_LOG_KEY = "__server_boot_log";
const CRASH_LOOP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const CRASH_LOOP_THRESHOLD = 3; // 3+ boots within the window looks like a restart loop
const MAX_ENTRIES = 10;

let recentBootCount = 0;
let lastBootAt: number = Date.now();

/**
 * Records this process boot in the settings table and computes how many
 * boots have happened in the last CRASH_LOOP_WINDOW_MS. A high count usually
 * means something external is killing/restarting the server repeatedly —
 * e.g. a port conflict from a duplicate workflow, or a crash loop.
 *
 * Best-effort: any DB error here must never block server startup.
 */
export async function recordBootAndCheckCrashLoop(): Promise<void> {
  lastBootAt = Date.now();
  try {
    const existing = await db
      .select()
      .from(settingsTable)
      .where(eq(settingsTable.key, BOOT_LOG_KEY))
      .limit(1);

    const now = Date.now();
    let history: number[] = [];
    if (existing.length > 0) {
      try {
        history = JSON.parse(existing[0].value);
        if (!Array.isArray(history)) history = [];
      } catch {
        history = [];
      }
    }

    history.push(now);
    history = history.slice(-MAX_ENTRIES);

    recentBootCount = history.filter((t) => now - t < CRASH_LOOP_WINDOW_MS).length;

    if (existing.length > 0) {
      await db
        .update(settingsTable)
        .set({ value: JSON.stringify(history) })
        .where(eq(settingsTable.key, BOOT_LOG_KEY));
    } else {
      await db.insert(settingsTable).values({ key: BOOT_LOG_KEY, value: JSON.stringify(history) });
    }

    if (recentBootCount >= CRASH_LOOP_THRESHOLD) {
      logger.warn(
        { recentBootCount, windowMs: CRASH_LOOP_WINDOW_MS },
        "Possible crash loop / port conflict detected: server has restarted multiple times in a short window",
      );
    }
  } catch (err) {
    logger.error({ err }, "Failed to record server boot (non-fatal)");
  }
}

export function getBootHealth() {
  return {
    recentBootCount,
    crashLoopSuspected: recentBootCount >= CRASH_LOOP_THRESHOLD,
    uptimeSinceThisBootMs: Date.now() - lastBootAt,
  };
}
