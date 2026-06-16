import { useState } from "react";
import { Bell, Menu, Wallet, Eye, EyeOff, TrendingUp, TrendingDown, Activity, CalendarDays } from "lucide-react";

const logoSrc = "/sahu-logo.png";

function WalletIllustration() {
  return (
    <div
      className="relative select-none pointer-events-none"
      style={{ width: 148, height: 140 }}
    >
      {/* ── Cash bills sticking out of wallet top ── */}
      {/* Bill 1 — back, taller */}
      <div
        className="absolute"
        style={{
          bottom: 58, left: 22,
          width: 68, height: 60,
          background: "linear-gradient(175deg, #4ade80 0%, #16a34a 60%, #14532d 100%)",
          borderRadius: "8px 8px 0 0",
          boxShadow: "0 -4px 12px rgba(22,163,74,0.4)",
          zIndex: 1,
        }}
      >
        {/* bill lines */}
        <div style={{ position:"absolute", top:10, left:8, right:8, height:2, background:"rgba(255,255,255,0.25)", borderRadius:2 }} />
        <div style={{ position:"absolute", top:18, left:8, right:8, height:2, background:"rgba(255,255,255,0.15)", borderRadius:2 }} />
        <div style={{ position:"absolute", top:26, left:8, right:24, height:2, background:"rgba(255,255,255,0.12)", borderRadius:2 }} />
        <div style={{ position:"absolute", top:8, right:8, width:20, height:20, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)" }} />
      </div>
      {/* Bill 2 — front, shorter, slightly offset */}
      <div
        className="absolute"
        style={{
          bottom: 58, left: 36,
          width: 56, height: 46,
          background: "linear-gradient(175deg, #86efac 0%, #22c55e 55%, #166534 100%)",
          borderRadius: "8px 8px 0 0",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
          zIndex: 2,
        }}
      >
        <div style={{ position:"absolute", top:8, left:7, right:7, height:1.5, background:"rgba(255,255,255,0.3)", borderRadius:2 }} />
        <div style={{ position:"absolute", top:15, left:7, right:7, height:1.5, background:"rgba(255,255,255,0.2)", borderRadius:2 }} />
      </div>

      {/* ── Wallet body ── */}
      {/* Flap (top part of wallet, slightly darker) */}
      <div
        className="absolute"
        style={{
          bottom: 38, left: 6,
          width: 104, height: 30,
          background: "linear-gradient(160deg, #2563eb 0%, #1d4ed8 100%)",
          borderRadius: "12px 12px 0 0",
          zIndex: 3,
          boxShadow: "0 -2px 8px rgba(29,78,216,0.35)",
        }}
      />
      {/* Main wallet rectangle */}
      <div
        className="absolute"
        style={{
          bottom: 18, left: 6,
          width: 104, height: 50,
          background: "linear-gradient(150deg, #3b82f6 0%, #1e40af 55%, #1e3a8a 100%)",
          borderRadius: "0 0 14px 14px",
          zIndex: 4,
          boxShadow: "0 8px 24px rgba(30,64,175,0.55), 0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {/* Horizontal stitching lines */}
        <div style={{ position:"absolute", top:12, left:12, right:12, height:1, background:"rgba(255,255,255,0.12)", borderRadius:2 }} />
        <div style={{ position:"absolute", top:22, left:12, right:12, height:1, background:"rgba(255,255,255,0.08)", borderRadius:2 }} />
        {/* Coin latch button */}
        <div
          style={{
            position:"absolute", top:10, right:12,
            width:22, height:22, borderRadius:"50%",
            background: "linear-gradient(135deg, #fde68a 0%, #f59e0b 50%, #d97706 100%)",
            border: "2px solid #fbbf24",
            boxShadow: "0 2px 6px rgba(245,158,11,0.5)",
          }}
        >
          <div style={{ position:"absolute", inset:4, borderRadius:"50%", background:"rgba(255,255,255,0.35)" }} />
        </div>
      </div>

      {/* ── Coin stack ── right side, in front */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute"
          style={{
            bottom: 14 + i * 8,
            right: 4,
            width: 40,
            height: 16,
            borderRadius: "50%",
            background: i === 3
              ? "linear-gradient(180deg, #fde68a 0%, #f59e0b 100%)"
              : "linear-gradient(180deg, #fbbf24 0%, #d97706 100%)",
            border: "1.5px solid #f59e0b",
            boxShadow: i === 0
              ? "0 4px 10px rgba(245,158,11,0.5)"
              : "none",
            zIndex: 5 + i,
          }}
        />
      ))}

      {/* Shine highlight on wallet */}
      <div
        className="absolute"
        style={{
          bottom: 46, left: 6, width: 104, height: 22,
          background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)",
          borderRadius: "12px 12px 0 0",
          zIndex: 6,
          pointerEvents: "none",
        }}
      />
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
      <div className="w-full max-w-[390px] bg-gray-100 relative overflow-hidden">

        {/* ── Hero Card ────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0c1f4e 0%, #0f2d70 40%, #1a3fab 72%, #2048c8 100%)",
            borderBottomLeftRadius: "2.5rem",
            paddingBottom: "2rem",
          }}
        >
          {/* Decorative rings — top right */}
          <div className="absolute top-0 right-0 pointer-events-none" style={{ opacity: 0.12 }}>
            <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
              <circle cx="180" cy="40" r="100" stroke="white" strokeWidth="0.8" />
              <circle cx="180" cy="40" r="75"  stroke="white" strokeWidth="0.8" />
              <circle cx="180" cy="40" r="52"  stroke="white" strokeWidth="0.8" />
              <circle cx="180" cy="40" r="30"  stroke="white" strokeWidth="0.8" />
              <circle cx="180" cy="40" r="12"  stroke="white" strokeWidth="0.8" />
            </svg>
          </div>
          {/* Decorative rings — bottom left */}
          <div className="absolute bottom-0 left-0 pointer-events-none" style={{ opacity: 0.07 }}>
            <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
              <circle cx="0" cy="180" r="120" stroke="white" strokeWidth="1.2" />
              <circle cx="0" cy="180" r="85"  stroke="white" strokeWidth="1.2" />
              <circle cx="0" cy="180" r="55"  stroke="white" strokeWidth="1.2" />
              <circle cx="0" cy="180" r="30"  stroke="white" strokeWidth="1.2" />
            </svg>
          </div>
          {/* Dot grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              opacity: 0.045,
            }}
          />

          {/* Top row: Logo + Title + Bell + Menu */}
          <div className="relative z-10 flex items-center gap-3 px-5 pt-11 pb-4">
            {/* Logo with ring */}
            <div
              className="flex-shrink-0 rounded-full bg-white overflow-hidden"
              style={{
                width: 52, height: 52,
                boxShadow: "0 0 0 2px rgba(255,255,255,0.25), 0 0 0 4px rgba(255,255,255,0.10)",
              }}
            >
              <img
                src={logoSrc}
                alt="SAHU CSC"
                style={{ width:"100%", height:"100%", objectFit:"cover" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            {/* Title block */}
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-extrabold text-[15px] leading-tight tracking-wide">
                SAHU <span style={{ color: "#fb923c" }}>CSC</span>
              </h1>
              <p className="text-white/55 text-[11px] font-medium tracking-wide">Management Platform</p>
            </div>
            {/* Bell + Menu */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                className="relative flex items-center justify-center text-white"
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                }}
              >
                <Bell size={17} />
                <span
                  className="absolute text-white font-bold flex items-center justify-center"
                  style={{
                    top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9,
                    background: "#ef4444", fontSize: 9, paddingInline: 3,
                    border: "1.5px solid #0f2d70",
                  }}
                >3</span>
              </button>
              <button
                className="flex items-center justify-center text-white"
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                }}
              >
                <Menu size={17} />
              </button>
            </div>
          </div>

          {/* Greeting row + Wallet illustration */}
          <div className="relative z-10 flex items-end justify-between px-5" style={{ paddingBottom: 12 }}>
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">{greeting}, 👋</p>
              <h2 className="text-white font-extrabold leading-tight" style={{ fontSize: 28 }}>SAHU Admin</h2>
            </div>
            <div className="flex-shrink-0" style={{ marginRight: -8, marginBottom: -8 }}>
              <WalletIllustration />
            </div>
          </div>

          {/* Balance pill — frosted glass */}
          <div className="relative z-10 px-5">
            <div
              className="flex items-center gap-3"
              style={{
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.22)",
                borderRadius: 20,
                padding: "10px 14px",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Dark solid icon circle — matches reference */}
              <div
                className="flex-shrink-0 flex items-center justify-center"
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(11,30,74,0.75)",
                  border: "1.5px solid rgba(255,255,255,0.18)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                <Wallet size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/65 font-semibold uppercase tracking-wider" style={{ fontSize: 10, marginBottom: 2 }}>
                  Current Balance
                </p>
                <p className="text-white font-extrabold leading-tight" style={{ fontSize: 22 }}>
                  {balanceVisible
                    ? `₹${currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : "₹ ••••••"}
                </p>
              </div>
              <button
                onClick={() => setBalanceVisible(v => !v)}
                style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0 }}
                className="flex items-center justify-center text-cyan-300 hover:bg-white/10 transition-colors"
              >
                {balanceVisible ? <Eye size={19} /> : <EyeOff size={19} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── White/gray content area ─────────────────────────────── */}
        <div className="bg-gray-100 px-4 pt-4 pb-4 space-y-4">
          {/* Date row */}
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-gray-400 flex-shrink-0" />
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

          {/* Quick Actions label */}
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Quick Actions</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "New Entry", bg: "#1a2040", iconColor: "#fff", textColor: "#fff" },
              { label: "AePS",     bg: "#fff7ed", iconColor: "#f97316", textColor: "#c2410c" },
              { label: "Services", bg: "#eff6ff", iconColor: "#3b82f6", textColor: "#1d4ed8" },
              { label: "Reports",  bg: "#faf5ff", iconColor: "#a855f7", textColor: "#7e22ce" },
            ].map(a => (
              <div
                key={a.label}
                className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl cursor-pointer"
                style={{ background: a.bg }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: a.bg === "#1a2040" ? "rgba(255,255,255,0.15)" : `${a.iconColor}22` }}
                >
                  <span style={{ color: a.iconColor, fontSize: 16 }}>◎</span>
                </div>
                <span style={{ color: a.textColor, fontSize: 10, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>
                  {a.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
