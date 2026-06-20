import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";

const NAVY = "#0b2c60";
const SAFFRON = "#f97316";

const weekData = [
  { day: "Mon", credit: 4200, debit: 1100 },
  { day: "Tue", credit: 3800, debit: 900 },
  { day: "Wed", credit: 5100, debit: 1400 },
  { day: "Thu", credit: 2900, debit: 700 },
  { day: "Fri", credit: 6200, debit: 1800 },
  { day: "Sat", credit: 7100, debit: 2100 },
  { day: "Sun", credit: 3400, debit: 800 },
];

const monthlyDays = Array.from({ length: 20 }, (_, i) => ({
  date: `${i + 1}`,
  net: 800 + Math.floor(Math.random() * 2400),
}));

const services = [
  { name: "Aadhaar Update", txns: 142, revenue: 14200, pct: 38, color: "#3b82f6" },
  { name: "PAN Card Apply", txns: 98, revenue: 9800, pct: 26, color: SAFFRON },
  { name: "Electricity Bill", txns: 87, revenue: 4350, pct: 18, color: "#10b981" },
  { name: "PM Jeevan Jyoti", txns: 64, revenue: 12800, pct: 12, color: "#8b5cf6" },
  { name: "NREGA Enrolment", txns: 51, revenue: 5100, pct: 6, color: "#94a3b8" },
];

const NAV = [
  { id: "daily", label: "Daily", icon: "📅" },
  { id: "monthly", label: "Monthly", icon: "📈" },
  { id: "aeps", label: "AePS", icon: "💳" },
  { id: "services", label: "Services", icon: "🔧" },
];

const KPICard = ({ label, value, change, changePos, color }: any) => (
  <div style={{
    background: "white", borderRadius: 14, padding: "18px 20px",
    border: "1px solid #e2e8f0", flex: 1,
    borderLeft: `4px solid ${color}`,
  }}>
    <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 6 }}>{value}</div>
    <div style={{ fontSize: 11, color: changePos ? "#10b981" : "#ef4444", fontWeight: 600 }}>
      {changePos ? "▲" : "▼"} {change}
    </div>
  </div>
);

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "1px solid #f1f5f9" }}>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ fontSize: 12, color: "#334155", marginBottom: 2 }}>
          <b style={{ color: p.color }}>₹{p.value.toLocaleString("en-IN")}</b> {p.name}
        </div>
      ))}
    </div>
  );
};

export function CleanDashboard() {
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: "#f8fafc" }}>

      {/* Left sidebar — white, minimal */}
      <div style={{
        width: 220, background: "white", borderRight: "1px solid #e2e8f0",
        display: "flex", flexDirection: "column", padding: "0 0 20px",
      }}>
        {/* Brand */}
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, background: NAVY,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
            }}>📊</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Reports</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>SAHU CSC · Jun 2026</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding: "14px 12px 0", flex: 1 }}>
          <div style={{ fontSize: 10, color: "#cbd5e1", letterSpacing: "0.08em", padding: "0 8px", marginBottom: 8 }}>REPORT TYPE</div>
          {NAV.map((item, i) => (
            <div key={item.id} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 10px",
              borderRadius: 9, marginBottom: 3, cursor: "pointer",
              background: i === 0 ? "#eff6ff" : "transparent",
              color: i === 0 ? "#1d4ed8" : "#64748b",
              fontSize: 13, fontWeight: i === 0 ? 600 : 400,
            }}>
              <span>{item.icon}</span>
              {item.label} Report
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ padding: "0 12px" }}>
          <div style={{ fontSize: 10, color: "#cbd5e1", letterSpacing: "0.08em", padding: "0 8px", marginBottom: 8 }}>DATE</div>
          <div style={{
            border: "1px solid #e2e8f0", borderRadius: 9, padding: "9px 12px",
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            background: "white",
          }}>
            <span style={{ fontSize: 13 }}>📅</span>
            <span style={{ fontSize: 12, color: "#334155" }}>20 Jun 2026</span>
          </div>
          <div style={{
            marginTop: 10, background: NAVY, color: "white", borderRadius: 9,
            padding: "10px 0", textAlign: "center", fontSize: 12, fontWeight: 600,
            cursor: "pointer",
          }}>Export Excel</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto", padding: "26px 28px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: NAVY }}>Daily Report — 20 June 2026</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Business performance summary · Updated live</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Today", "Yesterday", "Week"].map((t, i) => (
                <button key={t} style={{
                  padding: "6px 14px", borderRadius: 8, border: i === 0 ? "none" : "1px solid #e2e8f0",
                  background: i === 0 ? NAVY : "white", color: i === 0 ? "white" : "#64748b",
                  fontSize: 12, fontWeight: i === 0 ? 600 : 400, cursor: "pointer",
                }}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
          <KPICard label="Total Credits" value="₹42,800" change="18% vs yesterday" changePos={true} color="#10b981" />
          <KPICard label="Total Debits" value="₹12,100" change="4% vs yesterday" changePos={false} color="#ef4444" />
          <KPICard label="Net Profit" value="₹30,700" change="22% vs yesterday" changePos={true} color={NAVY} />
          <KPICard label="Transactions" value="34" change="6 more than yesterday" changePos={true} color={SAFFRON} />
        </div>

        {/* Two charts side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          {/* Bar chart */}
          <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>This Week</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 14 }}>Daily credits vs debits (₹)</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weekData} barSize={16} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="credit" name="Credits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="debit" name="Debits" fill="#fca5a5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Area chart */}
          <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Net This Month</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 14 }}>Day-wise net amount (₹)</div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyDays}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={NAVY} stopOpacity={0.12} />
                    <stop offset="100%" stopColor={NAVY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="net" name="Net" stroke={NAVY} strokeWidth={2} fill="url(#areaGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Services table */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Top Services</div>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>June 2026 · All categories</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                {["Service", "Transactions", "Revenue", "Share", "% Share"].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 10, color: "#94a3b8", letterSpacing: "0.07em", padding: "10px 20px", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={s.name} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 20px", fontSize: 13, color: "#334155", fontWeight: 600 }}>{s.txns}</td>
                  <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 700, color: "#10b981" }}>₹{s.revenue.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "12px 20px", minWidth: 140 }}>
                    <div style={{ background: "#f1f5f9", borderRadius: 20, height: 6, overflow: "hidden" }}>
                      <div style={{ background: s.color, height: "100%", width: `${s.pct}%`, borderRadius: 20 }} />
                    </div>
                  </td>
                  <td style={{ padding: "12px 20px", fontSize: 12, fontWeight: 700, color: s.color }}>{s.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
