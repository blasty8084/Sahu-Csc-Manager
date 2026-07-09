export function V4DarkSteel() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#080c14" }}>
      <header style={{ position: "relative", overflow: "hidden" }}>
        {/* Carbon-fiber weave texture */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25 }} preserveAspectRatio="none">
          <defs>
            <pattern id="carbon" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="4" height="4" fill="rgba(255,255,255,0.08)" />
              <rect x="4" y="4" width="4" height="4" fill="rgba(255,255,255,0.08)" />
              <rect x="0" y="0" width="8" height="8" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#carbon)" />
        </svg>

        {/* Gradient base */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #141e30 0%, #0f1724 100%)" }} />

        {/* Orange edge glow */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #f97316, #ea580c, transparent)" }} />
        <div style={{ position: "absolute", bottom: 0, left: "20%", right: "20%", height: 8, background: "rgba(249,115,22,0.2)", filter: "blur(6px)" }} />

        <div className="px-4 py-3 flex items-center justify-between" style={{ position: "relative", zIndex: 2 }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg,#1e2d45,#243553)", border: "1px solid rgba(249,115,22,0.4)", boxShadow: "0 0 20px rgba(249,115,22,0.2), inset 0 1px 0 rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" fill="#f97316" />
                <rect x="13" y="3" width="8" height="8" rx="2" fill="rgba(249,115,22,0.5)" />
                <rect x="3" y="13" width="8" height="8" rx="2" fill="rgba(249,115,22,0.4)" />
                <rect x="13" y="13" width="8" height="8" rx="2" fill="rgba(249,115,22,0.2)" />
              </svg>
            </div>
            <div>
              <div style={{ display: "flex", gap: 4, alignItems: "baseline" }}>
                <span style={{ color: "#e2e8f0", fontWeight: 900, fontSize: 18, letterSpacing: 1, fontFamily: "'Segoe UI',sans-serif" }}>SAHU</span>
                <span style={{ color: "#f97316", fontWeight: 900, fontSize: 18, textShadow: "0 0 16px rgba(249,115,22,0.7)" }}>CSC</span>
              </div>
              <div style={{ color: "rgba(249,115,22,0.5)", fontSize: 9, letterSpacing: 2.5, fontWeight: 700, fontFamily: "monospace" }}>MANAGEMENT PLATFORM</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(249,115,22,0.8)" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, background: "#f97316", borderRadius: "50%", boxShadow: "0 0 10px #f97316" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: 12, padding: "5px 12px 5px 5px" }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#f97316,#c2410c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(249,115,22,0.5)" }}>
                <span style={{ color: "white", fontWeight: 800, fontSize: 11 }}>SA</span>
              </div>
              <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 13 }}>SAHU</span>
            </div>
          </div>
        </div>

        <div style={{ background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(249,115,22,0.1)", padding: "7px 16px", display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
          <span style={{ color: "rgba(226,232,240,0.8)", fontWeight: 600, fontSize: 13 }}>Good morning, SAHU ☀️</span>
          <span style={{ color: "rgba(249,115,22,0.4)", fontSize: 11, fontFamily: "monospace" }}>Mon, 29 Jun</span>
        </div>
      </header>
    </div>
  );
}
