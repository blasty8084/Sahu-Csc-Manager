import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import {
  Download, FileText, Search, Calendar, User,
  CheckSquare, Square, ChevronDown, ChevronRight, X, Check,
  Share2, QrCode, Clock, Mail,
  FileArchive, Loader2, Receipt, IndianRupee,
  AlertCircle, TrendingUp, Eye, Printer, Filter,
  ArrowLeft, Hash,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NAVY = "#0b2c60";
const SAFFRON = "#f97316";

const MONTH_OPTIONS = [
  { v: 1, l: "January" }, { v: 2, l: "February" }, { v: 3, l: "March" },
  { v: 4, l: "April" }, { v: 5, l: "May" }, { v: 6, l: "June" },
  { v: 7, l: "July" }, { v: 8, l: "August" }, { v: 9, l: "September" },
  { v: 10, l: "October" }, { v: 11, l: "November" }, { v: 12, l: "December" },
];

interface PreviewEntry {
  receiptNumber: string;
  date: string;
  customerName: string;
  serviceType: string;
  amount: number;
  type: "credit" | "debit";
  operator: string | null;
}

interface CountResult {
  count: number;
  entries: PreviewEntry[];
}

function Cb({ checked, onChange, size = 15 }: { checked: boolean; onChange: () => void; size?: number }) {
  return (
    <button onClick={onChange} className="shrink-0 p-0.5">
      {checked
        ? <CheckSquare size={size} className="text-[#0b2c60]" />
        : <Square size={size} className="text-slate-300" />}
    </button>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateShort(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

type MobileTab = "bulk" | "monthly";

export default function ReceiptExport() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const today = now.toISOString().split("T")[0];

  const [, setLocation] = useLocation();
  const { toast } = useToast();

  /* ── Filter state ── */
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [userId, setUserId] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  /* ── Results state ── */
  const [preview, setPreview] = useState<CountResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  /* ── Monthly export state ── */
  const [mobileTab, setMobileTab] = useState<MobileTab>("bulk");
  const [trigMonth, setTrigMonth] = useState(now.getMonth() === 0 ? 12 : now.getMonth());
  const [trigYear, setTrigYear] = useState(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
  const [emailing, setEmailing] = useState(false);
  const [monthDownloading, setMonthDownloading] = useState(false);

  const { data: usersOverview = [] } = useQuery<any[]>({
    queryKey: ["admin", "users-overview"],
    queryFn: () => customFetch<any[]>("/api/admin/users-overview"),
  });

  /* ── Quick presets ── */
  const setQuickRange = (preset: "today" | "week" | "month" | "lastMonth" | "year") => {
    const n = new Date();
    let start: Date;
    let end = new Date(n);
    switch (preset) {
      case "today":    start = new Date(n); break;
      case "week":     start = new Date(n); start.setDate(start.getDate() - 6); break;
      case "month":    start = new Date(n.getFullYear(), n.getMonth(), 1); break;
      case "lastMonth":
        start = new Date(n.getFullYear(), n.getMonth() - 1, 1);
        end   = new Date(n.getFullYear(), n.getMonth(), 0);
        break;
      case "year":     start = new Date(n.getFullYear(), 0, 1); break;
    }
    setStartDate(start!.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    setPreview(null);
    setSelected(new Set());
    setExpandedEntry(null);
  };

  const buildParams = () => {
    const p = new URLSearchParams({ startDate, endDate });
    if (userId !== "all") p.set("userId", userId);
    return p.toString();
  };

  /* ── Preview ── */
  const handlePreview = async () => {
    if (!startDate || !endDate) { toast({ title: "Select both dates", variant: "destructive" }); return; }
    if (startDate > endDate) { toast({ title: "Start date must be before end date", variant: "destructive" }); return; }
    setPreviewing(true);
    setPreview(null);
    setSelected(new Set());
    setExpandedEntry(null);
    try {
      const data: CountResult = await customFetch(`/api/admin/receipts/bulk-export/count?${buildParams()}`);
      setPreview(data);
      if (data.entries.length > 0) setSelected(new Set(data.entries.map(e => e.receiptNumber)));
    } catch (err: unknown) {
      toast({ title: "Preview failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setPreviewing(false);
    }
  };

  /* ── Bulk download ── */
  const handleDownload = async () => {
    if (!preview || preview.count === 0) { toast({ title: "No receipts to download", variant: "destructive" }); return; }
    setDownloading(true);
    try {
      const res = await fetch(`/api/admin/receipts/bulk-export/download?${buildParams()}`, { credentials: "include" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `receipts-${startDate}-to-${endDate}.zip`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Download started", description: `${preview.count} PDF receipt${preview.count !== 1 ? "s" : ""} in ZIP` });
    } catch (err: unknown) {
      toast({ title: "Download failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  /* ── Monthly download ── */
  const handleMonthDownload = async () => {
    setMonthDownloading(true);
    try {
      const res = await fetch(`/api/admin/receipts/monthly-export/download?year=${trigYear}&month=${trigMonth}`, { credentials: "include" });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `receipts-${trigYear}-${String(trigMonth).padStart(2, "0")}.zip`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded!", description: `ZIP for ${MONTH_OPTIONS.find(m => m.v === trigMonth)?.l} ${trigYear} saved.` });
    } catch { toast({ title: "Download failed", variant: "destructive" }); }
    finally { setMonthDownloading(false); }
  };

  /* ── Monthly email ── */
  const handleMonthEmail = async () => {
    setEmailing(true);
    try {
      const res = await fetch("/api/admin/receipts/monthly-export/trigger", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: trigYear, month: trigMonth }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed to send");
      toast({ title: "Email sent!", description: `Monthly export for ${MONTH_OPTIONS.find(m => m.v === trigMonth)?.l} ${trigYear} emailed.` });
    } catch (err: any) {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" });
    } finally { setEmailing(false); }
  };

  const nextExport = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 5, 0)
    .toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const displayedEntries = preview?.entries ?? [];
  const filteredEntries = displayedEntries.filter(e =>
    e.customerName.toLowerCase().includes(searchQ.toLowerCase()) ||
    e.receiptNumber.toLowerCase().includes(searchQ.toLowerCase()) ||
    e.serviceType.toLowerCase().includes(searchQ.toLowerCase())
  );
  const selTotal = filteredEntries.filter(e => selected.has(e.receiptNumber)).reduce((s, e) => s + e.amount, 0);

  const toggleAll = () => {
    if (selected.size === filteredEntries.length) setSelected(new Set());
    else setSelected(new Set(filteredEntries.map(e => e.receiptNumber)));
  };
  const toggleEntry = (id: string) => {
    const s = new Set(selected); if (s.has(id)) s.delete(id); else s.add(id); setSelected(s);
  };

  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  /* ═══════════════════════════════════════════════════════════════
     SHARED HEADER (navy gradient + saffron stripe + stat pills)
  ═══════════════════════════════════════════════════════════════ */
  const Header = (
    <div className="sticky top-0 z-20" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3d80 100%)` }}>
      <div className="h-0.5 sm:h-1" style={{ background: `linear-gradient(90deg, ${SAFFRON}, #fbbf24, ${SAFFRON})` }} />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-3 sm:pt-4 pb-2 sm:pb-3 flex items-center gap-3">
        <button
          onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/")}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}>
          <FileArchive size={15} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">Bulk Receipt Export</h1>
          <p className="text-[10px] sm:text-[11px] text-white/50 truncate">Download all receipts as a ZIP of individual PDFs</p>
        </div>
        <span className="hidden sm:block text-[10px] text-white/50 bg-white/10 border border-white/10 rounded-full px-3 py-1">Admin Only</span>
      </div>

      {/* Stat pills — horizontal scroll on mobile, 4-col grid on desktop */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-3 sm:pb-5 pt-1 sm:pt-2">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 sm:grid sm:grid-cols-4 no-scrollbar">
          {[
            { label: "Receipts",  value: preview ? String(preview.count) : "—",
              sub: "In range",      gradient: "from-[#0b2c60] to-[#1a4a9e]",    icon: Receipt },
            { label: "Amount",    value: preview ? `₹${displayedEntries.reduce((s,e) => s+e.amount, 0).toLocaleString("en-IN")}` : "—",
              sub: "Total value",   gradient: "from-emerald-600 to-emerald-500", icon: IndianRupee },
            { label: "Credit",    value: preview ? String(displayedEntries.filter(e => e.type==="credit").length) : "—",
              sub: "Income",        gradient: "from-[#f97316] to-orange-400",    icon: TrendingUp },
            { label: "Pending",   value: preview ? String(preview.count) : "—",
              sub: "Ready",         gradient: "from-violet-600 to-violet-500",   icon: Eye },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.gradient} shrink-0 sm:shrink rounded-xl p-3 sm:p-3.5 text-white flex items-center gap-2.5 shadow-md min-w-[110px] sm:min-w-0`}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                <s.icon size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-extrabold leading-none">{s.value}</p>
                <p className="text-[10px] text-white/65 mt-0.5">{s.label}</p>
                <p className="text-[9px] text-white/35 hidden sm:block mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile-only tab bar */}
      <div className="flex border-t border-white/10 sm:hidden">
        {([["bulk", "Bulk Export"], ["monthly", "Monthly"]] as const).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setMobileTab(v)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 ${mobileTab === v ? "text-white" : "text-white/50 border-transparent"}`}
            style={mobileTab === v ? { borderBottomColor: SAFFRON } : {}}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     MONTHLY SECTION (shared between mobile tab and desktop panel)
  ═══════════════════════════════════════════════════════════════ */
  const MonthlySection = (
    <div className="bg-white rounded-xl sm:rounded-xl border border-orange-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2.5" style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}>
        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
          <Clock size={14} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Monthly Auto-Export</p>
          <p className="text-[10px] text-white/60">Runs on 1st of each month</p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="rounded-lg bg-orange-50 border border-orange-100 px-3 py-2 flex items-start gap-2">
          <Mail size={11} className="text-orange-500 mt-0.5 shrink-0" />
          <p className="text-[10px] text-orange-700 leading-relaxed">
            ZIP is automatically emailed to all admin accounts on the 1st. Requires{" "}
            <code className="bg-orange-100 rounded px-1">SMTP_HOST</code>,{" "}
            <code className="bg-orange-100 rounded px-1">SMTP_USER</code>,{" "}
            <code className="bg-orange-100 rounded px-1">SMTP_PASS</code>.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Month</label>
            <select value={trigMonth} onChange={e => setTrigMonth(Number(e.target.value))}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none text-slate-700">
              {MONTH_OPTIONS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Year</label>
            <select value={trigYear} onChange={e => setTrigYear(Number(e.target.value))}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none text-slate-700">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <p className="text-[10px] text-center text-slate-500">
          Selected: <strong className="text-slate-700">{MONTH_OPTIONS.find(m => m.v === trigMonth)?.l} {trigYear}</strong>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleMonthDownload} disabled={monthDownloading}
            className="py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50">
            {monthDownloading ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
            Download
          </button>
          <button onClick={handleMonthEmail} disabled={emailing}
            className="py-2 text-xs font-bold text-white rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
            {emailing
              ? <><Loader2 size={11} className="animate-spin" /> Sending…</>
              : <><Mail size={11} /> Email Admins</>}
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
          <TrendingUp size={11} className="text-slate-400 shrink-0" />
          <p className="text-[10px] text-slate-500">Next auto-run: <strong className="text-slate-700">{nextExport}</strong></p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {Header}

      {/* ════════════════════════════════════════
          MOBILE LAYOUT  (hidden on sm+)
      ════════════════════════════════════════ */}
      <div className="sm:hidden flex flex-col">

        {/* ── BULK TAB ── */}
        {mobileTab === "bulk" && (
          <>
            {/* Filter bar */}
            <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search receipts…"
                  className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
                {searchQ && (
                  <button onClick={() => setSearchQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <X size={12} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors shrink-0"
                style={showFilters ? { background: NAVY, borderColor: NAVY } : { borderColor: "#e2e8f0", color: "#94a3b8" }}>
                <Filter size={14} className={showFilters ? "text-white" : ""} />
              </button>
            </div>

            {/* Expandable filter panel */}
            {showFilters && (
              <div className="bg-white border-b border-slate-100 px-4 py-3 space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Quick Range</p>
                  <div className="flex flex-wrap gap-1.5">
                    {([["Today","today"],["Week","week"],["Month","month"],["Last Month","lastMonth"]] as const).map(([l,v]) => (
                      <button key={v} onClick={() => setQuickRange(v)}
                        className="text-[10px] px-3 py-1.5 rounded-full border font-medium transition-all"
                        style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
                        {l}
                      </button>
                    ))}
                  </div>
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
                    {usersOverview.map((u: any) => (
                      <option key={u.userId} value={String(u.userId)}>
                        {u.fullName ? `${u.fullName} (@${u.username})` : `@${u.username}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={11} className="text-slate-400" />
                </div>
                <button onClick={handlePreview} disabled={previewing || !startDate || !endDate}
                  className="w-full py-2.5 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
                  {previewing ? <><Loader2 size={13} className="animate-spin" /> Searching…</> : <><Search size={13} /> Preview Receipts</>}
                </button>
              </div>
            )}

            {/* Bulk action bar */}
            {selected.size > 0 && preview && (
              <div className="bg-[#0b2c60]/5 border-b border-[#0b2c60]/15 px-4 py-2.5 flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: NAVY }}>
                  <Hash size={9} className="text-white" />
                </div>
                <span className="text-xs font-semibold flex-1 min-w-0 truncate" style={{ color: NAVY }}>
                  {selected.size} selected · ₹{selTotal.toLocaleString("en-IN")}
                </span>
                <button onClick={() => setSelected(new Set())} className="text-slate-400 p-1"><X size={12} /></button>
              </div>
            )}

            {/* No preview yet */}
            {!preview ? (
              <div className="flex flex-col items-center text-center gap-3 py-16 px-6 text-slate-400">
                <FileArchive size={36} className="opacity-30" />
                <p className="text-sm font-semibold text-slate-500">How it works</p>
                <ol className="text-xs text-slate-400 space-y-2 text-left list-none max-w-xs">
                  <li className="flex gap-2"><span className="font-bold" style={{ color: NAVY }}>1.</span> Tap the filter icon to set a date range</li>
                  <li className="flex gap-2"><span className="font-bold" style={{ color: NAVY }}>2.</span> Preview to see how many receipts will be exported</li>
                  <li className="flex gap-2"><span className="font-bold" style={{ color: NAVY }}>3.</span> Download as ZIP — each receipt is a separate named PDF</li>
                </ol>
                {!showFilters && (
                  <button onClick={() => setShowFilters(true)}
                    className="mt-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
                    Open Filters
                  </button>
                )}
              </div>
            ) : preview.count === 0 ? (
              <div className="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                <AlertCircle size={28} className="text-amber-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-amber-700">No receipts found</p>
                <p className="text-xs text-amber-600 mt-1">Adjust dates and try again.</p>
              </div>
            ) : (
              <>
                {/* Select all */}
                <div className="bg-white border-b border-slate-100 px-4 py-2.5 flex items-center gap-2">
                  <Cb checked={selected.size === filteredEntries.length && filteredEntries.length > 0} onChange={toggleAll} />
                  <span className="text-xs text-slate-500 flex-1">Select all ({filteredEntries.length})</span>
                  <span className="text-xs font-bold text-emerald-600">
                    ₹{filteredEntries.reduce((s,e) => s+e.amount,0).toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Receipt cards */}
                <div className="divide-y divide-slate-100 pb-24">
                  {filteredEntries.map((e) => (
                    <div key={e.receiptNumber} className="bg-white">
                      <div className="flex items-center px-4 py-3.5 gap-3 active:bg-slate-50"
                        onClick={() => setExpandedEntry(expandedEntry === e.receiptNumber ? null : e.receiptNumber)}>
                        <div onClick={ev => { ev.stopPropagation(); toggleEntry(e.receiptNumber); }}>
                          <Cb checked={selected.has(e.receiptNumber)} onChange={() => toggleEntry(e.receiptNumber)} size={16} />
                        </div>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs text-white font-bold shrink-0"
                          style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
                          {e.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-800 truncate">{e.customerName}</span>
                            <span className={`text-sm font-bold shrink-0 ${e.type==="credit" ? "text-emerald-600" : "text-rose-500"}`}>
                              {e.type==="credit" ? "+" : "-"}₹{e.amount.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                              {e.receiptNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">{fmtDateShort(e.date)}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{e.serviceType}</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 shrink-0 transition-transform"
                          style={expandedEntry === e.receiptNumber ? { transform: "rotate(90deg)", color: NAVY } : {}} />
                      </div>

                      {/* Inline receipt preview */}
                      {expandedEntry === e.receiptNumber && (
                        <div className="px-4 pb-4">
                          <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                            <div className="py-3 px-4 text-center" style={{ background: NAVY }}>
                              <p className="text-[11px] font-black text-white tracking-[0.2em]">
                                SAHU <span style={{ color: SAFFRON }}>CSC</span>
                              </p>
                              <p className="text-[9px] text-white/40 mt-0.5">Common Service Center, Odisha</p>
                            </div>
                            <div className="bg-slate-50 px-4 py-3 space-y-2">
                              {[
                                ["Receipt #", e.receiptNumber],
                                ["Date",      fmtDate(e.date)],
                                ["Customer",  e.customerName],
                                ["Service",   e.serviceType],
                              ].map(([k, v]) => (
                                <div key={k} className="flex justify-between text-xs">
                                  <span className="text-slate-400">{k}</span>
                                  <span className="font-semibold text-slate-700 text-right max-w-[200px] truncate">{v}</span>
                                </div>
                              ))}
                              <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-700">Total Paid</span>
                                <span className={`text-lg font-extrabold ${e.type==="credit" ? "text-emerald-600" : "text-rose-500"}`}>
                                  {e.type==="credit" ? "+" : "-"}₹{e.amount.toLocaleString("en-IN")}
                                </span>
                              </div>
                              <div className="flex justify-center py-1">
                                <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center">
                                  <QrCode size={32} className="text-slate-300" />
                                </div>
                              </div>
                              <p className="text-[9px] text-center text-slate-300">Scan to verify</p>
                            </div>
                            <div className="grid grid-cols-3 border-t border-slate-100 divide-x divide-slate-100">
                              {[{icon:Printer,label:"Print"},{icon:Download,label:"PDF"},{icon:Share2,label:"Share"}].map(({icon:Icon,label}) => (
                                <button key={label} className="flex flex-col items-center gap-1 py-2.5 bg-white hover:bg-slate-50 text-slate-500">
                                  <Icon size={13} /><span className="text-[10px] font-medium">{label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Sticky bottom CTA */}
            {preview && preview.count > 0 && (
              <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 px-4 py-3 shadow-lg z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">
                    {selected.size > 0 ? `${selected.size} selected` : `${filteredEntries.length} receipts`}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    ₹{(selected.size > 0 ? selTotal : filteredEntries.reduce((s,e) => s+e.amount,0)).toLocaleString("en-IN")}
                  </span>
                </div>
                <button onClick={handleDownload} disabled={downloading}
                  className="w-full py-3 text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}>
                  {downloading
                    ? <><Loader2 size={16} className="animate-spin" /> Generating ZIP…</>
                    : <><Download size={16} /> Download {selected.size > 0 ? selected.size : filteredEntries.length} PDF{filteredEntries.length !== 1 ? "s" : ""} as ZIP</>}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── MONTHLY TAB (mobile) ── */}
        {mobileTab === "monthly" && (
          <div className="px-4 py-5 space-y-4 pb-8">
            <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}>
                <Clock size={14} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-orange-800">Automatic Monthly Export</p>
                <p className="text-[11px] text-orange-600 mt-0.5 leading-relaxed">
                  A ZIP of all receipts is automatically emailed to admin accounts on the 1st of every month.
                </p>
                <p className="text-[10px] text-orange-500 mt-1.5 font-medium">Next auto-run: {nextExport}</p>
              </div>
            </div>
            {MonthlySection}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
          DESKTOP LAYOUT  (hidden on mobile)
      ════════════════════════════════════════ */}
      <div className="hidden sm:block">
        <div className="max-w-[1200px] mx-auto px-6 py-5 flex gap-5">

          {/* ── LEFT: Filter + Table ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Filter bar */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-wrap items-center gap-2.5">
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
              <div className="flex flex-wrap gap-1.5">
                {([["Today","today"],["Week","week"],["Month","month"],["Last Month","lastMonth"]] as const).map(([l,v]) => (
                  <button key={v} onClick={() => setQuickRange(v)}
                    className="text-[10px] px-2.5 py-1 rounded-full border border-slate-200 font-medium text-slate-500 hover:border-[#0b2c60] hover:text-[#0b2c60] transition-colors">
                    {l}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 cursor-pointer hover:border-slate-300">
                <User size={12} className="text-slate-400" />
                <select value={userId} onChange={e => { setUserId(e.target.value); setPreview(null); }}
                  className="bg-transparent text-xs text-slate-600 focus:outline-none cursor-pointer">
                  <option value="all">All Operators</option>
                  {usersOverview.map((u: any) => (
                    <option key={u.userId} value={String(u.userId)}>
                      {u.fullName ? `${u.fullName} (@${u.username})` : `@${u.username}`}
                    </option>
                  ))}
                </select>
                <ChevronDown size={11} className="text-slate-400" />
              </div>
              <button onClick={handlePreview} disabled={previewing || !startDate || !endDate}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-50 h-9 ml-auto"
                style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
                {previewing ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                {previewing ? "Searching…" : "Preview Receipts"}
              </button>
            </div>

            {/* Bulk action bar */}
            {selected.size > 0 && preview && (
              <div className="rounded-xl px-4 py-2.5 flex items-center gap-3 border" style={{ background: `${NAVY}08`, borderColor: `${NAVY}25` }}>
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: NAVY }}>
                  <Hash size={10} className="text-white" />
                </div>
                <span className="text-xs font-semibold" style={{ color: NAVY }}>
                  {selected.size} selected · ₹{selTotal.toLocaleString("en-IN")}
                </span>
                <div className="flex-1" />
                <button onClick={() => setSelected(new Set())} className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1">
                  <X size={11} /> Clear
                </button>
                <button onClick={handleDownload} disabled={downloading}
                  className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}>
                  {downloading
                    ? <><Loader2 size={11} className="animate-spin" /> Generating…</>
                    : <><Download size={11} /> Download {selected.size} PDF{selected.size!==1?"s":""} as ZIP</>}
                </button>
              </div>
            )}

            {/* Empty / no-preview state */}
            {!preview ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
                <div className="flex flex-col items-center text-center gap-3 py-14 px-6 text-slate-400">
                  <FileArchive size={36} className="opacity-30" />
                  <p className="text-sm font-semibold text-slate-500">How it works</p>
                  <ol className="text-xs text-slate-400 space-y-1 text-left list-none max-w-xs">
                    <li className="flex gap-2"><span className="font-bold" style={{ color: NAVY }}>1.</span> Choose a date range and optional operator filter above</li>
                    <li className="flex gap-2"><span className="font-bold" style={{ color: NAVY }}>2.</span> Click <em>Preview Receipts</em> to see how many will be exported</li>
                    <li className="flex gap-2"><span className="font-bold" style={{ color: NAVY }}>3.</span> Click <em>Download as ZIP</em> — each receipt is a separately named PDF</li>
                  </ol>
                </div>
              </div>
            ) : preview.count === 0 ? (
              <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-6 text-center">
                <AlertCircle size={28} className="text-amber-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-amber-700">No receipts found</p>
                <p className="text-xs text-amber-600 mt-1">No receipts with receipt numbers exist for the selected range. Adjust dates and try again.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Table header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <div className="relative max-w-xs flex-1">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                      placeholder="Filter by receipt, customer, service…"
                      className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">{filteredEntries.length} receipts</span>
                    <span className="text-xs font-bold text-emerald-600">
                      ₹{displayedEntries.reduce((s,e) => s+e.amount,0).toLocaleString("en-IN")}
                    </span>
                    {preview.count > displayedEntries.length && (
                      <span className="text-[10px] text-slate-400">· {preview.count - displayedEntries.length} more not shown</span>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="px-4 py-2.5 w-8">
                          <Cb checked={selected.size===filteredEntries.length && filteredEntries.length>0} onChange={toggleAll} />
                        </th>
                        {["Receipt #","Date","Customer","Service","Amount","Actions"].map((h,i) => (
                          <th key={h} className={`px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap ${i>=4?"text-right":"text-left"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((e) => (
                        <tr key={e.receiptNumber}
                          className="border-t border-slate-50 transition-colors cursor-pointer hover:bg-slate-50/60"
                          style={expandedEntry===e.receiptNumber ? { background:`${NAVY}06` } : {}}>
                          <td className="px-4 py-3" onClick={ev => { ev.stopPropagation(); toggleEntry(e.receiptNumber); }}>
                            <Cb checked={selected.has(e.receiptNumber)} onChange={() => toggleEntry(e.receiptNumber)} />
                          </td>
                          <td className="px-3 py-3" onClick={() => setExpandedEntry(expandedEntry===e.receiptNumber ? null : e.receiptNumber)}>
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md"
                              style={expandedEntry===e.receiptNumber ? { background:NAVY, color:"#fff" } : { background:"#f1f5f9", color:"#475569" }}>
                              {e.receiptNumber}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-[11px] text-slate-400 whitespace-nowrap" onClick={() => setExpandedEntry(expandedEntry===e.receiptNumber ? null : e.receiptNumber)}>
                            {fmtDateShort(e.date)}
                          </td>
                          <td className="px-3 py-3" onClick={() => setExpandedEntry(expandedEntry===e.receiptNumber ? null : e.receiptNumber)}>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0"
                                style={{ background:`linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
                                {e.customerName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-medium text-slate-800 truncate max-w-[100px]">{e.customerName}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-[11px] text-slate-500 max-w-[120px] truncate" onClick={() => setExpandedEntry(expandedEntry===e.receiptNumber ? null : e.receiptNumber)}>
                            {e.serviceType}
                          </td>
                          <td className="px-3 py-3 text-right whitespace-nowrap" onClick={() => setExpandedEntry(expandedEntry===e.receiptNumber ? null : e.receiptNumber)}>
                            <span className={`text-sm font-bold ${e.type==="credit" ? "text-emerald-600" : "text-rose-500"}`}>
                              {e.type==="credit" ? "+" : "-"}₹{e.amount.toLocaleString("en-IN")}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right" onClick={ev => ev.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              {[Eye, Printer, Share2].map((Icon, i) => (
                                <button key={i} className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                                  <Icon size={11} />
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {fmtDate(startDate)} → {fmtDate(endDate)}
                    {userId !== "all" && (() => {
                      const u = usersOverview.find((x: any) => String(x.userId) === userId) as any;
                      return u ? ` · @${u.username}` : "";
                    })()}
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    ₹{displayedEntries.reduce((s,e) => s+e.amount,0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Export + Preview + Monthly panels ── */}
          <div className="w-[280px] shrink-0 space-y-4">

            {/* Bulk ZIP Export Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-2.5" style={{ background:`linear-gradient(135deg, ${NAVY}, #1a3d80)` }}>
                <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center">
                  <FileArchive size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Bulk ZIP Export</p>
                  <p className="text-[10px] text-white/50">PDFs by date range</p>
                </div>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="rounded-lg border px-3 py-2.5 flex items-start gap-2" style={{ background:`${NAVY}05`, borderColor:`${NAVY}15` }}>
                  <FileText size={12} className="mt-0.5 shrink-0" style={{ color:NAVY }} />
                  <p className="text-[10px] leading-relaxed" style={{ color:NAVY }}>
                    Use the filters to choose a date range, preview the receipts, then download all as a ZIP of individual PDFs.
                  </p>
                </div>
                {preview && preview.count > 0 ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-emerald-700">{preview.count} PDF{preview.count!==1?"s":""}</p>
                      <p className="text-[10px] text-emerald-600">Ready to download as ZIP</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-400">No results yet</p>
                      <p className="text-[10px] text-slate-400">Preview receipts first</p>
                    </div>
                  </div>
                )}
                <button onClick={handleDownload} disabled={downloading || !preview || preview.count===0}
                  className="w-full py-2.5 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background:`linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}>
                  {downloading
                    ? <><Loader2 size={14} className="animate-spin" /> Generating ZIP…</>
                    : <><Download size={14} /> Download as ZIP</>}
                </button>
                {preview && preview.count > 0 && (
                  <p className="text-center text-[10px] text-slate-400">
                    e.g. <code className="bg-slate-100 rounded px-1">{preview.entries[0]?.receiptNumber ?? "CSC-2026-0001"}.pdf</code>
                  </p>
                )}
              </div>
            </div>

            {/* Receipt preview (expands when row clicked) */}
            {expandedEntry && (() => {
              const e = filteredEntries.find(x => x.receiptNumber === expandedEntry);
              if (!e) return null;
              return (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-2.5 flex items-center gap-2 bg-slate-700">
                    <Eye size={12} className="text-white/60" />
                    <span className="text-xs font-semibold text-white">Receipt Preview</span>
                  </div>
                  <div className="p-3">
                    <div className="border border-dashed border-slate-200 rounded-lg overflow-hidden">
                      <div className="py-2.5 px-3 text-center" style={{ background:NAVY }}>
                        <p className="text-[10px] font-black text-white tracking-[0.2em]">SAHU <span style={{ color:SAFFRON }}>CSC</span></p>
                        <p className="text-[8px] text-white/40 mt-0.5">Common Service Center, Odisha</p>
                      </div>
                      <div className="px-3 py-2.5 bg-slate-50/50 space-y-1.5">
                        {[["Receipt #",e.receiptNumber],["Date",fmtDate(e.date)],["Customer",e.customerName],["Service",e.serviceType]].map(([k,v]) => (
                          <div key={k} className="flex justify-between text-[10px]">
                            <span className="text-slate-400">{k}</span>
                            <span className="font-semibold text-slate-700 text-right max-w-[130px] truncate">{v}</span>
                          </div>
                        ))}
                        <div className="border-t border-dashed border-slate-200 pt-2 mt-1 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-700">Total Paid</span>
                          <span className={`text-sm font-extrabold ${e.type==="credit" ? "text-emerald-600" : "text-rose-500"}`}>
                            {e.type==="credit" ? "+" : "-"}₹{e.amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex justify-center pt-1">
                          <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded flex items-center justify-center">
                            <QrCode size={24} className="text-slate-300" />
                          </div>
                        </div>
                        <p className="text-[8px] text-center text-slate-300">Scan to verify</p>
                      </div>
                    </div>
                    <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                      {[{icon:Printer,label:"Print"},{icon:Download,label:"PDF"},{icon:Share2,label:"Share"}].map(({icon:Icon,label}) => (
                        <button key={label} className="flex flex-col items-center gap-1 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500">
                          <Icon size={12} /><span className="text-[9px] font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Monthly Auto-Export */}
            {MonthlySection}
          </div>
        </div>
      </div>
    </div>
  );
}
