import { LineChart, Line } from "recharts";
import { BarChart2 } from "lucide-react";

// ── Sparkline ─────────────────────────────────────────────────────────────────
export function Sparkline({ data, color }: { data: { v: number }[]; color: string }) {
  const trend = data.length >= 2 ? data[data.length - 1].v - data[0].v : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
      <LineChart width={72} height={28} data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} dot={false} isAnimationActive={false} />
      </LineChart>
      <span style={{ fontSize: 10, fontWeight: 700, color: trend >= 0 ? "#10b981" : "#ef4444" }}>
        {trend >= 0 ? "▲" : "▼"} 7d
      </span>
    </div>
  );
}

// ── Mobile stat card ──────────────────────────────────────────────────────────
export function MobileStatCard({
  label, value, sub, accentColor, iconGrad, Icon, isLoading,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accentColor: string;
  iconGrad: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden flex-1 min-w-0" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.10)" }}>
      <div style={{ height: 3, background: accentColor }} />
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1.2 }}>{label}</p>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: iconGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={12} color="#fff" />
          </div>
        </div>
        {isLoading
          ? <div className="h-5 w-20 mb-1 rounded bg-slate-100 animate-pulse" />
          : <p style={{ fontSize: 15, fontWeight: 900, color: "#0b2c60", lineHeight: 1.1 }}>{value}</p>}
        {sub && <p style={{ fontSize: 9, fontWeight: 600, color: "#94a3b8", marginTop: 3 }} className="truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ── Desktop stat card ─────────────────────────────────────────────────────────
export function DesktopStatCard({
  label, value, sub, accentColor, iconGrad, Icon, isLoading, sparkData, sparkColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accentColor: string;
  iconGrad: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
  isLoading?: boolean;
  sparkData?: { v: number }[];
  sparkColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden flex-1" style={{ boxShadow: "0 2px 20px rgba(11,44,96,0.10)", borderTop: `4px solid ${accentColor}` }}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: iconGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px ${accentColor}44` }}>
            <Icon size={18} color="#fff" />
          </div>
        </div>
        {isLoading
          ? <div className="h-8 w-28 mb-2 rounded-lg bg-slate-100 animate-pulse" />
          : <p style={{ fontSize: 26, fontWeight: 900, color: "#0b2c60", lineHeight: 1 }}>{value}</p>}
        {sub && <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginTop: 6 }}>{sub}</p>}
        {sparkData && sparkData.length >= 2 && <Sparkline data={sparkData} color={sparkColor ?? accentColor} />}
      </div>
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
export function SectionLabel({ label, accentGrad }: { label: string; accentGrad: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-5 rounded-full" style={{ background: accentGrad }} />
      <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
    </div>
  );
}

// ── KPI chip (desktop navy strip) ─────────────────────────────────────────────
export function KpiChip({
  label, value, trend, pos,
}: {
  label: string;
  value: string | number;
  trend?: string;
  pos?: boolean;
}) {
  return (
    <div style={{ flex: 1, padding: "0 20px", borderRight: "1px solid rgba(255,255,255,0.10)" }}>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", marginBottom: 5, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 19, fontWeight: 900, color: "white", marginBottom: 3, letterSpacing: "-0.5px" }}>{value}</div>
      {trend && (
        <div style={{ fontSize: 10, fontWeight: 700, color: pos ? "#34d399" : "#fca5a5" }}>{trend}</div>
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(11,44,96,0.07)" }}>
        <BarChart2 size={28} style={{ color: "#94a3b8" }} />
      </div>
      <p className="text-sm font-semibold text-slate-400">{label}</p>
    </div>
  );
}
