import {
  Bell, Sun, Moon, LayoutDashboard, Wifi,
  Search, SlidersHorizontal,
} from "lucide-react";

export function Minimal() {
  const pageTitle = "Dashboard";
  const isDark = false;
  const unreadCount = 3;
  const initials = "AS";
  const displayName = "Admin Sahu";
  const roleLabel = "Admin";
  const date = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ── */}
      <header
        className="w-full sticky top-0 z-20 bg-white"
        style={{ boxShadow: "0 1px 0 #e5e7eb, 0 4px 16px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center justify-between px-8 h-16">

          {/* ── Left: page indicator ── */}
          <div className="flex items-center gap-4">

            {/* Active page pill */}
            <div className="flex items-center gap-2.5 px-3.5 h-9 rounded-xl"
              style={{ background: "linear-gradient(135deg, rgba(11,44,96,0.07) 0%, rgba(249,115,22,0.06) 100%)", border: "1px solid rgba(11,44,96,0.1)" }}
            >
              <LayoutDashboard size={15} style={{ color: "#0b2c60" }} />
              <span className="text-[13px] font-bold" style={{ color: "#0b2c60" }}>
                {pageTitle}
              </span>
            </div>

            {/* Date */}
            <span className="hidden lg:block text-[12px] text-gray-400 font-medium">
              {date}
            </span>
          </div>

          {/* ── Right: actions ── */}
          <div className="flex items-center gap-1.5">

            {/* Search */}
            <button className="flex items-center gap-2 px-3.5 h-9 rounded-xl bg-gray-50 border border-gray-200 text-[12px] text-gray-400 hover:border-gray-300 hover:bg-gray-100 transition-colors hidden md:flex">
              <Search size={13} />
              <span>Search…</span>
              <kbd className="ml-1 text-[10px] px-1.5 py-0.5 rounded-md bg-gray-200/80 text-gray-400 font-mono">⌘K</kbd>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Online status */}
            <div className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-semibold text-emerald-600 hidden sm:block">Online</span>
            </div>

            {/* Theme */}
            <button className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Notifications */}
            <button className="relative flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#f97316] border-2 border-white" />
              )}
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* User avatar chip */}
            <button className="flex items-center gap-2.5 px-2 h-9 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors cursor-pointer">
              {/* Avatar with saffron ring */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                style={{
                  background: "linear-gradient(135deg, #f97316, #fb923c)",
                  boxShadow: "0 0 0 2px white, 0 0 0 3.5px #f97316",
                }}
              >
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[12px] font-semibold text-gray-700 leading-none">{displayName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 capitalize leading-none">{roleLabel}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Saffron + navy accent bar — very subtle */}
        <div className="h-[2.5px]" style={{ background: "linear-gradient(90deg, #0b2c60 0%, #f97316 50%, #f97316 60%, transparent 100%)" }} />
      </header>

      {/* Page body placeholder */}
      <div className="flex-1 p-8 flex flex-col gap-4">
        <div className="flex gap-4">
          {[["Total Balance", "₹1,24,500", "+12.4%", true], ["Today's Credit", "₹8,200", "+3.1%", true], ["Today's Debit", "₹1,350", "-0.8%", false]].map(([label, val, pct, pos]) => (
            <div key={String(label)} className="flex-1 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
              <p className="text-2xl font-black text-gray-800">{val}</p>
              <span className={`text-xs font-semibold ${pos ? "text-emerald-500" : "text-red-400"}`}>{pct} this month</span>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-white h-48 shadow-sm border border-gray-100 flex items-center justify-center text-gray-200 text-sm">
          Chart area
        </div>
      </div>
    </div>
  );
}
