import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { useUsersPage } from "@/hooks/useUsersPage";
import { useUserActions } from "@/hooks/useUserActions";
import { AdminSessionsTab } from "@/components/users/AdminSessionsTab";
import { AepsOverviewTab } from "@/components/users/AepsOverviewTab";
import { CashOverviewTab } from "@/components/users/CashOverviewTab";
import { AppealsTab } from "@/components/users/AppealsTab";
import { UserFilters } from "@/components/users/UserFilters";
import { UserTable } from "@/components/users/UserTable";
import { UserTabBar } from "@/components/users/UserTabBar";
import { UserPageDialogs } from "@/components/users/UserPageDialogs";

export default function Users() {
  const s = useUsersPage();
  const a = useUserActions(s);

  return (
    <Layout>
      <div className="space-y-5">

        {/* Page header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold leading-tight">User Management</h2>
            <p className="text-sm text-muted-foreground">{s.users?.length ?? 0} users total</p>
          </div>
          {s.tab !== "overview" && s.tab !== "aeps" && s.tab !== "sessions" && s.tab !== "appeals" && (
            <div className="flex items-center gap-2 shrink-0">
              {s.displayedUsers.length > 0 && (
                <Button size="sm" variant="outline" onClick={a.exportCSV} data-testid="button-export-csv" className="px-2 sm:px-3">
                  <Download size={14} className="shrink-0" />
                  <span className="hidden sm:inline ml-1.5">Export CSV</span>
                </Button>
              )}
              <Button size="sm" onClick={a.openCreate} data-testid="button-new-user" className="px-2 sm:px-3">
                <Plus size={14} className="shrink-0" />
                <span className="hidden sm:inline ml-1.5">Add User</span>
              </Button>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <UserTabBar
          tab={s.tab}
          onTabChange={(t) => { s.setTab(t); s.setSearchQuery(""); s.setRoleFilter("all"); s.setSelectedIds(new Set()); }}
          pendingCount={s.pendingCount}
          appealCount={s.appealCount}
          activeCount={s.activeUsers.length}
          totalCount={s.users?.length ?? 0}
        />

        {/* Search / filter bar — user-list tabs only */}
        {s.tab !== "sessions" && s.tab !== "overview" && s.tab !== "aeps" && s.tab !== "appeals" && (
          <UserFilters
            searchQuery={s.searchQuery}
            setSearchQuery={s.setSearchQuery}
            roleFilter={s.roleFilter}
            setRoleFilter={s.setRoleFilter}
          />
        )}

        {/* Tab content */}
        {s.tab === "sessions" ? (
          <AdminSessionsTab />
        ) : s.tab === "overview" ? (
          <CashOverviewTab />
        ) : s.tab === "aeps" ? (
          <AepsOverviewTab />
        ) : s.tab === "appeals" ? (
          <AppealsTab
            appealLoading={s.appealLoading}
            appealUsers={s.appealUsers}
            actionLoading={s.actionLoading}
            reApproveUser={a.reApproveUser}
            dismissAppeal={a.dismissAppeal}
            bulkDismissLoading={s.bulkDismissLoading}
            showBulkDismissConfirm={s.showBulkDismissConfirm}
            setShowBulkDismissConfirm={s.setShowBulkDismissConfirm}
            dismissAllAppeals={a.dismissAllAppeals}
          />
        ) : (
          <UserTable
            tab={s.tab}
            isLoading={s.isLoading}
            displayedUsers={s.displayedUsers}
            searchQuery={s.searchQuery}
            searchLower={s.searchLower}
            setSearchQuery={s.setSearchQuery}
            selectedIds={s.selectedIds}
            toggleSelect={a.toggleSelect}
            toggleSelectAll={a.toggleSelectAll}
            setSelectedIds={s.setSelectedIds}
            actionLoading={s.actionLoading}
            bulkActionLoading={s.bulkActionLoading}
            approveUser={a.approveUser}
            setRejectTarget={s.setRejectTarget}
            setRejectReason={s.setRejectReason}
            bulkApprove={a.bulkApprove}
            setShowBulkRejectDialog={s.setShowBulkRejectDialog}
            setBulkRejectReason={s.setBulkRejectReason}
            bulkSetStatus={a.bulkSetStatus}
            openResetLink={a.openResetLink}
            setResetPwUser={s.setResetPwUser}
            setResetPwValue={s.setResetPwValue}
            setResetPwConfirm={s.setResetPwConfirm}
            setResetPwShow={s.setResetPwShow}
            openEdit={a.openEdit}
            setDeleteId={s.setDeleteId}
          />
        )}

      </div>

      <UserPageDialogs s={s} a={a} />
    </Layout>
  );
}
