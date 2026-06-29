export function V3GlassFrost() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg,#ff6b35 0%,#f97316 30%,#0b2c60 70%,#0a0f23 100%)" }}>
      <header style={{ position: "relative", overflow: "hidden" }}>
        {/* Noise / grain SVG texture */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }} preserveAspectRatio="none">
          <defs>
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>

        {/* Glass panel */}
        <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ position: "relative", zIndex: 2 }}>
            <div className="flex items-center gap-3">
              <div style={{ width: 46, height: 46, borderRadius: 15, background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="8" height="8" rx="2" fill="white" />
                  <rect x="13" y="3" width="8" height="8" rx="2" fill="rgba(255,255,255,0.7)" />
                  <rect x="3" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,0.7)" />
                  <rect x="13" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,0.4)" />
                </svg>
              </div>
              <div>
                <div style={{ display: "flex", gap: 4, alignItems: "baseline" }}>
                  <span style={{ color: "white", fontWeight: 900, fontSize: 19, textShadow: "0 2px 8px rgba(0,0,0,0.3)", letterSpacing: 0.5 }}>SAHU</span>
                  <span style={{ color: "#fff3e0", fontWeight: 900, fontSize: 19, textShadow: "0 2px 12px rgba(255,200,100,0.5)" }}>CSC</span>
                </div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, letterSpacing: 2, fontWeight: 700, fontFamily: "monospace" }}>MANAGEMENT PLATFORM</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(10px)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, background: "#fbbf24", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)", boxShadow: "0 0 8px #fbbf24" }} />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 12, padding: "5px 12px 5px 5px", backdropFilter: "blur(10px)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)" }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                  <span style={{ color: "#f97316", fontWeight: 900, fontSize: 11 }}>SA</span>
                </div>
                <span style={{ color: "white", fontWeight: 700, fontSize: 13, textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>SAHU</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "7px 16px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: 13 }}>Good morning, SAHU ☀️</span>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>Mon, 29 Jun</span>
          </div>
        </div>
      </header>
    </div>
  );
}
