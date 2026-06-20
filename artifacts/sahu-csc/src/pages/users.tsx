import { useState } from "react";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey, UserInputRole } from "@workspace/api-client-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePendingCount } from "@/hooks/use-pending-count";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Plus, Pencil, Trash2, CheckCircle2, XCircle, Clock,
  Users as UsersIcon, TrendingUp, TrendingDown, Wallet, Receipt, ChevronRight,
  X, User, Mail, Phone, Shield, Eye, EyeOff,
} from "lucide-react";
import { useForm } from "react-hook-form";

interface UserForm {
  username: string;
  email: string;
  mobile: string;
  fullName: string;
  password: string;
  role: string;
  isActive: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  operator: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  user: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

type Tab = "pending" | "active" | "all" | "overview";

function fmt(n: number) {
  return `₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function usePendingUsers() {
  return useQuery<any[]>({
    queryKey: ["admin-pending-users"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/users/pending`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 20_000,
    refetchInterval: 30_000,
  });
}

function useUsersOverview() {
  return useQuery({
    queryKey: ["admin", "users-overview"],
    queryFn: () => customFetch<any[]>("/api/admin/users-overview"),
  });
}

function useUserLedger(userId: number | null, page: number) {
  return useQuery({
    queryKey: ["admin", "user-ledger", userId, page],
    queryFn: () => customFetch<any>(`/api/admin/users-overview/${userId}/ledger?page=${page}&limit=15`),
    enabled: userId !== null,
  });
}

