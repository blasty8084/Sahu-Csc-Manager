/**
 * HealthAlertList
 *
 * Renders the "Recent Activity" card: a scrollable audit-log tail showing
 * the last 25 events with severity colouring, action icons, and timestamps.
 */
import { useRef } from "react";
import { RefreshCw, ScrollText, ChevronRight, LogIn, LogOut, UserCog, KeyRound, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditRecent } from "./health-types";

interface Props {
  auditRecent: AuditRecent | null;
  auditLoading: boolean;
}

export function HealthAlertList({ auditRecent, auditLoading }: Props) {
  const auditEndRef = useRef<HTMLDivElement>(null);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ScrollText size={16} className="text-primary" />
            Recent Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            {auditLoading && <RefreshCw size={13} className="animate-spin text-muted-foreground" />}
            {auditRecent && (
              <span className="text-xs text-muted-foreground">
                {new Date(auditRecent.queriedAt).toLocaleTimeString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!auditRecent && !auditLoading && (
          <p className="text-sm text-muted-foreground text-center py-4">Could not load audit log</p>
        )}
        {auditLoading && !auditRecent && (
          <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
        )}
        {auditRecent && auditRecent.logs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No activity recorded yet</p>
        )}
        {auditRecent && auditRecent.logs.length > 0 && (
          <div className="space-y-0 divide-y divide-border rounded-lg border overflow-hidden max-h-[480px] overflow-y-auto">
            {auditRecent.logs.map((entry) => {
              const isError = entry.action.includes("failed") || entry.action.includes("locked") || entry.action.includes("error");
              const isWarning = entry.action.includes("revoke") || entry.action.includes("reset") || entry.action.includes("delete");
              const isSuccess = entry.action.includes("login.success") || entry.action.includes(".create") || entry.action.includes("register");

              let ActionIcon = ChevronRight;
              if (entry.action.startsWith("login")) ActionIcon = LogIn;
              else if (entry.action === "logout") ActionIcon = LogOut;
              else if (entry.action.startsWith("user.") || entry.action.startsWith("password")) ActionIcon = UserCog;
              else if (entry.action.startsWith("session")) ActionIcon = KeyRound;
              else if (isError || isWarning) ActionIcon = ShieldAlert;

              const dotColor = isError
                ? "bg-destructive"
                : isWarning
                ? "bg-amber-500"
                : isSuccess
                ? "bg-green-500"
                : "bg-muted-foreground";

              const iconColor = isError
                ? "text-destructive"
                : isWarning
                ? "text-amber-500"
                : isSuccess
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground";

              return (
                <div key={entry.id} className="flex items-start gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors">
                  <span className={`mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
                  <ActionIcon size={13} className={`mt-0.5 flex-shrink-0 ${iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-medium text-foreground">{entry.action}</span>
                      {entry.username && (
                        <span className="text-xs text-muted-foreground">
                          · <span className="font-medium text-foreground">{entry.username}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                      <span>{new Date(entry.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                      {entry.ipAddress && entry.ipAddress !== "unknown" && (
                        <span className="font-mono opacity-60">{entry.ipAddress}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={auditEndRef} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
