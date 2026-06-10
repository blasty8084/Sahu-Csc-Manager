import { useState, useEffect, useRef } from "react";

export type NetworkQuality = "online" | "slow" | "offline";

export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  isSlow: boolean;
  quality: NetworkQuality;
  latencyMs: number | null;
  effectiveType: string | null;
}

const BASE = typeof window !== "undefined"
  ? (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") ?? ""
  : "";

async function measureLatency(): Promise<number | null> {
  try {
    const start = performance.now();
    await fetch(`${BASE}/api/health`, {
      method: "HEAD",
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    return Math.round(performance.now() - start);
  } catch {
    return null;
  }
}

function getStatus(latencyMs: number | null): NetworkStatus {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  const conn = (navigator as any).connection;
  const effectiveType: string | null = conn?.effectiveType ?? null;

  const isSlowConn = isOnline && !!conn && ["slow-2g", "2g"].includes(effectiveType ?? "");
  const isSlowLatency = isOnline && latencyMs !== null && latencyMs > 2000;
  const isSlow = isSlowConn || isSlowLatency;

  return {
    isOnline,
    isOffline: !isOnline,
    isSlow,
    quality: !isOnline ? "offline" : isSlow ? "slow" : "online",
    latencyMs: isOnline ? latencyMs : null,
    effectiveType,
  };
}

export function useNetworkStatus(): NetworkStatus {
  const [latency, setLatency] = useState<number | null>(null);
  const [status, setStatus] = useState<NetworkStatus>(() => getStatus(null));
  const probeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runProbe = async () => {
    const ms = await measureLatency();
    setLatency(ms);
    setStatus(getStatus(ms));
  };

  useEffect(() => {
    const update = () => {
      setStatus(getStatus(latency));
      if (navigator.onLine) runProbe();
    };

    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const conn = (navigator as any).connection;
    conn?.addEventListener("change", update);

    runProbe();

    probeRef.current = setInterval(() => {
      if (navigator.onLine) runProbe();
    }, 30_000);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      conn?.removeEventListener("change", update);
      if (probeRef.current) clearInterval(probeRef.current);
    };
  }, []);

  return status;
}
