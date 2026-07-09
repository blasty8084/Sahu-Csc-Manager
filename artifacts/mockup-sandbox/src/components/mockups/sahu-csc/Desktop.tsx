import {
  LayoutDashboard, BookOpen, CreditCard, Briefcase, BarChart2,
  Bell, User, Users, Shield, FileText, HardDrive, Settings,
  TrendingUp, TrendingDown, Activity, Wallet,
  LogOut, ChevronRight, ArrowUpRight, ArrowDownLeft
} from "lucide-react";

const navMain = [
  { icon: LayoutDashboard, label: "Dashboard", active: true, badge: null },
  { icon: BookOpen, label: "Ledger", active: false, badge: null },
  { icon: CreditCard, label: "AePS Cash", active: false, badge: null },
  { icon: Briefcase, label: "Services", active: false, badge: null },
  { icon: BarChart2, label: "Reports", active: false, badge: null },
  { icon: Bell, label: "Notifications", active: false, badge: "3" },
  { icon: User, label: "My Profile", active: false, badge: null },
];

const navAdmin = [
  { icon: Users, label: "Users Overview", active: false, badge: null },
  { icon: Shield, label: "User Management", active: false, badge: null },
  { icon: Activity, label: "Audit Logs", active: false, badge: null },
  { icon: HardDrive, label: "Backups", active: false, badge: null },
  { icon: Settings, label: "Settings", active: false, badge: null },
];

const stats = [
  { label: "Current Balance", sub: "Running balance", value: "₹24,580.00", change: "↗ +₹1,240", up: true, icon: Wallet, iconBg: "bg-[#1a2040]" },
  { label: "Today's Income", sub: "14 transactions", value: "₹3,720.00", change: "↗ +18%", up: true, icon: TrendingUp, iconBg: "bg-emerald-500" },
  { label: "Today's Expense", sub: "2 entries", value: "₹480.00", change: "↘ -5%", up: false, icon: TrendingDown, iconBg: "bg-[#f97316]" },
  { label: "Active Services", sub: "All enabled", value: "22", change: "↗ +5", up: true, icon: Briefcase, iconBg: "bg-purple-600" },
];

const topServices = [
  { rank: 1, name: "PAN Card", revenue: "₹1,284", txns: 12 },
  { rank: 2, name: "Electricity Bill", revenue: "₹90", txns: 9 },
  { rank: 3, name: "Aadhaar Update", revenue: "₹350", txns: 7 },
  { rank: 4, name: "Mobile Recharge", revenue: "₹30", txns: 6 },
  { rank: 5, name: "Income Certificate", revenue: "₹120", txns: 4 },
];

const barData = [
  { day: "Mon", income: 55, expense: 20 },
  { day: "Tue", income: 72, expense: 28 },
  { day: "Wed", income: 48, expense: 18 },
  { day: "Thu", income: 90, expense: 32 },
  { day: "Fri", income: 68, expense: 24 },
  { day: "Sat", income: 40, expense: 12 },
  { day: "Sun", income: 30, expense: 8 },
];
const maxIncome = Math.max(...barData.map(d => d.income));

const transactions = [
  { num: 1, customer: "Ravi Kumar", initial: "R", color: "bg-blue-500", service: "PAN Card", serviceColor: "text-blue-600 bg-blue-50", date: "Jun 5 · 10:22 AM", credit: "₹107.00", debit: "—", balance: "₹24,580.00" },
  { num: 2, customer: "Sunita Devi", initial: "S", color: "bg-emerald-500", service: "Electricity Bill", serviceColor: "text-emerald-600 bg-emerald-50", date: "Jun 5 · 11:05 AM", credit: "₹10.00", debit: "—", balance: "₹24,473.00" },
  { num: 3, customer: "Mohan Patra", initial: "M", color: "bg-orange-500", service: "Aadhaar Update", serviceColor: "text-orange-600 bg-orange-50", date: "Jun 5 · 09:40 AM", credit: "₹150.00", debit: "—", balance: "₹24,323.00" },
  { num: 4, customer: "Geeta Nayak", initial: "G", color: "bg-purple-500", service: "LIC Premium", serviceColor: "text-purple-600 bg-purple-50", date: "Jun 5 · 08:55 AM", credit: "—", debit: "₹2,400.00", balance: "₹24,173.00" },
  { num: 5, customer: "Bijay Behera", initial: "B", color: "bg-teal-500", service: "PM Kisan", serviceColor: "text-teal-600 bg-teal-50", date: "Jun 5 · 08:20 AM", credit: "₹500.00", debit: "—", balance: "₹26,573.00" },
];

