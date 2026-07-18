import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/LoadingScreen";

// ─── Route protection ─────────────────────────────────────────────────────────
export function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: any) {
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
