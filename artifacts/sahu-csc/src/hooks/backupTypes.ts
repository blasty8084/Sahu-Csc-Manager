// Shared types, constants, and pure formatters used across backup hooks.

export interface TableInfo { name: string; label: string; rowCount: number; }
export type ImportStep = "idle" | "analyzing" | "select" | "importing" | "done";
export interface ScheduleConfig {
  enabled: boolean;
  frequency: "daily" | "weekly" | "custom";
  time: string;
  days: number[];
  retention: number;
}

export const DAYS = [
  { value: 0, label: "Sun" }, { value: 1, label: "Mon" }, { value: 2, label: "Tue" },
  { value: 3, label: "Wed" }, { value: 4, label: "Thu" }, { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export const DEFAULT_SCHEDULE: ScheduleConfig = {
  enabled: false, frequency: "daily", time: "02:00", days: [1], retention: 7,
};

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function relativeTime(date: string | Date): string {
  const diff  = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  <  1) return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  <  7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function parseBackupMeta(filename: string): { label: string; type: "auto" | "manual" } {
  const isAuto = filename.startsWith("auto_backup_");
  const raw    = filename.replace(/^(auto_backup_|backup_)/, "").replace(/\.sql$/, "");
  const iso    = raw.replace(/T(\d{2})-(\d{2})-(\d{2})-\d+Z$/, "T$1:$2:$3Z");
  const d      = new Date(iso);
  const label  = isNaN(d.getTime())
    ? filename
    : d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
  return { label, type: isAuto ? "auto" : "manual" };
}
