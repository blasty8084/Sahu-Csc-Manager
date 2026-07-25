import React from "react";
import { useLocation, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/LoadingScreen";

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password"];
const STORAGE_KEY = "sahu-last-route";

// ─── Route protection ─────────────────────────────────────────────────────────
export function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: any) {
  const { user, isLoading, loadingPhase } = useAuth();
  const [location] = useLocation();

  // While auth check is in flight — never redirect
  if (isLoading) return <LoadingScreen phase={loadingPhase} />;

  // Not authenticated — save current path so login can restore it, then redirect
  if (!user) {
    if (!PUBLIC_PATHS.includes(location)) {
      try { sessionStorage.setItem(STORAGE_KEY, location); } catch { /* ignore */ }
    }
    return <Redirect to="/login" />;
  }

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
