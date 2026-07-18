import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSync } from "@/hooks/use-sync";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import { timeAgo } from "@/components/pwa/pwa-utils";

interface OfflineStats {
  pendingLedger: number;
  pendingNotifications: number;
  cachedReports: number;
  hasSession: boolean;
}

interface CachedReport {
  key: string;
  type: string;
  cachedAt: number;
}

interface PwaSyncQueueCardProps {
  offlineStats: OfflineStats;
  cachedReports: CachedReport[];
  onRefresh: () => Promise<void>;
}

/** Offline sync queue — status grid, cached-reports list, and Sync Now button. */
export function PwaSyncQueueCard({ offlineStats, cachedReports, onRefresh }: PwaSyncQueueCardProps) {
  const { t } = useTranslation();
  const { syncStatus, pendingCount, syncNow } = useSync();
  const { isOffline } = useNetworkStatus();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const syncColor =
    syncStatus === "idle"    ? "text-green-600 dark:text-green-400" :
    syncStatus === "syncing" ? "text-primary" :
    syncStatus === "partial" ? "text-amber-600 dark:text-amber-400" :
                               "text-destructive";

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      await syncNow();
      await onRefresh();
      toast({ title: pendingCount > 0 ? `Synced ${pendingCount} entries` : "Already up to date" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <RefreshCw size={16} className="text-primary" />
          {t("pwa.sync_queue")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Sync Status</span>
            <span className={`font-semibold text-sm capitalize ${syncColor}`}>{syncStatus}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Pending Ledger</span>
            <span className="font-semibold text-sm">
              {offlineStats.pendingLedger > 0
                ? <span className="text-amber-600 dark:text-amber-400">{offlineStats.pendingLedger} entries</span>
                : <span className="text-green-600 dark:text-green-400">None</span>
              }
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Cached Reports</span>
            <span className="font-semibold text-sm">{offlineStats.cachedReports}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Offline Auth</span>
            <span className={`font-semibold text-sm ${offlineStats.hasSession ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
              {offlineStats.hasSession ? "Cached" : "Not cached"}
            </span>
          </div>
        </div>

        {cachedReports.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Cached Reports</p>
            <div className="space-y-1">
              {cachedReports.slice(0, 5).map((r) => (
                <div key={r.key} className="flex items-center justify-between text-xs bg-muted/40 rounded px-2.5 py-1.5">
                  <span className="font-medium capitalize">{r.type} report</span>
                  <span className="text-muted-foreground">Cached {timeAgo(r.cachedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={handleSyncNow}
            disabled={syncing || isOffline}
          >
            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
            {syncing ? t("pwa.syncing") : t("pwa.sync_now")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
