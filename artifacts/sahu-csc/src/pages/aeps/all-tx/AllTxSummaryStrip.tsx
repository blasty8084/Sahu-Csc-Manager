import { TrendingDown, TrendingUp } from "lucide-react";
import { fmt } from "../aeps.constants";

interface AllTxSummaryStripProps {
  pageWithdrawals: number;
  pageDeposits: number;
}

/** Two-card strip showing withdrawal and deposit totals for the current page. */
export function AllTxSummaryStrip({ pageWithdrawals, pageDeposits }: AllTxSummaryStripProps) {
  const items = [
    { label: "Withdrawals (this page)", value: pageWithdrawals, accent: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "#e11d48", Icon: TrendingDown },
    { label: "Deposits (this page)", value: pageDeposits, accent: "linear-gradient(135deg, #10b981, #059669)", color: "#059669", Icon: TrendingUp },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.label} className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.07)" }}>
          <div style={{ height: 3, background: item.accent }} />
          <div className="px-3 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <item.Icon size={13} style={{ color: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }} className="truncate">{item.label}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: item.color, flexShrink: 0 }}>₹{fmt(item.value)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
