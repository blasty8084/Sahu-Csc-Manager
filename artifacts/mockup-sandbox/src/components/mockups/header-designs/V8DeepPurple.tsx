export function V8DeepPurple() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#08050f" }}>
      <header style={{ position: "relative", overflow: "hidden" }}>
        {/* Circuit board / tech line texture */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }} preserveAspectRatio="none">
          <defs>
            <pattern id="circuit" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="10" x2="15" y2="10" stroke="#a78bfa" strokeWidth="0.6" />
              <circle cx="15" cy="10" r="1.5" fill="#a78bfa" />
              <line x1="15" y1="10" x2="15" y2="25" stroke="#a78bfa" strokeWidth="0.6" />
              <line x1="15" y1="25" x2="40" y2="25" stroke="#a78bfa" strokeWidth="0.6" />
              <circle cx="28" cy="25" r="1.5" fill="#f97316" />
              <line x1="28" y1="25" x2="28" y2="40" stroke="#f97316" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
        {/* Deep purple gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#1e0a3c 0%,#2d1060 50%,#190730 100%)" }} />
        {/* Purple glow left, orange glow right */}
        <div style={{ position: "absolute", top: -20, left: 0, width: 100, height: 100, background: "radial-gradient(circle,rgba(139,92,246,0.5),transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -10, right: 10, width: 90, height: 90, background: "radial-gradient(circle,rgba(249,115,22,0.4),transparent 70%)", filter: "blur(18px)", pointerEvents: "none" }} />
        {/* Bottom glow strip */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,#8b5cf6,#f97316,transparent)" }} />

        <div className="px-4 py-3 flex items-center justify-between" style={{ position: "relative", zIndex: 2 }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#f97316)", boxShadow: "0 0 24px rgba(124,58,237,0.5), 0 0 0 1px rgba(167,139,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              {/* Shine overlay */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "rgba(255,255,255,0.15)", borderRadius: "14px 14px 0 0" }} />
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" style={{ position: "relative" }}>
                <rect x="3" y="3" width="8" height="8" rx="2" fill="white" />
                <rect x="13" y="3" width="8" height="8" rx="2" fill="rgba(255,255,255,0.75)" />
                <rect x="3" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,0.6)" />
                <rect x="13" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,0.35)" />
              </svg>
            </div>
            <div>
              <div style={{ display: "flex", gap: 4, alignItems: "baseline" }}>
                <span style={{ color: "#ede9fe", fontWeight: 900, fontSize: 19, textShadow: "0 0 16px rgba(167,139,250,0.4)", letterSpacing: 0.5 }}>SAHU</span>
                <span style={{ color: "#fb923c", fontWeight: 900, fontSize: 19, textShadow: "0 0 16px rgba(249,115,22,0.6)" }}>CSC</span>
              </div>
              <div style={{ color: "rgba(167,139,250,0.55)", fontSize: 9, letterSpacing: 2.5, fontWeight: 700, fontFamily: "monospace" }}>MANAGEMENT PLATFORM</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 12px rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, background: "#f97316", borderRadius: "50%", boxShadow: "0 0 10px rgba(249,115,22,0.9)" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 12, padding: "5px 12px 5px 5px", boxShadow: "0 0 12px rgba(139,92,246,0.1)" }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#7c3aed,#db2777)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(124,58,237,0.5)" }}>
                <span style={{ color: "white", fontWeight: 800, fontSize: 11 }}>SA</span>
              </div>
              <span style={{ color: "#ddd6fe", fontWeight: 700, fontSize: 13 }}>SAHU</span>
            </div>
          </div>
        </div>

        <div style={{ background: "rgba(0,0,0,0.4)", borderTop: "1px solid rgba(139,92,246,0.15)", padding: "7px 16px", display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
          <span style={{ color: "#ede9fe", fontWeight: 600, fontSize: 13 }}>Good morning, SAHU ☀️</span>
          <span style={{ color: "rgba(167,139,250,0.45)", fontSize: 11, fontFamily: "monospace" }}>Mon, 29 Jun</span>
        </div>
      </header>
    </div>
  );
}
