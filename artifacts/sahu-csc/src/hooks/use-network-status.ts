import { useSyncExternalStore } from "react";

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

const PROBE_INTERVAL_MS = 30_000;

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

// This hook is consumed by many dashboard/PWA components. Keep one shared
// browser probe instead of creating one timer and one /api/health request per
// component instance. The state lives on globalThis, not only in this module:
// Vite can place copies of a shared hook into multiple lazy chunks.
interface SharedProbeState {
  status: NetworkStatus;
  timer: ReturnType<typeof setInterval> | null;
  inFlight: boolean;
  listeners: Set<() => void>;
  onlineListenersAttached: boolean;
  onlineHandler: (() => void) | null;
}

const shared: SharedProbeState = (() => {
  const root = globalThis as typeof globalThis & { __SAHU_NETWORK_PROBE__?: SharedProbeState };
  return root.__SAHU_NETWORK_PROBE__ ??= {
    status: getStatus(null),
    timer: null,
    inFlight: false,
    listeners: new Set(),
    onlineListenersAttached: false,
    onlineHandler: null,
  };
})();

function notify() {
  shared.listeners.forEach((listener) => listener());
}

async function runSharedProbe() {
  if (shared.inFlight) return;
  shared.inFlight = true;
  try {
    const ms = await measureLatency();
    shared.status = getStatus(ms);
    notify();
  } finally {
    shared.inFlight = false;
  }
}

function handleConnectionChange() {
  shared.status = getStatus(shared.status.latencyMs);
  notify();
  if (typeof navigator !== "undefined" && navigator.onLine) {
    void runSharedProbe();
  }
}

function startSharedProbe() {
  if (typeof window === "undefined" || shared.onlineListenersAttached) return;
  shared.onlineListenersAttached = true;
  shared.onlineHandler = handleConnectionChange;
  window.addEventListener("online", shared.onlineHandler);
  window.addEventListener("offline", shared.onlineHandler);
  const conn = (navigator as any).connection;
  conn?.addEventListener("change", shared.onlineHandler);
  void runSharedProbe();
  shared.timer = setInterval(() => {
    if (navigator.onLine) void runSharedProbe();
  }, PROBE_INTERVAL_MS);
}

function stopSharedProbe() {
  if (!shared.onlineListenersAttached) return;
  const handler = shared.onlineHandler;
  if (handler) {
    window.removeEventListener("online", handler);
    window.removeEventListener("offline", handler);
    const conn = (navigator as any).connection;
    conn?.removeEventListener("change", handler);
  }
  if (shared.timer) clearInterval(shared.timer);
  shared.timer = null;
  shared.onlineListenersAttached = false;
  shared.onlineHandler = null;
  shared.inFlight = false;
}

function subscribe(listener: () => void) {
  shared.listeners.add(listener);
  if (shared.listeners.size === 1) startSharedProbe();
  return () => {
    shared.listeners.delete(listener);
    if (shared.listeners.size === 0) stopSharedProbe();
  };
}

function getSnapshot() {
  return shared.status;
}

function getServerSnapshot() {
  return shared.status;
}

export function useNetworkStatus(): NetworkStatus {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
