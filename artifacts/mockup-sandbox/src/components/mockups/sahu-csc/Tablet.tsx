import { useState } from "react";
import {
  LayoutDashboard, BookOpen, CreditCard, Briefcase, BarChart2,
  Bell, User, Users, Shield, FileText, HardDrive, Settings,
  TrendingUp, TrendingDown, Activity, Wallet,
  LogOut, ChevronRight, Plus, Fingerprint, Menu, X
} from "lucide-react";

const topServices = [
  { rank: 1, name: "PAN Card", txns: 12, revenue: "₹1,284", color: "bg-blue-100 text-blue-700", pct: 100 },
  { rank: 2, name: "Electricity Bill", txns: 9, revenue: "₹90", color: "bg-yellow-100 text-yellow-700", pct: 75 },
  { rank: 3, name: "Aadhaar Update", txns: 7, revenue: "₹350", color: "bg-teal-100 text-teal-700", pct: 58 },
  { rank: 4, name: "Mobile Recharge", txns: 6, revenue: "₹30", color: "bg-purple-100 text-purple-700", pct: 50 },
];

const transactions = [
  { customer: "Ravi Kumar", initial: "R", color: "bg-blue-500", service: "PAN Card", time: "10:22 AM", credit: "₹107", debit: "—", balance: "₹24,580" },
  { customer: "Sunita Devi", initial: "S", color: "bg-emerald-500", service: "Electricity Bill", time: "11:05 AM", credit: "₹10", debit: "—", balance: "₹24,473" },
  { customer: "Mohan Patra", initial: "M", color: "bg-orange-500", service: "Aadhaar Update", time: "09:40 AM", credit: "₹150", debit: "—", balance: "₹24,323" },
  { customer: "Geeta Nayak", initial: "G", color: "bg-purple-500", service: "LIC Premium", time: "08:55 AM", credit: "—", debit: "₹2,400", balance: "₹24,173" },
];

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
  { icon: Users, label: "Users Overview" },
  { icon: Shield, label: "User Management" },
  { icon: Activity, label: "Audit Logs" },
  { icon: HardDrive, label: "Backups" },
  { icon: Settings, label: "Settings" },
];

const stats = [
  { label: "Balance", sub: "Running balance", value: "₹24,580", change: "↗ +₹1,240", up: true, icon: Wallet, iconBg: "bg-[#1a2040]" },
  { label: "Today's Income", sub: "14 transactions", value: "₹3,720", change: "↗ +18%", up: true, icon: TrendingUp, iconBg: "bg-emerald-500" },
  { label: "Today's Expense", sub: "2 entries", value: "₹480", change: "↘ -5%", up: false, icon: TrendingDown, iconBg: "bg-[#f97316]" },
  { label: "Transactions", sub: "+3 new today", value: "14", change: "↗ +3 today", up: true, icon: Activity, iconBg: "bg-purple-600" },
];