export function Desktop() {
  return (
    <div className="w-[1280px] h-[800px] bg-[#f5f6fa] flex font-['Inter'] overflow-hidden">

      {/* ── Sidebar ── */}
      <div className="w-[188px] bg-[#1a2040] flex flex-col flex-shrink-0 overflow-y-auto">
        {/* Logo */}
        <div className="px-4 pt-5 pb-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-[#f97316] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-black">S</span>
          </div>
          <div>
            <p className="text-white text-xs font-bold leading-tight">SAHU CSC</p>
            <p className="text-blue-300 text-[9px] leading-tight">Management Platform</p>
          </div>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 py-3 px-2.5 space-y-0.5">
          {navMain.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                item.active
                  ? "bg-[#f97316] text-white"
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-[11px] font-semibold flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${item.active ? "bg-white/30 text-white" : "bg-[#f97316] text-white"}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          {/* Admin Section */}
          <div className="pt-3 pb-1">
            <p className="text-blue-400 text-[8px] font-bold uppercase tracking-widest px-2 mb-1.5">Admin</p>
            {navAdmin.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-blue-200 hover:bg-white/10 hover:text-white transition-all text-left"
              >
                <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-[11px] font-semibold flex-1 truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Bottom User */}
        <div className="px-2.5 pb-4 border-t border-white/10 pt-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#f97316] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[11px] font-semibold truncate">Admin</p>
            <p className="text-blue-300 text-[9px] truncate">Administrator</p>
          </div>
          <button className="text-blue-300 hover:text-white transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-gray-900 text-base font-bold">Dashboard</h1>
            <p className="text-gray-400 text-xs">Friday, 5 June 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell className="w-3.5 h-3.5" />
              Notifications
              <span className="bg-[#f97316] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">3</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#1a2040] flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <p className={`text-xs font-semibold ${stat.up ? "text-emerald-500" : "text-rose-500"}`}>{stat.change}</p>
                  <div className={`w-8 h-8 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-gray-900 text-xl font-bold mb-0.5">{stat.value}</p>
                <p className="text-gray-500 text-[10px] font-medium">{stat.label}</p>
                <p className="text-gray-400 text-[9px]">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-3 gap-4">

            {/* Weekly Overview — 2 cols */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-gray-900 text-sm font-bold">Weekly Overview</h2>
                  <p className="text-gray-400 text-[10px]">Income vs Expenses — this week</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-semibold text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#1a2040] inline-block" /> Income</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f97316] inline-block" /> Expense</span>
                </div>
              </div>
              <div className="flex items-end gap-3 h-36 mt-4">
                {barData.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex items-end gap-0.5 w-full justify-center">
                      {/* Income bar */}
                      <div
                        className="flex-1 rounded-t-md bg-[#1a2040] transition-all"
                        style={{ height: `${(d.income / maxIncome) * 120}px` }}
                      />
                      {/* Expense bar */}
                      <div
                        className="flex-1 rounded-t-md bg-[#f97316] transition-all"
                        style={{ height: `${(d.expense / maxIncome) * 120}px` }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 font-medium">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Services — 1 col */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900 text-sm font-bold">Top Services</h2>
                <button className="text-[#1a2040] text-[10px] font-semibold">See all</button>
              </div>
              <div className="space-y-3">
                {topServices.map((svc) => (
                  <div key={svc.rank}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-gray-400 text-[10px] font-bold w-3">{svc.rank}</span>
                      <span className="text-gray-800 text-xs font-semibold flex-1 truncate">{svc.name}</span>
                      <span className="text-gray-700 text-xs font-bold">{svc.revenue}</span>
                      <span className="text-gray-400 text-[9px] ml-1">({svc.txns})</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden ml-5">
                      <div
                        className="h-full bg-[#1a2040] rounded-full"
                        style={{ width: `${(svc.txns / 12) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-gray-900 text-sm font-bold">Recent Transactions</h2>
              <button className="text-[#1a2040] text-xs font-semibold flex items-center gap-0.5">
                View all ledger <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {["#", "CUSTOMER", "SERVICE", "DATE", "CREDIT", "DEBIT", "BALANCE"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((tx) => (
                  <tr key={tx.num} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs font-medium">{tx.num}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full ${tx.color} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-[10px] font-bold">{tx.initial}</span>
                        </div>
                        <span className="text-gray-800 text-xs font-semibold">{tx.customer}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${tx.serviceColor}`}>
                        {tx.service}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-[10px]">{tx.date}</td>
                    <td className="px-4 py-3 text-emerald-600 text-xs font-bold">{tx.credit}</td>
                    <td className="px-4 py-3 text-rose-500 text-xs font-bold">{tx.debit}</td>
                    <td className="px-4 py-3 text-gray-800 text-xs font-bold">{tx.balance}</td>
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
