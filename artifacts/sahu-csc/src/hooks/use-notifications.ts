import { useQuery, useQueryClient } from "@tanstack/react-query";

const BASE = "/api";

async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(`${BASE}/notifications/unread-count`, { credentials: "include" });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count ?? 0;
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: fetchUnreadCount,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    staleTime: 15_000,
  });
}

export function useInvalidateNotifications() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };
}
