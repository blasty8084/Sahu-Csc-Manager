import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Clock, XCircle } from "lucide-react";

import { DevicePerformanceCard } from "@/components/server-health/HealthMetricCard";
import { HealthOverviewCard } from "@/components/server-health/HealthOverviewCard";
import { HealthDatabaseSection } from "@/components/server-health/HealthDatabaseSection";
import { HealthTimelineChart } from "@/components/server-health/HealthTimelineChart";
import { HealthAlertList } from "@/components/server-health/HealthAlertList";
import type { HealthData, DbStats, AuditRecent } from "@/components/server-health/health-types";

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
  const [auditRecent, setAuditRecent] = useState<AuditRecent | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);

  const fetchDbStats = useCallback(async () => {
    setDbStatsLoading(true);
    try {
      const res = await fetch("/api/admin/db-stats");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: DbStats = await res.json();
      setDbStats((prev) => {
        if (prev) {
          const snapshot: Record<string, number> = {};
          prev.tables.forEach((t) => { snapshot[t.table] = t.rowCount; });
          prevCounts.current = snapshot;
        }
        return json;
      });
    } catch { setDbStats(null); }
    finally { setDbStatsLoading(false); }
  }, []);

  const fetchAuditRecent = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await fetch("/api/admin/audit-recent?limit=25");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AuditRecent = await res.json();
      setAuditRecent(json);
    } catch { setAuditRecent(null); }
    finally { setAuditLoading(false); }
  }, []);

  const fetchHealth = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/healthz");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setLastChecked(new Date());
    } catch (err: any) {
      setError(err?.message ?? "Failed to reach server");
      setData(null);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    fetchHealth(); fetchDbStats(); fetchAuditRecent();
    const id = setInterval(() => { fetchHealth(); fetchDbStats(); fetchAuditRecent(); }, 30_000);
    return () => clearInterval(id);
  }, [fetchHealth, fetchDbStats, fetchAuditRecent]);

  const refresh = () => { fetchHealth(true); fetchDbStats(); fetchAuditRecent(); };

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
          <Button size="sm" variant="outline" className="gap-1.5 flex-shrink-0"
            onClick={refresh} disabled={refreshing || loading}>
            <RefreshCw size={13} className={(refreshing || loading) ? "animate-spin" : ""} />
            {refreshing ? t("server_health.checking") : t("server_health.refresh")}
          </Button>
        </div>

        {lastChecked && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock size={11} />
            Last checked: {lastChecked.toLocaleTimeString("en-IN")} — auto-refreshes every 30s
          </p>
        )}

        <DevicePerformanceCard />

        {loading && (
          <div className="flex items-center gap-3 py-12 justify-center text-muted-foreground text-sm">
            <RefreshCw size={16} className="animate-spin" />Checking server health…
          </div>
        )}

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

        {!loading && data && (
          <>
            <HealthOverviewCard data={data} t={t} />
            <HealthDatabaseSection data={data} dbStats={dbStats} dbStatsLoading={dbStatsLoading} prevCounts={prevCounts} />
            <HealthTimelineChart data={data} t={t} />
            <HealthAlertList auditRecent={auditRecent} auditLoading={auditLoading} />
          </>
        )}
      </div>
    </Layout>
  );
}
