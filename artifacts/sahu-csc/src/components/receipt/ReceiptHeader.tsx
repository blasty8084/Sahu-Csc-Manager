// receipt/ReceiptHeader.tsx — navy gradient brand block + receipt-number / date row

interface ReceiptHeaderProps {
  receiptNumber: string;
  shortDate: string;
}

export function ReceiptHeader({ receiptNumber, shortDate }: ReceiptHeaderProps) {
  return (
    <>
      {/* ── Premium Navy Header ─────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0b2c60 0%, #1a3f7a 55%, #071938 100%)",
        padding: "22px 24px 20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Noise texture */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.15, pointerEvents: "none", mixBlendMode: "overlay",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} />
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -20, right: -20, width: 88, height: 88, borderRadius: "50%", background: "rgba(249,115,22,0.15)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -28, left: 24, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />

        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", position: "relative", lineHeight: 1, marginBottom: 4 }}>
          SAHU <span style={{ color: "#f97316" }}>CSC</span>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", position: "relative" }}>
          Official E-Receipt
        </p>

        {/* Gold accent stripe */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #f97316, #fcd34d 50%, #f97316)" }} />
      </div>

      {/* ── Receipt Info Row ────────────────────────────────────────────────── */}
      <div style={{ padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #e2e8f0" }}>
        <div>
          <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>Receipt No</p>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#0b2c60", fontFamily: "monospace", letterSpacing: "0.04em" }}>{receiptNumber}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>Date</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#0b2c60" }}>{shortDate}</p>
        </div>
      </div>
    </>
  );
}
