import { useState } from "react";
import { Layout } from "@/components/layout";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Download, FileText, FileSpreadsheet,
  Calendar, Receipt, IndianRupee, X, Check,
  ArrowDownToLine, Mail,
  Clock, Loader2, TrendingUp, Hash, CheckSquare,
} from "lucide-react";
import { ReceiptModal } from "@/components/receipt-modal";
import { useReceiptExport } from "@/hooks/useReceiptExport";
import {
  NAVY, SAFFRON, MONTH_OPTIONS, fmtDate, type MobileTab, type PreviewEntry,
} from "@/components/receipt-export/types";
import {
  DesktopExportFilters,
  MobileExportFilterToggle,
  MobileExportFilterPanel,
  MobileByDatePanel,
} from "@/components/receipt-export/ExportFilters";
import {
  DesktopReceiptTable,
  DesktopReceiptExpandedPreview,
  MobileReceiptList,
} from "@/components/receipt-export/ReceiptPreviewList";

export default function ReceiptExport() {
  const s = useReceiptExport();

  // ── Mobile-only UI navigation state (no effect on API calls) ──
  const [mobileTab,   setMobileTab]   = useState<MobileTab>("receipts");
  const [showPreview, setShowPreview] = useState(false);
  const [activeEntry, setActiveEntry] = useState<PreviewEntry | null>(null);

  const isMobile = useIsMobile();

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
            <select value={s.trigMonth} onChange={e => s.setTrigMonth(Number(e.target.value))}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none text-slate-700">
              {MONTH_OPTIONS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Year</label>
            <select value={s.trigYear} onChange={e => s.setTrigYear(Number(e.target.value))}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none text-slate-700">
              {s.years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <p className="text-[10px] text-center text-slate-500">
          Selected: <strong className="text-slate-700">{MONTH_OPTIONS.find(m => m.v === s.trigMonth)?.l} {s.trigYear}</strong>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={s.handleMonthDownload} disabled={s.monthDownloading}
            className="py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50">
            {s.monthDownloading ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
            Download
          </button>
          <button onClick={s.handleMonthEmail} disabled={s.emailing}
            className="py-2 text-xs font-bold text-white rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
            {s.emailing
              ? <><Loader2 size={11} className="animate-spin" /> Sending…</>
              : <><Mail size={11} /> Email Admins</>}
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
          <TrendingUp size={11} className="text-slate-400 shrink-0" />
          <p className="text-[10px] text-slate-500">Next auto-run: <strong className="text-slate-700">{s.nextExport}</strong></p>
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
          { label: "Total Receipts",  value: s.preview ? String(s.preview.count) : "—",
            icon: Receipt,         bg: NAVY,         iconBg: "bg-white/15" },
          { label: "Total Amount",    value: s.preview ? `₹${s.totalAmount.toLocaleString("en-IN")}` : "—",
            icon: IndianRupee,     bg: "#059669",    iconBg: "bg-white/15" },
          { label: "Credit Entries",  value: s.preview ? String(s.displayedEntries.filter(e => e.type === "credit").length) : "—",
            icon: TrendingUp,      bg: SAFFRON,      iconBg: "bg-white/15" },
          { label: "Selected",        value: String(s.selected.size),
            icon: ArrowDownToLine, bg: "#7c3aed",    iconBg: "bg-white/15" },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-3.5 text-white flex items-center gap-3" style={{ background: stat.bg }}>
            <div className={`${stat.iconBg} w-9 h-9 rounded-lg flex items-center justify-center shrink-0`}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{stat.value}</p>
              <p className="text-[11px] text-white/70 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-column body ── */}
      <div className="flex gap-5 items-start">

        {/* ── Left: Filter bar + bulk bar + table ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Filter bar */}
          <DesktopExportFilters
            startDate={s.startDate}  endDate={s.endDate}
            userId={s.userId}        dateRange={s.dateRange}
            today={s.today}          usersOverview={s.usersOverview}
            previewing={s.previewing}
            setStartDate={s.setStartDate}  setEndDate={s.setEndDate}
            setUserId={s.setUserId}        setPreview={() => s.setSelected(new Set()) /* preview cleared inside hook */}
            onPreview={s.handlePreview}    onQuickRange={s.setQuickRange}
            setDateRange={s.setDateRange}
          />

          {/* Bulk action bar */}
          {s.selected.size > 0 && s.preview && (
            <div className="bg-[#0b2c60]/5 border border-[#0b2c60]/20 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: NAVY }}>
                <Hash size={9} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-[#0b2c60]">{s.selected.size} selected · ₹{s.selTotal.toLocaleString("en-IN")}</span>
              <div className="flex-1" />
              <button onClick={() => s.setSelected(new Set())} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
                <X size={12} /> Clear
              </button>
              <button onClick={s.handleDownload} disabled={s.downloading}
                className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                style={{ background: SAFFRON }}>
                {s.downloading
                  ? <><Loader2 size={12} className="animate-spin" /> Generating…</>
                  : <><Download size={12} /> Download {s.selected.size} ZIP</>}
              </button>
            </div>
          )}

          {/* Table / empty state */}
          <DesktopReceiptTable
            preview={s.preview}
            filteredEntries={s.filteredEntries}
            selected={s.selected}
            searchQ={s.searchQ}             setSearchQ={s.setSearchQ}
            expandedEntry={s.expandedEntry} setExpandedEntry={s.setExpandedEntry}
            toggleEntry={s.toggleEntry}     toggleAll={s.toggleAll}
            allFilteredSelected={s.allFilteredSelected}
            openReceiptAction={s.openReceiptAction}
            modalLoadingFor={s.modalLoadingFor}
            startDate={s.startDate}  endDate={s.endDate}
            totalAmount={s.totalAmount}
          />
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
                  <button onClick={() => s.setExportFormat("pdf")}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border-2 text-xs font-medium transition-all ${s.exportFormat === "pdf" ? "border-[#f97316] bg-[#f97316]/5 text-[#f97316]" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                    <FileText size={18} />
                    PDF
                  </button>
                  <button onClick={() => s.setExportFormat("excel")}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border-2 text-xs font-medium transition-all ${s.exportFormat === "excel" ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
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
                    { label: "All Receipts",  sub: s.preview ? `${s.preview.count} receipts` : "Preview first" },
                    { label: "Selected Only", sub: `${s.selected.size} selected` },
                    { label: "Date Range",    sub: s.startDate && s.endDate ? `${fmtDate(s.startDate)} → ${fmtDate(s.endDate)}` : "Set dates above" },
                  ].map((opt, i) => (
                    <label key={opt.label} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${i === (s.selected.size > 0 ? 1 : 0) ? "border-[#0b2c60]" : "border-slate-300"}`}>
                        {i === (s.selected.size > 0 ? 1 : 0) && <div className="w-1.5 h-1.5 rounded-full bg-[#0b2c60]" />}
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
              <button onClick={s.handleDownload} disabled={s.downloading || !s.preview || s.preview.count === 0}
                className="w-full py-2.5 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                style={{ background: SAFFRON }}>
                {s.downloading
                  ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
                  : s.exported
                    ? <><Check size={14} /> Done!</>
                    : <><Download size={14} /> Export {s.selected.size > 0 ? s.selected.size : "All"}</>}
              </button>
              {!s.preview && (
                <p className="text-center text-[10px] text-slate-400">Preview receipts first to enable export</p>
              )}
            </div>
          </div>

          {/* Expanded receipt mini-preview */}
          <DesktopReceiptExpandedPreview
            expandedEntry={s.expandedEntry}
            filteredEntries={s.filteredEntries}
            openReceiptAction={s.openReceiptAction}
            modalLoadingFor={s.modalLoadingFor}
          />

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
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Scan to verify online</p>
          </div>
          <p className="text-center text-xs text-slate-400">Thank you for using SAHU CSC</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {([
          { icon: "printer",  label: "Print",  color: "bg-[#0b2c60] text-white", action: "print"    as const },
          { icon: "download", label: "PDF",    color: "bg-[#f97316] text-white", action: "download" as const },
          { icon: "share",    label: "Share",  color: "bg-white text-slate-700 border border-slate-200", action: "share" as const },
        ]).map(({ icon, label, color, action }) => (
          <button key={label}
            onClick={() => s.openReceiptAction(activeEntry.receiptNumber, action)}
            disabled={s.modalLoadingFor === activeEntry.receiptNumber}
            className={`${color} rounded-2xl py-4 flex flex-col items-center gap-2 shadow-sm font-medium text-sm disabled:opacity-50`}>
            {s.modalLoadingFor === activeEntry.receiptNumber
              ? <Loader2 size={20} className="animate-spin" />
              : icon === "printer"
                ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                : icon === "download"
                  ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            }
            {label}
          </button>
        ))}
      </div>
      <button
        onClick={() => s.openReceiptAction(activeEntry.receiptNumber, "whatsapp")}
        disabled={s.modalLoadingFor === activeEntry.receiptNumber}
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
          { label: "Total",    value: s.preview ? String(s.preview.count) : "—",                         icon: Receipt      },
          { label: "Amount",   value: s.preview ? `₹${s.totalAmount.toLocaleString("en-IN")}` : "—",     icon: IndianRupee  },
          { label: "Selected", value: String(s.selected.size),                                            icon: CheckSquare  },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ background: NAVY }}>
            <stat.icon size={14} color={SAFFRON} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-white leading-none truncate">{stat.value}</p>
              <p className="text-[10px] text-white/50 mt-0.5">{stat.label}</p>
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
          <MobileExportFilterToggle
            showFilters={s.showFilters}
            setShowFilters={s.setShowFilters}
            searchQ={s.searchQ}
            setSearchQ={s.setSearchQ}
          />

          {s.showFilters && (
            <MobileExportFilterPanel
              startDate={s.startDate}  endDate={s.endDate}
              userId={s.userId}        dateRange={s.dateRange}
              today={s.today}          usersOverview={s.usersOverview}
              previewing={s.previewing}
              setStartDate={s.setStartDate}  setEndDate={s.setEndDate}
              setUserId={s.setUserId}        setPreview={() => {}}
              onPreview={s.handlePreview}    onQuickRange={s.setQuickRange}
              setDateRange={s.setDateRange}
              showFilters={s.showFilters}    setShowFilters={s.setShowFilters}
              searchQ={s.searchQ}            setSearchQ={s.setSearchQ}
              onPreviewAndClose={() => { s.handlePreview(); s.setShowFilters(false); }}
            />
          )}

          <MobileReceiptList
            preview={s.preview}
            filteredEntries={s.filteredEntries}
            selected={s.selected}
            searchQ={s.searchQ}
            showFilters={s.showFilters}
            setShowFilters={s.setShowFilters}
            selTotal={s.selTotal}
            setSelected={s.setSelected}
            toggleEntry={s.toggleEntry}
            openReceiptAction={s.openReceiptAction}
            modalLoadingFor={s.modalLoadingFor}
            onEntryClick={(entry) => { setActiveEntry(entry); setShowPreview(true); }}
            onGoToExport={() => setMobileTab("export")}
          />
        </div>
      )}

      {/* ══ BY DATE TAB ══ */}
      {!showPreview && mobileTab === "byDate" && (
        <MobileByDatePanel
          startDate={s.startDate}  endDate={s.endDate}
          userId={s.userId}        dateRange={s.dateRange}
          today={s.today}          usersOverview={s.usersOverview}
          previewing={s.previewing}
          setStartDate={s.setStartDate}  setEndDate={s.setEndDate}
          setUserId={s.setUserId}        setPreview={() => {}}
          onPreview={s.handlePreview}    onQuickRange={s.setQuickRange}
          setDateRange={s.setDateRange}
          onPreviewAndSwitch={() => { s.handlePreview(); setMobileTab("receipts"); }}
        />
      )}

      {/* ══ SUMMARY TAB ══ */}
      {!showPreview && mobileTab === "summary" && (
        <div className="space-y-3">
          {!s.preview ? (
            <div className="flex flex-col items-center justify-center text-center py-16">
              <TrendingUp size={40} className="text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-500">No data yet</p>
              <p className="text-xs text-slate-400 mt-1">Preview receipts first to see summary</p>
            </div>
          ) : (
            [
              { label: "Total Receipts", value: String(s.preview.count),                                                          icon: Receipt,         bg: NAVY         },
              { label: "Total Amount",   value: `₹${s.totalAmount.toLocaleString("en-IN")}`,                                     icon: IndianRupee,     bg: "#059669"    },
              { label: "Credit Entries", value: String(s.displayedEntries.filter(e => e.type === "credit").length),               icon: TrendingUp,      bg: SAFFRON      },
              { label: "Debit Entries",  value: String(s.displayedEntries.filter(e => e.type === "debit").length),                icon: ArrowDownToLine, bg: "#7c3aed"    },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: stat.bg }}>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <stat.icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/70">{stat.label}</p>
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
                {s.selected.size > 0 ? `${s.selected.size} receipts selected` : s.preview ? `Export all ${s.preview.count} receipts` : "No receipts previewed"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {s.selected.size > 0 ? `₹${s.selTotal.toLocaleString("en-IN")}` : s.preview ? `₹${s.totalAmount.toLocaleString("en-IN")}` : "Preview receipts first"}
              </p>
            </div>
          </div>

          {/* Format */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Format</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => s.setExportFormat("pdf")}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${s.exportFormat === "pdf" ? "border-[#f97316] bg-[#f97316]/5" : "border-slate-200"}`}>
                <FileText size={24} className={s.exportFormat === "pdf" ? "text-[#f97316]" : "text-slate-400"} />
                <span className={`text-sm font-semibold ${s.exportFormat === "pdf" ? "text-[#f97316]" : "text-slate-500"}`}>PDF</span>
                <span className="text-[10px] text-slate-400">Printable receipt</span>
              </button>
              <button onClick={() => s.setExportFormat("excel")}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${s.exportFormat === "excel" ? "border-emerald-500 bg-emerald-50" : "border-slate-200"}`}>
                <FileSpreadsheet size={24} className={s.exportFormat === "excel" ? "text-emerald-600" : "text-slate-400"} />
                <span className={`text-sm font-semibold ${s.exportFormat === "excel" ? "text-emerald-600" : "text-slate-500"}`}>Excel</span>
                <span className="text-[10px] text-slate-400">Spreadsheet report</span>
              </button>
            </div>
          </div>

          {/* Scope radios */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Scope</p>
            <div className="space-y-2">
              {[
                { label: "All Receipts",  sub: s.preview ? `${s.preview.count} receipts · ₹${s.totalAmount.toLocaleString("en-IN")}` : "Preview first", active: s.selected.size === 0 && !!s.preview },
                { label: "Selected Only", sub: `${s.selected.size} selected · ₹${s.selTotal.toLocaleString("en-IN")}`, active: s.selected.size > 0 },
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
          <button onClick={s.handleDownload} disabled={s.downloading || !s.preview || s.preview.count === 0}
            className="w-full py-4 text-white text-base font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50"
            style={{ background: SAFFRON, boxShadow: "0 4px 24px rgba(249,115,22,0.3)" }}>
            {s.downloading
              ? <><Loader2 size={18} className="animate-spin" /> Generating ZIP…</>
              : s.exported
                ? <><Check size={18} /> Exported!</>
                : <><Download size={18} /> Download {s.selected.size > 0 ? s.selected.size : s.preview?.count ?? "All"} as ZIP</>}
          </button>

          {!s.preview && (
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
        entry={s.modalEntry}
        open={s.modalOpen}
        onClose={() => { s.setModalOpen(false); s.setModalAction(null); }}
        businessName={s.business.businessName}
        businessAddress={s.business.businessAddress}
        businessMobile={s.business.businessMobile}
        businessWebsite={s.business.businessWebsite}
        autoAction={s.modalAction}
        onAutoActionComplete={() => s.setModalAction(null)}
      />
    </Layout>
  );
}
