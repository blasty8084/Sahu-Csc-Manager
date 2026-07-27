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
        accent="linear-gradient(135deg, var(--color-error-soft), var(--color-error))"
        color="var(--color-error)"
        icon={TrendingDown}
      />
      <StatCard
        label="Deposits"
        value={session.totalDeposits}
        accent="linear-gradient(135deg, var(--color-success-light), var(--color-success))"
        color="var(--color-success)"
        icon={TrendingUp}
      />
      <StatCard
        label="Current Balance"
        value={session.currentBalance}
        accent={session.currentBalance < 0
          ? "linear-gradient(135deg, var(--color-error-soft), var(--color-error))"
          : "linear-gradient(135deg, var(--color-success-light), var(--color-success))"}
        color={session.currentBalance < 0 ? "var(--color-error)" : "var(--color-success)"}
        icon={IndianRupee}
        wide
      />
    </div>
  );
}
