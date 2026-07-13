import app from "./app";
import { logger } from "./lib/logger";
import { startOtpCleanup } from "./lib/otp-cleanup";
import { scheduleMonthlyExport } from "./lib/monthly-export";
import { initBackupScheduler } from "./lib/backup-scheduler";
import { recordBootAndCheckCrashLoop } from "./lib/boot-tracker";
import { ensureVapidKeys } from "./lib/vapid";
import { initPush } from "./lib/push";
import { ensureEncryptionKey } from "./lib/encryption";
import { ensureJwtSecret } from "./lib/jwt";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

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
// recompute the total from the ledger table.  Safe to run on every boot — the
// WHERE clause limits it to users who actually need it.
try {
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
  if ((rowCount ?? 0) > 0) {
    logger.info({ rowCount }, "Backfilled ledger_balance for existing users");
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
  recordBootAndCheckCrashLoop();
});
