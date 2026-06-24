import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Megaphone, Bell, Mail, Users, Send, Wifi, WifiOff,
  CheckCircle2, AlertTriangle, Info, RefreshCw, ChevronRight,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

interface BroadcastStats {
  pushSubscribers: number;
  usersWithEmail: number;
  activeUsers: number;
  smtpConfigured: boolean;
}

function StatCard({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: number | string; accent: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-4 flex items-center gap-3"
      style={{ boxShadow: "0 2px 8px rgba(11,44,96,0.06)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: accent }}>
        <Icon size={18} color="#fff" />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

type Tab = "push" | "email";

export default function BroadcastPage() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<Tab>("push");

  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushUrl, setPushUrl] = useState("");
  const [createInApp, setCreateInApp] = useState(true);

  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [recipientFilter, setRecipientFilter] = useState<"all" | "active">("all");

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<BroadcastStats>({
    queryKey: ["broadcast-stats"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/admin/broadcast/stats`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    },
  });

  const pushMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/admin/broadcast/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: pushTitle, body: pushBody, url: pushUrl || undefined, createInAppNotification: createInApp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      return data;
    },
    onSuccess: () => {
      toast({ title: "Push sent!", description: `Broadcast delivered to ${stats?.pushSubscribers ?? 0} subscriber(s).` });
      setPushTitle(""); setPushBody(""); setPushUrl("");
      refetchStats();
    },
    onError: (err: any) => {
      toast({ title: "Push failed", description: err.message, variant: "destructive" });
    },
  });

  const emailMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/admin/broadcast/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject: emailSubject, body: emailBody, recipientFilter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      return data;
    },
    onSuccess: (data) => {
      toast({ title: "Email sent!", description: data.message });
      setEmailSubject(""); setEmailBody("");
    },
    onError: (err: any) => {
      toast({ title: "Email failed", description: err.message, variant: "destructive" });
    },
  });

  const emailRecipientCount = recipientFilter === "active"
    ? (stats?.activeUsers ?? 0)
    : (stats?.usersWithEmail ?? 0);

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
              <h1 className="text-base font-bold text-white leading-tight">Broadcast Center</h1>
              <p className="text-[11px] text-white/50 leading-tight">Send push notifications &amp; emails to all users</p>
            </div>
            <button
              className="ml-auto p-2 rounded-lg"
              style={{ background: "rgba(255,255,255,0.08)" }}
              onClick={() => refetchStats()}
            >
              <RefreshCw size={15} color="rgba(255,255,255,0.6)" />
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 px-4 pb-3">
            {([
              { id: "push" as Tab, label: "Push Notification", icon: Bell },
              { id: "email" as Tab, label: "Email Blast", icon: Mail },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all"
                style={tab === id
                  ? { background: "#f97316", color: "#fff" }
                  : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}
              >
                <Icon size={14} />
                <span>{isMobile ? (id === "push" ? "Push" : "Email") : label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

          {/* ── Stats strip ── */}
          {statsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((i) => <div key={i} className="rounded-2xl bg-white h-16 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Bell} label="Push Subscribers" value={stats?.pushSubscribers ?? 0} accent="linear-gradient(135deg,#7c3aed,#a855f7)" />
              <StatCard icon={Users} label="Active Users" value={stats?.activeUsers ?? 0} accent="linear-gradient(135deg,#0b2c60,#1e4da1)" />
            </div>
          )}

          {/* ── SMTP warning ── */}
          {tab === "email" && !stats?.smtpConfigured && !statsLoading && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
              <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">SMTP not configured</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Set <code className="font-mono bg-amber-100 px-1 rounded">SMTP_HOST</code>,{" "}
                  <code className="font-mono bg-amber-100 px-1 rounded">SMTP_USER</code>, and{" "}
                  <code className="font-mono bg-amber-100 px-1 rounded">SMTP_PASS</code> in Secrets to enable email sending.
                </p>
              </div>
            </div>
          )}

          {/* ── PUSH tab ── */}
          {tab === "push" && (
            <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden"
              style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.07)" }}>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Bell size={16} className="text-violet-600" />
                <span className="font-semibold text-slate-800 text-sm">Compose Push Notification</span>
                {(stats?.pushSubscribers ?? 0) > 0 ? (
                  <Badge className="ml-auto text-xs" style={{ background: "#7c3aed20", color: "#7c3aed", border: "none" }}>
                    {stats?.pushSubscribers} device{stats?.pushSubscribers !== 1 ? "s" : ""}
                  </Badge>
                ) : (
                  <Badge className="ml-auto text-xs bg-slate-100 text-slate-500 border-none">No subscribers</Badge>
                )}
              </div>

              <div className="px-5 py-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="push-title" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Title *</Label>
                  <Input
                    id="push-title"
                    placeholder="e.g. Important Update from SAHU CSC"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    maxLength={150}
                    className="text-sm"
                  />
                  <p className="text-xs text-slate-400 text-right">{pushTitle.length}/150</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="push-body" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Message *</Label>
                  <Textarea
                    id="push-body"
                    placeholder="Write your notification message here..."
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    maxLength={500}
                    rows={4}
                    className="text-sm resize-none"
                  />
                  <p className="text-xs text-slate-400 text-right">{pushBody.length}/500</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="push-url" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Link URL <span className="font-normal text-slate-400">(optional)</span>
                  </Label>
                  <Input
                    id="push-url"
                    placeholder="/ledger or https://..."
                    value={pushUrl}
                    onChange={(e) => setPushUrl(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={createInApp}
                    onChange={(e) => setCreateInApp(e.target.checked)}
                    className="w-4 h-4 accent-violet-600"
                  />
                  <span className="text-sm text-slate-700">Also create in-app notification</span>
                </label>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex items-start gap-2">
                  <Info size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This will send a push notification to all <strong>{stats?.pushSubscribers ?? 0}</strong> device(s) that have enabled push
                    notifications. Users who haven't subscribed will not receive it.
                  </p>
                </div>

                <Button
                  className="w-full font-bold text-sm h-11"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff" }}
                  disabled={!pushTitle.trim() || !pushBody.trim() || pushMutation.isPending || (stats?.pushSubscribers ?? 0) === 0}
                  onClick={() => pushMutation.mutate()}
                >
                  {pushMutation.isPending ? (
                    <><RefreshCw size={15} className="animate-spin mr-2" />Sending…</>
                  ) : (
                    <><Send size={15} className="mr-2" />Send to All {stats?.pushSubscribers ?? 0} Subscriber{(stats?.pushSubscribers ?? 0) !== 1 ? "s" : ""}</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ── EMAIL tab ── */}
          {tab === "email" && (
            <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden"
              style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.07)" }}>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Mail size={16} className="text-[#0b2c60]" />
                <span className="font-semibold text-slate-800 text-sm">Compose Email Blast</span>
                <Badge className="ml-auto text-xs" style={{ background: "#0b2c6015", color: "#0b2c60", border: "none" }}>
                  {stats?.usersWithEmail ?? 0} with email
                </Badge>
              </div>

              <div className="px-5 py-5 space-y-4">
                {/* Recipient filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Recipients</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: "all" as const, label: "All registered", count: stats?.usersWithEmail ?? 0 },
                      { value: "active" as const, label: "Active users only", count: stats?.activeUsers ?? 0 },
                    ]).map(({ value, label, count }) => (
                      <button
                        key={value}
                        onClick={() => setRecipientFilter(value)}
                        className="flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition-all"
                        style={recipientFilter === value
                          ? { background: "#eff6ff", borderColor: "#0b2c60", color: "#0b2c60" }
                          : { background: "#fff", borderColor: "#e2e8f0", color: "#64748b" }}
                      >
                        <span className="text-sm font-semibold">{count} users</span>
                        <span className="text-xs opacity-70">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email-subject" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Subject *</Label>
                  <Input
                    id="email-subject"
                    placeholder="e.g. Important announcement from SAHU CSC"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    maxLength={200}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email-body" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Message Body *</Label>
                  <Textarea
                    id="email-body"
                    placeholder="Write your email message here. Plain text is supported — line breaks are preserved."
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={8}
                    className="text-sm resize-none font-mono"
                  />
                </div>

                {/* SMTP status */}
                <div className={`rounded-xl border p-3 flex items-start gap-2 ${stats?.smtpConfigured ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"}`}>
                  {stats?.smtpConfigured
                    ? <Wifi size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                    : <WifiOff size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />}
                  <p className={`text-xs leading-relaxed ${stats?.smtpConfigured ? "text-green-700" : "text-amber-700"}`}>
                    {stats?.smtpConfigured
                      ? `SMTP configured — email will be sent to ${emailRecipientCount} recipient(s).`
                      : "SMTP not configured. Configure email settings in Secrets to enable this feature."}
                  </p>
                </div>

                <Button
                  className="w-full font-bold text-sm h-11"
                  style={{ background: "linear-gradient(135deg,#0b2c60,#1e4da1)", color: "#fff" }}
                  disabled={
                    !emailSubject.trim() || !emailBody.trim() ||
                    !stats?.smtpConfigured || emailMutation.isPending ||
                    emailRecipientCount === 0
                  }
                  onClick={() => emailMutation.mutate()}
                >
                  {emailMutation.isPending ? (
                    <><RefreshCw size={15} className="animate-spin mr-2" />Sending…</>
                  ) : (
                    <><Send size={15} className="mr-2" />Send Email to {emailRecipientCount} User{emailRecipientCount !== 1 ? "s" : ""}</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ── Success result card ── */}
          {(pushMutation.isSuccess || emailMutation.isSuccess) && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">Sent successfully</p>
                <p className="text-xs text-green-700 mt-0.5">
                  {pushMutation.isSuccess && tab === "push"
                    ? `Push notification delivered to ${stats?.pushSubscribers ?? 0} device(s).`
                    : emailMutation.data?.message}
                </p>
              </div>
            </div>
          )}

          {/* ── Tips card ── */}
          <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 space-y-3"
            style={{ boxShadow: "0 2px 8px rgba(11,44,96,0.04)" }}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tips</p>
            <div className="space-y-2">
              {[
                { icon: Bell, text: "Push notifications reach users even when the app is closed, if they've enabled it from the App & Offline page." },
                { icon: Mail, text: "Email blasts go to all registered email addresses. Make sure SMTP is configured in Secrets first." },
                { icon: Megaphone, text: "Use push for time-sensitive alerts and email for detailed announcements." },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg,#0b2c60,#1e4da1)" }}>
                    <Icon size={11} color="#fff" />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
