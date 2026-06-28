import { useState } from "react";

const BLUE = "#3B82F6";
const GREEN = "#22C55E";
const ORANGE = "#F97316";
const PURPLE = "#A855F7";
const NAVY = "#0B1340";
const HEADER_FROM = "#1a0533";
const HEADER_TO = "#2d1b69";

function WalletIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M16 12h.01"/>
      <path d="M2 10h20"/>
    </svg>
  );
}
function TrendUpIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  );
}
function TrendDownIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
      <polyline points="17 18 23 18 23 12"/>
    </svg>
  );
}
function ActivityIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  );
}
function FingerprintIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10"/>
      <path d="M5 12a7 7 0 0114 0"/>
      <path d="M8 12a4 4 0 018 0"/>
      <path d="M12 12v.01"/>
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}
function BarChartIcon({ color = "#fff", size = 24 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="18" y="3" width="4" height="18"/>
      <rect x="10" y="9" width="4" height="12"/>
      <rect x="2" y="14" width="4" height="7"/>
    </svg>
  );
}
function HomeIcon({ color = "#fff" }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 22V12h6v10"/>
    </svg>
  );
}
function BookIcon({ color = "#fff" }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  );
}
function PersonIcon({ color = "#fff" }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}
function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
      <path d="M3 6h18M3 12h18M3 18h18"/>
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="#F97316" stroke="#F97316" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

