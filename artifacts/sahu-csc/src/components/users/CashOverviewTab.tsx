import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUsersOverview, useUserLedger } from "@/hooks/useUsers";
import { ROLE_COLORS, fmt } from "./users.constants";
import { Wallet, TrendingUp, TrendingDown, Receipt, ChevronRight } from "lucide-react";

export function CashOverviewTab() {
  const { data: users, isLoading } = useUsersOverview();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [page, setPage] = useState(1);
  const { data: ledger, isLoading: ledgerLoading } = useUserLedger(selectedUser?.userId ?? null, page);

  const openUser = (u: any) => { setSelectedUser(u); setPage(1); };
  const close = () => { setSelectedUser(null); setPage(1); };

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users?.map((u: any) => (
            <div
              key={u.userId}
              className="bg-card border rounded-xl p-5 space-y-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openUser(u)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {(u.fullName || u.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold leading-tight">{u.fullName || u.username}</p>
                    <p className="text-xs text-muted-foreground">@{u.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_COLORS[u.role] ?? ""}`}>{u.role}</span>
                  {!u.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/40 rounded-lg p-2">
                  <Wallet size={14} className="mx-auto text-primary mb-1" />
                  <p className={`text-sm font-bold ${u.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {u.balance < 0 ? "-" : ""}{fmt(u.balance)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Balance</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2">
                  <TrendingUp size={14} className="mx-auto text-green-500 mb-1" />
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">{fmt(u.totalCredits)}</p>
                  <p className="text-[10px] text-muted-foreground">Credits</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2">
                  <TrendingDown size={14} className="mx-auto text-red-500 mb-1" />
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">{fmt(u.totalDebits)}</p>
                  <p className="text-[10px] text-muted-foreground">Debits</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Receipt size={11} /> {u.totalTransactions} transactions</span>
                {u.lastEntry && <span>Last: {u.lastEntry.date}</span>}
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedUser} onOpenChange={close}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {(selectedUser?.fullName || selectedUser?.username || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {selectedUser?.fullName || selectedUser?.username}'s Ledger
            </DialogTitle>
          </DialogHeader>

          {ledgerLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : ledger?.entries?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <>
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm min-w-[480px]">
                  <thead className="border-b bg-muted/30">
                    <tr className="text-left">
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Date</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Customer</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Service</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Credit</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Debit</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ledger?.entries?.map((e: any) => (
                      <tr key={e.id} className="hover:bg-muted/20">
                        <td className="px-3 py-2 text-xs text-muted-foreground">{e.date}</td>
                        <td className="px-3 py-2 text-xs">{e.customerName}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{e.serviceType}</td>
                        <td className="px-3 py-2 text-xs text-right text-green-600 dark:text-green-400">
                          {e.credit > 0 ? fmt(e.credit) : "—"}
                        </td>
                        <td className="px-3 py-2 text-xs text-right text-red-600 dark:text-red-400">
                          {e.debit > 0 ? fmt(e.debit) : "—"}
                        </td>
                        <td className={`px-3 py-2 text-xs text-right font-medium ${e.balance >= 0 ? "text-foreground" : "text-red-600"}`}>
                          {fmt(e.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {ledger && ledger.total > ledger.limit && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">{ledger.total} total entries</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                    <span className="text-xs self-center">Page {page}</span>
                    <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page * ledger.limit >= ledger.total} onClick={() => setPage(p => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CashOverviewTab;
