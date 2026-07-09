import { Bell, LayoutDashboard, BookOpen, Fingerprint, UserCircle, Plus, Briefcase, BarChart3, ArrowRight } from "lucide-react";

export function MobileNew() {
  const displayName = "SAHU Admin";
  const firstName = "Admin";
  const unreadCount = 3;
  const initials = "SA";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const emoji = hour < 12 ? "☀️" : hour < 17 ? "👋" : "🌙";
  const date = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="w-[390px] min-h-screen flex flex-col" style={{ background: "#f0f4f9", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ════════════════════════════════
          COMPLETELY NEW MOBILE HEADER
      ════════════════════════════════ */}
      <header className="w-full sticky top-0 z-30">
        {/* Top accent stripe — navy fading to saffron */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #0b2c60 0%, #1e4fa8 35%, #f97316 70%, #fb923c 100%)" }} />

        {/* Main header row */}
        <div
          className="flex items-center justify-between px-4"
          style={{
            height: 60,
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 1px 0 rgba(0,0,0,0.06), 0 4px 20px rgba(11,44,96,0.08)",
          }}
        >
          {/* ── Left: Logo badge + brand ── */}
          <div className="flex items-center gap-2.5">
            {/* Circular logo badge */}
            <div
              className="flex items-center justify-center rounded-2xl overflow-hidden"
              style={{
                width: 38,
                height: 38,
                background: "linear-gradient(135deg, #0b2c60 0%, #1a4a9e 100%)",
                boxShadow: "0 2px 8px rgba(11,44,96,0.30)",
              }}
            >
              {/* Inner logo mark */}
              <div className="flex flex-col items-center">
                <span style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.05em", lineHeight: 1 }}>
                  CSC
                </span>
                <div style={{ width: 20, height: 1.5, background: "#f97316", borderRadius: 1, marginTop: 2 }} />
              </div>
            </div>

            {/* Brand text */}
            <div>
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 15, fontWeight: 900, color: "#0b2c60", letterSpacing: "0.02em", lineHeight: 1 }}>
                  SAHU
                </span>
                <span style={{ fontSize: 15, fontWeight: 900, color: "#f97316", letterSpacing: "0.02em", lineHeight: 1 }}>
                  CSC
                </span>
              </div>
              <span style={{ fontSize: 9.5, color: "#94a3b8", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1, marginTop: 2, display: "block" }}>
                Management Platform
              </span>
            </div>
          </div>

          {/* ── Right: Bell + Avatar ── */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button
              className="relative flex items-center justify-center rounded-xl"
              style={{
                width: 38, height: 38,
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
              }}
            >
              <Bell size={17} color="#475569" />
              {unreadCount > 0 && (
                <span
                  className="absolute flex items-center justify-center"
                  style={{
                    top: 6, right: 6,
                    width: 8, height: 8,
                    borderRadius: "50%",
                    background: "#f97316",
                    border: "2px solid white",
                  }}
                />
              )}
            </button>

            {/* User avatar — replaces hamburger completely */}
            <button
              className="flex items-center gap-2 rounded-xl"
              style={{
                padding: "4px 10px 4px 4px",
                background: "linear-gradient(135deg, rgba(11,44,96,0.07), rgba(249,115,22,0.06))",
                border: "1px solid rgba(11,44,96,0.12)",
              }}
            >
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 30, height: 30,
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  boxShadow: "0 2px 6px rgba(249,115,22,0.40)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 900,
                }}
              >
                {initials}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0b2c60" }}>{firstName}</span>
            </button>
          </div>
        </div>

        {/* Greeting sub-bar */}
        <div
          className="flex items-center justify-between px-4"
          style={{
            height: 44,
            background: "linear-gradient(135deg, #0b2c60 0%, #0f3872 100%)",
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
              {greeting}, {displayName}
            </span>
            <span style={{ fontSize: 14 }}>{emoji}</span>
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 500 }}>{date}</span>
        </div>
      </header>

      {/* ════════════════════════════════
          PAGE BODY (for context)
      ════════════════════════════════ */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-4">

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Balance", value: "₹10,465", sub: "Running balance", subColor: "#10b981", icon: "💳", iconBg: "#0b2c60" },
            { label: "Today's Income", value: "₹502", sub: "4 transactions", subColor: "#10b981", icon: "📈", iconBg: "#10b981" },
            { label: "Today's Expense", value: "₹478", sub: "This month: ₹1,174", subColor: "#f97316", icon: "📉", iconBg: "#f97316" },
            { label: "Transactions", value: "4", sub: "Month: ₹5,939 net", subColor: "#10b981", icon: "⚡", iconBg: "#8b5cf6" },
          ].map((card) => (
            <div key={card.label} style={{ background: "#fff", borderRadius: 16, padding: "14px 14px 12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{card.label}</span>
                <div style={{ width: 28, height: 28, borderRadius: 10, background: card.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                  {card.icon}
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>{card.value}</div>
              <div style={{ fontSize: 11, color: card.subColor, fontWeight: 600, marginTop: 3 }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>Quick Actions</span>
          </div>
          <div className="flex gap-2.5">
            {/* Primary action */}
            <button style={{ flex: 1, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(11,44,96,0.30)" }}>
              <div style={{ width: 28, height: 28, borderRadius: 9, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plus size={15} color="#fff" />
              </div>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>New Entry</span>
            </button>
            {[
              { label: "AePS", icon: <Fingerprint size={17} />, color: "#f97316", bg: "rgba(249,115,22,0.1)" },
              { label: "Services", icon: <Briefcase size={17} />, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
              { label: "Reports", icon: <BarChart3 size={17} />, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
            ].map((a) => (
              <button key={a.label} style={{ flex: 1, height: 64, borderRadius: 16, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ color: a.color }}>{a.icon}</div>
                <span style={{ color: "#475569", fontSize: 10, fontWeight: 600 }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Top services */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>Top Services Today</span>
            <button style={{ fontSize: 11, fontWeight: 700, color: "#f97316", display: "flex", alignItems: "center", gap: 2 }}>See all <ArrowRight size={11} /></button>
          </div>
          {[
            { name: "Aadhaar eKYC", count: 12, revenue: "₹600", color: "#10b981" },
            { name: "PAN Card Apply", count: 8, revenue: "₹400", color: "#3b82f6" },
            { name: "PMJJBY Insurance", count: 5, revenue: "₹250", color: "#8b5cf6" },
          ].map((s, i) => (
            <div key={s.name} className="flex items-center justify-between"
              style={{ background: "#fff", borderRadius: 12, padding: "10px 14px", marginBottom: 6, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9" }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 6, height: 36, borderRadius: 4, background: s.color }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{s.count} transactions</div>
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.revenue}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav style={{ position: "sticky", bottom: 0, height: 64, background: "#fff", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "stretch", boxShadow: "0 -4px 16px rgba(0,0,0,0.06)" }}>
        {[
          { label: "Dashboard", icon: <LayoutDashboard size={20} />, active: true },
          { label: "Ledger", icon: <BookOpen size={20} />, active: false },
          { label: "AePS", icon: <Fingerprint size={20} />, active: false },
          { label: "Profile", icon: <UserCircle size={20} />, active: false },
        ].map((item) => (
          <div key={item.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, color: item.active ? "#f97316" : "#94a3b8", position: "relative" }}>
            {item.active && <span style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 28, height: 3, background: "#f97316", borderRadius: "0 0 3px 3px" }} />}
            {item.icon}
            <span style={{ fontSize: 10, fontWeight: item.active ? 700 : 500 }}>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}
