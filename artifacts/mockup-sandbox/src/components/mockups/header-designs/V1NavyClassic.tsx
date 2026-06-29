export function V1NavyClassic() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a1628" }}>
      <header style={{ position: "relative", overflow: "hidden", background: "#0b2c60" }}>
        {/* Mesh / dot-grid texture overlay */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }} preserveAspectRatio="none">
          <defs>
            <pattern id="dots" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        {/* Diagonal shine streak */}
        <div style={{ position: "absolute", top: -20, left: "30%", width: 80, height: 160, background: "rgba(255,255,255,0.04)", transform: "rotate(20deg)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -20, left: "55%", width: 30, height: 160, background: "rgba(255,255,255,0.03)", transform: "rotate(20deg)", pointerEvents: "none" }} />

        <div className="px-4 py-3 flex items-center justify-between" style={{ position: "relative", zIndex: 2 }}>
          {/* Left */}
          <div className="flex items-center gap-3">
            <div style={{ background: "linear-gradient(135deg,#f97316 0%,#ea580c 100%)", borderRadius: 14, boxShadow: "0 0 0 2px rgba(249,115,22,0.3), 0 6px 18px rgba(249,115,22,0.45)", width: 44, height: 44 }} className="flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" fill="white" />
                <rect x="13" y="3" width="8" height="8" rx="2" fill="rgba(255,255,255,0.65)" />
                <rect x="3" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,0.65)" />
                <rect x="13" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,0.35)" />
              </svg>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                <span style={{ color: "white", fontWeight: 800, fontSize: 18, letterSpacing: 0.5, fontFamily: "'Segoe UI',sans-serif" }}>SAHU</span>
                <span style={{ color: "#fb923c", fontWeight: 800, fontSize: 18, fontFamily: "'Segoe UI',sans-serif" }}>CSC</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: 2, fontWeight: 600, fontFamily: "monospace" }}>MANAGEMENT PLATFORM</div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, background: "#f97316", borderRadius: "50%", border: "2px solid #0b2c60", boxShadow: "0 0 8px #f97316" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "5px 12px 5px 5px" }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#f97316,#ea580c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(249,115,22,0.5)" }}>
                <span style={{ color: "white", fontWeight: 800, fontSize: 11, fontFamily: "'Segoe UI',sans-serif" }}>SA</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 13 }}>SAHU</span>
            </div>
          </div>
        </div>

        {/* Greeting strip */}
        <div style={{ background: "rgba(0,0,0,0.25)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "7px 16px", display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
          <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: 13 }}>Good morning, SAHU ☀️</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "monospace" }}>Mon, 29 Jun</span>
        </div>
      </header>
    </div>
  );
}
