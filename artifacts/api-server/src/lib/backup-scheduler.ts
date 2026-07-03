import cron, { ScheduledTask } from "node-cron";
import { execSync } from "child_process";
import { mkdirSync, statSync, readdirSync, unlinkSync } from "fs";
import path from "path";
import { db, backupsTable } from "@workspace/db";
import { asc } from "drizzle-orm";
import { logger } from "./logger";
import { createNotification } from "./notify";

const BACKUP_DIR = path.resolve(process.cwd(), "backups");

let activeTask: ScheduledTask | null = null;

export interface BackupScheduleConfig {
  enabled: boolean;
  frequency: "daily" | "weekly" | "custom";
  time: string;        // "HH:MM" 24h
  days: number[];      // 0=Sun … 6=Sat; used for weekly (1 day) and custom (multi-day)
  retention: number;   // max backups to keep (0 = unlimited)
}

export const DEFAULT_SCHEDULE: BackupScheduleConfig = {
  enabled: false,
  frequency: "daily",
  time: "02:00",
  days: [0],
  retention: 7,
};

function buildCronExpr(cfg: BackupScheduleConfig): string {
  const [hh, mm] = cfg.time.split(":").map(Number);
  const hour = isNaN(hh) ? 2 : hh;
  const min  = isNaN(mm) ? 0 : mm;

  if (cfg.frequency === "daily") {
    return `${min} ${hour} * * *`;
  }
  // weekly or custom — use the days array
  const dayList = cfg.days.length ? cfg.days.join(",") : "0";
  return `${min} ${hour} * * ${dayList}`;
}

async function runBackup(): Promise<void> {
  const dbUrl = process.env["DATABASE_URL"];
  if (!dbUrl) { logger.error("Auto-backup: DATABASE_URL not set"); return; }

  try {
    mkdirSync(BACKUP_DIR, { recursive: true });
    const filename = `auto_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);

    execSync(`pg_dump "${dbUrl}" -f "${filepath}"`, { stdio: "pipe" });
    const size = statSync(filepath).size;

    await db.insert(backupsTable).values({ filename, size });
    logger.info({ filename, size }, "Auto-backup created");
    await createNotification(
      "Auto-Backup Created",
      `Scheduled backup "${filename}" completed successfully.`,
      "success",
      null as any,
    );
  } catch (err: any) {
    logger.error({ err }, "Auto-backup failed");
    await createNotification(
      "Auto-Backup Failed",
      `Scheduled backup failed: ${err.message}`,
      "error",
      null as any,
    ).catch(() => {});
  }
}

async function trimOldBackups(retention: number): Promise<void> {
  if (retention <= 0) return;
  try {
    const all = await db.select().from(backupsTable).orderBy(asc(backupsTable.createdAt));
    const toDelete = all.slice(0, Math.max(0, all.length - retention));
    for (const bk of toDelete) {
      const fp = path.join(BACKUP_DIR, bk.filename);
      try { unlinkSync(fp); } catch {}
      await db.delete(backupsTable).where(
        (await import("drizzle-orm")).eq(backupsTable.id, bk.id)
      );
      logger.info({ filename: bk.filename }, "Old backup trimmed");
    }
  } catch (err: any) {
    logger.warn({ err }, "Trim old backups failed");
  }
}

export function applySchedule(cfg: BackupScheduleConfig): void {
  if (activeTask) {
    activeTask.stop();
    activeTask = null;
    logger.info("Auto-backup scheduler stopped");
  }

  if (!cfg.enabled) {
    logger.info("Auto-backup disabled");
    return;
  }

  const expr = buildCronExpr(cfg);
  if (!cron.validate(expr)) {
    logger.error({ expr }, "Invalid cron expression — auto-backup not started");
    return;
  }

  activeTask = cron.schedule(expr, async () => {
    logger.info({ expr }, "Auto-backup triggered");
    await runBackup();
    await trimOldBackups(cfg.retention);
  });

  logger.info({ expr, frequency: cfg.frequency, time: cfg.time, days: cfg.days, retention: cfg.retention },
    "Auto-backup scheduler started");
}

export async function initBackupScheduler(): Promise<void> {
  try {
    const rows = await db.select().from(
      (await import("@workspace/db")).settingsTable
    );
    const s: Record<string, string> = {};
    for (const r of rows) s[r.key] = r.value;

    const cfg: BackupScheduleConfig = {
      enabled: s["backupEnabled"] === "true",
      frequency: (s["backupFrequency"] as BackupScheduleConfig["frequency"]) ?? "daily",
      time: s["backupTime"] ?? "02:00",
      days: s["backupDays"] ? s["backupDays"].split(",").map(Number) : [0],
      retention: parseInt(s["backupRetention"] ?? "7", 10),
    };

    applySchedule(cfg);
  } catch (err: any) {
    logger.error({ err }, "Failed to init backup scheduler");
  }
}
