import React, { useState } from 'react';
import {
  LayoutDashboard, BookOpen, HandCoins, Fingerprint, Briefcase, BarChart3,
  Bell, UserCircle, WifiOff, ArrowDownToLine, Info,
  Users, Megaphone, FileArchive, History, Database, HeartPulse,
  Moon, Sun, LogIn,
  ChevronDown, Eye, ArrowUpRight, ArrowDownLeft, FileText, Calendar,
  SlidersHorizontal, Download, RotateCcw, Clock, IndianRupee, Plus,
  ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, Lock, Search,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type NavItem = {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  active?: boolean;
  badge?: number;
};

// ─── Data: exact nav items from layout.tsx ───────────────────────────────────
const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard',    icon: LayoutDashboard },
  { label: 'Ledger',       icon: BookOpen,        active: true },
  { label: 'Udhari Khata', icon: HandCoins },
  { label: 'AePS Cash',    icon: Fingerprint },
  { label: 'Services',     icon: Briefcase },
  { label: 'Reports',      icon: BarChart3 },
  { label: 'Notifications',icon: Bell,            badge: 2 },
  { label: 'My Profile',   icon: UserCircle },
  { label: 'PWA Status',   icon: WifiOff },
  { label: 'Download App', icon: ArrowDownToLine },
  { label: 'About',        icon: Info },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'User Management', icon: Users },
  { label: 'Broadcast',       icon: Megaphone },
  { label: 'Receipt Export',  icon: FileArchive },
  { label: 'Audit Logs',      icon: History },
  { label: 'Backups',         icon: Database },
  { label: 'Server Health',   icon: HeartPulse },
];

