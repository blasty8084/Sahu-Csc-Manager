export function V2GradientGlow() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f1f5f9" }}>
      <header style={{ position: "relative", overflow: "hidden", background: "white" }}>
        {/* Hex mesh texture overlay — subtle on white */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }} preserveAspectRatio="none">
          <defs>
            <pattern id="hex" x="0" y="0" width="28" height="24" patternUnits="userSpaceOnUse">
              <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#0b2c60" strokeWidth="0.9" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hex)" />
        </svg>

        {/* Soft aurora blobs — light and pastel */}
        <div style={{ position: "absolute", top: -30, right: 30, width: 140, height: 140, background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)", filter: "blur(24px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -10, left: "35%", width: 100, height: 100, background: "radial-gradient(circle, rgba(11,44,96,0.09) 0%, transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -20, left: -10, width: 100, height: 100, background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }} />

        {/* Top accent bar with gradient */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #0b2c60 0%, #1e40af 35%, #f97316 70%, #ea580c 100%)" }} />
        {/* Bottom border */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #e2e8f0, transparent)" }} />

        <div className="px-4 py-3 flex items-center justify-between" style={{ position: "relative", zIndex: 2 }}>
          {/* Logo + brand */}
          <div className="flex items-center gap-3">
            <div style={{
              width: 46, height: 46, borderRadius: 15,
              background: "linear-gradient(135deg, #0b2c60 0%, #1e40af 50%, #f97316 100%)",
              boxShadow: "0 4px 18px rgba(11,44,96,0.25), 0 0 0 1px rgba(11,44,96,0.1), inset 0 1px 0 rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" fill="white" />
                <rect x="13" y="3" width="8" height="8" rx="2" fill="rgba(255,255,255,0.75)" />
                <rect x="3" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,0.6)" />
                <rect x="13" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,0.35)" />
              </svg>
            </div>

            <div>
              {/* Gradient text on SAHU CSC */}
              <div style={{ display: "flex", gap: 3, alignItems: "baseline" }}>
                <span style={{
                  fontWeight: 900, fontSize: 20, letterSpacing: 0.5,
                  background: "linear-gradient(135deg, #0b2c60 0%, #1e40af 50%, #f97316 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontFamily: "'Segoe UI', sans-serif",
                  filter: "drop-shadow(0 1px 2px rgba(11,44,96,0.15))"
                }}>SAHU</span>
                <span style={{
                  fontWeight: 900, fontSize: 20,
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 60%, #c2410c 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 1px 2px rgba(249,115,22,0.2))"
                }}>CSC</span>
              </div>
              <div style={{ color: "#94a3b8", fontSize: 9, letterSpacing: 2.5, fontWeight: 700, fontFamily: "monospace" }}>MANAGEMENT PLATFORM</div>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button style={{
              width: 40, height: 40, borderRadius: 12,
              background: "#f8fafc", border: "1.5px solid #e2e8f0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b2c60" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, background: "#f97316", borderRadius: "50%", border: "2px solid white", boxShadow: "0 0 6px rgba(249,115,22,0.5)" }} />
            </button>

            {/* User pill */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#f8fafc", border: "1.5px solid #e2e8f0",
              borderRadius: 12, padding: "5px 12px 5px 5px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: "linear-gradient(135deg, #0b2c60 0%, #1e40af 50%, #f97316 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(11,44,96,0.3)"
              }}>
                <span style={{ color: "white", fontWeight: 800, fontSize: 11 }}>SA</span>
              </div>
              <span style={{
                fontWeight: 700, fontSize: 13,
                background: "linear-gradient(135deg, #0b2c60, #f97316)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
              }}>SAHU</span>
            </div>
          </div>
        </div>

        {/* Greeting strip */}
        <div style={{
          background: "linear-gradient(90deg, #0b2c60 0%, #1e3a8a 60%, #1e40af 100%)",
          borderTop: "1px solid rgba(11,44,96,0.1)",
          padding: "7px 16px", display: "flex", justifyContent: "space-between",
          position: "relative", zIndex: 2
        }}>
          <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>Good morning, SAHU ☀️</span>
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: "monospace" }}>Mon, 29 Jun</span>
        </div>
      </header>
    </div>
  );
}
