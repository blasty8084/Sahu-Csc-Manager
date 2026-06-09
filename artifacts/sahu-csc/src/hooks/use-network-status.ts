import { useState, useEffect } from "react";

export type NetworkQuality = "online" | "slow" | "offline";

export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  isSlow: boolean;
  quality: NetworkQuality;
}

function getStatus(): NetworkStatus {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  const conn = (navigator as any).connection;
  const isSlow = isOnline && !!conn && ["slow-2g", "2g"].includes(conn.effectiveType ?? "");
  return {
    isOnline,
    isOffline: !isOnline,
    isSlow,
    quality: !isOnline ? "offline" : isSlow ? "slow" : "online",
  };
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(getStatus);

  useEffect(() => {
    const update = () => setStatus(getStatus());
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const conn = (navigator as any).connection;
    conn?.addEventListener("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      conn?.removeEventListener("change", update);
    };
  }, []);

  return status;
}
