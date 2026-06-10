import React, { useState, useCallback, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIdleTimer } from "@/hooks/use-idle-timer";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Dashboard from "@/pages/dashboard";
import Ledger from "@/pages/ledger";
import Services from "@/pages/services";
import Reports from "@/pages/reports";
import Notifications from "@/pages/notifications";
import AuditLogs from "@/pages/audit-logs";
import Users from "@/pages/users";
import UsersOverview from "@/pages/users-overview";
import Settings from "@/pages/settings";
import Backups from "@/pages/backups";
import AePS from "@/pages/aeps";
import Profile from "@/pages/profile";
import Offline from "@/pages/offline";
import PwaStatus from "@/pages/pwa-status";
import DownloadApp from "@/pages/download-app";
import { Redirect } from "wouter";
import { useListNotifications } from "@workspace/api-client-react";
import { updateAppBadge } from "@/lib/pwa-badge";

// ─── QueryClient — detects SESSION_REPLACED from any failed request ───────────
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

// ─── Idle / session-replaced manager (only rendered when logged in) ──────────
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

  // SESSION_REPLACED: another device logged in
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

// ─── Route protection ─────────────────────────────────────────────────────────
function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: any) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading && !user && location !== "/login") {
      setLocation("/login");
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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

// ─── Router ───────────────────────────────────────────────────────────────────
function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
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
      <Route path="/users-overview">{() => <ProtectedRoute component={UsersOverview} adminOnly />}</Route>
      <Route path="/audit-logs">{() => <ProtectedRoute component={AuditLogs} adminOnly />}</Route>
      <Route path="/settings">{() => <ProtectedRoute component={Settings} adminOnly />}</Route>
      <Route path="/backups">{() => <ProtectedRoute component={Backups} adminOnly />}</Route>
      <Route path="/pwa-status">{() => <ProtectedRoute component={PwaStatus} />}</Route>
      <Route path="/download-app">{() => <ProtectedRoute component={DownloadApp} />}</Route>
      <Route path="/share-target" component={ShareTargetHandler} />
      <Route path="/offline" component={Offline} />
      <Route path="/open-file">{() => <ProtectedRoute component={Ledger} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
function App() {
  return (
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
  );
}

export default App;
