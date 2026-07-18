import { Eye, Printer, Share2, Download, Loader2, Receipt, QrCode } from "lucide-react";
import { NAVY, fmtDate, type PreviewEntry, type ModalAction } from "./types";

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
