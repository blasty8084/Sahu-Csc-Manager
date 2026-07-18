/**
 * ProfileDangerZone — account deletion / deactivation section.
 *
 * NOTE: Full delete-account flow is not yet implemented in the API.
 * This component is a placeholder that will be wired up when the endpoint ships.
 */
import { AlertTriangle } from "lucide-react";

export function ProfileDangerZone() {
  return (
    <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle size={15} className="text-destructive shrink-0" />
        <p className="text-sm font-semibold text-destructive">Danger Zone</p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Account deletion and deactivation are not yet available through the app.
        Contact your administrator or Replit support for assistance with account removal.
      </p>
    </div>
  );
}
