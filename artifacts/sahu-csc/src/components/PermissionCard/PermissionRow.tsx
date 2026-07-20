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
  const isGranted = status === "granted" || status === "skipped";
  const isDenied = status === "denied";
  const isRequesting = status === "requesting";

  return (
    <div
      className={`flex items-start gap-3 py-3 ${showDivider ? "border-b border-gray-100" : ""}`}
      style={{
        // Highlight the row when granted
        background: isGranted
          ? "linear-gradient(90deg, rgba(22,163,74,0.04) 0%, transparent 100%)"
          : "transparent",
        transition: "background 0.4s ease",
        borderRadius: 8,
      }}
    >
      {/* Icon badge — scales up slightly when granted */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: iconBg,
          transform: isGranted ? "scale(1.08)" : "scale(1)",
          transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{description}</p>
      </div>

      {/* Status badge area — fades between states */}
      <div className="flex-shrink-0 self-center relative" style={{ minWidth: 64 }}>
        {/* Allow button */}
        <span
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: `translateY(-50%) scale(${status === "idle" ? 1 : 0.8})`,
            opacity: status === "idle" ? 1 : 0,
            transition: "opacity 0.2s ease, transform 0.2s ease",
            pointerEvents: status === "idle" ? "auto" : "none",
          }}
        >
          <button
            type="button"
            onClick={onAllow}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border active:opacity-70"
            style={{ borderColor: "#1E293B", color: "#1E293B" }}
          >
            Allow
          </button>
        </span>

        {/* Requesting spinner */}
        <span
          className="flex items-center gap-1 text-xs font-medium"
          style={{
            color: "#4F46E5",
            position: "absolute",
            right: 0,
            top: "50%",
            transform: `translateY(-50%) scale(${isRequesting ? 1 : 0.8})`,
            opacity: isRequesting ? 1 : 0,
            transition: "opacity 0.2s ease, transform 0.2s ease",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Requesting...
        </span>

        {/* Granted check */}
        <span
          className="flex items-center gap-1 text-xs font-medium"
          style={{
            color: "#16A34A",
            position: "absolute",
            right: 0,
            top: "50%",
            transform: `translateY(-50%) scale(${isGranted ? 1 : 0.8})`,
            opacity: isGranted ? 1 : 0,
            transition: "opacity 0.25s ease 0.05s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1) 0.05s",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          <Check className="w-3.5 h-3.5" /> Allowed
        </span>

        {/* Denied */}
        <span
          className="flex flex-col items-end gap-0.5"
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: `translateY(-50%) scale(${isDenied ? 1 : 0.8})`,
            opacity: isDenied ? 1 : 0,
            transition: "opacity 0.2s ease, transform 0.2s ease",
            pointerEvents: isDenied ? "auto" : "none",
          }}
        >
          <span className="flex items-center gap-1 text-xs font-medium text-red-500">
            <X className="w-3.5 h-3.5" /> Denied
          </span>
          <button
            type="button"
            onClick={() => {
              try { window.open("chrome://settings/content", "_blank"); } catch { /* ignore */ }
            }}
            className="flex items-center gap-0.5 text-[10px] font-medium text-gray-400 hover:text-gray-600 active:opacity-70"
            style={{ textDecoration: "underline", textUnderlineOffset: 2, whiteSpace: "nowrap" }}
          >
            <ExternalLink className="w-2.5 h-2.5" />
            Enable in Settings
          </button>
        </span>
      </div>
    </div>
  );
}
