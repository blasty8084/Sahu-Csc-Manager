// ── Shared chart tooltip ──────────────────────────────────────────────────────
export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", border: "none" }}>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "#334155" }}>
            {p.name}: <b>₹{Number(p.value).toLocaleString("en-IN")}</b>
          </span>
        </div>
      ))}
    </div>
  );
}
