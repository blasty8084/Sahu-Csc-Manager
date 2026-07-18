import { Clock, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PendingLedgerEntry } from "@/lib/offline-db";

interface LedgerMobilePendingProps {
  pendingEntries: PendingLedgerEntry[];
  bgSyncCount: number;
  isOffline: boolean;
  activeTab: "transactions" | "receipts";
}

export function LedgerMobilePending({ pendingEntries, bgSyncCount, isOffline, activeTab }: LedgerMobilePendingProps) {
  if (activeTab !== "transactions" || pendingEntries.length === 0) return null;
  return (
    <div className="md:hidden bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Clock size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
          {pendingEntries.length} offline {pendingEntries.length === 1 ? "entry" : "entries"} — will sync when connected
        </p>
        {isOffline && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-500">
            <WifiOff size={11} /> Offline
          </span>
        )}
      </div>
      {bgSyncCount > 0 && (
        <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/40 rounded-lg px-3 py-2">
          <Clock size={12} className="text-violet-600 dark:text-violet-400 flex-shrink-0" />
          <p className="text-[11px] font-semibold text-violet-700 dark:text-violet-400">
            {bgSyncCount} {bgSyncCount === 1 ? "request" : "requests"} retrying in background
          </p>
        </div>
      )}
      <div className="space-y-2">
        {pendingEntries.slice(0, 5).map((entry) => (
          <div key={entry.id} className="flex items-center gap-3 bg-white dark:bg-amber-950/30 rounded-lg px-3 py-2 border border-amber-100 dark:border-amber-800/30">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{entry.customerName || "—"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{entry.serviceType} · {entry.date}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              {entry.credit > 0 && <p className="text-xs font-bold text-emerald-600">+₹{entry.credit.toLocaleString("en-IN")}</p>}
              {entry.debit > 0 && <p className="text-xs font-bold text-rose-500">-₹{entry.debit.toLocaleString("en-IN")}</p>}
            </div>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-amber-300 text-amber-600 dark:text-amber-400 flex-shrink-0">
              Pending
            </Badge>
          </div>
        ))}
        {pendingEntries.length > 5 && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400 text-center">
            +{pendingEntries.length - 5} more
          </p>
        )}
      </div>
    </div>
  );
}
