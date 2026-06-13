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

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
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
    refetch,
  } = useGetMe({
    query: {
      retry: false,
      queryKey: ["auth/me"],
    },
  });

  const [offlineUser, setOfflineUser] = React.useState<AuthUser | null>(null);
  const [offlineChecked, setOfflineChecked] = React.useState(false);

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
      throw err;
    }
    await queryClient.invalidateQueries();
    await refetch();
    setLocation("/");
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // If API call fails (session already expired, network error) proceed with client-side cleanup anyway
    }
    await clearUserSession().catch(() => {});
    setOfflineUser(null);
    await refetch().catch(() => {});
    setLocation("/login");
  };

  const user = liveUser || offlineUser || null;
  const isLoading = liveLoading && !offlineChecked;

  return (
    <AuthContext.Provider value={{ user, isLoading, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
