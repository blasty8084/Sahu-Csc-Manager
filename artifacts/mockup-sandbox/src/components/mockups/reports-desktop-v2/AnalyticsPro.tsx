import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

const NAVY = "#0b2c60";
const SAFFRON = "#f97316";

const dailyData = [
  { day: "Mon", credit: 4200, debit: 1100 },
  { day: "Tue", credit: 3800, debit: 900 },
  { day: "Wed", credit: 5100, debit: 1400 },
  { day: "Thu", credit: 2900, debit: 700 },
  { day: "Fri", credit: 6200, debit: 1800 },
  { day: "Sat", credit: 7100, debit: 2100 },
  { day: "Sun", credit: 3400, debit: 800 },
];

const trendData = [
  { month: "Jan", net: 28000 },
  { month: "Feb", net: 31000 },
  { month: "Mar", net: 27500 },
  { month: "Apr", net: 34000 },
  { month: "May", net: 38500 },
  { month: "Jun", net: 42100 },
];

const services = [
  { name: "Aadhaar", value: 38, color: "#3b82f6" },
  { name: "PAN Card", value: 24, color: SAFFRON },
  { name: "Utility Bills", value: 18, color: "#10b981" },
  { name: "Insurance", value: 12, color: "#8b5cf6" },
  { name: "Others", value: 8, color: "#94a3b8" },
];

const topServices = [
  { name: "Aadhaar Update", txns: 142, revenue: 14200, trend: +12 },
  { name: "PAN Card Apply", txns: 98, revenue: 9800, trend: +8 },
  { name: "Electricity Bill", txns: 87, revenue: 4350, trend: -3 },
  { name: "PM Jeevan Jyoti", txns: 64, revenue: 12800, trend: +22 },
  { name: "NREGA Enrolment", txns: 51, revenue: 5100, trend: +5 },
];

const NAV_ITEMS = ["Daily", "Monthly", "AePS", "Services"];

const Stat = ({
  label, value, sub, accent, icon,
}: { label: string; value: string; sub: string; accent: string; icon: string }) => (
  <div style={{
    background: "white", borderRadius: 16, padding: "20px 22px",
    boxShadow: "0 2px 20px rgba(11,44,96,0.10)",
    borderTop: `4px solid ${accent}`, flex: 1,
  }}>
    <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
        background: `linear-gradient(135deg, ${accent}22, ${accent}44)`, fontSize: 20,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: NAVY, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{sub}</div>
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "none", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: p.color }} />
          <span style={{ fontSize: 12, color: "#334155" }}>{p.name}: <b>₹{p.value.toLocaleString("en-IN")}</b></span>
        </div>
      ))}
    </div>
  );
};

