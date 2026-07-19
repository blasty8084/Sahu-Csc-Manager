import { KeyRound, AlertTriangle, Check, RefreshCw } from "lucide-react";

const NAVY  = "#0B1340";
const GREEN = "#10b981";
const TOTAL_CODES = 8;

interface BackupCodesHealthBarProps {
  codesRemaining: number;
  twoFaMethod: "otp" | "totp";
  showCodes: boolean;
  onToggleShowCodes: () => void;
  onRegen: () => void;
}

/**
 * Backup codes section card — progress bar, availability grid, and
 * "Generate new codes" trigger. Rendered only when 2FA is enabled.
 */
export function BackupCodesHealthBar({
  codesRemaining,
  twoFaMethod,
  showCodes,
  onToggleShowCodes,
  onRegen,
}: BackupCodesHealthBarProps) {
  const pct = Math.round((codesRemaining / TOTAL_CODES) * 100);
  const low = codesRemaining <= 2;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound size={14} style={{ color: NAVY }} />
          <p className="text-sm font-bold" style={{ color: NAVY }}>Backup Codes</p>
        </div>
        <button
          type="button"
          onClick={onToggleShowCodes}
          className="text-xs font-semibold px-3 py-1 rounded-full transition-colors"
          style={{ background: showCodes ? NAVY : "#eef0f9", color: showCodes ? "white" : NAVY }}
        >
          {showCodes ? "Hide" : "Show status"}
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">{codesRemaining} of {TOTAL_CODES} remaining</span>
          <span style={{ color: low ? "#ef4444" : GREEN }}>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: low ? "#ef4444" : GREEN }}
          />
        </div>
        {low && (
          <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
            <AlertTriangle size={10} />
            Running low — generate fresh codes below.
          </p>
        )}
      </div>

      {/* Code-slot grid */}
      {showCodes && (
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
          <p className="text-[11px] text-gray-400 mb-2">
            Your actual codes are hidden for security. Use them only if you lose access to your{" "}
            {twoFaMethod === "totp" ? "authenticator app" : "email"}.
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: TOTAL_CODES }).map((_, i) => {
              const used = i < TOTAL_CODES - codesRemaining;
              return (
                <div
                  key={i}
                  className="h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: used ? "#f3f4f6" : "#d1fae5",
                    border:     `1px solid ${used ? "#e5e7eb" : "#a7f3d0"}`,
                  }}
                >
                  {used
                    ? <div className="w-3 h-0.5 rounded bg-gray-300" />
                    : <Check size={10} className="text-emerald-600" />}
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">Green = available · Grey = used</p>
        </div>
      )}

      {/* Regenerate trigger */}
      <button
        type="button"
        onClick={onRegen}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed text-sm font-semibold transition-colors"
        style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
      >
        <RefreshCw size={13} />
        Generate new backup codes
      </button>
    </div>
  );
}
