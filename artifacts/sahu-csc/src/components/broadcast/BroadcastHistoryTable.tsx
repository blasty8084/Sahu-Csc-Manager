import { Bell, Mail, Users, History, RefreshCw, ChevronLeft, ChevronRight, BellRing } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { HistoryResponse } from "./broadcastTypes";

function ChannelBadge({ channel }: { channel: string }) {
  if (channel === "push") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
        style={{ background: "#ede9fe", color: "#7c3aed" }}>
        <Bell size={10} /> Push
      </span>
    );
  }
  if (channel === "inapp") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
        style={{ background: "#dcfce7", color: "#16a34a" }}>
        <BellRing size={10} /> In-App
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: "#dbeafe", color: "#1d4ed8" }}>
      <Mail size={10} /> Email
    </span>
  );
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

interface BroadcastHistoryTableProps {
  history: HistoryResponse | undefined;
  historyLoading: boolean;
  historyPage: number;
  setHistoryPage: React.Dispatch<React.SetStateAction<number>>;
  totalHistoryPages: number;
  refetchHistory: () => void;
  expandedId: number | null;
  setExpandedId: (id: number | null) => void;
}

export function BroadcastHistoryTable({
  history, historyLoading,
  historyPage, setHistoryPage,
  totalHistoryPages,
  refetchHistory,
  expandedId, setExpandedId,
}: BroadcastHistoryTableProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {history ? `${history.total} broadcast${history.total !== 1 ? "s" : ""} sent` : "Broadcast History"}
        </p>
        <button onClick={() => refetchHistory()}
          className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-600 transition-colors">
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      {historyLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="rounded-2xl bg-white h-20 animate-pulse" />)}
        </div>
      ) : !history?.logs.length ? (
        <div className="rounded-2xl bg-white border border-slate-100 p-8 text-center"
          style={{ boxShadow: "0 2px 8px rgba(11,44,96,0.04)" }}>
          <History size={28} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">{t("broadcast.no_broadcasts")}</p>
          <p className="text-xs text-slate-400 mt-1">Your sent push, email and in-app notifications will appear here.</p>
        </div>
      ) : (
        <>
          {history.logs.map((log) => (
            <div key={log.id} className="rounded-2xl bg-white border border-slate-100 overflow-hidden"
              style={{ boxShadow: "0 2px 8px rgba(11,44,96,0.05)" }}>
              <div className="flex">
                <div className="w-1 flex-shrink-0 rounded-l-2xl"
                  style={{
                    background: log.channel === "push"
                      ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                      : log.channel === "inapp"
                        ? "linear-gradient(135deg,#16a34a,#22c55e)"
                        : "linear-gradient(135deg,#0b2c60,#1e4da1)",
                  }} />
                <div className="flex-1 px-4 py-3.5">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ChannelBadge channel={log.channel} />
                      <span className="text-sm font-bold text-slate-800 leading-snug">{log.subject}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                      {fmtDate(log.createdAt)}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users size={10} />
                      {log.recipientCount} sent
                      {log.failedCount > 0 && <span className="text-red-500 ml-1">· {log.failedCount} failed</span>}
                    </span>
                    {log.recipientFilter && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-medium">
                        {log.recipientFilter === "active" ? "active users" : "all users"}
                      </span>
                    )}
                    <span className="text-slate-400">
                      by {log.senderFullName || log.senderUsername || `User #${log.sentBy}`}
                    </span>
                  </div>

                  {/* Expand/collapse body */}
                  <button
                    className="mt-2 text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                    {expandedId === log.id ? "Hide message" : "Show message"}
                    <ChevronRight size={11} className={`transition-transform ${expandedId === log.id ? "rotate-90" : ""}`} />
                  </button>

                  {expandedId === log.id && (
                    <div className="mt-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                      <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{log.body}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalHistoryPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" className="h-8 px-3"
                disabled={historyPage === 1}
                onClick={() => setHistoryPage((p) => p - 1)}>
                <ChevronLeft size={14} className="mr-1" /> Prev
              </Button>
              <span className="text-xs text-slate-500">
                Page {historyPage} of {totalHistoryPages}
              </span>
              <Button variant="outline" size="sm" className="h-8 px-3"
                disabled={historyPage >= totalHistoryPages}
                onClick={() => setHistoryPage((p) => p + 1)}>
                Next <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
