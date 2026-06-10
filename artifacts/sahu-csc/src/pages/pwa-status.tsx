import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useSync } from "@/hooks/use-sync";
import { usePWA } from "@/hooks/use-pwa";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import {
  getStorageUsage,
  getOfflineStats,
  getAllCachedReports,
  clearExpiredCache,
  clearExpiredReports,
  clearReadNotifications,
} from "@/lib/offline-db";
import { useToast } from "@/hooks/use-toast";
import {
  Wifi, WifiOff, Gauge, Database, RefreshCw, Download,
  Bell, BellOff, CheckCircle, AlertCircle, Clock,
  Smartphone, Shield, Activity, Trash2, Info,
  HardDrive, Zap, Radio,
} from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function timeAgo(ms: number): string {
  const secs = Math.floor((Date.now() - ms) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr ago`;
}

export default function PwaStatus() {
  const { quality, isOffline, isSlow, latencyMs, effectiveType } = useNetworkStatus();
  const { syncStatus, pendingCount, lastSyncTime, syncNow } = useSync();
  const { isInstallable, isInstalled, promptInstall, capabilities } = usePWA();
  const { status: pushStatus, subscribe, unsubscribe, isLoading: pushLoading } = usePushNotifications();
  const { toast } = useToast();

  const [storage, setStorage] = useState({ used: 0, quota: 0, percent: 0 });
  const [offlineStats, setOfflineStats] = useState({
    pendingLedger: 0,
    pendingNotifications: 0,
    cachedReports: 0,
    hasSession: false,
  });
  const [cachedReports, setCachedReports] = useState<any[]>([]);
  const [swVersion, setSwVersion] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [installing, setInstalling] = useState(false);

  const refresh = async () => {
    const [s, o, r] = await Promise.all([
      getStorageUsage(),
      getOfflineStats(),
      getAllCachedReports(),
    ]);
    setStorage(s);
    setOfflineStats(o);
    setCachedReports(r);
  };

  useEffect(() => {
    refresh();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        const sw = reg.active;
        if (sw) {
          const mc = new MessageChannel();
          mc.port1.onmessage = (e) => {
            if (e.data?.version) setSwVersion(e.data.version);
          };
          sw.postMessage({ type: "GET_VERSION" }, [mc.port2]);
        }
      });
    }
  }, []);

  useEffect(() => { refresh(); }, [pendingCount]);

  const handleClearCache = async () => {
    setClearing(true);
    try {
      await Promise.all([clearExpiredCache(), clearExpiredReports(), clearReadNotifications()]);
      await refresh();
      toast({ title: "Expired cache cleared" });
    } catch {
      toast({ title: "Failed to clear cache", variant: "destructive" });
    } finally {
      setClearing(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      await syncNow();
      await refresh();
      toast({ title: pendingCount > 0 ? `Synced ${pendingCount} entries` : "Already up to date" });
    } finally {
      setSyncing(false);
    }
  };

  const handleInstall = async () => {
    setInstalling(true);
    const accepted = await promptInstall();
    setInstalling(false);
    if (accepted) toast({ title: "App installed successfully!" });
  };

  const networkColor =
    quality === "online" ? "text-green-600 dark:text-green-400" :
    quality === "slow"   ? "text-amber-600 dark:text-amber-400" :
                           "text-destructive";
  const networkBg =
    quality === "online" ? "bg-green-500" :
    quality === "slow"   ? "bg-amber-500" :
                           "bg-destructive";

  const syncColor =
    syncStatus === "idle"    ? "text-green-600 dark:text-green-400" :
    syncStatus === "syncing" ? "text-primary" :
    syncStatus === "partial" ? "text-amber-600 dark:text-amber-400" :
                               "text-destructive";

  return (
    <Layout>
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 className="text-xl font-bold text-foreground">App & Offline Status</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor network quality, offline storage, sync queue, and app installation
          </p>
        </div>

        {/* Network Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wifi size={16} className="text-primary" />
              Network Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Status</span>
                <div className={`flex items-center gap-1.5 font-semibold text-sm ${networkColor}`}>
                  <span className={`w-2 h-2 rounded-full ${networkBg} ${quality === "online" ? "animate-pulse" : ""}`} />
                  {quality === "online" ? "Online" : quality === "slow" ? "Slow" : "Offline"}
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

        {/* Sync & Offline Queue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw size={16} className="text-primary" />
              Sync Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Sync Status</span>
                <span className={`font-semibold text-sm capitalize ${syncColor}`}>
                  {syncStatus}
                </span>
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
                {syncing ? "Syncing…" : "Sync Now"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HardDrive size={16} className="text-primary" />
              Offline Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Used</span>
                <span className="font-semibold">
                  {storage.quota > 0
                    ? `${formatBytes(storage.used)} / ${formatBytes(storage.quota)} (${storage.percent}%)`
                    : formatBytes(storage.used)
                  }
                </span>
              </div>
              {storage.quota > 0 && (
                <Progress value={storage.percent} className="h-2" />
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="bg-muted/40 rounded-lg px-3 py-2">
                <p className="text-xs text-muted-foreground">IndexedDB stores</p>
                <p className="font-semibold mt-0.5">5 stores</p>
              </div>
              <div className="bg-muted/40 rounded-lg px-3 py-2">
                <p className="text-xs text-muted-foreground">Service Worker</p>
                <p className="font-semibold mt-0.5">{swVersion ? `v${swVersion}` : "Active"}</p>
              </div>
              <div className="bg-muted/40 rounded-lg px-3 py-2">
                <p className="text-xs text-muted-foreground">Cache Strategy</p>
                <p className="font-semibold mt-0.5">Workbox</p>
              </div>
              <div className="bg-muted/40 rounded-lg px-3 py-2">
                <p className="text-xs text-muted-foreground">DB Version</p>
                <p className="font-semibold mt-0.5">v2</p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-muted-foreground"
              onClick={handleClearCache}
              disabled={clearing}
            >
              <Trash2 size={13} className={clearing ? "animate-spin" : ""} />
              {clearing ? "Clearing…" : "Clear Expired Cache"}
            </Button>
          </CardContent>
        </Card>

        {/* App Installation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone size={16} className="text-primary" />
              App Installation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Installation</span>
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  {isInstalled ? (
                    <><CheckCircle size={14} className="text-green-600 dark:text-green-400" /> Installed</>
                  ) : (
                    <><AlertCircle size={14} className="text-muted-foreground" /> Browser only</>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Display Mode</span>
                <span className="font-semibold text-sm capitalize">
                  {window.matchMedia("(display-mode: standalone)").matches
                    ? "Standalone"
                    : window.matchMedia("(display-mode: window-controls-overlay)").matches
                    ? "WCO"
                    : "Browser"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Platform</span>
                <span className="font-semibold text-sm">
                  {/android/i.test(navigator.userAgent)
                    ? "Android"
                    : /iphone|ipad/i.test(navigator.userAgent)
                    ? "iOS"
                    : "Desktop"}
                </span>
              </div>
            </div>

            {isInstallable && !isInstalled && (
              <Button size="sm" className="gap-1.5" onClick={handleInstall} disabled={installing}>
                <Download size={13} />
                {installing ? "Installing…" : "Install App"}
              </Button>
            )}

            {isInstalled && (
              <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2 text-xs text-green-700 dark:text-green-400">
                <CheckCircle size={13} className="mt-0.5 flex-shrink-0" />
                SAHU CSC is installed as a native app on this device
              </div>
            )}
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell size={16} className="text-primary" />
              Push Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Status</span>
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  {pushStatus === "subscribed" ? (
                    <><CheckCircle size={14} className="text-green-600 dark:text-green-400" /> Enabled</>
                  ) : pushStatus === "denied" ? (
                    <><BellOff size={14} className="text-destructive" /> Blocked</>
                  ) : pushStatus === "unsupported" ? (
                    <><AlertCircle size={14} className="text-muted-foreground" /> Not supported</>
                  ) : (
                    <><Bell size={14} className="text-muted-foreground" /> Not enabled</>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Browser Permission</span>
                <span className="font-semibold text-sm capitalize">
                  {typeof Notification !== "undefined" ? Notification.permission : "N/A"}
                </span>
              </div>
            </div>

            {pushStatus === "default" && (
              <Button size="sm" className="gap-1.5" onClick={subscribe} disabled={pushLoading}>
                <Bell size={13} />
                {pushLoading ? "Enabling…" : "Enable Notifications"}
              </Button>
            )}
            {pushStatus === "subscribed" && (
              <Button size="sm" variant="outline" className="gap-1.5 text-muted-foreground" onClick={unsubscribe} disabled={pushLoading}>
                <BellOff size={13} />
                {pushLoading ? "Disabling…" : "Disable Notifications"}
              </Button>
            )}
            {pushStatus === "denied" && (
              <p className="text-xs text-muted-foreground">
                Notifications are blocked in your browser settings. Allow them from the address bar to enable.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Browser Capabilities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap size={16} className="text-primary" />
              Device Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "App Badging", ok: capabilities.badging },
                { label: "Wake Lock", ok: capabilities.wakeLock },
                { label: "Periodic Sync", ok: capabilities.periodicSync },
                { label: "Web Share", ok: capabilities.shareTarget },
                { label: "Notifications", ok: capabilities.notifications },
                { label: "Service Worker", ok: "serviceWorker" in navigator },
                { label: "IndexedDB", ok: "indexedDB" in window },
                { label: "Background Sync", ok: "SyncManager" in window },
                { label: "Storage API", ok: !!navigator.storage },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  {ok
                    ? <CheckCircle size={14} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                    : <AlertCircle size={14} className="text-muted-foreground/40 flex-shrink-0" />
                  }
                  <span className={ok ? "text-foreground" : "text-muted-foreground/60"}>{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              Security &amp; Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>Passwords, tokens and session secrets are <strong className="text-foreground">never cached</strong> offline</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>Auth API routes use <strong className="text-foreground">NetworkOnly</strong> — no cached credentials</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>Offline user session stored in IndexedDB with <strong className="text-foreground">24-hour expiry</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>Sensitive data served over <strong className="text-foreground">HTTPS only</strong> in production</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
