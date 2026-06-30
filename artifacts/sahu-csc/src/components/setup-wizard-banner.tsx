import { useState, useEffect } from "react";
import { AlertTriangle, X, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MissingSecret {
  key: string;
  label: string;
  description: string;
}

interface SetupStatus {
  configured: boolean;
  missing: MissingSecret[];
}

const DISMISS_KEY = "sahu-setup-banner-dismissed-v1";

export function SetupWizardBanner() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === "true") {
      setDismissed(true);
      return;
    }

    fetch("/api/setup-status")
      .then((r) => r.ok ? r.json() : null)
      .then((data: SetupStatus | null) => {
        if (data && !data.configured) setStatus(data);
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  if (!status || dismissed) return null;

  const criticalCount = status.missing.filter((m) => m.key !== "VAPID").length;
  const hasOnlyOptional = criticalCount === 0;

  return (
    <div
      className="border-b"
      style={{
        background: hasOnlyOptional
          ? "linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%)"
          : "linear-gradient(90deg, #fff1f2 0%, #ffe4e6 100%)",
        borderColor: hasOnlyOptional ? "#fbbf24" : "#fca5a5",
      }}
    >
      {/* ── Main row ── */}
      <div className="flex items-start justify-between gap-3 px-4 py-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {/* Icon */}
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: hasOnlyOptional
                ? "rgba(217,119,6,0.12)"
                : "rgba(220,38,38,0.10)",
            }}
          >
            <AlertTriangle
              size={14}
              color={hasOnlyOptional ? "#d97706" : "#dc2626"}
            />
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-semibold leading-none mb-0.5"
              style={{ color: hasOnlyOptional ? "#92400e" : "#991b1b" }}
            >
              {hasOnlyOptional
                ? "Setup Incomplete — Optional Secrets Missing"
                : "Setup Required — App Not Fully Configured"}
            </p>
            <p
              className="text-[11px] leading-snug"
              style={{ color: hasOnlyOptional ? "#a16207" : "#b91c1c" }}
            >
              {status.missing.length} secret
              {status.missing.length !== 1 ? "s" : ""} need
              {status.missing.length === 1 ? "s" : ""} to be configured in the
              Replit Secrets tab.{" "}
              <button
                onClick={() => setExpanded((v) => !v)}
                className="font-semibold underline underline-offset-2 cursor-pointer inline-flex items-center gap-0.5"
                style={{ color: hasOnlyOptional ? "#a16207" : "#b91c1c" }}
              >
                {expanded ? "Hide details" : "Show what's missing"}
                {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            </p>
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="h-6 w-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-opacity hover:opacity-70"
          aria-label="Dismiss"
          style={{ color: hasOnlyOptional ? "#a16207" : "#b91c1c" }}
        >
          <X size={13} />
        </button>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {status.missing.map((item) => (
            <div
              key={item.key}
              className="rounded-xl border px-3 py-2.5 flex items-start gap-2.5"
              style={{
                background: "rgba(255,255,255,0.7)",
                borderColor: hasOnlyOptional
                  ? "rgba(251,191,36,0.4)"
                  : "rgba(252,165,165,0.5)",
              }}
            >
              <span
                className="mt-px text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded flex-shrink-0"
                style={{
                  background: item.key === "VAPID"
                    ? "rgba(217,119,6,0.10)"
                    : "rgba(220,38,38,0.08)",
                  color: item.key === "VAPID" ? "#b45309" : "#dc2626",
                }}
              >
                {item.key === "VAPID" ? "OPTIONAL" : "REQUIRED"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground leading-none mb-0.5">
                  {item.label}
                </p>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {item.description}
                </p>
              </div>
            </div>
          ))}

          {/* CTA */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              className="h-7 px-3 text-xs gap-1.5"
              style={{
                background: hasOnlyOptional ? "#d97706" : "#dc2626",
                color: "#fff",
              }}
              onClick={() => {
                window.open(
                  "https://docs.replit.com/replit-workspace/workspace-features/secrets",
                  "_blank"
                );
              }}
            >
              <ExternalLink size={11} />
              Open Secrets Docs
            </Button>
            <span className="text-[11px] text-muted-foreground">
              Add secrets in the Replit Secrets tab (🔒 icon in the left sidebar),
              then restart the API server.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
