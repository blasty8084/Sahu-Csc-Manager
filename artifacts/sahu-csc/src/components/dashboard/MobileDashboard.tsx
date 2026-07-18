import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useGetDashboard } from "@workspace/api-client-react";
import { DashboardServicesSkeleton } from "@/components/skeletons";
import { useAuth } from "@/hooks/use-auth";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { setCacheItem, getCacheItem } from "@/lib/offline-db";
import { WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MobileStatCards } from "./DashboardStatCards";
import { DashboardQuickActions } from "./DashboardQuickActions";
import { UdhariSummaryCard } from "./UdhariSummaryCard";

const DASHBOARD_CACHE_KEY = "dashboard-data";

export function MobileDashboard() {
  const { t } = useTranslation();
  useAuth(); // keep subscription to auth state changes (mirrors original)
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
      {isOffline && cachedData && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
          <WifiOff size={13} className="text-destructive flex-shrink-0" />
          <p className="text-xs text-destructive font-medium">{t('dashboard.offline_cached')}</p>
        </div>
      )}

      {/* 2×2 Stat Cards */}
      <MobileStatCards data={data} isLoading={isLoading} />

      {/* Udhari Khata Summary */}
      <UdhariSummaryCard mobile />

      {/* Quick Actions */}
      <DashboardQuickActions />

      {/* Top Services Today */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
            {t('dashboard.top_services_today')}
          </p>
          <Link href="/services">
            <span className="text-primary text-xs font-semibold">{t('dashboard.see_all')}</span>
          </Link>
        </div>

        {isLoading ? (
          <DashboardServicesSkeleton />
        ) : !data?.topServicesMonth?.length ? (
          <div className="bg-card rounded-2xl p-6 text-center border border-border">
            <p className="text-muted-foreground text-sm">{t('dashboard.no_service_data')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.topServicesMonth.slice(0, 5).map((svc: { serviceType: string; count: number; revenue: number }, i: number) => {
              const colors = [
                "bg-teal-100 text-teal-700", "bg-yellow-100 text-yellow-700",
                "bg-green-100 text-green-700", "bg-blue-100 text-blue-700",
                "bg-purple-100 text-purple-700",
              ];
              return (
                <div key={svc.serviceType} className="bg-card rounded-xl px-4 py-3 flex items-center gap-3 border border-border shadow-sm">
                  <span className="text-muted-foreground text-sm font-bold w-4 flex-shrink-0">{i + 1}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-1 ${colors[i] ?? colors[0]}`}>
                    {svc.serviceType}
                  </span>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-foreground text-xs font-bold">{svc.count} {t('dashboard.txns')}</p>
                    <p className="text-muted-foreground text-[10px]">₹{svc.revenue.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

