import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useGetDashboard } from "@workspace/api-client-react";
import { DashboardServicesSkeleton } from "@/components/skeletons";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { setCacheItem, getCacheItem } from "@/lib/offline-db";
import { WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DesktopStatCards } from "./DashboardStatCards";
import { DashboardWeeklyBar } from "./DashboardWeeklyBar";
import { DashboardRecentActivity } from "./DashboardRecentActivity";
import { UdhariSummaryCard } from "./UdhariSummaryCard";

const DASHBOARD_CACHE_KEY = "dashboard-data";

export function DesktopDashboard() {
  const { t } = useTranslation();
  const { isOffline } = useNetworkStatus();
  const { data: liveData, isLoading } = useGetDashboard();
  const [cachedData, setCachedData] = useState<any>(null);

  useEffect(() => {
    if (liveData) setCacheItem(DASHBOARD_CACHE_KEY, liveData, 30 * 60 * 1000).catch(() => {});
  }, [liveData]);

  useEffect(() => {
    if (isOffline) getCacheItem<any>(DASHBOARD_CACHE_KEY).then((d) => { if (d) setCachedData(d); }).catch(() => {});
  }, [isOffline]);

  const data = liveData ?? cachedData;

  return (
    <div className="space-y-5">
      {/* Offline indicator */}
      {isOffline && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2">
          <WifiOff size={13} className="text-destructive flex-shrink-0" />
          <p className="text-xs text-destructive font-medium">
            {cachedData ? t('dashboard.offline_cached') : t('dashboard.offline_no_cache')}
          </p>
        </div>
      )}

      {/* Udhari Khata Summary */}
      <UdhariSummaryCard />

      {/* 4 Stat Cards */}
      <DesktopStatCards data={data} isLoading={isLoading} />

      {/* Weekly Overview + Top Services */}
      <div className="grid grid-cols-3 gap-4">
        {/* Weekly bar chart — 2 cols */}
        <DashboardWeeklyBar data={data} />

        {/* Top Services — 1 col */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground text-sm font-bold">{t('dashboard.top_services')}</h2>
            <Link href="/services">
              <span className="text-primary text-[10px] font-semibold cursor-pointer">{t('dashboard.see_all')}</span>
            </Link>
          </div>
          {isLoading ? (
            <DashboardServicesSkeleton />
          ) : !data?.topServicesMonth?.length ? (
            <p className="text-muted-foreground text-sm text-center py-6">{t('dashboard.no_data')}</p>
          ) : (
            <div className="space-y-3">
              {data.topServicesMonth.slice(0, 5).map((svc: { serviceType: string; count: number; revenue: number }, i: number) => {
                const maxRevenue = data.topServicesMonth[0]?.revenue ?? 1;
                const pct = Math.round((svc.revenue / maxRevenue) * 100);
                return (
                  <div key={svc.serviceType}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-muted-foreground text-[10px] font-bold w-3">{i + 1}</span>
                      <span className="text-foreground text-xs font-semibold flex-1 truncate">{svc.serviceType}</span>
                      <span className="text-foreground text-xs font-bold flex-shrink-0">₹{svc.revenue.toLocaleString("en-IN")}</span>
                      <span className="text-muted-foreground text-[10px] flex-shrink-0">({svc.count})</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden ml-5">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <DashboardRecentActivity data={data} isLoading={isLoading} />
    </div>
  );
}
