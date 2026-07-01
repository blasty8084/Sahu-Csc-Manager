import { useState } from "react";
import {
  Download, Search, Calendar, ChevronDown, ChevronRight,
  Check, ArrowDownToLine, Clock, Mail, FileArchive,
  Loader2, Receipt, IndianRupee, AlertCircle, TrendingUp,
  Eye, Filter, X, CheckSquare, Square, Hash, FileText, QrCode,
  ArrowLeft, Printer, Share2,
} from "lucide-react";

const NAVY = "#0b2c60";
const SAFFRON = "#f97316";

const RECEIPTS = [
  { id: "CSC-2026-0041", date: "01 Jul 2026", customer: "Ramesh Sahu",    service: "PAN Card Application", amount: 150, type: "credit" },
  { id: "CSC-2026-0040", date: "30 Jun 2026", customer: "Sunita Devi",    service: "Aadhaar Update",       amount: 50,  type: "credit" },
  { id: "CSC-2026-0039", date: "29 Jun 2026", customer: "Bijay Kumar",    service: "Passport Form",         amount: 300, type: "credit" },
  { id: "CSC-2026-0038", date: "29 Jun 2026", customer: "Mina Patel",     service: "Income Certificate",   amount: 100, type: "credit" },
  { id: "CSC-2026-0037", date: "28 Jun 2026", customer: "Suresh Nayak",   service: "Driving Licence",      amount: 200, type: "debit"  },
  { id: "CSC-2026-0036", date: "27 Jun 2026", customer: "Lalita Behera",  service: "Caste Certificate",    amount: 80,  type: "credit" },
];

const MONTH_OPTIONS = [
  { v: 1, l: "January" }, { v: 2, l: "February" }, { v: 3, l: "March" },
  { v: 4, l: "April"   }, { v: 5, l: "May"      }, { v: 6, l: "June"   },
  { v: 7, l: "July"    }, { v: 8, l: "August"   }, { v: 9, l: "September" },
  { v: 10, l: "October" }, { v: 11, l: "November" }, { v: 12, l: "December" },
];

type Tab = "bulk" | "monthly";

function Cb({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="shrink-0 p-1">
      {checked
        ? <CheckSquare size={16} style={{ color: NAVY }} />
        : <Square size={16} className="text-slate-300" />}
    </button>
  );
}

