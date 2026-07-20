import { Loader2, Smartphone, Mail, QrCode, Zap } from "lucide-react";

const NAVY   = "#0B1340";
const ORANGE = "#F97316";

type Method = "otp" | "totp";

interface Props {
  isSetupPending: boolean;
  onInitiate: (m: Method) => void;
}

/** CTA card shown when 2FA is disabled — lets user choose a method to enable. */
export function TwoFaEnableCTA({ isSetupPending, onInitiate }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
      <p className="text-sm font-bold" style={{ color: NAVY }}>Enable Two-Factor Authentication</p>
      <p className="text-xs text-gray-500">Choose your verification method to add an extra layer of protection.</p>
      <div className="space-y-2">
        {(["totp", "otp"] as const).map((m) => (
          <button key={m} type="button" disabled={isSetupPending}
            onClick={() => onInitiate(m)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
            style={{ borderColor: "#f1f5f9", background: "#fafafa" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: m === "totp" ? "#fff7ed" : "#eff6ff" }}>
              {isSetupPending && m === "totp"
                ? <Loader2 size={16} style={{ color: ORANGE }} className="animate-spin" />
                : m === "totp" ? <Smartphone size={16} style={{ color: ORANGE }} />
                : <Mail size={16} className="text-blue-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">
                {m === "totp" ? "Authenticator App" : "Email OTP"}
              </p>
              <p className="text-xs text-gray-400">
                {m === "totp" ? "Google Authenticator, Authy, any TOTP app" : "Code sent to your email"}
              </p>
            </div>
            {m === "totp" ? <QrCode size={14} className="text-gray-300 flex-shrink-0" /> : <Zap size={14} className="text-gray-300 flex-shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}
