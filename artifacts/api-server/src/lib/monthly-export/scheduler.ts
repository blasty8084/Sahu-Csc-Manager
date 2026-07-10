import cron from "node-cron";
import { logger } from "../logger";
import { sendMonthlyExportEmail } from "./email";

export function scheduleMonthlyExport(): void {
  // Runs at 00:05 on the 1st of every month.
  // node-cron handles long intervals correctly — no 32-bit setTimeout overflow.
  cron.schedule("5 0 1 * *", async () => {
    const now = new Date();
    // At 00:05 on the 1st, "last month" is now.getMonth() (0-indexed previous month)
    const currentMonth = now.getMonth(); // 0=Jan … 11=Dec; if it's March 1st this is 2
    const month = currentMonth === 0 ? 12 : currentMonth;       // 1-indexed previous month
    const exportYear = currentMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();

    logger.info({ exportYear, month }, "Monthly receipt export cron triggered");
    try {
      await sendMonthlyExportEmail(exportYear, month);
    } catch (err) {
      logger.error({ err }, "Monthly receipt export job failed");
    }
  });

  logger.info("Monthly receipt export scheduled (cron: 5 0 1 * *)");
}
