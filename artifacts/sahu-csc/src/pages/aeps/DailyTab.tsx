import { AepsSkeleton } from "@/components/skeletons";
import { Plus, Wallet } from "lucide-react";
import { fmtDate } from "./aeps.constants";
import { OpeningBalanceHeroCard } from "./OpeningBalanceHeroCard";
import { useDailyTab } from "@/hooks/useDailyTab";
import { DailyTabEntryRow } from "@/components/aeps/daily/DailyTabEntryRow";
import { DailyTabSummaryCard } from "@/components/aeps/daily/DailyTabSummaryCard";
import { DailyTabEntryList } from "@/components/aeps/daily/DailyTabEntryList";
import { DailyTabForm } from "@/components/aeps/daily/DailyTabForm";

export function DailyTab() {
  const state = useDailyTab();
  const { session, isLoading, selectedDate, isToday, openForm, setShowOpenDialog } = state;

  return (
    <div className="space-y-4">

      {/* ── Date Navigator ── */}
      <DailyTabEntryRow
        selectedDate={selectedDate}
        setSelectedDate={state.setSelectedDate}
        isToday={isToday}
      />

      {/* ── Loading ── */}
      {isLoading ? (
        <AepsSkeleton />
      ) : !session ? (

        /* ── No session ── */
        <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 14px rgba(11,44,96,0.09)" }}>
          <div style={{ height: 4, background: "linear-gradient(90deg, #f59e0b, #fbbf24)" }} />
          <div className="bg-white px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
              boxShadow: "0 6px 20px rgba(245,158,11,0.30)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Wallet size={30} color="#fff" />
            </div>
            <div>
              <p className="font-bold text-lg" style={{ color: "#0b2c60" }}>
                {isToday ? "Today's session not opened" : `No session for ${fmtDate(selectedDate)}`}
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Set the opening balance (cash loaded in hand) to start recording AePS transactions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowOpenDialog(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #0b2c60, #1a4a9e)", boxShadow: "0 4px 14px rgba(11,44,96,0.35)" }}
            >
              <Plus size={16} /> Set Opening Balance
            </button>
          </div>
        </div>

      ) : (
        <div className="space-y-4">
          {/* ── Opening Balance Hero Card ── */}
          <OpeningBalanceHeroCard
            session={session}
            onEdit={() => {
              openForm.setValue("openingBalance", String(session.openingBalance));
              openForm.setValue("notes", session.notes ?? "");
              setShowOpenDialog(true);
            }}
          />

          {/* ── Summary Cards — Withdrawals / Deposits / Balance ── */}
          <DailyTabSummaryCard session={session} />

          {/* ── Action Buttons + Transaction List ── */}
          <DailyTabEntryList state={state} />
        </div>
      )}

      {/* ── All dialogs and form overlays ── */}
      <DailyTabForm state={state} />
    </div>
  );
}

export default DailyTab;
