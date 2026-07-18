import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Bell, BellOff, CheckCircle, AlertCircle } from "lucide-react";

/** Push notification subscription card — status, browser permission, enable/disable toggle. */
export function PwaSubscriptionCard() {
  const { t } = useTranslation();
  const { status: pushStatus, subscribe, unsubscribe, isLoading: pushLoading } = usePushNotifications();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell size={16} className="text-primary" />
          {t("nav.notifications")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Status</span>
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              {pushStatus === "subscribed" ? (
                <><CheckCircle size={14} className="text-green-600 dark:text-green-400" /> Enabled</>
              ) : pushStatus === "denied" ? (
                <><BellOff size={14} className="text-destructive" /> Blocked</>
              ) : pushStatus === "unsupported" ? (
                <><AlertCircle size={14} className="text-muted-foreground" /> Not supported</>
              ) : (
                <><Bell size={14} className="text-muted-foreground" /> Not enabled</>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Browser Permission</span>
            <span className="font-semibold text-sm capitalize">
              {typeof Notification !== "undefined" ? Notification.permission : "N/A"}
            </span>
          </div>
        </div>

        {pushStatus === "default" && (
          <Button size="sm" className="gap-1.5" onClick={subscribe} disabled={pushLoading}>
            <Bell size={13} />
            {pushLoading ? "Enabling…" : "Enable Notifications"}
          </Button>
        )}
        {pushStatus === "subscribed" && (
          <Button size="sm" variant="outline" className="gap-1.5 text-muted-foreground" onClick={unsubscribe} disabled={pushLoading}>
            <BellOff size={13} />
            {pushLoading ? "Disabling…" : "Disable Notifications"}
          </Button>
        )}
        {pushStatus === "denied" && (
          <p className="text-xs text-muted-foreground">
            Notifications are blocked in your browser settings. Allow them from the address bar to enable.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
