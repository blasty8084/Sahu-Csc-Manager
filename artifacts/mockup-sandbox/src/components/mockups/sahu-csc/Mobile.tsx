import { useState } from "react";
import {
  Home, BookOpen, CreditCard, User, Bell, ChevronRight,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft,
  Wifi, Shield, Zap, FileText, Users, BarChart2, Settings,
  Search, Plus, CheckCircle, Clock, AlertCircle
} from "lucide-react";

const transactions = [
  { id: 1, name: "Aadhaar Card Update", customer: "Ramesh Sahu", amount: 150, type: "credit", time: "10:32 AM", status: "success", service: "Gov ID" },
  { id: 2, name: "LIC Premium", customer: "Sunita Devi", amount: 2400, type: "debit", time: "09:15 AM", status: "success", service: "Insurance" },
  { id: 3, name: "PAN Card Apply", customer: "Mohan Patra", amount: 200, type: "credit", time: "08:50 AM", status: "pending", service: "Gov ID" },
  { id: 4, name: "Electricity Bill", customer: "Geeta Nayak", amount: 850, type: "debit", time: "08:20 AM", status: "success", service: "Utility" },
  { id: 5, name: "PM Kisan Scheme", customer: "Bijay Behera", amount: 500, type: "credit", time: "Yesterday", status: "success", service: "Scheme" },
];

const quickActions = [
  { icon: Shield, label: "Aadhaar", color: "bg-blue-100 text-blue-700" },
  { icon: CreditCard, label: "AePS", color: "bg-orange-100 text-orange-700" },
  { icon: Zap, label: "Utility", color: "bg-yellow-100 text-yellow-700" },
  { icon: FileText, label: "PAN Card", color: "bg-green-100 text-green-700" },
  { icon: Users, label: "Schemes", color: "bg-purple-100 text-purple-700" },
  { icon: BarChart2, label: "Reports", color: "bg-rose-100 text-rose-700" },
];

const navItems = [
  { icon: Home, label: "Home", active: true },
  { icon: BookOpen, label: "Ledger", active: false },
  { icon: CreditCard, label: "AePS", active: false },
  { icon: User, label: "Profile", active: false },
];

function StatusDot({ status }: { status: string }) {
  if (status === "success") return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
  if (status === "pending") return <Clock className="w-3.5 h-3.5 text-amber-500" />;
  return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
}

export function Mobile() {
  const [activeNav, setActiveNav] = useState(0);

  return (
    <div className="w-[390px] h-[844px] bg-gray-50 flex flex-col overflow-hidden font-['Inter'] relative">
      {/* Status Bar */}
      <div className="bg-[#1a2e5a] px-5 pt-3 pb-0 flex items-center justify-between">
        <span className="text-white text-[11px] font-semibold">9:41</span>
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3 text-white" />
          <div className="flex gap-0.5 items-end">
            {[2, 3, 4, 5].map(h => (
              <div key={h} style={{ height: h * 2.5 }} className="w-0.5 bg-white rounded-sm" />
            ))}
          </div>
          <div className="w-5 h-2.5 border border-white rounded-sm relative">
            <div className="absolute inset-0.5 right-1 bg-white rounded-sm" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0.5 h-1 bg-white rounded-r-sm" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a2e5a] via-[#1e3a6e] to-[#0f1e3d] px-5 pt-3 pb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-blue-200 text-xs font-medium">SAHU CSC Center</p>
            <h1 className="text-white text-lg font-bold leading-tight">Good morning, Admin</h1>
          </div>
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bell className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#f97316] rounded-full border border-[#1a2e5a]" />
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
          <p className="text-blue-200 text-xs font-medium mb-1">Today's Balance</p>
          <p className="text-white text-3xl font-bold mb-3">₹1,24,850</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-300 text-[10px]">Income</p>
                <p className="text-white text-xs font-semibold">₹8,450</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-rose-400/20 flex items-center justify-center">
                <TrendingDown className="w-3 h-3 text-rose-400" />
              </div>
              <div>
                <p className="text-rose-300 text-[10px]">Expense</p>
                <p className="text-white text-xs font-semibold">₹3,250</p>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-blue-200 text-[10px]">Transactions</p>
              <p className="text-white text-xs font-semibold">24 today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick Actions */}
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-800 text-sm font-bold">Quick Services</h2>
            <button className="text-[#f97316] text-xs font-semibold">See all</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action) => (
              <button key={action.label} className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-gray-700 text-[10px] font-semibold text-center leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="px-4 pt-4 grid grid-cols-2 gap-2">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-gray-500 text-xs">Customers</span>
            </div>
            <p className="text-gray-900 text-xl font-bold">127</p>
            <p className="text-emerald-500 text-[10px] font-medium mt-0.5">↑ 12 new today</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <span className="text-gray-500 text-xs">Services</span>
            </div>
            <p className="text-gray-900 text-xl font-bold">22</p>
            <p className="text-gray-400 text-[10px] font-medium mt-0.5">Active categories</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="px-4 pt-4 pb-24">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-800 text-sm font-bold">Recent Transactions</h2>
            <button className="flex items-center gap-0.5 text-[#f97316] text-xs font-semibold">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === "credit" ? "bg-emerald-50" : "bg-rose-50"}`}>
                  {tx.type === "credit"
                    ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    : <ArrowUpRight className="w-4 h-4 text-rose-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-gray-800 text-xs font-semibold truncate">{tx.name}</p>
                    <StatusDot status={tx.status} />
                  </div>
                  <p className="text-gray-400 text-[10px] truncate">{tx.customer} · {tx.time}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-xs font-bold ${tx.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}>
                    {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                  </p>
                  <span className="text-[9px] text-gray-400 bg-gray-100 rounded px-1">{tx.service}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 pb-5 pt-2 flex">
        {navItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setActiveNav(i)}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <div className={`w-10 h-6 rounded-full flex items-center justify-center transition-all ${activeNav === i ? "bg-[#1a2e5a]" : ""}`}>
              <item.icon className={`w-4 h-4 transition-colors ${activeNav === i ? "text-white" : "text-gray-400"}`} />
            </div>
            <span className={`text-[9px] font-semibold transition-colors ${activeNav === i ? "text-[#1a2e5a]" : "text-gray-400"}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
