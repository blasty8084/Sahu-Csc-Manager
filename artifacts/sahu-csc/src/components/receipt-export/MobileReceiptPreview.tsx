import { Receipt, Loader2 } from "lucide-react";
import { NAVY, SAFFRON, fmtDate, type PreviewEntry, type ModalAction } from "./types";

interface MobileReceiptPreviewProps {
  entry: PreviewEntry;
  onBack: () => void;
  openReceiptAction: (receiptNumber: string, action: ModalAction) => void;
  modalLoadingFor: string | null;
}

export function MobileReceiptPreview({
  entry, onBack, openReceiptAction, modalLoadingFor,
}: MobileReceiptPreviewProps) {
  return (
    <div>
      <button onClick={onBack} className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
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
            { label: "Receipt No.", value: entry.receiptNumber, mono: true },
            { label: "Date",        value: fmtDate(entry.date) },
            { label: "Customer",    value: entry.customerName },
            { label: "Service",     value: entry.serviceType },
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
            <span className={`text-2xl font-bold ${entry.type === "credit" ? "text-emerald-600" : "text-rose-500"}`}>
              {entry.type === "credit" ? "+" : "-"}₹{entry.amount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${entry.type === "credit" ? "bg-emerald-400" : "bg-rose-400"}`} />
            <span className={`text-xs font-semibold ${entry.type === "credit" ? "text-emerald-600" : "text-rose-500"}`}>
              {entry.type === "credit" ? "Payment Confirmed" : "Debit Entry"}
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
          { icon: "printer",  label: "Print",  color: "bg-[#0b2c60] text-white",                          action: "print"    as const },
          { icon: "download", label: "PDF",    color: "bg-[#f97316] text-white",                          action: "download" as const },
          { icon: "share",    label: "Share",  color: "bg-white text-slate-700 border border-slate-200",  action: "share"    as const },
        ]).map(({ icon, label, color, action }) => (
          <button key={label}
            onClick={() => openReceiptAction(entry.receiptNumber, action)}
            disabled={modalLoadingFor === entry.receiptNumber}
            className={`${color} rounded-2xl py-4 flex flex-col items-center gap-2 shadow-sm font-medium text-sm disabled:opacity-50`}>
            {modalLoadingFor === entry.receiptNumber
              ? <Loader2 size={20} className="animate-spin" />
              : icon === "printer"
                ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                : icon === "download"
                  ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>}
            {label}
          </button>
        ))}
      </div>
      <button
        onClick={() => openReceiptAction(entry.receiptNumber, "whatsapp")}
        disabled={modalLoadingFor === entry.receiptNumber}
        className="mt-3 w-full bg-[#25D366] text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold shadow-sm disabled:opacity-50">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        Send via WhatsApp
      </button>
    </div>
  );
}
