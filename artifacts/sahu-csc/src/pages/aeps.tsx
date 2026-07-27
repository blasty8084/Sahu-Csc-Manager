import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { Fingerprint, CalendarDays, Filter } from "lucide-react";
import DailyTab from "./aeps/DailyTab";
import AllTransactionsTab from "./aeps/AllTransactionsTab";

// ─────────────────────────────────────────────────────────
// Page Root
// ─────────────────────────────────────────────────────────
type Tab = "daily" | "all";

export default function AePS() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("daily");

  return (
    <Layout>
      <div className="space-y-5">

        {/* ── Page Header ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 4px 20px var(--brand-navy-border-md)" }}
        >
          <div
            className="px-5 py-5 flex items-center gap-4"
            style={{ background: "linear-gradient(135deg, var(--brand-navy-800) 0%, var(--brand-navy-700) 60%, var(--brand-navy-600) 100%)" }}
          >
            <div
              style={{
                width: 48, height: 48, borderRadius: 15, flexShrink: 0,
                background: "var(--brand-white-mid)",
                border: "1.5px solid var(--brand-white-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Fingerprint size={26} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                AePS Cash Management
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                Aadhaar-enabled Payment System · Daily cash tracking
              </p>
            </div>
          </div>

          {/* Tab strip */}
          <div
            className="flex"
            style={{ background: "var(--brand-navy-tint-sm)", borderTop: "1px solid var(--brand-navy-tint-md)" }}
          >
            {([
              { key: "daily" as Tab, label: "Daily Session", icon: CalendarDays },
              { key: "all" as Tab, label: "All Transactions", icon: Filter },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all flex-1 justify-center"
                style={{
                  color: tab === key ? "var(--brand-navy-800)" : "var(--color-slate-400)",
                  borderBottom: tab === key ? "2.5px solid var(--brand-navy-800)" : "2.5px solid transparent",
                  background: tab === key ? "var(--brand-navy-tint-sm)" : "transparent",
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        {tab === "daily" ? <DailyTab /> : <AllTransactionsTab />}
      </div>
    </Layout>
  );
}
