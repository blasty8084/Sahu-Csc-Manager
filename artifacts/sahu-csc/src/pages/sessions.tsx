import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { SessionsListSkeleton } from "@/components/skeletons";
import { SessionCard, apiFetch } from "@/components/sessions/SessionCard";
import { SessionCurrentBadge } from "@/components/sessions/SessionCurrentBadge";
import { SessionRevokeDialog } from "@/components/sessions/SessionRevokeDialog";
import { SessionBulkActions } from "@/components/sessions/SessionBulkActions";
import type { SessionEntry } from "@/components/sessions/SessionCard";

export default function Sessions() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  const otherSessions = sessions.filter((s) => !s.isCurrent);
  const currentSession = sessions.find((s) => s.isCurrent);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Active Sessions</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage where you're currently logged in</p>
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

        <SessionBulkActions sessions={sessions} otherSessions={otherSessions} />

        {isLoading && <SessionsListSkeleton />}

        {currentSession && <SessionCurrentBadge session={currentSession} />}

        {/* Other sessions */}
        {otherSessions.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Other Devices ({otherSessions.length})
            </h2>
            {otherSessions.map((s) => (
              <Card key={s.id}>
                <CardContent className="pt-4">
                  <SessionCard
                    session={s}
                    onRevoke={() => setRevokeId(s.id)}
                    revokeDisabled={revokeMutation.isPending}
                  />
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

      <SessionRevokeDialog
        revokeId={revokeId}
        setRevokeId={setRevokeId}
        onRevoke={(id) => revokeMutation.mutate(id)}
      />
    </Layout>
  );
}
