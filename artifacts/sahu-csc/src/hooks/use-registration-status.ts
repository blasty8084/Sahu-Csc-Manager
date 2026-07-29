import { useQuery } from "@tanstack/react-query";

interface RegistrationStatus {
  open: boolean;
}

export function useRegistrationStatus() {
  return useQuery<RegistrationStatus>({
    queryKey: ["registration-status"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/settings/registration-status`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch registration status");
      return res.json();
    },
    staleTime: 60_000,
    retry: 2,
  });
}
