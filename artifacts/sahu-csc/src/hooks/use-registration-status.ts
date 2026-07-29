import { useQuery } from "@tanstack/react-query";
import { getApiBase } from "@/lib/api-base";

interface RegistrationStatus {
  open: boolean;
}

export function useRegistrationStatus() {
  return useQuery<RegistrationStatus>({
    queryKey: ["registration-status"],
    queryFn: async () => {
      const base = getApiBase();
      const res = await fetch(`${base}/api/settings/registration-status`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch registration status");
      return res.json();
    },
    staleTime: 60_000,
    retry: 2,
  });
}
