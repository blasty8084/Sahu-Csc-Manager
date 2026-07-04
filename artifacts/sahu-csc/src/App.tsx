import React, { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { motion, AnimatePresence } from "framer-motion";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, type LoadingPhase } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIdleTimer } from "@/hooks/use-idle-timer";
import { SplashScreen } from "@/components/splash-screen";
import { PageSkeleton } from "@/components/page-skeleton";
import { useListNotifications } from "@workspace/api-client-react";
import { updateAppBadge } from "@/lib/pwa-badge";
import { SyncBadge } from "@/components/sync-badge";
import { Redirect } from "wouter";

declare const __APP_VERSION__: string;

// ─── Static imports (tiny / needed on first paint) ───────────────────────────
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import Offline from "@/pages/offline";

// ─── Lazy-loaded pages (each becomes its own JS chunk) ───────────────────────
const Register           = lazy(() => import("@/pages/register"));
const RegistrationClosed = lazy(() => import("@/pages/register-closed"));
const RegisterPending    = lazy(() => import("@/pages/register-pending"));
const ForgotPassword     = lazy(() => import("@/pages/forgot-password"));
const ResetPassword      = lazy(() => import("@/pages/reset-password"));
const Sessions           = lazy(() => import("@/pages/sessions"));
const Dashboard          = lazy(() => import("@/pages/dashboard"));
const Ledger             = lazy(() => import("@/pages/ledger"));
const Services           = lazy(() => import("@/pages/services"));
const Reports            = lazy(() => import("@/pages/reports"));
const Notifications      = lazy(() => import("@/pages/notifications"));
const AuditLogs          = lazy(() => import("@/pages/audit-logs"));
const Users              = lazy(() => import("@/pages/users"));
const Backups            = lazy(() => import("@/pages/backups"));
const AePS               = lazy(() => import("@/pages/aeps"));
const Profile            = lazy(() => import("@/pages/profile"));
const PwaStatus          = lazy(() => import("@/pages/pwa-status"));
const ServerHealth       = lazy(() => import("@/pages/server-health"));
const DownloadApp        = lazy(() => import("@/pages/download-app"));
const About              = lazy(() => import("@/pages/about"));
const Udhari             = lazy(() => import("@/pages/udhari"));
const UdhariCustomer     = lazy(() => import("@/pages/udhari-customer"));
const ReceiptsVerify     = lazy(() => import("@/pages/receipts-verify"));
const AepsReceiptVerify  = lazy(() => import("@/pages/aeps-receipt-verify"));
const UdhariReceiptVerify = lazy(() => import("@/pages/udhari-receipt-verify"));
const Broadcast          = lazy(() => import("@/pages/broadcast"));
const ReceiptExport      = lazy(() => import("@/pages/receipt-export"));

// ─── QueryClient ──────────────────────────────────────────────────────────────
function detectSessionReplaced(error: any) {
  const msg: string = error?.message ?? String(error ?? "");
  if (msg.includes("SESSION_REPLACED")) {
    window.dispatchEvent(new CustomEvent("sahu-session-replaced"));
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: detectSessionReplaced }),
  mutationCache: new MutationCache({ onError: detectSessionReplaced }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60_000,       // 5 min — serve cache instantly on repeat navigation
      gcTime: 30 * 60_000,         // 30 min — keep data in memory the whole session
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

const CACHE_STORAGE_KEY = "sahu-csc-rq-cache";

const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
  key: CACHE_STORAGE_KEY,
  throttleTime: 1000,
});

// ─── Badge ────────────────────────────────────────────────────────────────────
function BadgeUpdater() {
  const { data } = useListNotifications({ unreadOnly: true });
  const count = Array.isArray(data) ? data.length : 0;
  useEffect(() => { updateAppBadge(count); }, [count]);
  return null;
}

// ─── Eager chunk preloader — fires after login so navigation is instant ───────
function EagerPreloader() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    import("@/pages/dashboard");
    import("@/pages/ledger");
    import("@/pages/aeps");
    import("@/pages/udhari");
    import("@/pages/reports");
    import("@/pages/notifications");
    import("@/pages/profile");
    import("@/pages/services");
    import("@/pages/sessions");
    import("@/pages/udhari-customer");
  }, [user]);
  return null;
}

// ─── Share target ─────────────────────────────────────────────────────────────
function ShareTargetHandler() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const text = params.get("text") || params.get("title") || "";
    setLocation(text ? `/ledger?description=${encodeURIComponent(text)}` : "/ledger");
  }, []);
  return null;
}

