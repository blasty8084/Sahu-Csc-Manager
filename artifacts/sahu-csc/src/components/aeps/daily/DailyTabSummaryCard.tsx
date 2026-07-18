import { TrendingDown, TrendingUp, IndianRupee } from "lucide-react";
import { StatCard } from "@/pages/aeps/StatCard";
import type { AepsSession } from "@/pages/aeps/aeps.constants";

// AepsSession is `{…} | null`; the parent guards with `!session` before rendering.
type NonNullSession = NonNullable<AepsSession>;

interface DailyTabSummaryCardProps {
  session: NonNullSession;
}

/** Three summary stat cards: Withdrawals / Deposits / Current Balance. */
export function DailyTabSummaryCard({ session }: DailyTabSummaryCardProps) {
  const s = session as NonNullSession;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <StatCard
        label="Withdrawals"
        value={s.totalWithdrawals}
        accent="linear-gradient(135deg, #f43f5e, #e11d48)"
        color="#e11d48"
        icon={TrendingDown}
      />
      <StatCard
        label="Deposits"
        value={session.totalDeposits}
        accent="linear-gradient(135deg, #10b981, #059669)"
        color="#059669"
        icon={TrendingUp}
      />
      <StatCard
        label="Current Balance"
        value={session.currentBalance}
        accent={session.currentBalance < 0
          ? "linear-gradient(135deg, #f43f5e, #e11d48)"
          : "linear-gradient(135deg, #10b981, #059669)"}
        color={session.currentBalance < 0 ? "#e11d48" : "#059669"}
        icon={IndianRupee}
        wide
      />
    </div>
  );
}
