import { Bell, Mail, History, BellRing } from "lucide-react";

/** Tips card shown below the form on push / email / inapp tabs. */
export function BroadcastPreviewCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 space-y-3"
      style={{ boxShadow: "0 2px 8px rgba(11,44,96,0.04)" }}>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tips</p>
      <div className="space-y-2">
        {[
          { icon: Bell,    text: "Push notifications reach users even when the app is closed, if they've enabled it from the App & Offline page." },
          { icon: Mail,    text: "Email blasts go to all registered email addresses. Configure SMTP in Secrets first." },
          { icon: BellRing, text: "In-App notifications appear in the bell icon for every user — no push or email needed." },
          { icon: History, text: "Every broadcast is logged in the History tab — see what was sent, when, and to how many users." },
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
  );
}
