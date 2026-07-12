import {
  Search, Loader2, FileArchive, AlertCircle,
  Eye, Printer, Share2, ChevronRight,
  Receipt, QrCode, Download,
  CheckSquare, Square,
} from "lucide-react";
import {
  NAVY, SAFFRON,
  fmtDate, fmtDateShort,
  type PreviewEntry, type CountResult, type ModalAction,
} from "./types";

function Checkbox({ checked, onChange, size = 16 }: { checked: boolean; onChange: () => void; size?: number }) {
  return (
    <button onClick={onChange} className="shrink-0">
      {checked
        ? <CheckSquare size={size} color={NAVY} />
        : <Square     size={size} className="text-slate-300" />}
    </button>
  );
}

// ── Shared props ──────────────────────────────────────────────────────────────
interface ListProps {
  preview: CountResult | null;
  filteredEntries: PreviewEntry[];
  selected: Set<string>;
  toggleEntry: (id: string) => void;
  openReceiptAction: (receiptNumber: string, action: ModalAction) => void;
  modalLoadingFor: string | null;
}

// ── Desktop receipt table ─────────────────────────────────────────────────────
interface DesktopTableProps extends ListProps {
  searchQ: string;
  setSearchQ: (v: string) => void;
  expandedEntry: string | null;
  setExpandedEntry: (v: string | null) => void;
  toggleAll: () => void;
  allFilteredSelected: boolean;
  startDate: string;
  endDate: string;
  totalAmount: number;
}

export function DesktopReceiptTable({
  preview, filteredEntries, selected,
  searchQ, setSearchQ,
  expandedEntry, setExpandedEntry,
  toggleEntry, toggleAll, allFilteredSelected,
  openReceiptAction, modalLoadingFor,
  startDate, endDate, totalAmount,
}: DesktopTableProps) {
  if (!preview) {
    return (
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
    );
  }

  if (preview.count === 0) {
    return (
      <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-8 text-center">
        <AlertCircle size={32} className="text-amber-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-amber-700">No receipts found</p>
        <p className="text-xs text-amber-600 mt-1">Adjust dates and try again.</p>
      </div>
    );
  }

  return (
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
  );
}

// ── Desktop expanded receipt mini-preview (right sidebar) ─────────────────────
interface ExpandedPreviewProps {
  expandedEntry: string | null;
  filteredEntries: PreviewEntry[];
  openReceiptAction: (receiptNumber: string, action: ModalAction) => void;
  modalLoadingFor: string | null;
}

export function DesktopReceiptExpandedPreview({
  expandedEntry, filteredEntries, openReceiptAction, modalLoadingFor,
}: ExpandedPreviewProps) {
  if (!expandedEntry) return null;
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
}

// ── Mobile receipt card list ──────────────────────────────────────────────────
interface MobileListProps extends ListProps {
  searchQ: string;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  selTotal: number;
  setSelected: (v: Set<string>) => void;
  onEntryClick: (entry: PreviewEntry) => void;
  onGoToExport: () => void;
}

export function MobileReceiptList({
  preview, filteredEntries, selected,
  searchQ, showFilters, setShowFilters,
  selTotal, setSelected,
  toggleEntry, openReceiptAction, modalLoadingFor,
  onEntryClick, onGoToExport,
}: MobileListProps) {
  if (!preview) {
    return (
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
    );
  }

  if (preview.count === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 text-center py-10">
        <AlertCircle size={36} className="text-amber-400 mb-2" />
        <p className="text-sm font-semibold text-amber-700">No receipts found</p>
        <p className="text-xs text-amber-600 mt-1">Adjust dates and try again.</p>
      </div>
    );
  }

  return (
    <>
      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="bg-[#0b2c60]/5 border border-[#0b2c60]/20 rounded-2xl px-4 py-2.5 flex items-center gap-2">
          <span className="flex-1 text-xs font-semibold text-[#0b2c60]">{selected.size} selected · ₹{selTotal.toLocaleString("en-IN")}</span>
          <button onClick={() => setSelected(new Set())} className="p-1 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <button onClick={onGoToExport}
            className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
            style={{ background: SAFFRON }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-2 pb-2">
        {filteredEntries.map((e) => (
          <div key={e.receiptNumber}
            onClick={() => onEntryClick(e)}
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
    </>
  );
}
