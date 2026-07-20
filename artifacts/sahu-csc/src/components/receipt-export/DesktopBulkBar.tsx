import { Download, Loader2, X, Hash } from "lucide-react";
import { NAVY, SAFFRON } from "./types";

interface DesktopBulkBarProps {
  selectedSize: number;
  selTotal: number;
  downloading: boolean;
  clearSelected: () => void;
  handleDownload: () => void;
}

export function DesktopBulkBar({
  selectedSize, selTotal, downloading, clearSelected, handleDownload,
}: DesktopBulkBarProps) {
  return (
    <div className="bg-[#0b2c60]/5 border border-[#0b2c60]/20 rounded-xl px-4 py-2.5 flex items-center gap-3">
      <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: NAVY }}>
        <Hash size={9} className="text-white" />
      </div>
      <span className="text-xs font-semibold text-[#0b2c60]">
        {selectedSize} selected · ₹{selTotal.toLocaleString("en-IN")}
      </span>
      <div className="flex-1" />
      <button onClick={clearSelected} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
        <X size={12} /> Clear
      </button>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
        style={{ background: SAFFRON }}
      >
        {downloading
          ? <><Loader2 size={12} className="animate-spin" /> Generating…</>
          : <><Download size={12} /> Download {selectedSize} ZIP</>}
      </button>
    </div>
  );
}