function CashOverviewTab() {
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

export default function Users() {
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

  const { data: users, isLoading: usersLoading } = useListUsers();
  const { data: pendingUsers, isLoading: pendingLoading } = usePendingUsers();
  const { data: pendingCountData } = usePendingCount();
  const pendingCount = pendingCountData?.count ?? pendingUsers?.length ?? 0;

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

  const activeUsers = (users ?? []).filter((u: any) => u.status === "ACTIVE" || u.isActive);
  const displayedUsers = tab === "pending" ? (pendingUsers ?? []) : tab === "active" ? activeUsers : (users ?? []);
  const isLoading = tab === "pending" ? pendingLoading : usersLoading;

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">User Management</h2>
            <p className="text-sm text-muted-foreground">{users?.length ?? 0} users total</p>
          </div>
          {tab !== "overview" && (
            <Button size="sm" onClick={openCreate} data-testid="button-new-user">
              <Plus size={14} className="mr-1.5" />Add User
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {([
            { key: "pending", label: "Pending", count: pendingCount },
            { key: "active", label: "Active", count: activeUsers.length },
            { key: "all", label: "All Users", count: users?.length ?? 0 },
            { key: "overview", label: "Cash Overview", count: 0 },
          ] as { key: Tab; label: string; count: number }[]).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                  key === "pending" ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Cash Overview Tab */}
        {tab === "overview" ? (
          <CashOverviewTab />
        ) : isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
        ) : displayedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            {tab === "pending" ? (
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
        ) : tab === "pending" ? (
          <>
            {/* Pending — mobile cards */}
            <div className="space-y-3 sm:hidden">
              {displayedUsers.map((user: any) => (
                <div key={user.id} className="bg-card border border-amber-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
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
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9" onClick={() => approveUser(user)} disabled={actionLoading === user.id}>
                      <CheckCircle2 size={13} className="mr-1.5" />Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-9" onClick={() => { setRejectTarget(user); setRejectReason(""); }} disabled={actionLoading === user.id}>
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
                    <th className="px-4 py-3 font-medium text-muted-foreground">User</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Contact</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Registered</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayedUsers.map((user: any) => (
                    <tr key={user.id} className="hover:bg-muted/20 transition-colors">
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
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs" onClick={() => approveUser(user)} disabled={actionLoading === user.id}>
                            <CheckCircle2 size={12} className="mr-1" />Approve
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 h-8 px-3 text-xs" onClick={() => { setRejectTarget(user); setRejectReason(""); }} disabled={actionLoading === user.id}>
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
        ) : (
          <>
            {/* Active / All — mobile cards */}
            <div className="space-y-3 sm:hidden">
              {displayedUsers.map((user: any) => (
                <div key={user.id} className="bg-card border rounded-xl p-4 space-y-3" data-testid={`row-user-${user.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="text-sm bg-primary/10 text-primary">{(user.fullName || user.username).charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{user.fullName || user.username}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
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
                    <tr key={user.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-user-${user.id}`}>
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
        )}
      </div>

      {/* Create/Edit User — Mobile Dialog */}
      <Dialog open={showForm && !!isMobile} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editUser ? "Edit User" : "Add User"}</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Username</Label>
                <Input {...form.register("username", { required: true })} placeholder="username" data-testid="input-username" />
              </div>
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input {...form.register("fullName")} placeholder="Full name" data-testid="input-fullname" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Email</Label>
                <Input type="email" {...form.register("email", { required: true })} placeholder="email@example.com" data-testid="input-email" />
              </div>
              <div className="space-y-1.5">
                <Label>Mobile</Label>
                <Input {...form.register("mobile")} placeholder="9999999999" data-testid="input-mobile" />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={form.watch("role")} onValueChange={(v) => form.setValue("role", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>{editUser ? "New Password (leave blank to keep)" : "Password"}</Label>
                <Input type="password" {...form.register("password", { required: !editUser })} placeholder="Password" data-testid="input-password" />
              </div>
              {editUser && (
                <div className="col-span-2 flex items-center gap-2">
                  <Switch checked={form.watch("isActive")} onCheckedChange={(v) => form.setValue("isActive", v)} id="user-active" />
                  <Label htmlFor="user-active">Active</Label>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending} data-testid="button-save-user">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create/Edit User — Desktop V2 Split Layout */}
      {!isMobile && showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: "fixed", inset: 0, background: "rgba(11,44,96,0.40)", backdropFilter: "blur(4px)", zIndex: 49 }} />
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>

            {/* LEFT INFO PANEL */}
            <div style={{ width: 380, flexShrink: 0, background: "linear-gradient(160deg,#0b2c60 0%,#0f3872 55%,#1a4a9e 100%)", display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(249,115,22,0.12)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, position: "relative" }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(249,115,22,0.40)" }}>
                  <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
                </div>
                <div><span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU </span><span style={{ color: "#f97316", fontWeight: 900, fontSize: 16 }}>CSC</span></div>
              </div>
              <div style={{ position: "relative", marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(249,115,22,0.20)", border: "2px solid rgba(249,115,22,0.35)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <UsersIcon size={30} color="#f97316" />
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 8, padding: "4px 10px", marginBottom: 10 }}>
                  <Shield size={11} color="#f97316" />
                  <span style={{ color: "#f97316", fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>User Management</span>
                </div>
                <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>
                  {editUser ? `Edit ${editUser.fullName || editUser.username}` : "Add New User"}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 13, lineHeight: 1.7 }}>
                  {editUser
                    ? "Update this user's credentials, role, or account status."
                    : "Create a new user account and assign a role to control their access."}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto", position: "relative" }}>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 2 }}>Role Permissions</p>
                {[
                  { role: "Admin", desc: "Full access to all features and users", color: "#ef4444" },
                  { role: "Operator", desc: "Can manage ledger, AePS, Udhari & reports", color: "#3b82f6" },
                  { role: "User", desc: "Read-only access to own data", color: "#94a3b8" },
                ].map(({ role, desc, color }) => (
                  <div key={role} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "11px 16px", border: form.watch("role") === role.toLowerCase() ? `1px solid ${color}` : "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{role}</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 11, marginTop: 3, marginLeft: 16 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT FORM PANEL */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>
              <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0b2c60", margin: 0 }}>{editUser ? "Edit User" : "Add New User"}</h2>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>Fill in the details below to {editUser ? "update this account" : "create a new account"}</p>
                </div>
                <button onClick={() => setShowForm(false)} style={{ width: 38, height: 38, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <X size={16} color="#64748b" />
                </button>
              </div>

              <form onSubmit={onSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 22, maxWidth: 640 }}>

                  {/* Username + Full Name */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Username *</label>
                      <div style={{ position: "relative" }}>
                        <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input {...form.register("username", { required: true })} placeholder="e.g. ravi_kumar" data-testid="input-username"
                          style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                          onFocus={e => (e.target.style.borderColor = "#0b2c60")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Full Name</label>
                      <div style={{ position: "relative" }}>
                        <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input {...form.register("fullName")} placeholder="Full name" data-testid="input-fullname"
                          style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                          onFocus={e => (e.target.style.borderColor = "#0b2c60")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Email Address *</label>
                    <div style={{ position: "relative" }}>
                      <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                      <input type="email" {...form.register("email", { required: true })} placeholder="email@example.com" data-testid="input-email"
                        style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                        onFocus={e => (e.target.style.borderColor = "#0b2c60")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                    </div>
                  </div>

                  {/* Mobile + Role */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Mobile</label>
                      <div style={{ position: "relative" }}>
                        <Phone size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input {...form.register("mobile")} placeholder="9999999999" data-testid="input-mobile"
                          style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                          onFocus={e => (e.target.style.borderColor = "#0b2c60")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Role *</label>
                      <Select value={form.watch("role")} onValueChange={(v) => form.setValue("role", v)}>
                        <SelectTrigger style={{ height: 50, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="operator">Operator</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
                      {editUser ? "New Password" : "Password *"}
                      {editUser && <span style={{ fontWeight: 400, textTransform: "none" as const, color: "#94a3b8", marginLeft: 6 }}>(leave blank to keep current)</span>}
                    </label>
                    <div style={{ position: "relative" }}>
                      <Shield size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                      <input type={showPassword ? "text" : "password"} {...form.register("password", { required: !editUser })} placeholder="Minimum 8 characters" data-testid="input-password"
                        style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 46, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                        onFocus={e => (e.target.style.borderColor = "#0b2c60")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                      <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
                        {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                      </button>
                    </div>
                  </div>

                  {/* Active toggle — edit only */}
                  {editUser && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", borderRadius: 14, padding: "16px 18px", border: "1.5px solid #e2e8f0" }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60", marginBottom: 2 }}>Account Active</p>
                        <p style={{ fontSize: 12, color: "#94a3b8" }}>Inactive accounts cannot log in</p>
                      </div>
                      <Switch checked={form.watch("isActive")} onCheckedChange={(v) => form.setValue("isActive", v)} id="user-active-desk" />
                    </div>
                  )}
                </div>

                <div style={{ padding: "20px 40px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 14 }}>
                  <button type="button" onClick={() => setShowForm(false)} style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
                  <button type="submit" disabled={createMut.isPending || updateMut.isPending} data-testid="button-save-user"
                    style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(11,44,96,0.30)", opacity: (createMut.isPending || updateMut.isPending) ? 0.7 : 1 }}>
                    <CheckCircle2 size={18} />
                    {(createMut.isPending || updateMut.isPending) ? "Saving…" : editUser ? "Save Changes" : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete User?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectTarget !== null} onOpenChange={() => { setRejectTarget(null); setRejectReason(""); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Decline Registration</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Declining <strong>@{rejectTarget?.username}</strong>. Their account will be removed and they will be notified.
            </p>
            <div className="space-y-1.5">
              <Label className="text-sm">Reason for declining</Label>
              <Textarea
                placeholder="e.g. Duplicate account, incomplete information, not authorised..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="resize-none h-20"
              />
              <p className="text-xs text-muted-foreground">
                This reason will be shown to the user when they next try to log in.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>Cancel</Button>
            <Button variant="destructive" onClick={confirmReject} disabled={actionLoading === rejectTarget?.id}>Decline</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
