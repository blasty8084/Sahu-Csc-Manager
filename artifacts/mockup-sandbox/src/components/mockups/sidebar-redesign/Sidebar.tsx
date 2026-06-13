import {
  LayoutDashboard, BookOpen, Fingerprint, Briefcase, BarChart3,
  Bell, UserCircle, MonitorSmartphone, WifiOff, ArrowDownToLine,
  LayoutGrid, Users, History, Database, Settings, HeartPulse,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Ledger", icon: BookOpen },
  { label: "AePS Cash", icon: Fingerprint },
  { label: "Services", icon: Briefcase },
  { label: "Reports", icon: BarChart3 },
  { label: "Notifications", icon: Bell, badge: 12 },
  { label: "My Profile", icon: UserCircle },
  { label: "Active Sessions", icon: MonitorSmartphone },
  { label: "App & Offline", icon: WifiOff, active: true },
  { label: "Download App", icon: ArrowDownToLine },
];

const adminItems = [
  { label: "Users Overview", icon: LayoutGrid },
  { label: "User Management", icon: Users },
  { label: "Audit Logs", icon: History },
  { label: "Backups", icon: Database },
  { label: "Settings", icon: Settings },
  { label: "Server Health", icon: HeartPulse },
];

export function Sidebar() {
  return (
    <div
      className="flex flex-col h-screen w-[280px] select-none"
      style={{ background: "#0d1f3c", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          {/* Logo circle */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: "#f97316" }}
          >
            <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#f97316" />
              {/* simple "S" shield icon */}
              <path
                d="M20 8 L28 12 L28 20 C28 25 24 29 20 31 C16 29 12 25 12 20 L12 12 Z"
                fill="white"
                fillOpacity="0.3"
              />
              <text
                x="20"
                y="25"
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="bold"
                fontFamily="Inter, sans-serif"
              >
                S
              </text>
            </svg>
          </div>
          <div>
            <div className="font-bold text-white text-[15px] leading-tight">
              SAHU <span style={{ color: "#f97316" }}>CSC</span>
            </div>
            <div className="text-[11px] leading-tight" style={{ color: "#8eaad4" }}>
              Management Platform
            </div>
          </div>
        </div>
        {/* Square icon top-right */}
        <div
          className="w-7 h-7 rounded-md border flex items-center justify-center cursor-pointer"
          style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.4)" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* ── Nav Items ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center justify-between px-3 py-[10px] rounded-xl cursor-pointer transition-all"
              style={
                item.active
                  ? {
                      background: "#f97316",
                      borderRadius: "12px",
                    }
                  : {
                      background: "transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (!item.active)
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={(e) => {
                if (!item.active)
                  (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={16}
                  color={item.active ? "white" : "rgba(255,255,255,0.55)"}
                  strokeWidth={item.active ? 2.5 : 1.8}
                />
                <span
                  className="text-[13px]"
                  style={{
                    color: item.active ? "white" : "rgba(255,255,255,0.75)",
                    fontWeight: item.active ? 600 : 400,
                  }}
                >
                  {item.label}
                </span>
              </div>
              {item.badge ? (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                  style={{ background: "#f97316", color: "white" }}
                >
                  {item.badge}
                </span>
              ) : null}
            </div>
          );
        })}

        {/* ── Admin Section ──────────────────────────── */}
        <div
          className="text-[9px] font-bold uppercase tracking-[0.15em] px-3 pt-4 pb-2"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Admin
        </div>
        {adminItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-3 px-3 py-[10px] rounded-xl cursor-pointer"
              style={{ background: "transparent" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Icon size={16} color="rgba(255,255,255,0.55)" strokeWidth={1.8} />
              <span
                className="text-[13px]"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Version Bar ────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-2"
        style={{ color: "rgba(255,255,255,0.22)" }}
      >
        <span className="text-[10px] font-mono tracking-wide">SAHU CSC v1.1.0</span>
        <span className="text-[10px]">© 2026</span>
      </div>

      {/* ── User Footer ────────────────────────────── */}
      <div
        className="mx-3 mb-3 rounded-xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        {/* User info row */}
        <div className="flex items-center gap-3 px-3 pt-3 pb-2">
          {/* Profile picture */}
          <div className="relative flex-shrink-0">
            <img
              src="https://i.pravatar.cc/80?img=12"
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover"
              style={{ border: "2px solid rgba(249,115,22,0.6)" }}
            />
            {/* Online dot */}
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
              style={{ background: "#22c55e", border: "2px solid #0d1f3c" }}
            />
          </div>
          {/* Name + role */}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold truncate" style={{ color: "white" }}>
              SAHU Admin
            </div>
            <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              Admin
            </div>
          </div>
        </div>

        {/* Logout button — full-width strip */}
        <div
          className="flex items-center justify-center gap-2 mx-2 mb-2 py-2 rounded-lg cursor-pointer transition-all"
          style={{
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "rgba(239,68,68,0.8)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(239,68,68,0.22)";
            el.style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(239,68,68,0.12)";
            el.style.color = "rgba(239,68,68,0.8)";
          }}
        >
          <LogOut size={13} strokeWidth={2} />
          <span className="text-[12px] font-medium">Logout</span>
        </div>
      </div>
    </div>
  );
}
