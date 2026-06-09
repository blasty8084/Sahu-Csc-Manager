import { useState } from "react";
import { usePWA } from "@/hooks/use-pwa";
import { Button } from "@/components/ui/button";
import { Download, WifiOff, X, Smartphone } from "lucide-react";

export function PWAInstallBanner() {
  const { isInstallable, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    const accepted = await promptInstall();
    setInstalling(false);
    if (accepted) setDismissed(true);
  };

  if (!isInstallable || dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-3 bg-primary/5 border-b border-primary/10 px-4 py-2.5">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Smartphone size={14} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground leading-none mb-0.5">Install SAHU CSC</p>
          <p className="text-[11px] text-muted-foreground leading-none truncate">
            Add to home screen for offline access &amp; faster loading
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Button size="sm" className="h-7 px-3 text-xs gap-1.5" onClick={handleInstall} disabled={installing}>
          <Download size={12} />
          {installing ? "Installing…" : "Install"}
        </Button>
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          <X size={13} />
        </Button>
      </div>
    </div>
  );
}

export function PWAStatusIcon() {
  const { isOffline } = usePWA();
  if (!isOffline) return null;
  return (
    <span title="Offline" className="text-destructive">
      <WifiOff size={15} />
    </span>
  );
}
