import { useState } from "react";
import {
  Download, FileText, Search, Calendar, User,
  CheckSquare, Square, ChevronDown, X, Check,
  ArrowDownToLine, Share2, QrCode, Clock, Mail,
  FileArchive, Loader2, Receipt, IndianRupee,
  AlertCircle, TrendingUp, Eye, Printer, Filter,
  Hash,
} from "lucide-react";

const RECEIPTS = [
  { id: "CSC-2026-0041", date: "01 Jul 2026", customer: "Ramesh Sahu",    service: "PAN Card Application", amount: 150, type: "credit", operator: "admin" },
  { id: "CSC-2026-0040", date: "30 Jun 2026", customer: "Sunita Devi",    service: "Aadhaar Update",       amount: 50,  type: "credit", operator: "operator" },
  { id: "CSC-2026-0039", date: "29 Jun 2026", customer: "Bijay Kumar",    service: "Passport Form",         amount: 300, type: "credit", operator: "admin" },
  { id: "CSC-2026-0038", date: "29 Jun 2026", customer: "Mina Patel",     service: "Income Certificate",   amount: 100, type: "credit", operator: "operator" },
  { id: "CSC-2026-0037", date: "28 Jun 2026", customer: "Suresh Nayak",   service: "Driving Licence",      amount: 200, type: "debit",  operator: "admin" },
  { id: "CSC-2026-0036", date: "27 Jun 2026", customer: "Lalita Behera",  service: "Caste Certificate",    amount: 80,  type: "credit", operator: "operator" },
  { id: "CSC-2026-0035", date: "26 Jun 2026", customer: "Pradip Mohanty", service: "Birth Certificate",    amount: 60,  type: "credit", operator: "admin" },
  { id: "CSC-2026-0034", date: "25 Jun 2026", customer: "Geeta Sharma",   service: "Death Certificate",    amount: 60,  type: "debit",  operator: "operator" },
];

const STATS = [
  { label: "Total Receipts",  value: "41",      sub: "+6 this week",   icon: Receipt,          gradient: "from-[#0b2c60] to-[#1a4a9e]" },
  { label: "Total Amount",    value: "₹12,450", sub: "+₹1,200 today",  icon: IndianRupee,      gradient: "from-emerald-600 to-emerald-500" },
  { label: "This Month",      value: "18",      sub: "Jun 2026",       icon: Calendar,         gradient: "from-[#f97316] to-orange-400" },
  { label: "Pending Export",  value: "8",       sub: "Bulk ZIP ready", icon: ArrowDownToLine,  gradient: "from-violet-600 to-violet-500" },
];

const MONTH_OPTIONS = [
  { v: 1, l: "January" }, { v: 2, l: "February" }, { v: 3, l: "March" },
  { v: 4, l: "April" }, { v: 5, l: "May" }, { v: 6, l: "June" },
  { v: 7, l: "July" }, { v: 8, l: "August" }, { v: 9, l: "September" },
  { v: 10, l: "October" }, { v: 11, l: "November" }, { v: 12, l: "December" },
];

function Cb({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="shrink-0">
      {checked
        ? <CheckSquare size={15} className="text-[#0b2c60]" />
        : <Square size={15} className="text-slate-300" />}
    </button>
  );
}

