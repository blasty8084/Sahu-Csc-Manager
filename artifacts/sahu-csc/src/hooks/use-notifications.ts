import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNetworkStatus } from "@/hooks/use-network-status";

const BASE = "/api";

async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(`${BASE}/notifications/unread-count`, { credentials: "include" });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count ?? 0;
}

export function useUnreadCount() {
  const { isSlow, isOffline } = useNetworkStatus();
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: fetchUnreadCount,
    // Back off polling on slow connections to save bandwidth/battery;
    // pause entirely while offline (React Query still serves cached data).
    refetchInterval: isOffline ? false : isSlow ? 120_000 : 30_000,
    refetchIntervalInBackground: false,
    staleTime: isSlow ? 60_000 : 15_000,
  });
}

export function useInvalidateNotifications() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };
}
