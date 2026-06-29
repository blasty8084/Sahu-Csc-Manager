export function V5SaffronBold() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#fef3e2" }}>
      {/* Orange bold header */}
      <header style={{ background: "linear-gradient(135deg,#f97316 0%,#ea580c 100%)", boxShadow: "0 4px 20px rgba(249,115,22,0.4)" }} className="w-full px-4 py-3 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div style={{ background: "white", borderRadius: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} className="w-11 h-11 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#0b2c60" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#f97316" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#f97316" opacity="0.7" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#0b2c60" opacity="0.5" />
            </svg>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ color: "white", fontWeight: 800, fontSize: 18, textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>SAHU</span>
              <span style={{ color: "#fff3e0", fontWeight: 800, fontSize: 18 }}>CSC</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 9.5, letterSpacing: 1.5, fontWeight: 600 }}>MANAGEMENT PLATFORM</div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button style={{ background: "rgba(0,0,0,0.12)", borderRadius: 11, border: "1px solid rgba(255,255,255,0.3)" }} className="w-10 h-10 flex items-center justify-center relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span style={{ background: "#0b2c60", position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", border: "1.5px solid white" }} />
          </button>
          <div style={{ background: "rgba(0,0,0,0.12)", borderRadius: 11, border: "1px solid rgba(255,255,255,0.3)", padding: "4px 10px 4px 4px" }} className="flex items-center gap-2">
            <div style={{ background: "#0b2c60", borderRadius: 8, width: 30, height: 30 }} className="flex items-center justify-center">
              <span style={{ color: "white", fontWeight: 700, fontSize: 11 }}>SA</span>
            </div>
            <span style={{ color: "white", fontWeight: 700, fontSize: 13 }}>SAHU</span>
          </div>
        </div>
      </header>

      {/* Navy greeting bar */}
      <div style={{ background: "#0b2c60", padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>Good morning, SAHU ☀️</span>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>Mon, 29 Jun</span>
      </div>
    </div>
  );
}
