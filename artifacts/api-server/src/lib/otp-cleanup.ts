import { db, emailOtpsTable } from "@workspace/db";
import { lt, or, and, isNotNull, sql } from "drizzle-orm";
import { logger } from "./logger";

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
const GRACE_PERIOD_MS = 60 * 60 * 1000;

async function runCleanup(): Promise<void> {
  try {
    const graceCutoff = new Date(Date.now() - GRACE_PERIOD_MS);

    const deleted = await db
      .delete(emailOtpsTable)
      .where(
        or(
          isNotNull(emailOtpsTable.usedAt),
          lt(emailOtpsTable.expiresAt, graceCutoff)
        )
      )
      .returning({ id: emailOtpsTable.id });

    if (deleted.length > 0) {
      logger.info({ count: deleted.length }, "OTP cleanup: removed expired/used rows");
    }
  } catch (err) {
    logger.error({ err }, "OTP cleanup job failed");
  }
}

export function startOtpCleanup(): void {
  runCleanup();
  setInterval(runCleanup, CLEANUP_INTERVAL_MS);
  logger.info("OTP cleanup job scheduled (runs every 1 hour)");
}
