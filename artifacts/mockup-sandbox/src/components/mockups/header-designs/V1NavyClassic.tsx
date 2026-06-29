export function V1NavyClassic() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header style={{ background: "#0b2c60" }} className="w-full px-4 py-3 flex items-center justify-between shadow-lg">
        {/* Left: Logo + Brand */}
        <div className="flex items-center gap-3">
          <div style={{ background: "#f97316", borderRadius: 12 }} className="w-11 h-11 flex items-center justify-center shadow-md">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="1.5" fill="white" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" fill="white" opacity="0.7" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" fill="white" opacity="0.7" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" fill="white" opacity="0.5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span style={{ color: "white", fontWeight: 700, fontSize: 17, letterSpacing: 0.3 }}>SAHU</span>
              <span style={{ color: "#f97316", fontWeight: 700, fontSize: 17 }}>CSC</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, letterSpacing: 1.2, fontWeight: 500, marginTop: -1 }}>MANAGEMENT PLATFORM</div>
          </div>
        </div>
        {/* Right: Bell + Avatar */}
        <div className="flex items-center gap-2">
          <button style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)" }} className="w-10 h-10 flex items-center justify-center relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span style={{ background: "#f97316", position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", border: "2px solid #0b2c60" }} />
          </button>
          <div className="flex items-center gap-2" style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", padding: "5px 10px 5px 5px" }}>
            <div style={{ background: "#f97316", borderRadius: 8, width: 30, height: 30 }} className="flex items-center justify-center">
              <span style={{ color: "white", fontWeight: 700, fontSize: 12 }}>SA</span>
            </div>
            <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>SAHU</span>
          </div>
        </div>
      </header>
      {/* Greeting bar */}
      <div style={{ background: "#1a3f7a", borderBottom: "1px solid rgba(255,255,255,0.08)" }} className="px-4 py-2 flex justify-between items-center">
        <span style={{ color: "white", fontWeight: 600, fontSize: 14 }}>Good morning, SAHU ☀️</span>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Mon, 29 Jun</span>
      </div>
    </div>
  );
}