// Mini bar chart for promo card
function MiniBarChart() {
  const bars = [
    { h: 40, color: "#F97316" },
    { h: 60, color: "#3B82F6" },
    { h: 35, color: "#22C55E" },
    { h: 75, color: "#F97316" },
    { h: 55, color: "#3B82F6" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
      {bars.map((b, i) => (
        <div
          key={i}
          style={{
            width: 16,
            height: b.h,
            background: b.color,
            borderRadius: "4px 4px 0 0",
            opacity: 0.9,
          }}
        />
      ))}
      {/* Up-arrow overlay */}
      <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2d1b69" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      </div>
    </div>
  );
}

// Clipboard illustration for empty state
function ClipboardIllustration() {
  return (
    <div style={{ position: "relative", width: 80, height: 90, margin: "0 auto 12px" }}>
      {/* Clipboard body */}
      <div style={{
        width: 70, height: 80, background: "#E8F0FE",
        borderRadius: 10, border: "2px solid #c7d8fb",
        position: "absolute", bottom: 0, left: 5
      }}>
        {/* Lines */}
        <div style={{ margin: "22px 12px 0", display: "flex", flexDirection: "column", gap: 7 }}>
          {[80, 60, 70].map((w, i) => (
            <div key={i} style={{ height: 6, width: `${w}%`, background: "#c7d8fb", borderRadius: 3 }} />
          ))}
        </div>
      </div>
      {/* Clip */}
      <div style={{
        width: 26, height: 14, background: "#93b5f9",
        borderRadius: "4px 4px 0 0",
        position: "absolute", top: 0, left: 22,
        border: "2px solid #7aa4f7"
      }} />
      {/* Blue checkmark badge */}
      <div style={{
        position: "absolute", bottom: -6, right: -6,
        width: 28, height: 28,
        background: "#3B82F6",
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "2px solid #fff"
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
    </div>
  );
}

// Wave SVG decoration for header
function WaveDecoration() {
  return (
    <svg
      style={{ position: "absolute", right: 0, top: 0, opacity: 0.18 }}
      width="160" height="160" viewBox="0 0 160 160" fill="none"
    >
      <ellipse cx="130" cy="30" rx="80" ry="80" fill="white"/>
      <ellipse cx="150" cy="90" rx="60" ry="60" fill="white"/>
    </svg>
  );
}

export function MobileDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const navTabs = [
    { label: "Dashboard", icon: <HomeIcon color={activeTab === 0 ? ORANGE : "#fff"} /> },
    { label: "Ledger", icon: <BookIcon color={activeTab === 1 ? ORANGE : "#fff"} /> },
    { label: "AePS", icon: <FingerprintIcon /> },
    { label: "My Profile", icon: <PersonIcon color={activeTab === 3 ? ORANGE : "#fff"} /> },
  ];

  const stats = [
    { label: "Balance", value: "₹0", Icon: <WalletIcon />, color: BLUE },
    { label: "Income", value: "₹0", Icon: <TrendUpIcon />, color: GREEN },
    { label: "Expense", value: "₹0", Icon: <TrendDownIcon />, color: ORANGE },
    { label: "Transactions", value: "0", Icon: <ActivityIcon />, color: PURPLE },
  ];

  const quickActions = [
    { label: "New Entry", icon: <PlusIcon />, bg: BLUE },
    { label: "AePS", icon: <FingerprintIcon />, bg: ORANGE },
    { label: "Services", icon: <GridIcon />, bg: GREEN },
    { label: "Reports", icon: <BarChartIcon />, bg: PURPLE },
  ];

  // Get greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div style={{
      width: 375,
      minHeight: "100vh",
      background: "#F5F5F5",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflowX: "hidden",
    }}>
      {/* ── HEADER ── */}
      <div style={{
        background: `linear-gradient(135deg, ${HEADER_FROM} 0%, ${HEADER_TO} 100%)`,
        padding: "0 0 28px 0",
        position: "relative",
        overflow: "hidden",
      }}>
        <WaveDecoration />

        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px 0",
        }}>
          {/* Left: hamburger + logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
              <HamburgerIcon />
            </button>
            <div>
              <div style={{ display: "flex", gap: 0, lineHeight: 1 }}>
                <span style={{ color: "#fff", fontWeight: 900, fontSize: 18, letterSpacing: 0.5 }}>SAHU </span>
                <span style={{ color: ORANGE, fontWeight: 900, fontSize: 18, letterSpacing: 0.5 }}>CSC</span>
              </div>
              <div style={{ color: "#c4b5e0", fontSize: 10, fontWeight: 500, marginTop: 1 }}>
                Management Platform
              </div>
            </div>
          </div>

          {/* Right: bell + avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Bell */}
            <div style={{ position: "relative" }}>
              <button style={{
                background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer",
                width: 38, height: 38, borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <BellIcon />
              </button>
              <div style={{
                position: "absolute", top: 7, right: 7,
                width: 9, height: 9, background: ORANGE,
                borderRadius: "50%", border: "2px solid #1a0533"
              }} />
            </div>
            {/* Avatar */}
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 900, fontSize: 14,
              boxShadow: "0 2px 8px rgba(249,115,22,0.5)",
            }}>
              SA
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 22, lineHeight: 1.2 }}>
            {greeting}, SAHU 👋
          </div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4, fontWeight: 500 }}>
            {dateStr}
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 0 88px 0" }}>

        {/* ── STATS CARD ── */}
        <div style={{ margin: "-14px 16px 0", background: "#fff", borderRadius: 20, padding: "20px 12px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              borderRight: i < 3 ? "1px solid #f0f0f0" : "none",
              padding: "4px 4px",
            }}>
              {/* Icon box */}
              <div style={{
                width: 46, height: 46, borderRadius: 14,
                background: s.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 12px ${s.color}55`,
              }}>
                {s.Icon}
              </div>
              <span style={{ fontSize: 10, color: "#8a8a9a", fontWeight: 500, textAlign: "center" }}>{s.label}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e", lineHeight: 1 }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* ── PROMO BANNER ── */}
        <div style={{
          margin: "16px 16px 0", background: "#fff", borderRadius: 20,
          padding: "16px 16px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
          display: "flex", alignItems: "center", gap: 14, position: "relative", overflow: "hidden",
        }}>
          {/* Star badge */}
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "#1a0533",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <StarIcon />
          </div>
          {/* Text */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#1a1a2e" }}>Grow your business</div>
            <div style={{ fontSize: 11, color: "#8a8a9a", marginTop: 3, lineHeight: 1.4 }}>
              Track, manage and grow your CSC business smarter.
            </div>
          </div>
          {/* Mini chart */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <MiniBarChart />
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div style={{ margin: "20px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>Quick Actions</span>
            <span style={{ fontWeight: 600, fontSize: 13, color: ORANGE, cursor: "pointer" }}>View All</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {quickActions.map((a) => (
              <div key={a.label} style={{
                background: "#fff", borderRadius: 16,
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                padding: "16px 8px 12px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                cursor: "pointer",
              }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 16,
                  background: a.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 4px 14px ${a.bg}55`,
                }}>
                  {a.icon}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#1a1a2e", textAlign: "center" }}>
                  {a.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TOP SERVICES TODAY ── */}
        <div style={{ margin: "20px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>Top Services Today</span>
            <span style={{ fontWeight: 600, fontSize: 13, color: ORANGE, cursor: "pointer" }}>See all</span>
          </div>
          {/* Empty state */}
          <div style={{
            background: "#fff", borderRadius: 20,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            padding: "32px 20px 28px",
            display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
          }}>
            <ClipboardIllustration />
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e", marginTop: 6 }}>No service data yet</div>
            <div style={{ fontSize: 12, color: "#9a9ab0", marginTop: 4 }}>
              Use services to see top data here
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: NAVY,
        borderRadius: "20px 20px 0 0",
        height: 72,
        display: "flex",
        alignItems: "center",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.25)",
        zIndex: 100,
        width: 375,
      }}>
        {navTabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 4, background: "none", border: "none", cursor: "pointer",
              padding: "10px 0",
            }}
          >
            <div style={{ color: i === activeTab ? ORANGE : "#fff", display: "flex" }}>
              {i === 0 ? <HomeIcon color={i === activeTab ? ORANGE : "#fff"} /> :
               i === 1 ? <BookIcon color={i === activeTab ? ORANGE : "#fff"} /> :
               i === 2 ? (
                 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={i === activeTab ? ORANGE : "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10"/><path d="M5 12a7 7 0 0114 0"/><path d="M8 12a4 4 0 018 0"/><path d="M12 12v.01"/>
                 </svg>
               ) :
               <PersonIcon color={i === activeTab ? ORANGE : "#fff"} />}
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, lineHeight: 1,
              color: i === activeTab ? ORANGE : "#fff",
            }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
