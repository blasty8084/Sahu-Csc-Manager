import { useState } from "react";
import {
  Bell, Menu, TrendingUp, TrendingDown, Activity, Wallet,
  Plus, Fingerprint, Briefcase, BarChart2,
  LayoutDashboard, BookOpen, CreditCard, Grid2X2
} from "lucide-react";

const topServices = [
  { rank: 1, name: "PAN Card", txns: 12, color: "bg-teal-100 text-teal-700" },
  { rank: 2, name: "Electricity Bill", txns: 9, color: "bg-yellow-100 text-yellow-700" },
  { rank: 3, name: "Aadhaar Update", txns: 7, color: "bg-green-100 text-green-700" },
  { rank: 4, name: "Mobile Recharge", txns: 6, color: "bg-blue-100 text-blue-700" },
  { rank: 5, name: "Income Certificate", txns: 4, color: "bg-purple-100 text-purple-700" },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: BookOpen, label: "Ledger" },
  { icon: Fingerprint, label: "AePS" },
  { icon: Briefcase, label: "Services" },
  { icon: BarChart2, label: "Reports" },
];

export function Mobile() {
  const [activeNav, setActiveNav] = useState(0);

  return (
    <div className="w-[390px] h-[844px] bg-[#f5f6fa] flex flex-col overflow-hidden font-['Inter'] relative">
      {/* Header */}
      <div className="bg-[#1a2040] px-4 pt-10 pb-4">
        <div className="flex items-center justify-between mb-3">
          {/* Logo + Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f97316] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-base font-black">S</span>
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-tight">SAHU CSC</p>
              <p className="text-blue-300 text-[10px]">Management Platform</p>
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <Bell className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#f97316] rounded-full" />
            </div>
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <Menu className="w-4.5 h-4.5 text-white" />
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div className="pb-1">
          <p className="text-blue-300 text-xs">Friday, 5 June 2026</p>
          <p className="text-white text-lg font-bold">Good morning, Admin 👋</p>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-5">

        {/* 2×2 Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Balance */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#1a2040] flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-500 text-xs mb-1">Balance</p>
            <p className="text-gray-900 text-xl font-bold">₹24,580</p>
            <p className="text-emerald-500 text-xs font-semibold mt-1">↗ +₹1,240</p>
          </div>

          {/* Today's Income */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-500 text-xs mb-1">Today's Income</p>
            <p className="text-gray-900 text-xl font-bold">₹3,720</p>
            <p className="text-emerald-500 text-xs font-semibold mt-1">↗ +18%</p>
          </div>

          {/* Today's Expense */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#f97316] flex items-center justify-center mb-3">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-500 text-xs mb-1">Today's Expense</p>
            <p className="text-gray-900 text-xl font-bold">₹480</p>
            <p className="text-rose-500 text-xs font-semibold mt-1">↘ -5%</p>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center mb-3">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-500 text-xs mb-1">Transactions</p>
            <p className="text-gray-900 text-xl font-bold">14</p>
            <p className="text-emerald-500 text-xs font-semibold mt-1">↗ +3 today</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">Quick Actions</p>
          <div className="grid grid-cols-4 gap-2">
            {/* New Entry - dark */}
            <button className="flex flex-col items-center gap-2 bg-[#1a2040] rounded-2xl py-4 px-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-[10px] font-semibold text-center leading-tight">New Entry</span>
            </button>

            {/* AePS - warm yellow */}
            <button className="flex flex-col items-center gap-2 bg-orange-50 rounded-2xl py-4 px-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                <Fingerprint className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-orange-700 text-[10px] font-semibold text-center">AePS</span>
            </button>

            {/* Services - light blue */}
            <button className="flex flex-col items-center gap-2 bg-blue-50 rounded-2xl py-4 px-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-blue-700 text-[10px] font-semibold text-center">Services</span>
            </button>

            {/* Reports - pink/purple */}
            <button className="flex flex-col items-center gap-2 bg-purple-50 rounded-2xl py-4 px-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-purple-700 text-[10px] font-semibold text-center">Reports</span>
            </button>
          </div>
        </div>

        {/* Top Services Today */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Top Services Today</p>
            <button className="text-[#1a2040] text-xs font-semibold">See all</button>
          </div>

          <div className="space-y-2">
            {topServices.map((svc) => (
              <div key={svc.rank} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                <span className="text-gray-400 text-sm font-bold w-4 flex-shrink-0">{svc.rank}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-1 ${svc.color}`}>
                  {svc.name}
                </span>
                <span className="text-gray-700 text-xs font-bold flex-shrink-0">{svc.txns} txns</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation — 5 items */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 pb-6 pt-2 flex">
        {navItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setActiveNav(i)}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <item.icon
              className={`w-5 h-5 transition-colors ${activeNav === i ? "text-[#1a2040]" : "text-gray-400"}`}
              strokeWidth={activeNav === i ? 2.5 : 1.8}
            />
            <span className={`text-[9px] font-semibold transition-colors ${activeNav === i ? "text-[#1a2040]" : "text-gray-400"}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
