import { Calendar, Search, User, ChevronDown, Loader2, SlidersHorizontal } from "lucide-react";
import { NAVY, type UserOverview } from "./types";

interface FilterProps {
  startDate: string;
  endDate: string;
  userId: string;
  dateRange: string;
  today: string;
  usersOverview: UserOverview[];
  previewing: boolean;
  setStartDate: (v: string) => void;
  setEndDate: (v: string) => void;
  setUserId: (v: string) => void;
  setPreview: (v: null) => void;
  onPreview: () => void;
  onQuickRange: (preset: "today" | "week" | "month" | "lastMonth" | "year") => void;
  setDateRange: (v: string) => void;
}

// ── Desktop inline filter bar ─────────────────────────────────────────────────
export function DesktopExportFilters({
  startDate, endDate, userId, dateRange, today,
  usersOverview, previewing,
  setStartDate, setEndDate, setUserId, setPreview,
  onPreview, onQuickRange, setDateRange,
}: FilterProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Calendar size={13} className="text-slate-400" />
        <input type="date" value={startDate} max={endDate}
          onChange={e => { setStartDate(e.target.value); setPreview(null); }}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none text-slate-700 h-9" />
        <span className="text-slate-300 text-xs">→</span>
        <input type="date" value={endDate} min={startDate} max={today}
          onChange={e => { setEndDate(e.target.value); setPreview(null); }}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none text-slate-700 h-9" />
      </div>
      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
        {(["today","week","month","lastMonth"] as const).map(v => {
          const l = v === "today" ? "Today" : v === "week" ? "Week" : v === "month" ? "This Month" : "Last Month";
          return (
            <button key={v} onClick={() => { onQuickRange(v); setDateRange(v); }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${dateRange === v ? "bg-[#0b2c60] text-white" : "text-slate-500 hover:text-slate-800"}`}>
              {l}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600">
        <User size={12} className="text-slate-400" />
        <select value={userId} onChange={e => { setUserId(e.target.value); setPreview(null); }}
          className="bg-transparent text-xs text-slate-600 focus:outline-none cursor-pointer">
          <option value="all">All Operators</option>
          {usersOverview.map((u) => (
            <option key={u.userId} value={String(u.userId)}>
              {u.fullName ? `${u.fullName} (@${u.username})` : `@${u.username}`}
            </option>
          ))}
        </select>
        <ChevronDown size={11} className="text-slate-400" />
      </div>
      <button onClick={onPreview} disabled={previewing || !startDate || !endDate}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-50 h-9 ml-auto"
        style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
        {previewing ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
        {previewing ? "Searching…" : "Preview Receipts"}
      </button>
    </div>
  );
}

// ── Mobile collapsible filter panel (Receipts tab) ────────────────────────────
interface MobileFilterPanelProps extends FilterProps {
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  searchQ: string;
  setSearchQ: (v: string) => void;
  onPreviewAndClose: () => void;
}

export function MobileExportFilterToggle({
  showFilters, setShowFilters, searchQ, setSearchQ,
}: Pick<MobileFilterPanelProps, "showFilters" | "setShowFilters" | "searchQ" | "setSearchQ">) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          placeholder="Search receipts..."
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b2c60]/20 text-slate-700 placeholder:text-slate-400"
        />
      </div>
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${showFilters ? "text-white border-[#0b2c60]" : "bg-white border-slate-200 text-slate-500"}`}
        style={showFilters ? { background: NAVY } : undefined}>
        <SlidersHorizontal size={16} />
      </button>
    </div>
  );
}

export function MobileExportFilterPanel({
  startDate, endDate, userId, dateRange, today,
  usersOverview, previewing,
  setStartDate, setEndDate, setUserId, setPreview,
  onQuickRange, setDateRange,
  onPreviewAndClose,
}: MobileFilterPanelProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {(["today","week","month","lastMonth"] as const).map(v => {
          const l = v === "today" ? "Today" : v === "week" ? "Week" : v === "month" ? "This Month" : "Last Month";
          return (
            <button key={v} onClick={() => { onQuickRange(v); setDateRange(v); }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dateRange === v ? "text-white" : "bg-slate-100 text-slate-600"}`}
              style={dateRange === v ? { background: NAVY } : undefined}>
              {l}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="date" value={startDate} max={endDate}
          onChange={e => { setStartDate(e.target.value); setPreview(null); }}
          className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none text-slate-700" />
        <input type="date" value={endDate} min={startDate} max={today}
          onChange={e => { setEndDate(e.target.value); setPreview(null); }}
          className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none text-slate-700" />
      </div>
      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
        <User size={12} className="text-slate-400 shrink-0" />
        <select value={userId} onChange={e => { setUserId(e.target.value); setPreview(null); }}
          className="flex-1 bg-transparent text-xs text-slate-600 focus:outline-none">
          <option value="all">All Operators</option>
          {usersOverview.map((u) => (
            <option key={u.userId} value={String(u.userId)}>
              {u.fullName ? `${u.fullName} (@${u.username})` : `@${u.username}`}
            </option>
          ))}
        </select>
      </div>
      <button onClick={onPreviewAndClose} disabled={previewing || !startDate || !endDate}
        className="w-full py-2.5 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
        {previewing ? <><Loader2 size={14} className="animate-spin" /> Searching…</> : <><Search size={14} /> Preview Receipts</>}
      </button>
    </div>
  );
}

// ── Mobile By-Date tab filter panel ──────────────────────────────────────────
interface MobileByDatePanelProps extends FilterProps {
  onPreviewAndSwitch: () => void;
}

export function MobileByDatePanel({
  startDate, endDate, userId, dateRange, today,
  usersOverview, previewing,
  setStartDate, setEndDate, setUserId, setPreview,
  onQuickRange, setDateRange,
  onPreviewAndSwitch,
}: MobileByDatePanelProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Range</p>
        <div className="flex gap-2 flex-wrap">
          {(["today","week","month","lastMonth","year"] as const).map(v => {
            const l = v === "today" ? "Today" : v === "week" ? "This Week" : v === "month" ? "This Month" : v === "lastMonth" ? "Last Month" : "This Year";
            return (
              <button key={v} onClick={() => { onQuickRange(v); setDateRange(v); }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${dateRange === v ? "text-white" : "bg-slate-100 text-slate-600"}`}
                style={dateRange === v ? { background: NAVY } : undefined}>
                {l}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">From</label>
            <input type="date" value={startDate} max={endDate}
              onChange={e => { setStartDate(e.target.value); setPreview(null); }}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none text-slate-700" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">To</label>
            <input type="date" value={endDate} min={startDate} max={today}
              onChange={e => { setEndDate(e.target.value); setPreview(null); }}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none text-slate-700" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
          <User size={13} className="text-slate-400 shrink-0" />
          <select value={userId} onChange={e => { setUserId(e.target.value); setPreview(null); }}
            className="flex-1 bg-transparent text-sm text-slate-600 focus:outline-none">
            <option value="all">All Operators</option>
            {usersOverview.map((u) => (
              <option key={u.userId} value={String(u.userId)}>
                {u.fullName ? `${u.fullName} (@${u.username})` : `@${u.username}`}
              </option>
            ))}
          </select>
        </div>
        <button onClick={onPreviewAndSwitch} disabled={previewing || !startDate || !endDate}
          className="w-full py-3 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
          {previewing ? <><Loader2 size={14} className="animate-spin" /> Searching…</> : <><Search size={14} /> Preview Receipts</>}
        </button>
      </div>
    </div>
  );
}