// ─── Idle / session-replaced manager ─────────────────────────────────────────
function SessionManager() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [displaySec, setDisplaySec] = useState(120);

  const handleIdle = useCallback(async () => {
    if (!user) return;
    setShowWarning(false);
    try { await logout(); } catch { /* ignore */ }
    setLocation("/login");
    toast({ title: "Logged out", description: "You were logged out after 30 minutes of inactivity." });
  }, [user, logout, setLocation, toast]);

  const { isWarning, remaining, resetTimer } = useIdleTimer(
    30 * 60 * 1000,
    2 * 60 * 1000,
    user ? handleIdle : undefined,
  );

  useEffect(() => { setShowWarning(user ? isWarning : false); }, [isWarning, user]);
  useEffect(() => { setDisplaySec(Math.max(0, Math.ceil(remaining / 1000))); }, [remaining]);

  useEffect(() => {
    const handler = () => {
      queryClient.clear();
      setLocation("/login");
      toast({
        title: "Signed in on another device",
        description: "Your account was accessed from another device. Please log in again.",
        variant: "destructive",
      });
    };
    window.addEventListener("sahu-session-replaced", handler);
    return () => window.removeEventListener("sahu-session-replaced", handler);
  }, [setLocation, toast]);

  const minutes = Math.floor(displaySec / 60);
  const seconds = displaySec % 60;

  if (!user) return null;

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>⏱ Session About to Expire</AlertDialogTitle>
          <AlertDialogDescription className="space-y-1">
            <span>You've been inactive. You'll be logged out automatically in</span>
            <span className="block text-2xl font-bold text-foreground tabular-nums text-center py-2">
              {minutes}:{String(seconds).padStart(2, "0")}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              setShowWarning(false);
              try { await logout(); } catch { /* ignore */ }
              setLocation("/login");
            }}
          >
            Log Out Now
          </Button>
          <AlertDialogAction
            onClick={() => {
              resetTimer();
              setShowWarning(false);
            }}
          >
            Stay Logged In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Full-screen loading (used while auth is resolving) ───────────────────────
function LoadingScreen({ phase = "loading" }: { phase?: LoadingPhase }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none"
      style={{ background: "linear-gradient(160deg, #080f2e 0%, #0b2c60 60%, #0f1f4a 100%)" }}
    >
      {/* Radial glow behind logo */}
      <div
        className="absolute"
        style={{
          width: 260, height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo + spinner */}
      <motion.div
        initial={{ scale: 0.82, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative flex items-center justify-center"
      >
        {/* Outer ring — stops on timeout */}
        {phase !== "timeout" ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute w-32 h-32 rounded-full"
            style={{
              border: "2.5px solid transparent",
              borderTopColor: "#F97316",
              borderRightColor: "rgba(249,115,22,0.22)",
              borderBottomColor: "transparent",
              borderLeftColor: "rgba(249,115,22,0.08)",
              willChange: "transform",
            }}
          />
        ) : (
          <div
            className="absolute w-32 h-32 rounded-full"
            style={{ border: "2.5px solid rgba(249,115,22,0.20)" }}
          />
        )}

        {/* Inner glow ring */}
        <div
          className="absolute w-28 h-28 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 70%)" }}
        />

        {/* Logo */}
        <div
          className="w-24 h-24 rounded-full overflow-hidden"
          style={{
            border: "3px solid rgba(255,255,255,0.15)",
            boxShadow: "0 0 32px rgba(249,115,22,0.20), 0 8px 32px rgba(0,0,0,0.50)",
          }}
        >
          <img src="/sahu-logo.png" alt="SAHU CSC" className="w-full h-full object-cover" />
        </div>
      </motion.div>

      {/* Brand name + status */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.2 }}
        className="mt-7 text-center"
      >
        <h1 className="text-2xl font-black tracking-wide">
          <span className="text-white">SAHU </span>
          <span style={{ color: "#F97316" }}>CSC</span>
        </h1>
        <p className="text-white/35 text-[10px] tracking-widest uppercase mt-0.5">
          Management Platform
        </p>

        <div className="mt-4 min-h-[36px] flex flex-col items-center justify-center">
          {phase === "loading" && (
            <motion.div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  style={{ width: 5, height: 5, background: "rgba(249,115,22,0.7)" }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </motion.div>
          )}

          {phase === "slow" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1 text-center">
              <p className="text-white/60 text-xs">Server is starting up…</p>
              <p className="text-white/30 text-[10px]">This may take a few seconds</p>
            </motion.div>
          )}

          {phase === "timeout" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 text-center">
              <p className="text-white/55 text-xs">Server is taking too long</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs font-bold px-5 py-2 rounded-full"
                style={{ background: "linear-gradient(90deg, #f97316, #fb923c)", color: "#fff", boxShadow: "0 4px 14px rgba(249,115,22,0.4)" }}
              >
                Retry
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Bottom progress bar */}
      {phase !== "timeout" && (
        <div
          className="absolute overflow-hidden rounded-full"
          style={{ bottom: 56, width: 56, height: 2, background: "rgba(255,255,255,0.08)" }}
        >
          <motion.div
            className="w-full h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #F97316, rgba(249,115,22,0.35))" }}
            animate={{ x: ["-100%", "0%", "100%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Version tag */}
      <p className="absolute text-white/18 text-[10px] tracking-wider" style={{ bottom: 28 }}>
        CSC · Odisha
      </p>
    </div>
  );
}


// ─── Route protection ─────────────────────────────────────────────────────────
function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: any) {
  const { user, isLoading, loadingPhase } = useAuth();
  const [location, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading && !user && location !== "/login") {
      setLocation("/login");
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading) return <LoadingScreen phase={loadingPhase} />;

  if (!user) return null;

  if (adminOnly && user.role !== "admin") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-2xl font-bold text-muted-foreground">403</p>
          <p className="text-muted-foreground mt-1">Access restricted to admins only</p>
        </div>
      </div>
    );
  }

  return <Component {...rest} />;
}

