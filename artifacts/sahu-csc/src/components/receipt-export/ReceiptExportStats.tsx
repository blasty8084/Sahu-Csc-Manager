import { Receipt, IndianRupee, TrendingUp, ArrowDownToLine, CheckSquare } from "lucide-react";
import { NAVY, SAFFRON, type CountResult, type PreviewEntry } from "./types";

// ── Desktop 4-stat bar ────────────────────────────────────────────────────────
interface DesktopStatBarProps {
  preview: CountResult | null;
  totalAmount: number;
  displayedEntries: PreviewEntry[];
  selectedSize: number;
}

export function DesktopStatBar({ preview, totalAmount, displayedEntries, selectedSize }: DesktopStatBarProps) {
  const stats = [
    {
      label: "Total Receipts",
      value: preview ? String(preview.count) : "—",
      icon: Receipt, bg: NAVY, iconBg: "bg-white/15",
    },
    {
      label: "Total Amount",
      value: preview ? `₹${totalAmount.toLocaleString("en-IN")}` : "—",
      icon: IndianRupee, bg: "#059669", iconBg: "bg-white/15",
    },
    {
      label: "Credit Entries",
      value: preview ? String(displayedEntries.filter(e => e.type === "credit").length) : "—",
      icon: TrendingUp, bg: SAFFRON, iconBg: "bg-white/15",
    },
    {
      label: "Selected",
      value: String(selectedSize),
      icon: ArrowDownToLine, bg: "#7c3aed", iconBg: "bg-white/15",
    },
  ];
  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map(stat => (
        <div key={stat.label} className="rounded-xl p-3.5 text-white flex items-center gap-3" style={{ background: stat.bg }}>
          <div className={`${stat.iconBg} w-9 h-9 rounded-lg flex items-center justify-center shrink-0`}>
            <stat.icon size={18} />
          </div>
          <div>
            <p className="text-xl font-bold leading-none">{stat.value}</p>
            <p className="text-[11px] text-white/70 mt-0.5">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Mobile 3-stat KPI strip ───────────────────────────────────────────────────
interface MobileKpiStripProps {
  preview: CountResult | null;
  totalAmount: number;
  selectedSize: number;
}

export function MobileKpiStrip({ preview, totalAmount, selectedSize }: MobileKpiStripProps) {
  const stats = [
    { label: "Total",    value: preview ? String(preview.count) : "—",                     icon: Receipt     },
    { label: "Amount",   value: preview ? `₹${totalAmount.toLocaleString("en-IN")}` : "—", icon: IndianRupee },
    { label: "Selected", value: String(selectedSize),                                        icon: CheckSquare },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map(stat => (
        <div key={stat.label} className="rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ background: NAVY }}>
          <stat.icon size={14} color={SAFFRON} className="shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-none truncate">{stat.value}</p>
            <p className="text-[10px] text-white/50 mt-0.5">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Mobile Summary tab cards ──────────────────────────────────────────────────
interface MobileSummaryCardsProps {
  preview: CountResult | null;
  totalAmount: number;
  displayedEntries: PreviewEntry[];
}

export function MobileSummaryCards({ preview, totalAmount, displayedEntries }: MobileSummaryCardsProps) {
  if (!preview) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16">
        <TrendingUp size={40} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">No data yet</p>
        <p className="text-xs text-slate-400 mt-1">Preview receipts first to see summary</p>
      </div>
    );
  }
  const stats = [
    { label: "Total Receipts", value: String(preview.count),                                             icon: Receipt,         bg: NAVY      },
    { label: "Total Amount",   value: `₹${totalAmount.toLocaleString("en-IN")}`,                        icon: IndianRupee,     bg: "#059669" },
    { label: "Credit Entries", value: String(displayedEntries.filter(e => e.type === "credit").length), icon: TrendingUp,      bg: SAFFRON   },
    { label: "Debit Entries",  value: String(displayedEntries.filter(e => e.type === "debit").length),  icon: ArrowDownToLine, bg: "#7c3aed" },
  ];
  return (
    <div className="space-y-3">
      {stats.map(stat => (
        <div key={stat.label} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: stat.bg }}>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <stat.icon size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/70">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
