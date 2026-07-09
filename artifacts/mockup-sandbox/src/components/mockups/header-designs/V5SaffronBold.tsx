export function V5SaffronBold() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#fff8f0" }}>
      <header style={{ position: "relative", overflow: "hidden" }}>
        {/* Diagonal stripe texture */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }} preserveAspectRatio="none">
          <defs>
            <pattern id="stripes" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="20" stroke="white" strokeWidth="6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stripes)" />
        </svg>
        {/* Bold orange base */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#f97316 0%,#dc6b0f 50%,#c2550d 100%)" }} />
        {/* Bottom vignette */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(transparent,rgba(0,0,0,0.15))" }} />

        <div className="px-4 py-3 flex items-center justify-between" style={{ position: "relative", zIndex: 2 }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 46, height: 46, borderRadius: 15, background: "white", boxShadow: "0 6px 20px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" fill="#0b2c60" />
                <rect x="13" y="3" width="8" height="8" rx="2" fill="#f97316" />
                <rect x="3" y="13" width="8" height="8" rx="2" fill="#f97316" opacity="0.6" />
                <rect x="13" y="13" width="8" height="8" rx="2" fill="#0b2c60" opacity="0.5" />
              </svg>
            </div>
            <div>
              <div style={{ display: "flex", gap: 4, alignItems: "baseline" }}>
                <span style={{ color: "white", fontWeight: 900, fontSize: 19, textShadow: "0 2px 8px rgba(0,0,0,0.25)", letterSpacing: 0.5 }}>SAHU</span>
                <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 900, fontSize: 19 }}>CSC</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 9, letterSpacing: 2, fontWeight: 700, fontFamily: "monospace" }}>MANAGEMENT PLATFORM</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, background: "#0b2c60", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.6)" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 12, padding: "5px 12px 5px 5px" }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "#0b2c60", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ color: "white", fontWeight: 800, fontSize: 11 }}>SA</span>
              </div>
              <span style={{ color: "white", fontWeight: 700, fontSize: 13, textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>SAHU</span>
            </div>
          </div>
        </div>

        {/* Navy greeting bar */}
        <div style={{ background: "#0b2c60", borderTop: "3px solid rgba(249,115,22,0.6)", padding: "7px 16px", display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
          <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>Good morning, SAHU ☀️</span>
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>Mon, 29 Jun</span>
        </div>
      </header>
    </div>
  );
}
