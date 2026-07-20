import { ShieldCheck, ShieldOff, Mail, Smartphone, Clock, Star } from "lucide-react";

const NAVY   = "#0B1340";
const ORANGE = "#F97316";
const GREEN  = "#10b981";

type Method = "otp" | "totp";

function SecurityRing({ score }: { score: number }) {
  const r    = 38;
  const circ = 2 * Math.PI * r;
  const ring = score > 70 ? GREEN : score > 40 ? ORANGE : "#ef4444";
  return (
    <svg width="92" height="92" viewBox="0 0 96 96" className="flex-shrink-0">
      <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <circle cx="48" cy="48" r={r} fill="none" stroke={ring} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
        transform="rotate(-90 48 48)" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      <text x="48" y="53" textAnchor="middle" fontSize="18" fontWeight="800" fill="white">{score}</text>
    </svg>
  );
}

interface Props {
  twoFaEnabled: boolean;
  twoFaMethod: Method;
  score: number;
  userEmail: string;
}

/** Dark navy hero card showing security score ring + method badge + optional clock row. */
export function SecurityHeroCard({ twoFaEnabled, twoFaMethod, score, userEmail }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: `linear-gradient(145deg, ${NAVY} 0%, #162060 55%, #1d3070 100%)` }}>
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">Security Status</p>
            <h3 className="text-base font-bold text-white leading-tight">
              {twoFaEnabled ? "Account Secured" : "Account at Risk"}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: twoFaEnabled ? "#93c5fd" : "#fca5a5" }}>
              {twoFaEnabled
                ? `Protected by ${twoFaMethod === "totp" ? "Authenticator App" : "Email OTP"}`
                : "Enable 2FA to protect your account"}
            </p>
          </div>
          <SecurityRing score={score} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ background: twoFaEnabled ? "rgba(16,185,129,0.18)" : "rgba(239,68,68,0.18)", color: twoFaEnabled ? "#6ee7b7" : "#fca5a5" }}>
            {twoFaEnabled ? <ShieldCheck size={10} /> : <ShieldOff size={10} />}
            {twoFaEnabled ? "2FA ON" : "2FA OFF"}
          </span>
          {twoFaEnabled && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{ background: "rgba(249,115,22,0.18)", color: "#fdba74" }}>
              {twoFaMethod === "totp" ? <Smartphone size={10} /> : <Mail size={10} />}
              {twoFaMethod === "totp" ? "TOTP" : "Email OTP"}
            </span>
          )}
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ background: "rgba(99,120,255,0.18)", color: "#a5b4fc" }}>
            <Star size={10} /> {score}/100
          </span>
        </div>
      </div>
      {twoFaEnabled && (
        <div className="px-4 py-2.5 border-t border-white/10 flex items-center gap-2">
          <Clock size={11} className="text-blue-300 flex-shrink-0" />
          <span className="text-[11px] text-blue-300">
            {twoFaMethod === "totp"
              ? "Authenticator app active — codes rotate every 30 s"
              : userEmail ? `OTP codes sent to ${userEmail}` : "OTP codes sent to your registered email"}
          </span>
        </div>
      )}
    </div>
  );
}
