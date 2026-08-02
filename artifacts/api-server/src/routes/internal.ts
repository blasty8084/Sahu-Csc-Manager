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
router.post("/api/internal/backup", asyncHandler(async (req, res) => {
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

  // Check if current time (IST) matches configured day + hour
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5 * 60 + 30; // minutes
  const istDate = new Date(now.getTime() + istOffset * 60_000);
  const istHour = istDate.getUTCHours();
  const istMin  = istDate.getUTCMinutes();
  const istDay  = istDate.getUTCDay(); // 0=Sun

  const [cfgHour, cfgMin] = schedule.time.split(":").map(Number);

  // Allow a 30-minute window around the configured time so a job that runs
  // every hour doesn't miss the target if it fires slightly early or late.
  const minutesDiff = Math.abs((istHour * 60 + istMin) - (cfgHour * 60 + cfgMin));
  const isCorrectTime = minutesDiff <= 30;

  // For weekly/custom: check if today is a configured day
  const isCorrectDay =
    schedule.frequency === "daily" ||
    schedule.days.includes(istDay);

  if (!isCorrectTime || !isCorrectDay) {
    res.json({
      skipped: true,
      reason: `Not scheduled now. Configured: ${schedule.time} IST on days ${schedule.days.join(",")}. Current IST: ${String(istHour).padStart(2,"0")}:${String(istMin).padStart(2,"0")} day=${istDay}.`,
    });
    return;
  }

  // ── Run backup ─────────────────────────────────────────────────────────────
  logger.info({ trigger: "external-cron" }, "Internal backup trigger: running backup");
  // Fire and forget — respond immediately so the cron service doesn't time out
  runScheduledBackup().catch((err: Error) =>
    logger.error({ err }, "Internal backup trigger: backup failed"),
  );

  res.json({ started: true, message: "Backup started. Check notifications for result." });
}));

export default router;
