import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useSync } from "@/hooks/use-sync";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";
import { timeAgo } from "@/components/pwa/pwa-utils";

export function PwaNetworkCard() {
  const { t } = useTranslation();
  const { quality, isOffline, isSlow, latencyMs, effectiveType } = useNetworkStatus();
  const { lastSyncTime } = useSync();

  const networkColor =
    quality === "online" ? "text-green-600 dark:text-green-400" :
    quality === "slow"   ? "text-amber-600 dark:text-amber-400" :
                           "text-destructive";
  const networkBg =
    quality === "online" ? "bg-green-500" :
    quality === "slow"   ? "bg-amber-500" :
                           "bg-destructive";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Wifi size={16} className="text-primary" />
          {t("pwa.network_status")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Status</span>
            <div className={`flex items-center gap-1.5 font-semibold text-sm ${networkColor}`}>
              <span className={`w-2 h-2 rounded-full ${networkBg} ${quality === "online" ? "animate-pulse" : ""}`} />
              {quality === "online" ? t("pwa.online") : quality === "slow" ? t("pwa.slow") : t("pwa.offline")}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Latency</span>
            <span className="font-semibold text-sm">
              {isOffline ? "—" : latencyMs !== null ? `${latencyMs} ms` : "Measuring…"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Connection</span>
            <span className="font-semibold text-sm capitalize">
              {effectiveType ?? (isOffline ? "None" : "Unknown")}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Last Sync</span>
            <span className="font-semibold text-sm">
              {lastSyncTime ? timeAgo(lastSyncTime.getTime()) : "Never"}
            </span>
          </div>
        </div>

        {isSlow && (
          <div className="mt-3 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
            Slow connection detected — app is using cached data where possible
          </div>
        )}
        {isOffline && (
          <div className="mt-3 flex items-start gap-2 bg-destructive/10 rounded-lg px-3 py-2 text-xs text-destructive">
            <WifiOff size={13} className="mt-0.5 flex-shrink-0" />
            You're offline — new ledger entries are saved locally and will sync when you reconnect
          </div>
        )}
      </CardContent>
    </Card>
  );
}
