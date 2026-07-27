// Transaction list / table for a single AePS session day
import {
  Fingerprint, ArrowDownLeft, ArrowUpRight, Receipt, Pencil, Trash2,
  Share2, Download, MessageCircle,
} from "lucide-react";
import { fmt, fmtDate, type AepsSession, type AepsTx } from "@/pages/aeps/aeps.constants";

type NonNullAepsSession = NonNullable<AepsSession>;

export interface AepsTransactionTableProps {
  session: NonNullAepsSession;
  showExportMenu: boolean;
  exportLoading: "pdf" | "wa" | null;
  onSetShowExportMenu: (v: boolean | ((prev: boolean) => boolean)) => void;
  onViewReceipt: (tx: AepsTx) => void;
  onEdit: (tx: AepsTx) => void;
  onDelete: (tx: AepsTx) => void;
  onGeneratePDF: () => void;
  onShareWhatsApp: () => void;
}

export function AepsTransactionTable({
  session,
  showExportMenu,
  exportLoading,
  onSetShowExportMenu,
  onViewReceipt,
  onEdit,
  onDelete,
  onGeneratePDF,
  onShareWhatsApp,
}: AepsTransactionTableProps) {
  return (
    <>
      {/* ── Transaction List ── */}
      <div
        className="bg-card rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 2px 14px var(--brand-navy-tint-md), 0 1px 3px rgba(0,0,0,0.04)" }}
      >
        {/* List header */}
        <div
          className="flex items-center justify-between px-4 py-3.5"
          style={{ borderBottom: "1px solid var(--brand-navy-tint-md)" }}
        >
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-navy-800)" }}>Transactions</p>
            <p style={{ fontSize: 10, color: "var(--color-slate-400)", marginTop: 1 }}>
              {fmtDate(session.date)} · {session.transactions.length} {session.transactions.length === 1 ? "entry" : "entries"}
            </p>
          </div>
        </div>

        {session.transactions.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-3 text-center">
            <div
              style={{
                width: 48, height: 48, borderRadius: 14,
                background: "var(--brand-navy-tint-md)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Fingerprint size={22} style={{ color: "var(--brand-navy-800)", opacity: 0.4 }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--brand-navy-800)" }}>No transactions yet</p>
              <p style={{ fontSize: 11, color: "var(--color-slate-400)", marginTop: 2 }}>Use the buttons above to record AePS activity</p>
            </div>
          </div>
        ) : (
          <div>
            {/* Opening row */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ background: "var(--brand-navy-tint-xs)", borderBottom: "1px solid var(--brand-navy-tint-md)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                    background: "linear-gradient(135deg, var(--brand-navy-800), var(--brand-navy-600))",
                    boxShadow: "0 3px 8px var(--brand-navy-shadow-sm)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 9, fontWeight: 900, letterSpacing: "0.06em",
                  }}
                >
                  OB
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-navy-800)" }}>Opening Balance</p>
                  {session.notes && <p style={{ fontSize: 10, color: "var(--color-slate-400)" }}>{session.notes}</p>}
                </div>
              </div>
              <p style={{ fontSize: 14, fontWeight: 800, color: "var(--brand-navy-800)" }}>₹{fmt(session.openingBalance)}</p>
            </div>

            {/* Transaction rows */}
            {session.transactions.map((tx, idx) => {
              const isWd = tx.type === "withdrawal";
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50/80 dark:hover:bg-zinc-800/50"
                  style={{ borderBottom: "1px solid var(--brand-navy-tint-sm)" }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                        background: isWd
                          ? "linear-gradient(135deg, var(--color-error-soft), var(--color-error))"
                          : "linear-gradient(135deg, var(--color-success-light), var(--color-success))",
                        boxShadow: isWd
                          ? "0 3px 8px color-mix(in srgb, var(--color-error) 30%, transparent)"
                          : "0 3px 8px color-mix(in srgb, var(--color-success) 30%, transparent)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {isWd
                        ? <ArrowDownLeft size={15} color="#fff" />
                        : <ArrowUpRight size={15} color="#fff" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--brand-navy-800)" }} className="truncate max-w-[130px] sm:max-w-none">
                          {tx.customerName}
                        </p>
                        <span style={{
                          fontSize: 9, fontWeight: 700, borderRadius: 5, padding: "2px 6px",
                          color: isWd ? "var(--color-error)" : "var(--color-success)",
                          background: isWd ? "var(--color-error-bg)" : "var(--color-success-bg)",
                        }}>
                          #{idx + 1} · {isWd ? "WD" : "DEP"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        {tx.description && (
                          <p style={{ fontSize: 10, color: "var(--color-slate-400)" }} className="truncate max-w-[120px]">{tx.description}</p>
                        )}
                        <p style={{ fontSize: 10, color: "var(--color-slate-400)" }}>
                          {new Date(tx.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <div className="text-right mr-1">
                      <p style={{ fontSize: 13, fontWeight: 800, color: isWd ? "var(--color-error)" : "var(--color-success)" }}>
                        {isWd ? "−" : "+"}₹{fmt(tx.amount)}
                      </p>
                      <p style={{ fontSize: 10, fontWeight: 500, color: tx.balance < 0 ? "var(--color-error)" : "var(--color-slate-400)" }}>
                        ₹{fmt(tx.balance)}
                      </p>
                    </div>
                    <button
                      type="button"
                      title="View Receipt"
                      onClick={() => onViewReceipt(tx)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100 dark:hover:bg-zinc-700/60"
                      style={{ color: "var(--color-slate-400)" }}
                    >
                      <Receipt size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(tx)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100 dark:hover:bg-zinc-700/60"
                      style={{ color: "var(--color-slate-400)" }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(tx)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                      style={{ color: "var(--color-error)" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Closing balance row */}
            <div
              className="flex items-center justify-between px-4 py-3.5"
              style={{
                background: session.currentBalance < 0 ? "var(--color-error-bg)" : "var(--color-success-bg)",
                borderTop: `1px solid ${session.currentBalance < 0 ? "var(--color-error-bg)" : "var(--color-success-bg)"}`,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: session.currentBalance < 0 ? "var(--color-error)" : "var(--color-success)",
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-navy-800)" }}>Closing Balance</span>
              </div>
              <span style={{
                fontSize: 15, fontWeight: 900,
                color: session.currentBalance < 0 ? "var(--color-error)" : "var(--color-success)",
              }}>
                ₹{fmt(session.currentBalance)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Export / Share row ── */}
      {session.transactions.length > 0 && (
        <div className="relative">
          <div className="bg-card rounded-2xl px-4 py-3 flex items-center justify-between" style={{ boxShadow: "0 2px 10px var(--brand-navy-tint-md)" }}>
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--brand-navy-800)" }}>Daily Summary Export</p>
              <p className="text-[11px] text-muted-foreground">{session.transactions.length} transaction{session.transactions.length !== 1 ? "s" : ""} · {fmtDate(session.date)}</p>
            </div>
            <button
              type="button"
              onClick={() => onSetShowExportMenu((v) => !v)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, var(--brand-navy-800), var(--brand-navy-600))", boxShadow: "0 3px 10px var(--brand-navy-shadow)" }}
            >
              <Share2 size={13} />
              Export
            </button>
          </div>

          {/* Dropdown menu */}
          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => onSetShowExportMenu(false)} />
              <div
                className="absolute right-0 top-full mt-2 z-20 bg-card border border-border rounded-2xl overflow-hidden"
                style={{ minWidth: 200, boxShadow: "0 8px 32px var(--brand-navy-border-md), 0 2px 8px rgba(0,0,0,0.08)" }}
              >
                <div className="px-4 py-2.5 border-b" style={{ background: "var(--brand-navy-tint-sm)" }}>
                  <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--color-slate-400)" }}>Export As</p>
                </div>
                <button
                  type="button"
                  onClick={onGeneratePDF}
                  disabled={exportLoading !== null}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, var(--color-error), var(--color-error-soft))" }}>
                    <Download size={14} color="#fff" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--brand-navy-800)" }}>{exportLoading === "pdf" ? "Generating…" : "Download PDF"}</p>
                    <p className="text-[11px] text-muted-foreground">Full transaction report</p>
                  </div>
                </button>
                <div className="border-t" />
                <button
                  type="button"
                  onClick={onShareWhatsApp}
                  disabled={exportLoading !== null}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #25d366, var(--color-success-dim))" }}>
                    <MessageCircle size={14} color="#fff" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--brand-navy-800)" }}>Share via WhatsApp</p>
                    <p className="text-[11px] text-muted-foreground">Pre-filled text summary</p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
