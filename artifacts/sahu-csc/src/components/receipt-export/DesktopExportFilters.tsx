import { Calendar, Search, User, ChevronDown, Loader2 } from "lucide-react";
import { NAVY, type UserOverview } from "./types";

interface DesktopExportFiltersProps {
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

export function DesktopExportFilters({
  startDate, endDate, userId, dateRange, today,
  usersOverview, previewing,
  setStartDate, setEndDate, setUserId, setPreview,
  onPreview, onQuickRange, setDateRange,
}: DesktopExportFiltersProps) {
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
          {usersOverview.map(u => (
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
