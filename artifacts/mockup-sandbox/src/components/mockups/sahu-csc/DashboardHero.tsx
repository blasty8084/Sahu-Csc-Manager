import { useState } from "react";
import { Bell, Menu, Wallet, Eye, EyeOff, TrendingUp, TrendingDown, Activity, CalendarDays } from "lucide-react";

const logoSrc = "/sahu-logo.png";

function WalletIllustration() {
  return (
    <div className="relative w-32 h-32 flex items-end justify-center select-none pointer-events-none">
      {/* Coins stack */}
      <div className="absolute bottom-0 right-0 flex flex-col items-center gap-0.5">
        {[0,1,2].map(i => (
          <div key={i} className="w-10 h-3 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 border border-yellow-400/60 shadow-sm" style={{ zIndex: i }} />
        ))}
      </div>
      {/* Wallet body */}
      <div className="relative z-10 mr-6 mb-1">
        {/* Main wallet */}
        <div className="w-20 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl relative overflow-visible">
          {/* Wallet flap */}
          <div className="absolute -top-3 left-0 w-20 h-7 rounded-t-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-md" />
          {/* Coin latch */}
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-yellow-400 border-2 border-yellow-300 shadow" />
          {/* Cash sticking out */}
          <div className="absolute -top-5 left-2 flex gap-0.5">
            <div className="w-12 h-8 rounded-t-md bg-gradient-to-b from-green-300 to-green-500 opacity-90 shadow" />
            <div className="w-10 h-6 rounded-t-md bg-gradient-to-b from-green-400 to-green-600 opacity-80 shadow" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardHero() {
  const [balanceVisible, setBalanceVisible] = useState(true);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const currentBalance = 25420.00;
  const statCards = [
    { label: "Balance", value: "₹25,420", change: "Running balance", up: true, iconBg: "bg-[#1a2040]", Icon: Wallet },
    { label: "Today's Income", value: "₹1,200", change: "3 transactions", up: true, iconBg: "bg-emerald-500", Icon: TrendingUp },
    { label: "Today's Expense", value: "₹340", change: "This month: ₹2,100", up: false, iconBg: "bg-orange-500", Icon: TrendingDown },
    { label: "Transactions", value: "7", change: "Month: ₹860 net", up: true, iconBg: "bg-purple-600", Icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[390px] bg-white relative overflow-hidden">

        {/* ── Hero Card ──────────────────────────────────────────── */}
        <div className="relative overflow-hidden pb-8"
          style={{
            background: "linear-gradient(135deg, #0b1e4a 0%, #0f2d6b 35%, #1a3fa0 65%, #1e4fc0 100%)",
            borderBottomLeftRadius: "2.5rem",
            borderBottomRightRadius: "0",
          }}
        >
          {/* Decorative circular pattern (top-right) */}
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
              <circle cx="160" cy="40" r="80" stroke="white" strokeWidth="0.8" />
              <circle cx="160" cy="40" r="60" stroke="white" strokeWidth="0.8" />
              <circle cx="160" cy="40" r="40" stroke="white" strokeWidth="0.8" />
              <circle cx="160" cy="40" r="20" stroke="white" strokeWidth="0.8" />
            </svg>
          </div>
          {/* Decorative circles (bottom-left) */}
          <div className="absolute bottom-0 left-0 opacity-5 pointer-events-none">
            <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
              <circle cx="0" cy="160" r="100" stroke="white" strokeWidth="1" />
              <circle cx="0" cy="160" r="70" stroke="white" strokeWidth="1" />
              <circle cx="0" cy="160" r="45" stroke="white" strokeWidth="1" />
            </svg>
          </div>
          {/* Dotted grid */}
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Top row: Logo + Title + Actions */}
          <div className="relative z-10 flex items-center gap-3 px-5 pt-10 pb-4">
            {/* Logo */}
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/30 shadow-lg flex-shrink-0 bg-white">
              <img src={logoSrc} alt="SAHU CSC" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
            </div>
            {/* Title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-extrabold text-base leading-tight tracking-wide">SAHU CSC</h1>
              <p className="text-white/60 text-[11px] font-medium tracking-wide">Management Platform</p>
            </div>
            {/* Action icons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="relative w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <Bell size={16} />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">3</span>
              </button>
              <button className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <Menu size={16} />
              </button>
            </div>
          </div>

          {/* Greeting row + Wallet illustration */}
          <div className="relative z-10 flex items-end justify-between px-5 pb-4">
            <div>
              <p className="text-white/70 text-sm font-medium mb-0.5">
                {greeting}, 👋
              </p>
              <h2 className="text-white font-extrabold text-2xl leading-tight">SAHU Admin</h2>
            </div>
            {/* Wallet illustration — right side, bleeds slightly */}
            <div className="flex-shrink-0 -mr-3 -mb-2">
              <WalletIllustration />
            </div>
          </div>

          {/* Current Balance pill */}
          <div className="relative z-10 mx-5">
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3">
              {/* Wallet icon circle */}
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                <Wallet size={18} className="text-white" />
              </div>
              {/* Balance info */}
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Current Balance</p>
                <p className="text-white font-extrabold text-xl leading-tight">
                  {balanceVisible
                    ? `₹${currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : "₹ ••••••"}
                </p>
              </div>
              {/* Eye toggle */}
              <button
                onClick={() => setBalanceVisible(v => !v)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-cyan-300 hover:bg-white/10 transition-colors flex-shrink-0"
              >
                {balanceVisible ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          {/* Curved bottom scoop — bottom-left only */}
          <div
            className="absolute bottom-0 right-0 bg-gray-100"
            style={{
              width: "60px",
              height: "40px",
              borderTopLeftRadius: "2.5rem",
            }}
          />
        </div>

        {/* ── White content area ──────────────────────────────────── */}
        <div className="bg-gray-100 px-4 pt-4 pb-4 space-y-4">

          {/* Date row */}
          <div className="flex items-center gap-2 text-gray-500">
            <CalendarDays size={15} className="text-gray-400 flex-shrink-0" />
            <p className="text-xs font-medium text-gray-500">{today}</p>
          </div>

          {/* 2×2 Stat Cards */}
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>
                  <s.Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                <p className="text-gray-900 text-xl font-bold leading-tight">{s.value}</p>
                <p className={`text-[10px] font-semibold mt-1 truncate ${s.up ? "text-emerald-500" : "text-rose-500"}`}>
                  {s.change}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
