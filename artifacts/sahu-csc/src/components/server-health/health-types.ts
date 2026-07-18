// ── Shared types & pure utilities for the Server Health page ─────────────────

export interface HealthData {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  responseTimeMs: number;
  server: {
    status: string;
    uptime: number;
    nodeVersion: string;
    platform: string;
    pid: number;
    memory: {
      rssBytes: number;
      heapUsedBytes: number;
      heapTotalBytes: number;
      heapSizeLimitBytes?: number;
      externalBytes: number;
    };
    system: {
      totalMemBytes: number;
      freeMemBytes: number;
      cpus: number;
      loadAvg: number[];
    };
  };
  database: {
    status: "ok" | "error";
    latencyMs: number | null;
    version?: string;
    error?: string;
  };
  vapid: {
    status: "ok" | "ephemeral" | "disabled";
    persistent: boolean;
    publicKeySet: boolean;
    privateKeySet: boolean;
    email: string;
  };
  environment: string;
}

export interface DbTableStat {
  table: string;
  rowCount: number;
  lastEntry: string | null;
}

export interface DbStats {
  tables: DbTableStat[];
  queriedAt: string;
}

export interface AuditEntry {
  id: number;
  userId: number;
  username: string | null;
  action: string;
  details: string | null;
  ipAddress: string;
  createdAt: string;
}

export interface AuditRecent {
  logs: AuditEntry[];
  queriedAt: string;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
