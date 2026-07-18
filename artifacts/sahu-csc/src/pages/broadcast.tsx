import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Megaphone, Bell, Mail, History, RefreshCw, BellRing } from "lucide-react";
import { Tab } from "@/components/broadcast/broadcastTypes";
import { useBroadcast } from "@/components/broadcast/useBroadcast";
import { BroadcastStatsBar } from "@/components/broadcast/BroadcastStatsBar";
import { BroadcastPushForm } from "@/components/broadcast/BroadcastPushForm";
import { BroadcastEmailForm } from "@/components/broadcast/BroadcastEmailForm";
import { BroadcastInAppForm } from "@/components/broadcast/BroadcastInAppForm";
import { BroadcastHistoryTable } from "@/components/broadcast/BroadcastHistoryTable";
import { BroadcastPreviewCard } from "@/components/broadcast/BroadcastPreviewCard";

export default function BroadcastPage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const {
    tab, setTab,
    pushTitle, setPushTitle, pushBody, setPushBody, pushUrl, setPushUrl,
    createInAppWithPush, setCreateInAppWithPush,
    emailSubject, setEmailSubject, emailBody, setEmailBody,
    recipientFilter, setRecipientFilter, createInAppWithEmail, setCreateInAppWithEmail,
    inappTitle, setInappTitle, inappBody, setInappBody,
    inappType, setInappType, inappPriority, setInappPriority, inappLink, setInappLink,
    historyPage, setHistoryPage, expandedId, setExpandedId,
    stats, statsLoading, refetchStats,
    history, historyLoading, refetchHistory,
    pushMutation, emailMutation, inappMutation,
    emailRecipientCount, totalHistoryPages,
  } = useBroadcast();

  const tabs: { id: Tab; label: string; shortLabel: string; icon: React.ElementType }[] = [
    { id: "push",    label: t("broadcast.tab_push"),    shortLabel: t("broadcast.tab_push_short"), icon: Bell },
    { id: "email",   label: t("broadcast.tab_email"),   shortLabel: t("broadcast.tab_email_short"), icon: Mail },
    { id: "inapp",   label: "In-App",                   shortLabel: "In-App",                      icon: BellRing },
    { id: "history", label: t("broadcast.tab_history"), shortLabel: t("broadcast.tab_history"),    icon: History },
  ];

  return (
    <Layout>
      <div className="min-h-screen" style={{ background: "#f4f6fa" }}>

        {/* ── Page header ── */}
        <div className="sticky top-0 z-10" style={{ background: "linear-gradient(135deg,#0b2c60,#0f3872)" }}>
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(249,115,22,0.18)", border: "1px solid rgba(249,115,22,0.3)" }}>
              <Megaphone size={18} color="#f97316" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">{t("broadcast.title")}</h1>
              <p className="text-[11px] text-white/50 leading-tight">Push · Email · In-App notifications to all users</p>
            </div>
            <button className="ml-auto p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.08)" }}
              onClick={() => { refetchStats(); if (tab === "history") refetchHistory(); }}>
              <RefreshCw size={15} color="rgba(255,255,255,0.6)" />
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 px-4 pb-3">
            {tabs.map(({ id, label, shortLabel, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                style={tab === id
                  ? { background: "#f97316", color: "#fff" }
                  : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}>
                <Icon size={13} />
                <span>{isMobile ? shortLabel : label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
          {tab !== "history" && <BroadcastStatsBar stats={stats} statsLoading={statsLoading} />}

          {tab === "push" && (
            <BroadcastPushForm
              pushTitle={pushTitle} setPushTitle={setPushTitle}
              pushBody={pushBody} setPushBody={setPushBody}
              pushUrl={pushUrl} setPushUrl={setPushUrl}
              createInAppWithPush={createInAppWithPush} setCreateInAppWithPush={setCreateInAppWithPush}
              isPending={pushMutation.isPending} onSubmit={() => pushMutation.mutate()}
              pushSubscribers={stats?.pushSubscribers ?? 0}
            />
          )}

          {tab === "email" && (
            <BroadcastEmailForm
              emailSubject={emailSubject} setEmailSubject={setEmailSubject}
              emailBody={emailBody} setEmailBody={setEmailBody}
              recipientFilter={recipientFilter} setRecipientFilter={setRecipientFilter}
              createInAppWithEmail={createInAppWithEmail} setCreateInAppWithEmail={setCreateInAppWithEmail}
              isPending={emailMutation.isPending} onSubmit={() => emailMutation.mutate()}
              stats={stats} statsLoading={statsLoading}
              emailRecipientCount={emailRecipientCount}
            />
          )}

          {tab === "inapp" && (
            <BroadcastInAppForm
              inappTitle={inappTitle} setInappTitle={setInappTitle}
              inappBody={inappBody} setInappBody={setInappBody}
              inappType={inappType} setInappType={setInappType}
              inappPriority={inappPriority} setInappPriority={setInappPriority}
              inappLink={inappLink} setInappLink={setInappLink}
              isPending={inappMutation.isPending} onSubmit={() => inappMutation.mutate()}
              activeUsers={stats?.activeUsers ?? 0}
            />
          )}

          {tab === "history" && (
            <BroadcastHistoryTable
              history={history} historyLoading={historyLoading}
              historyPage={historyPage} setHistoryPage={setHistoryPage}
              totalHistoryPages={totalHistoryPages}
              refetchHistory={refetchHistory}
              expandedId={expandedId} setExpandedId={setExpandedId}
            />
          )}

          {tab !== "history" && <BroadcastPreviewCard />}
        </div>

      </div>
    </Layout>
  );
}
