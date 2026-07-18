import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  clearExpiredCache,
  clearExpiredReports,
  clearReadNotifications,
} from "@/lib/offline-db";
import { useToast } from "@/hooks/use-toast";
import { HardDrive, Trash2 } from "lucide-react";
import { formatBytes } from "@/components/pwa/pwa-utils";

interface StorageInfo {
  used: number;
  quota: number;
  percent: number;
}

interface PwaCacheStatsProps {
  storage: StorageInfo;
  swVersion: string | null;
  onRefresh: () => Promise<void>;
}

/** Offline storage card — usage bar, IDB/SW/cache metadata, clear-expired button. */
export function PwaCacheStats({ storage, swVersion, onRefresh }: PwaCacheStatsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [clearing, setClearing] = useState(false);

  const handleClearCache = async () => {
    setClearing(true);
    try {
      await Promise.all([clearExpiredCache(), clearExpiredReports(), clearReadNotifications()]);
      await onRefresh();
      toast({ title: "Expired cache cleared" });
    } catch {
      toast({ title: "Failed to clear cache", variant: "destructive" });
    } finally {
      setClearing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <HardDrive size={16} className="text-primary" />
          {t("pwa.offline_storage")}
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
          {storage.quota > 0 && <Progress value={storage.percent} className="h-2" />}
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
  );
}
