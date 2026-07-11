import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, MessageSquareWarning } from "lucide-react";

interface AppealsTabProps {
  appealLoading: boolean;
  appealUsers: any[] | undefined;
  actionLoading: number | null;
  reApproveUser: (user: any) => void;
  dismissAppeal: (user: any) => void;
  bulkDismissLoading: boolean;
  showBulkDismissConfirm: boolean;
  setShowBulkDismissConfirm: (v: boolean) => void;
  dismissAllAppeals: () => void;
}

export function AppealsTab({
  appealLoading,
  appealUsers,
  actionLoading,
  reApproveUser,
  dismissAppeal,
  bulkDismissLoading,
  showBulkDismissConfirm,
  setShowBulkDismissConfirm,
  dismissAllAppeals,
}: AppealsTabProps) {
  if (appealLoading) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>;
  }

  if ((appealUsers ?? []).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <p className="font-semibold text-gray-700">No pending appeals</p>
        <p className="text-sm text-muted-foreground">Declined users who submit an appeal will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{(appealUsers ?? []).length}</span> declined user{(appealUsers ?? []).length !== 1 ? "s" : ""} requesting re-review
        </p>
        <Button
          size="sm"
          variant="outline"
          className="border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700 h-8 px-3 text-xs shrink-0"
          onClick={() => setShowBulkDismissConfirm(true)}
          disabled={bulkDismissLoading}
        >
          <XCircle size={12} className="mr-1.5" />
          Dismiss All
        </Button>
      </div>

      {/* Bulk-dismiss confirmation dialog */}
      <Dialog open={showBulkDismissConfirm} onOpenChange={setShowBulkDismissConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Dismiss all {(appealUsers ?? []).length} appeal{(appealUsers ?? []).length !== 1 ? "s" : ""}?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            All pending appeals will be dismissed and each user will receive an in-app and push notification. This cannot be undone.
          </p>
          <DialogFooter className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowBulkDismissConfirm(false)} disabled={bulkDismissLoading}>
              Cancel
            </Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={dismissAllAppeals} disabled={bulkDismissLoading}>
              {bulkDismissLoading ? "Dismissing…" : "Dismiss All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appeals — mobile cards */}
      <div className="space-y-3 sm:hidden">
        {(appealUsers ?? []).map((user: any) => (
          <div key={user.id} className="bg-card border border-orange-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <MessageSquareWarning className="w-4 h-4 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{user.fullName || user.username}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 shrink-0">Appeal</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5 pl-12">
              <p>{user.email}</p>
              {user.mobile && <p>{user.mobile}</p>}
              {user.rejectionReason && (
                <p className="text-red-500">Declined: {user.rejectionReason}</p>
              )}
              <p>Appealed {new Date(user.appealSubmittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9" onClick={() => reApproveUser(user)} disabled={actionLoading === user.id}>
                <CheckCircle2 size={13} className="mr-1.5" />Approve
              </Button>
              <Button size="sm" variant="outline" className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 h-9" onClick={() => dismissAppeal(user)} disabled={actionLoading === user.id}>
                <XCircle size={13} className="mr-1.5" />Dismiss
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Appeals — desktop table */}
      <div className="hidden sm:block border rounded-lg overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Contact</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Decline Reason</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Appealed</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(appealUsers ?? []).map((user: any) => (
              <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <MessageSquareWarning className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">{user.fullName || user.username}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs">{user.email}</p>
                  {user.mobile && <p className="text-xs text-muted-foreground">{user.mobile}</p>}
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  {user.rejectionReason
                    ? <p className="text-xs text-red-600 truncate" title={user.rejectionReason}>{user.rejectionReason}</p>
                    : <p className="text-xs text-muted-foreground italic">No reason given</p>}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(user.appealSubmittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs" onClick={() => reApproveUser(user)} disabled={actionLoading === user.id}>
                      <CheckCircle2 size={12} className="mr-1" />Approve
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 h-8 px-3 text-xs" onClick={() => dismissAppeal(user)} disabled={actionLoading === user.id}>
                      <XCircle size={12} className="mr-1" />Dismiss
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AppealsTab;
