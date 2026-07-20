import { Download, FileText, FileSpreadsheet, Check, Loader2, ArrowDownToLine } from "lucide-react";
import { NAVY, SAFFRON, type CountResult } from "./types";
import { ReceiptMonthlyPanel } from "./ReceiptMonthlyPanel";

interface MobileExportTabProps {
  selected: Set<string>;
  preview: CountResult | null;
  selTotal: number;
  totalAmount: number;
  exportFormat: "pdf" | "excel";
  setExportFormat: (v: "pdf" | "excel") => void;
  downloading: boolean;
  exported: boolean;
  handleDownload: () => void;
  trigMonth: number;
  trigYear: number;
  setTrigMonth: (v: number) => void;
  setTrigYear: (v: number) => void;
  years: number[];
  monthDownloading: boolean;
  emailing: boolean;
  nextExport: string;
  handleMonthDownload: () => void;
  handleMonthEmail: () => void;
}

export function MobileExportTab({
  selected, preview, selTotal, totalAmount,
  exportFormat, setExportFormat,
  downloading, exported, handleDownload,
  trigMonth, trigYear, setTrigMonth, setTrigYear,
  years, monthDownloading, emailing, nextExport,
  handleMonthDownload, handleMonthEmail,
}: MobileExportTabProps) {
  return (
    <div className="space-y-4 pb-4">
      {/* Scope summary */}
      <div className="border rounded-2xl px-4 py-3.5 flex items-center gap-3" style={{ background: "#0b2c6010", borderColor: "#0b2c6026" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: NAVY }}>
          <ArrowDownToLine size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: NAVY }}>
            {selected.size > 0 ? `${selected.size} receipts selected` : preview ? `Export all ${preview.count} receipts` : "No receipts previewed"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {selected.size > 0 ? `₹${selTotal.toLocaleString("en-IN")}` : preview ? `₹${totalAmount.toLocaleString("en-IN")}` : "Preview receipts first"}
          </p>
        </div>
      </div>
      {/* Format */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Format</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setExportFormat("pdf")}
            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${exportFormat === "pdf" ? "border-[#f97316] bg-[#f97316]/5" : "border-slate-200"}`}>
            <FileText size={24} className={exportFormat === "pdf" ? "text-[#f97316]" : "text-slate-400"} />
            <span className={`text-sm font-semibold ${exportFormat === "pdf" ? "text-[#f97316]" : "text-slate-500"}`}>PDF</span>
            <span className="text-[10px] text-slate-400">Printable receipt</span>
          </button>
          <button onClick={() => setExportFormat("excel")}
            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${exportFormat === "excel" ? "border-emerald-500 bg-emerald-50" : "border-slate-200"}`}>
            <FileSpreadsheet size={24} className={exportFormat === "excel" ? "text-emerald-600" : "text-slate-400"} />
            <span className={`text-sm font-semibold ${exportFormat === "excel" ? "text-emerald-600" : "text-slate-500"}`}>Excel</span>
            <span className="text-[10px] text-slate-400">Spreadsheet report</span>
          </button>
        </div>
      </div>
      {/* Scope radios */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Scope</p>
        <div className="space-y-2">
          {[
            { label: "All Receipts",  sub: preview ? `${preview.count} receipts · ₹${totalAmount.toLocaleString("en-IN")}` : "Preview first", active: selected.size === 0 && !!preview },
            { label: "Selected Only", sub: `${selected.size} selected · ₹${selTotal.toLocaleString("en-IN")}`, active: selected.size > 0 },
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
      {/* Monthly auto-export */}
      <ReceiptMonthlyPanel
        trigMonth={trigMonth} trigYear={trigYear}
        setTrigMonth={setTrigMonth} setTrigYear={setTrigYear}
        years={years} monthDownloading={monthDownloading}
        emailing={emailing} nextExport={nextExport}
        handleMonthDownload={handleMonthDownload} handleMonthEmail={handleMonthEmail}
      />
      {/* CTA */}
      <button onClick={handleDownload} disabled={downloading || !preview || preview.count === 0}
        className="w-full py-4 text-white text-base font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50"
        style={{ background: SAFFRON, boxShadow: "0 4px 24px rgba(249,115,22,0.3)" }}>
        {downloading
          ? <><Loader2 size={18} className="animate-spin" /> Generating ZIP…</>
          : exported
            ? <><Check size={18} /> Exported!</>
            : <><Download size={18} /> Download {selected.size > 0 ? selected.size : preview?.count ?? "All"} as ZIP</>}
      </button>
      {!preview && <p className="text-center text-xs text-slate-400">Go to Receipts tab and set a date range first</p>}
    </div>
  );
}
