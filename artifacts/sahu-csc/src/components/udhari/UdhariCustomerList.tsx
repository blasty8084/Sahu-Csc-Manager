import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { UdhariListSkeleton } from "@/components/skeletons";
import { CustomerCard, CustomerRow } from "@/components/udhari/UdhariCustomerCard";
import { Users } from "lucide-react";

interface UdhariCustomerListProps {
  sorted: any[];
  isLoading: boolean;
  go: (id: number) => void;
}

export function UdhariCustomerList({ sorted, isLoading, go }: UdhariCustomerListProps) {
  const { t } = useTranslation();
  return (
    <>
      {/* Mobile card list */}
      <div className="space-y-2 sm:hidden">
        {isLoading ? (
          <UdhariListSkeleton />
        ) : sorted.length === 0 ? (
          <div className="text-center py-14">
            <Users size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">{t("udhari.no_customers")}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{t("udhari.tap_to_add")}</p>
          </div>
        ) : (
          sorted.map((c: any) => <CustomerCard key={c.id} c={c} onClick={() => go(c.id)} />)
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16">
            <Users size={36} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">{t("udhari.no_customers")}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{t("udhari.click_to_add")}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[t("udhari.col_customer"), t("udhari.col_mobile"), t("udhari.col_balance"), t("udhari.col_last_activity"), ""].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {sorted.map((c: any) => <CustomerRow key={c.id} c={c} onClick={() => go(c.id)} />)}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