export function ReceiptExportPage() {
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [preview, setPreview]       = useState<typeof RECEIPTS[0] | null>(RECEIPTS[0]);
  const [searchQ, setSearchQ]       = useState("");
  const [dateFilter, setDateFilter] = useState<"month" | "lastMonth" | "year">("month");
  const [downloading, setDownloading] = useState(false);
  const [exported, setExported]     = useState(false);
  const [trigMonth, setTrigMonth]   = useState(6);
  const [trigYear, setTrigYear]     = useState(2026);
  const [emailing, setEmailing]     = useState(false);
  const [emailed, setEmailed]       = useState(false);

  const filtered = RECEIPTS.filter(r =>
    r.customer.toLowerCase().includes(searchQ.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQ.toLowerCase()) ||
    r.service.toLowerCase().includes(searchQ.toLowerCase())
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

  const handleDownloadZip = () => {
    setDownloading(true);
    setTimeout(() => { setDownloading(false); setExported(true); setTimeout(() => setExported(false), 2000); }, 1500);
  };

  const handleEmail = () => {
    setEmailing(true);
    setTimeout(() => { setEmailing(false); setEmailed(true); setTimeout(() => setEmailed(false), 2000); }, 1500);
  };

  const selTotal = filtered.filter(r => selected.has(r.id)).reduce((s, r) => s + r.amount, 0);
  const NAVY = "#0b2c60";
  const SAFFRON = "#f97316";

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Navy Header ───────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3d80 100%)` }}>
        {/* Accent stripe */}
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${SAFFRON}, #fbbf24, ${SAFFRON})` }} />

        <div className="max-w-[1200px] mx-auto px-6 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}>
              <FileArchive size={17} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Bulk Receipt Export</h1>
              <p className="text-[11px] text-white/50">Download all receipts as a ZIP of individual PDFs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50 bg-white/10 border border-white/10 rounded-full px-3 py-1">Admin Panel</span>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="max-w-[1200px] mx-auto px-6 pb-5 pt-2 grid grid-cols-4 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.gradient} rounded-xl p-3.5 text-white flex items-center gap-3 shadow-md`}>
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                <s.icon size={19} />
              </div>
              <div>
                <p className="text-lg font-extrabold leading-none">{s.value}</p>
                <p className="text-[10px] text-white/65 mt-0.5">{s.label}</p>
                <p className="text-[9px] text-white/40 mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-[1200px] mx-auto px-6 py-5 flex gap-5">

        {/* ── LEFT: Filter + Table ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Filter bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex items-center gap-2.5 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search by receipt #, customer, service…"
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": `${NAVY}30` } as any}
              />
            </div>

            {/* Date filter pills */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
              <Calendar size={12} className="text-slate-400 mr-1" />
              {([["month", "This Month"], ["lastMonth", "Last Month"], ["year", "This Year"]] as const).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setDateFilter(v)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                  style={dateFilter === v ? { background: NAVY, color: "#fff" } : { color: "#64748b" }}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Operator filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 cursor-pointer hover:border-slate-300 transition-colors">
              <User size={12} className="text-slate-400" />
              <span>All Operators</span>
              <ChevronDown size={11} className="text-slate-400" />
            </div>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
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
                onClick={handleDownloadZip}
                disabled={downloading}
                className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}
              >
                {downloading
                  ? <><Loader2 size={11} className="animate-spin" /> Generating…</>
                  : exported
                  ? <><Check size={11} /> Downloaded!</>
                  : <><Download size={11} /> Download {selected.size} PDF{selected.size !== 1 ? "s" : ""} as ZIP</>}
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt size={14} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Receipts</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">{filtered.length}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-emerald-600">₹{filtered.reduce((s, r) => s + r.amount, 0).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-4 py-2.5 w-8">
                    <Cb checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
                  </th>
                  {["Receipt #", "Date", "Customer", "Service", "Amount", "Actions"].map((h, i) => (
                    <th key={h} className={`px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider ${i >= 4 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr
                    key={r.id}
                    onClick={() => setPreview(r)}
                    className={`cursor-pointer border-t border-slate-50 transition-colors ${
                      preview?.id === r.id ? "" : "hover:bg-slate-50/60"
                    }`}
                    style={preview?.id === r.id ? { background: `${NAVY}06` } : {}}
                  >
                    <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggle(r.id); }}>
                      <Cb checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md"
                        style={preview?.id === r.id
                          ? { background: NAVY, color: "#fff" }
                          : { background: "#f1f5f9", color: "#475569" }}
                      >
                        {r.id}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-[11px] text-slate-400 whitespace-nowrap">{r.date}</td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0"
                          style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
                          {r.customer.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-slate-800">{r.customer}</span>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-[11px] text-slate-500 max-w-[140px] truncate">{r.service}</td>

                    <td className="px-3 py-3 text-right">
                      <span className={`text-sm font-bold ${r.type === "credit" ? "text-emerald-600" : "text-rose-500"}`}>
                        {r.type === "credit" ? "+" : "-"}₹{r.amount}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-right" onClick={e => e.stopPropagation()}>
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

            {/* Table footer */}
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{filtered.length} receipts · Showing current month</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map(p => (
                  <button key={p} className={`w-6 h-6 text-[11px] font-medium rounded transition-colors ${p === 1 ? "text-white" : "text-slate-400 hover:bg-slate-100"}`}
                    style={p === 1 ? { background: NAVY } : {}}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Export Panel + Preview + Monthly ── */}
        <div className="w-[280px] shrink-0 space-y-4">

          {/* Export ZIP Card */}
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
              {/* Info banner */}
              <div className="rounded-lg border px-3 py-2.5 flex items-start gap-2" style={{ background: `${NAVY}05`, borderColor: `${NAVY}15` }}>
                <AlertCircle size={12} className="mt-0.5 shrink-0" style={{ color: NAVY }} />
                <p className="text-[10px] leading-relaxed" style={{ color: NAVY }}>
                  Select receipts above or use date filters to choose a range, then download all as a ZIP of PDFs.
                </p>
              </div>

              {/* Quick presets */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Quick Range</p>
                <div className="flex flex-wrap gap-1.5">
                  {[["Today", "today"], ["This Week", "week"], ["This Month", "month"], ["Last Month", "lastMonth"]].map(([l, v]) => (
                    <button key={v}
                      className="text-[10px] px-2.5 py-1 rounded-full border border-slate-200 font-medium text-slate-500 hover:text-[#0b2c60] hover:border-[#0b2c60] transition-colors">
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count display */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-base font-bold text-emerald-700">{selected.size > 0 ? selected.size : filtered.length} PDFs</p>
                  <p className="text-[10px] text-emerald-600">{selected.size > 0 ? "Selected receipts" : "All visible receipts"}</p>
                </div>
              </div>

              {/* Download button */}
              <button
                onClick={handleDownloadZip}
                disabled={downloading}
                className="w-full py-2.5 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}
              >
                {downloading
                  ? <><Loader2 size={14} className="animate-spin" /> Generating ZIP…</>
                  : exported
                  ? <><Check size={14} /> Downloaded!</>
                  : <><Download size={14} /> Download as ZIP</>}
              </button>
            </div>
          </div>

          {/* Receipt Mini-Preview */}
          {preview && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 flex items-center gap-2 bg-slate-700">
                <Eye size={12} className="text-white/60" />
                <span className="text-xs font-semibold text-white">Receipt Preview</span>
              </div>
              <div className="p-3">
                <div className="border border-dashed border-slate-200 rounded-lg overflow-hidden">
                  {/* Mini receipt header */}
                  <div className="py-2 px-3 text-center" style={{ background: NAVY }}>
                    <p className="text-[9px] font-black text-white tracking-[0.2em]">SAHU <span style={{ color: SAFFRON }}>CSC</span></p>
                    <p className="text-[8px] text-white/40 mt-0.5">Common Service Center</p>
                  </div>
                  <div className="px-3 py-2.5 bg-slate-50/50 space-y-1">
                    {[
                      ["Receipt #", preview.id],
                      ["Date",      preview.date],
                      ["Customer",  preview.customer],
                      ["Service",   preview.service],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[10px]">
                        <span className="text-slate-400">{k}</span>
                        <span className="font-semibold text-slate-700 text-right max-w-[120px] truncate">{v}</span>
                      </div>
                    ))}
                    <div className="border-t border-dashed border-slate-200 pt-2 mt-1 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-700">Total Paid</span>
                      <span className="text-sm font-extrabold text-emerald-600">₹{preview.amount}</span>
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
            <div className="px-4 py-3 flex items-center gap-2.5" style={{ background: `linear-gradient(135deg, #f97316, #ea580c)` }}>
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
                  ZIP is automatically emailed to all admin accounts on the 1st. Requires SMTP configured.
                </p>
              </div>

              {/* Month/Year selectors */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Month</label>
                  <select
                    value={trigMonth}
                    onChange={e => setTrigMonth(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none text-slate-700"
                  >
                    {MONTH_OPTIONS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Year</label>
                  <select
                    value={trigYear}
                    onChange={e => setTrigYear(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none text-slate-700"
                  >
                    {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <p className="text-[10px] text-center text-slate-500">
                Selected: <strong className="text-slate-700">{MONTH_OPTIONS.find(m => m.v === trigMonth)?.l} {trigYear}</strong>
              </p>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                  onClick={handleDownloadZip}
                >
                  <Download size={11} />
                  Download
                </button>
                <button
                  onClick={handleEmail}
                  disabled={emailing}
                  className="py-2 text-xs font-bold text-white rounded-lg flex items-center justify-center gap-1.5 transition-all"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}
                >
                  {emailing
                    ? <><Loader2 size={11} className="animate-spin" /> Sending…</>
                    : emailed
                    ? <><Check size={11} /> Sent!</>
                    : <><Mail size={11} /> Email Admins</>}
                </button>
              </div>

              {/* Next run info */}
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                <TrendingUp size={11} className="text-slate-400 shrink-0" />
                <p className="text-[10px] text-slate-500">Next auto-run: <strong className="text-slate-700">1 Aug 2026, 12:05 AM</strong></p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
