import { useState } from "react";
import {
  Home, BookOpen, CreditCard, User, Bell, ChevronRight, Search,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft,
  Shield, Zap, FileText, Users, BarChart2, Settings,
  CheckCircle, Clock, AlertCircle, Menu, X, Activity,
  PieChart, Wallet
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: BookOpen, label: "Ledger", active: false },
  { icon: CreditCard, label: "AePS", active: false },
  { icon: Shield, label: "Services", active: false },
  { icon: BarChart2, label: "Reports", active: false },
  { icon: Bell, label: "Notifications", active: false },
  { icon: Users, label: "Users", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const stats = [
  { label: "Today's Balance", value: "₹1,24,850", change: "+₹5,200", up: true, icon: Wallet, color: "from-[#1a2e5a] to-[#2d4a8a]" },
  { label: "Today's Income", value: "₹8,450", change: "+18%", up: true, icon: TrendingUp, color: "from-emerald-600 to-emerald-500" },
  { label: "Today's Expense", value: "₹3,250", change: "-5%", up: false, icon: TrendingDown, color: "from-rose-500 to-rose-400" },
  { label: "Transactions", value: "24", change: "+8 today", up: true, icon: Activity, color: "from-[#f97316] to-[#fb923c]" },
];

const transactions = [
  { name: "Aadhaar Card Update", customer: "Ramesh Sahu", amount: 150, type: "credit", time: "10:32 AM", status: "success", service: "Gov ID" },
  { name: "LIC Premium", customer: "Sunita Devi", amount: 2400, type: "debit", time: "09:15 AM", status: "success", service: "Insurance" },
  { name: "PAN Card Apply", customer: "Mohan Patra", amount: 200, type: "credit", time: "08:50 AM", status: "pending", service: "Gov ID" },
  { name: "Electricity Bill", customer: "Geeta Nayak", amount: 850, type: "debit", time: "08:20 AM", status: "success", service: "Utility" },
  { name: "PM Kisan Scheme", customer: "Bijay Behera", amount: 500, type: "credit", time: "Yesterday", status: "success", service: "Scheme" },
  { name: "Voter ID Apply", customer: "Priya Das", amount: 100, type: "credit", time: "Yesterday", status: "success", service: "Gov ID" },
];

const topServices = [
  { name: "Aadhaar Services", count: 48, pct: 80, color: "bg-[#1a2e5a]" },
  { name: "Utility Bills", count: 32, pct: 53, color: "bg-[#f97316]" },
  { name: "Insurance", count: 24, pct: 40, color: "bg-emerald-500" },
  { name: "PAN Card", count: 18, pct: 30, color: "bg-purple-500" },
  { name: "PM Schemes", count: 12, pct: 20, color: "bg-amber-500" },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "success") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
      <CheckCircle className="w-2.5 h-2.5" /> Done
    </span>
  );
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
      <Clock className="w-2.5 h-2.5" /> Pending
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded-full">
      <AlertCircle className="w-2.5 h-2.5" /> Failed
    </span>
  );
}

export function Tablet() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState(0);

  return (
    <div className="w-[768px] h-[1024px] bg-gray-100 flex font-['Inter'] overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-48" : "w-16"} bg-[#1a2e5a] flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden`}>
        {/* Logo */}
        <div className="p-3 flex items-center gap-2 border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors flex-shrink-0"
          >
            {sidebarOpen ? <X className="w-4.5 h-4.5 text-white" /> : <Menu className="w-4.5 h-4.5 text-white" />}
          </button>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-white text-xs font-bold whitespace-nowrap">SAHU CSC</p>
              <p className="text-blue-300 text-[9px] whitespace-nowrap">Service Center</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {navItems.map((item, i) => (
            <button
              key={item.label}
              onClick={() => setActiveNav(i)}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${activeNav === i ? "bg-white/20 text-white" : "text-blue-300 hover:bg-white/10 hover:text-white"}`}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              {sidebarOpen && <span className="text-xs font-semibold whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#f97316] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-white text-xs font-semibold whitespace-nowrap">Admin</p>
                <p className="text-blue-300 text-[9px] whitespace-nowrap">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input placeholder="Search services, customers..." className="text-xs text-gray-600 bg-transparent outline-none flex-1" readOnly />
          </div>
          <div className="relative">
            <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
              <Bell className="w-4 h-4 text-gray-500" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#f97316] rounded-full" />
          </div>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Page Title */}
          <div>
            <h1 className="text-gray-900 text-base font-bold">Dashboard</h1>
            <p className="text-gray-400 text-xs">Monday, 8 June 2026</p>
          </div>

          {/* Stats Grid 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.color} p-4 text-white`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/80 text-xs font-medium">{stat.label}</p>
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className={`text-xs font-medium mt-1 ${stat.up ? "text-emerald-200" : "text-rose-200"}`}>
                  {stat.change}
                </p>
              </div>
            ))}
          </div>

          {/* Two columns: Transactions + Top Services */}
          <div className="grid grid-cols-5 gap-3">
            {/* Recent Transactions - 3 cols */}
            <div className="col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-gray-800 text-sm font-bold">Recent Transactions</h2>
                <button className="text-[#f97316] text-xs font-semibold flex items-center gap-0.5">
                  All <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {transactions.map((tx, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === "credit" ? "bg-emerald-50" : "bg-rose-50"}`}>
                      {tx.type === "credit"
                        ? <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                        : <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-xs font-semibold truncate">{tx.name}</p>
                      <p className="text-gray-400 text-[10px]">{tx.customer} · {tx.time}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={tx.status} />
                      <p className={`text-xs font-bold ${tx.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}>
                        {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Services - 2 cols */}
            <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-gray-800 text-sm font-bold">Top Services</h2>
                <p className="text-gray-400 text-[10px]">This month</p>
              </div>
              <div className="p-4 space-y-3">
                {topServices.map((svc) => (
                  <div key={svc.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-700 text-[10px] font-semibold truncate">{svc.name}</span>
                      <span className="text-gray-500 text-[10px] font-bold flex-shrink-0 ml-1">{svc.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${svc.color} rounded-full transition-all`} style={{ width: `${svc.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-gray-800 text-sm font-bold mb-3">Quick Services</h2>
            <div className="grid grid-cols-6 gap-2">
              {[
                { icon: Shield, label: "Aadhaar", color: "bg-blue-50 text-blue-600" },
                { icon: CreditCard, label: "AePS", color: "bg-orange-50 text-orange-600" },
                { icon: FileText, label: "PAN Card", color: "bg-green-50 text-green-600" },
                { icon: Zap, label: "Utility", color: "bg-yellow-50 text-yellow-600" },
                { icon: Users, label: "Schemes", color: "bg-purple-50 text-purple-600" },
                { icon: BarChart2, label: "Reports", color: "bg-rose-50 text-rose-600" },
              ].map((a) => (
                <button key={a.label} className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${a.color}`}>
                    <a.icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-gray-600 text-[9px] font-semibold text-center leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
