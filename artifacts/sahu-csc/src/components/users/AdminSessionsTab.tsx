import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AdminSessionsSkeleton } from "@/components/skeletons";
import { useToast } from "@/hooks/use-toast";
import { useAdminSessions } from "@/hooks/useUsers";
import { ROLE_COLORS, getDeviceIcon, formatRelative } from "./users.constants";
import {
  MonitorSmartphone, Globe, LogOut, RefreshCw,
} from "lucide-react";

export function AdminSessionsTab() {
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
    return <AdminSessionsSkeleton />;
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

export default AdminSessionsTab;
