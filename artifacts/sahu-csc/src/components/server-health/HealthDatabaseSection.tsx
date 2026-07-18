/**
 * HealthDatabaseSection
 *
 * Renders two cards:
 *   1. Database connection card (latency, version, status message)
 *   2. Database Table Stats card (row counts, delta trends, last entry)
 */
import { useRef } from "react";
import { Database, Table2, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, StatCell } from "./HealthMetricCard";
import type { HealthData, DbStats } from "./health-types";

interface Props {
  data: HealthData;
  dbStats: DbStats | null;
  dbStatsLoading: boolean;
  prevCounts: React.MutableRefObject<Record<string, number>>;
}

export function HealthDatabaseSection({ data, dbStats, dbStatsLoading, prevCounts }: Props) {
  return (
    <>
      {/* Database connection card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Database size={16} className="text-primary" />
              Database
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
            <StatCell label="Version" value={data.database.version ?? "Unknown"} />
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

      {/* Database Table Stats card */}
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
    </>
  );
}
