interface SectionLoaderProps {
  message?: string;
  minHeight?: string | number;
  size?: "sm" | "md" | "lg";
}

export function SectionLoader({
  message = "Loading…",
  minHeight = 180,
  size = "md",
}: SectionLoaderProps) {
  const spinnerSize = size === "sm" ? 22 : size === "lg" ? 44 : 32;
  const borderWidth = size === "sm" ? 2 : size === "lg" ? 3.5 : 2.5;
  const fontSize = size === "sm" ? 10 : size === "lg" ? 13 : 11;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight,
        gap: 10,
        padding: "24px 0",
      }}
    >
      <style>{`
        @keyframes sectionSpin { to { transform: rotate(360deg); } }
        @keyframes sectionPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
      `}</style>

      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: `${borderWidth}px solid rgba(11,44,96,0.10)`,
          borderTopColor: "#0b2c60",
          borderRadius: "50%",
          animation: "sectionSpin 0.85s linear infinite",
        }}
      />

      {/* Three dots */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: size === "sm" ? 4 : 5,
              height: size === "sm" ? 4 : 5,
              borderRadius: "50%",
              background: i === 1 ? "#f97316" : "#0b2c60",
              opacity: 0.6,
              animation: `sectionPulse 1.1s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>

      <p
        style={{
          fontSize,
          color: "#94a3b8",
          fontWeight: 500,
          margin: 0,
          letterSpacing: "0.02em",
        }}
      >
        {message}
      </p>
    </div>
  );
}
