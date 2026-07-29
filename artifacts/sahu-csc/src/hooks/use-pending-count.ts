import { useQuery } from "@tanstack/react-query";
import { useNetworkStatus } from "@/hooks/use-network-status";

export function usePendingCount() {
  const { isSlow, isOffline } = useNetworkStatus();
  return useQuery<{ count: number }>({
    queryKey: ["admin-pending-count"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/users/pending-count`, { credentials: "include" });
      if (!res.ok) return { count: 0 };
      return res.json();
    },
    staleTime: isSlow ? 60_000 : 30_000,
    // Back off polling on slow connections; pause while offline.
    refetchInterval: isOffline ? false : isSlow ? 120_000 : 30_000,
    retry: 1,
  });
}
