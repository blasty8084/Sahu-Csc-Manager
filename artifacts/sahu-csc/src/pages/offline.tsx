import { WifiOff, RefreshCw, Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/app-logo";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function Offline() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
      <AppLogo size="lg" className="mb-6 opacity-80" />

      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
        <WifiOff size={32} className="text-destructive" />
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">{t("offline_page.title")}</h1>
      <p className="text-muted-foreground max-w-sm mb-2 leading-relaxed">
        {t("offline_page.description")}
      </p>
      <p className="text-xs text-muted-foreground/70 mb-8 font-mono">
        {t("offline_page.safe")}
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={() => window.location.reload()} className="gap-2">
          <RefreshCw size={15} />
          {t("offline_page.try_again")}
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <Link href="/">
            <Home size={15} />
            {t("offline_page.dashboard")}
          </Link>
        </Button>
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/ledger">
            <BookOpen size={15} />
            {t("offline_page.ledger")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
