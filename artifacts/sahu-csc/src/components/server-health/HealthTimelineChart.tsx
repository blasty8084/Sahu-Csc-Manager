/**
 * HealthTimelineChart
 *
 * Renders two cards:
 *   1. Push Notifications / VAPID status (key presence, persistence, status message)
 *   2. Quick Fixes / diagnostic tips
 */
import { Bell, AlertTriangle, CheckCircle2, Info, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, StatCell } from "./HealthMetricCard";
import type { HealthData } from "./health-types";

interface Props {
  data: HealthData;
  t: (key: string) => string;
}

export function HealthTimelineChart({ data, t }: Props) {
  return (
    <>
      {/* VAPID / Push Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell size={16} className="text-primary" />
              {t("server_health.push")}
            </CardTitle>
            <StatusBadge status={data.vapid.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCell label="Public Key" value={data.vapid.publicKeySet ? "Set" : "Missing"} />
            <StatCell label="Private Key" value={data.vapid.privateKeySet ? "Set" : "Missing"} />
            <StatCell label="Contact Email" value={data.vapid.email.replace("mailto:", "")} />
          </div>

          {data.vapid.status === "ok" && (
            <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2 text-xs text-green-700 dark:text-green-400">
              <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0" />
              VAPID keys are persistent — push subscriptions will survive server restarts
            </div>
          )}
          {data.vapid.status === "ephemeral" && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
              Keys were auto-generated at startup and will be lost on restart. Set{" "}
              <strong>VAPID_PUBLIC_KEY</strong> and <strong>VAPID_PRIVATE_KEY</strong> as Replit
              Secrets for persistent push notifications.
            </div>
          )}
          {data.vapid.status === "disabled" && (
            <div className="flex items-start gap-2 bg-muted rounded-lg px-3 py-2 text-xs text-muted-foreground">
              <Info size={13} className="mt-0.5 flex-shrink-0" />
              Push notifications are not configured. Set VAPID keys in Replit Secrets to enable them.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Fixes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap size={16} className="text-primary" />
            {t("server_health.quick_fixes")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Shield size={13} className="mt-0.5 flex-shrink-0 text-primary" />
              <span>
                <strong className="text-foreground">DB error?</strong> Run{" "}
                <code className="bg-muted px-1 rounded text-xs">pnpm --filter @workspace/db run push</code>{" "}
                then restart the <em>Seed Database</em> workflow.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Shield size={13} className="mt-0.5 flex-shrink-0 text-primary" />
              <span>
                <strong className="text-foreground">VAPID ephemeral?</strong> Set{" "}
                <code className="bg-muted px-1 rounded text-xs">VAPID_PUBLIC_KEY</code> and{" "}
                <code className="bg-muted px-1 rounded text-xs">VAPID_PRIVATE_KEY</code> in{" "}
                Replit Secrets (🔒 Secrets tab).
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Shield size={13} className="mt-0.5 flex-shrink-0 text-primary" />
              <span>
                <strong className="text-foreground">High memory?</strong> Restart the{" "}
                <em>Start application</em> workflow — Replit containers occasionally need a refresh.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Shield size={13} className="mt-0.5 flex-shrink-0 text-primary" />
              <span>
                <strong className="text-foreground">Port conflict?</strong> Run{" "}
                <code className="bg-muted px-1 rounded text-xs">fuser -k 5000/tcp; fuser -k 8080/tcp</code>{" "}
                in the Shell, then restart the workflow.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
