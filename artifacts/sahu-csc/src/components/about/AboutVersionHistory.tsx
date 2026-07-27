import { CheckCircle2, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CHANGELOG } from "./about-changelog-data";

export default function AboutVersionHistory() {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {CHANGELOG.map((entry, idx) => (
        <div key={idx} className="bg-card border rounded-xl overflow-hidden">
          {/* Entry header */}
          <div
            className="flex items-center gap-3 px-4 py-2.5"
            style={{
              background: idx === 0 ? "linear-gradient(90deg,var(--brand-orange-tint-xs),transparent)" : undefined,
              borderBottom: "1px solid hsl(var(--border))",
            }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-xl"
              style={{
                width: 30, height: 30,
                background: idx === 0 ? "linear-gradient(135deg,var(--brand-orange),var(--brand-orange-600))" : "linear-gradient(135deg,var(--brand-navy-800),var(--brand-navy-600))",
                boxShadow: idx === 0 ? "0 2px 8px var(--brand-orange-glow)" : "0 2px 6px var(--brand-navy-shadow-sm)",
              }}
            >
              <Clock size={13} color="#fff" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: idx === 0 ? "var(--brand-orange-tint-sm)" : "var(--brand-navy-tint-md)",
                    color: idx === 0 ? "var(--brand-orange)" : "var(--brand-navy-600)",
                  }}
                >
                  {entry.version}
                </span>
                <span className="text-sm font-bold truncate">{entry.title}</span>
                {idx === 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 flex-shrink-0">
                    {t("about.latest")}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{entry.date}</p>
            </div>
          </div>
          {/* Changes */}
          <ul className="px-4 py-3 space-y-1.5">
            {entry.changes.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
