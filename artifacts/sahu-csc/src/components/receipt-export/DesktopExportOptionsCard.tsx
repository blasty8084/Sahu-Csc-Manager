import { Download, FileText, FileSpreadsheet, Check, Loader2, ArrowDownToLine } from "lucide-react";
import { NAVY, SAFFRON, fmtDate, type CountResult } from "./types";

interface DesktopExportOptionsCardProps {
  exportFormat: "pdf" | "excel";
  setExportFormat: (v: "pdf" | "excel") => void;
  selected: Set<string>;
  preview: CountResult | null;
  startDate: string;
  endDate: string;
  downloading: boolean;
  exported: boolean;
  handleDownload: () => void;
}

export function DesktopExportOptionsCard({
  exportFormat, setExportFormat, selected, preview,
  startDate, endDate, downloading, exported, handleDownload,
}: DesktopExportOptionsCardProps) {
  return (
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
            <button onClick={() => setExportFormat("pdf")}
              className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border-2 text-xs font-medium transition-all ${exportFormat === "pdf" ? "border-[#f97316] bg-[#f97316]/5 text-[#f97316]" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
              <FileText size={18} />PDF
            </button>
            <button onClick={() => setExportFormat("excel")}
              className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border-2 text-xs font-medium transition-all ${exportFormat === "excel" ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
              <FileSpreadsheet size={18} />Excel
            </button>
          </div>
        </div>
        {/* Scope */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Scope</p>
          <div className="space-y-1.5">
            {[
              { label: "All Receipts",  sub: preview ? `${preview.count} receipts` : "Preview first" },
              { label: "Selected Only", sub: `${selected.size} selected` },
              { label: "Date Range",    sub: startDate && endDate ? `${fmtDate(startDate)} → ${fmtDate(endDate)}` : "Set dates above" },
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
        {/* CTA */}
        <button onClick={handleDownload} disabled={downloading || !preview || preview.count === 0}
          className="w-full py-2.5 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          style={{ background: SAFFRON }}>
          {downloading
            ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
            : exported
              ? <><Check size={14} /> Done!</>
              : <><Download size={14} /> Export {selected.size > 0 ? selected.size : "All"}</>}
        </button>
        {!preview && <p className="text-center text-[10px] text-slate-400">Preview receipts first to enable export</p>}
      </div>
    </div>
  );
}
