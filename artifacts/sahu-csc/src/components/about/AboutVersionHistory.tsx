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
              background: idx === 0 ? "linear-gradient(90deg,rgba(249,115,22,0.08),transparent)" : undefined,
              borderBottom: "1px solid hsl(var(--border))",
            }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-xl"
              style={{
                width: 30, height: 30,
                background: idx === 0 ? "linear-gradient(135deg,#f97316,#ea580c)" : "linear-gradient(135deg,#0b2c60,#1a4a9e)",
                boxShadow: idx === 0 ? "0 2px 8px rgba(249,115,22,0.4)" : "0 2px 6px rgba(11,44,96,0.25)",
              }}
            >
              <Clock size={13} color="#fff" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: idx === 0 ? "rgba(249,115,22,0.15)" : "rgba(11,44,96,0.08)",
                    color: idx === 0 ? "#f97316" : "#1a4a9e",
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
