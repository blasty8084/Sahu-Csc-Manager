import React, { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
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
import { useListNotifications } from "@workspace/api-client-react";
import { updateAppBadge } from "@/lib/pwa-badge";
import { Redirect } from "wouter";

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
const Settings           = lazy(() => import("@/pages/settings"));
const Backups            = lazy(() => import("@/pages/backups"));
const AePS               = lazy(() => import("@/pages/aeps"));
const Profile            = lazy(() => import("@/pages/profile"));
const PwaStatus          = lazy(() => import("@/pages/pwa-status"));
const ServerHealth       = lazy(() => import("@/pages/server-health"));
const DownloadApp        = lazy(() => import("@/pages/download-app"));

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
      staleTime: 30_000,
    },
  },
});

// ─── Badge ────────────────────────────────────────────────────────────────────
function BadgeUpdater() {
  const { data } = useListNotifications({ unreadOnly: true });
  const count = Array.isArray(data) ? data.length : 0;
  useEffect(() => { updateAppBadge(count); }, [count]);
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

// ─── Full-screen loading (used while auth is resolving + Suspense fallback) ────
function LoadingScreen({ phase = "loading" }: { phase?: LoadingPhase }) {
  const [count, setCount] = React.useState(0);

  // 0 → 100 counter: fast start, decelerates near the end
  React.useEffect(() => {
    if (phase === "timeout") return;
    let current = 0;
    const tick = () => {
      // Ease-out: big steps early, tiny steps near 100
      const remaining = 100 - current;
      const step = Math.max(1, Math.ceil(remaining * 0.045));
      current = Math.min(100, current + step);
      setCount(current);
      if (current < 100) {
        setTimeout(tick, 28 + (current / 100) * 38); // slows as it approaches 100
      }
    };
    const id = setTimeout(tick, 120);
    return () => clearTimeout(id);
  }, [phase]);

  const circumference = 2 * Math.PI * 44; // radius 44
  const strokeDashoffset = circumference - (count / 100) * circumference;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none"
      style={{ background: "linear-gradient(160deg, #080f2e 0%, #0b2c60 60%, #0f1f4a 100%)" }}
    >
      {/* Radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 68%)",
        }}
      />

      {/* Circular progress + logo */}
      <motion.div
        initial={{ scale: 0.72, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.34, 1.4, 0.64, 1] }}
        className="relative flex items-center justify-center"
        style={{ width: 140, height: 140 }}
      >
        {/* SVG circular progress ring */}
        <svg
          width="140" height="140"
          style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
        >
          {/* Track */}
          <circle
            cx="70" cy="70" r="44"
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="3"
          />
          {/* Progress arc */}
          {phase !== "timeout" && (
            <circle
              cx="70" cy="70" r="44"
              fill="none"
              stroke="url(#arcGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.08s linear" }}
            />
          )}
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>
        </svg>

        {/* Logo circle */}
        <div
          className="rounded-full overflow-hidden"
          style={{
            width: 96, height: 96,
            border: "3px solid rgba(255,255,255,0.13)",
            boxShadow: "0 0 28px rgba(249,115,22,0.18), 0 8px 28px rgba(0,0,0,0.5)",
          }}
        >
          <img src="/sahu-logo.png" alt="SAHU CSC" className="w-full h-full object-cover" />
        </div>
      </motion.div>

      {/* Brand name */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.4 }}
        className="mt-6 text-center"
      >
        <h1 className="text-2xl font-black tracking-wide">
          <span className="text-white">SAHU </span>
          <span style={{ color: "#F97316" }}>CSC</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>
          Management Platform
        </p>
      </motion.div>

      {/* Counter / status block */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="mt-6 flex flex-col items-center gap-2"
      >
        {phase !== "timeout" && (
          <>
            {/* Big percent number */}
            <p
              className="tabular-nums font-black"
              style={{ fontSize: 38, lineHeight: 1, color: "#fff", letterSpacing: "-0.02em" }}
            >
              {count}
              <span style={{ fontSize: 18, color: "#f97316", marginLeft: 2 }}>%</span>
            </p>

            {/* Thin progress bar */}
            <div
              className="rounded-full overflow-hidden"
              style={{ width: 120, height: 2, background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${count}%`,
                  background: "linear-gradient(90deg, #f97316, #fb923c)",
                  transition: "width 0.08s linear",
                }}
              />
            </div>

            {/* Phase label */}
            {phase === "slow" ? (
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                Server starting up…
              </p>
            ) : (
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>Loading…</p>
            )}
          </>
        )}

        {phase === "timeout" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)" }}>Server is taking too long</p>
            <button
              onClick={() => window.location.reload()}
              className="font-bold rounded-full"
              style={{
                fontSize: 12, padding: "8px 24px",
                background: "linear-gradient(90deg, #f97316, #fb923c)",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(249,115,22,0.4)",
              }}
            >
              Retry
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Footer tag */}
      <p
        className="absolute"
        style={{ bottom: 28, fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.14)" }}
      >
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

// ─── Router with page transitions ────────────────────────────────────────────
function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        style={{ minHeight: "100vh" }}
      >
        <Suspense fallback={<LoadingScreen />}>
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
            <Route path="/settings">{() => <ProtectedRoute component={Settings} adminOnly />}</Route>
            <Route path="/backups">{() => <ProtectedRoute component={Backups} adminOnly />}</Route>
            <Route path="/sessions">{() => <ProtectedRoute component={Sessions} />}</Route>
            <Route path="/pwa-status">{() => <ProtectedRoute component={PwaStatus} />}</Route>
            <Route path="/server-health">{() => <ProtectedRoute component={ServerHealth} adminOnly />}</Route>
            <Route path="/download-app">{() => <ProtectedRoute component={DownloadApp} />}</Route>
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
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider defaultTheme="light" storageKey="sahu-csc-theme">
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AuthProvider>
                <BadgeUpdater />
                <SessionManager />
                <Router />
              </AuthProvider>
            </WouterRouter>
          </ThemeProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
