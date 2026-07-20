import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Search, Users as UsersIcon } from "lucide-react";
import { UserBulkActions } from "./UserBulkActions";
import { UserTablePending } from "./UserTablePending";
import { UserRowMobile, UserRowDesktop } from "./UserRow";
import { type Tab } from "./users.constants";

interface UserTableProps {
  tab: Tab;
  isLoading: boolean;
  displayedUsers: any[];
  searchQuery: string;
  searchLower: string;
  setSearchQuery: (v: string) => void;
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
  bulkSetStatus: (activate: boolean) => void;
  openResetLink: (user: any) => void;
  setResetPwUser: (user: any) => void;
  setResetPwValue: (v: string) => void;
  setResetPwConfirm: (v: string) => void;
  setResetPwShow: (v: boolean) => void;
  openEdit: (user: any) => void;
  setDeleteId: (id: number) => void;
}

export function UserTable({
  tab, isLoading, displayedUsers, searchQuery, searchLower, setSearchQuery,
  selectedIds, toggleSelect, toggleSelectAll, setSelectedIds,
  actionLoading, bulkActionLoading,
  approveUser, setRejectTarget, setRejectReason,
  bulkApprove, setShowBulkRejectDialog, setBulkRejectReason, bulkSetStatus,
  openResetLink, setResetPwUser, setResetPwValue, setResetPwConfirm, setResetPwShow,
  openEdit, setDeleteId,
}: UserTableProps) {
  if (isLoading) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>;
  }

  if (displayedUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        {searchLower ? (
          <>
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center"><Search className="w-7 h-7 text-muted-foreground" /></div>
            <p className="font-semibold text-gray-700">No users match "{searchQuery}"</p>
            <p className="text-sm text-muted-foreground">Try a different name, username, or email.</p>
            <button onClick={() => setSearchQuery("")} className="text-sm text-primary hover:underline">Clear search</button>
          </>
        ) : tab === "pending" ? (
          <>
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center"><CheckCircle2 className="w-7 h-7 text-green-500" /></div>
            <p className="font-semibold text-gray-700">No pending registrations</p>
            <p className="text-sm text-muted-foreground">All registration requests have been reviewed.</p>
          </>
        ) : (
          <>
            <UsersIcon className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">No users found</p>
          </>
        )}
      </div>
    );
  }

  if (tab === "pending") {
    return (
      <UserTablePending
        displayedUsers={displayedUsers} selectedIds={selectedIds}
        toggleSelect={toggleSelect} toggleSelectAll={toggleSelectAll} setSelectedIds={setSelectedIds}
        actionLoading={actionLoading} bulkActionLoading={bulkActionLoading}
        approveUser={approveUser} setRejectTarget={setRejectTarget} setRejectReason={setRejectReason}
        bulkApprove={bulkApprove} setShowBulkRejectDialog={setShowBulkRejectDialog} setBulkRejectReason={setBulkRejectReason}
      />
    );
  }

  const rowProps = { selectedIds, toggleSelect, openResetLink, setResetPwUser, setResetPwValue, setResetPwConfirm, setResetPwShow, openEdit, setDeleteId };

  return (
    <>
      {selectedIds.size > 0 && (
        <UserBulkActions selectedSize={selectedIds.size} bulkActionLoading={bulkActionLoading} bulkSetStatus={bulkSetStatus} clearSelection={() => setSelectedIds(new Set())} />
      )}

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {displayedUsers.map((user: any) => <UserRowMobile key={user.id} user={user} {...rowProps} />)}
      </div>

      {/* Desktop table */}
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
              <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayedUsers.map((user: any) => <UserRowDesktop key={user.id} user={user} {...rowProps} />)}
          </tbody>
        </table>
      </div>
    </>
  );
}
