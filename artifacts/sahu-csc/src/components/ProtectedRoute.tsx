import React from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/LoadingScreen";

// ─── Route protection ─────────────────────────────────────────────────────────
export function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: any) {
  const { user, isLoading, loadingPhase } = useAuth();

  // Wait for auth check to finish — never redirect while loading
  if (isLoading) return <LoadingScreen phase={loadingPhase} />;

  // Not authenticated — redirect to login synchronously (no flash)
  if (!user) return <Redirect to="/login" />;

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
