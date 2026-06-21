import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import type { AuthUser, LoginInput } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import {
  saveUserSession,
  getCachedUserSession,
  clearUserSession,
  type UserSession,
} from "@/lib/offline-db";
import { useQueryClient } from "@tanstack/react-query";

export interface LoginData extends LoginInput {
  rememberMe?: boolean;
}

export type LoadingPhase = "loading" | "slow" | "timeout";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loadingPhase: LoadingPhase;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const {
    data: liveUser,
    isLoading: liveLoading,
  } = useGetMe({
    query: {
      retry: false,
      queryKey: ["auth/me"],
    },
  });

  const [offlineUser, setOfflineUser] = React.useState<AuthUser | null>(null);
  const [offlineChecked, setOfflineChecked] = React.useState(false);
  const [loadingPhase, setLoadingPhase] = React.useState<LoadingPhase>("loading");

  // After 4s still loading → show "slow" message; after 12s → force past loading
  useEffect(() => {
    if (!liveLoading && offlineChecked) return;
    const slowTimer = setTimeout(() => setLoadingPhase("slow"), 4_000);
    const timeoutTimer = setTimeout(() => {
      setLoadingPhase("timeout");
      setOfflineChecked(true); // unblock isLoading so the app can redirect to login
    }, 12_000);
    return () => { clearTimeout(slowTimer); clearTimeout(timeoutTimer); };
  }, [liveLoading, offlineChecked]);

  useEffect(() => {
    if (!navigator.onLine && !liveUser) {
      getCachedUserSession()
        .then((session) => {
          if (session) setOfflineUser(session as unknown as AuthUser);
        })
        .catch(() => {})
        .finally(() => setOfflineChecked(true));
    } else {
      setOfflineChecked(true);
    }
  }, [liveUser]);

  useEffect(() => {
    if (liveUser) {
      const session: UserSession = {
        id: liveUser.id,
        username: liveUser.username,
        fullName: liveUser.fullName ?? "",
        role: liveUser.role,
        email: (liveUser as any).email ?? undefined,
        profilePicture: (liveUser as any).profilePicture,
        cachedAt: Date.now(),
      };
      saveUserSession(session).catch(() => {});
      setOfflineUser(null);
    }
  }, [liveUser]);

  const logoutMutation = useLogout();

  const handleLogin = async (data: LoginData) => {
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    const response = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let errBody: any = {};
      try { errBody = await response.json(); } catch { /* ignore */ }
      const err: any = new Error(errBody.error ?? "Login failed");
      err.locked = errBody.locked;
      err.lockedUntil = errBody.lockedUntil;
      err.attemptsLeft = errBody.attemptsLeft;
      err.rejected = errBody.rejected;
      err.rejectionReason = errBody.rejectionReason ?? null;
      err.pending = errBody.pending;
      throw err;
    }
    // Login response already contains full user data — set it directly in
    // the cache. This avoids a second /auth/me round-trip and bypasses any
    // Replit-proxy cookie-forwarding timing issues.
    const userData: AuthUser = await response.json();
    queryClient.setQueryData(["auth/me"], userData);
  };

  const handleLogout = async () => {
    try { await logoutMutation.mutateAsync(); } catch { /* ignore */ }
    await clearUserSession().catch(() => {});
    setOfflineUser(null);
    queryClient.setQueryData(["auth/me"], null);
    queryClient.clear();
    setLocation("/login");
  };

  const user = liveUser || offlineUser || null;
  const isLoading = liveLoading || !offlineChecked;

  return (
    <AuthContext.Provider value={{ user, isLoading, loadingPhase, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
