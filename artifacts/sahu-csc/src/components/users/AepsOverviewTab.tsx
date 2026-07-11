import { useState } from "react";
import { useListUsers } from "@workspace/api-client-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UsersOverviewSkeleton } from "@/components/skeletons";
import { useAepsOverview, type AepsUserSummary } from "@/hooks/useUsers";
import { ROLE_COLORS, fmt } from "./users.constants";
import {
  CreditCard, ChevronRight, ArrowDownLeft, ArrowUpRight, Activity, CalendarDays,
} from "lucide-react";

export function AepsOverviewTab() {
  const { data: aepsRows, isLoading: aepsLoading } = useAepsOverview();
  const { data: usersList, isLoading: usersLoading } = useListUsers();
  const [selected, setSelected] = useState<AepsUserSummary | null>(null);

  const isLoading = aepsLoading || usersLoading;

  const summaries: AepsUserSummary[] = (() => {
    if (!aepsRows || !usersList) return [];
    const userMap = new Map<number, any>();
    for (const u of usersList) userMap.set(u.id, u);

    const grouped = new Map<number, any[]>();
    for (const row of aepsRows) {
      const uid = row.createdBy;
      if (!grouped.has(uid)) grouped.set(uid, []);
      grouped.get(uid)!.push(row);
    }

    const result: AepsUserSummary[] = [];
    for (const [userId, sessions] of grouped.entries()) {
      const user = userMap.get(userId);
      const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
      const latest = sorted[0];
      result.push({
        userId,
        username: user?.username ?? `user_${userId}`,
        fullName: user?.fullName ?? null,
        role: user?.role ?? "operator",
        latestBalance: latest.currentBalance,
        latestDate: latest.date,
        totalWithdrawals: sessions.reduce((s: number, r: any) => s + r.totalWithdrawals, 0),
        totalDeposits: sessions.reduce((s: number, r: any) => s + r.totalDeposits, 0),
        totalTransactions: sessions.reduce((s: number, r: any) => s + r.transactions, 0),
        sessionCount: sessions.length,
        sessions: sorted,
      });
    }
    return result.sort((a, b) => b.latestBalance - a.latestBalance);
  })();

  if (isLoading) {
    return <UsersOverviewSkeleton />;
  }

  if (summaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <CreditCard className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="font-semibold text-gray-700">No AePS activity yet</p>
        <p className="text-sm text-muted-foreground">AePS sessions will appear here once operators start transacting.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaries.map((s) => (
          <div
            key={s.userId}
            className="bg-card border rounded-xl p-5 space-y-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelected(s)}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {(s.fullName || s.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold leading-tight">{s.fullName || s.username}</p>
                  <p className="text-xs text-muted-foreground">@{s.username}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${ROLE_COLORS[s.role] ?? ""}`}>{s.role}</span>
            </div>

            {/* AePS balance — highlighted */}
            <div className="rounded-lg px-4 py-3 flex items-center justify-between" style={{ background: "linear-gradient(135deg,#0b2c60 0%,#0f3872 100%)" }}>
              <div>
                <p className="text-[11px] text-white/60 font-medium uppercase tracking-wide">AePS Balance</p>
                <p className={`text-xl font-bold mt-0.5 ${s.latestBalance >= 0 ? "text-white" : "text-red-300"}`}>
                  {s.latestBalance < 0 ? "-" : ""}{fmt(s.latestBalance)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50">Latest session</p>
                <p className="text-xs text-white/80 mt-0.5">{s.latestDate}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted/40 rounded-lg p-2">
                <ArrowDownLeft size={13} className="mx-auto text-red-500 mb-1" />
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{fmt(s.totalWithdrawals)}</p>
                <p className="text-[10px] text-muted-foreground">Withdrawn</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-2">
                <ArrowUpRight size={13} className="mx-auto text-green-500 mb-1" />
                <p className="text-sm font-bold text-green-600 dark:text-green-400">{fmt(s.totalDeposits)}</p>
                <p className="text-[10px] text-muted-foreground">Deposited</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-2">
                <Activity size={13} className="mx-auto text-blue-500 mb-1" />
                <p className="text-sm font-bold">{s.totalTransactions}</p>
                <p className="text-[10px] text-muted-foreground">Transactions</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CalendarDays size={11} /> {s.sessionCount} day{s.sessionCount !== 1 ? "s" : ""} active</span>
              <ChevronRight size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Drill-in dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {(selected?.fullName || selected?.username || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {selected?.fullName || selected?.username} — AePS Sessions
            </DialogTitle>
          </DialogHeader>

          {/* Summary strip */}
          {selected && (
            <div className="grid grid-cols-3 gap-3 mb-2">
              <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-center">
                <p className="text-xs text-red-500 font-medium">Total Withdrawn</p>
                <p className="text-base font-bold text-red-600 mt-0.5">{fmt(selected.totalWithdrawals)}</p>
              </div>
              <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-center">
                <p className="text-xs text-green-600 font-medium">Total Deposited</p>
                <p className="text-base font-bold text-green-700 mt-0.5">{fmt(selected.totalDeposits)}</p>
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-center">
                <p className="text-xs text-blue-500 font-medium">Transactions</p>
                <p className="text-base font-bold text-blue-700 mt-0.5">{selected.totalTransactions}</p>
              </div>
            </div>
          )}

          {/* Per-day table */}
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="border-b bg-muted/30">
                <tr className="text-left">
                  <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Opening</th>
                  <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Withdrawn</th>
                  <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Deposited</th>
                  <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Closing</th>
                  <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-center">Txns</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {selected?.sessions.map((sess: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="px-3 py-2 text-xs font-medium">{sess.date}</td>
                    <td className="px-3 py-2 text-xs text-right text-muted-foreground">{fmt(sess.openingBalance)}</td>
                    <td className="px-3 py-2 text-xs text-right text-red-600 dark:text-red-400">{sess.totalWithdrawals > 0 ? fmt(sess.totalWithdrawals) : "—"}</td>
                    <td className="px-3 py-2 text-xs text-right text-green-600 dark:text-green-400">{sess.totalDeposits > 0 ? fmt(sess.totalDeposits) : "—"}</td>
                    <td className={`px-3 py-2 text-xs text-right font-semibold ${sess.currentBalance >= 0 ? "text-foreground" : "text-red-600"}`}>
                      {sess.currentBalance < 0 ? "-" : ""}{fmt(sess.currentBalance)}
                    </td>
                    <td className="px-3 py-2 text-xs text-center text-muted-foreground">{sess.transactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AepsOverviewTab;
