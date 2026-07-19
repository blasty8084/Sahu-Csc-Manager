import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { LedgerRowActions } from "./LedgerRowActions";

// ── Desktop non-editing table row ────────────────────────────────────────────

interface LedgerDesktopRowProps {
  entry: any;
  rowNum: number;
  svcColor: string;
  onReceipt: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Single non-editing desktop `<tr>` with receipt number, date, customer
 * avatar, service badge, credit/debit amounts, running balance, note, and
 * the shared LedgerRowActions cluster.
 */
export function LedgerDesktopRow({ entry, rowNum, svcColor, onReceipt, onEdit, onDelete }: LedgerDesktopRowProps) {
  const balanceNum = Number(entry.balance);
  return (
    <tr
      key={entry.id}
      data-testid={`row-ledger-${entry.id}`}
      style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(11,44,96,0.018)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <td style={{ padding: "14px 14px", color: "#d1d5db", fontSize: 11, fontWeight: 700 }}>{rowNum}</td>
      <td style={{ padding: "14px 14px", whiteSpace: "nowrap" }}>
        <code style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: "#f97316", background: "rgba(249,115,22,0.07)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(249,115,22,0.12)" }}>
          {entry.receiptNumber ?? `CSC-${new Date(entry.createdAt).getFullYear()}-${String(entry.id).padStart(4, "0")}`}
        </code>
      </td>
      <td style={{ padding: "14px 14px", fontSize: 12, fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" }}>{entry.date}</td>
      <td style={{ padding: "14px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: svcColor + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: svcColor }}>{(entry.customerName || "?")[0].toUpperCase()}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{entry.customerName}</span>
        </div>
      </td>
      <td style={{ padding: "14px 14px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: svcColor, background: svcColor + "14", padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap", display: "inline-block" }}>{entry.serviceType}</span>
      </td>
      <td style={{ padding: "14px 14px", textAlign: "right", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>
        {entry.credit > 0 ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669", display: "inline-block", flexShrink: 0 }} />
            <span style={{ color: "#059669" }}>+₹{entry.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </span>
        ) : <span style={{ color: "#e2e8f0" }}>—</span>}
      </td>
      <td style={{ padding: "14px 14px", textAlign: "right", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>
        {entry.debit > 0 ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e11d48", display: "inline-block", flexShrink: 0 }} />
            <span style={{ color: "#e11d48" }}>−₹{entry.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </span>
        ) : <span style={{ color: "#e2e8f0" }}>—</span>}
      </td>
      <td style={{ padding: "14px 14px", textAlign: "right", fontWeight: 900, fontSize: 13, color: balanceNum < 0 ? "#e11d48" : "#0b2c60", whiteSpace: "nowrap" }}>
        ₹{balanceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </td>
      <td style={{ padding: "14px 14px", fontSize: 11, color: "#94a3b8", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.description || "—"}</td>
      <td style={{ padding: "14px 10px" }}>
        <LedgerRowActions size="md" onReceipt={onReceipt} onEdit={onEdit} onDelete={onDelete} />
      </td>
    </tr>
  );
}

// ── Mobile date-grouped card entry ───────────────────────────────────────────

interface LedgerMobileRowProps {
  entry: any;
  onReceipt: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Single mobile transaction card with colour-coded left bar, icon badge,
 * customer + service, amount + balance, and the shared LedgerRowActions cluster.
 */
export function LedgerMobileRow({ entry, onReceipt, onEdit, onDelete }: LedgerMobileRowProps) {
  const isCredit = entry.credit > 0;
  const amt      = isCredit ? entry.credit : entry.debit;
  const ec       = isCredit ? "#059669" : "#e11d48";
  const iconBg   = isCredit ? "rgba(5,150,105,0.08)" : "rgba(225,29,72,0.08)";

  return (
    <div
      data-testid={`row-ledger-${entry.id}`}
      style={{ background: "#fff", borderRadius: 14, marginBottom: 8, overflow: "hidden", boxShadow: "0 1px 8px rgba(11,44,96,0.07)", display: "flex", border: "1px solid #f1f5f9" }}
    >
      <div style={{ width: 4, background: ec, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: "11px 12px", display: "flex", alignItems: "center", gap: 10 }}>
        {/* Icon badge */}
        <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isCredit
            ? <ArrowDownLeft size={17} color={ec} strokeWidth={2.5} />
            : <ArrowUpRight  size={17} color={ec} strokeWidth={2.5} />}
        </div>
        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.customerName}</p>
          <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{entry.serviceType}</p>
        </div>
        {/* Amount + balance + actions */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 900, color: ec, lineHeight: 1 }}>{isCredit ? "+" : "−"}₹{amt.toLocaleString("en-IN")}</p>
          <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>Bal ₹{Number(entry.balance).toLocaleString("en-IN")}</p>
          <div style={{ marginTop: 5 }}>
            <LedgerRowActions size="sm" onReceipt={onReceipt} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>
      </div>
    </div>
  );
}
