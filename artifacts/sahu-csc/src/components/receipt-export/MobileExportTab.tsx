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
      <div className="border rounded-2xl px-4 py-3.5 flex items-center gap-3" style={{ background: "var(--brand-navy-800)10", borderColor: "var(--brand-navy-800)26" }}>
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
      <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Format</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setExportFormat("pdf")}
            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${exportFormat === "pdf" ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]/5" : "border-border"}`}>
            <FileText size={24} className={exportFormat === "pdf" ? "text-[var(--brand-orange)]" : "text-muted-foreground"} />
            <span className={`text-sm font-semibold ${exportFormat === "pdf" ? "text-[var(--brand-orange)]" : "text-muted-foreground"}`}>PDF</span>
            <span className="text-[10px] text-muted-foreground">Printable receipt</span>
          </button>
          <button onClick={() => setExportFormat("excel")}
            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${exportFormat === "excel" ? "border-emerald-500 bg-emerald-50" : "border-border"}`}>
            <FileSpreadsheet size={24} className={exportFormat === "excel" ? "text-emerald-600" : "text-muted-foreground"} />
            <span className={`text-sm font-semibold ${exportFormat === "excel" ? "text-emerald-600" : "text-muted-foreground"}`}>Excel</span>
            <span className="text-[10px] text-muted-foreground">Spreadsheet report</span>
          </button>
        </div>
      </div>
      {/* Scope radios */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Scope</p>
        <div className="space-y-2">
          {[
            { label: "All Receipts",  sub: preview ? `${preview.count} receipts · ₹${totalAmount.toLocaleString("en-IN")}` : "Preview first", active: selected.size === 0 && !!preview },
            { label: "Selected Only", sub: `${selected.size} selected · ₹${selTotal.toLocaleString("en-IN")}`, active: selected.size > 0 },
          ].map(opt => (
            <div key={opt.label} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${opt.active ? "bg-[var(--brand-navy-800)]/5 border border-[var(--brand-navy-800)]/20" : "bg-muted/50"}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${opt.active ? "border-[var(--brand-navy-800)]" : "border-slate-300"}`}>
                {opt.active && <div className="w-2 h-2 rounded-full bg-[var(--brand-navy-800)]" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.sub}</p>
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
        style={{ background: SAFFRON, boxShadow: "0 4px 24px var(--brand-orange-border)" }}>
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
