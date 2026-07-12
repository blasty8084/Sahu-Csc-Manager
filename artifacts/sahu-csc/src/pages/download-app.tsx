import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePWA } from "@/hooks/use-pwa";
import {
  Smartphone, Monitor, Download, CheckCircle2, ExternalLink,
  Chrome, Apple, AlertCircle, Share2, ArrowDownToLine, QrCode,
  Shield, Clock, Wifi, Package,
} from "lucide-react";

declare const __APP_VERSION__: string;

const steps = {
  android: [
    { icon: Chrome, text: "Open SAHU CSC in Chrome on your Android phone" },
    { icon: Share2, text: 'Tap the 3-dot menu ( ⋮ ) in the top-right corner' },
    { icon: ArrowDownToLine, text: '"Add to Home screen" or "Install app"' },
    { icon: CheckCircle2, text: "Tap Install — the app icon appears on your home screen" },
  ],
  ios: [
    { icon: Share2, text: "Open SAHU CSC in Safari on your iPhone / iPad" },
    { icon: ArrowDownToLine, text: 'Tap the Share button ( □↑ ) at the bottom of the screen' },
    { icon: ArrowDownToLine, text: '"Add to Home Screen"' },
    { icon: CheckCircle2, text: "Tap Add — the app icon appears on your home screen" },
  ],
};

const features = [
  { icon: Wifi, label: "Works Offline", desc: "Ledger entries sync when back online" },
  { icon: Shield, label: "Secure Login", desc: "Single-device session lock" },
  { icon: Clock, label: "Auto Logout", desc: "30-min idle protection" },
  { icon: Package, label: "No App Store needed", desc: "Install directly from browser" },
];

export default function DownloadApp() {
  const { t } = useTranslation();
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  const appUrl = window.location.origin + import.meta.env.BASE_URL;

  const handleInstall = async () => {
    setInstalling(true);
    const ok = await promptInstall();
    setInstalling(false);
    if (ok) setInstalled(true);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Hero */}
        <div className="bg-sidebar rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
            <img src={`${import.meta.env.BASE_URL}pwa-192x192.png`} alt="SAHU CSC" className="w-14 h-14 rounded-xl" loading="lazy" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <h1 className="text-xl font-bold text-sidebar-foreground">SAHU CSC</h1>
              <Badge variant="secondary" className="text-[10px] bg-white/10 text-sidebar-foreground/80 border-white/20">
                v{__APP_VERSION__}
              </Badge>
            </div>
            <p className="text-sm text-sidebar-foreground/70 mb-3">
              Common Service Center Management Platform
            </p>
            {isInstalled || installed ? (
              <div className="inline-flex items-center gap-2 text-green-300 text-sm font-medium">
                <CheckCircle2 size={16} />
                App is installed on this device
              </div>
            ) : isInstallable ? (
              <Button
                onClick={handleInstall}
                disabled={installing}
                className="bg-saffron-500 hover:bg-saffron-600 text-white gap-2"
                style={{ backgroundColor: "#f97316" }}
              >
                <Download size={16} />
                {installing ? "Installing…" : "Install App Now"}
              </Button>
            ) : (
              <p className="text-sidebar-foreground/50 text-sm italic">
                Use the instructions below to install
              </p>
            )}
          </div>
        </div>

        {/* App Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="bg-background rounded-xl border border-border p-3 flex flex-col gap-1.5">
                <Icon size={18} className="text-primary" />
                <p className="text-xs font-semibold">{f.label}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Android */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone size={18} className="text-green-600" />
              {t("download_app.android")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isInstallable && !isInstalled && !installed && (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">{t("download_app.ready")}</p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">Chrome detected an installable PWA on this page.</p>
                </div>
                <Button onClick={handleInstall} disabled={installing} size="sm" className="shrink-0 bg-green-600 hover:bg-green-700 text-white gap-1.5">
                  <Download size={14} />
                  {installing ? "Installing…" : "Install"}
                </Button>
              </div>
            )}

            <p className="text-sm text-muted-foreground font-medium">{t("download_app.manual_steps")}</p>
            <ol className="space-y-3">
              {steps.android.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                      <Icon size={15} className="text-muted-foreground flex-shrink-0" />
                      <span>{step.text}</span>
                    </div>
                  </li>
                );
              })}
            </ol>

            <Separator />

            {/* APK via TWA */}
            <div className="space-y-2">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Package size={15} className="text-primary" />
                {t("download_app.download_apk")}
              </p>
              <p className="text-xs text-muted-foreground">
                Generate a native Android APK (Trusted Web Activity) using PWABuilder — a free Microsoft tool.
                No developer account needed to install on your own device.
              </p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs font-mono text-muted-foreground">
                <p className="text-foreground font-semibold text-[11px] not-italic font-sans mb-1.5">Steps:</p>
                <div className="space-y-1.5">
                  <p>1. Deploy this app on Replit (Publish button)</p>
                  <p>2. Visit <span className="text-primary">pwabuilder.com</span></p>
                  <p>3. Paste your deployed URL → click Start</p>
                  <p>4. Choose <span className="text-foreground">Android</span> → Generate Package</p>
                  <p>5. Download the <span className="text-foreground">.apk</span> file</p>
                  <p>6. On your Android phone → Settings → Install unknown apps → allow Chrome</p>
                  <p>7. Open the downloaded APK to install</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 mt-1"
                onClick={() => window.open(`https://www.pwabuilder.com/?url=${encodeURIComponent(appUrl)}`, "_blank")}
              >
                <ExternalLink size={14} />
                Open PWABuilder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* iOS */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Apple size={18} className="text-gray-700 dark:text-gray-300" />
              {t("download_app.iphone")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-4 flex gap-2 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>iOS requires Safari browser. Chrome and other browsers on iOS cannot install PWAs.</span>
            </div>
            <ol className="space-y-3">
              {steps.ios.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                      <Icon size={15} className="text-muted-foreground flex-shrink-0" />
                      <span>{step.text}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>

        {/* Desktop */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Monitor size={18} className="text-blue-600" />
              {t("download_app.desktop")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Open SAHU CSC in Chrome or Edge on your desktop computer.
            </p>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                <span>Look for the <strong>install icon</strong> (⊕ or screen with arrow) in the browser address bar</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                <span>Click it and then click <strong>Install</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                <span>SAHU CSC opens as a standalone window with its own taskbar icon</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Share link */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode size={18} className="text-purple-600" />
              {t("download_app.share_link")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Share this URL with other operators so they can access and install the app:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded-lg text-xs font-mono break-all">{appUrl}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: "SAHU CSC", url: appUrl });
                  } else {
                    navigator.clipboard.writeText(appUrl);
                  }
                }}
                className="shrink-0"
              >
                <Share2 size={14} />
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
}
