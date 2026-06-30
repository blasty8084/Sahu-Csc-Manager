import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Server, Database, Bell, RefreshCw, CheckCircle2,
  AlertTriangle, XCircle, Clock, Cpu, MemoryStick,
  Activity, Shield, Zap, Info, Table2,
} from "lucide-react";

interface HealthData {
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

interface DbTableStat {
  table: string;
  rowCount: number;
  lastEntry: string | null;
}

interface DbStats {
  tables: DbTableStat[];
  queriedAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function StatusBadge({ status }: { status: "ok" | "degraded" | "error" | "ephemeral" | "disabled" | string }) {
  const { t } = useTranslation();
  if (status === "ok") {
    return (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 gap-1">
        <CheckCircle2 size={11} /> {t("server_health.healthy")}
      </Badge>
    );
  }
  if (status === "degraded" || status === "ephemeral") {
    return (
      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 gap-1">
        <AlertTriangle size={11} /> {status === "ephemeral" ? t("server_health.ephemeral") : t("server_health.degraded")}
      </Badge>
    );
  }
  if (status === "disabled") {
    return (
      <Badge className="bg-muted text-muted-foreground gap-1">
        <Info size={11} /> {t("server_health.disabled")}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="gap-1">
      <XCircle size={11} /> {t("common.error")}
    </Badge>
  );
}

function StatCell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-muted/40 rounded-lg px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-sm mt-0.5">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export default function ServerHealth() {
  const { t } = useTranslation();
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [dbStatsLoading, setDbStatsLoading] = useState(false);
  const prevCounts = useRef<Record<string, number>>({});

  const fetchDbStats = useCallback(async () => {
    setDbStatsLoading(true);
    try {
      const res = await fetch("/api/admin/db-stats");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DbStats = await res.json();
      setDbStats((prev) => {
        if (prev) {
          const snapshot: Record<string, number> = {};
          prev.tables.forEach((t) => { snapshot[t.table] = t.rowCount; });
          prevCounts.current = snapshot;
        }
        return data;
      });
    } catch {
      setDbStats(null);
    } finally {
      setDbStatsLoading(false);
    }
  }, []);

  const fetchHealth = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/healthz");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastChecked(new Date());
    } catch (err: any) {
      setError(err?.message ?? "Failed to reach server");
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    fetchDbStats();
    const interval = setInterval(() => { fetchHealth(); fetchDbStats(); }, 30_000);
    return () => clearInterval(interval);
  }, [fetchHealth, fetchDbStats]);

  const overallColor =
    !data ? "text-muted-foreground" :
    data.status === "ok" ? "text-green-600 dark:text-green-400" :
    data.status === "degraded" ? "text-amber-600 dark:text-amber-400" :
    "text-destructive";

  const overallBg =
    !data ? "bg-muted/40" :
    data.status === "ok" ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" :
    data.status === "degraded" ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" :
    "bg-destructive/10 border-destructive/30";

