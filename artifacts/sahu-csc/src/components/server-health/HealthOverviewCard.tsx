/**
 * HealthOverviewCard
 *
 * Renders two sections:
 *   1. Overall status banner (status pill, response time, environment)
 *   2. API Server card (uptime, node, platform, PID, memory, CPU)
 */
import { Activity, Server, MemoryStick, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, StatCell } from "./HealthMetricCard";
import { formatBytes, formatUptime, type HealthData } from "./health-types";

interface Props {
  data: HealthData;
  t: (key: string) => string;
}

export function HealthOverviewCard({ data, t }: Props) {
  const overallColor =
    data.status === "ok" ? "text-green-600 dark:text-green-400" :
    data.status === "degraded" ? "text-amber-600 dark:text-amber-400" :
    "text-destructive";

  const overallBg =
    data.status === "ok" ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" :
    data.status === "degraded" ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" :
    "bg-destructive/10 border-destructive/30";

  return (
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

      {/* API Server Card */}
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
                sub={
                  data.server.memory.heapSizeLimitBytes
                    ? `of ${formatBytes(data.server.memory.heapSizeLimitBytes)} limit`
                    : `of ${formatBytes(data.server.memory.heapTotalBytes)}`
                }
              />
              <StatCell label="RSS" value={formatBytes(data.server.memory.rssBytes)} />
              <StatCell label="System Free" value={formatBytes(data.server.system.freeMemBytes)} />
              <StatCell label="System Total" value={formatBytes(data.server.system.totalMemBytes)} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              "Heap Used" is compared against the process's actual heap size limit (where V8 would crash with
              out-of-memory), not against currently-allocated heap — V8 normally runs near-full between GC
              cycles, so that ratio alone isn't a reliable danger signal.
            </p>
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
    </>
  );
}
