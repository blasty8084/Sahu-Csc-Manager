import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line,
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

const aepsData = [
  { date: "14 Jun", opening: 25000, closing: 18400 },
  { date: "15 Jun", opening: 30000, closing: 22100 },
  { date: "16 Jun", opening: 20000, closing: 14800 },
  { date: "17 Jun", opening: 35000, closing: 28200 },
  { date: "18 Jun", opening: 28000, closing: 19600 },
  { date: "19 Jun", opening: 40000, closing: 32500 },
  { date: "20 Jun", opening: 32000, closing: 24100 },
];

const services = [
  { name: "Aadhaar", value: 38, color: "#3b82f6" },
  { name: "PAN Card", value: 24, color: SAFFRON },
  { name: "Utility", value: 18, color: "#10b981" },
  { name: "Insurance", value: 12, color: "#8b5cf6" },
  { name: "Others", value: 8, color: "#94a3b8" },
];

const topServices = [
  { name: "Aadhaar Update", txns: 142, revenue: 14200, color: "#3b82f6" },
  { name: "PAN Card Apply", txns: 98, revenue: 9800, color: SAFFRON },
  { name: "Electricity Bill", txns: 87, revenue: 4350, color: "#10b981" },
  { name: "PM Jeevan Jyoti", txns: 64, revenue: 12800, color: "#8b5cf6" },
  { name: "NREGA Enrolment", txns: 51, revenue: 5100, color: "#64748b" },
];

const TABS = [
  { id: "daily", label: "Daily Report", icon: "📅" },
  { id: "monthly", label: "Monthly", icon: "📈" },
  { id: "aeps", label: "AePS", icon: "💳" },
  { id: "services", label: "Services", icon: "🔧" },
];

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", borderRadius: 10, padding: "10px 14px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          <span style={{ fontSize: 12, color: "#334155" }}>{p.name}: <b>₹{p.value.toLocaleString("en-IN")}</b></span>
        </div>
      ))}
    </div>
  );
};

const MetricChip = ({ label, value, sub, color, bg }: any) => (
  <div style={{
    background: bg, borderRadius: 12, padding: "14px 18px", flex: 1,
    border: `1px solid ${color}22`,
  }}>
    <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: "-0.5px" }}>{value}</div>
    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{sub}</div>
  </div>
);

export function CommandCenter() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: "#f1f5f9", overflow: "hidden" }}>

      {/* Top navigation bar */}
      <div style={{
        background: "white", borderBottom: "1px solid #e2e8f0",
        display: "flex", alignItems: "stretch",
      }}>
        {/* Brand */}
        <div style={{
          padding: "0 24px", display: "flex", alignItems: "center", gap: 12,
          borderRight: "1px solid #e2e8f0", minWidth: 220,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: `linear-gradient(135deg, ${NAVY}, #0f3872)`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>📊</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>SAHU CSC</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>Reports Center</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", flex: 1 }}>
          {TABS.map((tab, i) => (
            <div key={tab.id} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "0 22px",
              borderBottom: i === 0 ? `3px solid ${NAVY}` : "3px solid transparent",
              cursor: "pointer",
              color: i === 0 ? NAVY : "#94a3b8",
              fontSize: 13, fontWeight: i === 0 ? 700 : 400,
            }}>
              <span style={{ fontSize: 14 }}>{tab.icon}</span>
              {tab.label}
            </div>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ padding: "0 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            border: "1px solid #e2e8f0", borderRadius: 9, padding: "7px 14px",
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
          }}>
            <span style={{ fontSize: 12 }}>📅</span>
            <span style={{ fontSize: 12, color: "#334155" }}>20 Jun 2026</span>
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${SAFFRON}, #fb923c)`,
            color: "white", borderRadius: 9, padding: "8px 16px",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>↓ Export</div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{
        background: NAVY, padding: "16px 28px",
        display: "flex", gap: 1,
      }}>
        {[
          { label: "TOTAL CREDITS", value: "₹42,800", diff: "+18%", pos: true },
          { label: "TOTAL DEBITS", value: "₹12,100", diff: "-4%", pos: false },
          { label: "NET PROFIT", value: "₹30,700", diff: "+22%", pos: true },
          { label: "TRANSACTIONS", value: "34", diff: "+6", pos: true },
          { label: "AVG TICKET SIZE", value: "₹1,259", diff: "+₹88", pos: true },
        ].map((item, i) => (
          <div key={item.label} style={{
            flex: 1, padding: "0 20px", borderRight: i < 4 ? "1px solid rgba(255,255,255,0.12)" : "none",
          }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 4 }}>{item.value}</div>
            <div style={{
              fontSize: 11, fontWeight: 700,
              color: item.pos ? "#34d399" : "#fca5a5",
            }}>{item.diff} vs yesterday</div>
          </div>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

          {/* Main bar chart */}
          <div style={{ background: "white", borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Weekly Cashflow</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Credits vs Debits · This week</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {[{ l: "Credits", c: "#3b82f6" }, { l: "Debits", c: "#fca5a5" }].map(x => (
                  <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekData} barGap={6} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="credit" name="Credits" fill="#3b82f6" radius={[5, 5, 0, 0]} />
                <Bar dataKey="debit" name="Debits" fill="#fca5a5" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* AePS area chart */}
          <div style={{ background: "white", borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>AePS Float — This Week</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>Opening vs Closing balance daily (₹)</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={aepsData}>
                <defs>
                  <linearGradient id="openGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="closeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="opening" name="Opening" stroke="#3b82f6" strokeWidth={2} fill="url(#openGrad)" dot={false} />
                <Area type="monotone" dataKey="closing" name="Closing" stroke="#10b981" strokeWidth={2} fill="url(#closeGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>

          {/* Services table */}
          <div style={{ background: "white", borderRadius: 14, boxShadow: "0 2px 16px rgba(11,44,96,0.07)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Service Breakdown</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Top earning services this month</div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  {["Rank", "Service Name", "Txns", "Revenue"].map(h => (
                    <th key={h} style={{
                      padding: "9px 16px", fontSize: 10, color: "#94a3b8", letterSpacing: "0.07em",
                      fontWeight: 600, textTransform: "uppercase", textAlign: "left",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topServices.map((s, i) => (
                  <tr key={s.name} style={{ borderTop: "1px solid #f8fafc" }}>
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 7, background: i < 3
                          ? ["linear-gradient(135deg,#f59e0b,#fbbf24)", "linear-gradient(135deg,#94a3b8,#cbd5e1)", "linear-gradient(135deg,#b45309,#d97706)"][i]
                          : "#f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 800, color: i < 3 ? "white" : "#94a3b8",
                      }}>{i + 1}</div>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{
                        background: "#eff6ff", color: "#1d4ed8",
                        borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700,
                      }}>{s.txns}</span>
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 700, color: "#10b981" }}>
                      ₹{s.revenue.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pie + metrics */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 14 }}>Service Mix</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <PieChart width={200} height={140}>
                  <Pie data={services} cx={100} cy={70} innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                    {services.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${v}%`} />
                </PieChart>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 6 }}>
                {services.map(s => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                    <span style={{ fontSize: 11, color: "#334155", flex: 1 }}>{s.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, #0f3872)`, borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>AePS TODAY</div>
              {[
                { label: "Opening Balance", value: "₹32,000" },
                { label: "Total Withdrawn", value: "₹19,200" },
                { label: "Total Deposited", value: "₹11,300" },
                { label: "Closing Balance", value: "₹24,100" },
              ].map((row, i) => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{row.label}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: i === 2 ? "#34d399" : i === 1 ? "#fca5a5" : "white",
                  }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