export function ReceiptExportMobileNew() {
  const [tab, setTab]             = useState<Tab>("bulk");
  const [searchQ, setSearchQ]     = useState("");
  const [datePreset, setDatePreset] = useState("month");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [done, setDone]           = useState(false);
  const [trigMonth, setTrigMonth] = useState(6);
  const [trigYear, setTrigYear]   = useState(2026);
  const [emailing, setEmailing]   = useState(false);
  const [emailed, setEmailed]     = useState(false);
  const [mDl, setMDl]             = useState(false);

  const filtered = RECEIPTS.filter(r =>
    r.customer.toLowerCase().includes(searchQ.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQ.toLowerCase())
  );

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(r => r.id)));
  };

  const toggle = (id: string) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => { setDownloading(false); setDone(true); setTimeout(() => setDone(false), 2000); }, 1500);
  };

  const handleEmail = () => {
    setEmailing(true);
    setTimeout(() => { setEmailing(false); setEmailed(true); setTimeout(() => setEmailed(false), 2000); }, 1500);
  };

  const selTotal = filtered.filter(r => selected.has(r.id)).reduce((s, r) => s + r.amount, 0);
  const previewed = RECEIPTS.find(r => r.id === previewId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-[390px] mx-auto" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Sticky Nav Header ── */}
      <div className="sticky top-0 z-20" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3d80 100%)` }}>
        {/* Accent stripe */}
        <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${SAFFRON}, #fbbf24, ${SAFFRON})` }} />

        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={17} />
          </button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}>
            <FileArchive size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white leading-none">Bulk Receipt Export</h1>
            <p className="text-[10px] text-white/50 mt-0.5 truncate">Download PDFs as ZIP</p>
          </div>
        </div>

        {/* ── Stat pills row ── */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {[
            { label: "Receipts", value: "41",      color: "bg-white/15" },
            { label: "Amount",   value: "₹12,450", color: "bg-emerald-500/80" },
            { label: "This Month", value: "18",    color: "bg-orange-500/80" },
            { label: "Pending",  value: "8",       color: "bg-violet-500/80" },
          ].map(s => (
            <div key={s.label} className={`${s.color} shrink-0 rounded-xl px-3 py-2 flex flex-col`}>
              <span className="text-sm font-extrabold text-white leading-none">{s.value}</span>
              <span className="text-[9px] text-white/65 mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Tab bar ── */}
        <div className="flex border-t border-white/10">
          {([["bulk", "Bulk Export"], ["monthly", "Monthly"]] as const).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === v ? "text-white border-b-2" : "text-white/50"}`}
              style={tab === v ? { borderBottomColor: SAFFRON } : {}}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════ BULK TAB ══════════════ */}
      {tab === "bulk" && (
        <div className="flex-1 flex flex-col">

          {/* Search + filter bar */}
          <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search receipts…"
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
              {searchQ && (
                <button onClick={() => setSearchQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <X size={12} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors"
              style={showFilters ? { background: NAVY, borderColor: NAVY } : { borderColor: "#e2e8f0", color: "#94a3b8" }}
            >
              <Filter size={14} className={showFilters ? "text-white" : ""} />
            </button>
          </div>

          {/* Expandable filter panel */}
          {showFilters && (
            <div className="bg-white border-b border-slate-100 px-4 py-3 space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Date Range</p>
                <div className="flex flex-wrap gap-1.5">
                  {[["Today", "today"], ["This Week", "week"], ["This Month", "month"], ["Last Month", "lastMonth"]].map(([l, v]) => (
                    <button
                      key={v}
                      onClick={() => setDatePreset(v)}
                      className="text-[10px] px-3 py-1.5 rounded-full border font-medium transition-all"
                      style={datePreset === v
                        ? { background: NAVY, borderColor: NAVY, color: "#fff" }
                        : { borderColor: "#e2e8f0", color: "#64748b" }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" defaultValue="2026-07-01" className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none text-slate-700" />
                <input type="date" defaultValue="2026-07-01" className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none text-slate-700" />
              </div>
            </div>
          )}

          {/* Bulk action bar (when items selected) */}
          {selected.size > 0 && (
            <div className="bg-[#0b2c60]/5 border-b border-[#0b2c60]/15 px-4 py-2.5 flex items-center gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: NAVY }}>
                <Hash size={9} className="text-white" />
              </div>
              <span className="text-xs font-semibold flex-1 min-w-0 truncate" style={{ color: NAVY }}>
                {selected.size} selected · ₹{selTotal.toLocaleString("en-IN")}
              </span>
              <button onClick={() => setSelected(new Set())} className="text-slate-400 p-1">
                <X size={12} />
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="text-xs font-bold text-white px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0"
                style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}
              >
                {downloading ? <Loader2 size={10} className="animate-spin" /> : <Download size={10} />}
                ZIP
              </button>
            </div>
          )}

          {/* Select all row */}
          <div className="bg-white border-b border-slate-100 px-4 py-2.5 flex items-center gap-2">
            <Cb checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
            <span className="text-xs text-slate-500 flex-1">Select all ({filtered.length} receipts)</span>
            <span className="text-xs font-bold text-emerald-600">₹{filtered.reduce((s,r) => s+r.amount,0).toLocaleString("en-IN")}</span>
          </div>

          {/* Receipt list */}
          <div className="flex-1 divide-y divide-slate-100">
            {filtered.map((r) => (
              <div key={r.id} className="bg-white">
                <div
                  className="flex items-center px-4 py-3.5 gap-3"
                  onClick={() => setPreviewId(previewId === r.id ? null : r.id)}
                >
                  <div onClick={e => { e.stopPropagation(); toggle(r.id); }}>
                    <Cb checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs text-white font-bold shrink-0"
                    style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
                    {r.customer.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-800 truncate">{r.customer}</span>
                      <span className={`text-sm font-bold shrink-0 ${r.type === "credit" ? "text-emerald-600" : "text-rose-500"}`}>
                        {r.type === "credit" ? "+" : "-"}₹{r.amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span
                        className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                        style={{ background: "#f1f5f9", color: "#475569" }}
                      >
                        {r.id}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">{r.date}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{r.service}</p>
                  </div>

                  <ChevronRight
                    size={14}
                    className="text-slate-300 shrink-0 transition-transform"
                    style={previewId === r.id ? { transform: "rotate(90deg)", color: NAVY } : {}}
                  />
                </div>

                {/* Inline expand: mini receipt */}
                {previewId === r.id && (
                  <div className="px-4 pb-4">
                    <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                      {/* Receipt header */}
                      <div className="py-3 px-4 text-center" style={{ background: NAVY }}>
                        <p className="text-[11px] font-black text-white tracking-[0.2em]">
                          SAHU <span style={{ color: SAFFRON }}>CSC</span>
                        </p>
                        <p className="text-[9px] text-white/40 mt-0.5">Common Service Center, Odisha</p>
                      </div>
                      {/* Details */}
                      <div className="bg-slate-50 px-4 py-3 space-y-2">
                        {[
                          ["Receipt #", r.id],
                          ["Date",      r.date],
                          ["Customer",  r.customer],
                          ["Service",   r.service],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between text-xs">
                            <span className="text-slate-400">{k}</span>
                            <span className="font-semibold text-slate-700 text-right max-w-[180px] truncate">{v}</span>
                          </div>
                        ))}
                        <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-700">Total Paid</span>
                          <span className={`text-lg font-extrabold ${r.type === "credit" ? "text-emerald-600" : "text-rose-500"}`}>
                            {r.type === "credit" ? "+" : "-"}₹{r.amount}
                          </span>
                        </div>
                        <div className="flex justify-center py-1">
                          <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center">
                            <QrCode size={32} className="text-slate-300" />
                          </div>
                        </div>
                        <p className="text-[9px] text-center text-slate-300">Scan to verify</p>
                      </div>
                      {/* Action row */}
                      <div className="grid grid-cols-3 border-t border-slate-100 divide-x divide-slate-100">
                        {[{ icon: Printer, label: "Print" }, { icon: Download, label: "PDF" }, { icon: Share2, label: "Share" }].map(({ icon: Icon, label }) => (
                          <button key={label} className="flex flex-col items-center gap-1 py-2.5 bg-white hover:bg-slate-50 transition-colors text-slate-500">
                            <Icon size={13} />
                            <span className="text-[10px] font-medium">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Sticky bottom: Download CTA ── */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 px-4 py-3 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {selected.size > 0 ? `${selected.size} selected` : `${filtered.length} receipts`}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                ₹{(selected.size > 0 ? selTotal : filtered.reduce((s,r) => s+r.amount, 0)).toLocaleString("en-IN")}
              </span>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full py-3 text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}
            >
              {downloading
                ? <><Loader2 size={16} className="animate-spin" /> Generating ZIP…</>
                : done
                ? <><Check size={16} /> Downloaded!</>
                : <><Download size={16} /> Download {selected.size > 0 ? selected.size : filtered.length} PDF{filtered.length !== 1 ? "s" : ""} as ZIP</>}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ MONTHLY TAB ══════════════ */}
      {tab === "monthly" && (
        <div className="flex-1 px-4 py-5 space-y-4">

          {/* Info card */}
          <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}>
              <Clock size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-orange-800">Automatic Monthly Export</p>
              <p className="text-[11px] text-orange-600 mt-0.5 leading-relaxed">
                A ZIP of all receipts is automatically emailed to admin accounts on the 1st of every month. Requires SMTP configured.
              </p>
              <p className="text-[10px] text-orange-500 mt-1.5 font-medium">Next auto-run: 1 Aug 2026, 12:05 AM</p>
            </div>
          </div>

          {/* Month/Year picker card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">Select Month</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Month</label>
                  <select
                    value={trigMonth}
                    onChange={e => setTrigMonth(Number(e.target.value))}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none text-slate-700"
                  >
                    {MONTH_OPTIONS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Year</label>
                  <select
                    value={trigYear}
                    onChange={e => setTrigYear(Number(e.target.value))}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none text-slate-700"
                  >
                    {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 text-center">
                <p className="text-xs text-slate-500">
                  Selected: <strong className="text-slate-700">{MONTH_OPTIONS.find(m => m.v === trigMonth)?.l} {trigYear}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Stats preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Month Preview</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Receipts",   value: "18",      icon: Receipt,       color: "bg-[#0b2c60]" },
                { label: "Amount",     value: "₹5,240",  icon: IndianRupee,   color: "bg-emerald-600" },
                { label: "PDF Size",   value: "~2.4 MB", icon: FileText,      color: "bg-violet-600" },
                { label: "Operators",  value: "2",        icon: Eye,           color: "bg-[#f97316]" },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-xl p-3 text-white flex items-center gap-2`}>
                  <s.icon size={15} />
                  <div>
                    <p className="text-sm font-extrabold leading-none">{s.value}</p>
                    <p className="text-[9px] text-white/65 mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SMTP warning */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2.5">
            <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Email requires SMTP secrets configured in Replit. Without it, use <strong>Download ZIP</strong> below.
            </p>
          </div>

          {/* Next auto-export info */}
          <div className="flex items-center gap-2.5 bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-sm">
            <TrendingUp size={13} className="text-slate-400 shrink-0" />
            <p className="text-xs text-slate-500">Next auto-run: <strong className="text-slate-700">1 Aug 2026, 12:05 AM</strong></p>
          </div>

          {/* CTA buttons */}
          <div className="space-y-2.5 pb-6">
            <button
              onClick={() => { setMDl(true); setTimeout(() => setMDl(false), 1500); }}
              disabled={mDl}
              className="w-full py-3 text-slate-700 text-sm font-semibold rounded-2xl border border-slate-200 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 transition-colors disabled:opacity-60"
            >
              {mDl ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              Download ZIP
            </button>
            <button
              onClick={handleEmail}
              disabled={emailing}
              className="w-full py-3 text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}
            >
              {emailing
                ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
                : emailed
                ? <><Check size={15} /> Email Sent!</>
                : <><Mail size={15} /> Email to All Admins</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
