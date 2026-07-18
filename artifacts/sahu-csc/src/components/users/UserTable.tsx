import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2, KeyRound, Link2, Pencil, Search,
  Trash2, Users as UsersIcon,
} from "lucide-react";
import { UserBulkActions } from "./UserBulkActions";
import { UserTablePending } from "./UserTablePending";
import { ROLE_COLORS, type Tab } from "./users.constants";

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
  tab,
  isLoading,
  displayedUsers,
  searchQuery,
  searchLower,
  setSearchQuery,
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
  bulkSetStatus,
  openResetLink,
  setResetPwUser,
  setResetPwValue,
  setResetPwConfirm,
  setResetPwShow,
  openEdit,
  setDeleteId,
}: UserTableProps) {
  if (isLoading) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>;
  }

  if (displayedUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        {searchLower ? (
          <>
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
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
        displayedUsers={displayedUsers}
        selectedIds={selectedIds}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        setSelectedIds={setSelectedIds}
        actionLoading={actionLoading}
        bulkActionLoading={bulkActionLoading}
        approveUser={approveUser}
        setRejectTarget={setRejectTarget}
        setRejectReason={setRejectReason}
        bulkApprove={bulkApprove}
        setShowBulkRejectDialog={setShowBulkRejectDialog}
        setBulkRejectReason={setBulkRejectReason}
      />
    );
  }

  return (
    <>
      {/* Bulk action bar — Active / All tabs */}
      {selectedIds.size > 0 && (
        <UserBulkActions
          selectedSize={selectedIds.size}
          bulkActionLoading={bulkActionLoading}
          bulkSetStatus={bulkSetStatus}
          clearSelection={() => setSelectedIds(new Set())}
        />
      )}

      {/* Active / All — mobile cards */}
      <div className="space-y-3 sm:hidden">
        {displayedUsers.map((user: any) => (
          <div
            key={user.id}
            className={`bg-card border rounded-xl p-4 space-y-3 transition-colors ${selectedIds.has(user.id) ? "border-primary/40 bg-primary/5" : ""}`}
            data-testid={`row-user-${user.id}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Checkbox
                  checked={selectedIds.has(user.id)}
                  onCheckedChange={() => toggleSelect(user.id)}
                  className="shrink-0"
                  aria-label={`Select ${user.username}`}
                />
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-sm bg-primary/10 text-primary">{(user.fullName || user.username).charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">{user.fullName || user.username}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600 hover:text-orange-700" title="Generate reset link (no email)" onClick={() => openResetLink(user)}><Link2 size={13} /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700" title="Reset password" onClick={() => { setResetPwUser(user); setResetPwValue(""); setResetPwConfirm(""); setResetPwShow(false); }}><KeyRound size={13} /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(user)}><Pencil size={13} /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(user.id)}><Trash2 size={13} /></Button>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_COLORS[user.role] ?? ""}`}>{user.role}</span>
              <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">{user.isActive ? "Active" : "Inactive"}</Badge>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>{user.email}</p>
              {user.mobile && <p>{user.mobile}</p>}
              <p>Joined {new Date(user.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active / All — desktop table */}
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
            {displayedUsers.map((user: any) => (
              <tr
                key={user.id}
                className={`transition-colors ${selectedIds.has(user.id) ? "bg-primary/5" : "hover:bg-muted/20"}`}
                data-testid={`row-user-${user.id}`}
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
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">{(user.fullName || user.username).charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
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
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_COLORS[user.role] ?? ""}`}>{user.role}</span></td>
                <td className="px-4 py-3"><Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">{user.isActive ? "Active" : "Inactive"}</Badge></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-orange-600 hover:text-orange-700" title="Generate reset link (no email)" onClick={() => openResetLink(user)}><Link2 size={12} /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:text-blue-700" title="Reset password" onClick={() => { setResetPwUser(user); setResetPwValue(""); setResetPwConfirm(""); setResetPwShow(false); }}><KeyRound size={12} /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(user)}><Pencil size={12} /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(user.id)}><Trash2 size={12} /></Button>
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

