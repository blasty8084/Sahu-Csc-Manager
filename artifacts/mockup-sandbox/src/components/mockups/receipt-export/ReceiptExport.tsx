import { useState } from "react";
import {
  Download, FileText, FileSpreadsheet, Search, Filter,
  Calendar, Eye, Printer, CheckSquare, Square, ChevronDown,
  Receipt, TrendingUp, IndianRupee, Hash, X, Check,
  ArrowDownToLine, Share2, QrCode,
} from "lucide-react";

const RECEIPTS = [
  { id: "CSC-2026-0041", date: "01 Jul 2026", customer: "Ramesh Sahu", service: "PAN Card Application", amount: 150, status: "paid", type: "service" },
  { id: "CSC-2026-0040", date: "30 Jun 2026", customer: "Sunita Devi", service: "Aadhaar Update", amount: 50, status: "paid", type: "service" },
  { id: "CSC-2026-0039", date: "29 Jun 2026", customer: "Bijay Kumar", service: "Passport Form", amount: 300, status: "paid", type: "service" },
  { id: "CSC-2026-0038", date: "29 Jun 2026", customer: "Mina Patel", service: "Income Certificate", amount: 100, status: "paid", type: "service" },
  { id: "CSC-2026-0037", date: "28 Jun 2026", customer: "Suresh Nayak", service: "Driving Licence", amount: 200, status: "paid", type: "service" },
  { id: "CSC-2026-0036", date: "27 Jun 2026", customer: "Lalita Behera", service: "Caste Certificate", amount: 80, status: "paid", type: "service" },
  { id: "CSC-2026-0035", date: "26 Jun 2026", customer: "Pradip Mohanty", service: "Birth Certificate", amount: 60, status: "paid", type: "service" },
  { id: "CSC-2026-0034", date: "25 Jun 2026", customer: "Geeta Sharma", service: "Death Certificate", amount: 60, status: "paid", type: "service" },
];

const STAT_CARDS = [
  { label: "Total Receipts", value: "41", icon: Receipt, color: "bg-[#0b2c60]", iconBg: "bg-white/15" },
  { label: "Total Amount", value: "₹12,450", icon: IndianRupee, color: "bg-emerald-600", iconBg: "bg-white/15" },
  { label: "This Month", value: "18", icon: Calendar, color: "bg-[#f97316]", iconBg: "bg-white/15" },
  { label: "Pending Export", value: "8", icon: ArrowDownToLine, color: "bg-violet-600", iconBg: "bg-white/15" },
];

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="shrink-0">
      {checked
        ? <CheckSquare size={16} className="text-[#0b2c60]" />
        : <Square size={16} className="text-slate-300" />}
    </button>
  );
}

