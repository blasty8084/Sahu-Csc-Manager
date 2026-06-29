export function V2GradientGlow() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0c0c1a" }}>
      <header style={{ position: "relative", overflow: "hidden" }}>
        {/* Aurora base gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0b1d45 0%, #0d3068 40%, #1a1040 100%)" }} />
        {/* Hexagon mesh texture */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }} preserveAspectRatio="none">
          <defs>
            <pattern id="hex" x="0" y="0" width="28" height="24" patternUnits="userSpaceOnUse">
              <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hex)" />
        </svg>
        {/* Aurora blobs */}
        <div style={{ position: "absolute", top: -30, right: 20, width: 120, height: 120, background: "radial-gradient(circle, rgba(249,115,22,0.35) 0%, transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -10, left: "40%", width: 80, height: 80, background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)", filter: "blur(16px)", pointerEvents: "none" }} />

        <div className="px-4 py-3 flex items-center justify-between" style={{ position: "relative", zIndex: 2 }}>
          <div className="flex items-center gap-3">
            {/* Glowing logo box */}
            <div style={{ width: 46, height: 46, borderRadius: 15, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(249,115,22,0.25), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" fill="white" />
                <rect x="13" y="3" width="8" height="8" rx="2" fill="#f97316" />
                <rect x="3" y="13" width="8" height="8" rx="2" fill="#818cf8" />
                <rect x="13" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,0.4)" />
              </svg>
            </div>
            <div>
              <div style={{ display: "flex", gap: 4, alignItems: "baseline" }}>
                <span style={{ color: "white", fontWeight: 900, fontSize: 19, letterSpacing: 1, textShadow: "0 0 20px rgba(255,255,255,0.3)" }}>SAHU</span>
                <span style={{ color: "#fb923c", fontWeight: 900, fontSize: 19, textShadow: "0 0 20px rgba(249,115,22,0.6)" }}>CSC</span>
              </div>
              <div style={{ color: "rgba(129,140,248,0.7)", fontSize: 9, letterSpacing: 2.5, fontWeight: 700, fontFamily: "monospace" }}>MANAGEMENT PLATFORM</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(129,140,248,0.25)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", boxShadow: "0 0 12px rgba(129,140,248,0.15)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c7d2fe" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, background: "#f97316", borderRadius: "50%", boxShadow: "0 0 8px rgba(249,115,22,0.8)" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(129,140,248,0.25)", borderRadius: 12, padding: "5px 12px 5px 5px", backdropFilter: "blur(8px)" }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#6366f1,#f97316)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(99,102,241,0.5)" }}>
                <span style={{ color: "white", fontWeight: 800, fontSize: 11 }}>SA</span>
              </div>
              <span style={{ color: "#e0e7ff", fontWeight: 700, fontSize: 13 }}>SAHU</span>
            </div>
          </div>
        </div>

        <div style={{ background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(129,140,248,0.1)", padding: "7px 16px", display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
          <span style={{ color: "rgba(224,231,255,0.85)", fontWeight: 600, fontSize: 13 }}>Good morning, SAHU ☀️</span>
          <span style={{ color: "rgba(129,140,248,0.5)", fontSize: 11, fontFamily: "monospace" }}>Mon, 29 Jun</span>
        </div>
      </header>
    </div>
  );
}
