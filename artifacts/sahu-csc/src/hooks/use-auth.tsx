import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useGetMe, useLogin, useLogout } from "@workspace/api-client-react";
import type { AuthUser, LoginInput } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading, refetch } = useGetMe({
    query: {
      retry: false,
      queryKey: ["auth/me"],
    }
  });

  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const handleLogin = async (data: LoginInput) => {
    await loginMutation.mutateAsync({ data });
    await refetch();
    setLocation("/");
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    await refetch();
    setLocation("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
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
