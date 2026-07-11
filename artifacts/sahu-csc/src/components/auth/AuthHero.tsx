import { useTranslation } from "react-i18next";
import { Shield, Zap, Users } from "lucide-react";
import { LoginLogo } from "@/components/app-logo";

// ── CSC building illustration ────────────────────────────────────────────────
export function CSCBuilding() {
  return (
    <div className="relative w-full flex flex-col items-center mt-6 select-none">
      <div className="flex items-end gap-4 mb-0 w-full max-w-xs justify-center">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-9 h-12 rounded-full" style={{ background: "linear-gradient(180deg, #166534, #15803d)" }} />
          <div className="w-2.5 h-5 rounded-sm" style={{ background: "#7c4a00" }} />
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-end gap-1 mb-0.5">
            <div className="w-0.5 h-10 rounded-full" style={{ background: "rgba(255,255,255,0.5)" }} />
            <div className="w-5 h-3 rounded-sm" style={{ background: "#FF9933" }} />
          </div>
          <div className="w-36 h-5 rounded-t-lg" style={{ background: "#1a2560" }} />
          <div className="w-40 h-20 flex flex-col items-center justify-center gap-1.5" style={{ background: "#1e2d6b" }}>
            <div className="px-3 py-0.5 rounded text-white text-xs font-black tracking-widest" style={{ background: "rgba(249,115,22,0.25)", border: "1px solid rgba(249,115,22,0.4)" }}>CSC</div>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-5 h-5 rounded-sm" style={{ background: "#0f1a4a", border: "1px solid rgba(255,255,255,0.1)" }} />
              ))}
            </div>
          </div>
          <div className="w-10 h-10 rounded-t-full" style={{ background: "#F97316" }} />
        </div>
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-7 h-9 rounded-full" style={{ background: "linear-gradient(180deg, #166534, #15803d)" }} />
          <div className="w-2 h-4 rounded-sm" style={{ background: "#7c4a00" }} />
        </div>
      </div>
      <div className="w-full max-w-xs h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
      <div className="w-full max-w-xs h-2 flex overflow-hidden rounded-b-sm">
        <div className="flex-1" style={{ background: "#FF9933" }} />
        <div className="flex-1 bg-white" />
        <div className="flex-1" style={{ background: "#138808" }} />
      </div>
    </div>
  );
}

// ── Desktop left hero panel ──────────────────────────────────────────────────
export function DesktopHeroPanel() {
  const { t } = useTranslation();

  return (
    <div className="w-[58%] flex flex-col px-12 py-8 overflow-hidden">
      <div className="flex items-center gap-3 flex-shrink-0">
        <LoginLogo size={36} />
        <div>
          <div>
            <span className="text-white font-black text-lg">SAHU </span>
            <span style={{ color: "#F97316" }} className="font-black text-lg">CSC</span>
          </div>
          <p className="text-white/40 text-xs -mt-0.5">{t('nav.management_platform')}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-0 mt-6">
        <h1 className="text-4xl font-black leading-tight flex-shrink-0">
          <span className="text-white">One Platform.</span>
          <br />
          <span style={{ color: "#F97316" }}>Many Services.</span>
        </h1>
        <p className="text-white/45 mt-3 text-sm max-w-md leading-relaxed flex-shrink-0">
          Manage all your CSC services, transactions and reports in one secure place.
        </p>

        <div className="space-y-3 mt-6 flex-shrink-0">
          {[
            { icon: Shield, title: "Secure & Reliable", desc: "Bank-level security to protect your data" },
            { icon: Zap, title: "Fast & Efficient", desc: "Quick access to all CSC services" },
            { icon: Users, title: "Trusted by Operators", desc: "Join thousands of CSC operators across India" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: "#1a2560", border: "1px solid rgba(249,115,22,0.2)" }}>
                <Icon className="w-4 h-4" style={{ color: "#F97316" }} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-white/40 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-shrink-0">
        <CSCBuilding />
      </div>
    </div>
  );
}

// ── Desktop footer trust bar ─────────────────────────────────────────────────
export function DesktopFooterBar() {
  return (
    <div className="flex-shrink-0" style={{ borderTop: "1px solid #1a2560", background: "#080e2e" }}>
      <div className="flex items-center justify-around py-2.5 px-8 max-w-4xl mx-auto">
        {[
          { icon: Shield, label: "100% Secure" },
          { icon: Zap, label: "24x7 Support" },
          { icon: Users, label: "Always Available" },
          { icon: Shield, label: "Trusted Network" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#F97316" }} />
            <span className="text-white/50 text-xs font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
