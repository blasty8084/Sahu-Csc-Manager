import { useTranslation } from "react-i18next";
import { fmt } from "./utils";

interface Props {
  balance: number;
}

export function UdhariCustomerStats({ balance }: Props) {
  const { t } = useTranslation();
  const isCollect = balance > 0;
  const isPay = balance < 0;
  const color = isCollect ? "#ea580c" : isPay ? "#059669" : "#64748b";
  const bg = isCollect
    ? "linear-gradient(135deg,#fff7ed,#fed7aa)"
    : isPay
      ? "linear-gradient(135deg,#f0fdf4,#bbf7d0)"
      : "linear-gradient(135deg,#f8fafc,#f1f5f9)";

  return (
    <div className="rounded-2xl p-5 text-center" style={{ background: bg, boxShadow: `0 2px 16px ${color}22` }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: `${color}99` }}>
        {isCollect ? t("udhari.customer.to_collect") : isPay ? t("udhari.customer.to_pay") : t("udhari.customer.settled")}
      </p>
      <p className="text-4xl font-black" style={{ color }}>{fmt(balance)}</p>
      {balance === 0 && (
        <p className="text-xs text-muted-foreground mt-1">{t("udhari.customer.no_pending")}</p>
      )}
    </div>
  );
}
