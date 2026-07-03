import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionLoader } from "@/components/section-loader";
import { NotificationsSkeleton } from "@/components/skeletons";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Bell, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle,
  XCircle, Shield, Cpu, TrendingUp, Search, Filter,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchNotifications(tab: string, search: string, page: number) {
  const params = new URLSearchParams({ tab, page: String(page), limit: "20" });
  if (search) params.set("search", search);
  const res = await fetch(`${BASE}/api/notifications?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function markRead(id: number) {
  await fetch(`${BASE}/api/notifications/${id}/read`, { method: "PATCH", credentials: "include" });
}
async function markAllRead() {
  await fetch(`${BASE}/api/notifications/read-all`, { method: "POST", credentials: "include" });
}
async function deleteNotif(id: number) {
  await fetch(`${BASE}/api/notifications/${id}`, { method: "DELETE", credentials: "include" });
}
async function deleteRead() {
  await fetch(`${BASE}/api/notifications/bulk`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter: "read" }),
  });
}

export default function Notifications() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  const TYPE_CONFIG: Record<string, { icon: React.ReactNode; badge: string; label: string }> = {
    info:     { icon: <Info size={15} className="text-blue-500" />,     badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",       label: t("notifications.type_info") },
    warning:  { icon: <AlertTriangle size={15} className="text-amber-500" />, badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",   label: t("notifications.type_warning") },
    success:  { icon: <CheckCircle size={15} className="text-emerald-500" />, badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", label: t("notifications.type_success") },
    error:    { icon: <XCircle size={15} className="text-red-500" />,    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",           label: t("notifications.type_error") },
    security: { icon: <Shield size={15} className="text-red-600" />,     badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",           label: t("notifications.type_security") },
    system:   { icon: <Cpu size={15} className="text-purple-500" />,     badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", label: t("notifications.type_system") },
    business: { icon: <TrendingUp size={15} className="text-amber-600" />, badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",  label: t("notifications.type_business") },
  };

  const PRIORITY_CONFIG: Record<string, { dot: string; label: string }> = {
    LOW:      { dot: "bg-slate-400",   label: t("notifications.priority_low") },
    MEDIUM:   { dot: "bg-blue-500",    label: t("notifications.priority_medium") },
    HIGH:     { dot: "bg-amber-500",   label: t("notifications.priority_high") },
    CRITICAL: { dot: "bg-red-600",     label: t("notifications.priority_critical") },
  };

  const TABS = [
    { key: "all",      label: t("notifications.all") },
    { key: "unread",   label: t("notifications.unread") },
    { key: "security", label: t("notifications.type_security") },
    { key: "business", label: t("notifications.type_business") },
    { key: "system",   label: t("notifications.type_system") },
  ];

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["notifications-page", activeTab, search, page],
    queryFn: () => fetchNotifications(activeTab, search, page),
    staleTime: 15_000,
  });

  const notifications: any[] = data?.notifications ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["notifications-page"] });
    qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
  };

  const handleTab = (k: string) => { setActiveTab(k); setPage(1); };
  const handleSearch = () => { setSearch(searchInput); setPage(1); };

  const handleMarkRead = async (id: number) => { await markRead(id); invalidate(); };
  const handleMarkAll = async () => { await markAllRead(); invalidate(); toast.success(t("notifications.toast_all_read")); };
  const handleDelete = async (id: number) => { await deleteNotif(id); invalidate(); toast.success(t("notifications.toast_deleted")); };
  const handleDeleteRead = async () => { await deleteRead(); invalidate(); toast.success(t("notifications.toast_read_cleared")); };

  return (
    <Layout>
      <div className="space-y-4 w-full max-w-2xl mx-auto sm:mx-0">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-xl font-bold truncate">{t("notifications.title")}</h2>
            {total > 0 && (
              <Badge variant="secondary" className="text-xs flex-shrink-0">{total}</Badge>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={handleMarkAll}
              className="text-xs h-8 flex-1 sm:flex-none">
              <CheckCheck size={13} className="mr-1 flex-shrink-0" />
              <span>{t("notifications.mark_all_read")}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeleteRead}
              className="text-xs h-8 text-muted-foreground flex-1 sm:flex-none">
              <Trash2 size={13} className="mr-1 flex-shrink-0" />
              <span>{t("notifications.clear_read")}</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8 h-9 text-sm w-full"
              placeholder={t("notifications.search_placeholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button size="sm" variant="outline" className="h-9 flex-shrink-0" onClick={handleSearch}>
            <Filter size={13} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((tb) => (
            <button
              key={tb.key}
              onClick={() => handleTab(tb.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0
                ${activeTab === tb.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <NotificationsSkeleton />
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={40} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">{t("notifications.no_notifications")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n: any) => {
              const tc = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
              const pc = PRIORITY_CONFIG[n.priority] ?? PRIORITY_CONFIG.MEDIUM;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 sm:p-4 rounded-lg border transition-colors
                    ${!n.isRead
                      ? "bg-card border-l-4 border-l-primary border-t-border border-r-border border-b-border shadow-sm"
                      : "bg-muted/20 border-border opacity-80"}`}
                >
                  <div className="mt-0.5 flex-shrink-0">{tc.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium text-sm truncate ${!n.isRead ? "" : "text-muted-foreground"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 break-words">{n.message}</p>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0 ml-1">
                        {!n.isRead && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMarkRead(n.id)} title={t("notifications.mark_all_read")}>
                            <CheckCheck size={13} />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(n.id)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${tc.badge}`}>{tc.label}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
                        {pc.label}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(n.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                      {!n.isRead && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                    </div>
                    {n.link && (
                      <a href={n.link} className="text-xs text-primary underline mt-1 block">{t("notifications.view")}</a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t("common.prev")}</Button>
            <span className="text-sm text-muted-foreground">{t("common.page_of", { page, total: totalPages })}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages || isFetching} onClick={() => setPage(p => p + 1)}>{t("common.next")}</Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
