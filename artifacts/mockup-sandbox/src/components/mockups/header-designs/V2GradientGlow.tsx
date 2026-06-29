export function V2GradientGlow() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header
        style={{ background: "linear-gradient(135deg, #0b2c60 0%, #1a56b0 60%, #f97316 140%)", position: "relative", overflow: "hidden" }}
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        {/* Glow orb */}
        <div style={{ position: "absolute", right: -30, top: -30, width: 100, height: 100, background: "rgba(249,115,22,0.3)", borderRadius: "50%", filter: "blur(30px)" }} />
        <div style={{ position: "absolute", left: 80, bottom: -20, width: 60, height: 60, background: "rgba(255,255,255,0.07)", borderRadius: "50%", filter: "blur(15px)" }} />

        {/* Left */}
        <div className="flex items-center gap-3" style={{ position: "relative" }}>
          <div style={{ background: "white", borderRadius: 14, boxShadow: "0 4px 16px rgba(249,115,22,0.4)" }} className="w-12 h-12 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#0b2c60" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#f97316" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#f97316" opacity="0.7" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#0b2c60" opacity="0.6" />
            </svg>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span style={{ color: "white", fontWeight: 800, fontSize: 18, letterSpacing: 0.5, textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>SAHU</span>
              <span style={{ color: "#fbbf24", fontWeight: 800, fontSize: 18, textShadow: "0 2px 8px rgba(249,115,22,0.6)" }}>CSC</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 9.5, letterSpacing: 1.5, fontWeight: 600 }}>MANAGEMENT PLATFORM</div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2" style={{ position: "relative" }}>
          <button style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} className="w-10 h-10 flex items-center justify-center relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span style={{ background: "#fbbf24", position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", boxShadow: "0 0 6px #fbbf24" }} />
          </button>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", padding: "4px 10px 4px 4px" }} className="flex items-center gap-2">
            <div style={{ background: "linear-gradient(135deg,#f97316,#fbbf24)", borderRadius: 9, width: 32, height: 32, boxShadow: "0 2px 8px rgba(249,115,22,0.5)" }} className="flex items-center justify-center">
              <span style={{ color: "white", fontWeight: 800, fontSize: 12 }}>SA</span>
            </div>
            <span style={{ color: "white", fontWeight: 700, fontSize: 13 }}>SAHU</span>
          </div>
        </div>
      </header>
      {/* Greeting */}
      <div style={{ background: "linear-gradient(90deg,#1a3f7a,#0b2c60)", padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>Good morning, SAHU ☀️</span>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Mon, 29 Jun</span>
      </div>
    </div>
  );
}