export function Tablet() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="w-[768px] h-[1024px] bg-[#f5f6fa] flex font-['Inter'] overflow-hidden">

      {/* ── Sidebar ── */}
      <div className={`${sidebarOpen ? "w-52" : "w-14"} bg-[#1a2040] flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden`}>
        {/* Logo */}
        <div className="px-3 pt-5 pb-4 flex items-center gap-2.5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-[#f97316] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-black">S</span>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-white text-xs font-bold whitespace-nowrap leading-tight">SAHU CSC</p>
              <p className="text-blue-300 text-[9px] whitespace-nowrap leading-tight">Management Platform</p>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mx-2 mt-2 p-2 rounded-xl text-blue-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
        >
          {sidebarOpen ? <X className="w-4 h-4 flex-shrink-0" /> : <Menu className="w-4 h-4 flex-shrink-0" />}
          {sidebarOpen && <span className="text-[11px] font-semibold whitespace-nowrap">Close</span>}
        </button>

        {/* Nav */}
        <nav className="flex-1 py-2 px-2 space-y-0.5">
          {navMain.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-left ${
                item.active ? "bg-[#f97316] text-white" : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span className="text-[11px] font-semibold flex-1 truncate whitespace-nowrap">{item.label}</span>}
              {item.badge && sidebarOpen && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${item.active ? "bg-white/30 text-white" : "bg-[#f97316] text-white"}`}>
                  {item.badge}
                </span>
              )}
              {item.badge && !sidebarOpen && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] absolute right-2" />
              )}
            </button>
          ))}

          {sidebarOpen && (
            <>
              <p className="text-blue-400 text-[8px] font-bold uppercase tracking-widest px-2.5 pt-3 pb-1">Admin</p>
              {navAdmin.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-blue-200 hover:bg-white/10 hover:text-white transition-all text-left"
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[11px] font-semibold truncate whitespace-nowrap">{item.label}</span>
                </button>
              ))}
            </>
          )}
        </nav>

        {/* User */}
        <div className="px-2 pb-4 border-t border-white/10 pt-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#f97316] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          {sidebarOpen && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[11px] font-semibold truncate">Admin</p>
                <p className="text-blue-300 text-[9px] truncate">Administrator</p>
              </div>
              <LogOut className="w-3.5 h-3.5 text-blue-300 flex-shrink-0" />
            </>
          )}
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-gray-900 text-sm font-bold">Dashboard</h1>
            <p className="text-gray-400 text-[10px]">Friday, 5 June 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-[#f97316] px-3 py-1.5 rounded-xl">
              <Plus className="w-3 h-3" /> New Entry
            </button>
            <div className="relative">
              <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#f97316] rounded-full flex items-center justify-center">
                <span className="text-white text-[7px] font-bold">3</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#1a2040] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">A</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* 2×2 Stats */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-500 text-[10px] font-medium truncate">{stat.label}</p>
                  <p className="text-gray-900 text-lg font-bold leading-tight">{stat.value}</p>
                  <p className={`text-[10px] font-semibold ${stat.up ? "text-emerald-500" : "text-rose-500"}`}>{stat.change}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-3">Quick Actions</p>
            <div className="grid grid-cols-4 gap-2">
              <button className="flex flex-col items-center gap-2 bg-[#1a2040] rounded-xl py-3 px-2">
                <Plus className="w-5 h-5 text-white" />
                <span className="text-white text-[10px] font-semibold">New Entry</span>
              </button>
              <button className="flex flex-col items-center gap-2 bg-orange-50 rounded-xl py-3 px-2">
                <Fingerprint className="w-5 h-5 text-orange-500" />
                <span className="text-orange-700 text-[10px] font-semibold">AePS</span>
              </button>
              <button className="flex flex-col items-center gap-2 bg-blue-50 rounded-xl py-3 px-2">
                <Briefcase className="w-5 h-5 text-blue-500" />
                <span className="text-blue-700 text-[10px] font-semibold">Services</span>
              </button>
              <button className="flex flex-col items-center gap-2 bg-purple-50 rounded-xl py-3 px-2">
                <BarChart2 className="w-5 h-5 text-purple-500" />
                <span className="text-purple-700 text-[10px] font-semibold">Reports</span>
              </button>
            </div>
          </div>

          {/* Two columns: Top Services + Transactions */}
          <div className="grid grid-cols-5 gap-3">
            {/* Top Services */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-gray-900 text-sm font-bold">Top Services Today</h2>
                <button className="text-[#1a2040] text-[10px] font-semibold">See all</button>
              </div>
              <div className="space-y-3">
                {topServices.map((svc) => (
                  <div key={svc.rank} className="flex items-center gap-2">
                    <span className="text-gray-400 text-[10px] font-bold w-3">{svc.rank}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${svc.color}`}>{svc.name}</span>
                        <span className="text-gray-500 text-[10px] font-bold">{svc.txns} txns</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1a2040] rounded-full" style={{ width: `${svc.pct}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-gray-900 text-sm font-bold">Recent Transactions</h2>
                <button className="text-[#1a2040] text-[10px] font-semibold flex items-center gap-0.5">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-2 text-[9px] font-bold text-gray-400 uppercase">Customer</th>
                    <th className="text-left px-3 py-2 text-[9px] font-bold text-gray-400 uppercase">Service</th>
                    <th className="text-left px-3 py-2 text-[9px] font-bold text-gray-400 uppercase">Credit</th>
                    <th className="text-left px-3 py-2 text-[9px] font-bold text-gray-400 uppercase">Debit</th>
                    <th className="text-left px-3 py-2 text-[9px] font-bold text-gray-400 uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((tx, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full ${tx.color} flex items-center justify-center`}>
                            <span className="text-white text-[9px] font-bold">{tx.initial}</span>
                          </div>
                          <span className="text-gray-700 text-[11px] font-semibold truncate max-w-[80px]">{tx.customer}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] font-semibold text-gray-600">{tx.service}</span>
                      </td>
                      <td className="px-3 py-2.5 text-emerald-600 text-[11px] font-bold">{tx.credit}</td>
                      <td className="px-3 py-2.5 text-rose-500 text-[11px] font-bold">{tx.debit}</td>
                      <td className="px-3 py-2.5 text-gray-800 text-[11px] font-bold">{tx.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
