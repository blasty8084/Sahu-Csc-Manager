import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";

const ORANGE = "#F97316";

interface TotpRegenCardProps {
  codesRemaining: number;
  password: string;
  showPass: boolean;
  isPending: boolean;
  onPasswordChange: (v: string) => void;
  onToggleShowPass: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Password-confirm dialog for regenerating backup codes.
 * Shows an amber warning that all existing codes are invalidated.
 */
export function TotpRegenCard({
  codesRemaining,
  password,
  showPass,
  isPending,
  onPasswordChange,
  onToggleShowPass,
  onConfirm,
  onCancel,
}: TotpRegenCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-4 space-y-3 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fff7ed" }}>
          <RefreshCw size={16} style={{ color: ORANGE }} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Regenerate backup codes</p>
          <p className="text-xs text-gray-400">Old codes will be permanently invalidated</p>
        </div>
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
        <p className="text-xs text-amber-700 flex items-start gap-1.5">
          <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
          All {codesRemaining} remaining backup codes will be invalidated immediately. Save the new ones before closing.
        </p>
      </div>

      <div className="relative">
        <Input
          autoFocus
          type={showPass ? "text" : "password"}
          placeholder="Current password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && password && onConfirm()}
          className="pr-10 h-11"
        />
        <button
          type="button"
          onClick={onToggleShowPass}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 h-10" onClick={onCancel}>Cancel</Button>
        <Button
          className="flex-1 h-10 font-bold text-white border-0"
          style={{ background: ORANGE }}
          disabled={!password || isPending}
          onClick={onConfirm}
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : "Regenerate Codes"}
        </Button>
      </div>
    </div>
  );
}
