import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Download, FileText, FileSpreadsheet, Search, Filter,
  Calendar, Eye, Printer, CheckSquare, Square, ChevronDown,
  Receipt, IndianRupee, X, Check,
  ArrowDownToLine, Share2, QrCode, Clock, Mail,
  FileArchive, Loader2, TrendingUp,
  AlertCircle, ChevronRight, User,
  SlidersHorizontal, Hash,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReceiptModal } from "@/components/receipt-modal";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const NAVY    = "#0b2c60";
const SAFFRON = "#f97316";

const MONTH_OPTIONS = [
  { v: 1,  l: "January" },  { v: 2,  l: "February" }, { v: 3,  l: "March" },
  { v: 4,  l: "April" },    { v: 5,  l: "May" },       { v: 6,  l: "June" },
  { v: 7,  l: "July" },     { v: 8,  l: "August" },    { v: 9,  l: "September" },
  { v: 10, l: "October" },  { v: 11, l: "November" },  { v: 12, l: "December" },
];

// ── Types ─────────────────────────────────────────────────────────────────────
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

interface FullReceiptEntry {
  id: number;
  date: string;
  customerName: string;
  serviceType: string;
  credit: number;
  debit: number;
  description: string | null;
  balance: number;
  receiptNumber: string | null;
  receiptToken: string | null;
  createdByName: string | null;
  createdAt: string;
}

interface BusinessInfo {
  businessName: string;
  businessAddress: string;
  businessMobile: string;
  businessWebsite: string;
}

type ModalAction = "print" | "download" | "share" | "whatsapp" | null;
type MobileTab   = "receipts" | "byDate" | "summary" | "export";

