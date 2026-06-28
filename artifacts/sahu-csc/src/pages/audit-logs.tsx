import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useListAuditLogs, getListAuditLogsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ACTION_COLORS: Record<string, string> = {
  login: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  logout: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  "ledger.create": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "ledger.update": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "ledger.delete": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "service.create": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "service.update": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "service.delete": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "user.create": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "user.update": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "user.delete": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "settings.update": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  "backup.create": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  "backup.restore": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
};

export default function AuditLogs() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const params = {
    page,
    limit: 20,
    ...(actionFilter && actionFilter !== "all" && { action: actionFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data, isLoading } = useListAuditLogs(params);
  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  const actions = [
    "login", "logout",
    "ledger.create", "ledger.update", "ledger.delete",
    "service.create", "service.update", "service.delete",
    "user.create", "user.update", "user.delete",
    "settings.update", "backup.create", "backup.restore",
  ];

  return (
    <Layout>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold">{t("audit.title")}</h2>
          <p className="text-sm text-muted-foreground">{data?.total ?? 0} {t("audit.total_events")}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 bg-card border rounded-lg p-3">
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
            <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder={t("audit.all_actions")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("audit.all_actions")}</SelectItem>
              {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input className="w-36 h-8 text-sm" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} />
          <Input className="w-36 h-8 text-sm" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} />
          {(actionFilter || startDate || endDate) && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setActionFilter(""); setStartDate(""); setEndDate(""); setPage(1); }}>{t("common.clear")}</Button>
          )}
        </div>

        {/* Mobile cards */}
        {isLoading ? (
          <div className="space-y-3 sm:hidden">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
          </div>
        ) : data?.logs?.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 sm:hidden">{t("audit.no_logs")}</p>
        ) : (
          <div className="space-y-2 sm:hidden">
            {data?.logs?.map((log: any) => (
              <div key={log.id} className="bg-card border rounded-xl p-3.5 space-y-2" data-testid={`row-audit-${log.id}`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground"}`}>
                    {log.action}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-sm gap-2">
                  <span className="font-medium">{log.username ?? `#${log.userId}`}</span>
                  <span className="font-mono text-xs text-muted-foreground">{log.ipAddress}</span>
                </div>
                {log.details && <p className="text-xs text-muted-foreground truncate">{log.details}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Desktop table */}
        <div className="hidden sm:block border rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t("audit.col_time")}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t("audit.col_user")}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t("audit.col_action")}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t("audit.col_details")}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t("audit.col_ip")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? [...Array(8)].map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
                )) : data?.logs?.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-muted-foreground py-12">{t("audit.no_logs")}</td></tr>
                ) : data?.logs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-audit-${log.id}`}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 font-medium">{log.username ?? `#${log.userId}`}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-48 truncate">{log.details ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
              <p className="text-xs text-muted-foreground">{t("common.page_of", { page, total: totalPages })}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>{t("common.prev")}</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>{t("common.next")}</Button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between sm:hidden">
            <p className="text-xs text-muted-foreground">{t("common.page_of", { page, total: totalPages })}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>{t("common.prev")}</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>{t("common.next")}</Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
