export function PageSkeleton() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes govSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes govBar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        @keyframes govPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>

      {/* Top animated progress bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "var(--brand-navy-tint-md)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: "45%",
            background: "linear-gradient(90deg, var(--brand-navy-800), var(--brand-navy-600), var(--brand-orange))",
            animation: "govBar 1.8s ease-in-out infinite",
            borderRadius: "0 3px 3px 0",
          }}
        />
      </div>

      {/* Govt emblem-style ring */}
      <div style={{ position: "relative", marginBottom: 24 }}>
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: "2px solid var(--brand-navy-tint-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "2.5px solid transparent",
              borderTopColor: "var(--brand-navy-800)",
              borderRightColor: "var(--brand-navy-shadow-md)",
              position: "absolute",
              animation: "govSpin 1s linear infinite",
            }}
          />
          <img
            src="/sahu-logo.png"
            alt="SAHU CSC"
            style={{
              width: 62,
              height: 62,
              borderRadius: 14,
              objectFit: "contain",
              position: "relative",
              zIndex: 1,
            }}
          />
        </div>
      </div>

      {/* Brand name */}
      <h1
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: "var(--brand-navy-800)",
          letterSpacing: "0.05em",
          margin: 0,
          lineHeight: 1,
        }}
      >
        SAHU <span style={{ color: "var(--brand-orange)" }}>CSC</span>
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 10,
          color: "var(--color-slate-400)",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          marginTop: 6,
          marginBottom: 32,
        }}
      >
        Common Service Center &middot; Odisha
      </p>

      {/* Loading dots */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: i === 0 ? "var(--brand-navy-800)" : i === 1 ? "var(--brand-navy-600)" : "var(--brand-orange)",
              animation: `govPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <p style={{ fontSize: 11, color: "#b0bec5", fontWeight: 500, margin: 0 }}>
        Loading, please wait…
      </p>

      {/* Bottom govt stripe */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, var(--brand-navy-800) 0%, var(--brand-navy-600) 40%, var(--brand-orange) 100%)",
        }}
      />

      {/* Subtle background pattern (like NIC portals) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 80%, var(--brand-navy-tint-sm) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(249,115,22,0.03) 0%, transparent 50%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </div>
  );
}
