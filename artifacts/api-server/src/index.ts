import app from "./app";
import { logger } from "./lib/logger";
import { cleanupLocalTempFiles } from "./services/googleDrive";
import { startOtpCleanup } from "./lib/otp-cleanup";
import { scheduleMonthlyExport } from "./lib/monthly-export";
import { initBackupScheduler } from "./lib/backup-scheduler";
import { recordBootAndCheckCrashLoop } from "./lib/boot-tracker";
import { ensureVapidKeys } from "./lib/vapid";
import { initPush } from "./lib/push";
import { ensureEncryptionKey } from "./lib/encryption";
import { ensureJwtSecret } from "./lib/jwt";
import { initGeoipUpdater } from "./lib/geoip-updater";
import { db, settingsTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Ensure VAPID keys exist (loads from DB or auto-generates + persists) before
// initialising push so setVapidDetails is called with valid, stable keys.
await ensureEncryptionKey();
await ensureJwtSecret();
await ensureVapidKeys();
initPush();

// One-time backfill: if a user has ledger entries but ledger_balance is still 0
// (happens on first boot after the column was added to an existing database),
// recompute the total from the ledger table.  Gated by a settings flag so
// subsequent boots skip the UPDATE entirely instead of running it every time.
try {
  const [done] = await db
    .select({ value: settingsTable.value })
    .from(settingsTable)
    .where(eq(settingsTable.key, "ledgerBalanceBackfillDone"));

  if (!done) {
    const { rowCount } = await db.execute(sql`
      UPDATE users u
      SET ledger_balance = COALESCE(
        (SELECT SUM(COALESCE(credit::numeric, 0)) - SUM(COALESCE(debit::numeric, 0))
         FROM ledger WHERE created_by = u.id),
        0
      )
      WHERE ledger_balance = 0
        AND EXISTS (SELECT 1 FROM ledger WHERE created_by = u.id LIMIT 1)
    `);
    // Persist the flag so this never runs again, even if rowCount is 0.
    await db
      .insert(settingsTable)
      .values({ key: "ledgerBalanceBackfillDone", value: "1" })
      .onConflictDoNothing();
    if ((rowCount ?? 0) > 0) {
      logger.info({ rowCount }, "Backfilled ledger_balance for existing users");
    }
  }
} catch (err) {
  logger.warn({ err }, "ledger_balance backfill skipped (column may not exist yet)");
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  startOtpCleanup();
  scheduleMonthlyExport();
  initBackupScheduler();
  initGeoipUpdater();
  recordBootAndCheckCrashLoop();
  // Clean up local /tmp fallback files older than 24 h (runs every hour)
  setInterval(cleanupLocalTempFiles, 60 * 60 * 1000);
});
