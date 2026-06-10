import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useGetMe, useLogin, useLogout } from "@workspace/api-client-react";
import type { AuthUser, LoginInput } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import {
  saveUserSession,
  getCachedUserSession,
  clearUserSession,
  type UserSession,
} from "@/lib/offline-db";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const {
    data: liveUser,
    isLoading: liveLoading,
    refetch,
    isError,
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
          if (session) {
            setOfflineUser(session as unknown as AuthUser);
          }
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

  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const handleLogin = async (data: LoginInput) => {
    await loginMutation.mutateAsync({ data });
    await refetch();
    setLocation("/");
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    await clearUserSession().catch(() => {});
    setOfflineUser(null);
    await refetch();
    setLocation("/login");
  };

  const user = liveUser || offlineUser || null;
  const isLoading = liveLoading && !offlineChecked;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
