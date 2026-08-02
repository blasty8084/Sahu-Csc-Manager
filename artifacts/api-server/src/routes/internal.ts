/**
 * Internal routes — token-protected endpoints for external schedulers.
 *
 * These routes are NOT protected by admin session cookies. Instead they
 * require an `x-backup-token` header matching the BACKUP_TRIGGER_TOKEN
 * environment variable.
 *
 * Primary use-case: Render free tier spins the server down after 15 min of
 * inactivity, so node-cron never fires.  A free external cron service
 * (e.g. cron-job.org) can POST /api/internal/backup every hour; this
 * endpoint checks the stored schedule and runs the backup if it's due.
 *
 * Setup on Render:
 *  1. Set BACKUP_TRIGGER_TOKEN to any long random string in Render Secrets.
 *  2. Go to cron-job.org (free), create a job:
 *       URL:    https://<your-render-url>/api/internal/backup
 *       (The /api prefix is added by app.use("/api", router) in app.ts)
 *       Method: POST
 *       Header: x-backup-token: <your token>
 *       Schedule: every hour  (the endpoint checks whether backup is due)
 */

import { Router, type IRouter } from "express";
import { asyncHandler } from "../lib/async-handler";
import { runScheduledBackup } from "../lib/backup-scheduler";
import { getSchedule } from "../services/backupSchedule";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// ── POST /api/internal/backup ─────────────────────────────────────────────────
//
// Called by an external cron service every hour.
// Checks the user-configured schedule and runs the backup only when due.
//
router.post("/internal/backup", asyncHandler(async (req, res) => {
  // ── Auth: static token header ──────────────────────────────────────────────
  const token = process.env["BACKUP_TRIGGER_TOKEN"];
  if (!token) {
    // Token not configured → refuse all calls to prevent open access
    res.status(503).json({ error: "BACKUP_TRIGGER_TOKEN not configured on this server." });
    return;
  }
  const provided = req.headers["x-backup-token"];
  if (!provided || provided !== token) {
    res.status(401).json({ error: "Invalid or missing x-backup-token header." });
    return;
  }

  // ── Check schedule ─────────────────────────────────────────────────────────
  const schedule = await getSchedule();
  if (!schedule.enabled) {
    res.json({ skipped: true, reason: "Auto-backup is disabled in settings." });
    return;
  }

  // Convert current time to IST (UTC+5:30)
  const now = new Date();
  const istOffset = 5 * 60 + 30;
  const istDate = new Date(now.getTime() + istOffset * 60_000);
  const istHour = istDate.getUTCHours();
  const istMin  = istDate.getUTCMinutes();
  const istDay  = istDate.getUTCDay(); // 0=Sun

  const [cfgHour, cfgMin] = schedule.time.split(":").map(Number);

  // 55-minute window — safe for hourly UptimeRobot/cron-job.org calls
  const minutesDiff = Math.abs((istHour * 60 + istMin) - (cfgHour * 60 + cfgMin));
  const isCorrectTime = minutesDiff <= 55;

  const isCorrectDay =
    schedule.frequency === "daily" ||
    schedule.days.includes(istDay);

  if (!isCorrectTime || !isCorrectDay) {
    res.json({
      skipped: true,
      reason: `Not scheduled now. Configured: ${schedule.time} IST on days [${schedule.days.join(",")}]. Current IST: ${String(istHour).padStart(2,"0")}:${String(istMin).padStart(2,"0")} day=${istDay}.`,
    });
    return;
  }

  // ── Dedup: skip if backup already ran within last 60 minutes ───────────────
  try {
    const { db: dbInst, backupsTable: bt } = await import("@workspace/db");
    const { desc } = await import("drizzle-orm");
    const [lastBackup] = await dbInst
      .select({ createdAt: bt.createdAt })
      .from(bt)
      .orderBy(desc(bt.createdAt))
      .limit(1);
    if (lastBackup?.createdAt) {
      const lastTime = lastBackup.createdAt instanceof Date
        ? lastBackup.createdAt
        : new Date(lastBackup.createdAt as string);
      const msSinceLast = now.getTime() - lastTime.getTime();
      if (msSinceLast < 60 * 60 * 1000) {
        res.json({
          skipped: true,
          reason: `Backup already ran ${Math.round(msSinceLast / 60_000)} minutes ago. Skipping duplicate.`,
        });
        return;
      }
    }
  } catch {
    // If dedup check fails, proceed with backup anyway
  }

  // ── Run backup ─────────────────────────────────────────────────────────────
  logger.info({ trigger: "external-cron" }, "Internal backup trigger: running backup");
  runScheduledBackup().catch((err: Error) =>
    logger.error({ err }, "Internal backup trigger: backup failed"),
  );
  res.json({ started: true, message: "Backup started. Check notifications for result." });
}));

export default router;
