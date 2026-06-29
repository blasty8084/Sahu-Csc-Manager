export function V3GlassFrost() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg,#0b2c60 0%,#1e4d9b 50%,#0b2c60 100%)" }}>
      {/* Glass header */}
      <header
        style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }} className="w-11 h-11 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="1.5" fill="white" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#f97316" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.6)" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" fill="rgba(249,115,22,0.6)" />
            </svg>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: 17, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>SAHU</span>
              <span style={{ color: "#fb923c", fontWeight: 700, fontSize: 17, textShadow: "0 1px 8px rgba(249,115,22,0.5)" }}>CSC</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, letterSpacing: 1.8, fontWeight: 600 }}>MANAGEMENT PLATFORM</div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            style={{ background: "rgba(255,255,255,0.08)", borderRadius: 11, border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(10px)" }}
            className="w-10 h-10 flex items-center justify-center relative"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span style={{ background: "#f97316", position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.3)" }} />
          </button>
          <div
            style={{ background: "rgba(255,255,255,0.08)", borderRadius: 11, border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", padding: "4px 10px 4px 4px" }}
            className="flex items-center gap-2"
          >
            <div style={{ background: "rgba(249,115,22,0.85)", borderRadius: 8, width: 30, height: 30, border: "1px solid rgba(255,255,255,0.2)" }} className="flex items-center justify-center">
              <span style={{ color: "white", fontWeight: 700, fontSize: 11 }}>SA</span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: 13 }}>SAHU</span>
          </div>
        </div>
      </header>

      {/* Greeting bar */}
      <div style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "8px 16px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500, fontSize: 13 }}>Good morning, SAHU ☀️</span>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Mon, 29 Jun</span>
      </div>
    </div>
  );
}
