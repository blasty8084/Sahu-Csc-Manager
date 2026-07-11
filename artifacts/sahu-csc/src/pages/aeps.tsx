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
          style={{ boxShadow: "0 4px 20px rgba(11,44,96,0.18)" }}
        >
          <div
            className="px-5 py-5 flex items-center gap-4"
            style={{ background: "linear-gradient(135deg, #0b2c60 0%, #0f3872 60%, #1a4a9e 100%)" }}
          >
            <div
              style={{
                width: 48, height: 48, borderRadius: 15, flexShrink: 0,
                background: "rgba(255,255,255,0.12)",
                border: "1.5px solid rgba(255,255,255,0.2)",
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
            style={{ background: "rgba(11,44,96,0.04)", borderTop: "1px solid rgba(11,44,96,0.09)" }}
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
                  color: tab === key ? "#0b2c60" : "#94a3b8",
                  borderBottom: tab === key ? "2.5px solid #0b2c60" : "2.5px solid transparent",
                  background: tab === key ? "rgba(11,44,96,0.05)" : "transparent",
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
