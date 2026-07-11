import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2, Clock, KeyRound, Link2, ListChecks, Pencil, Search,
  Trash2, UserCheck, UserMinus, Users as UsersIcon, XCircle,
} from "lucide-react";
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
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-500" />
            </div>
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

  return (
    <>
      {/* Bulk action bar — Active / All tabs */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-primary/20 bg-primary/5 sticky top-0 z-10">
          <ListChecks className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-semibold text-primary flex-1 min-w-[80px]">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs"
            onClick={() => bulkSetStatus(true)}
            disabled={bulkActionLoading}
          >
            <UserCheck size={12} className="mr-1" />
            Activate<span className="hidden sm:inline"> ({selectedIds.size})</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-orange-200 text-orange-600 hover:bg-orange-50 h-8 px-3 text-xs"
            onClick={() => bulkSetStatus(false)}
            disabled={bulkActionLoading}
          >
            <UserMinus size={12} className="mr-1" />
            Suspend<span className="hidden sm:inline"> ({selectedIds.size})</span>
          </Button>
          <button
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </button>
        </div>
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
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_COLORS[user.role] ?? ""}`}>{user.role}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">{user.isActive ? "Active" : "Inactive"}</Badge>
                </td>
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

export default UserTable;
