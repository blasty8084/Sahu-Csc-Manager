export function V6MinimalWhite() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8fafc" }}>
      {/* Clean white header */}
      <header style={{ background: "white", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }} className="w-full px-4 py-3 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div style={{ background: "#0b2c60", borderRadius: 12, boxShadow: "0 2px 8px rgba(11,44,96,0.25)" }} className="w-11 h-11 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="1.5" fill="white" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#f97316" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.6)" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" fill="rgba(249,115,22,0.6)" />
            </svg>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
              <span style={{ color: "#0b2c60", fontWeight: 700, fontSize: 17 }}>SAHU</span>
              <span style={{ color: "#f97316", fontWeight: 700, fontSize: 17 }}>CSC</span>
            </div>
            <div style={{ color: "#94a3b8", fontSize: 9.5, letterSpacing: 1.2, fontWeight: 500 }}>MANAGEMENT PLATFORM</div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button style={{ background: "#f1f5f9", borderRadius: 11, border: "1px solid #e2e8f0" }} className="w-10 h-10 flex items-center justify-center relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span style={{ background: "#f97316", position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", border: "1.5px solid white" }} />
          </button>
          <div style={{ background: "#f1f5f9", borderRadius: 11, border: "1px solid #e2e8f0", padding: "4px 10px 4px 4px" }} className="flex items-center gap-2">
            <div style={{ background: "#f97316", borderRadius: 8, width: 30, height: 30 }} className="flex items-center justify-center">
              <span style={{ color: "white", fontWeight: 700, fontSize: 11 }}>SA</span>
            </div>
            <span style={{ color: "#1e293b", fontWeight: 600, fontSize: 13 }}>SAHU</span>
          </div>
        </div>
      </header>

      {/* Colored greeting strip */}
      <div style={{ background: "#0b2c60", padding: "8px 16px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>Good morning, SAHU ☀️</span>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>Mon, 29 Jun</span>
      </div>
    </div>
  );
}
