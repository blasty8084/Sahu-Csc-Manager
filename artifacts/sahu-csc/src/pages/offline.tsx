import { WifiOff, RefreshCw, Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/app-logo";
import { Link } from "wouter";

export default function Offline() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
      <AppLogo size="lg" className="mb-6 opacity-80" />

      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
        <WifiOff size={32} className="text-destructive" />
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">You're offline</h1>
      <p className="text-muted-foreground max-w-sm mb-2 leading-relaxed">
        No internet connection. Previously loaded pages are available from cache.
        New ledger entries will sync automatically when you reconnect.
      </p>
      <p className="text-xs text-muted-foreground/70 mb-8 font-mono">
        SAHU CSC works fully offline — your data is safe.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={() => window.location.reload()} className="gap-2">
          <RefreshCw size={15} />
          Try again
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <Link href="/">
            <Home size={15} />
            Dashboard
          </Link>
        </Button>
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/ledger">
            <BookOpen size={15} />
            Ledger
          </Link>
        </Button>
      </div>
    </div>
  );
}
