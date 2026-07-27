import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { AlertTriangle, X, ChevronDown, ChevronUp, ActivitySquare } from "lucide-react";

interface HealthzResponse {
  status: "ok" | "degraded" | "error";
  warnings: string[];
}

const DISMISS_KEY = "sahu-server-health-banner-dismissed-v1";
const POLL_MS = 30_000;

export function ServerHealthBanner() {
  const [warnings, setWarnings] = useState<string[]>([]);
  const [status, setStatus] = useState<"ok" | "degraded" | "error">("ok");
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === "true") {
      setDismissed(true);
    }

    const check = () => {
      fetch("/api/healthz", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: HealthzResponse | null) => {
          if (!data) return;
          setStatus(data.status);
          setWarnings(Array.isArray(data.warnings) ? data.warnings : []);
        })
        .catch(() => {});
    };

    check();
    timerRef.current = setInterval(check, POLL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  if (dismissed || status === "ok" || warnings.length === 0) return null;

  const isError = status === "error";

  return (
    <div
      className="border-b"
      style={{
        background: isError
          ? "linear-gradient(90deg, var(--color-error-bg-sm) 0%, #ffe4e6 100%)"
          : "linear-gradient(90deg, #fffbeb 0%, var(--color-warning-bg) 100%)",
        borderColor: isError ? "var(--color-rose-300)" : "var(--brand-orange-300)",
      }}
    >
      <div className="flex items-start justify-between gap-3 px-4 py-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: isError ? "var(--color-error-bg)" : "var(--color-warning-tint)" }}
          >
            <ActivitySquare size={14} color={isError ? "var(--color-error-dim)" : "var(--color-warning)"} />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-semibold leading-none mb-0.5"
              style={{ color: isError ? "var(--color-red-800)" : "var(--color-warning-dark)" }}
            >
              {isError ? "Server Health Alert" : "Server Performance Warning"}
            </p>
            <p className="text-[11px] leading-snug" style={{ color: isError ? "var(--color-error-deep)" : "var(--color-warning-text)" }}>
              {warnings.length} issue{warnings.length !== 1 ? "s" : ""} detected.{" "}
              <button
                onClick={() => setExpanded((v) => !v)}
                className="font-semibold underline underline-offset-2 cursor-pointer inline-flex items-center gap-0.5"
                style={{ color: isError ? "var(--color-error-deep)" : "var(--color-warning-text)" }}
              >
                {expanded ? "Hide details" : "Show details"}
                {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="h-6 w-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-opacity hover:opacity-70"
          aria-label="Dismiss"
          style={{ color: isError ? "var(--color-error-deep)" : "var(--color-warning-text)" }}
        >
          <X size={13} />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="rounded-xl border px-3 py-2.5 flex items-start gap-2.5"
              style={{
                background: "rgba(255,255,255,0.7)",
                borderColor: isError ? "rgba(252,165,165,0.5)" : "var(--color-warning-amber-glow)",
              }}
            >
              <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" color={isError ? "var(--color-error-dim)" : "var(--color-warning)"} />
              <p className="text-[11px] text-foreground leading-snug">{w}</p>
            </div>
          ))}
          <div className="pt-1">
            <Link
              href="/server-health"
              className="text-[11px] font-semibold underline underline-offset-2"
              style={{ color: isError ? "var(--color-error-deep)" : "var(--color-warning-text)" }}
            >
              Open Server Health page →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