  return (
    <Layout>
      <div className="space-y-5 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("server_health.title")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Live status of API server, database connection, and push notifications
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 flex-shrink-0"
            onClick={() => fetchHealth(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw size={13} className={(refreshing || loading) ? "animate-spin" : ""} />
            {refreshing ? t("server_health.checking") : t("server_health.refresh")}
          </Button>
        </div>

        {/* Last checked */}
        {lastChecked && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock size={11} />
            Last checked: {lastChecked.toLocaleTimeString("en-IN")} — auto-refreshes every 30s
          </p>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center gap-3 py-12 justify-center text-muted-foreground text-sm">
            <RefreshCw size={16} className="animate-spin" />
            Checking server health…
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <Card className="border-destructive/40">
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <XCircle size={36} className="text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">Cannot reach server</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!loading && data && (
          <>
            {/* Overall Status Banner */}
            <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${overallBg}`}>
              <div className="flex items-center gap-2.5">
                <Activity size={16} className={overallColor} />
                <div>
                  <p className={`font-semibold text-sm ${overallColor}`}>
                    {data.status === "ok" ? t("server_health.all_ok") :
                     data.status === "degraded" ? t("server_health.some_degraded") :
                     t("server_health.error_detected")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Response time: {data.responseTimeMs} ms · Environment: {data.environment}
                  </p>
                </div>
              </div>
              <StatusBadge status={data.status} />
            </div>

            {/* API Server */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Server size={16} className="text-primary" />
                    {t("server_health.api_server")}
                  </CardTitle>
                  <StatusBadge status={data.server.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCell label="Uptime" value={formatUptime(data.server.uptime)} />
                  <StatCell label="Node.js" value={data.server.nodeVersion} />
                  <StatCell label="Platform" value={data.server.platform} />
                  <StatCell label="Process ID" value={String(data.server.pid)} />
                </div>

                {/* Memory */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <MemoryStick size={12} /> {t("server_health.memory")}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCell
                      label="Heap Used"
                      value={formatBytes(data.server.memory.heapUsedBytes)}
                      sub={`of ${formatBytes(data.server.memory.heapTotalBytes)}`}
                    />
                    <StatCell label="RSS" value={formatBytes(data.server.memory.rssBytes)} />
                    <StatCell label="System Free" value={formatBytes(data.server.system.freeMemBytes)} />
                    <StatCell label="System Total" value={formatBytes(data.server.system.totalMemBytes)} />
                  </div>
                </div>

                {/* CPU */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Cpu size={12} /> CPU
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <StatCell label="CPU Cores" value={String(data.server.system.cpus)} />
                    <StatCell label="Load (1m)" value={data.server.system.loadAvg[0]?.toFixed(2) ?? "—"} />
                    <StatCell label="Load (5m)" value={data.server.system.loadAvg[1]?.toFixed(2) ?? "—"} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database size={16} className="text-primary" />
                    {t("server_health.database")}
                  </CardTitle>
                  <StatusBadge status={data.database.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatCell
                    label="Connection"
                    value={data.database.status === "ok" ? "Connected" : "Failed"}
                  />
                  <StatCell
                    label="Query Latency"
                    value={data.database.latencyMs !== null ? `${data.database.latencyMs} ms` : "—"}
                  />
                  <StatCell
                    label="Version"
                    value={data.database.version ?? "Unknown"}
                  />
                </div>

                {data.database.status === "ok" && (
                  <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2 text-xs text-green-700 dark:text-green-400">
                    <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0" />
                    Database is reachable and responding normally
                  </div>
                )}
                {data.database.status === "error" && (
                  <div className="flex items-start gap-2 bg-destructive/10 rounded-lg px-3 py-2 text-xs text-destructive">
                    <XCircle size={13} className="mt-0.5 flex-shrink-0" />
                    {data.database.error ?? "Database connection failed"}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* VAPID / Push */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell size={16} className="text-primary" />
                    {t("server_health.push")}
                  </CardTitle>
                  <StatusBadge status={data.vapid.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatCell
                    label="Public Key"
                    value={data.vapid.publicKeySet ? "Set" : "Missing"}
                  />
                  <StatCell
                    label="Private Key"
                    value={data.vapid.privateKeySet ? "Set" : "Missing"}
                  />
                  <StatCell label="Contact Email" value={data.vapid.email.replace("mailto:", "")} />
                </div>

                {data.vapid.status === "ok" && (
                  <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2 text-xs text-green-700 dark:text-green-400">
                    <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0" />
                    VAPID keys are persistent — push subscriptions will survive server restarts
                  </div>
                )}
                {data.vapid.status === "ephemeral" && (
                  <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                    <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
                    Keys were auto-generated at startup and will be lost on restart. Set{" "}
                    <strong>VAPID_PUBLIC_KEY</strong> and <strong>VAPID_PRIVATE_KEY</strong> as Replit
                    Secrets for persistent push notifications.
                  </div>
                )}
                {data.vapid.status === "disabled" && (
                  <div className="flex items-start gap-2 bg-muted rounded-lg px-3 py-2 text-xs text-muted-foreground">
                    <Info size={13} className="mt-0.5 flex-shrink-0" />
                    Push notifications are not configured. Set VAPID keys in Replit Secrets to enable them.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Database Table Stats — admin only */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Table2 size={16} className="text-primary" />
                    Database Tables
                  </CardTitle>
                  {dbStatsLoading && <RefreshCw size={13} className="animate-spin text-muted-foreground" />}
                </div>
              </CardHeader>
              <CardContent>
                {dbStats ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground">Table</th>
                          <th className="text-right py-2 pr-4 text-xs font-medium text-muted-foreground">Rows</th>
                          <th className="text-center py-2 pr-4 text-xs font-medium text-muted-foreground">Trend</th>
                          <th className="text-right py-2 text-xs font-medium text-muted-foreground">Last Entry</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dbStats.tables.map((row) => {
                          const prev = prevCounts.current[row.table];
                          const hasPrev = prev !== undefined;
                          const delta = hasPrev ? row.rowCount - prev : 0;
                          return (
                            <tr key={row.table} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                              <td className="py-2 pr-4 font-mono text-xs text-foreground">{row.table}</td>
                              <td className="py-2 pr-4 text-right">
                                <span className={`font-semibold tabular-nums text-xs ${row.rowCount === 0 ? "text-muted-foreground" : "text-foreground"}`}>
                                  {row.rowCount.toLocaleString("en-IN")}
                                </span>
                              </td>
                              <td className="py-2 pr-4 text-center">
                                {!hasPrev ? (
                                  <span className="text-xs text-muted-foreground">—</span>
                                ) : delta > 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-green-600 dark:text-green-400">
                                    ↑ <span className="tabular-nums">+{delta}</span>
                                  </span>
                                ) : delta < 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-500 dark:text-red-400">
                                    ↓ <span className="tabular-nums">{delta}</span>
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">→</span>
                                )}
                              </td>
                              <td className="py-2 text-right text-xs text-muted-foreground">
                                {row.lastEntry
                                  ? new Date(row.lastEntry).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
                                  : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <p className="text-xs text-muted-foreground mt-3 text-right">
                      Queried at {new Date(dbStats.queriedAt).toLocaleTimeString("en-IN")}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {dbStatsLoading ? "Loading table stats…" : "Could not load table stats"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap size={16} className="text-primary" />
                  {t("server_health.quick_fixes")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Shield size={13} className="mt-0.5 flex-shrink-0 text-primary" />
                    <span>
                      <strong className="text-foreground">DB error?</strong> Run{" "}
                      <code className="bg-muted px-1 rounded text-xs">pnpm --filter @workspace/db run push</code>{" "}
                      then restart the <em>Seed Database</em> workflow.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield size={13} className="mt-0.5 flex-shrink-0 text-primary" />
                    <span>
                      <strong className="text-foreground">VAPID ephemeral?</strong> Set{" "}
                      <code className="bg-muted px-1 rounded text-xs">VAPID_PUBLIC_KEY</code> and{" "}
                      <code className="bg-muted px-1 rounded text-xs">VAPID_PRIVATE_KEY</code> in{" "}
                      Replit Secrets (🔒 Secrets tab).
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield size={13} className="mt-0.5 flex-shrink-0 text-primary" />
                    <span>
                      <strong className="text-foreground">High memory?</strong> Restart the{" "}
                      <em>Start application</em> workflow — Replit containers occasionally need a refresh.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield size={13} className="mt-0.5 flex-shrink-0 text-primary" />
                    <span>
                      <strong className="text-foreground">Port conflict?</strong> Run{" "}
                      <code className="bg-muted px-1 rounded text-xs">fuser -k 5000/tcp; fuser -k 8080/tcp</code>{" "}
                      in the Shell, then restart the workflow.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
