import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePWA } from "@/hooks/use-pwa";
import { CheckCircle, AlertCircle, Zap, Shield } from "lucide-react";

/** Browser capabilities grid + security checklist (two cards rendered together). */
export function PwaPermissionCard() {
  const { t } = useTranslation();
  const { capabilities } = usePWA();

  return (
    <>
      {/* Browser Capabilities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap size={16} className="text-primary" />
            {t("pwa.device_capabilities")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "App Badging",      ok: capabilities.badging },
              { label: "Wake Lock",        ok: capabilities.wakeLock },
              { label: "Periodic Sync",    ok: capabilities.periodicSync },
              { label: "Web Share",        ok: capabilities.shareTarget },
              { label: "Notifications",    ok: capabilities.notifications },
              { label: "Service Worker",   ok: "serviceWorker" in navigator },
              { label: "IndexedDB",        ok: "indexedDB" in window },
              { label: "Background Sync",  ok: "SyncManager" in window },
              { label: "Storage API",      ok: !!navigator.storage },
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
            {t("pwa.security")}
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
    </>
  );
}