interface UserOverview {
  userId: number;
  username: string;
  fullName: string | null;
  role: string;
  isActive: boolean;
  balance: number;
  totalCredits: number;
  totalDebits: number;
  totalTransactions: number;
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function Checkbox({ checked, onChange, size = 16 }: { checked: boolean; onChange: () => void; size?: number }) {
  return (
    <button onClick={onChange} className="shrink-0">
      {checked
        ? <CheckSquare size={size} color={NAVY} />
        : <Square     size={size} className="text-slate-300" />}
    </button>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDateShort(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Page component ────────────────────────────────────────────────────────────
export default function ReceiptExport() {
  const now          = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const today        = now.toISOString().split("T")[0];

  const { toast }   = useToast();
  const isMobile    = useIsMobile();

  // ── Shared filter state ──
  const [startDate,   setStartDate]   = useState(firstOfMonth);
  const [endDate,     setEndDate]     = useState(today);
  const [userId,      setUserId]      = useState("all");
  const [searchQ,     setSearchQ]     = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange,   setDateRange]   = useState("month");

  // ── Results state ──
  const [preview,       setPreview]       = useState<CountResult | null>(null);
  const [previewing,    setPreviewing]    = useState(false);
  const [downloading,   setDownloading]   = useState(false);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  // ── Mobile-specific state ──
  const [mobileTab,   setMobileTab]   = useState<MobileTab>("receipts");
  const [showPreview, setShowPreview] = useState(false);
  const [activeEntry, setActiveEntry] = useState<PreviewEntry | null>(null);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [exported,    setExported]    = useState(false);

  // ── Monthly export state ──
  const [trigMonth,        setTrigMonth]        = useState(now.getMonth() === 0 ? 12 : now.getMonth());
  const [trigYear,         setTrigYear]         = useState(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
  const [emailing,         setEmailing]         = useState(false);
  const [monthDownloading, setMonthDownloading] = useState(false);

  // ── Single-receipt action modal ──
  const [modalOpen,       setModalOpen]       = useState(false);
  const [modalEntry,      setModalEntry]      = useState<FullReceiptEntry | null>(null);
  const [modalAction,     setModalAction]     = useState<ModalAction>(null);
  const [modalLoadingFor, setModalLoadingFor] = useState<string | null>(null);
  const [business, setBusiness] = useState<BusinessInfo>({
    businessName: "SAHU CSC Center", businessAddress: "", businessMobile: "", businessWebsite: "",
  });

  // ── Data: users list for operator filter ──
  const { data: usersOverview = [] } = useQuery<UserOverview[]>({
    queryKey: ["admin", "users-overview"],
    queryFn:  () => customFetch<UserOverview[]>("/api/admin/users-overview"),
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const openReceiptAction = async (receiptNumber: string, action: ModalAction = null) => {
    setModalLoadingFor(receiptNumber);
    try {
      const data = await customFetch<FullReceiptEntry & { business: BusinessInfo }>(
        `/api/admin/receipts/single/${encodeURIComponent(receiptNumber)}`
      );
      setBusiness(data.business);
      setModalEntry(data);
      setModalAction(action);
      setModalOpen(true);
    } catch (err: unknown) {
      toast({ title: "Could not load receipt", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setModalLoadingFor(null);
    }
  };

  const setQuickRange = (preset: "today" | "week" | "month" | "lastMonth" | "year") => {
    const n = new Date();
    let start: Date;
    let end = new Date(n);
    switch (preset) {
      case "today":     start = new Date(n); break;
      case "week":      start = new Date(n); start.setDate(start.getDate() - 6); break;
      case "month":     start = new Date(n.getFullYear(), n.getMonth(), 1); break;
      case "lastMonth":
        start = new Date(n.getFullYear(), n.getMonth() - 1, 1);
        end   = new Date(n.getFullYear(), n.getMonth(), 0);
        break;
      case "year":      start = new Date(n.getFullYear(), 0, 1); break;
      default:          start = new Date(n);
    }
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    setPreview(null); setSelected(new Set()); setExpandedEntry(null);
  };

  const buildParams = () => {
    const p = new URLSearchParams({ startDate, endDate });
    if (userId !== "all") p.set("userId", userId);
    return p.toString();
  };

  const handlePreview = async () => {
    if (!startDate || !endDate) { toast({ title: "Select both dates", variant: "destructive" }); return; }
    if (startDate > endDate)    { toast({ title: "Start date must be before end date", variant: "destructive" }); return; }
    setPreviewing(true); setPreview(null); setSelected(new Set()); setExpandedEntry(null);
    try {
      const data: CountResult = await customFetch(`/api/admin/receipts/bulk-export/count?${buildParams()}`);
      setPreview(data);
      if (data.entries.length > 0) setSelected(new Set(data.entries.map(e => e.receiptNumber)));
    } catch (err: unknown) {
      toast({ title: "Preview failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally { setPreviewing(false); }
  };

  const handleDownload = async () => {
    if (!preview || preview.count === 0) { toast({ title: "No receipts to download", variant: "destructive" }); return; }
    if (selected.size === 0) { toast({ title: "Nothing selected", description: "Select at least one receipt to download.", variant: "destructive" }); return; }
    setDownloading(true);
    try {
      const params = new URLSearchParams(buildParams());
      params.set("receiptNumbers", Array.from(selected).join(","));
      const isExcel  = exportFormat === "excel";
      const endpoint = isExcel ? "/api/admin/receipts/bulk-export/excel" : "/api/admin/receipts/bulk-export/download";
      const res  = await fetch(`${endpoint}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Download failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `receipts-${startDate}-to-${endDate}.${isExcel ? "xlsx" : "zip"}`; a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Download started",
        description: isExcel
          ? `${selected.size} receipt${selected.size !== 1 ? "s" : ""} in Excel sheet`
          : `${selected.size} PDF receipt${selected.size !== 1 ? "s" : ""} in ZIP`,
      });
      setExported(true); setTimeout(() => setExported(false), 2000);
    } catch (err: unknown) {
      toast({ title: "Download failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally { setDownloading(false); }
  };

  const handleMonthDownload = async () => {
    setMonthDownloading(true);
    try {
      const res  = await fetch(`/api/admin/receipts/monthly-export/download?year=${trigYear}&month=${trigMonth}`, { credentials: "include" });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `receipts-${trigYear}-${String(trigMonth).padStart(2, "0")}.zip`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded!", description: `ZIP for ${MONTH_OPTIONS.find(m => m.v === trigMonth)?.l} ${trigYear} saved.` });
    } catch { toast({ title: "Download failed", variant: "destructive" }); }
    finally  { setMonthDownloading(false); }
  };

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
    } catch (err: unknown) {
      toast({ title: "Failed to send", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally { setEmailing(false); }
  };

  // ── Derived values ────────────────────────────────────────────────────────────
  const displayedEntries  = preview?.entries ?? [];
  const filteredEntries   = displayedEntries.filter(e =>
    e.customerName.toLowerCase().includes(searchQ.toLowerCase())  ||
    e.receiptNumber.toLowerCase().includes(searchQ.toLowerCase()) ||
    e.serviceType.toLowerCase().includes(searchQ.toLowerCase())
  );
  const selTotal    = filteredEntries.filter(e => selected.has(e.receiptNumber)).reduce((s, e) => s + e.amount, 0);
  const totalAmount = displayedEntries.reduce((s, e) => s + e.amount, 0);
  const allFilteredSelected = filteredEntries.length > 0 && filteredEntries.every(e => selected.has(e.receiptNumber));

  const toggleAll = () => {
    if (allFilteredSelected) {
      const next = new Set(selected);
      filteredEntries.forEach(e => next.delete(e.receiptNumber));
      setSelected(next);
    } else {
      const next = new Set(selected);
      filteredEntries.forEach(e => next.add(e.receiptNumber));
      setSelected(next);
    }
  };
  const toggleEntry = (id: string) => {
    const s = new Set(selected); if (s.has(id)) s.delete(id); else s.add(id); setSelected(s);
  };

  const nextExport = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 5, 0)
    .toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  // ══════════════════════════════════════════════════════════
  //  MONTHLY PANEL — shared between both layouts
  // ══════════════════════════════════════════════════════════
  const MonthlyPanel = (
    <div className="bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden">
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
            ZIP is automatically emailed to admin accounts on the 1st.
            Requires <code className="bg-orange-100 rounded px-1">SMTP_HOST</code>,{" "}
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

  // ══════════════════════════════════════════════════════════
  //  DESKTOP LAYOUT  (≥768px — within <Layout>)
  // ══════════════════════════════════════════════════════════
  const DesktopContent = (
    <div className="space-y-5">

      {/* ── Stat bar ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Receipts",  value: preview ? String(preview.count) : "—",
            icon: Receipt,         bg: NAVY,         iconBg: "bg-white/15" },
          { label: "Total Amount",    value: preview ? `₹${totalAmount.toLocaleString("en-IN")}` : "—",
            icon: IndianRupee,     bg: "#059669",    iconBg: "bg-white/15" },
          { label: "Credit Entries",  value: preview ? String(displayedEntries.filter(e => e.type === "credit").length) : "—",
            icon: TrendingUp,      bg: SAFFRON,      iconBg: "bg-white/15" },
          { label: "Selected",        value: String(selected.size),
            icon: ArrowDownToLine, bg: "#7c3aed",    iconBg: "bg-white/15" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3.5 text-white flex items-center gap-3" style={{ background: s.bg }}>
            <div className={`${s.iconBg} w-9 h-9 rounded-lg flex items-center justify-center shrink-0`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{s.value}</p>
              <p className="text-[11px] text-white/70 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-column body ── */}
      <div className="flex gap-5 items-start">

        {/* ── Left: Filter bar + bulk bar + table ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Filter bar */}
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
                  <button key={v} onClick={() => { setQuickRange(v); setDateRange(v); }}
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
            <button onClick={handlePreview} disabled={previewing || !startDate || !endDate}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-50 h-9 ml-auto"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
              {previewing ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
              {previewing ? "Searching…" : "Preview Receipts"}
            </button>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && preview && (
            <div className="bg-[#0b2c60]/5 border border-[#0b2c60]/20 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: NAVY }}>
                <Hash size={9} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-[#0b2c60]">{selected.size} selected · ₹{selTotal.toLocaleString("en-IN")}</span>
              <div className="flex-1" />
              <button onClick={() => setSelected(new Set())} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
                <X size={12} /> Clear
              </button>
              <button onClick={handleDownload} disabled={downloading}
                className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                style={{ background: SAFFRON }}>
                {downloading
                  ? <><Loader2 size={12} className="animate-spin" /> Generating…</>
                  : <><Download size={12} /> Download {selected.size} ZIP</>}
              </button>
            </div>
          )}

          {/* Table / empty state */}
          {!preview ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
              <div className="flex flex-col items-center text-center gap-3 py-16 px-6 text-slate-400">
                <FileArchive size={40} className="opacity-25" />
                <p className="text-sm font-semibold text-slate-500">How it works</p>
                <ol className="text-xs text-slate-400 space-y-2 text-left list-none max-w-xs">
                  <li className="flex gap-2"><span className="font-bold" style={{ color: NAVY }}>1.</span> Choose a date range and optional operator filter above</li>
                  <li className="flex gap-2"><span className="font-bold" style={{ color: NAVY }}>2.</span> Click Preview Receipts to see how many will be exported</li>
                  <li className="flex gap-2"><span className="font-bold" style={{ color: NAVY }}>3.</span> Download as ZIP — each receipt is a separately named PDF</li>
                </ol>
              </div>
            </div>
          ) : preview.count === 0 ? (
            <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-8 text-center">
              <AlertCircle size={32} className="text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-amber-700">No receipts found</p>
              <p className="text-xs text-amber-600 mt-1">Adjust dates and try again.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Table toolbar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="relative max-w-xs flex-1">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                    placeholder="Search receipts…"
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b2c60]/20" />
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">{filteredEntries.length} receipts</span>
                  <span className="text-xs font-bold text-emerald-600">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 w-8">
                      <Checkbox checked={allFilteredSelected} onChange={toggleAll} />
                    </th>
                    {["Receipt #", "Date", "Customer", "Service", "Amount", "Actions"].map((h, i) => (
                      <th key={h} className={`px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${i >= 4 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEntries.map((e) => (
                    <tr key={e.receiptNumber}
                      onClick={() => setExpandedEntry(expandedEntry === e.receiptNumber ? null : e.receiptNumber)}
                      className={`cursor-pointer transition-colors ${expandedEntry === e.receiptNumber ? "bg-[#0b2c60]/5" : "hover:bg-slate-50"}`}>
                      <td className="px-4 py-3" onClick={ev => { ev.stopPropagation(); toggleEntry(e.receiptNumber); }}>
                        <Checkbox checked={selected.has(e.receiptNumber)} onChange={() => toggleEntry(e.receiptNumber)} />
                      </td>
                      <td className="px-3 py-3">
                        <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${expandedEntry === e.receiptNumber ? "bg-[#0b2c60] text-white" : "bg-slate-100 text-slate-700"}`}>
                          {e.receiptNumber}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDateShort(e.date)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0"
                            style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
                            {e.customerName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-slate-800 truncate max-w-[110px]">{e.customerName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-500 max-w-[130px] truncate">{e.serviceType}</td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <span className={`text-sm font-bold ${e.type === "credit" ? "text-emerald-600" : "text-rose-500"}`}>
                          {e.type === "credit" ? "+" : "-"}₹{e.amount.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right" onClick={ev => ev.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {([
                            { Icon: Eye,     action: null as ModalAction },
                            { Icon: Printer, action: "print" as ModalAction },
                            { Icon: Share2,  action: "share" as ModalAction },
                          ] as const).map(({ Icon, action }, i) => (
                            <button key={i}
                              onClick={() => openReceiptAction(e.receiptNumber, action)}
                              disabled={modalLoadingFor === e.receiptNumber}
                              className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40">
                              {modalLoadingFor === e.receiptNumber ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} />}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs text-slate-500">{filteredEntries.length} receipts · {fmtDate(startDate)} → {fmtDate(endDate)}</span>
                <span className="text-sm font-bold text-emerald-600">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Export Options + Receipt Preview + Monthly ── */}
        <div className="w-[280px] shrink-0 space-y-4">

          {/* Export Options Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: NAVY }}>
              <ArrowDownToLine size={14} className="text-white/80" />
              <span className="text-sm font-semibold text-white">Export Options</span>
            </div>
            <div className="p-4 space-y-3">
              {/* Format toggle */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Format</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setExportFormat("pdf")}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border-2 text-xs font-medium transition-all ${exportFormat === "pdf" ? "border-[#f97316] bg-[#f97316]/5 text-[#f97316]" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                    <FileText size={18} />
                    PDF
                  </button>
                  <button onClick={() => setExportFormat("excel")}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border-2 text-xs font-medium transition-all ${exportFormat === "excel" ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                    <FileSpreadsheet size={18} />
                    Excel
                  </button>
                </div>
              </div>

              {/* Scope */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Scope</p>
                <div className="space-y-1.5">
                  {[
                    { label: "All Receipts",  sub: preview ? `${preview.count} receipts` : "Preview first" },
                    { label: "Selected Only", sub: `${selected.size} selected` },
                    { label: "Date Range",    sub: startDate && endDate ? `${fmtDate(startDate)} → ${fmtDate(endDate)}` : "Set dates above" },
                  ].map((opt, i) => (
                    <label key={opt.label} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${i === (selected.size > 0 ? 1 : 0) ? "border-[#0b2c60]" : "border-slate-300"}`}>
                        {i === (selected.size > 0 ? 1 : 0) && <div className="w-1.5 h-1.5 rounded-full bg-[#0b2c60]" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-700">{opt.label}</p>
                        <p className="text-[10px] text-slate-400">{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Include options */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Include</p>
                <div className="space-y-1.5">
                  {["QR Code", "Business Stamp", "Customer Signature Row"].map((opt, i) => (
                    <label key={opt} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${i < 2 ? "bg-[#0b2c60]" : "border border-slate-300"}`}>
                        {i < 2 && <Check size={9} className="text-white" />}
                      </div>
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* Primary export CTA */}
              <button onClick={handleDownload} disabled={downloading || !preview || preview.count === 0}
                className="w-full py-2.5 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                style={{ background: SAFFRON }}>
                {downloading
                  ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
                  : exported
                    ? <><Check size={14} /> Done!</>
                    : <><Download size={14} /> Export {selected.size > 0 ? selected.size : "All"}</>}
              </button>
              {!preview && (
                <p className="text-center text-[10px] text-slate-400">Preview receipts first to enable export</p>
              )}
            </div>
          </div>

          {/* Receipt preview mini-card (shown when a row is expanded) */}
          {expandedEntry && (() => {
            const e = filteredEntries.find(x => x.receiptNumber === expandedEntry);
            if (!e) return null;
            return (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-700 px-4 py-2.5 flex items-center gap-2">
                  <Eye size={13} className="text-white/70" />
                  <span className="text-xs font-semibold text-white">Receipt Preview</span>
                </div>
                <div className="p-4">
                  <div className="border border-dashed border-slate-200 rounded-lg p-3 bg-slate-50/50 text-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1.5" style={{ background: NAVY }}>
                      <Receipt size={14} className="text-white" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: NAVY }}>SAHU CSC</p>
                    <p className="text-[9px] text-slate-400 mb-2">Common Service Center, Odisha</p>
                    <div className="border-t border-dashed border-slate-200 pt-2 text-left space-y-1">
                      {[["Receipt #", e.receiptNumber], ["Date", fmtDate(e.date)], ["Customer", e.customerName], ["Service", e.serviceType]].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[10px]">
                          <span className="text-slate-500">{k}</span>
                          <span className="font-semibold text-slate-800 text-right max-w-[110px] truncate">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-dashed border-slate-200 mt-2 pt-2 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-800">Total Paid</span>
                      <span className={`text-sm font-bold ${e.type === "credit" ? "text-emerald-600" : "text-rose-500"}`}>
                        {e.type === "credit" ? "+" : "-"}₹{e.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="mt-2.5 flex justify-center">
                      <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded flex items-center justify-center">
                        <QrCode size={28} className="text-slate-400" />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">Scan to verify online</p>
                    <div className="mt-2 flex items-center gap-1 justify-center">
                      <div className="h-px flex-1 border-t border-dashed border-slate-200" />
                      <span className="text-[9px] text-slate-400">Thank you</span>
                      <div className="h-px flex-1 border-t border-dashed border-slate-200" />
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {([
                      { icon: Printer,  label: "Print",  action: "print"    as ModalAction },
                      { icon: Download, label: "PDF",    action: "download" as ModalAction },
                      { icon: Share2,   label: "Share",  action: "share"    as ModalAction },
                    ] as const).map(({ icon: Icon, label, action }) => (
                      <button key={label}
                        onClick={() => openReceiptAction(e.receiptNumber, action)}
                        disabled={modalLoadingFor === e.receiptNumber}
                        className="flex flex-col items-center gap-1 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 disabled:opacity-40">
                        {modalLoadingFor === e.receiptNumber ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />}
                        <span className="text-[10px] font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Monthly Auto-Export */}
          {MonthlyPanel}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════
  //  MOBILE LAYOUT  (<768px — within <Layout>)
  // ══════════════════════════════════════════════════════════

  // Mobile: single-receipt preview overlay
  const MobileReceiptPreview = activeEntry ? (
    <div>
      <button
        onClick={() => setShowPreview(false)}
        className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
        ← Back to list
      </button>
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100">
        <div className="px-5 py-5 text-center" style={{ background: NAVY }}>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Receipt size={22} className="text-white" />
          </div>
          <p className="text-white font-bold text-lg tracking-tight">SAHU CSC</p>
          <p className="text-white/60 text-xs mt-0.5">Common Service Center, Odisha</p>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-slate-100 -ml-2 shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-slate-200" />
          <div className="w-4 h-4 rounded-full bg-slate-100 -mr-2 shrink-0" />
        </div>
        <div className="px-5 pb-5 space-y-3">
          {[
            { label: "Receipt No.", value: activeEntry.receiptNumber, mono: true },
            { label: "Date",        value: fmtDate(activeEntry.date) },
            { label: "Customer",    value: activeEntry.customerName },
            { label: "Service",     value: activeEntry.serviceType },
          ].map(row => (
            <div key={row.label} className="flex items-start justify-between gap-3">
              <span className="text-xs text-slate-500 shrink-0 mt-0.5">{row.label}</span>
              <span className={`text-sm font-medium text-slate-800 text-right ${row.mono ? "font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-lg" : ""}`}>
                {row.value}
              </span>
            </div>
          ))}
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-slate-100 -ml-9 shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
            <div className="w-4 h-4 rounded-full bg-slate-100 -mr-9 shrink-0" />
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-base font-bold text-slate-800">Total Paid</span>
            <span className={`text-2xl font-bold ${activeEntry.type === "credit" ? "text-emerald-600" : "text-rose-500"}`}>
              {activeEntry.type === "credit" ? "+" : "-"}₹{activeEntry.amount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${activeEntry.type === "credit" ? "bg-emerald-400" : "bg-rose-400"}`} />
            <span className={`text-xs font-semibold ${activeEntry.type === "credit" ? "text-emerald-600" : "text-rose-500"}`}>
              {activeEntry.type === "credit" ? "Payment Confirmed" : "Debit Entry"}
            </span>
          </div>
          <div className="flex flex-col items-center py-3">
            <div className="w-24 h-24 bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
              <QrCode size={44} className="text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Scan to verify online</p>
          </div>
          <p className="text-center text-xs text-slate-400">Thank you for using SAHU CSC</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {([
          { icon: Printer,  label: "Print",  color: "bg-[#0b2c60] text-white", action: "print"    as ModalAction },
          { icon: Download, label: "PDF",    color: "bg-[#f97316] text-white", action: "download" as ModalAction },
          { icon: Share2,   label: "Share",  color: "bg-white text-slate-700 border border-slate-200", action: "share" as ModalAction },
        ] as const).map(({ icon: Icon, label, color, action }) => (
          <button key={label}
            onClick={() => openReceiptAction(activeEntry.receiptNumber, action)}
            disabled={modalLoadingFor === activeEntry.receiptNumber}
            className={`${color} rounded-2xl py-4 flex flex-col items-center gap-2 shadow-sm font-medium text-sm disabled:opacity-50`}>
            {modalLoadingFor === activeEntry.receiptNumber ? <Loader2 size={20} className="animate-spin" /> : <Icon size={20} />}
            {label}
          </button>
        ))}
      </div>
      <button
        onClick={() => openReceiptAction(activeEntry.receiptNumber, "whatsapp")}
        disabled={modalLoadingFor === activeEntry.receiptNumber}
        className="mt-3 w-full bg-[#25D366] text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold shadow-sm disabled:opacity-50">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        Send via WhatsApp
      </button>
    </div>
  ) : null;

  // Mobile tab definitions
  const mobileTabs = [
    { tab: "receipts" as MobileTab, icon: Receipt,         label: "Receipts" },
    { tab: "byDate"   as MobileTab, icon: Calendar,        label: "By Date"  },
    { tab: "summary"  as MobileTab, icon: TrendingUp,      label: "Summary"  },
    { tab: "export"   as MobileTab, icon: ArrowDownToLine, label: "Export"   },
  ] as const;

  const MobileContent = (
    <div className="space-y-3">

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total",    value: preview ? String(preview.count) : "—",                     icon: Receipt      },
          { label: "Amount",   value: preview ? `₹${totalAmount.toLocaleString("en-IN")}` : "—", icon: IndianRupee  },
          { label: "Selected", value: String(selected.size),                                      icon: CheckSquare  },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ background: NAVY }}>
            <s.icon size={14} color={SAFFRON} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-white leading-none truncate">{s.value}</p>
              <p className="text-[10px] text-white/50 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Page-specific tab pills ── */}
      {!showPreview && (
        <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1">
          {mobileTabs.map(({ tab, icon: Icon, label }) => {
            const active = mobileTab === tab;
            return (
              <button key={tab} onClick={() => setMobileTab(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${active ? "bg-white text-[#0b2c60] shadow-sm" : "text-slate-400"}`}>
                <Icon size={13} />
                <span className="hidden xs:inline">{label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Preview overlay ── */}
      {showPreview && MobileReceiptPreview}

      {/* ══ RECEIPTS TAB ══ */}
      {!showPreview && mobileTab === "receipts" && (
        <div className="space-y-2">
          {/* Search + filter toggle */}
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

          {/* Expandable filter panel */}
          {showFilters && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex gap-1.5 flex-wrap">
                {(["today","week","month","lastMonth"] as const).map(v => {
                  const l = v === "today" ? "Today" : v === "week" ? "Week" : v === "month" ? "This Month" : "Last Month";
                  return (
                    <button key={v} onClick={() => { setQuickRange(v); setDateRange(v); }}
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
              <button onClick={() => { handlePreview(); setShowFilters(false); }} disabled={previewing || !startDate || !endDate}
                className="w-full py-2.5 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
                {previewing ? <><Loader2 size={14} className="animate-spin" /> Searching…</> : <><Search size={14} /> Preview Receipts</>}
              </button>
            </div>
          )}

          {/* Bulk bar */}
          {selected.size > 0 && preview && (
            <div className="bg-[#0b2c60]/5 border border-[#0b2c60]/20 rounded-2xl px-4 py-2.5 flex items-center gap-2">
              <span className="flex-1 text-xs font-semibold text-[#0b2c60]">{selected.size} selected · ₹{selTotal.toLocaleString("en-IN")}</span>
              <button onClick={() => setSelected(new Set())} className="p-1 text-slate-400"><X size={14} /></button>
              <button onClick={() => setMobileTab("export")}
                className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
                style={{ background: SAFFRON }}>
                <Download size={12} /> Export
              </button>
            </div>
          )}

          {/* Empty state */}
          {!preview ? (
            <div className="flex flex-col items-center justify-center text-center px-8 py-12">
              <FileArchive size={52} className="text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 mb-3">How it works</h3>
              <ol className="text-sm text-left space-y-3 mb-6 w-full max-w-xs">
                <li className="flex gap-3"><span className="font-bold shrink-0" style={{ color: SAFFRON }}>1.</span><span className="text-slate-500">Tap the filter icon to set a date range</span></li>
                <li className="flex gap-3"><span className="font-bold shrink-0" style={{ color: SAFFRON }}>2.</span><span className="text-slate-500">Preview to see matching receipts</span></li>
                <li className="flex gap-3"><span className="font-bold shrink-0" style={{ color: SAFFRON }}>3.</span><span className="text-slate-500">Download as ZIP — each receipt is a PDF</span></li>
              </ol>
              {!showFilters && (
                <button onClick={() => setShowFilters(true)}
                  className="px-8 py-3 text-sm font-semibold text-white rounded-2xl"
                  style={{ background: NAVY }}>
                  Open Filters
                </button>
              )}
            </div>
          ) : preview.count === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 text-center py-10">
              <AlertCircle size={36} className="text-amber-400 mb-2" />
              <p className="text-sm font-semibold text-amber-700">No receipts found</p>
              <p className="text-xs text-amber-600 mt-1">Adjust dates and try again.</p>
            </div>
          ) : (
            <div className="space-y-2 pb-2">
              {filteredEntries.map((e) => (
                <div key={e.receiptNumber}
                  onClick={() => { setActiveEntry(e); setShowPreview(true); }}
                  className={`bg-white rounded-2xl border shadow-sm active:scale-[0.98] transition-transform cursor-pointer ${selected.has(e.receiptNumber) ? "border-[#0b2c60]/30" : "border-slate-200"}`}>
                  <div className="p-4 flex items-center gap-3">
                    <div onClick={ev => { ev.stopPropagation(); toggleEntry(e.receiptNumber); }} className="p-1">
                      <Checkbox checked={selected.has(e.receiptNumber)} onChange={() => toggleEntry(e.receiptNumber)} size={18} />
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
                      {e.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800 truncate">{e.customerName}</p>
                        <span className={`text-sm font-bold shrink-0 ${e.type === "credit" ? "text-emerald-600" : "text-rose-500"}`}>
                          {e.type === "credit" ? "+" : "-"}₹{e.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{e.serviceType}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{e.receiptNumber}</span>
                        <span className="text-[10px] text-slate-400">{fmtDateShort(e.date)}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ BY DATE TAB ══ */}
      {!showPreview && mobileTab === "byDate" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Range</p>
            <div className="flex gap-2 flex-wrap">
              {(["today","week","month","lastMonth","year"] as const).map(v => {
                const l = v === "today" ? "Today" : v === "week" ? "This Week" : v === "month" ? "This Month" : v === "lastMonth" ? "Last Month" : "This Year";
                return (
                  <button key={v} onClick={() => { setQuickRange(v); setDateRange(v); }}
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
            <button onClick={() => { handlePreview(); setMobileTab("receipts"); }} disabled={previewing || !startDate || !endDate}
              className="w-full py-3 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
              {previewing ? <><Loader2 size={14} className="animate-spin" /> Searching…</> : <><Search size={14} /> Preview Receipts</>}
            </button>
          </div>
        </div>
      )}

      {/* ══ SUMMARY TAB ══ */}
      {!showPreview && mobileTab === "summary" && (
        <div className="space-y-3">
          {!preview ? (
            <div className="flex flex-col items-center justify-center text-center py-16">
              <TrendingUp size={40} className="text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-500">No data yet</p>
              <p className="text-xs text-slate-400 mt-1">Preview receipts first to see summary</p>
            </div>
          ) : (
            [
              { label: "Total Receipts", value: String(preview.count),                                                  icon: Receipt,         bg: NAVY         },
              { label: "Total Amount",   value: `₹${totalAmount.toLocaleString("en-IN")}`,                             icon: IndianRupee,     bg: "#059669"    },
              { label: "Credit Entries", value: String(displayedEntries.filter(e => e.type === "credit").length),       icon: TrendingUp,      bg: SAFFRON      },
              { label: "Debit Entries",  value: String(displayedEntries.filter(e => e.type === "debit").length),        icon: ArrowDownToLine, bg: "#7c3aed"    },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: s.bg }}>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <s.icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-white/70">{s.label}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══ EXPORT TAB ══ */}
      {!showPreview && mobileTab === "export" && (
        <div className="space-y-4 pb-4">
          {/* Scope summary */}
          <div className="border rounded-2xl px-4 py-3.5 flex items-center gap-3" style={{ background: "#0b2c6010", borderColor: "#0b2c6026" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: NAVY }}>
              <ArrowDownToLine size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: NAVY }}>
                {selected.size > 0 ? `${selected.size} receipts selected` : preview ? `Export all ${preview.count} receipts` : "No receipts previewed"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {selected.size > 0 ? `₹${selTotal.toLocaleString("en-IN")}` : preview ? `₹${totalAmount.toLocaleString("en-IN")}` : "Preview receipts first"}
              </p>
            </div>
          </div>

          {/* Format */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Format</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setExportFormat("pdf")}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${exportFormat === "pdf" ? "border-[#f97316] bg-[#f97316]/5" : "border-slate-200"}`}>
                <FileText size={24} className={exportFormat === "pdf" ? "text-[#f97316]" : "text-slate-400"} />
                <span className={`text-sm font-semibold ${exportFormat === "pdf" ? "text-[#f97316]" : "text-slate-500"}`}>PDF</span>
                <span className="text-[10px] text-slate-400">Printable receipt</span>
              </button>
              <button onClick={() => setExportFormat("excel")}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${exportFormat === "excel" ? "border-emerald-500 bg-emerald-50" : "border-slate-200"}`}>
                <FileSpreadsheet size={24} className={exportFormat === "excel" ? "text-emerald-600" : "text-slate-400"} />
                <span className={`text-sm font-semibold ${exportFormat === "excel" ? "text-emerald-600" : "text-slate-500"}`}>Excel</span>
                <span className="text-[10px] text-slate-400">Spreadsheet report</span>
              </button>
            </div>
          </div>

          {/* Scope radios */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Scope</p>
            <div className="space-y-2">
              {[
                { label: "All Receipts",  sub: preview ? `${preview.count} receipts · ₹${totalAmount.toLocaleString("en-IN")}` : "Preview first", active: selected.size === 0 && !!preview },
                { label: "Selected Only", sub: `${selected.size} selected · ₹${selTotal.toLocaleString("en-IN")}`, active: selected.size > 0 },
              ].map(opt => (
                <div key={opt.label} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${opt.active ? "bg-[#0b2c60]/5 border border-[#0b2c60]/20" : "bg-slate-50"}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${opt.active ? "border-[#0b2c60]" : "border-slate-300"}`}>
                    {opt.active && <div className="w-2 h-2 rounded-full bg-[#0b2c60]" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{opt.label}</p>
                    <p className="text-xs text-slate-500">{opt.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly section */}
          {MonthlyPanel}

          {/* Primary download CTA */}
          <button onClick={handleDownload} disabled={downloading || !preview || preview.count === 0}
            className="w-full py-4 text-white text-base font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50"
            style={{ background: SAFFRON, boxShadow: "0 4px 24px rgba(249,115,22,0.3)" }}>
            {downloading
              ? <><Loader2 size={18} className="animate-spin" /> Generating ZIP…</>
              : exported
                ? <><Check size={18} /> Exported!</>
                : <><Download size={18} /> Download {selected.size > 0 ? selected.size : preview?.count ?? "All"} as ZIP</>}
          </button>

          {!preview && (
            <p className="text-center text-xs text-slate-400">Go to Receipts tab and set a date range first</p>
          )}
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════
  //  RENDER — everything inside the shared <Layout>
  // ══════════════════════════════════════════════════════════
  return (
    <Layout>
      {isMobile ? MobileContent : DesktopContent}

      {/* Shared receipt modal — handles print / PDF / share / WhatsApp */}
      <ReceiptModal
        entry={modalEntry}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setModalAction(null); }}
        businessName={business.businessName}
        businessAddress={business.businessAddress}
        businessMobile={business.businessMobile}
        businessWebsite={business.businessWebsite}
        autoAction={modalAction}
        onAutoActionComplete={() => setModalAction(null)}
      />
    </Layout>
  );
}
