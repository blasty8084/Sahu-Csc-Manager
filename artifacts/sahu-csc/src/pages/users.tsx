import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  X, User, Mail, Phone, Shield, Eye, EyeOff, ListChecks,
  MonitorSmartphone, Smartphone, Monitor, Tablet, LogOut, RefreshCw, Globe,
  Search, ArrowDownLeft, ArrowUpRight, Activity, CreditCard, CalendarDays,
  UserCheck, UserMinus, Download, KeyRound, Link2, Copy, MessageSquareWarning,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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

type Tab = "pending" | "active" | "all" | "overview" | "aeps" | "sessions" | "appeals";

function fmt(n: number) {
  return `₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function useAdminSessions() {
  return useQuery<any[]>({
    queryKey: ["admin-sessions"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/sessions`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

function getDeviceIcon(os: string) {
  const o = (os ?? "").toLowerCase();
  if (o.includes("android") || o.includes("ios")) return <Smartphone size={15} className="text-muted-foreground shrink-0" />;
  if (o.includes("ipad")) return <Tablet size={15} className="text-muted-foreground shrink-0" />;
  return <Monitor size={15} className="text-muted-foreground shrink-0" />;
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AdminSessionsTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: sessions, isLoading, refetch } = useAdminSessions();
  const [revoking, setRevoking] = useState<Set<number>>(new Set());
  const [revokingUser, setRevokingUser] = useState<Set<number>>(new Set());

  const revokeSession = async (id: number) => {
    setRevoking((p) => new Set([...p, id]));
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/sessions/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      toast({ title: "Session revoked" });
      qc.invalidateQueries({ queryKey: ["admin-sessions"] });
    } catch {
      toast({ title: "Failed to revoke session", variant: "destructive" });
    } finally {
      setRevoking((p) => { const n = new Set(p); n.delete(id); return n; });
    }
  };

  const revokeAllForUser = async (userId: number, username: string) => {
    setRevokingUser((p) => new Set([...p, userId]));
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/sessions/user/${userId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast({ title: `✅ Revoked ${data.count} session${data.count !== 1 ? "s" : ""} for @${username}` });
      qc.invalidateQueries({ queryKey: ["admin-sessions"] });
    } catch {
      toast({ title: "Failed to revoke sessions", variant: "destructive" });
    } finally {
      setRevokingUser((p) => { const n = new Set(p); n.delete(userId); return n; });
    }
  };

  const grouped = (sessions ?? []).reduce<Record<number, { userId: number; username: string; fullName: string | null; role: string; sessions: any[] }>>((acc, s) => {
    if (!acc[s.userId]) acc[s.userId] = { userId: s.userId, username: s.username, fullName: s.fullName, role: s.role, sessions: [] };
    acc[s.userId].sessions.push(s);
    return acc;
  }, {});
  const groups = Object.values(grouped);

  if (isLoading) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>;
  }

  if (!sessions?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
          <MonitorSmartphone className="w-7 h-7 text-slate-400" />
        </div>
        <p className="font-semibold text-gray-700">No active sessions</p>
        <p className="text-sm text-muted-foreground">No users are currently logged in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{sessions.length}</span> active session{sessions.length !== 1 ? "s" : ""} across{" "}
          <span className="font-semibold text-foreground">{groups.length}</span> user{groups.length !== 1 ? "s" : ""}
        </p>
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={() => refetch()}>
          <RefreshCw size={12} />Refresh
        </Button>
      </div>

      {groups.map((group) => (
        <div key={group.userId} className="border rounded-xl overflow-hidden bg-card">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {(group.fullName || group.username).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{group.fullName || group.username}</p>
                <p className="text-xs text-muted-foreground">@{group.username} · {group.sessions.length} session{group.sessions.length !== 1 ? "s" : ""}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-semibold shrink-0 ${ROLE_COLORS[group.role] ?? ""}`}>{group.role}</span>
            </div>
            <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 h-7 px-2.5 text-xs shrink-0 ml-2" disabled={revokingUser.has(group.userId)} onClick={() => revokeAllForUser(group.userId, group.username)}>
              <LogOut size={11} className="mr-1" />Revoke All
            </Button>
          </div>

          {/* Mobile session cards */}
          <div className="divide-y sm:hidden">
            {group.sessions.map((s: any) => (
              <div key={s.id} className="px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {getDeviceIcon(s.os)}
                    <p className="text-sm font-medium truncate">{s.deviceInfo}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0 shrink-0" disabled={revoking.has(s.id)} onClick={() => revokeSession(s.id)}>
                    <LogOut size={13} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground pl-5">
                  {s.ipAddress} · Active {formatRelative(s.lastActivity)} · Expires {new Date(s.expiresAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop sessions table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/10">
                <tr className="text-left">
                  <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Device</th>
                  <th className="px-4 py-2 text-xs font-medium text-muted-foreground">IP Address</th>
                  <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Last Active</th>
                  <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Expires</th>
                  <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Remember Me</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {group.sessions.map((s: any) => (
                  <tr key={s.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(s.os)}
                        <div>
                          <p className="font-medium text-sm leading-tight">{s.browser}</p>
                          <p className="text-xs text-muted-foreground">{s.os}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Globe size={11} />{s.ipAddress}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatRelative(s.lastActivity)}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{new Date(s.expiresAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.rememberMe ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                        {s.rememberMe ? "30 days" : "8 hours"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 h-7 px-2.5 text-xs" disabled={revoking.has(s.id)} onClick={() => revokeSession(s.id)}>
                        <LogOut size={11} className="mr-1" />Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
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

function useAppealUsers() {
  return useQuery<any[]>({
    queryKey: ["admin-appeal-users"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/users/appeals`, { credentials: "include" });
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

function useAepsOverview() {
  return useQuery<any[]>({
    queryKey: ["admin", "aeps-overview"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/aeps-overview`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 30_000,
  });
}

interface AepsUserSummary {
  userId: number;
  username: string;
  fullName: string | null;
  role: string;
  latestBalance: number;
  latestDate: string;
  totalWithdrawals: number;
  totalDeposits: number;
  totalTransactions: number;
  sessionCount: number;
  sessions: any[];
}

function AepsOverviewTab() {
  const { data: aepsRows, isLoading: aepsLoading } = useAepsOverview();
  const { data: usersList, isLoading: usersLoading } = useListUsers();
  const [selected, setSelected] = useState<AepsUserSummary | null>(null);

  const isLoading = aepsLoading || usersLoading;

  const summaries: AepsUserSummary[] = (() => {
    if (!aepsRows || !usersList) return [];
    const userMap = new Map<number, any>();
    for (const u of usersList) userMap.set(u.id, u);

    const grouped = new Map<number, any[]>();
    for (const row of aepsRows) {
      const uid = row.createdBy;
      if (!grouped.has(uid)) grouped.set(uid, []);
      grouped.get(uid)!.push(row);
    }

    const result: AepsUserSummary[] = [];
    for (const [userId, sessions] of grouped.entries()) {
      const user = userMap.get(userId);
      const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
      const latest = sorted[0];
      result.push({
        userId,
        username: user?.username ?? `user_${userId}`,
        fullName: user?.fullName ?? null,
        role: user?.role ?? "operator",
        latestBalance: latest.currentBalance,
        latestDate: latest.date,
        totalWithdrawals: sessions.reduce((s: number, r: any) => s + r.totalWithdrawals, 0),
        totalDeposits: sessions.reduce((s: number, r: any) => s + r.totalDeposits, 0),
        totalTransactions: sessions.reduce((s: number, r: any) => s + r.transactions, 0),
        sessionCount: sessions.length,
        sessions: sorted,
      });
    }
    return result.sort((a, b) => b.latestBalance - a.latestBalance);
  })();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <CreditCard className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="font-semibold text-gray-700">No AePS activity yet</p>
        <p className="text-sm text-muted-foreground">AePS sessions will appear here once operators start transacting.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaries.map((s) => (
          <div
            key={s.userId}
            className="bg-card border rounded-xl p-5 space-y-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelected(s)}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {(s.fullName || s.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold leading-tight">{s.fullName || s.username}</p>
                  <p className="text-xs text-muted-foreground">@{s.username}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${ROLE_COLORS[s.role] ?? ""}`}>{s.role}</span>
            </div>

            {/* AePS balance — highlighted */}
            <div className="rounded-lg px-4 py-3 flex items-center justify-between" style={{ background: "linear-gradient(135deg,#0b2c60 0%,#0f3872 100%)" }}>
              <div>
                <p className="text-[11px] text-white/60 font-medium uppercase tracking-wide">AePS Balance</p>
                <p className={`text-xl font-bold mt-0.5 ${s.latestBalance >= 0 ? "text-white" : "text-red-300"}`}>
                  {s.latestBalance < 0 ? "-" : ""}{fmt(s.latestBalance)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50">Latest session</p>
                <p className="text-xs text-white/80 mt-0.5">{s.latestDate}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted/40 rounded-lg p-2">
                <ArrowDownLeft size={13} className="mx-auto text-red-500 mb-1" />
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{fmt(s.totalWithdrawals)}</p>
                <p className="text-[10px] text-muted-foreground">Withdrawn</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-2">
                <ArrowUpRight size={13} className="mx-auto text-green-500 mb-1" />
                <p className="text-sm font-bold text-green-600 dark:text-green-400">{fmt(s.totalDeposits)}</p>
                <p className="text-[10px] text-muted-foreground">Deposited</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-2">
                <Activity size={13} className="mx-auto text-blue-500 mb-1" />
                <p className="text-sm font-bold">{s.totalTransactions}</p>
                <p className="text-[10px] text-muted-foreground">Transactions</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CalendarDays size={11} /> {s.sessionCount} day{s.sessionCount !== 1 ? "s" : ""} active</span>
              <ChevronRight size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Drill-in dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {(selected?.fullName || selected?.username || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {selected?.fullName || selected?.username} — AePS Sessions
            </DialogTitle>
          </DialogHeader>

          {/* Summary strip */}
          {selected && (
            <div className="grid grid-cols-3 gap-3 mb-2">
              <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-center">
                <p className="text-xs text-red-500 font-medium">Total Withdrawn</p>
                <p className="text-base font-bold text-red-600 mt-0.5">{fmt(selected.totalWithdrawals)}</p>
              </div>
              <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-center">
                <p className="text-xs text-green-600 font-medium">Total Deposited</p>
                <p className="text-base font-bold text-green-700 mt-0.5">{fmt(selected.totalDeposits)}</p>
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-center">
                <p className="text-xs text-blue-500 font-medium">Transactions</p>
                <p className="text-base font-bold text-blue-700 mt-0.5">{selected.totalTransactions}</p>
              </div>
            </div>
          )}

          {/* Per-day table */}
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="border-b bg-muted/30">
                <tr className="text-left">
                  <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Opening</th>
                  <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Withdrawn</th>
                  <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Deposited</th>
                  <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Closing</th>
                  <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-center">Txns</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {selected?.sessions.map((sess: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="px-3 py-2 text-xs font-medium">{sess.date}</td>
                    <td className="px-3 py-2 text-xs text-right text-muted-foreground">{fmt(sess.openingBalance)}</td>
                    <td className="px-3 py-2 text-xs text-right text-red-600 dark:text-red-400">{sess.totalWithdrawals > 0 ? fmt(sess.totalWithdrawals) : "—"}</td>
                    <td className="px-3 py-2 text-xs text-right text-green-600 dark:text-green-400">{sess.totalDeposits > 0 ? fmt(sess.totalDeposits) : "—"}</td>
                    <td className={`px-3 py-2 text-xs text-right font-semibold ${sess.currentBalance >= 0 ? "text-foreground" : "text-red-600"}`}>
                      {sess.currentBalance < 0 ? "-" : ""}{fmt(sess.currentBalance)}
                    </td>
                    <td className="px-3 py-2 text-xs text-center text-muted-foreground">{sess.transactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
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
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, username, or email…"
                className="pl-9 pr-9 h-9 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
              <SelectTrigger className="h-9 w-full sm:w-[130px] text-sm shrink-0">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Admin
                  </span>
                </SelectItem>
                <SelectItem value="operator">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Operator
                  </span>
                </SelectItem>
                <SelectItem value="user">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />User
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sessions Tab */}
        {tab === "sessions" ? (
          <AdminSessionsTab />
        ) : tab === "overview" ? (
          <CashOverviewTab />
        ) : tab === "aeps" ? (
          <AepsOverviewTab />
        ) : tab === "appeals" ? (
          appealLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
          ) : (appealUsers ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
              <p className="font-semibold text-gray-700">No pending appeals</p>
              <p className="text-sm text-muted-foreground">Declined users who submit an appeal will appear here.</p>
            </div>
          ) : (
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
          )
        ) : isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
        ) : displayedUsers.length === 0 ? (
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
        ) : tab === "pending" ? (
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
        ) : (
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

      {/* Reset Password Dialog */}
      <Dialog open={resetPwUser !== null} onOpenChange={(open) => { if (!open) { setResetPwUser(null); setResetPwValue(""); setResetPwConfirm(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound size={16} className="text-blue-600" />
              Reset Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set a new password for <strong>@{resetPwUser?.username}</strong>. This takes effect immediately.
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <div className="relative">
                  <input
                    type={resetPwShow ? "text" : "password"}
                    value={resetPwValue}
                    onChange={e => setResetPwValue(e.target.value)}
                    placeholder="Min 8 chars, upper, lower, number"
                    className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setResetPwShow(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {resetPwShow ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Confirm Password</Label>
                <input
                  type={resetPwShow ? "text" : "password"}
                  value={resetPwConfirm}
                  onChange={e => setResetPwConfirm(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoComplete="new-password"
                />
              </div>
              <ul className="text-xs space-y-1 pt-1">
                {([
                  { label: "At least 8 characters", ok: resetPwValue.length >= 8 },
                  { label: "Uppercase letter (A–Z)", ok: /[A-Z]/.test(resetPwValue) },
                  { label: "Lowercase letter (a–z)", ok: /[a-z]/.test(resetPwValue) },
                  { label: "Number (0–9)", ok: /\d/.test(resetPwValue) },
                  { label: "Passwords match", ok: resetPwValue.length > 0 && resetPwValue === resetPwConfirm },
                ] as { label: string; ok: boolean }[]).map(({ label, ok }) => (
                  <li key={label} className={`flex items-center gap-1.5 transition-colors ${ok ? "text-green-600" : "text-muted-foreground"}`}>
                    {ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setResetPwUser(null); setResetPwValue(""); setResetPwConfirm(""); }}>Cancel</Button>
            <Button
              onClick={resetPassword}
              disabled={
                resetPwLoading ||
                resetPwValue.length < 8 ||
                !/[A-Z]/.test(resetPwValue) ||
                !/[a-z]/.test(resetPwValue) ||
                !/\d/.test(resetPwValue) ||
                resetPwValue !== resetPwConfirm
              }
            >
              {resetPwLoading ? "Saving…" : "Set Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Reset Link Dialog */}
      <Dialog open={resetLinkUser !== null} onOpenChange={(open) => { if (!open) closeResetLink(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 size={16} className="text-orange-500" />
              Generate Reset Link
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create a secure, single-use password reset link for{" "}
              <strong>@{resetLinkUser?.username}</strong>
              {resetLinkUser?.fullName ? ` (${resetLinkUser.fullName})` : ""}.{" "}
              {resetLinkUser?.email
                ? "Copy it manually or send it directly to their email."
                : "Copy it and share via a secure channel — no email address on file."}
            </p>

            {!resetLinkToken ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5">⚠ Security notice</p>
                <ul className="space-y-1 list-disc pl-4">
                  <li>The link expires in <strong>10 minutes</strong></li>
                  <li>It can only be used <strong>once</strong></li>
                  <li>Only share through a secure, private channel</li>
                  <li>Every generation is recorded in the audit log</li>
                </ul>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reset Link</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={resetLinkUrl ?? ""}
                      className="flex-1 h-9 px-3 text-xs rounded-md border bg-muted/40 font-mono"
                      style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button
                      size="sm"
                      variant={resetLinkCopied ? "default" : "outline"}
                      className={`shrink-0 h-9 gap-1.5 transition-colors ${resetLinkCopied ? "bg-green-600 hover:bg-green-700 border-green-600 text-white" : ""}`}
                      onClick={copyResetLink}
                    >
                      {resetLinkCopied
                        ? <><CheckCircle2 size={13} />Copied!</>
                        : <><Copy size={13} />Copy</>}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Click the link field to select all, then copy.</p>
                </div>

                {/* Send to email button — shown only if user has an email on file */}
                {resetLinkUser?.email && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={resetLinkEmailSent ? "default" : "outline"}
                      className={`h-9 gap-1.5 transition-colors text-xs ${resetLinkEmailSent ? "bg-green-600 hover:bg-green-700 border-green-600 text-white" : ""}`}
                      disabled={resetLinkEmailLoading || resetLinkEmailSent}
                      onClick={sendResetLinkEmail}
                    >
                      {resetLinkEmailLoading
                        ? <><Loader2 size={13} className="animate-spin" />Sending…</>
                        : resetLinkEmailSent
                          ? <><CheckCircle2 size={13} />Sent!</>
                          : <><Mail size={13} />Send to {resetLinkUser.email}</>}
                    </Button>
                    {resetLinkEmailSent && (
                      <span className="text-xs text-muted-foreground">Email delivered — link is still valid until expiry.</span>
                    )}
                  </div>
                )}

                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 space-y-1">
                  <p className="font-semibold">
                    ⏱ Expires at {resetLinkExpiry
                      ? new Date(resetLinkExpiry).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                      : ""}
                  </p>
                  <p>The link becomes invalid once used or after 10 minutes — whichever comes first.</p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeResetLink}>
              {resetLinkToken ? "Close" : "Cancel"}
            </Button>
            {!resetLinkToken && (
              <Button
                onClick={generateResetLink}
                disabled={resetLinkLoading}
                style={{ background: "#f97316", borderColor: "#f97316", color: "#fff" }}
                className="hover:opacity-90"
              >
                {resetLinkLoading
                  ? <><Loader2 size={14} className="animate-spin mr-1.5" />Generating…</>
                  : <><Link2 size={14} className="mr-1.5" />Generate Link</>}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Reject Dialog */}
      <Dialog open={showBulkRejectDialog} onOpenChange={(open) => { if (!open) { setShowBulkRejectDialog(false); setBulkRejectReason(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Decline {selectedIds.size} Registration{selectedIds.size !== 1 ? "s" : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              All <strong>{selectedIds.size} selected</strong> registration requests will be declined and each user will be notified.
            </p>
            <div className="space-y-1.5">
              <Label className="text-sm">Reason for declining <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                placeholder="e.g. Incomplete documentation, duplicate accounts, unauthorised applications..."
                value={bulkRejectReason}
                onChange={(e) => setBulkRejectReason(e.target.value)}
                className="resize-none h-20"
              />
              <p className="text-xs text-muted-foreground">
                The same reason will be shown to all declined users when they next try to log in.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowBulkRejectDialog(false); setBulkRejectReason(""); }}>Cancel</Button>
            <Button variant="destructive" onClick={confirmBulkReject} disabled={bulkActionLoading}>
              {bulkActionLoading ? "Declining…" : `Decline All (${selectedIds.size})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
