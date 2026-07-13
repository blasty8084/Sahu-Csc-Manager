/**
 * ReportsChart.tsx
 * All Recharts chart areas used in the Reports page.
 */
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
  AreaChart, Area,
} from "recharts";
import { PIE_COLORS } from "@/hooks/useReports";
import { ChartTooltip } from "./ReportChart";

// ── Mobile: Monthly daily-revenue bar chart ───────────────────────────────────
export function MobileDailyRevenueChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)" }}>
      <div style={{ height: 3, background: "linear-gradient(90deg,#8b5cf6,#7c3aed)" }} />
      <div className="p-4">
        <p className="text-xs font-bold text-slate-600 mb-3">Daily Revenue</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} margin={{ top: 0, right: 4, left: -28, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#94a3b8" }} tickFormatter={v => v.split("-")[2]} />
            <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} />
            <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, ""]} labelFormatter={l => `Date: ${l}`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Bar dataKey="credits" fill="#10b981" name="Credits" radius={[2, 2, 0, 0]} />
            <Bar dataKey="debits" fill="#f97316" name="Debits" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Mobile: AePS daily-breakdown bar chart ────────────────────────────────────
export function MobileAepsDailyChart({ data, height = 140 }: { data: any[]; height?: number }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)" }}>
      <div style={{ height: 3, background: "linear-gradient(90deg,#f97316,#ea580c)" }} />
      <div className="p-4">
        <p className="text-xs font-bold text-slate-600 mb-3">
          {height === 150 ? "Withdrawals vs Deposits" : "AePS Daily Breakdown"}
        </p>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 0, right: 4, left: -28, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#94a3b8" }} tickFormatter={v => v.split("-")[2]} />
            <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} />
            <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, ""]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" radius={[2, 2, 0, 0]} />
            <Bar dataKey="deposits" fill="#10b981" name="Deposits" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Mobile: Services pie chart ────────────────────────────────────────────────
export function MobileServicesPieChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.08)" }}>
      <div style={{ height: 3, background: "linear-gradient(90deg,#10b981,#059669)" }} />
      <div className="p-4">
        <p className="text-xs font-bold text-slate-600 mb-3">Revenue by Service</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="revenue" nameKey="serviceType" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
              {data.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Desktop: Today's Cashflow bar chart ───────────────────────────────────────
interface DailyCashflowChartProps {
  totalCredits: number;
  totalDebits: number;
  dailyDate: string;
}
export function DailyCashflowChart({ totalCredits, totalDebits, dailyDate }: DailyCashflowChartProps) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Today's Cashflow</p>
          <p style={{ fontSize: 11, color: "#94a3b8" }}>Credits vs Debits · {dailyDate}</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {[{ l: "Credits", c: "#3b82f6" }, { l: "Debits", c: "#fca5a5" }].map(x => (
            <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{x.l}</span>
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={[{ name: "Today", credits: totalCredits, debits: totalDebits }]} barSize={48} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="credits" name="Credits" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          <Bar dataKey="debits" name="Debits" fill="#fca5a5" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Desktop: Service mix pie (daily) ──────────────────────────────────────────
export function ServiceMixPieChart({ services }: { services: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>Service Mix</p>
      <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>By revenue share</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={services} dataKey="revenue" nameKey="serviceType" cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3}>
            {services.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 6 }}>
        {services.slice(0, 5).map((s: any, i: number) => (
          <div key={s.serviceType} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#334155", flex: 1 }}>{s.serviceType}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: PIE_COLORS[i % PIE_COLORS.length] }}>{s.count} tx</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Desktop: Monthly daily-revenue bar chart ──────────────────────────────────
interface MonthlyRevenueChartProps {
  data: any[];
  reportMonth: number;
  reportYear: number;
  months: string[];
}
export function MonthlyRevenueChart({ data, reportMonth, reportYear, months }: MonthlyRevenueChartProps) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Daily Revenue Trend</p>
          <p style={{ fontSize: 11, color: "#94a3b8" }}>Credits vs Debits · {months[reportMonth - 1]} {reportYear}</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {[{ l: "Credits", c: "#3b82f6" }, { l: "Debits", c: "#fca5a5" }].map(x => (
            <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{x.l}</span>
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => v.split("-")[2]} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="credits" name="Credits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="debits" name="Debits" fill="#fca5a5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Desktop: AePS float area chart (monthly) ──────────────────────────────────
export function AepsFloatAreaChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>AePS Float — This Month</p>
        <p style={{ fontSize: 11, color: "#94a3b8" }}>Withdrawals vs Deposits daily</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="wdGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="dpGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => v.split("-")[2]} />
          <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="withdrawals" name="Withdrawals" stroke="#ef4444" strokeWidth={2} fill="url(#wdGrad)" dot={false} />
          <Area type="monotone" dataKey="deposits" name="Deposits" stroke="#10b981" strokeWidth={2} fill="url(#dpGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Desktop: AePS withdrawals vs deposits bar chart ───────────────────────────
export function AepsBarChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Withdrawals vs Deposits</p>
          <p style={{ fontSize: 11, color: "#94a3b8" }}>Day-by-day AePS cashflow</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {[{ l: "Withdrawals", c: "#ef4444" }, { l: "Deposits", c: "#10b981" }].map(x => (
            <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{x.l}</span>
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => v.split("-")[2]} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="withdrawals" name="Withdrawals" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="deposits" name="Deposits" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Desktop: Opening balance area chart (AePS) ────────────────────────────────
export function OpeningBalanceAreaChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60" }}>Opening Balance Trend</p>
        <p style={{ fontSize: 11, color: "#94a3b8" }}>Daily opening float over period</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="obGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => v.split("-")[2]} />
          <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="openingBalance" name="Opening Balance" stroke="#3b82f6" strokeWidth={2} fill="url(#obGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Desktop: Services revenue pie chart ───────────────────────────────────────
export function ServicesRevenuePieChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(11,44,96,0.07)" }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>Revenue by Service</p>
      <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>All-time share</p>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="revenue" nameKey="serviceType" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3}>
            {data.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ fontSize: 11, borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8 }}>
        {data.slice(0, 5).map((s: any, i: number) => (
          <div key={s.serviceType} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#334155", flex: 1 }}>{s.serviceType}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: PIE_COLORS[i % PIE_COLORS.length] }}>{s.count} tx</span>
          </div>
        ))}
      </div>
    </div>
  );
}
