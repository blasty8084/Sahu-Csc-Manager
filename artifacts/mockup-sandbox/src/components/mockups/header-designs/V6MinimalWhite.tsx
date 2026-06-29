export function V6MinimalWhite() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f1f5f9" }}>
      <header style={{ position: "relative", overflow: "hidden", background: "white" }}>
        {/* Subtle grid texture */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.4 }} preserveAspectRatio="none">
          <defs>
            <pattern id="grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Color accent line top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#0b2c60 0%,#1e40af 40%,#f97316 80%,#ea580c 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "#e2e8f0" }} />

        <div className="px-4 py-3 flex items-center justify-between" style={{ position: "relative", zIndex: 2 }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 46, height: 46, borderRadius: 14, background: "#0b2c60", boxShadow: "0 4px 14px rgba(11,44,96,0.3), 0 0 0 1px rgba(11,44,96,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" fill="white" />
                <rect x="13" y="3" width="8" height="8" rx="2" fill="#f97316" />
                <rect x="3" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,0.5)" />
                <rect x="13" y="13" width="8" height="8" rx="2" fill="rgba(249,115,22,0.5)" />
              </svg>
            </div>
            <div>
              <div style={{ display: "flex", gap: 3, alignItems: "baseline" }}>
                <span style={{ color: "#0b2c60", fontWeight: 900, fontSize: 18, letterSpacing: 0.3 }}>SAHU</span>
                <span style={{ color: "#f97316", fontWeight: 900, fontSize: 18 }}>CSC</span>
              </div>
              <div style={{ color: "#94a3b8", fontSize: 9, letterSpacing: 2, fontWeight: 700, fontFamily: "monospace" }}>MANAGEMENT PLATFORM</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button style={{ width: 40, height: 40, borderRadius: 12, background: "#f8fafc", border: "1.5px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, background: "#f97316", borderRadius: "50%", border: "2px solid white" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "5px 12px 5px 5px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#f97316,#ea580c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(249,115,22,0.4)" }}>
                <span style={{ color: "white", fontWeight: 800, fontSize: 11 }}>SA</span>
              </div>
              <span style={{ color: "#1e293b", fontWeight: 700, fontSize: 13 }}>SAHU</span>
            </div>
          </div>
        </div>

        {/* Navy greeting */}
        <div style={{ background: "#0b2c60", padding: "7px 16px", display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
          <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>Good morning, SAHU ☀️</span>
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>Mon, 29 Jun</span>
        </div>
      </header>
    </div>
  );
}
