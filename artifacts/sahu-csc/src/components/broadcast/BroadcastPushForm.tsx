import { Bell, Send, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface BroadcastPushFormProps {
  pushTitle: string;
  setPushTitle: (v: string) => void;
  pushBody: string;
  setPushBody: (v: string) => void;
  pushUrl: string;
  setPushUrl: (v: string) => void;
  createInAppWithPush: boolean;
  setCreateInAppWithPush: (v: boolean) => void;
  isPending: boolean;
  onSubmit: () => void;
  pushSubscribers: number;
}

export function BroadcastPushForm({
  pushTitle, setPushTitle,
  pushBody, setPushBody,
  pushUrl, setPushUrl,
  createInAppWithPush, setCreateInAppWithPush,
  isPending, onSubmit,
  pushSubscribers,
}: BroadcastPushFormProps) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(11,44,96,0.07)" }}>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <Bell size={16} className="text-violet-600" />
        <span className="font-semibold text-slate-800 text-sm">Compose Push Notification</span>
        {pushSubscribers > 0
          ? <Badge className="ml-auto text-xs border-none" style={{ background: "#7c3aed20", color: "#7c3aed" }}>{pushSubscribers} device{pushSubscribers !== 1 ? "s" : ""}</Badge>
          : <Badge className="ml-auto text-xs bg-slate-100 text-slate-500 border-none">No subscribers</Badge>}
      </div>

      <div className="px-5 py-5 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Title *</Label>
          <Input placeholder="e.g. Important Update from SAHU CSC" value={pushTitle}
            onChange={(e) => setPushTitle(e.target.value)} maxLength={150} className="text-sm" />
          <p className="text-xs text-slate-400 text-right">{pushTitle.length}/150</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Message *</Label>
          <Textarea placeholder="Write your notification message here..." value={pushBody}
            onChange={(e) => setPushBody(e.target.value)} maxLength={500} rows={4} className="text-sm resize-none" />
          <p className="text-xs text-slate-400 text-right">{pushBody.length}/500</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Link URL <span className="font-normal text-slate-400">(optional)</span>
          </Label>
          <Input placeholder="/ledger or https://..." value={pushUrl}
            onChange={(e) => setPushUrl(e.target.value)} className="text-sm" />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={createInAppWithPush} onChange={(e) => setCreateInAppWithPush(e.target.checked)}
            className="w-4 h-4 accent-violet-600" />
          <span className="text-sm text-slate-700">Also create in-app notification (bell icon)</span>
        </label>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex items-start gap-2">
          <Info size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Sends to all <strong>{pushSubscribers}</strong> device(s) that have enabled push notifications from the App &amp; Offline page.
          </p>
        </div>

        <Button className="w-full font-bold text-sm h-11"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff" }}
          disabled={!pushTitle.trim() || !pushBody.trim() || isPending || pushSubscribers === 0}
          onClick={onSubmit}>
          {isPending
            ? <><RefreshCw size={15} className="animate-spin mr-2" />Sending…</>
            : <><Send size={15} className="mr-2" />Send to All {pushSubscribers} Subscriber{pushSubscribers !== 1 ? "s" : ""}</>}
        </Button>
      </div>
    </div>
  );
}
