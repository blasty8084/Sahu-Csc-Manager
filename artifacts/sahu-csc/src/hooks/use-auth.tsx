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
import { getDeviceFingerprint } from "@/lib/device-fingerprint";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardQueryOptions,
  getGetBalanceQueryOptions,
  getListLedgerEntriesQueryOptions,
  getListNotificationsQueryOptions,
  getGetProfileQueryOptions,
  getListServicesQueryOptions,
  getGetPreferencesQueryOptions,
} from "@workspace/api-client-react";

export interface LoginData extends LoginInput {
  rememberMe?: boolean;
}

export type LoadingPhase = "loading" | "slow" | "timeout";

// Returned by `login()` when the credentials are correct but a 2FA/device
// challenge must be completed before a session is issued.
export interface TwoFaChallenge {
  requires2fa: true;
  isNewDevice: boolean;
  maskedEmail?: string;
  // Whether the account already has an authenticator app enrolled — decides
  // whether picking "Authenticator App" shows the 6-digit input or the
  // "Set up Authenticator" QR enrollment flow.
  totpEnrolled?: boolean;
}

export interface TwoFaVerifyInput {
  code: string;
  trustDevice?: boolean;
  isBackupCode?: boolean;
}

export interface TotpSetupData {
  enrolled: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loadingPhase: LoadingPhase;
  login: (data: LoginData) => Promise<TwoFaChallenge | void>;
  // Resolves without applying the session yet when the response includes
  // freshly-minted `backupCodes` (first-time TOTP enrollment mid-login) —
  // the caller should show those to the user, then call `completeLogin`.
  // Otherwise the session is applied immediately and this resolves to void.
  verifyTwoFactor: (method: "otp" | "totp", data: TwoFaVerifyInput) => Promise<{ backupCodes: string[]; user: AuthUser } | void>;
  completeLogin: (user: AuthUser) => void;
  // Switches the pending login challenge's method. "otp" (re)sends the email
  // code (also used as "Resend"); "totp" just reports enrollment status.
  switchTwoFaMethod: (method: "otp" | "totp") => Promise<{ maskedEmail?: string; totpEnrolled?: boolean }>;
  // Begins first-time TOTP enrollment mid-login (no authenticator set up yet).
  setupTotpPending: () => Promise<TotpSetupData>;
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

  const applyLoggedInUser = (userData: AuthUser) => {
    // Login/2FA-verify responses already contain full user data — set it
    // directly in the cache. This avoids a second /auth/me round-trip and
    // bypasses any Replit-proxy cookie-forwarding timing issues.
    queryClient.setQueryData(["auth/me"], userData);
    void queryClient.prefetchQuery(getGetDashboardQueryOptions());
    void queryClient.prefetchQuery(getGetBalanceQueryOptions());
    void queryClient.prefetchQuery(getListLedgerEntriesQueryOptions());
    void queryClient.prefetchQuery(getListNotificationsQueryOptions());
    void queryClient.prefetchQuery(getGetProfileQueryOptions());
    void queryClient.prefetchQuery(getListServicesQueryOptions());
    void queryClient.prefetchQuery(getGetPreferencesQueryOptions());
  };

  const apiBase = () => import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

  const handleLogin = async (data: LoginData): Promise<TwoFaChallenge | void> => {
    const deviceFingerprint = await getDeviceFingerprint();
    const response = await fetch(`${apiBase()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...data, deviceFingerprint }),
    });
    let body: any = {};
    try { body = await response.json(); } catch { /* ignore */ }
    if (!response.ok) {
      const err: any = new Error(body.error ?? "Login failed");
      err.locked = body.locked;
      err.lockedUntil = body.lockedUntil;
      err.attemptsLeft = body.attemptsLeft;
      err.rejected = body.rejected;
      err.rejectionReason = body.rejectionReason ?? null;
      err.pending = body.pending;
      throw err;
    }
    if (body.requires2fa) {
      return {
        requires2fa: true,
        isNewDevice: !!body.isNewDevice,
        maskedEmail: body.maskedEmail,
        totpEnrolled: !!body.totpEnrolled,
      };
    }
    applyLoggedInUser(body as AuthUser);
  };

  const verifyTwoFactor = async (method: "otp" | "totp", data: TwoFaVerifyInput) => {
    const path = method === "totp" ? "/api/auth/2fa/verify-totp" : "/api/auth/2fa/verify-otp";
    // The backend expects different field names per method/mode:
    //  - verify-totp: { code, backupCode, trustDevice }
    //  - verify-otp:  { otp, backupCode, trustDevice }
    // `data.code` holds whichever value the user typed (a 6-digit code or a
    // backup code); route it to the right field based on `isBackupCode` and
    // `method` so the server actually looks it up correctly.
    const payload: Record<string, unknown> = { trustDevice: data.trustDevice };
    if (data.isBackupCode) {
      payload.backupCode = data.code;
    } else if (method === "totp") {
      payload.code = data.code;
    } else {
      payload.otp = data.code;
    }
    const response = await fetch(`${apiBase()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    let body: any = {};
    try { body = await response.json(); } catch { /* ignore */ }
    if (!response.ok) {
      throw new Error(body.error ?? "Verification failed");
    }
    // Present when this verify call also confirmed first-time TOTP enrollment
    // (user picked "Authenticator App" mid-login and had none set up yet) —
    // hold off applying the session so the caller can show the codes first.
    if (body.backupCodes) {
      const { backupCodes, ...userData } = body;
      return { backupCodes: backupCodes as string[], user: userData as AuthUser };
    }
    applyLoggedInUser(body as AuthUser);
    return undefined;
  };

  const completeLogin = (userData: AuthUser) => applyLoggedInUser(userData);

  const switchTwoFaMethod = async (method: "otp" | "totp") => {
    const response = await fetch(`${apiBase()}/api/auth/2fa/switch-method`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ method }),
    });
    let body: any = {};
    try { body = await response.json(); } catch { /* ignore */ }
    if (!response.ok) {
      throw new Error(body.error ?? "Failed to switch verification method");
    }
    return { maskedEmail: body.maskedEmail as string | undefined, totpEnrolled: !!body.totpEnrolled };
  };

  const setupTotpPending = async (): Promise<TotpSetupData> => {
    const response = await fetch(`${apiBase()}/api/auth/2fa/setup-totp-pending`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    let body: any = {};
    try { body = await response.json(); } catch { /* ignore */ }
    if (!response.ok) {
      throw new Error(body.error ?? "Failed to start authenticator setup");
    }
    return { enrolled: true };
  };

  const handleLogout = async () => {
    try { await logoutMutation.mutateAsync(); } catch { /* ignore */ }
    await clearUserSession().catch(() => {});
    setOfflineUser(null);
    queryClient.setQueryData(["auth/me"], null);
    queryClient.clear();
    try { sessionStorage.removeItem("sahu-csc-rq-cache"); } catch { /* ignore */ }
    setLocation("/login");
  };

  const user = liveUser || offlineUser || null;
  const isLoading = liveLoading || !offlineChecked;

  return (
    <AuthContext.Provider value={{ user, isLoading, loadingPhase, login: handleLogin, verifyTwoFactor, completeLogin, switchTwoFaMethod, setupTotpPending, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
