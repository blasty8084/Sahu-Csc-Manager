import { useTranslation } from "react-i18next";
import { useGetUdhariSummary } from "@workspace/api-client-react";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { fmt } from "@/components/udhari/UdhariCustomerCard";

export function UdhariSummaryBanner() {
  const { t } = useTranslation();
  const { data, isLoading } = useGetUdhariSummary();
  const cards = [
    {
      label: t("udhari.to_collect"), value: (data as any)?.toCollect ?? 0,
      accent: "linear-gradient(135deg,#f97316,#ea580c)", color: "#ea580c",
      light: "rgba(249,115,22,0.07)", border: "rgba(249,115,22,0.18)",
      icon: ArrowUpRight, sub: t("udhari.customers_owe"),
    },
    {
      label: t("udhari.to_pay"), value: (data as any)?.toPay ?? 0,
      accent: "linear-gradient(135deg,#10b981,#059669)", color: "#059669",
      light: "rgba(16,185,129,0.07)", border: "rgba(16,185,129,0.18)",
      icon: ArrowDownLeft, sub: t("udhari.you_owe"),
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl overflow-hidden bg-white"
          style={{ boxShadow: `0 2px 12px ${c.color}18`, border: `1px solid ${c.border}` }}>
          <div style={{ height: 3, background: c.accent }} />
          <div className="px-4 py-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{c.label}</p>
              {isLoading
                ? <div className="h-6 w-24 mt-1 rounded bg-slate-100 animate-pulse" />
                : <p style={{ fontSize: 18, fontWeight: 900, color: c.color, lineHeight: 1.1, marginTop: 3 }}>{fmt(c.value)}</p>}
              <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{c.sub}</p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 10px ${c.color}28` }}>
              <c.icon size={16} color="#fff" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
