import { useState } from "react";
import {
  Download, FileText, FileSpreadsheet, Search,
  Calendar, Eye, Printer, ChevronDown, ChevronRight,
  Receipt, IndianRupee, ArrowLeft, Filter,
  Share2, QrCode, Check, X, CheckSquare, Square,
  ArrowDownToLine, SlidersHorizontal,
} from "lucide-react";

const RECEIPTS = [
  { id: "CSC-2026-0041", date: "01 Jul 2026", customer: "Ramesh Sahu", service: "PAN Card Application", amount: 150 },
  { id: "CSC-2026-0040", date: "30 Jun 2026", customer: "Sunita Devi", service: "Aadhaar Update", amount: 50 },
  { id: "CSC-2026-0039", date: "29 Jun 2026", customer: "Bijay Kumar", service: "Passport Form", amount: 300 },
  { id: "CSC-2026-0038", date: "29 Jun 2026", customer: "Mina Patel", service: "Income Certificate", amount: 100 },
  { id: "CSC-2026-0037", date: "28 Jun 2026", customer: "Suresh Nayak", service: "Driving Licence", amount: 200 },
  { id: "CSC-2026-0036", date: "27 Jun 2026", customer: "Lalita Behera", service: "Caste Certificate", amount: 80 },
  { id: "CSC-2026-0035", date: "26 Jun 2026", customer: "Pradip Mohanty", service: "Birth Certificate", amount: 60 },
];

type Screen = "list" | "preview" | "export";

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={e => { e.stopPropagation(); onChange(); }} className="p-1">
      {checked
        ? <CheckSquare size={18} className="text-[#0b2c60]" />
        : <Square size={18} className="text-slate-300" />}
    </button>
  );
}

