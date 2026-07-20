import { Loader2, Smartphone, Mail, Check } from "lucide-react";

const NAVY   = "#0B1340";
const ORANGE = "#F97316";

type Method = "otp" | "totp";

interface Props {
  twoFaMethod: Method;
  isSetupPending: boolean;
  onInitiate: (m: Method) => void;
}

/** Method switcher card shown when 2FA is already enabled — lets user switch between TOTP and Email OTP. */
export function TwoFaMethodSwitcher({ twoFaMethod, isSetupPending, onInitiate }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold" style={{ color: NAVY }}>Verification Method</p>
        <span className="text-xs text-gray-400">Tap to switch</span>
      </div>
      <div className="space-y-2">
        {(["totp", "otp"] as const).map((m) => {
          const active  = twoFaMethod === m;
          const loading = !active && m === "totp" && isSetupPending;
          return (
            <button key={m} type="button" disabled={active || isSetupPending}
              onClick={() => onInitiate(m)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all disabled:cursor-default"
              style={{ borderColor: active ? ORANGE : "#f1f5f9", background: active ? "#fff7ed" : "#f9fafb" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                style={{ background: active ? `linear-gradient(135deg, ${ORANGE}, #ea580c)` : "#e5e7eb" }}>
                {loading ? <Loader2 size={16} className="text-white animate-spin" />
                  : m === "totp" ? <Smartphone size={16} className={active ? "text-white" : "text-gray-400"} />
                  : <Mail size={16} className={active ? "text-white" : "text-gray-400"} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: active ? "#7c2d12" : "#374151" }}>
                  {m === "totp" ? "Authenticator App" : "Email OTP"}
                </p>
                <p className="text-xs text-gray-400">
                  {m === "totp" ? "Google Authenticator, Authy, any TOTP app" : "Code via email on sign-in"}
                </p>
              </div>
              {active && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
                  style={{ background: ORANGE, color: "white" }}>
                  <Check size={9} />Active
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
