import {
  Search, Loader2, FileArchive, AlertCircle,
  Eye, Printer, Share2,
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

interface DesktopTableProps {
  preview: CountResult | null;
  filteredEntries: PreviewEntry[];
  selected: Set<string>;
  searchQ: string;
  setSearchQ: (v: string) => void;
  expandedEntry: string | null;
  setExpandedEntry: (v: string | null) => void;
  toggleEntry: (id: string) => void;
  toggleAll: () => void;
  allFilteredSelected: boolean;
  openReceiptAction: (receiptNumber: string, action: ModalAction) => void;
  modalLoadingFor: string | null;
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
      <div className="bg-card rounded-xl border border-dashed border-border shadow-sm">
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
      <div className="bg-card rounded-xl border border-amber-200 shadow-sm p-8 text-center">
        <AlertCircle size={32} className="text-amber-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-amber-700">No receipts found</p>
        <p className="text-xs text-amber-600 mt-1">Adjust dates and try again.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Table toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="relative max-w-xs flex-1">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Search receipts…"
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-navy-800)]/20 text-foreground" />
        </div>
        <div className="flex items-center gap-3 ml-3">
          <span className="text-[10px] bg-muted text-muted-foreground font-medium px-2 py-0.5 rounded-full">{filteredEntries.length} receipts</span>
          <span className="text-xs font-bold text-emerald-600">₹{totalAmount.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="px-4 py-3 w-8">
              <Checkbox checked={allFilteredSelected} onChange={toggleAll} />
            </th>
            {["Receipt #", "Date", "Customer", "Service", "Amount", "Actions"].map((h, i) => (
              <th key={h} className={`px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide ${i >= 4 ? "text-right" : "text-left"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-zinc-700/50">
          {filteredEntries.map((e) => (
            <tr key={e.receiptNumber}
              onClick={() => setExpandedEntry(expandedEntry === e.receiptNumber ? null : e.receiptNumber)}
              className={`cursor-pointer transition-colors ${expandedEntry === e.receiptNumber ? "bg-[var(--brand-navy-800)]/5 dark:bg-[var(--brand-navy-800)]/10" : "hover:bg-slate-50 dark:hover:bg-zinc-700/50"}`}>
              <td className="px-4 py-3" onClick={ev => { ev.stopPropagation(); toggleEntry(e.receiptNumber); }}>
                <Checkbox checked={selected.has(e.receiptNumber)} onChange={() => toggleEntry(e.receiptNumber)} />
              </td>
              <td className="px-3 py-3">
                <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${expandedEntry === e.receiptNumber ? "bg-[var(--brand-navy-800)] text-white" : "bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200"}`}>
                  {e.receiptNumber}
                </span>
              </td>
              <td className="px-3 py-3 text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">{fmtDateShort(e.date)}</td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0"
                    style={{ background: `linear-gradient(135deg, ${NAVY}, var(--brand-navy-600))` }}>
                    {e.customerName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-slate-800 dark:text-zinc-100 truncate max-w-[110px]">{e.customerName}</span>
                </div>
              </td>
              <td className="px-3 py-3 text-xs text-slate-500 dark:text-zinc-400 max-w-[130px] truncate">{e.serviceType}</td>
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
                      className="w-6 h-6 rounded hover:bg-slate-100 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors disabled:opacity-40">
                      {modalLoadingFor === e.receiptNumber ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} />}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 border-t border-slate-100 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-zinc-400">{filteredEntries.length} receipts · {fmtDate(startDate)} → {fmtDate(endDate)}</span>
        <span className="text-sm font-bold text-emerald-600">₹{totalAmount.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}
