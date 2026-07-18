import { useTranslation } from "react-i18next";
import { Phone, ChevronRight } from "lucide-react";

// ─── Shared helpers ────────────────────────────────────────────────────────────
export function fmt(n: number) {
  return `₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export function BalanceBadge({ balance }: { balance: number }) {
  const { t } = useTranslation();
  if (balance > 0) {
    return (
      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background: "rgba(249,115,22,0.12)", color: "#ea580c" }}>
        {t("udhari.to_collect")} {fmt(balance)}
      </span>
    );
  }
  if (balance < 0) {
    return (
      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background: "rgba(16,185,129,0.12)", color: "#059669" }}>
        {t("udhari.to_pay")} {fmt(balance)}
      </span>
    );
  }
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
      {t("udhari.settled_zero")}
    </span>
  );
}

// ─── Mobile card ───────────────────────────────────────────────────────────────
export function CustomerCard({ c, onClick }: { c: any; onClick: () => void }) {
  const initials = c.name.slice(0, 2).toUpperCase();
  const color = c.balance > 0 ? "#ea580c" : c.balance < 0 ? "#059669" : "#94a3b8";
  const bg    = c.balance > 0 ? "rgba(249,115,22,0.10)" : c.balance < 0 ? "rgba(16,185,129,0.10)" : "rgba(148,163,184,0.10)";
  return (
    <button onClick={onClick} className="w-full text-left bg-white rounded-2xl overflow-hidden flex items-center gap-3 px-4 py-3"
      style={{ boxShadow: "0 1px 8px rgba(11,44,96,0.07)" }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm"
        style={{ background: bg, color }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate" style={{ color: "#0b2c60" }}>{c.name}</p>
        {c.mobile && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Phone size={9} /> {c.mobile}
          </p>
        )}
        <div className="mt-1"><BalanceBadge balance={c.balance} /></div>
      </div>
      <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
    </button>
  );
}

// ─── Desktop table row ─────────────────────────────────────────────────────────
export function CustomerRow({ c, onClick }: { c: any; onClick: () => void }) {
  const initials = c.name.slice(0, 2).toUpperCase();
  const color = c.balance > 0 ? "#ea580c" : c.balance < 0 ? "#059669" : "#94a3b8";
  const bg    = c.balance > 0 ? "rgba(249,115,22,0.10)" : c.balance < 0 ? "rgba(16,185,129,0.10)" : "rgba(148,163,184,0.10)";
  return (
    <tr className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={onClick}>
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0"
            style={{ background: bg, color }}>
            {initials}
          </div>
          <span className="font-semibold text-sm text-foreground">{c.name}</span>
        </div>
      </td>
      <td className="px-5 py-3 text-xs text-muted-foreground">{c.mobile || "—"}</td>
      <td className="px-5 py-3"><BalanceBadge balance={c.balance} /></td>
      <td className="px-5 py-3 text-xs text-muted-foreground">
        {new Date(c.updatedAt).toLocaleDateString("en-IN")}
      </td>
      <td className="px-5 py-3">
        <ChevronRight size={14} className="text-muted-foreground" />
      </td>
    </tr>
  );
}