// ─── Sidebar — faithful copy of SidebarNav from layout.tsx ───────────────────
function Sidebar() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className="flex flex-col h-full w-64 flex-shrink-0 shadow-2xl" style={{ background: 'hsl(217,79%,21%)' }}>

      {/* ── Top Header ── */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full overflow-hidden shadow-md" style={{ outline: '2px solid rgba(255,255,255,0.20)', outlineOffset: 0 }}>
            <img
              src="/__mockup/images/sahu-logo.png"
              alt="SAHU CSC Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                (e.currentTarget.parentElement as HTMLElement).style.background = 'hsl(25,95%,53%)';
                (e.currentTarget.parentElement as HTMLElement).innerHTML = '<span style="display:flex;align-items:center;justify-content:center;height:100%;color:white;font-weight:900;font-size:14px">S</span>';
              }}
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2, letterSpacing: '0.02em', color: 'white' }}>SAHU CSC</h2>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)', fontWeight: 500, letterSpacing: '0.04em', marginTop: 2 }}>Management Platform</p>
        </div>
      </div>

      {/* ── Nav Items ── */}
      <div className="flex-1 overflow-y-auto py-3 px-3" style={{ scrollbarWidth: 'none' }}>
        <style>{`.sidebar-scroll::-webkit-scrollbar{display:none}`}</style>

        {/* Main nav */}
        <div className="space-y-0.5">
          {MAIN_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer"
                style={{
                  background:   item.active ? '#f97316' : 'transparent',
                  color:        item.active ? 'white' : 'rgba(255,255,255,0.65)',
                  fontWeight:   item.active ? 600 : 400,
                  boxShadow:    item.active ? '0 4px 12px rgba(249,115,22,0.30)' : 'none',
                  transition:   'background 100ms, color 100ms',
                }}
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} style={{ color: item.active ? 'white' : 'rgba(255,255,255,0.45)' }} />
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{item.label}</span>
                </div>
                {!!item.badge && item.badge > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    padding: '2px 6px', borderRadius: 999, lineHeight: 1,
                    background: item.active ? 'rgba(255,255,255,0.25)' : '#f97316',
                    color: 'white',
                  }}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Admin section */}
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '16px 12px 6px' }}>
          Admin
        </p>
        <div className="space-y-0.5">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer"
                style={{ color: 'rgba(255,255,255,0.65)', transition: 'background 100ms, color 100ms' }}
              >
                <Icon size={17} style={{ color: 'rgba(255,255,255,0.45)' }} />
                <span style={{ fontSize: 14, lineHeight: 1 }}>{item.label}</span>
                {!!item.badge && item.badge > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: '#f97316', color: 'white' }}>
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Version ── */}
      <div className="px-4 py-1.5 flex items-center justify-between">
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.20)', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          SAHU CSC v3.3.0
        </span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.20)' }}>© 2026</span>
      </div>

      {/* ── User Footer ── */}
      <div className="mx-3 mb-3 mt-0.5 p-2.5 rounded-2xl flex items-center gap-2.5"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}>

        {/* Avatar */}
        <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-sm"
          style={{ background: '#f97316', outline: '2px solid rgba(249,115,22,0.60)', outlineOffset: 0 }}>
          SA
        </div>

        {/* Name + role */}
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1.2 }} className="truncate">SAHU Admin</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2, textTransform: 'capitalize' }}>Admin</p>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setIsDark(d => !d)}
          className="flex-shrink-0 flex items-center justify-center rounded-xl cursor-pointer"
          style={{ width: 32, height: 32, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.40)' }}
        >
          {isDark ? <Sun size={13} /> : <Moon size={13} />}
        </button>

        {/* Logout */}
        <button
          className="flex-shrink-0 flex items-center justify-center rounded-xl cursor-pointer"
          style={{ width: 32, height: 32, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.40)' }}
        >
          <LogIn size={13} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function LedgerPage() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif', background: '#f8fafc' }}>

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: '#f8fafc' }}>

        {/* ── Top Header ── */}
        <div style={{ position: 'relative', overflow: 'hidden', background: 'white', flexShrink: 0 }}>
          {/* Accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#0b2c60 0%,#1e40af 40%,#f97316 75%,#ea580c 100%)', zIndex: 3 }} />
          {/* Hex mesh */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }} preserveAspectRatio="none">
            <defs>
              <pattern id="dhdr-hex" x="0" y="0" width="28" height="24" patternUnits="userSpaceOnUse">
                <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#0b2c60" strokeWidth="0.9" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dhdr-hex)" />
          </svg>
          {/* Aurora blobs */}
          <div style={{ position: 'absolute', top: -30, right: 60, width: 130, height: 130, background: 'radial-gradient(circle,rgba(249,115,22,0.10) 0%,transparent 70%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -10, left: '42%', width: 100, height: 80, background: 'radial-gradient(circle,rgba(11,44,96,0.07) 0%,transparent 70%)', filter: 'blur(18px)', pointerEvents: 'none' }} />
          {/* Bottom border */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#e2e8f0,transparent)', zIndex: 2 }} />

          <div className="flex items-center justify-between px-8" style={{ height: 64, position: 'relative', zIndex: 2 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0b2c60' }}>Ledger</h1>
              <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginTop: 2 }}>Track all your transactions and manage records seamlessly.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
                <Moon size={15} color="#64748b" />
              </button>
              <button className="relative flex items-center gap-2 rounded-xl px-3 h-8 text-sm font-medium" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#0b2c60' }}>
                <Bell size={15} color="#0b2c60" />
                <span style={{ fontWeight: 500 }}>Notifications</span>
                <span style={{ background: '#f97316', color: 'white', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '0 5px', lineHeight: '18px' }}>2</span>
              </button>
              <div className="flex items-center gap-2 rounded-xl cursor-pointer" style={{ padding: '4px 10px 4px 4px', background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#0b2c60 0%,#1e40af 55%,#f97316 100%)', color: '#fff', fontSize: 10, fontWeight: 900 }}>SA</div>
                <span style={{ fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg,#0b2c60,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SAHU</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 flex flex-row overflow-hidden">

          {/* Scrollable middle */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4" style={{ scrollbarWidth: 'thin' }}>

            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-2xl p-5 relative overflow-hidden shadow-md" style={{ background: 'linear-gradient(135deg,#0b2c60,#1e3a8a)' }}>
                <div style={{ position: 'absolute', right: -16, top: -16, width: 112, height: 112, background: 'rgba(255,255,255,0.10)', borderRadius: '50%', filter: 'blur(20px)' }} />
                <div className="flex justify-between items-start mb-2.5" style={{ position: 'relative', zIndex: 1 }}>
                  <span style={{ color: 'rgba(255,255,255,0.70)', fontSize: 13, fontWeight: 500 }}>Current Balance</span>
                  <button style={{ background: 'rgba(255,255,255,0.10)', borderRadius: 8, padding: 6 }}><Eye size={14} color="rgba(255,255,255,0.90)" /></button>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 16, position: 'relative', zIndex: 1 }}>₹0.00</div>
                <div className="flex items-center gap-1.5" style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.8)' }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)', fontWeight: 500 }}>Last updated: Just now</span>
                </div>
              </div>
              {[
                { label: 'Total Credits',      value: '₹0.00', color: '#059669', iconBg: '#d1fae5', border: '#a7f3d0', Icon: ArrowUpRight },
                { label: 'Total Debits',       value: '₹0.00', color: '#ef4444', iconBg: '#fee2e2', border: '#fca5a5', Icon: ArrowDownLeft },
                { label: 'Total Transactions', value: '0',     color: '#2563eb', iconBg: '#dbeafe', border: '#93c5fd', Icon: FileText },
              ].map(({ label, value, color, iconBg, border, Icon }) => (
                <div key={label} className="rounded-2xl p-5 shadow-sm" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                  <div className="flex justify-between items-start mb-2.5">
                    <span style={{ color: '#64748b', fontSize: 13, fontWeight: 600 }}>{label}</span>
                    <div style={{ background: iconBg, border: `1px solid ${border}`, borderRadius: 12, padding: 8 }}><Icon size={16} color={color} strokeWidth={2.5} /></div>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color, marginBottom: 16 }}>{value}</div>
                  <div className="flex items-center gap-1.5">
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fb923c' }} />
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>This month</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick add */}
            <div className="flex gap-2 items-center rounded-2xl p-2.5 shadow-sm" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
              <div className="flex items-center gap-2 rounded-xl px-3 h-10" style={{ width: 144, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <Calendar size={15} color="#94a3b8" />
                <input defaultValue="09/07/2026" readOnly style={{ width: '100%', outline: 'none', fontSize: 13, fontWeight: 600, color: '#334155', background: 'transparent' }} />
              </div>
              <input placeholder="Customer name" style={{ flex: 1, minWidth: 110, border: '1px solid #e2e8f0', borderRadius: 12, padding: '0 12px', height: 40, fontSize: 13, color: '#334155', outline: 'none', fontWeight: 500 }} />
              <div style={{ position: 'relative', flex: 1, minWidth: 120 }}>
                <select defaultValue="" style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0 32px 0 12px', height: 40, fontSize: 13, color: '#334155', outline: 'none', appearance: 'none', background: 'white', fontWeight: 500 }}>
                  <option value="" disabled>Service type</option>
                  <option>Aadhar Withdrawal</option>
                  <option>Pan Card</option>
                </select>
                <ChevronDown size={13} color="#94a3b8" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <button style={{ background: '#10b981', color: 'white', borderRadius: 8, padding: '0 14px', height: 32, fontSize: 12, fontWeight: 700 }}>Cr</button>
                <button style={{ color: '#64748b', borderRadius: 8, padding: '0 14px', height: 32, fontSize: 12, fontWeight: 700 }}>Dr</button>
              </div>
              <div style={{ position: 'relative', width: 120 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 700 }}>₹</span>
                <input type="number" placeholder="Amount" style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 12, paddingLeft: 28, paddingRight: 12, height: 40, fontSize: 13, color: '#334155', outline: 'none', fontWeight: 700 }} />
              </div>
              <input placeholder="Note (optional)" style={{ flex: 1, minWidth: 110, border: '1px solid #e2e8f0', borderRadius: 12, padding: '0 12px', height: 40, fontSize: 13, color: '#334155', outline: 'none', fontWeight: 500 }} />
              <button style={{ background: '#f97316', color: 'white', borderRadius: 12, padding: '0 24px', height: 40, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>Apply</button>
            </div>

            {/* Search & filter */}
            <div className="flex gap-3 items-center rounded-2xl px-3 py-2.5 shadow-sm" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
              <div className="flex items-center gap-2.5 flex-1">
                <Search size={17} color="#94a3b8" />
                <input placeholder="Search transactions..." style={{ width: '100%', outline: 'none', fontSize: 13, color: '#334155', fontWeight: 500, background: 'transparent' }} />
              </div>
              <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />
              {[
                { label: 'Filters', Icon: SlidersHorizontal },
                { label: 'Export',  Icon: Download },
              ].map(({ label, Icon }) => (
                <button key={label} className="flex items-center gap-2 rounded-xl px-3.5 h-9 text-sm font-semibold" style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#334155' }}>
                  <Icon size={13} />{label}
                  {label === 'Export' && <ChevronDown size={13} color="#94a3b8" />}
                </button>
              ))}
              <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />
              <button className="flex items-center gap-1.5 text-sm font-semibold px-2" style={{ color: '#64748b' }}>
                <RotateCcw size={13} />Clear
              </button>
              <button style={{ background: '#f97316', color: 'white', borderRadius: 12, padding: '0 20px', height: 36, fontSize: 13, fontWeight: 700 }}>Apply</button>
            </div>

            {/* Table */}
            <div className="flex flex-col rounded-2xl shadow-sm overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
              {/* Tabs */}
              <div className="flex" style={{ borderBottom: '1px solid #e2e8f0' }}>
                <button className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold" style={{ borderBottom: '2px solid #0b2c60', color: '#0b2c60' }}>
                  <FileText size={15} strokeWidth={2.5} />Transactions
                </button>
                <button className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold" style={{ borderBottom: '2px solid transparent', color: '#94a3b8' }}>
                  <Clock size={15} strokeWidth={2.5} />Receipt History
                </button>
              </div>
              {/* Table header */}
              <div className="flex px-4 py-3.5" style={{ background: 'rgba(248,250,252,0.80)', borderBottom: '1px solid #e2e8f0' }}>
                {['Date & Time ↕','Customer','Service','Type','Amount','Note','Receipt','Action'].map((h, i) => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em',
                    width: i === 0 ? 140 : i === 2 ? 130 : i === 3 ? 80 : i === 4 ? 100 : i === 5 ? 150 : i === 6 ? 80 : i === 7 ? 80 : undefined,
                    flex: i === 1 ? 1 : undefined,
                    textAlign: (i === 4 || i === 7) ? 'right' : i === 6 ? 'center' : 'left',
                  }}>{h}</div>
                ))}
              </div>
              {/* Empty state */}
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: '#ffedd5', outline: '6px solid #fff7ed' }}>
                  <IndianRupee size={28} color="#f97316" strokeWidth={2.5} />
                </div>
                <p style={{ fontSize: 17, fontWeight: 700, color: '#1e293b' }}>No transactions found</p>
                <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Add your first entry to get started</p>
                <button style={{ background: '#f97316', color: 'white', borderRadius: 12, padding: '10px 24px', fontSize: 13, fontWeight: 700, marginTop: 4 }}>+ Add New Entry</button>
              </div>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between mt-1">
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Showing 0 of 0 transactions</span>
              <div className="flex items-center gap-1">
                {[ChevronsLeft, ChevronLeft].map((Icon, i) => (
                  <button key={i} className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, color: '#94a3b8', border: '1px solid transparent' }}><Icon size={15} /></button>
                ))}
                <button className="flex items-center justify-center rounded-lg text-sm font-bold" style={{ width: 32, height: 32, background: '#0b2c60', color: 'white' }}>1</button>
                {[ChevronRight, ChevronsRight].map((Icon, i) => (
                  <button key={i} className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, color: '#94a3b8', border: '1px solid transparent' }}><Icon size={15} /></button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 pb-4" style={{ color: '#94a3b8', fontSize: 11, fontWeight: 500 }}>
              <Lock size={11} />All your transactions are secure and encrypted
            </div>
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-4 overflow-y-auto p-4" style={{ width: 256, flexShrink: 0, background: '#f8fafc', borderLeft: '1px solid #e2e8f0', scrollbarWidth: 'thin' }}>

            {/* Quick Actions */}
            <div className="rounded-2xl p-4 shadow-sm" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
              <h3 className="flex items-center gap-2 mb-3.5" style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>
                <span style={{ fontSize: 16 }}>⚡</span>Quick Actions
              </h3>
              {[
                { label: 'Add New Entry',   sub: 'Record a new transaction', bg: 'linear-gradient(135deg,#f97316,#ea580c)', Icon: Plus },
                { label: 'Receipt History', sub: 'View all receipts',        bg: 'linear-gradient(135deg,#a855f7,#9333ea)', Icon: FileText },
                { label: 'Export Ledger',   sub: 'Download as Excel / PDF',  bg: 'linear-gradient(135deg,#10b981,#059669)', Icon: Download },
                { label: 'Backup Ledger',   sub: 'Create a ledger backup',   bg: 'linear-gradient(135deg,#3b82f6,#2563eb)', Icon: Database },
              ].map(({ label, sub, bg, Icon }) => (
                <div key={label} className="flex items-center gap-3 p-2 rounded-xl cursor-pointer mb-1.5" style={{ border: '1px solid transparent' }}>
                  <div className="flex items-center justify-center rounded-[10px] flex-shrink-0" style={{ width: 40, height: 40, background: bg }}>
                    <Icon size={17} color="white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }} className="truncate">{label}</p>
                    <p style={{ fontSize: 11, color: '#64748b' }} className="truncate">{sub}</p>
                  </div>
                  <ChevronRight size={15} color="#cbd5e1" />
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="rounded-2xl p-4 shadow-sm" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="flex items-center gap-1.5" style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>
                  <span style={{ fontSize: 14 }}>📊</span>Summary
                </h3>
                <span style={{ fontSize: 11, color: '#94a3b8', background: '#f1f5f9', borderRadius: 6, padding: '2px 8px' }}>This Month</span>
              </div>
              <div className="flex justify-center mb-4">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" strokeWidth="14" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#0b2c60" strokeWidth="14" strokeDasharray="1 239" strokeLinecap="round" transform="rotate(-90 50 50)" />
                  <text x="50" y="46" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0b2c60">0</text>
                  <text x="50" y="58" textAnchor="middle" fontSize="8" fill="#94a3b8">Total</text>
                </svg>
              </div>
              {[
                { label: 'Credits', color: '#10b981', value: '₹0.00' },
                { label: 'Debits',  color: '#ef4444', value: '₹0.00' },
                { label: 'Balance', color: '#3b82f6', value: '₹0.00' },
              ].map(({ label, color, value }) => (
                <div key={label} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl p-4 shadow-sm" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
              <h3 className="flex items-center gap-1.5 mb-3" style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>
                <span style={{ fontSize: 14 }}>🕐</span>Recent Activity
              </h3>
              <div className="flex flex-col items-center justify-center gap-2 py-6">
                <div className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: '#f1f5f9' }}>
                  <Clock size={18} color="#94a3b8" />
                </div>
                <p style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>No recent Activity</p>
                <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>Your recent transactions will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