export function AnalyticsPro() {
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: "#f1f5f9" }}>

      {/* Sidebar */}
      <div style={{
        width: 232, background: `linear-gradient(160deg, ${NAVY} 0%, #0f3872 100%)`,
        display: "flex", flexDirection: "column", padding: "0 0 24px",
        boxShadow: "4px 0 24px rgba(11,44,96,0.18)",
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${SAFFRON}, #fb923c)`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>📊</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>SAHU CSC</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>REPORTS</div>
            </div>
          </div>
        </div>

        {/* Date range */}
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", marginBottom: 8 }}>REPORT TYPE</div>
          {NAV_ITEMS.map((item, i) => (
            <div key={item} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 10, marginBottom: 4, cursor: "pointer",
              background: i === 0 ? "rgba(255,255,255,0.12)" : "transparent",
              color: i === 0 ? "white" : "rgba(255,255,255,0.55)",
              fontSize: 13, fontWeight: i === 0 ? 600 : 400,
            }}>
              <span style={{ fontSize: 15 }}>{["📅", "📈", "💳", "🔧"][i]}</span>
              {item} Report
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Filters */}
        <div style={{ padding: "0 20px" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", marginBottom: 10 }}>FILTER</div>
          <div style={{
            background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 13 }}>📅</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", flex: 1 }}>20 Jun 2026</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{
              background: `linear-gradient(135deg, ${SAFFRON}, #fb923c)`,
              color: "white", borderRadius: 10, padding: "10px 0",
              textAlign: "center", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              Export Excel ↓
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto", padding: "28px 28px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: NAVY }}>Daily Report</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>Friday, 20 June 2026 · All data is user-scoped</div>
          </div>
          <div style={{
            background: "white", borderRadius: 10, padding: "8px 16px",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 2px 12px rgba(11,44,96,0.08)", cursor: "pointer",
          }}>
            <span style={{ fontSize: 13 }}>🔔</span>
            <span style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>Live data</span>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#10b981" }} />
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 22 }}>
          <Stat label="Total Credits" value="₹42,800" sub="+18% vs yesterday" accent="#10b981" icon="💰" />
          <Stat label="Total Debits" value="₹12,100" sub="7 transactions" accent="#ef4444" icon="📤" />
          <Stat label="Net Balance" value="₹30,700" sub="Running total" accent={NAVY} icon="📊" />
          <Stat label="Transactions" value="34" sub="Across 8 services" accent={SAFFRON} icon="⚡" />
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, marginBottom: 20 }}>

          {/* Bar chart */}
          <div style={{ background: "white", borderRadius: 16, padding: "20px 22px", boxShadow: "0 2px 20px rgba(11,44,96,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Weekly Overview</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Credits vs Debits</div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                {[{ label: "Credits", color: NAVY }, { label: "Debits", color: SAFFRON }].map(l => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                    <span style={{ fontSize: 11, color: "#64748b" }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="credit" name="Credits" fill={NAVY} radius={[5, 5, 0, 0]} />
                <Bar dataKey="debit" name="Debits" fill={SAFFRON} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div style={{ background: "white", borderRadius: 16, padding: "20px 22px", boxShadow: "0 2px 20px rgba(11,44,96,0.08)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Service Mix</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>By transaction share</div>
            <PieChart width={296} height={160}>
              <Pie data={services} cx={148} cy={80} innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={3}>
                {services.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip formatter={(v: any) => `${v}%`} />
            </PieChart>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
              {services.map(s => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#334155", flex: 1 }}>{s.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Net trend */}
        <div style={{ background: "white", borderRadius: 16, padding: "20px 22px", boxShadow: "0 2px 20px rgba(11,44,96,0.08)", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>6-Month Net Trend</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>Monthly net profit ₹</div>
            </div>
            <div style={{
              background: "#dcfce7", color: "#15803d", borderRadius: 20, padding: "4px 12px",
              fontSize: 11, fontWeight: 700,
            }}>▲ +42% YTD</div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={NAVY} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={NAVY} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="net" name="Net" stroke={NAVY} strokeWidth={2.5} fill="url(#netGrad)" dot={{ fill: NAVY, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top services table */}
        <div style={{ background: "white", borderRadius: 16, padding: "20px 22px", boxShadow: "0 2px 20px rgba(11,44,96,0.08)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 16 }}>Top Services This Month</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                {["#", "Service", "Transactions", "Revenue", "Trend"].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 10, color: "#94a3b8", letterSpacing: "0.08em", padding: "0 8px 10px", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topServices.map((s, i) => (
                <tr key={s.name} style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td style={{ padding: "10px 8px", fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ padding: "10px 8px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{s.name}</div>
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center",
                      background: "#eff6ff", color: "#1d4ed8", borderRadius: 20, padding: "3px 10px",
                      fontSize: 11, fontWeight: 700,
                    }}>{s.txns}</div>
                  </td>
                  <td style={{ padding: "10px 8px", fontSize: 13, fontWeight: 700, color: "#10b981" }}>₹{s.revenue.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "10px 8px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: s.trend > 0 ? "#10b981" : "#ef4444",
                    }}>{s.trend > 0 ? "▲" : "▼"} {Math.abs(s.trend)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
