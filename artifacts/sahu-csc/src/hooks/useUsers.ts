import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";

export function useAdminSessions() {
  return useQuery<any[]>({
    queryKey: ["admin-sessions"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/sessions`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function usePendingUsers() {
  return useQuery<any[]>({
    queryKey: ["admin-pending-users"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/users/pending`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useAppealUsers() {
  return useQuery<any[]>({
    queryKey: ["admin-appeal-users"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/users/appeals`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useUsersOverview() {
  return useQuery({
    queryKey: ["admin", "users-overview"],
    queryFn: () => customFetch<any[]>("/api/admin/users-overview"),
  });
}

export function useUserLedger(userId: number | null, page: number) {
  return useQuery({
    queryKey: ["admin", "user-ledger", userId, page],
    queryFn: () => customFetch<any>(`/api/admin/users-overview/${userId}/ledger?page=${page}&limit=15`),
    enabled: userId !== null,
  });
}

export interface AepsUserSummary {
  userId: number;
  username: string;
  fullName: string | null;
  role: string;
  latestBalance: number;
  latestDate: string;
  totalWithdrawals: number;
  totalDeposits: number;
  totalTransactions: number;
  sessionCount: number;
  sessions: any[];
}

export function useAepsOverview() {
  return useQuery<any[]>({
    queryKey: ["admin", "aeps-overview"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/aeps-overview`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 30_000,
  });
}
