import { Check, ExternalLink, Loader2, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PermStatus } from "./usePermissions";

interface PermissionRowProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  status: PermStatus;
  onAllow: () => void;
  showDivider?: boolean;
}

export function PermissionRow({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  status,
  onAllow,
  showDivider,
}: PermissionRowProps) {
  return (
    <div className={`flex items-start gap-3 py-3 ${showDivider ? "border-b border-gray-100" : ""}`}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{description}</p>
      </div>

      <div className="flex-shrink-0 self-center">
        {status === "idle" && (
          <button
            type="button"
            onClick={onAllow}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors active:opacity-70"
            style={{ borderColor: "#1E293B", color: "#1E293B" }}
          >
            Allow
          </button>
        )}
        {status === "requesting" && (
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#4F46E5" }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Requesting...
          </span>
        )}
        {(status === "granted" || status === "skipped") && (
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#16A34A" }}>
            <Check className="w-3.5 h-3.5" /> Allowed
          </span>
        )}
        {status === "denied" && (
          <div className="flex flex-col items-end gap-0.5">
            <span className="flex items-center gap-1 text-xs font-medium text-red-500">
              <X className="w-3.5 h-3.5" /> Denied
            </span>
            <button
              type="button"
              onClick={() => {
                // Open browser settings — best-effort, works on Android Chrome
                // and some desktop browsers. Silently ignored elsewhere.
                try {
                  window.open("chrome://settings/content", "_blank");
                } catch { /* ignore */ }
              }}
              className="flex items-center gap-0.5 text-[10px] font-medium text-gray-400 underline-offset-2 hover:text-gray-600 active:opacity-70"
              style={{ textDecoration: "underline" }}
            >
              <ExternalLink className="w-2.5 h-2.5" />
              Enable in Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
