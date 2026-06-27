import { useSync } from "@/hooks/use-sync";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { usePWA } from "@/hooks/use-pwa";
import { Button } from "@/components/ui/button";
import { RefreshCw, WifiOff, Wifi, Clock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 10) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  return `${hours} hr${hours > 1 ? "s" : ""} ago`;
}

export function SyncStatusBar() {
  const { quality, isOffline, isSlow } = useNetworkStatus();
  const { syncStatus, pendingCount, lastSyncTime, syncNow } = useSync();
  const { isInstallable } = usePWA();
  const { t } = useTranslation();
  const [, forceUpdate] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => forceUpdate((n) => n + 1), 30_000);
    return () => clearInterval(timer);
  }, []);

  const handleSyncNow = async () => {
    setSyncing(true);
    await syncNow();
    setSyncing(false);
  };

  const isSyncing = syncStatus === "syncing" || syncing;
  const hasError = syncStatus === "partial";

  if (quality === "online" && pendingCount === 0 && !hasError && !isSlow) {
    return null;
  }

  if (isOffline) {
    return (
      <div className="flex items-center justify-center gap-2 bg-destructive/10 border-b border-destructive/20 text-destructive text-xs py-1.5 px-4">
        <WifiOff size={12} />
        <span className="font-semibold">{t('pwa.offline_mode')}</span>
        {pendingCount > 0 && (
          <span className="ml-1 bg-destructive/20 text-destructive font-bold px-1.5 py-0.5 rounded-full text-[10px]">
            {pendingCount} pending
          </span>
        )}
        <span className="text-destructive/70 hidden sm:inline">
          {t('pwa.cached_data')}
        </span>
      </div>
    );
  }

  if (isSlow) {
    return (
      <div className="flex items-center justify-center gap-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs py-1.5 px-4">
        <Wifi size={12} />
        <span className="font-semibold">{t('pwa.slow_connection')}</span>
        {pendingCount > 0 && (
          <span className="ml-1 text-[10px] text-amber-600 dark:text-amber-400">
            {t('pwa.queued_n', { n: pendingCount })}
          </span>
        )}
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center justify-center gap-2 bg-primary/5 border-b border-primary/10 text-primary text-xs py-1.5 px-4">
        <RefreshCw size={12} className="animate-spin" />
        <span className="font-semibold">
          {pendingCount > 0 ? t('pwa.syncing_n', { n: pendingCount }) : t('pwa.syncing')}
        </span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center gap-2 bg-orange-500/10 border-b border-orange-500/20 text-orange-700 dark:text-orange-400 text-xs py-1.5 px-4">
        <AlertCircle size={12} />
        <span className="font-semibold">{pendingCount} {t('pwa.failed_sync')}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-2 text-[10px] font-bold text-orange-700 dark:text-orange-400 hover:bg-orange-500/10 ml-1"
          onClick={handleSyncNow}
          disabled={syncing}
        >
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="flex items-center justify-center gap-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs py-1.5 px-4">
        <Clock size={12} />
        <span className="font-semibold">{t('pwa.queued_n', { n: pendingCount })}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-2 text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 ml-1"
          onClick={handleSyncNow}
          disabled={syncing}
        >
          {t('pwa.sync_now')}
        </Button>
        {lastSyncTime && (
          <span className="text-amber-600/60 dark:text-amber-400/60 hidden sm:inline text-[10px]">
            {t('pwa.last_sync', { time: timeAgo(lastSyncTime) })}
          </span>
        )}
      </div>
    );
  }

  return null;
}

export function SyncDot() {
  const { quality } = useNetworkStatus();
  const { syncStatus, pendingCount } = useSync();

  if (syncStatus === "syncing") {
    return (
      <span title="Syncing…" className="inline-flex items-center gap-1 text-primary text-[10px] font-semibold">
        <RefreshCw size={11} className="animate-spin" />
      </span>
    );
  }
  if (quality === "offline") {
    return (
      <span title="Offline" className="inline-flex items-center text-destructive">
        <WifiOff size={14} />
      </span>
    );
  }
  if (pendingCount > 0) {
    return (
      <span title={`${pendingCount} pending`} className="inline-flex items-center gap-1 text-amber-500 text-[10px] font-bold">
        <Clock size={11} />
        <span>{pendingCount}</span>
      </span>
    );
  }
  return null;
}
