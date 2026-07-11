import { fmt } from "./aeps.constants";

// ─────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────
export function StatCard({
  label, value, accent, color, icon: Icon, wide = false,
}: {
  label: string; value: number; accent: string; color: string;
  icon: React.ElementType; wide?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden ${wide ? "col-span-2 sm:col-span-1" : ""}`}
      style={{ boxShadow: "0 2px 14px rgba(11,44,96,0.09), 0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div style={{ height: 3, background: accent }} />
      <div className="px-4 py-3.5 flex items-center gap-3">
        <div
          style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: accent, boxShadow: `0 4px 10px ${color}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Icon size={17} color="#fff" />
        </div>
        <div className="min-w-0">
          <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
            {label}
          </p>
          <p style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1.1 }}>
            ₹{fmt(value)}
          </p>
        </div>
      </div>
    </div>
  );
}
