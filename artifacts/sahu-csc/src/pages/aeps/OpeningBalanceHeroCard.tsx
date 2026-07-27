import { useTranslation } from "react-i18next";
import { Wallet, Pencil, StickyNote } from "lucide-react";
import { fmt, fmtDate, type AepsSession } from "./aeps.constants";

// ─────────────────────────────────────────────────────────
// Opening Balance Hero Card
// ─────────────────────────────────────────────────────────
export function OpeningBalanceHeroCard({
  session, onEdit,
}: {
  session: NonNullable<AepsSession>;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg,var(--brand-navy-800) 0%,var(--brand-navy-700) 55%,var(--brand-navy-600) 100%)",
        boxShadow: "0 8px 28px var(--brand-navy-shadow), 0 2px 8px var(--brand-navy-border-md)",
      }}
    >
      <div style={{ height: 3, background: "linear-gradient(90deg,var(--brand-orange),var(--brand-orange-400),#fde68a)" }} />
      <div className="px-5 py-4">
        {/* Label + edit button */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: "var(--brand-orange-tint-md)", border: "1px solid var(--brand-orange-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Wallet size={14} color="var(--brand-orange)" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.70)", textTransform: "uppercase", letterSpacing: "0.09em" }}>
              {t("aeps.opening_balance")}
            </span>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all active:scale-95"
            style={{
              background: "var(--brand-white-low)", border: "1px solid var(--brand-white-high)",
              color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 700,
            }}
          >
            <Pencil size={11} /> {t("common.edit")}
          </button>
        </div>

        {/* Amount */}
        <div className="flex items-end gap-1.5 mb-3">
          <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.50)", marginBottom: 5 }}>₹</span>
          <span style={{ fontSize: 44, fontWeight: 900, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.03em" }}>
            {fmt(session.openingBalance)}
          </span>
        </div>

        {/* Notes pill */}
        {session.notes && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
            style={{ background: "var(--brand-white-glass)", border: "1px solid var(--brand-white-low)" }}
          >
            <StickyNote size={11} color="rgba(255,255,255,0.50)" />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.60)", fontStyle: "italic" }}>{session.notes}</span>
          </div>
        )}

        {/* Mini stats row */}
        <div className="flex gap-2">
          {[
            { label: t("common.date"), value: fmtDate(session.date).split(",")[0] },
            { label: t("aeps.active_session"), value: t("common.active") },
            { label: t("dashboard.txns"), value: String(session.transactions.length) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex-1 rounded-xl px-2 py-2 text-center"
              style={{ background: "var(--brand-white-glass)", border: "1px solid var(--brand-white-low)" }}
            >
              <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.40)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
              <p style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
