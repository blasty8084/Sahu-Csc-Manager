import { Download, Trash2 } from "lucide-react";

interface LedgerDesktopHeaderProps {
  t: (key: string) => string;
  onDeleteAll: () => void;
}

export function LedgerDesktopHeader({ t, onDeleteAll }: LedgerDesktopHeaderProps) {
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "white", borderRadius: 20, flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid var(--color-slate-200)" }}>
      {/* Gradient accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,var(--brand-navy-800) 0%,var(--brand-navy-500) 40%,var(--brand-orange) 75%,var(--brand-orange-600) 100%)", zIndex: 3, borderRadius: "20px 20px 0 0" }} />
      {/* Hex mesh */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.05, pointerEvents: "none", borderRadius: 20 }} preserveAspectRatio="none">
        <defs>
          <pattern id="lhdr-hex" x="0" y="0" width="28" height="24" patternUnits="userSpaceOnUse">
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="var(--brand-navy-800)" strokeWidth="0.9" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lhdr-hex)" />
      </svg>
      {/* Aurora blobs */}
      <div style={{ position: "absolute", top: -20, right: 60, width: 110, height: 110, background: "radial-gradient(circle,var(--brand-orange-tint-xs) 0%,transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -5, left: "42%", width: 90, height: 70, background: "radial-gradient(circle,var(--brand-navy-tint-md) 0%,transparent 70%)", filter: "blur(16px)", pointerEvents: "none" }} />
      {/* Bottom border */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,var(--color-slate-200),transparent)", zIndex: 2 }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: 60, position: "relative", zIndex: 2 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--brand-navy-800)", margin: 0 }}>{t("ledger.title") || "Ledger"}</h1>
          <p style={{ fontSize: 11, color: "var(--color-slate-500)", fontWeight: 500, marginTop: 2 }}>{t("ledger.subtitle") || "Track all your transactions and manage records seamlessly."}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/api/reports/export" target="_blank"
            style={{ display: "flex", alignItems: "center", gap: 6, height: 34, paddingInline: 14, borderRadius: 10, border: "1.5px solid var(--color-slate-200)", background: "var(--color-slate-50)", color: "var(--color-slate-700)", fontSize: 12, fontWeight: 600, textDecoration: "none", cursor: "pointer" }}>
            <Download size={13} />Export
          </a>
          <button onClick={onDeleteAll}
            style={{ display: "flex", alignItems: "center", gap: 6, height: 34, paddingInline: 14, borderRadius: 10, border: "1.5px solid rgba(225,29,72,0.25)", background: "rgba(225,29,72,0.05)", color: "var(--color-error)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Trash2 size={13} />Delete All
          </button>
        </div>
      </div>
    </div>
  );
}
