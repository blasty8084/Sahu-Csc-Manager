import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { useSync } from "@/hooks/use-sync";
import { getStorageUsage, getOfflineStats, getAllCachedReports } from "@/lib/offline-db";
import { PwaNetworkCard } from "@/components/pwa/PwaNetworkCard";
import { PwaSyncQueueCard } from "@/components/pwa/PwaSyncQueueCard";
import { PwaCacheStats } from "@/components/pwa/PwaCacheStats";
import { PwaInstallCard } from "@/components/pwa/PwaInstallCard";
import { PwaSubscriptionCard } from "@/components/pwa/PwaSubscriptionCard";
import { PwaPermissionCard } from "@/components/pwa/PwaPermissionCard";

export default function PwaStatus() {
  const { t } = useTranslation();
  const { pendingCount } = useSync();

  const [storage, setStorage] = useState({ used: 0, quota: 0, percent: 0 });
  const [offlineStats, setOfflineStats] = useState({
    pendingLedger: 0, pendingNotifications: 0, cachedReports: 0, hasSession: false,
  });
  const [cachedReports, setCachedReports] = useState<any[]>([]);
  const [swVersion, setSwVersion] = useState<string | null>(null);

  const refresh = async () => {
    const [s, o, r] = await Promise.all([getStorageUsage(), getOfflineStats(), getAllCachedReports()]);
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
          mc.port1.onmessage = (e) => { if (e.data?.version) setSwVersion(e.data.version); };
          sw.postMessage({ type: "GET_VERSION" }, [mc.port2]);
        }
      });
    }
  }, []);

  useEffect(() => { refresh(); }, [pendingCount]);

  return (
    <Layout>
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("pwa.install_title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor network quality, offline storage, sync queue, and app installation
          </p>
        </div>

        <PwaNetworkCard />
        <PwaSyncQueueCard offlineStats={offlineStats} cachedReports={cachedReports} onRefresh={refresh} />
        <PwaCacheStats storage={storage} swVersion={swVersion} onRefresh={refresh} />
        <PwaInstallCard />
        <PwaSubscriptionCard />
        <PwaPermissionCard />
      </div>
    </Layout>
  );
}
