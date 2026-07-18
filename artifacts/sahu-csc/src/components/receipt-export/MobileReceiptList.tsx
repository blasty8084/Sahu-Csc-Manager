import { FileArchive, AlertCircle, ChevronRight, CheckSquare, Square } from "lucide-react";
import {
  NAVY, SAFFRON,
  fmtDateShort,
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

interface MobileListProps {
  preview: CountResult | null;
  filteredEntries: PreviewEntry[];
  selected: Set<string>;
  searchQ: string;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  selTotal: number;
  setSelected: (v: Set<string>) => void;
  toggleEntry: (id: string) => void;
  openReceiptAction: (receiptNumber: string, action: ModalAction) => void;
  modalLoadingFor: string | null;
  onEntryClick: (entry: PreviewEntry) => void;
  onGoToExport: () => void;
}

export function MobileReceiptList({
  preview, filteredEntries, selected,
  showFilters, setShowFilters,
  selTotal, setSelected,
  toggleEntry,
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
