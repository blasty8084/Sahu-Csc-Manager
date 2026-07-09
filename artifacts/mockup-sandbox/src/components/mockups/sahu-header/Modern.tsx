import {
  Bell, Sun, Moon, LayoutDashboard, Wifi, RefreshCw, ChevronRight, Home,
  Search, Zap,
} from "lucide-react";

export function Modern() {
  const pageTitle = "Dashboard";
  const isDark = false;
  const unreadCount = 3;
  const initials = "AS";
  const displayName = "Admin Sahu";
  const roleLabel = "Admin";
  const date = new Date().toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="w-full min-h-screen bg-[#f4f6fb] flex flex-col">
      {/* ── Header ── */}
      <header
        className="w-full sticky top-0 z-20"
        style={{
          background: "linear-gradient(135deg, #0b2c60 0%, #0e3878 60%, #0b2c60 100%)",
          boxShadow: "0 2px 24px 0 rgba(11,44,96,0.22)",
        }}
      >
        <div className="flex items-center justify-between px-8 h-16">

          {/* ── Left: breadcrumb + page title ── */}
          <div className="flex items-center gap-3">
            {/* Page icon pill */}
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/12 border border-white/18 shadow-inner">
              <LayoutDashboard size={17} className="text-[#f97316]" />
            </div>

            {/* Breadcrumb */}
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Home size={10} className="text-white/35" />
                <ChevronRight size={9} className="text-white/25" />
                <span className="text-[10px] text-white/40 font-medium tracking-wide">{pageTitle}</span>
              </div>
              <h1 className="text-[17px] font-extrabold text-white leading-none tracking-tight">
                {pageTitle}
              </h1>
            </div>

            {/* Date pill */}
            <span
              className="hidden lg:inline-flex items-center gap-1.5 ml-3 px-3 py-1 rounded-full text-[11px] font-medium text-white/55"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {date}
            </span>
          </div>

          {/* ── Right: actions ── */}
          <div className="flex items-center gap-2">

            {/* Search pill */}
            <button
              className="hidden md:flex items-center gap-2 px-3 h-8 rounded-full text-[12px] text-white/45 hover:text-white/70 transition-colors"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <Search size={13} />
              <span>Search…</span>
              <kbd className="text-[10px] px-1 rounded bg-white/10 text-white/30 font-mono ml-1">⌘K</kbd>
            </button>

            {/* Sync dot */}
            <div className="flex items-center gap-1.5 px-2 h-8 rounded-full"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
              <Wifi size={12} className="text-white/35 hidden sm:block" />
            </div>

            {/* Theme toggle */}
            <button
              className="flex items-center justify-center w-8 h-8 rounded-full text-white/45 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Notifications */}
            <button
              className="relative flex items-center justify-center w-8 h-8 rounded-full text-white/45 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-[#f97316] text-white text-[9px] font-black shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User chip */}
            <button
              className="flex items-center gap-2 pl-1 pr-3 h-9 rounded-full cursor-pointer hover:opacity-85 transition-opacity"
              style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.16)" }}
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#f97316] shadow-md text-white text-[11px] font-black ring-2 ring-white/20">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[12px] font-bold text-white leading-none">{displayName}</p>
                <p className="text-[10px] text-white/45 mt-0.5 capitalize leading-none">{roleLabel}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Saffron accent line at bottom */}
        <div
          className="h-[2px] w-full"
          style={{ background: "linear-gradient(90deg, #f97316 0%, #fb923c 40%, transparent 100%)" }}
        />
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
