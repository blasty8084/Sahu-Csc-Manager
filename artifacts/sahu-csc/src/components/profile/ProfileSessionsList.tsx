/**
 * ProfileSessionsList — renders the sessions section.
 *
 * compact=false (default): full desktop view — stats row, bulk-action banners,
 *   highlighted current session, other-session list, security tip.
 * compact=true: mobile compact view — flat session list + bottom bulk buttons.
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SessionsListSkeleton } from "@/components/skeletons";
import { SessionCard } from "./SessionCard";
import type { SessionEntry } from "./types";
import {
  Loader2, LogOut, ShieldAlert, ShieldCheck, Trash2,
} from "lucide-react";

interface Props {
  sessions: SessionEntry[];
  sessionsLoading: boolean;
  currentSession: SessionEntry | undefined;
  otherSessions: SessionEntry[];
  user: any;
  revokeMut: any;
  revokeOthersMut: any;
  revokeAllMut: any;
  setRevokeId: (id: number | null) => void;
  setRevokeOthersOpen: (v: boolean) => void;
  setRevokeAllOpen: (v: boolean) => void;
  compact?: boolean;
}

export function ProfileSessionsList({
  sessions, sessionsLoading, currentSession, otherSessions, user,
  revokeMut, revokeOthersMut, revokeAllMut,
  setRevokeId, setRevokeOthersOpen, setRevokeAllOpen,
  compact = false,
}: Props) {
  // ── Compact (mobile) variant ─────────────────────────────────────────────
  if (compact) {
    return (
      <>
        {sessionsLoading ? <SessionsListSkeleton /> : (
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className={`flex items-start gap-3 p-3 rounded-lg border ${s.isCurrent ? "border-primary/25 bg-primary/5" : "border-border bg-background"}`}>
                <div className="flex-1 min-w-0"><SessionCard session={s} compact /></div>
                {!s.isCurrent && (
                  <Button variant="ghost" size="sm" onClick={() => setRevokeId(s.id)}
                    className="text-destructive hover:bg-destructive/10 h-7 text-xs gap-1 shrink-0">
                    <Trash2 size={12} />Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        {sessions.length > 1 && (
          <div className="flex gap-2 mt-3 pt-3 border-t">
            {otherSessions.length > 0 && (
              <Button variant="outline" size="sm" className="flex-1 text-xs border-orange-300 text-orange-700"
                onClick={() => setRevokeOthersOpen(true)}>
                <LogOut size={12} className="mr-1" />Logout Others
              </Button>
            )}
            <Button variant="destructive" size="sm" className="flex-1 text-xs" onClick={() => setRevokeAllOpen(true)}>
              <ShieldAlert size={12} className="mr-1" />Logout All
            </Button>
          </div>
        )}
      </>
    );
  }

  // ── Full (desktop) variant ───────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { val: sessions.length, label: "Active Sessions", color: "text-primary" },
          { val: user?.role ?? "—", label: "Account Role", color: "capitalize" },
          { val: currentSession?.rememberMe ? "30d" : "8h", label: "Session Length", color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-xl border bg-background text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bulk actions */}
      {sessions.length > 0 && (
        <div className="space-y-2">
          {otherSessions.length > 0 && (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/20">
              <div>
                <p className="font-semibold text-sm">Sign out other devices</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {otherSessions.length} other session{otherSessions.length !== 1 ? "s" : ""} active
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setRevokeOthersOpen(true)} disabled={revokeOthersMut.isPending}
                className="gap-1.5 border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-400">
                {revokeOthersMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                Logout Others
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-destructive/20 bg-destructive/5">
            <div>
              <p className="font-semibold text-sm text-destructive">Sign out everywhere</p>
              <p className="text-xs text-muted-foreground mt-0.5">Logs out this device too</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setRevokeAllOpen(true)} disabled={revokeAllMut.isPending} className="gap-1.5">
              {revokeAllMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
              Logout All
            </Button>
          </div>
        </div>
      )}

      {sessionsLoading && <div className="flex justify-center py-8"><Loader2 size={28} className="animate-spin text-primary" /></div>}

      {/* Current session */}
      {currentSession && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={14} className="text-primary" />
            <span className="text-sm font-semibold">Current Session</span>
            <Badge variant="default" className="text-[10px] px-1.5 py-0 ml-1">This Device</Badge>
          </div>
          <SessionCard session={currentSession} />
        </div>
      )}

      {/* Other sessions */}
      {otherSessions.map(s => (
        <div key={s.id} className="rounded-xl border bg-card p-4 flex items-start gap-3">
          <div className="flex-1 min-w-0"><SessionCard session={s} /></div>
          <Button variant="ghost" size="sm" onClick={() => setRevokeId(s.id)} disabled={revokeMut.isPending}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 shrink-0 mt-0.5">
            <Trash2 size={13} />Revoke
          </Button>
        </div>
      ))}

      {!sessionsLoading && sessions.length === 0 && (
        <div className="rounded-xl border bg-card p-10 text-center">
          <ShieldCheck size={32} className="text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No active sessions found</p>
        </div>
      )}

      {/* Security tip */}
      <p className="text-xs text-muted-foreground leading-relaxed p-3 rounded-lg bg-muted/50 border">
        <strong className="text-foreground">Security tip:</strong> Revoke sessions you don't recognise and change your password.
        Standard sessions expire after <strong>8h</strong>; "Remember Me" sessions after <strong>30 days</strong>.
        Account locks after <strong>5 failed attempts</strong>.
      </p>
    </div>
  );
}
