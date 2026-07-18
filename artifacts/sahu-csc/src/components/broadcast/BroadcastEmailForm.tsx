import { Mail, Wifi, WifiOff, Send, RefreshCw, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BroadcastStats } from "./broadcastTypes";

interface BroadcastEmailFormProps {
  emailSubject: string;
  setEmailSubject: (v: string) => void;
  emailBody: string;
  setEmailBody: (v: string) => void;
  recipientFilter: "all" | "active";
  setRecipientFilter: (v: "all" | "active") => void;
  createInAppWithEmail: boolean;
  setCreateInAppWithEmail: (v: boolean) => void;
  isPending: boolean;
  onSubmit: () => void;
  stats: BroadcastStats | undefined;
  statsLoading: boolean;
  emailRecipientCount: number;
}

export function BroadcastEmailForm({
  emailSubject, setEmailSubject,
  emailBody, setEmailBody,
  recipientFilter, setRecipientFilter,
  createInAppWithEmail, setCreateInAppWithEmail,
  isPending, onSubmit,
  stats, statsLoading,
  emailRecipientCount,
}: BroadcastEmailFormProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* SMTP warning banner */}
      {!stats?.smtpConfigured && !statsLoading && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{t("broadcast.smtp_not_configured")}</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Set <code className="font-mono bg-amber-100 px-1 rounded">SMTP_HOST</code>,{" "}
              <code className="font-mono bg-amber-100 px-1 rounded">SMTP_USER</code>, and{" "}
              <code className="font-mono bg-amber-100 px-1 rounded">SMTP_PASS</code> in Secrets to enable email.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.07)" }}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Mail size={16} className="text-[#0b2c60]" />
          <span className="font-semibold text-slate-800 text-sm">{t("broadcast.tab_email")}</span>
          <Badge className="ml-auto text-xs border-none" style={{ background: "#0b2c6015", color: "#0b2c60" }}>
            {stats?.usersWithEmail ?? 0} with email
          </Badge>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Recipients</Label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "all" as const, label: "All registered", count: stats?.usersWithEmail ?? 0 },
                { value: "active" as const, label: "Active users only", count: stats?.activeUsers ?? 0 },
              ]).map(({ value, label, count }) => (
                <button key={value} onClick={() => setRecipientFilter(value)}
                  className="flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition-all"
                  style={recipientFilter === value
                    ? { background: "#eff6ff", borderColor: "#0b2c60", color: "#0b2c60" }
                    : { background: "#fff", borderColor: "#e2e8f0", color: "#64748b" }}>
                  <span className="text-sm font-semibold">{count} users</span>
                  <span className="text-xs opacity-70">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Subject *</Label>
            <Input placeholder="e.g. Important announcement from SAHU CSC" value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)} maxLength={200} className="text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Message Body *</Label>
            <Textarea placeholder="Write your email message here. Line breaks are preserved." value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)} rows={8} className="text-sm resize-none font-mono" />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" checked={createInAppWithEmail} onChange={(e) => setCreateInAppWithEmail(e.target.checked)}
              className="w-4 h-4 accent-blue-700" />
            <span className="text-sm text-slate-700">Also create in-app notification (bell icon)</span>
          </label>

          <div className={`rounded-xl border p-3 flex items-start gap-2 ${stats?.smtpConfigured ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"}`}>
            {stats?.smtpConfigured
              ? <Wifi size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
              : <WifiOff size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />}
            <p className={`text-xs leading-relaxed ${stats?.smtpConfigured ? "text-green-700" : "text-amber-700"}`}>
              {stats?.smtpConfigured
                ? `SMTP configured — email will be sent to ${emailRecipientCount} recipient(s).`
                : t("broadcast.smtp_not_configured")}
            </p>
          </div>

          <Button className="w-full font-bold text-sm h-11"
            style={{ background: "linear-gradient(135deg,#0b2c60,#1e4da1)", color: "#fff" }}
            disabled={!emailSubject.trim() || !emailBody.trim() || !stats?.smtpConfigured || isPending || emailRecipientCount === 0}
            onClick={onSubmit}>
            {isPending
              ? <><RefreshCw size={15} className="animate-spin mr-2" />Sending…</>
              : <><Send size={15} className="mr-2" />Send Email to {emailRecipientCount} User{emailRecipientCount !== 1 ? "s" : ""}</>}
          </Button>
        </div>
      </div>
    </>
  );
}
