export function V7SplitGradient() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a1628" }}>
      <header style={{ position: "relative", overflow: "hidden" }}>
        {/* Triangular mesh SVG background */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} preserveAspectRatio="none">
          <defs>
            <pattern id="tri" x="0" y="0" width="30" height="26" patternUnits="userSpaceOnUse">
              <polygon points="15,2 28,24 2,24" fill="none" stroke="white" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tri)" />
        </svg>

        {/* Gradient overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,#0b2c60 0%,#0d3a7a 45%,#c2410c 100%)" }} />
        {/* Center glow */}
        <div style={{ position: "absolute", top: -20, left: "45%", width: 120, height: 120, background: "radial-gradient(circle,rgba(249,115,22,0.4),transparent 70%)", filter: "blur(25px)", pointerEvents: "none" }} />

        <div className="px-4 py-3 flex items-center justify-between" style={{ position: "relative", zIndex: 2 }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 46, height: 46, borderRadius: 14, position: "relative", overflow: "hidden", boxShadow: "0 6px 20px rgba(0,0,0,0.3)" }}>
              {/* Half-half logo */}
              <div style={{ position: "absolute", inset: 0, background: "#0b2c60", clipPath: "polygon(0 0,50% 0,50% 100%,0 100%)" }} />
              <div style={{ position: "absolute", inset: 0, background: "#f97316", clipPath: "polygon(50% 0,100% 0,100% 100%,50% 100%)" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="8" height="8" rx="2" fill="white" />
                  <rect x="13" y="3" width="8" height="8" rx="2" fill="white" opacity="0.8" />
                  <rect x="3" y="13" width="8" height="8" rx="2" fill="white" opacity="0.6" />
                  <rect x="13" y="13" width="8" height="8" rx="2" fill="white" opacity="0.4" />
                </svg>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", gap: 4, alignItems: "baseline" }}>
                <span style={{ color: "white", fontWeight: 900, fontSize: 19, letterSpacing: 0.5, textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>SAHU</span>
                <span style={{ color: "#fbbf24", fontWeight: 900, fontSize: 19, textShadow: "0 0 14px rgba(251,191,36,0.5)" }}>CSC</span>
              </div>
              <div style={{ color: "rgba(251,191,36,0.5)", fontSize: 9, letterSpacing: 2.5, fontWeight: 700, fontFamily: "monospace" }}>MANAGEMENT PLATFORM</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, background: "#fbbf24", borderRadius: "50%", boxShadow: "0 0 8px rgba(251,191,36,0.8)" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: "5px 12px 5px 5px" }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#fbbf24,#f97316)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(251,191,36,0.4)" }}>
                <span style={{ color: "white", fontWeight: 800, fontSize: 11 }}>SA</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 13 }}>SAHU</span>
            </div>
          </div>
        </div>

        <div style={{ background: "rgba(0,0,0,0.35)", borderTop: "1px solid rgba(251,191,36,0.15)", padding: "7px 16px", display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
          <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: 13 }}>Good morning, SAHU ☀️</span>
          <span style={{ color: "rgba(251,191,36,0.45)", fontSize: 11, fontFamily: "monospace" }}>Mon, 29 Jun</span>
        </div>
      </header>
    </div>
  );
}
