export function MobileDashboard() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetingEmoji = hour < 12 ? "☀️" : hour < 17 ? "👋" : "🌙";
  const dateStr = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  const stats = [
    {
      label: "CURRENT BALANCE",
      value: "₹0",
      sub: "No entries yet",
      subColor: "#10b981",
      accent: "linear-gradient(90deg,#0b2c60,#1a4a9e)",
      iconBg: "linear-gradient(135deg,#0b2c60,#1a4a9e)",
      iconShadow: "rgba(11,44,96,0.35)",
      Icon: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M16 14h.01"/>
        </svg>
      ),
    },
    {
      label: "TODAY'S INCOME",
      value: "₹0",
      sub: "0 Transactions",
      subColor: "#10b981",
      accent: "linear-gradient(90deg,#10b981,#34d399)",
      iconBg: "linear-gradient(135deg,#10b981,#059669)",
      iconShadow: "rgba(16,185,129,0.35)",
      Icon: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
        </svg>
      ),
    },
    {
      label: "TODAY'S EXPENSE",
      value: "₹0",
      sub: "Month: ₹0",
      subColor: "#f43f5e",
      accent: "linear-gradient(90deg,#f97316,#fb923c)",
      iconBg: "linear-gradient(135deg,#f97316,#ea580c)",
      iconShadow: "rgba(249,115,22,0.35)",
      Icon: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
        </svg>
      ),
    },
    {
      label: "TRANSACTIONS",
      value: "0",
      sub: "Total: ₹0 Net",
      subColor: "#10b981",
      accent: "linear-gradient(90deg,#8b5cf6,#a78bfa)",
      iconBg: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
      iconShadow: "rgba(139,92,246,0.35)",
      Icon: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
    },
  ];

  const quickActions = [
    {
      label: "New Entry",
      bg: "linear-gradient(135deg,#0b2c60,#1a4a9e)",
      shadow: "rgba(11,44,96,0.35)",
      Icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      ),
    },
    {
      label: "AePS",
      bg: "linear-gradient(135deg,#f97316,#ea580c)",
      shadow: "rgba(249,115,22,0.35)",
      Icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10"/>
          <path d="M5 12a7 7 0 0114 0"/>
          <path d="M8 12a4 4 0 018 0"/>
          <path d="M12 12v.01"/>
        </svg>
      ),
    },
    {
      label: "Services",
      bg: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
      shadow: "rgba(59,130,246,0.35)",
      Icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="7" height="7" rx="1"/><rect x="15" y="3" width="7" height="7" rx="1"/>
          <rect x="15" y="14" width="7" height="7" rx="1"/><rect x="2" y="14" width="7" height="7" rx="1"/>
        </svg>
      ),
    },
    {
      label: "Reports",
      bg: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
      shadow: "rgba(139,92,246,0.35)",
      Icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="18" y="3" width="4" height="18"/><rect x="10" y="9" width="4" height="12"/><rect x="2" y="14" width="4" height="7"/>
        </svg>
      ),
    },
  ];

  const navTabs = [
    {
      label: "Dashboard", active: true,
      Icon: ({ active }: { active: boolean }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#f97316" : "#94a3b8"} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
      ),
    },
    {
      label: "Ledger", active: false,
      Icon: ({ active }: { active: boolean }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#f97316" : "#94a3b8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        </svg>
      ),
    },
    {
      label: "AePS", active: false,
      Icon: ({ active }: { active: boolean }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#f97316" : "#94a3b8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10"/>
          <path d="M5 12a7 7 0 0114 0"/><path d="M8 12a4 4 0 018 0"/><path d="M12 12v.01"/>
        </svg>
      ),
    },
    {
      label: "My Profile", active: false,
      Icon: ({ active }: { active: boolean }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#f97316" : "#94a3b8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{
      width: 375,
      minHeight: "100vh",
      background: "#f1f5f9",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "flex",
      flexDirection: "column",
      overflowX: "hidden",
    }}>

      {/* ── WHITE HEADER ── */}
      <div style={{
        background: "#fff",
        boxShadow: "0 1px 0 rgba(0,0,0,0.06), 0 4px 20px rgba(11,44,96,0.08)",
        position: "sticky", top: 0, zIndex: 20,
      }}>
        {/* Accent stripe */}
        <div style={{ height: 3, background: "linear-gradient(90deg,#0b2c60 0%,#1e4fa8 35%,#f97316 70%,#fb923c 100%)" }} />

        {/* Main bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", height: 60 }}>
          {/* Left: CSC badge + brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 14,
              background: "linear-gradient(135deg,#0b2c60,#1a4a9e)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(11,44,96,0.30)",
            }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.05em", lineHeight: 1 }}>CSC</span>
              <div style={{ width: 20, height: 1.5, background: "#f97316", borderRadius: 1, marginTop: 2 }} />
            </div>
            <div>
              <div style={{ display: "flex", gap: 3, lineHeight: 1 }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: "#0b2c60", letterSpacing: "0.02em" }}>SAHU</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: "#f97316", letterSpacing: "0.02em" }}>CSC</span>
              </div>
              <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Management Platform
              </span>
            </div>
          </div>

          {/* Right: bell + avatar chip */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Bell */}
            <div style={{ position: "relative" }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: "#f1f5f9", border: "1px solid #e2e8f0",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
              </div>
              <div style={{
                position: "absolute", top: 8, right: 8,
                width: 8, height: 8, background: "#f97316",
                borderRadius: "50%", border: "2px solid white"
              }} />
            </div>

            {/* Avatar chip */}
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "4px 10px 4px 4px",
              background: "linear-gradient(135deg,rgba(11,44,96,0.07),rgba(249,115,22,0.06))",
              border: "1px solid rgba(11,44,96,0.12)",
              borderRadius: 12,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: "linear-gradient(135deg,#f97316,#ea580c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 10, fontWeight: 900,
                boxShadow: "0 2px 6px rgba(249,115,22,0.40)",
              }}>SA</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0b2c60" }}>SAHU</span>
            </div>
          </div>
        </div>

        {/* Greeting sub-bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", height: 44,
          background: "linear-gradient(135deg,#0b2c60 0%,#0f3872 100%)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>{greeting}, SAHU</span>
            <span style={{ fontSize: 15 }}>{greetingEmoji}</span>
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{dateStr}</span>
        </div>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div style={{ flex: 1, padding: "14px 12px 88px", overflowY: "auto" }}>

        {/* ── 2×2 STAT CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              background: "#fff", borderRadius: 16, overflow: "hidden",
              boxShadow: "0 2px 12px rgba(11,44,96,0.08),0 1px 3px rgba(0,0,0,0.04)",
            }}>
              {/* Accent stripe */}
              <div style={{ height: 3, background: s.accent }} />
              <div style={{ padding: "12px 12px 12px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontSize: 9.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", lineHeight: 1.3 }}>
                    {s.label}
                  </p>
                  <div style={{
                    width: 30, height: 30, borderRadius: 9,
                    background: s.iconBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 3px 8px ${s.iconShadow}`,
                    flexShrink: 0,
                  }}>
                    <s.Icon />
                  </div>
                </div>
                <p style={{ fontSize: 22, fontWeight: 900, color: "#0b2c60", lineHeight: 1.1, marginBottom: 5 }}>{s.value}</p>
                <p style={{ fontSize: 10.5, fontWeight: 600, color: s.subColor }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
            Quick Actions
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {quickActions.map((a) => (
              <div key={a.label} style={{
                background: "#fff", borderRadius: 16,
                boxShadow: "0 2px 10px rgba(11,44,96,0.07),0 1px 3px rgba(0,0,0,0.04)",
                padding: "16px 8px 12px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 9,
                cursor: "pointer",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: a.bg,
                  boxShadow: `0 4px 12px ${a.shadow}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <a.Icon />
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#0b2c60", textAlign: "center", lineHeight: 1.2 }}>
                  {a.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TOP SERVICES TODAY ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Top Services Today
            </p>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#0b2c60" }}>See all</span>
          </div>
          {/* Empty state */}
          <div style={{
            background: "#fff", borderRadius: 16,
            boxShadow: "0 2px 12px rgba(11,44,96,0.06)",
            border: "1px solid #e2e8f0",
            padding: "28px 16px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>No service data yet</p>
          </div>
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0,
        width: 375,
        background: "#fff",
        borderTop: "1px solid #e2e8f0",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
        display: "flex", alignItems: "stretch", height: 64,
        zIndex: 100,
      }}>
        {navTabs.map((tab) => (
          <div key={tab.label} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 3,
            cursor: "pointer", position: "relative",
          }}>
            {tab.active && (
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 32, height: 2.5, background: "#f97316", borderRadius: 2,
              }} />
            )}
            <tab.Icon active={tab.active} />
            <span style={{
              fontSize: 10, fontWeight: 600, lineHeight: 1,
              color: tab.active ? "#f97316" : "#94a3b8",
            }}>
              {tab.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