// ─── Page transition variants ─────────────────────────────────────────────────
// Only opacity — never willChange:transform (breaks position:fixed bottom nav)
const PAGE_ENTER = {
  opacity: 1,
  transition: {
    duration: 0.2,
    ease: [0.22, 1, 0.36, 1] as const, // custom spring-like easeOut
  },
};
const PAGE_EXIT = {
  opacity: 0,
  transition: {
    duration: 0.08,
    ease: "easeIn" as const,
  },
};

// ─── Router with page transitions ────────────────────────────────────────────
function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={location}
        initial={{ opacity: 0 }}
        animate={PAGE_ENTER}
        exit={PAGE_EXIT}
        style={{ minHeight: "100vh", willChange: "opacity" }}
      >
        <Suspense fallback={<PageSkeleton />}>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/register/closed" component={RegistrationClosed} />
            <Route path="/register/pending" component={RegisterPending} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/reset-password" component={ResetPassword} />
            <Route path="/">{() => <ProtectedRoute component={Dashboard} />}</Route>
            <Route path="/ledger">{() => <ProtectedRoute component={Ledger} />}</Route>
            <Route path="/services">{() => <ProtectedRoute component={Services} />}</Route>
            <Route path="/reports">{() => <ProtectedRoute component={Reports} />}</Route>
            <Route path="/aeps">{() => <ProtectedRoute component={AePS} />}</Route>
            <Route path="/notifications">{() => <ProtectedRoute component={Notifications} />}</Route>
            <Route path="/profile">{() => <ProtectedRoute component={Profile} />}</Route>
            <Route path="/preferences">{() => <Redirect to="/profile" />}</Route>
            <Route path="/users">{() => <ProtectedRoute component={Users} adminOnly />}</Route>
            <Route path="/users-overview">{() => <Redirect to="/users" />}</Route>
            <Route path="/audit-logs">{() => <ProtectedRoute component={AuditLogs} adminOnly />}</Route>
            <Route path="/settings">{() => <Redirect to="/profile" />}</Route>
            <Route path="/backups">{() => <ProtectedRoute component={Backups} adminOnly />}</Route>
            <Route path="/sessions">{() => <ProtectedRoute component={Sessions} />}</Route>
            <Route path="/pwa-status">{() => <ProtectedRoute component={PwaStatus} />}</Route>
            <Route path="/server-health">{() => <ProtectedRoute component={ServerHealth} adminOnly />}</Route>
            <Route path="/download-app">{() => <ProtectedRoute component={DownloadApp} />}</Route>
            <Route path="/about">{() => <ProtectedRoute component={About} />}</Route>
            <Route path="/udhari">{() => <ProtectedRoute component={Udhari} />}</Route>
            <Route path="/udhari/:customerId">{() => <ProtectedRoute component={UdhariCustomer} />}</Route>
            <Route path="/broadcast">{() => <ProtectedRoute component={Broadcast} adminOnly />}</Route>
            <Route path="/receipt-export">{() => <ProtectedRoute component={ReceiptExport} adminOnly />}</Route>
            <Route path="/receipts/verify/:token" component={ReceiptsVerify} />
            <Route path="/receipts/verify/aeps/:token" component={AepsReceiptVerify} />
            <Route path="/receipts/verify/udhari/:token" component={UdhariReceiptVerify} />
            <Route path="/share-target" component={ShareTargetHandler} />
            <Route path="/offline" component={Offline} />
            <Route path="/open-file">{() => <ProtectedRoute component={Ledger} />}</Route>
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
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
    <>
      <SplashScreen visible={showSplash} onDone={handleSplashDone} />
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          buster: typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "3.1.1",
          maxAge: 8 * 60 * 60_000,
          dehydrateOptions: {
            shouldDehydrateQuery: (query) => {
              const key = query.queryKey[0];
              return key !== "auth/me" && query.state.status === "success";
            },
          },
        }}
      >
        <TooltipProvider>
          <ThemeProvider defaultTheme="light" storageKey="sahu-csc-theme">
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AuthProvider>
                <BadgeUpdater />
                <EagerPreloader />
                <SessionManager />
                <SyncBadge />
                <Router />
              </AuthProvider>
            </WouterRouter>
          </ThemeProvider>
          <Toaster />
        </TooltipProvider>
      </PersistQueryClientProvider>
    </>
  );
}

export default App;
