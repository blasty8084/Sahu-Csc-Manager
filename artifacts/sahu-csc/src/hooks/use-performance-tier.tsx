import * as React from "react";

export type PerformanceTier = "high" | "medium" | "low";

interface PerformanceInfo {
  /** Device capability bucket. "high" = flagship, "medium" = mid-range, "low" = budget/old device. */
  tier: PerformanceTier;
  /** Frame rate this tier is expected/allowed to target. 60-120 for high, 30-40 for low. */
  targetFps: number;
  /** True if the OS/browser reports a system-wide reduced-motion preference. */
  reducedMotion: boolean;
  /** True on "high"/"medium" tiers — gate expensive decorative loops (rotating rings, staggered dots, etc.) behind this. */
  richAnimations: boolean;
  /** Scales a base duration (ms) for the current tier — shorter on low-end so fewer frames are ever rendered. */
  scaleDuration: (ms: number) => number;
}

const SESSION_KEY = "sahu-perf-tier";

function readCachedTier(): PerformanceTier | null {
  try {
    const v = sessionStorage.getItem(SESSION_KEY);
    if (v === "high" || v === "medium" || v === "low") return v;
  } catch {}
  return null;
}

function writeCachedTier(tier: PerformanceTier) {
  try {
    sessionStorage.setItem(SESSION_KEY, tier);
  } catch {}
}

/** Cheap, synchronous heuristic based on CPU cores / RAM / network — used for the very first render. */
function detectStaticTier(): PerformanceTier {
  if (typeof navigator === "undefined") return "high";

  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as any).deviceMemory as number | undefined;
  const conn = (navigator as any).connection;
  const saveData = Boolean(conn?.saveData);
  const slowNet = conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g";

  let score = 0;
  if (cores >= 8) score += 2;
  else if (cores >= 4) score += 1;
  else score -= 1;

  if (mem !== undefined) {
    if (mem >= 8) score += 2;
    else if (mem >= 4) score += 1;
    else score -= 1;
  }

  if (saveData || slowNet) score -= 2;

  if (score >= 3) return "high";
  if (score >= 0) return "medium";
  return "low";
}

/** Measures real achievable frame time over ~20 frames via requestAnimationFrame. Runs once per session. */
function benchmarkFps(sampleFrames = 20): Promise<number> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "undefined") {
      resolve(60);
      return;
    }
    let frames = 0;
    let last = performance.now();
    const deltas: number[] = [];

    function tick(now: number) {
      frames++;
      deltas.push(now - last);
      last = now;
      if (frames >= sampleFrames) {
        // drop the first few frames (JIT/layout warmup noise)
        const settled = deltas.slice(4);
        const avg = settled.reduce((a, b) => a + b, 0) / Math.max(settled.length, 1);
        resolve(avg > 0 ? 1000 / avg : 60);
      } else {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  });
}

function buildInfo(tier: PerformanceTier, reducedMotion: boolean): PerformanceInfo {
  const targetFps = reducedMotion ? 0 : tier === "high" ? 120 : tier === "medium" ? 60 : 36;
  // Low-end devices get shorter/snappier transitions (less total animated time = fewer dropped frames felt),
  // not longer ones — long animations on weak GPUs are what causes visible jank.
  const durationScale = reducedMotion ? 0 : tier === "high" ? 1 : tier === "medium" ? 0.85 : 0.6;

  return {
    tier,
    targetFps,
    reducedMotion,
    richAnimations: !reducedMotion && tier !== "low",
    scaleDuration: (ms: number) => Math.max(0, Math.round(ms * durationScale)),
  };
}

const PerformanceContext = React.createContext<PerformanceInfo>(buildInfo("high", false));

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [info, setInfo] = React.useState<PerformanceInfo>(() => {
    const reducedMotion =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const tier = readCachedTier() ?? detectStaticTier();
    return buildInfo(tier, Boolean(reducedMotion));
  });

  React.useEffect(() => {
    if (info.reducedMotion) return; // respect user preference — never benchmark or override it
    if (readCachedTier()) return; // already measured this session

    let cancelled = false;
    benchmarkFps().then((fps) => {
      if (cancelled) return;
      const measuredTier: PerformanceTier = fps < 45 ? "low" : fps < 90 ? "medium" : "high";
      const staticTier = detectStaticTier();
      const rank: Record<PerformanceTier, number> = { low: 0, medium: 1, high: 2 };
      // Trust whichever signal is more pessimistic — avoids a lucky first-benchmark frame overselling weak hardware.
      const finalTier = rank[measuredTier] <= rank[staticTier] ? measuredTier : staticTier;
      writeCachedTier(finalTier);
      setInfo(buildInfo(finalTier, false));
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-perf-tier", info.tier);
    document.documentElement.setAttribute("data-reduced-motion", String(info.reducedMotion));
  }, [info.tier, info.reducedMotion]);

  return <PerformanceContext.Provider value={info}>{children}</PerformanceContext.Provider>;
}

export function usePerformanceTier() {
  return React.useContext(PerformanceContext);
}
