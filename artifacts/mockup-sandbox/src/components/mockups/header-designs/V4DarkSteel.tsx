export function V4DarkSteel() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#111827" }}>
      <header style={{ background: "linear-gradient(180deg,#1f2937 0%,#111827 100%)", borderBottom: "1px solid #374151" }} className="w-full px-4 py-3 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", borderRadius: 13, boxShadow: "0 4px 14px rgba(249,115,22,0.45)" }} className="w-11 h-11 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="1.5" fill="white" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.7)" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.7)" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.4)" />
            </svg>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ color: "#f9fafb", fontWeight: 700, fontSize: 17, letterSpacing: 0.4 }}>SAHU</span>
              <span style={{ color: "#f97316", fontWeight: 700, fontSize: 17 }}>CSC</span>
            </div>
            <div style={{ color: "#6b7280", fontSize: 9.5, letterSpacing: 1.3, fontWeight: 500, marginTop: 0 }}>MANAGEMENT PLATFORM</div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button style={{ background: "#1f2937", borderRadius: 11, border: "1px solid #374151", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }} className="w-10 h-10 flex items-center justify-center relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span style={{ background: "#f97316", position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", boxShadow: "0 0 6px #f97316" }} />
          </button>
          <div style={{ background: "#1f2937", borderRadius: 11, border: "1px solid #374151", padding: "4px 10px 4px 4px" }} className="flex items-center gap-2">
            <div style={{ background: "linear-gradient(135deg,#0b2c60,#1a56b0)", borderRadius: 8, width: 30, height: 30, border: "1px solid rgba(255,255,255,0.08)" }} className="flex items-center justify-center">
              <span style={{ color: "white", fontWeight: 700, fontSize: 11 }}>SA</span>
            </div>
            <span style={{ color: "#d1d5db", fontWeight: 600, fontSize: 13 }}>SAHU</span>
          </div>
        </div>
      </header>

      {/* Accent bar */}
      <div style={{ background: "#161d2c", borderBottom: "1px solid #1f2937", padding: "7px 16px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#d1d5db", fontWeight: 500, fontSize: 13 }}>Good morning, SAHU ☀️</span>
        <span style={{ color: "#6b7280", fontSize: 11 }}>Mon, 29 Jun</span>
      </div>
    </div>
  );
}
