import { useGetUdhariSummary } from "@workspace/api-client-react";
import { ChevronRight, HandCoins } from "lucide-react";
import { useTranslation } from "react-i18next";

export function UdhariSummaryCard({ mobile = false }: { mobile?: boolean }) {
  const { t } = useTranslation();
  const { data, isLoading } = useGetUdhariSummary();
  const toCollect = data?.toCollect ?? 0;
  const toPay = data?.toPay ?? 0;
  if (!isLoading && toCollect === 0 && toPay === 0 && (data?.totalCustomers ?? 0) === 0) return null;
  return (
    <a href="/udhari" style={{ textDecoration: "none" }}>
      <div
        className={`rounded-2xl overflow-hidden ${mobile ? "" : "border border-border shadow-sm"}`}
        style={mobile ? { boxShadow: "0 2px 12px rgba(11,44,96,0.08)" } : {}}
      >
        <div style={{ height: 3, background: "linear-gradient(90deg,#0b2c60,#f97316)" }} />
        <div className="bg-white px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)" }}>
            <HandCoins size={15} color="#fff" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-muted-foreground">{t('nav.udhari')}</p>
            <p className="text-[10px] text-muted-foreground/60">{t('dashboard.customer_credit_ledger')}</p>
          </div>
          {isLoading ? (
            <div className="flex gap-3">
              <div className="w-16 h-8 rounded bg-muted animate-pulse" />
              <div className="w-16 h-8 rounded bg-muted animate-pulse" />
            </div>
          ) : (
            <div className="flex gap-3 text-right">
              <div>
                <p className="text-[9px] font-semibold text-muted-foreground uppercase">{t('dashboard.to_collect')}</p>
                <p className="text-sm font-black" style={{ color: "#ea580c" }}>₹{toCollect.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-muted-foreground uppercase">{t('dashboard.to_pay')}</p>
                <p className="text-sm font-black" style={{ color: "#059669" }}>₹{toPay.toLocaleString("en-IN")}</p>
              </div>
            </div>
          )}
          <ChevronRight size={13} className="text-muted-foreground flex-shrink-0 ml-1" />
        </div>
      </div>
    </a>
  );
}
