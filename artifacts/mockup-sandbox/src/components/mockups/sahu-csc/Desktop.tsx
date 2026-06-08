import { useState } from "react";
import {
  Home, BookOpen, CreditCard, User, Bell, ChevronRight, Search,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft,
  Shield, Zap, FileText, Users, BarChart2, Settings, LogOut,
  CheckCircle, Clock, AlertCircle, Activity, Wallet,
  Download, Plus, RefreshCw, ChevronDown, Monitor
} from "lucide-react";

const navGroups = [
  {
    label: "Main",
    items: [
      { icon: Home, label: "Dashboard", active: true, badge: null },
      { icon: BookOpen, label: "Ledger", active: false, badge: null },
      { icon: CreditCard, label: "AePS", active: false, badge: null },
      { icon: Shield, label: "Services", active: false, badge: "22" },
      { icon: BarChart2, label: "Reports", active: false, badge: null },
    ],
  },
  {
    label: "Administration",
    items: [
      { icon: Bell, label: "Notifications", active: false, badge: "3" },
      { icon: Users, label: "User Management", active: false, badge: null },
      { icon: Activity, label: "Audit Logs", active: false, badge: null },
      { icon: Settings, label: "Settings", active: false, badge: null },
    ],
  },
];

const stats = [
  { label: "Current Balance", value: "₹1,24,850", sub: "Running balance", change: "+₹5,200 today", up: true, icon: Wallet, accent: "#1a2e5a" },
  { label: "Today's Income", value: "₹8,450", sub: "24 transactions", change: "+18% vs yesterday", up: true, icon: TrendingUp, accent: "#059669" },
  { label: "Today's Expense", value: "₹3,250", sub: "8 transactions", change: "-5% vs yesterday", up: false, icon: TrendingDown, accent: "#e11d48" },
  { label: "Active Services", value: "22", sub: "Across 5 categories", change: "All operational", up: true, icon: Zap, accent: "#f97316" },
];

const transactions = [
  { name: "Aadhaar Card Update", customer: "Ramesh Sahu", amount: 150, type: "credit", time: "10:32 AM", status: "success", service: "Gov ID", method: "Cash" },
  { name: "LIC Premium Collection", customer: "Sunita Devi", amount: 2400, type: "debit", time: "09:15 AM", status: "success", service: "Insurance", method: "Online" },
  { name: "PAN Card Application", customer: "Mohan Patra", amount: 200, type: "credit", time: "08:50 AM", status: "pending", service: "Gov ID", method: "Cash" },
  { name: "BSNL Electricity Bill", customer: "Geeta Nayak", amount: 850, type: "debit", time: "08:20 AM", status: "success", service: "Utility", method: "Online" },
  { name: "PM Kisan Registration", customer: "Bijay Behera", amount: 500, type: "credit", time: "07:45 AM", status: "success", service: "Scheme", method: "Cash" },
  { name: "Voter ID Application", customer: "Priya Das", amount: 100, type: "credit", time: "07:10 AM", status: "success", service: "Gov ID", method: "Cash" },
  { name: "Health Insurance", customer: "Suresh Nanda", amount: 1800, type: "debit", time: "Yesterday", status: "success", service: "Insurance", method: "Online" },
];

const topServices = [
  { name: "Aadhaar Services", count: 48, revenue: "₹7,200", pct: 80, color: "#1a2e5a" },
  { name: "Utility Bills", count: 32, revenue: "₹4,800", pct: 53, color: "#f97316" },
  { name: "Insurance", count: 24, revenue: "₹18,000", pct: 40, color: "#059669" },
  { name: "PAN Card", count: 18, revenue: "₹3,600", pct: 30, color: "#7c3aed" },
  { name: "PM Schemes", count: 12, revenue: "₹6,000", pct: 20, color: "#d97706" },
];

const weeklyData = [65, 48, 82, 74, 90, 58, 76];
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const maxVal = Math.max(...weeklyData);

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; Icon: typeof CheckCircle }> = {
    success: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle },
    pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200", Icon: Clock },
    failed: { label: "Failed", cls: "bg-red-50 text-red-700 border-red-200", Icon: AlertCircle },
  };
  const { label, cls, Icon } = map[status] ?? map.failed;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      <Icon className="w-2.5 h-2.5" /> {label}
    </span>
  );
}

