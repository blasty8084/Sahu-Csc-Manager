export function V7SplitGradient() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f0f4ff" }}>
      {/* Split: left=navy, right=orange */}
      <header style={{ position: "relative", overflow: "hidden", height: 64 }} className="w-full flex items-center px-4 justify-between">
        {/* Left half */}
        <div style={{ position: "absolute", inset: 0, background: "#0b2c60", clipPath: "polygon(0 0, 58% 0, 50% 100%, 0 100%)" }} />
        {/* Right half */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#f97316,#ea580c)", clipPath: "polygon(52% 0, 100% 0, 100% 100%, 44% 100%)" }} />
        {/* Divider glow */}
        <div style={{ position: "absolute", left: "49%", top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.3)", filter: "blur(2px)" }} />

        {/* Left: Logo + Brand */}
        <div className="flex items-center gap-2.5" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 11, border: "1px solid rgba(255,255,255,0.2)" }} className="w-10 h-10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="1.5" fill="white" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.5)" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.5)" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.25)" />
            </svg>
          </div>
          <div>
            <div style={{ display: "flex", gap: 3, alignItems: "baseline" }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>SAHU</span>
              <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: 16 }}>CSC</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 8.5, letterSpacing: 1.2, fontWeight: 600 }}>MANAGEMENT PLATFORM</div>
          </div>
        </div>

        {/* Right: Bell + Avatar */}
        <div className="flex items-center gap-2" style={{ position: "relative", zIndex: 2 }}>
          <button style={{ background: "rgba(0,0,0,0.12)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.25)" }} className="w-9 h-9 flex items-center justify-center relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span style={{ background: "#fff", position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%" }} />
          </button>
          <div style={{ background: "rgba(0,0,0,0.12)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.25)", padding: "3px 8px 3px 3px" }} className="flex items-center gap-2">
            <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 8, width: 28, height: 28 }} className="flex items-center justify-center">
              <span style={{ color: "#f97316", fontWeight: 800, fontSize: 10 }}>SA</span>
            </div>
            <span style={{ color: "white", fontWeight: 700, fontSize: 12 }}>SAHU</span>
          </div>
        </div>
      </header>

      {/* Greeting */}
      <div style={{ background: "#0b2c60", padding: "7px 16px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>Good morning, SAHU ☀️</span>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Mon, 29 Jun</span>
      </div>
    </div>
  );
}
