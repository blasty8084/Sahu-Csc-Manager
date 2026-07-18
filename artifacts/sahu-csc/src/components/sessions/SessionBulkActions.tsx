import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut, Loader2, ShieldAlert } from "lucide-react";
import { apiFetch } from "@/components/sessions/SessionCard";
import type { SessionEntry } from "@/components/sessions/SessionCard";

interface SessionBulkActionsProps {
  sessions: SessionEntry[];
  otherSessions: SessionEntry[];
}

/**
 * Bulk-action panel — "Logout Others" and "Logout All" rows plus their
 * own confirm dialogs and mutations. Returns null when there are no sessions.
 */
export function SessionBulkActions({ sessions, otherSessions }: SessionBulkActionsProps) {
  const { logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [revokeOthersDialog, setRevokeOthersDialog] = useState(false);
  const [revokeAllDialog, setRevokeAllDialog] = useState(false);

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

  if (sessions.length === 0) return null;

  return (
    <>
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
              {revokeOthersMutation.isPending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <LogOut className="w-3.5 h-3.5" />}
              Logout Others
            </Button>
          </div>
        )}
        <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/20 bg-destructive/5">
          <div>
            <p className="font-semibold text-sm text-destructive">Sign out of all devices</p>
            <p className="text-xs text-muted-foreground mt-0.5">You will be logged out everywhere including this device</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setRevokeAllDialog(true)}
            disabled={revokeAllMutation.isPending}
            className="gap-1.5"
          >
            {revokeAllMutation.isPending
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <ShieldAlert className="w-3.5 h-3.5" />}
            Logout All
          </Button>
        </div>
      </div>

      {/* Revoke others confirm */}
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

      {/* Revoke all confirm */}
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
    </>
  );
}
