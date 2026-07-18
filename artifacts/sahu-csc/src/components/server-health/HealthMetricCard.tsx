/**
 * Shared metric primitives for the Server Health page:
 *   useLiveFps  — rAF-based live FPS sampler
 *   StatCell    — labelled value tile
 *   StatusBadge — ok / degraded / error / ephemeral / disabled badge
 *   TierBadge   — performance-tier badge
 *   DevicePerformanceCard — full "Device Performance" card (self-contained)
 */
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Info, XCircle, Gauge, MonitorSmartphone } from "lucide-react";
import { usePerformanceTier } from "@/hooks/use-performance-tier";

// ── rAF FPS sampler ────────────────────────────────────────────────────────────
export function useLiveFps(enabled: boolean) {
  const [fps, setFps] = useState<number | null>(null);
  const frameCount = useRef(0);
  const windowStart = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || typeof requestAnimationFrame === "undefined") return;
    let cancelled = false;
    windowStart.current = performance.now();
    frameCount.current = 0;

    function tick(now: number) {
      if (cancelled) return;
      frameCount.current++;
      const elapsed = now - windowStart.current;
      if (elapsed >= 500) {
        setFps(Math.round((frameCount.current * 1000) / elapsed));
        frameCount.current = 0;
        windowStart.current = now;
      }
      rafId.current = requestAnimationFrame(tick);
    }
    rafId.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [enabled]);

  return fps;
}

// ── StatCell — labelled metric tile ───────────────────────────────────────────
export function StatCell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-muted/40 rounded-lg px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-sm mt-0.5">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: "ok" | "degraded" | "error" | "ephemeral" | "disabled" | string }) {
  const { t } = useTranslation();
  if (status === "ok") {
    return (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 gap-1">
        <CheckCircle2 size={11} /> {t("server_health.healthy")}
      </Badge>
    );
  }
  if (status === "degraded" || status === "ephemeral") {
    return (
      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 gap-1">
        <AlertTriangle size={11} /> {status === "ephemeral" ? t("server_health.ephemeral") : t("server_health.degraded")}
      </Badge>
    );
  }
  if (status === "disabled") {
    return (
      <Badge className="bg-muted text-muted-foreground gap-1">
        <Info size={11} /> {t("server_health.disabled")}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="gap-1">
      <XCircle size={11} /> {t("common.error")}
    </Badge>
  );
}

// ── TierBadge ─────────────────────────────────────────────────────────────────
export function TierBadge({ tier }: { tier: "high" | "medium" | "low" }) {
  if (tier === "high") {
    return (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 gap-1">
        <CheckCircle2 size={11} /> High
      </Badge>
    );
  }
  if (tier === "medium") {
    return (
      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 gap-1">
        <AlertTriangle size={11} /> Medium
      </Badge>
    );
  }
  return (
    <Badge className="bg-muted text-muted-foreground gap-1">
      <Info size={11} /> Low
    </Badge>
  );
}

// ── DevicePerformanceCard — self-contained, no props ──────────────────────────
export function DevicePerformanceCard() {
  const perf = usePerformanceTier();
  const liveFps = useLiveFps(true);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MonitorSmartphone size={16} className="text-primary" />
            Device Performance
          </CardTitle>
          <TierBadge tier={perf.tier} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCell label="Live FPS" value={liveFps !== null ? `${liveFps} fps` : "Measuring…"} />
          <StatCell label="Target FPS" value={perf.reducedMotion ? "N/A" : `${perf.targetFps} fps`} />
          <StatCell label="Rich Animations" value={perf.richAnimations ? "Enabled" : "Simplified"} />
          <StatCell label="Reduced Motion" value={perf.reducedMotion ? "On (OS preference)" : "Off"} />
        </div>
        <div className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
          perf.tier === "high"
            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
            : perf.tier === "medium"
            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
            : "bg-muted text-muted-foreground"
        }`}>
          <Gauge size={13} className="mt-0.5 flex-shrink-0" />
          {perf.reducedMotion
            ? "OS-level reduced motion is active — all decorative animations are disabled regardless of device tier."
            : perf.tier === "high"
            ? "This device benchmarked strong — full 60–120fps motion and decorative loops are active."
            : perf.tier === "medium"
            ? "This device benchmarked mid-range — animations run at a steady 60fps with standard richness."
            : "This device benchmarked weak — decorative loops are swapped for lightweight pulse effects and transitions are shortened to target 30–40fps."}
        </div>
      </CardContent>
    </Card>
  );
}
