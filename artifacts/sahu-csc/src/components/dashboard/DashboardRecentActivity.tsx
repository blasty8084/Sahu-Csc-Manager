import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { RecentTxSkeleton } from "@/components/skeletons";
import { useTranslation } from "react-i18next";

const INIT_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-purple-500", "bg-teal-500", "bg-rose-500"];

interface RecentEntry {
  id: number;
  customerName: string;
  serviceType: string;
  credit: number;
  debit: number;
  balance: string | number;
  date: string;
}

export function DashboardRecentActivity({ data, isLoading }: { data: any; isLoading: boolean }) {
  const { t } = useTranslation();

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-sm font-bold">{t('dashboard.recent_transactions')}</h2>
          <p className="text-muted-foreground text-[10px]">Latest ledger entries</p>
        </div>
        <Link href="/ledger">
          <span className="text-primary text-xs font-semibold flex items-center gap-0.5 cursor-pointer">
            {t('dashboard.view_all_ledger')} <ChevronRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {isLoading ? (
        <RecentTxSkeleton />
      ) : !data?.recentEntries?.length ? (
        <p className="text-center text-muted-foreground py-10 text-sm">{t('dashboard.no_transactions')}</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {[
                t('ledger.col_id'), t('ledger.col_customer'), t('ledger.col_service'),
                t('ledger.col_date'), t('ledger.col_amount'), t('ledger.col_amount'), t('common.balance'),
              ].map((h, idx) => (
                <th key={idx} className="text-left px-5 py-2.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.recentEntries.map((entry: RecentEntry, i: number) => {
              const initial = (entry.customerName || "?").charAt(0).toUpperCase();
              const color = INIT_COLORS[i % INIT_COLORS.length];
              return (
                <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-muted-foreground text-xs font-medium">{i + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-[10px] font-bold">{initial}</span>
                      </div>
                      <span className="text-foreground text-xs font-semibold truncate max-w-[120px]">{entry.customerName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">{entry.serviceType}</span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-[10px]">{entry.date}</td>
                  <td className="px-5 py-3 text-emerald-600 text-xs font-bold">
                    {entry.credit > 0 ? `₹${entry.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                  </td>
                  <td className="px-5 py-3 text-rose-500 text-xs font-bold">
                    {entry.debit > 0 ? `₹${entry.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                  </td>
                  <td className="px-5 py-3 text-foreground text-xs font-bold">
                    {entry.balance !== undefined
                      ? `₹${Number(entry.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
