import { useState, useCallback, useEffect } from "react";
import { Router as WouterRouter } from "wouter";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PerformanceProvider } from "@/hooks/use-performance-tier";
import { ThemeProvider } from "@/components/theme-provider";
import { SplashScreen } from "@/components/splash-screen";
import { ErrorBoundary } from "@/components/error-boundary";
import { QueryProvider } from "@/providers/QueryProvider";
import { AppAuthProvider } from "@/providers/AuthProvider";
import { Router } from "@/components/Router";
import RegionBlocked from "@/pages/region-blocked";

// ─── Geo-gate — checks /api/geo once on mount; shows blocked screen if not IN ─
function GeoGate({ children }: { children: React.ReactNode }) {
  const [geoState, setGeoState] = useState<"loading" | "allowed" | "blocked">("loading");

  useEffect(() => {
    fetch("/api/geo", { credentials: "omit" })
      .then((r) => r.json())
      .then((data) => setGeoState(data.allowed ? "allowed" : "blocked"))
      .catch(() => setGeoState("allowed")); // fail open — don't block on network error
  }, []);

  if (geoState === "blocked") return <RegionBlocked />;
  // Show nothing (splash handles the visual) while the geo check is in-flight
  if (geoState === "loading") return null;
  return <>{children}</>;
}

// ─── App root ─────────────────────────────────────────────────────────────────
function App() {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof sessionStorage !== "undefined") {
      return !sessionStorage.getItem("sahu-splash-shown");
    }
    return true;
  });

  const handleSplashDone = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem("sahu-splash-shown", "1");
  }, []);

  return (
    <GeoGate>
      <ErrorBoundary>
        <PerformanceProvider>
          <SplashScreen visible={showSplash} onDone={handleSplashDone} />
          <QueryProvider>
            <TooltipProvider>
              <ThemeProvider defaultTheme="light" storageKey="sahu-csc-theme">
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <AppAuthProvider>
                    <Router />
                  </AppAuthProvider>
                </WouterRouter>
              </ThemeProvider>
              <Toaster />
            </TooltipProvider>
          </QueryProvider>
        </PerformanceProvider>
      </ErrorBoundary>
    </GeoGate>
  );
}

export default App;
