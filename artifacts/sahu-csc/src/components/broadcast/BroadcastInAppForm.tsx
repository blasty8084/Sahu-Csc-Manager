import { BellRing, Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { NOTIF_TYPES, NOTIF_PRIORITIES } from "./broadcastTypes";

interface BroadcastInAppFormProps {
  inappTitle: string;
  setInappTitle: (v: string) => void;
  inappBody: string;
  setInappBody: (v: string) => void;
  inappType: string;
  setInappType: (v: string) => void;
  inappPriority: string;
  setInappPriority: (v: string) => void;
  inappLink: string;
  setInappLink: (v: string) => void;
  isPending: boolean;
  onSubmit: () => void;
  activeUsers: number;
}

export function BroadcastInAppForm({
  inappTitle, setInappTitle,
  inappBody, setInappBody,
  inappType, setInappType,
  inappPriority, setInappPriority,
  inappLink, setInappLink,
  isPending, onSubmit,
  activeUsers,
}: BroadcastInAppFormProps) {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 overflow-hidden"
      style={{ boxShadow: "0 2px 12px var(--brand-navy-tint-md)" }}>
      <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-700 flex items-center gap-2">
        <BellRing size={16} className="text-emerald-600" />
        <span className="font-semibold text-slate-800 dark:text-zinc-100 text-sm">Send In-App Notification</span>
        <Badge className="ml-auto text-xs border-none" style={{ background: "var(--color-success-bg)", color: "var(--color-success-dim)" }}>
          {activeUsers} users
        </Badge>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 flex items-start gap-2">
          <BellRing size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700 leading-relaxed">
            Posts a notification directly to every user's bell icon — no push or email required.
            Ideal for announcements visible only inside the app.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wide">Title *</Label>
          <Input placeholder="e.g. System maintenance tonight at 11 PM" value={inappTitle}
            onChange={(e) => setInappTitle(e.target.value)} maxLength={150} className="text-sm" />
          <p className="text-xs text-slate-400 dark:text-zinc-500 text-right">{inappTitle.length}/150</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wide">Message *</Label>
          <Textarea placeholder="Write your notification message here..." value={inappBody}
            onChange={(e) => setInappBody(e.target.value)} maxLength={1000} rows={5} className="text-sm resize-none" />
          <p className="text-xs text-slate-400 dark:text-zinc-500 text-right">{inappBody.length}/1000</p>
        </div>

        {/* Type + Priority row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wide">Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {NOTIF_TYPES.map(({ value, label, color }) => (
                <button key={value} onClick={() => setInappType(value)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all"
                  style={inappType === value
                    ? { background: color, color: "#fff", borderColor: color }
                    : { background: "var(--color-slate-50)", color: "var(--color-slate-500)", borderColor: "var(--color-slate-200)" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wide">Priority</Label>
            <div className="flex flex-wrap gap-1.5">
              {NOTIF_PRIORITIES.map(({ value, label }) => (
                <button key={value} onClick={() => setInappPriority(value)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all"
                  style={inappPriority === value
                    ? { background: "var(--brand-navy-800)", color: "#fff", borderColor: "var(--brand-navy-800)" }
                    : { background: "var(--color-slate-50)", color: "var(--color-slate-500)", borderColor: "var(--color-slate-200)" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wide">
            Link URL <span className="font-normal text-slate-400 dark:text-zinc-500">(optional — clicking the notification opens this)</span>
          </Label>
          <Input placeholder="/ledger or https://..." value={inappLink}
            onChange={(e) => setInappLink(e.target.value)} className="text-sm" />
        </div>

        <Button className="w-full font-bold text-sm h-11"
          style={{ background: "linear-gradient(135deg,var(--color-success-dim),var(--color-success-soft))", color: "#fff" }}
          disabled={!inappTitle.trim() || !inappBody.trim() || isPending}
          onClick={onSubmit}>
          {isPending
            ? <><RefreshCw size={15} className="animate-spin mr-2" />Sending…</>
            : <><BellRing size={15} className="mr-2" />Send to All {activeUsers} User{activeUsers !== 1 ? "s" : ""}</>}
        </Button>
      </div>
    </div>
  );
}
