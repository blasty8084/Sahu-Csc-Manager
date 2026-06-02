import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Bell, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const typeConfig: Record<string, { icon: React.ReactNode; badge: string }> = {
  info: { icon: <Info size={16} className="text-blue-500" />, badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  warning: { icon: <AlertTriangle size={16} className="text-amber-500" />, badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  success: { icon: <CheckCircle size={16} className="text-emerald-500" />, badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  error: { icon: <XCircle size={16} className="text-red-500" />, badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
};

export default function Notifications() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: notifications, isLoading } = useListNotifications({});
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const del = useDeleteNotification();

  const invalidate = () => qc.invalidateQueries({ queryKey: getListNotificationsQueryKey({}) });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length ?? 0;

  const handleMarkAll = async () => {
    try {
      await markAll.mutateAsync();
      invalidate();
      toast({ title: "All notifications marked as read" });
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const handleMarkRead = async (id: number) => {
    await markRead.mutateAsync({ id });
    invalidate();
  };

  const handleDelete = async (id: number) => {
    await del.mutateAsync({ id });
    invalidate();
    toast({ title: "Notification deleted" });
  };

  return (
    <Layout>
      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground">{unreadCount} unread</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={markAll.isPending} data-testid="button-mark-all-read">
              <CheckCheck size={14} className="mr-1.5" />Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        ) : notifications?.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications?.map((n: any) => {
              const config = typeConfig[n.type] ?? typeConfig.info;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${!n.isRead ? "bg-card border-primary/20 shadow-sm" : "bg-muted/20 border-border"}`}
                  data-testid={`notification-${n.id}`}
                >
                  <div className="mt-0.5 flex-shrink-0">{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`font-medium text-sm ${!n.isRead ? "" : "text-muted-foreground"}`}>{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!n.isRead && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMarkRead(n.id)} title="Mark as read">
                            <CheckCheck size={13} />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(n.id)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${config.badge}`}>{n.type}</span>
                      <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString("en-IN")}</span>
                      {!n.isRead && <span className="w-2 h-2 bg-primary rounded-full" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
