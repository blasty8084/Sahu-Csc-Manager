import { ArrowLeft, Lock } from "lucide-react";
import { OTP_RATE_LIMIT } from "./loginTypes";

interface OtpRateLimitPanelProps {
  seconds: number;
  onBack: () => void;
}

export function OtpRateLimitPanel({ seconds, onBack }: OtpRateLimitPanelProps) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const isUrgent = seconds <= 60;
  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fef2f2, #fee2e2)" }}>
        <Lock className="w-7 h-7 text-red-500" />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-base">Too Many Requests</h3>
        <p className="text-gray-500 text-xs mt-1 max-w-[260px]">OTP sending is temporarily blocked. Please wait before requesting a new code.</p>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${(seconds / OTP_RATE_LIMIT) * 100}%`, background: isUrgent ? "#ef4444" : "#f97316", transition: "width 1s linear" }} />
      </div>
      <div>
        <div className="text-4xl font-black tabular-nums tracking-tight" style={{ color: isUrgent ? "#dc2626" : "#0b2c60" }}>{mm}:{ss}</div>
        <p className="text-gray-400 text-xs mt-1">until you can try again</p>
      </div>
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mt-1">
        <ArrowLeft className="w-3.5 h-3.5" />Back
      </button>
    </div>
  );
}
