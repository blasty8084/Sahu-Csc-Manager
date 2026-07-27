import { KeyRound, AlertTriangle, Check, RefreshCw } from "lucide-react";

const NAVY  = "var(--brand-navy)";
const GREEN = "var(--color-success-light)";
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
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm">
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
          <span className="text-muted-foreground">{codesRemaining} of {TOTAL_CODES} remaining</span>
          <span style={{ color: low ? "var(--color-error-std)" : GREEN }}>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: low ? "var(--color-error-std)" : GREEN }}
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
        <div className="rounded-xl bg-muted border border-border p-3">
          <p className="text-[11px] text-muted-foreground mb-2">
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
                    background: used ? "hsl(var(--muted))" : "var(--color-success-bg-light)",
                    border:     `1px solid ${used ? "hsl(var(--border))" : "var(--color-success-glow)"}`,
                  }}
                >
                  {used
                    ? <div className="w-3 h-0.5 rounded bg-gray-300" />
                    : <Check size={10} className="text-emerald-600" />}
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">Green = available · Grey = used</p>
        </div>
      )}

      {/* Regenerate trigger */}
      <button
        type="button"
        onClick={onRegen}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed text-sm font-semibold transition-colors"
        style={{ borderColor: "var(--color-gray-200)", color: "#6b7280" }}
      >
        <RefreshCw size={13} />
        Generate new backup codes
      </button>
    </div>
  );
}