export function ReceiptExportMobile() {
  const [screen, setScreen] = useState<Screen>("list");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeReceipt, setActiveReceipt] = useState(RECEIPTS[0]);
  const [dateRange, setDateRange] = useState("month");
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [exported, setExported] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const filtered = RECEIPTS.filter(r =>
    r.customer.toLowerCase().includes(searchQ.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQ.toLowerCase())
  );

  const toggle = (id: string) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const totalSelected = filtered.filter(r => selected.has(r.id)).reduce((s, r) => s + r.amount, 0);

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div className="w-[390px] h-[844px] bg-slate-100 overflow-hidden flex flex-col font-['Inter'] relative" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Status Bar ── */}
      <div className="bg-[#0b2c60] px-5 pt-3 pb-0 flex items-center justify-between shrink-0">
        <span className="text-white text-[11px] font-semibold">9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[3,3,3,2].map((h, i) => <div key={i} className="w-1 bg-white rounded-sm" style={{ height: h * 2.5 }} />)}
          </div>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="white" className="opacity-90"><path d="M7 2.5C8.8 2.5 10.4 3.2 11.6 4.4L13 3C11.4 1.4 9.3 0.5 7 0.5C4.7 0.5 2.6 1.4 1 3L2.4 4.4C3.6 3.2 5.2 2.5 7 2.5Z"/><path d="M7 5.5C8 5.5 8.9 5.9 9.6 6.6L11 5.2C9.9 4.2 8.5 3.5 7 3.5C5.5 3.5 4.1 4.2 3 5.2L4.4 6.6C5.1 5.9 6 5.5 7 5.5Z"/><circle cx="7" cy="9" r="1.5"/></svg>
          <div className="w-5 h-2.5 bg-white rounded-sm opacity-90" />
        </div>
      </div>

      {/* ── Top Nav ── */}
      <div className="bg-[#0b2c60] px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          {screen !== "list" && (
            <button onClick={() => setScreen("list")} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <ArrowLeft size={16} className="text-white" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-base font-bold text-white leading-tight">
              {screen === "list" ? "Receipt Export" : screen === "preview" ? "Receipt Preview" : "Export Options"}
            </h1>
            <p className="text-[11px] text-white/60">
              {screen === "list" ? `${RECEIPTS.length} receipts · Jul 2026` : screen === "preview" ? activeReceipt.id : "Choose format & scope"}
            </p>
          </div>
          {screen === "list" && (
            <button
              onClick={() => setScreen("export")}
              className="flex items-center gap-1.5 bg-[#f97316] text-white text-xs font-semibold px-3 py-2 rounded-xl"
            >
              <ArrowDownToLine size={13} />
              Export
            </button>
          )}
        </div>

        {/* KPI strip */}
        {screen === "list" && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "Total", value: "41", icon: Receipt },
              { label: "Amount", value: "₹12,450", icon: IndianRupee },
              { label: "Selected", value: String(selected.size), icon: CheckSquare },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
                <s.icon size={14} className="text-[#f97316] shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white leading-none">{s.value}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════ LIST SCREEN ══════════════ */}
      {screen === "list" && (
        <div className="flex-1 overflow-y-auto">
          {/* Search + Filter */}
          <div className="bg-white border-b border-slate-100 px-4 py-3 flex gap-2 sticky top-0 z-10">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search receipts…"
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b2c60]/20"
              />
            </div>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${showFilter ? "bg-[#0b2c60] border-[#0b2c60] text-white" : "bg-slate-50 border-slate-200 text-slate-500"}`}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>

          {/* Filter chips */}
          {showFilter && (
            <div className="bg-white border-b border-slate-100 px-4 py-2.5 flex gap-2 overflow-x-auto">
              {["All", "This Month", "Last Month", "Custom"].map(v => (
                <button
                  key={v}
                  onClick={() => setDateRange(v.toLowerCase().replace(" ", "-"))}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dateRange === v.toLowerCase().replace(" ", "-") ? "bg-[#0b2c60] text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}

          {/* Bulk bar */}
          {selected.size > 0 && (
            <div className="mx-3 mt-3 bg-[#0b2c60]/5 border border-[#0b2c60]/20 rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="flex-1 text-xs font-semibold text-[#0b2c60]">{selected.size} selected · ₹{totalSelected}</span>
              <button onClick={() => setSelected(new Set())} className="p-1 text-slate-400">
                <X size={14} />
              </button>
              <button onClick={() => setScreen("export")} className="bg-[#f97316] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Download size={12} /> Export
              </button>
            </div>
          )}

          {/* Receipt cards */}
          <div className="px-3 py-3 space-y-2">
            {filtered.map((r) => (
              <div
                key={r.id}
                onClick={() => { setActiveReceipt(r); setScreen("preview"); }}
                className={`bg-white rounded-2xl border shadow-sm transition-all active:scale-[0.98] ${selected.has(r.id) ? "border-[#0b2c60]/30 bg-[#0b2c60]/[0.02]" : "border-slate-200"}`}
              >
                <div className="p-4 flex items-center gap-3">
                  <Checkbox checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0b2c60] to-[#1a4a9e] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {r.customer.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800 truncate">{r.customer}</p>
                      <span className="text-sm font-bold text-emerald-600 shrink-0">₹{r.amount}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{r.service}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{r.id}</span>
                      <span className="text-[10px] text-slate-400">{r.date}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom padding */}
          <div className="h-4" />
        </div>
      )}

      {/* ══════════════ PREVIEW SCREEN ══════════════ */}
      {screen === "preview" && (
        <div className="flex-1 overflow-y-auto bg-slate-100 px-4 py-5">
          {/* Receipt paper */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100">
            {/* Header stripe */}
            <div className="bg-[#0b2c60] px-5 py-5 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Receipt size={22} className="text-white" />
              </div>
              <p className="text-white font-bold text-lg tracking-tight">SAHU CSC</p>
              <p className="text-white/60 text-xs mt-0.5">Common Service Center, Odisha</p>
            </div>

            {/* Tear line */}
            <div className="flex items-center px-5 py-2">
              <div className="w-4 h-4 rounded-full bg-slate-100 -ml-8 shrink-0" />
              <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
              <div className="w-4 h-4 rounded-full bg-slate-100 -mr-8 shrink-0" />
            </div>

            {/* Receipt details */}
            <div className="px-5 pb-5 space-y-3">
              {[
                { label: "Receipt No.", value: activeReceipt.id, mono: true },
                { label: "Date", value: activeReceipt.date },
                { label: "Customer", value: activeReceipt.customer },
                { label: "Service", value: activeReceipt.service },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between gap-3">
                  <span className="text-xs text-slate-500 shrink-0 mt-0.5">{row.label}</span>
                  <span className={`text-sm font-medium text-slate-800 text-right ${row.mono ? "font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-lg" : ""}`}>
                    {row.value}
                  </span>
                </div>
              ))}

              {/* Tear line */}
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-slate-100 -ml-9 shrink-0" />
                <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
                <div className="w-4 h-4 rounded-full bg-slate-100 -mr-9 shrink-0" />
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between py-1">
                <span className="text-base font-bold text-slate-800">Total Paid</span>
                <span className="text-2xl font-bold text-emerald-600">₹{activeReceipt.amount}</span>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-emerald-600">Payment Confirmed</span>
              </div>

              {/* QR */}
              <div className="flex flex-col items-center py-3">
                <div className="w-24 h-24 bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                  <QrCode size={44} className="text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Scan to verify online</p>
              </div>

              {/* Tear line */}
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-slate-100 -ml-9 shrink-0" />
                <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
                <div className="w-4 h-4 rounded-full bg-slate-100 -mr-9 shrink-0" />
              </div>

              <p className="text-center text-xs text-slate-400">Thank you for using SAHU CSC</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { icon: Printer, label: "Print", color: "bg-[#0b2c60] text-white" },
              { icon: Download, label: "PDF", color: "bg-[#f97316] text-white" },
              { icon: Share2, label: "Share", color: "bg-white text-slate-700 border border-slate-200" },
            ].map(({ icon: Icon, label, color }) => (
              <button key={label} className={`${color} rounded-2xl py-4 flex flex-col items-center gap-2 shadow-sm font-medium text-sm`}>
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>

          {/* WhatsApp CTA */}
          <button className="mt-3 w-full bg-[#25D366] text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            Send via WhatsApp
          </button>
        </div>
      )}

      {/* ══════════════ EXPORT SCREEN ══════════════ */}
      {screen === "export" && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

          {/* Summary */}
          <div className="bg-[#0b2c60]/5 border border-[#0b2c60]/15 rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0b2c60] rounded-xl flex items-center justify-center shrink-0">
              <ArrowDownToLine size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0b2c60]">
                {selected.size > 0 ? `${selected.size} receipts selected` : "Export all receipts"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {selected.size > 0 ? `Total: ₹${totalSelected}` : "41 receipts · ₹12,450 total"}
              </p>
            </div>
          </div>

          {/* Format */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Format</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportFormat("pdf")}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${exportFormat === "pdf" ? "border-[#f97316] bg-[#f97316]/5" : "border-slate-200"}`}
              >
                <FileText size={24} className={exportFormat === "pdf" ? "text-[#f97316]" : "text-slate-400"} />
                <span className={`text-sm font-semibold ${exportFormat === "pdf" ? "text-[#f97316]" : "text-slate-500"}`}>PDF</span>
                <span className="text-[10px] text-slate-400">Printable receipt</span>
              </button>
              <button
                onClick={() => setExportFormat("excel")}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${exportFormat === "excel" ? "border-emerald-500 bg-emerald-50" : "border-slate-200"}`}
              >
                <FileSpreadsheet size={24} className={exportFormat === "excel" ? "text-emerald-600" : "text-slate-400"} />
                <span className={`text-sm font-semibold ${exportFormat === "excel" ? "text-emerald-600" : "text-slate-500"}`}>Excel</span>
                <span className="text-[10px] text-slate-400">Spreadsheet report</span>
              </button>
            </div>
          </div>

          {/* Scope */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Scope</p>
            <div className="space-y-2">
              {[
                { label: "All Receipts", sub: "41 receipts · ₹12,450", active: selected.size === 0 },
                { label: "Selected Only", sub: `${selected.size} selected · ₹${totalSelected}`, active: selected.size > 0 },
                { label: "This Month", sub: "Jun 2026 · 18 receipts", active: false },
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

          {/* Options */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Include</p>
            <div className="space-y-3">
              {[
                { label: "QR Code", sub: "Scan-to-verify link", on: true },
                { label: "Business Stamp", sub: "Official SAHU CSC seal", on: true },
                { label: "Signature Row", sub: "Customer sign space", on: false },
              ].map(opt => (
                <div key={opt.label} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${opt.on ? "bg-[#0b2c60]" : "border-2 border-slate-300"}`}>
                    {opt.on && <Check size={12} className="text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{opt.label}</p>
                    <p className="text-xs text-slate-400">{opt.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="w-full py-4 bg-[#f97316] hover:bg-[#ea580c] text-white text-base font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#f97316]/30"
          >
            {exported
              ? <><Check size={18} /> Exported!</>
              : <><Download size={18} /> Export {selected.size > 0 ? selected.size : "All"}</>}
          </button>

          <div className="h-4" />
        </div>
      )}

      {/* ── Bottom Nav ── */}
      {screen === "list" && (
        <div className="shrink-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-around">
          {[
            { icon: Receipt, label: "Receipts", active: true },
            { icon: Calendar, label: "By Date", active: false },
            { icon: IndianRupee, label: "Summary", active: false },
            { icon: ArrowDownToLine, label: "Export", active: false, action: () => setScreen("export") },
          ].map(({ icon: Icon, label, active, action }) => (
            <button key={label} onClick={action} className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? "bg-[#0b2c60]" : "bg-transparent"}`}>
                <Icon size={18} className={active ? "text-white" : "text-slate-400"} />
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-[#0b2c60]" : "text-slate-400"}`}>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Home indicator ── */}
      <div className="bg-white shrink-0 flex justify-center py-2">
        <div className="w-28 h-1 bg-slate-300 rounded-full" />
      </div>
    </div>
  );
}
