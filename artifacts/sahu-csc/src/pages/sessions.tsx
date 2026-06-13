import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Monitor, Smartphone, Tablet, Globe, Clock, MapPin,
  Trash2, LogOut, ShieldCheck, Loader2, RefreshCw, ShieldAlert,
} from "lucide-react";

interface SessionEntry {
  id: number;
  sessionId: string;
  deviceInfo: string;
  browser: string;
  os: string;
  ipAddress: string;
  rememberMe: boolean;
  isCurrent: boolean;
  lastActivity: string;
  expiresAt: string;
  createdAt: string;
}

function deviceIcon(os: string) {
  const lower = os.toLowerCase();
  if (/android.*mobile|iphone|ipod|windows phone/i.test(lower)) return Smartphone;
  if (/ipad|tablet|android(?!.*mobile)/i.test(lower)) return Tablet;
  return Monitor;
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatExpiry(iso: string) {
  const expiry = new Date(iso);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `Expires in ${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `Expires in ${hours}h ${mins}m`;
  return `Expires in ${mins}m`;
}

async function apiFetch(path: string, options?: RequestInit) {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  const res = await fetch(`${base}/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Request failed");
  }
  return res.json().catch(() => ({}));
}

export default function Sessions() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [revokeOthersDialog, setRevokeOthersDialog] = useState(false);
  const [revokeAllDialog, setRevokeAllDialog] = useState(false);
  const [revokeId, setRevokeId] = useState<number | null>(null);

  const { data: sessions = [], isLoading, refetch, isFetching } = useQuery<SessionEntry[]>({
    queryKey: ["sessions"],
    queryFn: () => apiFetch("/sessions"),
    refetchInterval: 30_000,
  });

  const revokeMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/sessions/${id}`, { method: "DELETE" }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast({ title: "Session revoked", description: "The device has been logged out." });
      if (data?.redirect) logout();
    },
    onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });

  const revokeOthersMutation = useMutation({
    mutationFn: () => apiFetch("/sessions/others", { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast({ title: "All other sessions revoked", description: "Only this device remains logged in." });
    },
    onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });

  const revokeAllMutation = useMutation({
    mutationFn: () => apiFetch("/sessions/all", { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Logged out everywhere", description: "All sessions have been revoked." });
      logout();
    },
    onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });

  const otherSessions = sessions.filter((s) => !s.isCurrent);
  const currentSession = sessions.find((s) => s.isCurrent);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Active Sessions</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage where you're currently logged in
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Security summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl border bg-card text-center">
            <p className="text-2xl font-bold text-primary">{sessions.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Active Sessions</p>
          </div>
          <div className="p-3 rounded-xl border bg-card text-center">
            <p className="text-2xl font-bold capitalize">{user?.role}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Account Role</p>
          </div>
          <div className="p-3 rounded-xl border bg-card text-center">
            <p className="text-2xl font-bold text-green-600">{currentSession?.rememberMe ? "30d" : "8h"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Session Length</p>
          </div>
        </div>

        {/* Bulk actions */}
        {sessions.length > 0 && (
          <div className="space-y-2">
            {otherSessions.length > 0 && (
              <div className="flex items-center justify-between p-4 rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/20">
                <div>
                  <p className="font-semibold text-sm">Sign out of all other devices</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {otherSessions.length} other session{otherSessions.length !== 1 ? "s" : ""} active
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRevokeOthersDialog(true)}
                  disabled={revokeOthersMutation.isPending}
                  className="gap-1.5 border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-400"
                >
                  {revokeOthersMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                  Logout Others
                </Button>
              </div>
            )}
            <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/20 bg-destructive/5">
              <div>
                <p className="font-semibold text-sm text-destructive">Sign out of all devices</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You will be logged out everywhere including this device
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setRevokeAllDialog(true)}
                disabled={revokeAllMutation.isPending}
                className="gap-1.5"
              >
                {revokeAllMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                Logout All
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Current session */}
        {currentSession && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm">Current Session</CardTitle>
                <Badge variant="default" className="text-[10px] px-1.5 py-0">This Device</Badge>
              </div>
              <CardDescription className="text-xs">You are currently using this session</CardDescription>
            </CardHeader>
            <CardContent>
              <SessionCard session={currentSession} />
            </CardContent>
          </Card>
        )}

        {/* Other sessions */}
        {otherSessions.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Other Devices ({otherSessions.length})
            </h2>
            {otherSessions.map((s) => (
              <Card key={s.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <SessionCard session={s} />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 mt-0.5 flex-shrink-0"
                      onClick={() => setRevokeId(s.id)}
                      disabled={revokeMutation.isPending}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Revoke
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && sessions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ShieldCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No active sessions found</p>
            </CardContent>
          </Card>
        )}

        {/* Security tip */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Security tip:</strong> If you see any sessions you don't recognise,
            revoke them immediately and change your password. Standard sessions expire after <strong>8 hours</strong>,
            "Remember Me" sessions after <strong>30 days</strong>. Your account locks after{" "}
            <strong>5 failed login attempts</strong> for 15 minutes.
          </p>
        </div>
      </div>

      {/* Revoke single session dialog */}
      <AlertDialog open={revokeId !== null} onOpenChange={() => setRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Session</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately log out the selected device. Any unsaved work on that device will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => { if (revokeId !== null) revokeMutation.mutate(revokeId); setRevokeId(null); }}
            >
              Revoke Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke others dialog */}
      <AlertDialog open={revokeOthersDialog} onOpenChange={setRevokeOthersDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout All Other Devices</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign out <strong>{otherSessions.length}</strong> other device{otherSessions.length !== 1 ? "s" : ""}.
              Your current session will remain active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => { revokeOthersMutation.mutate(); setRevokeOthersDialog(false); }}
            >
              Logout Others
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke ALL dialog */}
      <AlertDialog open={revokeAllDialog} onOpenChange={setRevokeAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout Everywhere</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign out <strong>all {sessions.length} session{sessions.length !== 1 ? "s" : ""}</strong> including
              this device. You will be redirected to the login page immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => { revokeAllMutation.mutate(); setRevokeAllDialog(false); }}
            >
              Logout Everywhere
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

function SessionCard({ session }: { session: SessionEntry }) {
  const DevIcon = deviceIcon(session.os);
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
        <DevIcon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{session.browser}</span>
          <span className="text-muted-foreground text-xs">on</span>
          <span className="text-sm">{session.os}</span>
          {session.rememberMe && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0">Remember Me</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-2.5 h-2.5" />
            {session.ipAddress}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-2.5 h-2.5" />
            {timeAgo(session.lastActivity)}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="w-2.5 h-2.5" />
            {formatDate(session.createdAt)}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatExpiry(session.expiresAt)}</p>
      </div>
    </div>
  );
}
