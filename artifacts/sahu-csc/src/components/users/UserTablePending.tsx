import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Clock, ListChecks, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserTablePendingProps {
  displayedUsers: any[];
  selectedIds: Set<number>;
  toggleSelect: (id: number) => void;
  toggleSelectAll: () => void;
  setSelectedIds: (ids: Set<number>) => void;
  actionLoading: number | null;
  bulkActionLoading: boolean;
  approveUser: (user: any) => void;
  setRejectTarget: (user: any) => void;
  setRejectReason: (v: string) => void;
  bulkApprove: () => void;
  setShowBulkRejectDialog: (v: boolean) => void;
  setBulkRejectReason: (v: string) => void;
}

export function UserTablePending({
  displayedUsers,
  selectedIds,
  toggleSelect,
  toggleSelectAll,
  setSelectedIds,
  actionLoading,
  bulkActionLoading,
  approveUser,
  setRejectTarget,
  setRejectReason,
  bulkApprove,
  setShowBulkRejectDialog,
  setBulkRejectReason,
}: UserTablePendingProps) {
  return (
    <>
      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-primary/20 bg-primary/5 sticky top-0 z-10">
          <ListChecks className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-semibold text-primary flex-1 min-w-[80px]">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs"
            onClick={bulkApprove}
            disabled={bulkActionLoading}
          >
            <CheckCircle2 size={12} className="mr-1" />
            Approve<span className="hidden sm:inline"> ({selectedIds.size})</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 h-8 px-3 text-xs"
            onClick={() => { setShowBulkRejectDialog(true); setBulkRejectReason(""); }}
            disabled={bulkActionLoading}
          >
            <XCircle size={12} className="mr-1" />
            Reject<span className="hidden sm:inline"> ({selectedIds.size})</span>
          </Button>
          <button
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </button>
        </div>
      )}

      {/* Pending — mobile cards */}
      <div className="space-y-3 sm:hidden">
        {displayedUsers.map((user: any) => (
          <div
            key={user.id}
            className={`bg-card border rounded-xl p-4 space-y-3 transition-colors ${selectedIds.has(user.id) ? "border-primary/40 bg-primary/5" : "border-amber-200"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Checkbox
                  checked={selectedIds.has(user.id)}
                  onCheckedChange={() => toggleSelect(user.id)}
                  className="shrink-0"
                  aria-label={`Select ${user.username}`}
                />
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{user.fullName || user.username}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
              </div>
              <Badge className="bg-amber-100 text-amber-700 text-[10px] border-0 shrink-0">Pending</Badge>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>{user.email}</p>
              {user.mobile && <p>{user.mobile}</p>}
              <p>Registered {new Date(user.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9" onClick={() => approveUser(user)} disabled={actionLoading === user.id || bulkActionLoading}>
                <CheckCircle2 size={13} className="mr-1.5" />Approve
              </Button>
              <Button size="sm" variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-9" onClick={() => { setRejectTarget(user); setRejectReason(""); }} disabled={actionLoading === user.id || bulkActionLoading}>
                <XCircle size={13} className="mr-1.5" />Reject
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pending — desktop table */}
      <div className="hidden sm:block border rounded-lg overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr className="text-left">
              <th className="px-4 py-3 w-10">
                <Checkbox
                  checked={displayedUsers.length > 0 && selectedIds.size === displayedUsers.length}
                  data-state={selectedIds.size > 0 && selectedIds.size < displayedUsers.length ? "indeterminate" : undefined}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                  className={selectedIds.size > 0 && selectedIds.size < displayedUsers.length ? "opacity-70" : ""}
                />
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Contact</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Registered</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayedUsers.map((user: any) => (
              <tr
                key={user.id}
                className={`transition-colors ${selectedIds.has(user.id) ? "bg-primary/5" : "hover:bg-muted/20"}`}
              >
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedIds.has(user.id)}
                    onCheckedChange={() => toggleSelect(user.id)}
                    aria-label={`Select ${user.username}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-600" />
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
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs" onClick={() => approveUser(user)} disabled={actionLoading === user.id || bulkActionLoading}>
                      <CheckCircle2 size={12} className="mr-1" />Approve
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 h-8 px-3 text-xs" onClick={() => { setRejectTarget(user); setRejectReason(""); }} disabled={actionLoading === user.id || bulkActionLoading}>
                      <XCircle size={12} className="mr-1" />Reject
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
