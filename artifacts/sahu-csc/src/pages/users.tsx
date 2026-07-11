import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey, UserInputRole } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePendingCount } from "@/hooks/use-pending-count";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePendingUsers, useAppealUsers } from "@/hooks/useUsers";
import { Plus, Download } from "lucide-react";
import { useForm } from "react-hook-form";

import { type UserForm, type Tab } from "@/components/users/users.constants";
import { AdminSessionsTab } from "@/components/users/AdminSessionsTab";
import { AepsOverviewTab } from "@/components/users/AepsOverviewTab";
import { CashOverviewTab } from "@/components/users/CashOverviewTab";
import { AppealsTab } from "@/components/users/AppealsTab";
import { UserFilters } from "@/components/users/UserFilters";
import { UserTable } from "@/components/users/UserTable";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { RejectUserDialog } from "@/components/users/RejectUserDialog";
import { ResetPasswordDialog } from "@/components/users/ResetPasswordDialog";
import { ResetLinkDialog } from "@/components/users/ResetLinkDialog";
import { BulkRejectDialog } from "@/components/users/BulkRejectDialog";

export default function Users() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isMobile = useIsMobile();
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState<Tab>("pending");
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "operator" | "user">("all");
  const [resetPwUser, setResetPwUser] = useState<any>(null);
  const [resetPwValue, setResetPwValue] = useState("");
  const [resetPwConfirm, setResetPwConfirm] = useState("");
  const [resetPwShow, setResetPwShow] = useState(false);
  const [resetPwLoading, setResetPwLoading] = useState(false);

  // Admin reset-link state
  const [resetLinkUser, setResetLinkUser] = useState<any | null>(null);
  const [resetLinkToken, setResetLinkToken] = useState<string | null>(null);
  const [resetLinkExpiry, setResetLinkExpiry] = useState<string | null>(null);
  const [resetLinkLoading, setResetLinkLoading] = useState(false);
  const [resetLinkCopied, setResetLinkCopied] = useState(false);
  const [resetLinkEmailLoading, setResetLinkEmailLoading] = useState(false);
  const [resetLinkEmailSent, setResetLinkEmailSent] = useState(false);

  const resetLinkUrl = resetLinkToken
    ? `${window.location.origin}/forgot-password?token=${resetLinkToken}${resetLinkExpiry ? `&exp=${new Date(resetLinkExpiry).getTime()}` : ""}`
    : null;

  const openResetLink = (user: any) => {
    setResetLinkUser(user);
    setResetLinkToken(null);
    setResetLinkExpiry(null);
    setResetLinkCopied(false);
    setResetLinkEmailSent(false);
  };

  const closeResetLink = () => {
    setResetLinkUser(null);
    setResetLinkToken(null);
    setResetLinkExpiry(null);
    setResetLinkCopied(false);
    setResetLinkEmailSent(false);
  };

  const sendResetLinkEmail = async () => {
    if (!resetLinkUser || !resetLinkToken || !resetLinkExpiry || !resetLinkUrl) return;
    setResetLinkEmailLoading(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/users/${resetLinkUser.id}/email-reset-link`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken: resetLinkToken, expiresAt: resetLinkExpiry, resetUrl: resetLinkUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send email");
      setResetLinkEmailSent(true);
      toast({ title: `Email sent to ${data.sentTo}` });
    } catch (err: any) {
      toast({ title: err.message ?? "Failed to send email", variant: "destructive" });
    } finally {
      setResetLinkEmailLoading(false);
    }
  };

  const generateResetLink = async () => {
    if (!resetLinkUser) return;
    setResetLinkLoading(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/users/${resetLinkUser.id}/generate-reset-link`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate link");
      setResetLinkToken(data.resetToken);
      setResetLinkExpiry(data.expiresAt);
    } catch (err: any) {
      toast({ title: err.message ?? "Failed to generate link", variant: "destructive" });
    } finally {
      setResetLinkLoading(false);
    }
  };

  const copyResetLink = async () => {
    if (!resetLinkUrl) return;
    try {
      await navigator.clipboard.writeText(resetLinkUrl);
      setResetLinkCopied(true);
      setTimeout(() => setResetLinkCopied(false), 2500);
    } catch {
      toast({ title: "Copy failed — select the link manually", variant: "destructive" });
    }
  };

  const { data: users, isLoading: usersLoading } = useListUsers();
  const { data: pendingUsers, isLoading: pendingLoading } = usePendingUsers();
  const { data: appealUsers, isLoading: appealLoading } = useAppealUsers();
  const { data: pendingCountData } = usePendingCount();
  const pendingCount = pendingCountData?.count ?? pendingUsers?.length ?? 0;
  const appealCount = appealUsers?.length ?? 0;

  const createMut = useCreateUser();
  const updateMut = useUpdateUser();
  const deleteMut = useDeleteUser();

  const form = useForm<UserForm>({
    defaultValues: { username: "", email: "", mobile: "", fullName: "", password: "", role: "operator", isActive: true }
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
    qc.invalidateQueries({ queryKey: ["admin-pending-users"] });
    qc.invalidateQueries({ queryKey: ["admin-pending-count"] });
    qc.invalidateQueries({ queryKey: ["admin-appeal-users"] });
  };

  const openCreate = () => {
    setEditUser(null);
    form.reset({ username: "", email: "", mobile: "", fullName: "", password: "", role: "operator", isActive: true });
    setShowForm(true);
  };

  const openEdit = (u: any) => {
    setEditUser(u);
    form.reset({ username: u.username, email: u.email, mobile: u.mobile ?? "", fullName: u.fullName ?? "", password: "", role: u.role, isActive: u.isActive });
    setShowForm(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editUser) {
        const data: any = { username: values.username, email: values.email, role: values.role, isActive: values.isActive };
        if (values.mobile) data.mobile = values.mobile;
        if (values.fullName) data.fullName = values.fullName;
        if (values.password) data.password = values.password;
        await updateMut.mutateAsync({ id: editUser.id, data });
        toast({ title: "User updated" });
      } else {
        await createMut.mutateAsync({ data: { ...values, role: values.role as UserInputRole, mobile: values.mobile || undefined, fullName: values.fullName || undefined } });
        toast({ title: "User created" });
      }
      setShowForm(false);
      invalidate();
    } catch {
      toast({ title: "Failed to save user", variant: "destructive" });
    }
  });

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMut.mutateAsync({ id: deleteId });
      toast({ title: "User deleted" });
      setDeleteId(null);
      invalidate();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const approveUser = async (user: any) => {
    setActionLoading(user.id);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/users/${user.id}/approve`, { method: "PATCH", credentials: "include" });
      if (!res.ok) throw new Error();
      toast({ title: `✅ ${user.username} approved`, description: "They can now log in." });
      invalidate();
    } catch {
      toast({ title: "Failed to approve user", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const reApproveUser = async (user: any) => {
    setActionLoading(user.id);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/users/${user.id}/re-approve`, { method: "PATCH", credentials: "include" });
      if (!res.ok) throw new Error();
      toast({ title: `✅ ${user.username} re-approved`, description: "Their account is now active." });
      invalidate();
    } catch {
      toast({ title: "Failed to re-approve user", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const dismissAppeal = async (user: any) => {
    setActionLoading(user.id);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/users/${user.id}/dismiss-appeal`, { method: "PATCH", credentials: "include" });
      if (!res.ok) throw new Error();
      toast({ title: `Appeal dismissed for ${user.username}` });
      invalidate();
    } catch {
      toast({ title: "Failed to dismiss appeal", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const [bulkDismissLoading, setBulkDismissLoading] = useState(false);
  const [showBulkDismissConfirm, setShowBulkDismissConfirm] = useState(false);

  const dismissAllAppeals = async () => {
    setBulkDismissLoading(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/users/appeals/dismiss-all`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast({ title: `✓ ${data.dismissed} appeal${data.dismissed !== 1 ? "s" : ""} dismissed`, description: "All users have been notified." });
      setShowBulkDismissConfirm(false);
      invalidate();
    } catch {
      toast({ title: "Failed to bulk dismiss appeals", variant: "destructive" });
    } finally {
      setBulkDismissLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget.id);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/users/${rejectTarget.id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (!res.ok) throw new Error();
      toast({ title: `❌ ${rejectTarget.username} rejected` });
      setRejectTarget(null);
      setRejectReason("");
      invalidate();
    } catch {
      toast({ title: "Failed to reject user", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === displayedUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayedUsers.map((u: any) => u.id)));
    }
  };

  const bulkApprove = async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    setBulkActionLoading(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const results = await Promise.allSettled(
        ids.map(id => fetch(`${base}/api/admin/users/${id}/approve`, { method: "PATCH", credentials: "include" }))
      );
      const failed = results.filter(r => r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok)).length;
      const succeeded = ids.length - failed;
      if (succeeded > 0) toast({ title: `✅ ${succeeded} user${succeeded !== 1 ? "s" : ""} approved` });
      if (failed > 0) toast({ title: `${failed} approval${failed !== 1 ? "s" : ""} failed`, variant: "destructive" });
      setSelectedIds(new Set());
      invalidate();
    } catch {
      toast({ title: "Bulk approve failed", variant: "destructive" });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const confirmBulkReject = async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    setBulkActionLoading(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const results = await Promise.allSettled(
        ids.map(id => fetch(`${base}/api/admin/users/${id}/reject`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ reason: bulkRejectReason }),
        }))
      );
      const failed = results.filter(r => r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok)).length;
      const succeeded = ids.length - failed;
      if (succeeded > 0) toast({ title: `❌ ${succeeded} user${succeeded !== 1 ? "s" : ""} rejected` });
      if (failed > 0) toast({ title: `${failed} rejection${failed !== 1 ? "s" : ""} failed`, variant: "destructive" });
      setSelectedIds(new Set());
      setShowBulkRejectDialog(false);
      setBulkRejectReason("");
      invalidate();
    } catch {
      toast({ title: "Bulk reject failed", variant: "destructive" });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const exportCSV = () => {
    const tabLabel = tab === "pending" ? "Pending" : tab === "active" ? "Active" : "All";
    const headers = ["Full Name", "Username", "Email", "Mobile", "Role", "Status", "Joined"];
    const rows = displayedUsers.map((u: any) => [
      u.fullName || u.username,
      u.username,
      u.email ?? "",
      u.mobile ?? "",
      u.role,
      u.isActive ? "Active" : "Inactive",
      new Date(u.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map((v: string) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SAHU-CSC-Users-${tabLabel}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bulkSetStatus = async (activate: boolean) => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    setBulkActionLoading(true);
    try {
      const results = await Promise.allSettled(
        ids.map(id => updateMut.mutateAsync({ id, data: { isActive: activate } as any }))
      );
      const failed = results.filter(r => r.status === "rejected").length;
      const succeeded = ids.length - failed;
      if (succeeded > 0) toast({ title: `✅ ${succeeded} user${succeeded !== 1 ? "s" : ""} ${activate ? "activated" : "suspended"}` });
      if (failed > 0) toast({ title: `${failed} update${failed !== 1 ? "s" : ""} failed`, variant: "destructive" });
      setSelectedIds(new Set());
      invalidate();
    } catch {
      toast({ title: "Bulk status update failed", variant: "destructive" });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!resetPwUser) return;
    if (resetPwValue !== resetPwConfirm) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    const policy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!policy.test(resetPwValue)) { toast({ title: "Password doesn't meet policy requirements", variant: "destructive" }); return; }
    setResetPwLoading(true);
    try {
      await updateMut.mutateAsync({ id: resetPwUser.id, data: { password: resetPwValue } as any });
      toast({ title: `✅ Password reset for @${resetPwUser.username}` });
      setResetPwUser(null);
      setResetPwValue("");
      setResetPwConfirm("");
    } catch {
      toast({ title: "Password reset failed", variant: "destructive" });
    } finally {
      setResetPwLoading(false);
    }
  };

  const activeUsers = (users ?? []).filter((u: any) => u.status === "ACTIVE" || u.isActive);
  const baseUsers = tab === "pending" ? (pendingUsers ?? []) : tab === "active" ? activeUsers : tab === "appeals" ? (appealUsers ?? []) : (users ?? []);
  const searchLower = searchQuery.toLowerCase().trim();
  const displayedUsers = baseUsers.filter((u: any) => {
    const matchesSearch = !searchLower ||
      (u.fullName ?? "").toLowerCase().includes(searchLower) ||
      (u.username ?? "").toLowerCase().includes(searchLower) ||
      (u.email ?? "").toLowerCase().includes(searchLower);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });
  const isLoading = tab === "pending" ? pendingLoading : tab === "appeals" ? appealLoading : usersLoading;

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold leading-tight">User Management</h2>
            <p className="text-sm text-muted-foreground">{users?.length ?? 0} users total</p>
          </div>
          {tab !== "overview" && tab !== "aeps" && tab !== "sessions" && tab !== "appeals" && (
            <div className="flex items-center gap-2 shrink-0">
              {displayedUsers.length > 0 && (
                <Button size="sm" variant="outline" onClick={exportCSV} data-testid="button-export-csv" className="px-2 sm:px-3">
                  <Download size={14} className="shrink-0" />
                  <span className="hidden sm:inline ml-1.5">Export CSV</span>
                </Button>
              )}
              <Button size="sm" onClick={openCreate} data-testid="button-new-user" className="px-2 sm:px-3">
                <Plus size={14} className="shrink-0" />
                <span className="hidden sm:inline ml-1.5">Add User</span>
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {([
            { key: "pending", label: "Pending", count: pendingCount },
            { key: "appeals", label: "Appeals", count: appealCount },
            { key: "active", label: "Active", count: activeUsers.length },
            { key: "all", label: "All Users", count: users?.length ?? 0 },
            { key: "overview", label: "Cash Overview", count: 0 },
            { key: "aeps", label: "AePS Overview", count: 0 },
            { key: "sessions", label: "Sessions", count: 0 },
          ] as { key: Tab; label: string; count: number }[]).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSearchQuery(""); setRoleFilter("all"); setSelectedIds(new Set()); }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                  key === "pending" ? "bg-red-500 text-white" : key === "appeals" ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search / Filter bar — shown on user-list tabs only */}
        {tab !== "sessions" && tab !== "overview" && tab !== "aeps" && tab !== "appeals" && (
          <UserFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
          />
        )}

        {/* Sessions Tab */}
        {tab === "sessions" ? (
          <AdminSessionsTab />
        ) : tab === "overview" ? (
          <CashOverviewTab />
        ) : tab === "aeps" ? (
          <AepsOverviewTab />
        ) : tab === "appeals" ? (
          <AppealsTab
            appealLoading={appealLoading}
            appealUsers={appealUsers}
            actionLoading={actionLoading}
            reApproveUser={reApproveUser}
            dismissAppeal={dismissAppeal}
            bulkDismissLoading={bulkDismissLoading}
            showBulkDismissConfirm={showBulkDismissConfirm}
            setShowBulkDismissConfirm={setShowBulkDismissConfirm}
            dismissAllAppeals={dismissAllAppeals}
          />
        ) : (
          <UserTable
            tab={tab}
            isLoading={isLoading}
            displayedUsers={displayedUsers}
            searchQuery={searchQuery}
            searchLower={searchLower}
            setSearchQuery={setSearchQuery}
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
            bulkSetStatus={bulkSetStatus}
            openResetLink={openResetLink}
            setResetPwUser={setResetPwUser}
            setResetPwValue={setResetPwValue}
            setResetPwConfirm={setResetPwConfirm}
            setResetPwShow={setResetPwShow}
            openEdit={openEdit}
            setDeleteId={setDeleteId}
          />
        )}
      </div>

      <UserFormDialog
        showForm={showForm}
        setShowForm={setShowForm}
        isMobile={isMobile}
        editUser={editUser}
        form={form}
        onSubmit={onSubmit}
        saving={createMut.isPending || updateMut.isPending}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
      />

      <DeleteUserDialog
        deleteId={deleteId}
        setDeleteId={setDeleteId}
        confirmDelete={confirmDelete}
        isPending={deleteMut.isPending}
      />

      <RejectUserDialog
        rejectTarget={rejectTarget}
        setRejectTarget={setRejectTarget}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        confirmReject={confirmReject}
        actionLoading={actionLoading}
      />

      <ResetPasswordDialog
        resetPwUser={resetPwUser}
        setResetPwUser={setResetPwUser}
        resetPwValue={resetPwValue}
        setResetPwValue={setResetPwValue}
        resetPwConfirm={resetPwConfirm}
        setResetPwConfirm={setResetPwConfirm}
        resetPwShow={resetPwShow}
        setResetPwShow={setResetPwShow}
        resetPwLoading={resetPwLoading}
        resetPassword={resetPassword}
      />

      <ResetLinkDialog
        resetLinkUser={resetLinkUser}
        closeResetLink={closeResetLink}
        resetLinkToken={resetLinkToken}
        resetLinkExpiry={resetLinkExpiry}
        resetLinkUrl={resetLinkUrl}
        resetLinkLoading={resetLinkLoading}
        resetLinkCopied={resetLinkCopied}
        resetLinkEmailLoading={resetLinkEmailLoading}
        resetLinkEmailSent={resetLinkEmailSent}
        generateResetLink={generateResetLink}
        copyResetLink={copyResetLink}
        sendResetLinkEmail={sendResetLinkEmail}
      />

      <BulkRejectDialog
        showBulkRejectDialog={showBulkRejectDialog}
        setShowBulkRejectDialog={setShowBulkRejectDialog}
        bulkRejectReason={bulkRejectReason}
        setBulkRejectReason={setBulkRejectReason}
        confirmBulkReject={confirmBulkReject}
        bulkActionLoading={bulkActionLoading}
        selectedCount={selectedIds.size}
      />
    </Layout>
  );
}
