import { useQuery } from "@tanstack/react-query";

export function usePendingCount() {
  return useQuery<{ count: number }>({
    queryKey: ["admin-pending-count"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/users/pending-count`, { credentials: "include" });
      if (!res.ok) return { count: 0 };
      return res.json();
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: 1,
  });
}
