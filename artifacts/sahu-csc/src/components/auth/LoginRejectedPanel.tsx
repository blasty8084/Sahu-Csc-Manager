import { useState } from "react";
import { motion } from "framer-motion";
import { Ban, MessageCircle, Mail } from "lucide-react";

interface Props {
  rejectedInfo: { reason: string | null } | null;
  adminContact: { name: string; phone: string | null; email: string | null } | null;
  onDismissStatus: () => void;
  /** form.getValues("identifier") — passed in to build appeal message */
  identifier: string;
}

/** Logs an appeal attempt to the API; returns false if rate-limited. */
async function fireAppealLog(identifier: string, channel: "whatsapp" | "email"): Promise<boolean> {
  if (!identifier) return true;
  const base = (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") ?? "";
  try {
    const res = await fetch(`${base}/api/auth/appeal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, channel }),
    });
    if (res.status === 429) {
      const data = await res.json().catch(() => ({}));
      return data; // caller reads cooldown message
    }
  } catch { /* network error — let the link open anyway */ }
  return true;
}

export function LoginRejectedPanel({ rejectedInfo, adminContact, onDismissStatus, identifier }: Props) {
  const [appealCooldownMsg, setAppealCooldownMsg] = useState<string | null>(null);

  const handleAppeal = async (channel: "whatsapp" | "email", openFn: () => void) => {
    const base = (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") ?? "";
    try {
      const res = await fetch(`${base}/api/auth/appeal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, channel }),
      });
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        setAppealCooldownMsg(data.error ?? "Please wait before submitting another appeal.");
        return;
      }
      setAppealCooldownMsg(null);
    } catch { /* let link open */ }
    openFn();
  };

  if (!rejectedInfo) return null;

  return (
    <motion.div
      key="rejected-panel"
      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}
      className="rounded-2xl border-2 overflow-hidden"
      style={{ borderColor: "#fed7aa", background: "#fff7ed" }}
    >
      <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #f97316, #ea580c)" }} />
      <div className="px-4 py-4">
        <div className="flex flex-col items-center text-center mb-3">
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.4, delay: 0.15 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
            style={{ background: "linear-gradient(135deg, #f97316, #c2410c)" }}>
            <Ban className="w-7 h-7 text-white" />
          </motion.div>
          <h3 className="text-base font-bold" style={{ color: "#c2410c" }}>Registration Declined</h3>
          <p className="text-xs mt-1" style={{ color: "#9a3412" }}>Your registration request was not approved by the administrator.</p>
        </div>

        {rejectedInfo.reason && (
          <div className="rounded-xl px-3 py-2.5 mb-3 border" style={{ background: "rgba(249,115,22,0.07)", borderColor: "#fed7aa" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#ea580c" }}>Reason</p>
            <p className="text-sm font-medium leading-relaxed" style={{ color: "#7c2d12" }}>{rejectedInfo.reason}</p>
          </div>
        )}

        {(adminContact?.phone || adminContact?.email) ? (
          <div className="space-y-2 mb-3">
            <p className="text-[11px] text-center font-semibold" style={{ color: "#9a3412" }}>Contact the administrator to appeal:</p>
            <div className={`grid gap-2 ${adminContact.phone && adminContact.email ? "grid-cols-2" : "grid-cols-1"}`}>
              {adminContact.phone && (() => {
                const digits = adminContact.phone!.replace(/\D/g, "");
                const waNum = digits.length === 10 ? `91${digits}` : digits;
                const msg = encodeURIComponent(`Hi, I am ${identifier || "a user"}. My SAHU CSC registration was declined.${rejectedInfo.reason ? ` Reason given: "${rejectedInfo.reason}".` : ""} I would like to appeal this decision.`);
                return (
                  <button type="button"
                    onClick={() => handleAppeal("whatsapp", () => window.open(`https://wa.me/${waNum}?text=${msg}`, "_blank", "noopener,noreferrer"))}
                    className="flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold transition-opacity active:opacity-80"
                    style={{ background: "#25d366", color: "#fff" }}>
                    <MessageCircle className="w-3.5 h-3.5" />WhatsApp
                  </button>
                );
              })()}
              {adminContact.email && (() => {
                const subject = encodeURIComponent(`Appeal: SAHU CSC Registration Declined — ${identifier || "User"}`);
                const body = encodeURIComponent(`Hello,\n\nI am ${identifier || "a registered user"} and my SAHU CSC registration was declined.${rejectedInfo.reason ? `\n\nReason given: "${rejectedInfo.reason}"` : ""}\n\nI would like to appeal this decision.\n\nThank you.`);
                return (
                  <button type="button"
                    onClick={() => handleAppeal("email", () => { window.location.href = `mailto:${adminContact!.email}?subject=${subject}&body=${body}`; })}
                    className="flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold transition-opacity active:opacity-80"
                    style={{ background: "#0b2c60", color: "#fff" }}>
                    <Mail className="w-3.5 h-3.5" />Email Admin
                  </button>
                );
              })()}
            </div>
            {appealCooldownMsg && (
              <p className="text-[11px] text-center font-medium mt-1" style={{ color: "#b45309" }}>⏳ {appealCooldownMsg}</p>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-center mb-3" style={{ color: "#9a3412" }}>
            For assistance, contact your administrator or register with a different account.
          </p>
        )}

        <button type="button" onClick={onDismissStatus}
          className="w-full h-10 rounded-xl font-semibold text-sm border-2 transition-colors"
          style={{ borderColor: "#fed7aa", color: "#c2410c", background: "transparent" }}>
          Try a different account →
        </button>
      </div>
    </motion.div>
  );
}
