import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/use-pwa";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Download, CheckCircle, AlertCircle } from "lucide-react";

/** App installation card — install state, display mode, platform, install button. */
export function PwaInstallCard() {
  const { t } = useTranslation();
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const { toast } = useToast();
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    const accepted = await promptInstall();
    setInstalling(false);
    if (accepted) toast({ title: "App installed successfully!" });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Smartphone size={16} className="text-primary" />
          {t("pwa.app_installation")}
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
  );
}
