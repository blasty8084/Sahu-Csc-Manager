import { Check } from "lucide-react";

interface ServicePickerProps {
  value: string;
  onChange: (v: string) => void;
  services?: any[];
  serviceTypes: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  government: "🏛 Government",
  recharge: "📱 Recharge",
  print: "🖨 Print & Scan",
};
const CATEGORY_ORDER = ["government", "recharge", "print"];

/**
 * Modern visual chip-grid service picker.
 * Replaces the plain <Select> dropdown with tappable colored pill chips
 * grouped by category. Selected chip fills with the service's brand color.
 */
export function ServicePicker({ value, onChange, services, serviceTypes }: ServicePickerProps) {
  // ── Build grouped structure from full service objects if available ──
  if (services?.length) {
    const grouped: Record<string, any[]> = {};
    for (const s of services) {
      const cat = s.category ?? "other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s);
    }
    const orderedKeys = [
      ...CATEGORY_ORDER.filter(k => grouped[k]),
      ...Object.keys(grouped).filter(k => !CATEGORY_ORDER.includes(k)),
    ];

    return (
      <div data-testid="service-picker" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {orderedKeys.map(cat => (
          <div key={cat}>
            {/* Category label */}
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.09em",
              textTransform: "uppercase", color: "var(--color-slate-400)",
              marginBottom: 6,
            }}>
              {CATEGORY_LABELS[cat] ?? cat}
            </p>
            {/* Chip row — wraps naturally */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {grouped[cat].map((s: any) => {
                const selected = value === s.name;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => onChange(selected ? "" : s.name)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      height: 32,
                      paddingLeft: 10,
                      paddingRight: selected ? 10 : 12,
                      borderRadius: 100,
                      border: selected ? "none" : `1.5px solid ${s.color ?? "var(--color-slate-200)"}30`,
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 12,
                      background: selected
                        ? (s.color ?? "var(--brand-navy-800)")
                        : "var(--surface-card-near-white, #f8fafc)",
                      color: selected ? "#fff" : "var(--brand-navy-800)",
                      boxShadow: selected
                        ? `0 4px 14px ${s.color ?? "#000"}50`
                        : "0 1px 3px rgba(0,0,0,0.07)",
                      transition: "all 0.15s ease",
                      flexShrink: 0,
                    }}
                  >
                    {/* Color dot */}
                    <span style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: selected ? "rgba(255,255,255,0.7)" : (s.color ?? "#6B7280"),
                      flexShrink: 0,
                    }} />
                    {s.name}
                    {selected && <Check size={11} strokeWidth={3} style={{ marginLeft: 1, opacity: 0.9 }} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Other */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(() => {
            const selected = value === "Other";
            return (
              <button
                type="button"
                onClick={() => onChange(selected ? "" : "Other")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  height: 32, paddingLeft: 10, paddingRight: selected ? 10 : 12,
                  borderRadius: 100,
                  border: selected ? "none" : "1.5px solid var(--color-slate-200)",
                  cursor: "pointer", fontWeight: 700, fontSize: 12,
                  background: selected ? "var(--brand-navy-800)" : "var(--surface-card-near-white, #f8fafc)",
                  color: selected ? "#fff" : "var(--color-slate-400)",
                  boxShadow: selected ? "0 4px 14px rgba(11,19,64,0.35)" : "0 1px 3px rgba(0,0,0,0.07)",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: selected ? "rgba(255,255,255,0.6)" : "var(--color-slate-300)" }} />
                Other
                {selected && <Check size={11} strokeWidth={3} style={{ marginLeft: 1 }} />}
              </button>
            );
          })()}
        </div>
      </div>
    );
  }

  // ── Fallback: flat chip list from serviceTypes string array ──
  return (
    <div data-testid="service-picker" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {[...serviceTypes, "Other"].map(name => {
        const selected = value === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(selected ? "" : name)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              height: 32, paddingLeft: 10, paddingRight: selected ? 10 : 12,
              borderRadius: 100,
              border: selected ? "none" : "1.5px solid var(--color-slate-200)",
              cursor: "pointer", fontWeight: 700, fontSize: 12,
              background: selected ? "var(--brand-navy-800)" : "var(--surface-card-near-white, #f8fafc)",
              color: selected ? "#fff" : "var(--brand-navy-800)",
              boxShadow: selected ? "0 4px 14px rgba(11,19,64,0.35)" : "0 1px 3px rgba(0,0,0,0.07)",
              transition: "all 0.15s ease",
            }}
          >
            {selected && <Check size={11} strokeWidth={3} />}
            {name}
          </button>
        );
      })}
    </div>
  );
}