export function Desktop() {
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeItem, setActiveItem] = useState(0);

  return (
    <div className="w-[1280px] h-[800px] bg-gray-50 flex font-['Inter'] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#0f1e3d] flex flex-col flex-shrink-0 overflow-y-auto">
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f97316] flex items-center justify-center flex-shrink-0">
              <Monitor className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">SAHU CSC</p>
              <p className="text-blue-300 text-[10px]">Common Service Center</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="mx-3 mt-3 bg-white/10 rounded-xl p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#f97316] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">Admin User</p>
            <p className="text-blue-300 text-[10px] truncate">Administrator · Odisha</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-blue-300 flex-shrink-0" />
        </div>

        {/* Nav Groups */}
        <nav className="flex-1 py-3 px-3 space-y-4">
          {navGroups.map((group, gi) => (
            <div key={group.label}>
              <p className="text-blue-400 text-[9px] font-bold uppercase tracking-widest px-2 mb-1.5">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item, ii) => {
                  const isActive = gi === 0 && ii === 0;
                  return (
                    <button
                      key={item.label}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${isActive ? "bg-[#f97316] text-white shadow-lg" : "text-blue-200 hover:bg-white/10 hover:text-white"}`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs font-semibold flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/30 text-white" : "bg-[#f97316]/30 text-[#f97316]"}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-white/10 pt-3">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-300 hover:bg-white/10 hover:text-white transition-all">
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-semibold">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <div className="flex-1">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 max-w-sm">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input placeholder="Search services, customers, ledger..." className="text-xs text-gray-600 bg-transparent outline-none flex-1" readOnly />
              <kbd className="text-[9px] font-mono bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">⌘K</kbd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
              <RefreshCw className="w-3 h-3" /> Sync
            </button>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#f97316] px-3 py-2 rounded-xl hover:bg-orange-600 transition-colors">
              <Plus className="w-3 h-3" /> New Entry
            </button>
            <div className="relative ml-1">
              <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                <Bell className="w-4 h-4 text-gray-500" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#f97316] rounded-full flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 text-xl font-bold">Dashboard</h1>
              <p className="text-gray-400 text-xs mt-0.5">Monday, 8 June 2026 · SAHU Common Service Center, Odisha</p>
            </div>
            <div className="flex items-center gap-2">
              <select className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl outline-none cursor-pointer">
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                <Download className="w-3 h-3" /> Export
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
                    <p className="text-gray-500 text-[10px]">{stat.sub}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: stat.accent + "18" }}>
                    <stat.icon className="w-4.5 h-4.5" style={{ color: stat.accent }} />
                  </div>
                </div>
                <p className="text-gray-900 text-2xl font-bold mb-1.5">{stat.value}</p>
                <p className={`text-[10px] font-semibold ${stat.up ? "text-emerald-600" : "text-rose-500"}`}>
                  {stat.change}
                </p>
              </div>
            ))}
          </div>

          {/* Middle Row: Chart + Top Services */}
          <div className="grid grid-cols-3 gap-4">
            {/* Weekly Chart - 2 cols */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-gray-900 text-sm font-bold">Weekly Revenue</h2>
                  <p className="text-gray-400 text-xs">Jun 2 – Jun 8, 2026</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-semibold">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1a2e5a] inline-block" /> Revenue</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f97316] inline-block" /> Target</span>
                </div>
              </div>
              <div className="flex items-end gap-2 h-32">
                {weeklyData.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center gap-0.5">
                      <div
                        className="w-full rounded-t-lg transition-all"
                        style={{
                          height: `${(val / maxVal) * 112}px`,
                          background: i === 6 ? "linear-gradient(180deg, #f97316, #fb923c)" : "linear-gradient(180deg, #1a2e5a, #2d4a8a)"
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 font-medium">{dayLabels[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Services */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900 text-sm font-bold">Top Services</h2>
                <button className="text-[#f97316] text-[10px] font-semibold">This month</button>
              </div>
              <div className="space-y-3.5">
                {topServices.map((svc) => (
                  <div key={svc.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-700 text-xs font-semibold truncate">{svc.name}</span>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-gray-400 text-[10px]">{svc.count}</span>
                        <span className="text-gray-600 text-[10px] font-semibold">{svc.revenue}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${svc.pct}%`, backgroundColor: svc.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-gray-900 text-sm font-bold">Recent Transactions</h2>
                <p className="text-gray-400 text-[10px]">Today's ledger entries</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1">
                  <Download className="w-3 h-3" /> Export Excel
                </button>
                <button className="text-[#f97316] text-xs font-semibold flex items-center gap-0.5">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Service", "Customer", "Amount", "Method", "Time", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === "credit" ? "bg-emerald-50" : "bg-rose-50"}`}>
                          {tx.type === "credit"
                            ? <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                            : <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                          }
                        </div>
                        <div>
                          <p className="text-gray-800 text-xs font-semibold">{tx.name}</p>
                          <p className="text-gray-400 text-[10px]">{tx.service}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      <p className="text-gray-700 text-xs font-medium">{tx.customer}</p>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className={`text-xs font-bold ${tx.type === "credit" ? "text-emerald-600" : "text-rose-500"}`}>
                        {tx.type === "credit" ? "+" : "−"}₹{tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className="text-gray-500 text-xs">{tx.method}</span>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className="text-gray-400 text-xs">{tx.time}</span>
                    </td>
                    <td className="px-5 py-2.5">
                      <StatusChip status={tx.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