export function ReceiptExport() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<typeof RECEIPTS[0] | null>(RECEIPTS[0]);
  const [dateRange, setDateRange] = useState("this-month");
  const [searchQ, setSearchQ] = useState("");
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [exported, setExported] = useState(false);

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

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const total = filtered.filter(r => selected.has(r.id)).reduce((s, r) => s + r.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Top Header ── */}
      <div className="bg-[#0b2c60] text-white px-6 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
              <Receipt size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Receipt Export</h1>
              <p className="text-xs text-white/60">Download & share transaction receipts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 bg-white/10 rounded-full px-3 py-1">Admin</span>
            <div className="w-7 h-7 rounded-full bg-[#f97316] flex items-center justify-center text-xs font-bold">A</div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="bg-[#0b2c60]/95 px-6 pb-5 pt-1">
        <div className="max-w-[1200px] mx-auto grid grid-cols-4 gap-3">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-3.5 text-white flex items-center gap-3`}>
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
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-5 flex gap-5">

        {/* ── Left: Filter + List ── */}
        <div className="flex-1 min-w-0">

          {/* Filter bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 mb-4 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search receipts..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b2c60]/20"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm cursor-pointer">
              <Calendar size={13} className="text-slate-500" />
              {["this-month", "last-month", "custom"].map(v => (
                <button
                  key={v}
                  onClick={() => setDateRange(v)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${dateRange === v ? "bg-[#0b2c60] text-white" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {v === "this-month" ? "This Month" : v === "last-month" ? "Last Month" : "Custom"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 cursor-pointer">
              <Filter size={13} className="text-slate-500" />
              <span className="text-xs">All Types</span>
              <ChevronDown size={12} className="text-slate-400" />
            </div>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="bg-[#0b2c60]/5 border border-[#0b2c60]/20 rounded-xl px-4 py-2.5 mb-3 flex items-center gap-3">
              <span className="text-xs font-semibold text-[#0b2c60]">{selected.size} selected · ₹{total.toLocaleString("en-IN")}</span>
              <div className="flex-1" />
              <button onClick={() => setSelected(new Set())} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
                <X size={12} /> Clear
              </button>
              <button
                onClick={handleExport}
                className="bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {exported ? <><Check size={12} /> Exported!</> : <><Download size={12} /> Export {selected.size}</>}
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Receipt #</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Service</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setPreview(r)}
                    className={`cursor-pointer transition-colors ${preview?.id === r.id ? "bg-[#0b2c60]/5" : "hover:bg-slate-50"}`}
                  >
                    <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggle(r.id); }}>
                      <Checkbox checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                    </td>
                    <td className="px-3 py-3">
                      <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${preview?.id === r.id ? "bg-[#0b2c60] text-white" : "bg-slate-100 text-slate-700"}`}>
                        {r.id}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">{r.date}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0b2c60] to-[#1a4a9e] flex items-center justify-center text-[9px] text-white font-bold shrink-0">
                          {r.customer.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-800">{r.customer}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">{r.service}</td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-sm font-bold text-emerald-600">₹{r.amount}</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <button className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors" title="Preview">
                          <Eye size={12} />
                        </button>
                        <button className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors" title="Print">
                          <Printer size={12} />
                        </button>
                        <button className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors" title="Share">
                          <Share2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs text-slate-500">{filtered.length} receipts · Total ₹{filtered.reduce((s, r) => s + r.amount, 0).toLocaleString("en-IN")}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map(p => (
                  <button key={p} className={`w-6 h-6 text-xs rounded ${p === 1 ? "bg-[#0b2c60] text-white" : "text-slate-500 hover:bg-slate-100"}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Export Panel + Preview ── */}
        <div className="w-[280px] shrink-0 space-y-4">

          {/* Export Options Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-[#0b2c60] px-4 py-3 flex items-center gap-2">
              <ArrowDownToLine size={14} className="text-white/80" />
              <span className="text-sm font-semibold text-white">Export Options</span>
            </div>
            <div className="p-4 space-y-3">
              {/* Format toggle */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Format</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setExportFormat("pdf")}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border-2 text-xs font-medium transition-all ${exportFormat === "pdf" ? "border-[#f97316] bg-[#f97316]/5 text-[#f97316]" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                  >
                    <FileText size={18} />
                    PDF
                  </button>
                  <button
                    onClick={() => setExportFormat("excel")}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border-2 text-xs font-medium transition-all ${exportFormat === "excel" ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                  >
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
                    { label: "All Receipts", sub: "41 receipts" },
                    { label: "Selected Only", sub: `${selected.size} selected` },
                    { label: "Date Range", sub: "Jun 2026" },
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

              {/* Options */}
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

              <button
                onClick={handleExport}
                className="w-full py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {exported
                  ? <><Check size={14} /> Done!</>
                  : <><Download size={14} /> Export {selected.size > 0 ? selected.size : "All"}</>}
              </button>
            </div>
          </div>

          {/* Receipt Preview */}
          {preview && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-700 px-4 py-2.5 flex items-center gap-2">
                <Eye size={13} className="text-white/70" />
                <span className="text-xs font-semibold text-white">Receipt Preview</span>
              </div>
              <div className="p-4">
                {/* Mini receipt */}
                <div className="border border-dashed border-slate-200 rounded-lg p-3 bg-slate-50/50 text-center">
                  <div className="w-8 h-8 bg-[#0b2c60] rounded-full flex items-center justify-center mx-auto mb-1.5">
                    <Receipt size={14} className="text-white" />
                  </div>
                  <p className="text-[10px] font-bold text-[#0b2c60] uppercase tracking-wider">SAHU CSC</p>
                  <p className="text-[9px] text-slate-400 mb-2">Common Service Center, Odisha</p>

                  <div className="border-t border-dashed border-slate-200 pt-2 text-left space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Receipt #</span>
                      <span className="font-mono font-bold text-slate-800">{preview.id}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Date</span>
                      <span className="text-slate-700">{preview.date}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Customer</span>
                      <span className="text-slate-700">{preview.customer}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Service</span>
                      <span className="text-slate-700 text-right max-w-[100px] leading-tight">{preview.service}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-200 mt-2 pt-2 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-800">Total Paid</span>
                    <span className="text-sm font-bold text-emerald-600">₹{preview.amount}</span>
                  </div>

                  {/* QR placeholder */}
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

                {/* Action buttons */}
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {[
                    { icon: Printer, label: "Print" },
                    { icon: Download, label: "PDF" },
                    { icon: Share2, label: "Share" },
                  ].map(({ icon: Icon, label }) => (
                    <button key={label} className="flex flex-col items-center gap-1 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600">
                      <Icon size={13} />
                      <span className="text-[10px] font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
