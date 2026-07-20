import { Fingerprint, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { fmt, type AepsSession } from "@/pages/aeps/aeps.constants";

interface DepositLeftPanelProps {
  isWd: boolean;
  txStep: "form" | "confirm" | "success";
  session: AepsSession | undefined;
  isValidAmount: boolean;
  amtNum: number;
}

/** Left gradient info panel — title, session balance stats, security badge. */
export function DepositLeftPanel({ isWd, txStep, session, isValidAmount, amtNum }: DepositLeftPanelProps) {
  const bg = isWd
    ? "linear-gradient(160deg,#7f1d1d 0%,#b91c1c 55%,#e11d48 100%)"
    : "linear-gradient(160deg,#064e3b 0%,#047857 55%,#10b981 100%)";

  return (
    <div style={{ width: 380, flexShrink: 0, background: bg, display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -70, right: -70, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -50, left: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(0,0,0,0.12)", pointerEvents: "none" }} />

      {/* Branding */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, position: "relative" }}>
        <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.20)", border: "1.5px solid rgba(255,255,255,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
        </div>
        <div><span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU CSC</span></div>
      </div>

      {/* Icon + title */}
      <div style={{ position: "relative", marginBottom: 24 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          {isWd ? <ArrowDownLeft size={30} color="#fff" strokeWidth={2.5} /> : <ArrowUpRight size={30} color="#fff" strokeWidth={2.5} />}
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 8, padding: "4px 10px", marginBottom: 10 }}>
          <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>AePS</span>
        </div>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>
          {txStep === "success" ? "Transaction Complete!" : txStep === "confirm" ? "Confirm Transaction" : isWd ? "Cash Withdrawal" : "Cash Deposit"}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 13, lineHeight: 1.6 }}>
          {txStep === "form"
            ? (isWd ? "Customer receives cash using Aadhaar biometric authentication." : "Customer deposits cash into their bank account via AePS.")
            : txStep === "confirm"
            ? "Please verify the details carefully before confirming."
            : "AePS transaction has been recorded successfully."}
        </p>
      </div>

      {/* Session balance stats */}
      {session && (
        <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 16, padding: "16px 18px", marginBottom: 12, position: "relative" }}>
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Today's Session</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.60)", fontSize: 12 }}>Current Balance</span>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>₹{fmt(session.currentBalance)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.60)", fontSize: 12 }}>Opening</span>
              <span style={{ color: "rgba(255,255,255,0.80)", fontWeight: 600, fontSize: 13 }}>₹{fmt(session.openingBalance)}</span>
            </div>
          </div>
          {isWd && isValidAmount && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>After withdrawal</span>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>₹{fmt(session.currentBalance - amtNum)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: "10px 14px", marginTop: "auto", position: "relative" }}>
        <Fingerprint size={18} color="rgba(255,255,255,0.70)" />
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, lineHeight: 1.5 }}>Secured via NPCI Aadhaar-based biometric authentication</p>
      </div>
    </div>
  );
}
