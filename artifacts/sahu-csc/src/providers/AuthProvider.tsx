import React, { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { AuthProvider as HookAuthProvider, useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useIdleTimer } from "@/hooks/use-idle-timer";
import { useUnreadCount } from "@/hooks/use-notifications";
import { updateAppBadge } from "@/lib/pwa-badge";
import { SyncBadge } from "@/components/sync-badge";
import { PermissionCard } from "@/components/PermissionCard";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/providers/QueryProvider";

// ─── Badge — keeps the OS app badge in sync with the unread notification count ─
function BadgeUpdater() {
  const { data: count = 0 } = useUnreadCount();
  useEffect(() => { updateAppBadge(count); }, [count]);
  return null;
}

// ─── Eager chunk preloader — fires when the browser is idle after login ────────
function EagerPreloader() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    const preload = () => {
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
    };
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(preload, { timeout: 5000 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(preload, 3000);
      return () => clearTimeout(id);
    }
  }, [user]);
  return null;
}

// ─── First-login onboarding gate — compact popup, non-skippable, shown once ───
function FirstLoginGate() {
  const { user } = useAuth();
  if (!user || (user as any).firstLoginCompleted) return null;
  return <PermissionCard />;
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

// ─── AppAuthProvider — bundles HookAuthProvider + all session side-effects ────
interface AppAuthProviderProps {
  children: React.ReactNode;
}

export function AppAuthProvider({ children }: AppAuthProviderProps) {
  return (
    <HookAuthProvider>
      <BadgeUpdater />
      <EagerPreloader />
      <SessionManager />
      <SyncBadge />
      <FirstLoginGate />
      {children}
    </HookAuthProvider>
  );
}
