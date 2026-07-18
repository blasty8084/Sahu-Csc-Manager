import { Clock, Mail, Download, Loader2, TrendingUp } from "lucide-react";
import { NAVY, SAFFRON, MONTH_OPTIONS } from "./types";

interface ReceiptMonthlyPanelProps {
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

export function ReceiptMonthlyPanel({
  trigMonth, trigYear, setTrigMonth, setTrigYear,
  years, monthDownloading, emailing, nextExport,
  handleMonthDownload, handleMonthEmail,
}: ReceiptMonthlyPanelProps) {
  return (
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
            <select value={trigMonth} onChange={e => setTrigMonth(Number(e.target.value))}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none text-slate-700">
              {MONTH_OPTIONS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Year</label>
            <select value={trigYear} onChange={e => setTrigYear(Number(e.target.value))}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none text-slate-700">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <p className="text-[10px] text-center text-slate-500">
          Selected: <strong className="text-slate-700">{MONTH_OPTIONS.find(m => m.v === trigMonth)?.l} {trigYear}</strong>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleMonthDownload} disabled={monthDownloading}
            className="py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50">
            {monthDownloading ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
            Download
          </button>
          <button onClick={handleMonthEmail} disabled={emailing}
            className="py-2 text-xs font-bold text-white rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
            {emailing
              ? <><Loader2 size={11} className="animate-spin" /> Sending…</>
              : <><Mail size={11} /> Email Admins</>}
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
          <TrendingUp size={11} className="text-slate-400 shrink-0" />
          <p className="text-[10px] text-slate-500">Next auto-run: <strong className="text-slate-700">{nextExport}</strong></p>
        </div>
      </div>
    </div>
  );
}
