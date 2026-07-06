import app from "./app";
import { logger } from "./lib/logger";
import { startOtpCleanup } from "./lib/otp-cleanup";
import { scheduleMonthlyExport } from "./lib/monthly-export";
import { initBackupScheduler } from "./lib/backup-scheduler";
import { recordBootAndCheckCrashLoop } from "./lib/boot-tracker";
import { ensureVapidKeys } from "./lib/vapid";
import { initPush } from "./lib/push";
import { ensureEncryptionKey } from "./lib/encryption";

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
await ensureVapidKeys();
initPush();

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
