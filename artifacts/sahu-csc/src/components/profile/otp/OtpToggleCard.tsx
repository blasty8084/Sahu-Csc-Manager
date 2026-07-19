import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, ShieldOff, Loader2, Eye, EyeOff } from "lucide-react";

interface OtpToggleCardProps {
  stage: "otp-confirm" | "disable-confirm";
  password: string;
  showPass: boolean;
  isPending: boolean;
  onPasswordChange: (v: string) => void;
  onToggleShowPass: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Password-confirm dialog for enabling Email OTP or disabling 2FA entirely.
 * Visual tone switches between blue (enable) and red (disable) based on `stage`.
 */
export function OtpToggleCard({
  stage,
  password,
  showPass,
  isPending,
  onPasswordChange,
  onToggleShowPass,
  onConfirm,
  onCancel,
}: OtpToggleCardProps) {
  const isDisable = stage === "disable-confirm";

  const title    = isDisable ? "Confirm to disable 2FA"   : "Enable Email OTP";
  const subtitle = isDisable ? "Your account will be less secure" : "Enter your password to confirm";
  const btnLabel = isDisable ? "Disable 2FA" : "Enable";
  const btnColor = isDisable ? "#ef4444" : "#3b82f6";
  const iconBg   = isDisable ? "#fef2f2"  : "#eff6ff";
  const Icon     = isDisable ? ShieldOff   : Mail;
  const iconCls  = isDisable ? "text-red-500" : "text-blue-500";

  return (
    <div className="rounded-2xl border bg-white p-4 space-y-3 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={16} className={iconCls} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{title}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
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
          style={{ background: btnColor }}
          disabled={!password || isPending}
          onClick={onConfirm}
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : btnLabel}
        </Button>
      </div>
    </div>
  );
}
