import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import {
  Download, FileText, Search, Calendar, User,
  CheckSquare, Square, ChevronDown, X, Check,
  ArrowDownToLine, Share2, QrCode, Clock, Mail,
  FileArchive, Loader2, Receipt, IndianRupee,
  AlertCircle, TrendingUp, Eye, Printer,
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

function Cb({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="shrink-0">
      {checked
        ? <CheckSquare size={15} className="text-[#0b2c60]" />
        : <Square size={15} className="text-slate-300" />}
    </button>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateShort(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

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

  /* ── Results state ── */
  const [preview, setPreview] = useState<CountResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewEntry, setPreviewEntry] = useState<PreviewEntry | null>(null);

  /* ── Monthly export state ── */
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
    setPreviewEntry(null);
  };

  const buildParams = () => {
    const p = new URLSearchParams({ startDate, endDate });
    if (userId !== "all") p.set("userId", userId);
    return p.toString();
  };

  /* ── Preview / count ── */
  const handlePreview = async () => {
    if (!startDate || !endDate) {
      toast({ title: "Select both dates", variant: "destructive" }); return;
    }
    if (startDate > endDate) {
      toast({ title: "Start date must be before end date", variant: "destructive" }); return;
    }
    setPreviewing(true);
    setPreview(null);
    setSelected(new Set());
    setPreviewEntry(null);
    try {
      const data: CountResult = await customFetch(`/api/admin/receipts/bulk-export/count?${buildParams()}`);
      setPreview(data);
      if (data.entries.length > 0) {
        setPreviewEntry(data.entries[0]);
        setSelected(new Set(data.entries.map(e => e.receiptNumber)));
      }
    } catch (err: unknown) {
      toast({ title: "Preview failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setPreviewing(false);
    }
  };

  /* ── Bulk download ── */
  const handleDownload = async () => {
    if (!preview || preview.count === 0) {
      toast({ title: "No receipts to download", variant: "destructive" }); return;
    }
    setDownloading(true);
    try {
      const res = await fetch(`/api/admin/receipts/bulk-export/download?${buildParams()}`, { credentials: "include" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipts-${startDate}-to-${endDate}.zip`;
      a.click();
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
      a.href = url;
      a.download = `receipts-${trigYear}-${String(trigMonth).padStart(2, "0")}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded!", description: `ZIP for ${MONTH_OPTIONS.find(m => m.v === trigMonth)?.l} ${trigYear} saved.` });
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    } finally {
      setMonthDownloading(false);
    }
  };

  /* ── Monthly email ── */
  const handleMonthEmail = async () => {
    setEmailing(true);
    try {
      const res = await fetch("/api/admin/receipts/monthly-export/trigger", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: trigYear, month: trigMonth }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed to send");
      const monthName = `${MONTH_OPTIONS.find(m => m.v === trigMonth)?.l} ${trigYear}`;
      toast({ title: "Email sent!", description: `Monthly export for ${monthName} emailed to all admins.` });
    } catch (err: any) {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" });
    } finally {
      setEmailing(false);
    }
  };

  /* ── Next auto-export date ── */
  const nextExport = (() => {
    const d = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 5, 0);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  })();

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
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Navy Header ──────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3d80 100%)` }}>
        {/* Saffron accent stripe */}
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${SAFFRON}, #fbbf24, ${SAFFRON})` }} />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/")}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={17} />
            </button>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}>
              <FileArchive size={17} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Bulk Receipt Export</h1>
              <p className="text-[11px] text-white/50">Download all receipts as a ZIP of individual PDFs</p>
            </div>
          </div>
          <span className="text-[10px] text-white/50 bg-white/10 border border-white/10 rounded-full px-3 py-1 hidden sm:block">Admin Only</span>
        </div>

        {/* ── Stat Strip ── */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-5 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Receipts",  value: preview ? String(preview.count) : "—", sub: "In selected range",  icon: Receipt,         gradient: "from-[#0b2c60] to-[#1a4a9e]" },
            { label: "Total Amount",    value: preview ? `₹${displayedEntries.reduce((s,e) => s + e.amount, 0).toLocaleString("en-IN")}` : "—", sub: "Receipts w/ amount", icon: IndianRupee,     gradient: "from-emerald-600 to-emerald-500" },
            { label: "Credit Entries",  value: preview ? String(displayedEntries.filter(e => e.type === "credit").length) : "—", sub: "Income receipts",    icon: TrendingUp,      gradient: "from-[#f97316] to-orange-400" },
            { label: "Pending Export",  value: preview ? String(preview.count) : "—", sub: "Ready to download",  icon: ArrowDownToLine, gradient: "from-violet-600 to-violet-500" },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.gradient} rounded-xl p-3.5 text-white flex items-center gap-3 shadow-md`}>
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                <s.icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-extrabold leading-none truncate">{s.value}</p>
                <p className="text-[10px] text-white/65 mt-0.5">{s.label}</p>
                <p className="text-[9px] text-white/35 mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5 flex flex-col lg:flex-row gap-5">

        {/* ── LEFT: Filter + Table ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Filter bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-wrap items-center gap-2.5">
            {/* Date pickers */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={e => { setStartDate(e.target.value); setPreview(null); }}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none text-slate-700 h-9"
                />
              </div>
              <span className="text-slate-300 text-xs">→</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={today}
                onChange={e => { setEndDate(e.target.value); setPreview(null); }}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none text-slate-700 h-9"
              />
            </div>

            {/* Quick range pills */}
            <div className="flex flex-wrap gap-1.5">
              {([["Today", "today"], ["Week", "week"], ["Month", "month"], ["Last Month", "lastMonth"]] as const).map(([l, v]) => (
                <button
                  key={v}
                  onClick={() => setQuickRange(v)}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-slate-200 font-medium text-slate-500 hover:border-[#0b2c60] hover:text-[#0b2c60] transition-colors"
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Operator filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 cursor-pointer hover:border-slate-300 transition-colors">
              <User size={12} className="text-slate-400" />
              <select
                value={userId}
                onChange={e => { setUserId(e.target.value); setPreview(null); }}
                className="bg-transparent text-xs text-slate-600 focus:outline-none cursor-pointer"
              >
                <option value="all">All Operators</option>
                {usersOverview.map((u: any) => (
                  <option key={u.userId} value={String(u.userId)}>
                    {u.fullName ? `${u.fullName} (@${u.username})` : `@${u.username}`}
                  </option>
                ))}
              </select>
              <ChevronDown size={11} className="text-slate-400" />
            </div>

            {/* Preview button */}
            <button
              onClick={handlePreview}
              disabled={previewing || !startDate || !endDate}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-50 h-9 ml-auto"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}
            >
              {previewing ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
              {previewing ? "Searching…" : "Preview Receipts"}
            </button>
          </div>

          {/* Bulk action bar (when items selected) */}
          {selected.size > 0 && preview && (
            <div className="rounded-xl px-4 py-2.5 flex items-center gap-3 border" style={{ background: `${NAVY}08`, borderColor: `${NAVY}25` }}>
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: NAVY }}>
                <Hash size={10} className="text-white" />
              </div>
              <span className="text-xs font-semibold" style={{ color: NAVY }}>
                {selected.size} selected · ₹{selTotal.toLocaleString("en-IN")}
              </span>
              <div className="flex-1" />
              <button onClick={() => setSelected(new Set())} className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors">
                <X size={11} /> Clear
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}
              >
                {downloading
                  ? <><Loader2 size={11} className="animate-spin" /> Generating…</>
                  : <><Download size={11} /> Download {selected.size} PDF{selected.size !== 1 ? "s" : ""} as ZIP</>}
              </button>
            </div>
          )}

          {/* Receipts table */}
          {!preview ? (
            /* Empty / search prompt */
            <div className="bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
              <div className="flex flex-col items-center text-center gap-3 py-14 px-6 text-slate-400">
                <FileArchive size={36} className="opacity-30" />
                <p className="text-sm font-semibold text-slate-500">How it works</p>
                <ol className="text-xs text-slate-400 space-y-1 text-left list-none max-w-xs">
                  <li className="flex gap-2"><span className="font-bold text-[#0b2c60]">1.</span> Choose a date range and optional operator filter above</li>
                  <li className="flex gap-2"><span className="font-bold text-[#0b2c60]">2.</span> Click <em>Preview Receipts</em> to see how many will be exported</li>
                  <li className="flex gap-2"><span className="font-bold text-[#0b2c60]">3.</span> Click <em>Download as ZIP</em> — each receipt is a separately named PDF</li>
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
              {/* Table header row */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                {/* Search */}
                <div className="relative flex-1 max-w-xs">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="Filter by receipt, customer, service…"
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">{filteredEntries.length} receipts</span>
                  <span className="text-xs font-bold text-emerald-600">
                    ₹{displayedEntries.reduce((s, e) => s + e.amount, 0).toLocaleString("en-IN")}
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
                        <Cb checked={selected.size === filteredEntries.length && filteredEntries.length > 0} onChange={toggleAll} />
                      </th>
                      {["Receipt #", "Date", "Customer", "Service", "Amount", "Actions"].map((h, i) => (
                        <th key={h} className={`px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap ${i >= 4 ? "text-right" : "text-left"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((e) => (
                      <tr
                        key={e.receiptNumber}
                        onClick={() => setPreviewEntry(e)}
                        className="cursor-pointer border-t border-slate-50 transition-colors hover:bg-slate-50/60"
                        style={previewEntry?.receiptNumber === e.receiptNumber ? { background: `${NAVY}06` } : {}}
                      >
                        <td className="px-4 py-3" onClick={ev => { ev.stopPropagation(); toggleEntry(e.receiptNumber); }}>
                          <Cb checked={selected.has(e.receiptNumber)} onChange={() => toggleEntry(e.receiptNumber)} />
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md"
                            style={previewEntry?.receiptNumber === e.receiptNumber
                              ? { background: NAVY, color: "#fff" }
                              : { background: "#f1f5f9", color: "#475569" }}
                          >
                            {e.receiptNumber}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-[11px] text-slate-400 whitespace-nowrap">{fmtDateShort(e.date)}</td>

                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0"
                              style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
                              {e.customerName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-medium text-slate-800 truncate max-w-[100px]">{e.customerName}</span>
                          </div>
                        </td>

                        <td className="px-3 py-3 text-[11px] text-slate-500 max-w-[120px] truncate">{e.serviceType}</td>

                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <span className={`text-sm font-bold ${e.type === "credit" ? "text-emerald-600" : "text-rose-500"}`}>
                            {e.type === "credit" ? "+" : "-"}₹{e.amount.toLocaleString("en-IN")}
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

              {/* Table footer */}
              <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {fmtDate(startDate)} → {fmtDate(endDate)}
                  {userId !== "all" && (() => {
                    const u = usersOverview.find((x: any) => String(x.userId) === userId) as any;
                    return u ? ` · @${u.username}` : "";
                  })()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">Total:</span>
                  <span className="text-sm font-bold text-emerald-600">
                    ₹{displayedEntries.reduce((s, e) => s + e.amount, 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Export Panel + Receipt Preview + Monthly ── */}
        <div className="w-full lg:w-[280px] shrink-0 space-y-4">

          {/* Bulk ZIP Export Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2.5" style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3d80)` }}>
              <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center">
                <FileArchive size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Bulk ZIP Export</p>
                <p className="text-[10px] text-white/50">PDFs by date range</p>
              </div>
            </div>
            <div className="p-4 space-y-3.5">
              {/* Info */}
              <div className="rounded-lg border px-3 py-2.5 flex items-start gap-2" style={{ background: `${NAVY}05`, borderColor: `${NAVY}15` }}>
                <AlertCircle size={12} className="mt-0.5 shrink-0" style={{ color: NAVY }} />
                <p className="text-[10px] leading-relaxed" style={{ color: NAVY }}>
                  Use the filters to choose a date range, preview the receipts, then download all as a ZIP of individual PDFs.
                </p>
              </div>

              {/* Count display */}
              {preview && preview.count > 0 ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-emerald-700">{preview.count} PDF{preview.count !== 1 ? "s" : ""}</p>
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

              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={downloading || !preview || preview.count === 0}
                className="w-full py-2.5 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}
              >
                {downloading
                  ? <><Loader2 size={14} className="animate-spin" /> Generating ZIP…</>
                  : <><Download size={14} /> Download as ZIP</>}
              </button>

              {preview && preview.count > 0 && (
                <p className="text-center text-[10px] text-slate-400">
                  Each PDF is named by receipt number<br />
                  e.g. <code className="bg-slate-100 rounded px-1">{preview.entries[0]?.receiptNumber ?? "CSC-2026-0001"}.pdf</code>
                </p>
              )}
            </div>
          </div>

          {/* Receipt Mini-Preview */}
          {previewEntry && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 flex items-center gap-2 bg-slate-700">
                <Eye size={12} className="text-white/60" />
                <span className="text-xs font-semibold text-white">Receipt Preview</span>
              </div>
              <div className="p-3">
                <div className="border border-dashed border-slate-200 rounded-lg overflow-hidden">
                  <div className="py-2.5 px-3 text-center" style={{ background: NAVY }}>
                    <p className="text-[10px] font-black text-white tracking-[0.2em]">
                      SAHU <span style={{ color: SAFFRON }}>CSC</span>
                    </p>
                    <p className="text-[8px] text-white/40 mt-0.5">Common Service Center, Odisha</p>
                  </div>
                  <div className="px-3 py-2.5 bg-slate-50/50 space-y-1.5">
                    {[
                      ["Receipt #", previewEntry.receiptNumber],
                      ["Date",      fmtDate(previewEntry.date)],
                      ["Customer",  previewEntry.customerName],
                      ["Service",   previewEntry.serviceType],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[10px]">
                        <span className="text-slate-400">{k}</span>
                        <span className="font-semibold text-slate-700 text-right max-w-[130px] truncate">{v}</span>
                      </div>
                    ))}
                    <div className="border-t border-dashed border-slate-200 pt-2 mt-1 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-700">Total Paid</span>
                      <span className={`text-sm font-extrabold ${previewEntry.type === "credit" ? "text-emerald-600" : "text-rose-500"}`}>
                        {previewEntry.type === "credit" ? "+" : "-"}₹{previewEntry.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-center pt-1">
                      <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded flex items-center justify-center">
                        <QrCode size={24} className="text-slate-300" />
                      </div>
                    </div>
                    <p className="text-[8px] text-center text-slate-300">Scan to verify authenticity</p>
                  </div>
                </div>
                <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                  {[{ icon: Printer, label: "Print" }, { icon: Download, label: "PDF" }, { icon: Share2, label: "Share" }].map(({ icon: Icon, label }) => (
                    <button key={label} className="flex flex-col items-center gap-1 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
                      <Icon size={12} />
                      <span className="text-[9px] font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Monthly Auto-Export Card */}
          <div className="bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2.5" style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}>
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                <Clock size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Monthly Auto-Export</p>
                <p className="text-[10px] text-white/60">Runs on 1st of each month</p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {/* Info */}
              <div className="rounded-lg bg-orange-50 border border-orange-100 px-3 py-2 flex items-start gap-2">
                <Mail size={11} className="text-orange-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-orange-700 leading-relaxed">
                  ZIP is automatically emailed to all admin accounts on the 1st. Requires SMTP configured (
                  <code className="bg-orange-100 rounded px-1">SMTP_HOST</code>,{" "}
                  <code className="bg-orange-100 rounded px-1">SMTP_USER</code>,{" "}
                  <code className="bg-orange-100 rounded px-1">SMTP_PASS</code>).
                </p>
              </div>

              {/* Month/Year selectors */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Month</label>
                  <select
                    value={trigMonth}
                    onChange={e => setTrigMonth(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none text-slate-700"
                  >
                    {MONTH_OPTIONS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Year</label>
                  <select
                    value={trigYear}
                    onChange={e => setTrigYear(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none text-slate-700"
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <p className="text-[10px] text-center text-slate-500">
                Selected: <strong className="text-slate-700">{MONTH_OPTIONS.find(m => m.v === trigMonth)?.l} {trigYear}</strong>
              </p>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleMonthDownload}
                  disabled={monthDownloading}
                  className="py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {monthDownloading ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
                  Download
                </button>
                <button
                  onClick={handleMonthEmail}
                  disabled={emailing}
                  className="py-2 text-xs font-bold text-white rounded-lg flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}
                >
                  {emailing
                    ? <><Loader2 size={11} className="animate-spin" /> Sending…</>
                    : <><Mail size={11} /> Email Admins</>}
                </button>
              </div>

              {/* Next run */}
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                <TrendingUp size={11} className="text-slate-400 shrink-0" />
                <p className="text-[10px] text-slate-500">Next auto-run: <strong className="text-slate-700">{nextExport}</strong></p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
