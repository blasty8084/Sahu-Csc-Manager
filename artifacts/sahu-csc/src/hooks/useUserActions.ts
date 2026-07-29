import { getListUsersQueryKey, UserInputRole } from "@workspace/api-client-react";
import type { UsersPageState } from "./useUsersPage";
import { useResetLinkActions } from "./useResetLinkActions";

const b = () => import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

export function useUserActions(s: UsersPageState) {
  const resetLink = useResetLinkActions(s);

  const invalidate = () => {
    s.qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
    s.qc.invalidateQueries({ queryKey: ["admin-pending-users"] });
    s.qc.invalidateQueries({ queryKey: ["admin-pending-count"] });
    s.qc.invalidateQueries({ queryKey: ["admin-appeal-users"] });
  };

  const openCreate = () => {
    s.setEditUser(null);
    s.form.reset({ username: "", email: "", mobile: "", fullName: "", password: "", role: "operator", isActive: true });
    s.setShowForm(true);
  };

  const openEdit = (u: any) => {
    s.setEditUser(u);
    s.form.reset({ username: u.username, email: u.email, mobile: u.mobile ?? "", fullName: u.fullName ?? "", password: "", role: u.role, isActive: u.isActive });
    s.setShowForm(true);
  };

  const onSubmit = s.form.handleSubmit(async (values) => {
    try {
      if (s.editUser) {
        const data: any = { username: values.username, email: values.email, role: values.role, isActive: values.isActive };
        if (values.mobile)   data.mobile   = values.mobile;
        if (values.fullName) data.fullName = values.fullName;
        if (values.password) data.password = values.password;
        await s.updateMut.mutateAsync({ id: s.editUser.id, data });
        s.toast({ title: "User updated" });
      } else {
        await s.createMut.mutateAsync({ data: { ...values, role: values.role as UserInputRole, mobile: values.mobile || undefined, fullName: values.fullName || undefined } });
        s.toast({ title: "User created" });
      }
      s.setShowForm(false);
      invalidate();
    } catch {
      s.toast({ title: "Failed to save user", variant: "destructive" });
    }
  });

  const confirmDelete = async () => {
    if (!s.deleteId) return;
    try {
      await s.deleteMut.mutateAsync({ id: s.deleteId });
      s.toast({ title: "User deleted" });
      s.setDeleteId(null);
      invalidate();
    } catch {
      s.toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const approveUser = async (user: any) => {
    s.setActionLoading(user.id);
    try {
      const res = await fetch(`${b()}/api/admin/users/${user.id}/approve`, { method: "PATCH", credentials: "include" });
      if (!res.ok) throw new Error();
      s.toast({ title: `✅ ${user.username} approved`, description: "They can now log in." });
      invalidate();
    } catch { s.toast({ title: "Failed to approve user", variant: "destructive" }); }
    finally   { s.setActionLoading(null); }
  };

  const reApproveUser = async (user: any) => {
    s.setActionLoading(user.id);
    try {
      const res = await fetch(`${b()}/api/admin/users/${user.id}/re-approve`, { method: "PATCH", credentials: "include" });
      if (!res.ok) throw new Error();
      s.toast({ title: `✅ ${user.username} re-approved`, description: "Their account is now active." });
      invalidate();
    } catch { s.toast({ title: "Failed to re-approve user", variant: "destructive" }); }
    finally   { s.setActionLoading(null); }
  };

  const dismissAppeal = async (user: any) => {
    s.setActionLoading(user.id);
    try {
      const res = await fetch(`${b()}/api/admin/users/${user.id}/dismiss-appeal`, { method: "PATCH", credentials: "include" });
      if (!res.ok) throw new Error();
      s.toast({ title: `Appeal dismissed for ${user.username}` });
      invalidate();
    } catch { s.toast({ title: "Failed to dismiss appeal", variant: "destructive" }); }
    finally   { s.setActionLoading(null); }
  };

  const dismissAllAppeals = async () => {
    s.setBulkDismissLoading(true);
    try {
      const res  = await fetch(`${b()}/api/admin/users/appeals/dismiss-all`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      s.toast({ title: `✓ ${data.dismissed} appeal${data.dismissed !== 1 ? "s" : ""} dismissed`, description: "All users have been notified." });
      s.setShowBulkDismissConfirm(false);
      invalidate();
    } catch { s.toast({ title: "Failed to bulk dismiss appeals", variant: "destructive" }); }
    finally   { s.setBulkDismissLoading(false); }
  };

  const confirmReject = async () => {
    if (!s.rejectTarget) return;
    s.setActionLoading(s.rejectTarget.id);
    try {
      const res = await fetch(`${b()}/api/admin/users/${s.rejectTarget.id}/reject`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: s.rejectReason }),
      });
      if (!res.ok) throw new Error();
      s.toast({ title: `❌ ${s.rejectTarget.username} rejected` });
      s.setRejectTarget(null); s.setRejectReason("");
      invalidate();
    } catch { s.toast({ title: "Failed to reject user", variant: "destructive" }); }
    finally   { s.setActionLoading(null); }
  };

  const toggleSelect = (id: number) => {
    s.setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleSelectAll = () => {
    s.setSelectedIds(s.selectedIds.size === s.displayedUsers.length
      ? new Set()
      : new Set(s.displayedUsers.map((u: any) => u.id)));
  };

  const bulkApprove = async () => {
    const ids = [...s.selectedIds]; if (!ids.length) return;
    s.setBulkActionLoading(true);
    try {
      const results = await Promise.allSettled(ids.map(id =>
        fetch(`${b()}/api/admin/users/${id}/approve`, { method: "PATCH", credentials: "include" })
      ));
      const failed    = results.filter(r => r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok)).length;
      const succeeded = ids.length - failed;
      if (succeeded > 0) s.toast({ title: `✅ ${succeeded} user${succeeded !== 1 ? "s" : ""} approved` });
      if (failed    > 0) s.toast({ title: `${failed} approval${failed !== 1 ? "s" : ""} failed`, variant: "destructive" });
      s.setSelectedIds(new Set()); invalidate();
    } catch { s.toast({ title: "Bulk approve failed", variant: "destructive" }); }
    finally   { s.setBulkActionLoading(false); }
  };

  const confirmBulkReject = async () => {
    const ids = [...s.selectedIds]; if (!ids.length) return;
    s.setBulkActionLoading(true);
    try {
      const results = await Promise.allSettled(ids.map(id =>
        fetch(`${b()}/api/admin/users/${id}/reject`, {
          method: "PATCH", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: s.bulkRejectReason }),
        })
      ));
      const failed    = results.filter(r => r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok)).length;
      const succeeded = ids.length - failed;
      if (succeeded > 0) s.toast({ title: `❌ ${succeeded} user${succeeded !== 1 ? "s" : ""} rejected` });
      if (failed    > 0) s.toast({ title: `${failed} rejection${failed !== 1 ? "s" : ""} failed`, variant: "destructive" });
      s.setSelectedIds(new Set()); s.setShowBulkRejectDialog(false); s.setBulkRejectReason("");
      invalidate();
    } catch { s.toast({ title: "Bulk reject failed", variant: "destructive" }); }
    finally   { s.setBulkActionLoading(false); }
  };

  const exportCSV = () => {
    const label = s.tab === "pending" ? "Pending" : s.tab === "active" ? "Active" : "All";
    const headers = ["Full Name", "Username", "Email", "Mobile", "Role", "Status", "Joined"];
    const rows = s.displayedUsers.map((u: any) => [
      u.fullName || u.username, u.username, u.email ?? "", u.mobile ?? "",
      u.role, u.isActive ? "Active" : "Inactive",
      new Date(u.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows].map(row => row.map((v: string) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `SAHU-CSC-Users-${label}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const bulkSetStatus = async (activate: boolean) => {
    const ids = [...s.selectedIds]; if (!ids.length) return;
    s.setBulkActionLoading(true);
    try {
      const results  = await Promise.allSettled(ids.map(id => s.updateMut.mutateAsync({ id, data: { isActive: activate } as any })));
      const failed   = results.filter(r => r.status === "rejected").length;
      const succeeded = ids.length - failed;
      if (succeeded > 0) s.toast({ title: `✅ ${succeeded} user${succeeded !== 1 ? "s" : ""} ${activate ? "activated" : "suspended"}` });
      if (failed    > 0) s.toast({ title: `${failed} update${failed !== 1 ? "s" : ""} failed`, variant: "destructive" });
      s.setSelectedIds(new Set()); invalidate();
    } catch { s.toast({ title: "Bulk status update failed", variant: "destructive" }); }
    finally   { s.setBulkActionLoading(false); }
  };

  const resetPassword = async () => {
    if (!s.resetPwUser) return;
    if (s.resetPwValue !== s.resetPwConfirm) { s.toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(s.resetPwValue)) { s.toast({ title: "Password doesn't meet policy requirements", variant: "destructive" }); return; }
    s.setResetPwLoading(true);
    try {
      await s.updateMut.mutateAsync({ id: s.resetPwUser.id, data: { password: s.resetPwValue } as any });
      s.toast({ title: `✅ Password reset for @${s.resetPwUser.username}` });
      s.setResetPwUser(null); s.setResetPwValue(""); s.setResetPwConfirm("");
    } catch { s.toast({ title: "Password reset failed", variant: "destructive" }); }
    finally   { s.setResetPwLoading(false); }
  };

  return {
    invalidate,
    openCreate, openEdit, onSubmit,
    confirmDelete,
    approveUser, reApproveUser, dismissAppeal, dismissAllAppeals,
    confirmReject,
    toggleSelect, toggleSelectAll,
    bulkApprove, confirmBulkReject,
    exportCSV, bulkSetStatus,
    resetPassword,
    ...resetLink,
  };
}

export type UserActions = ReturnType<typeof useUserActions>;
