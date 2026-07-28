import { logger } from "../logger";

/**
 * Monthly receipt export email — SMTP removed, this is a no-op.
 * The ZIP is still built and stored locally; emails are simply not sent.
 */
export async function sendMonthlyExportEmail(year: number, month: number): Promise<void> {
  logger.info({ year, month }, "Monthly receipt export: email sending disabled (SMTP removed)");
}
