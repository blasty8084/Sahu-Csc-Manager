import { db, settingsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { applySchedule, type BackupScheduleConfig } from "../lib/backup-scheduler";

export interface BackupScheduleInput {
  enabled: boolean;
  frequency: string;
  time: string;
  days: number[];
  retention: number;
}

// ── get — read current schedule from settings table ───────────────────────────
export async function getSchedule() {
  const rows = await db.select().from(settingsTable);
  const s: Record<string, string> = {};
  for (const r of rows) s[r.key] = r.value;
  return {
    enabled: s["backupEnabled"] === "true",
    frequency: s["backupFrequency"] ?? "daily",
    time: s["backupTime"] ?? "02:00",
    days: s["backupDays"] ? s["backupDays"].split(",").map(Number) : [1],
    retention: parseInt(s["backupRetention"] ?? "7", 10),
  };
}

// ── save — persist to DB + activate cron ─────────────────────────────────────
export async function saveSchedule(input: BackupScheduleInput): Promise<BackupScheduleConfig> {
  const { enabled, frequency, time, days, retention } = input;
  const toSave: Record<string, string> = {
    backupEnabled: String(enabled),
    backupFrequency: frequency,
    backupTime: time,
    backupDays: days.join(","),
    backupRetention: String(Math.max(1, Math.min(90, retention))),
  };
  await db
    .insert(settingsTable)
    .values(Object.entries(toSave).map(([key, value]) => ({ key, value })))
    .onConflictDoUpdate({ target: settingsTable.key, set: { value: sql`excluded.value` } });
  const cfg: BackupScheduleConfig = {
    enabled: Boolean(enabled),
    frequency: frequency as BackupScheduleConfig["frequency"],
    time,
    days,
    retention: Math.max(1, Math.min(90, retention)),
  };
  applySchedule(cfg);
  return cfg;
}
