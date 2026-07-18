import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { AepsTransactionTable } from "@/components/aeps/AepsTransactionTable";
import type { UseDailyTabReturn } from "@/hooks/useDailyTab";

interface DailyTabEntryListProps {
  state: UseDailyTabReturn;
}

/**
 * Withdrawal / Deposit action buttons and the paginated transaction table for
 * the selected day. Both sections are tightly coupled to the same session data
 * and share action callbacks, so they live in one component.
 */
export function DailyTabEntryList({ state }: DailyTabEntryListProps) {
  const {
    session,
    openWithdrawal, openDeposit,
    showExportMenu, setShowExportMenu, exportLoading,
    setReceiptTx, openEditDialog, setDeletingTx,
    generateAepsPDF, shareAepsWhatsApp,
  } = state;

  if (!session) return null;

  return (
    <>
      {/* ── Action Buttons ── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={openWithdrawal}
          className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)", boxShadow: "0 4px 16px rgba(244,63,94,0.35)" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}>
            <ArrowDownLeft size={22} />
          </div>
          <span className="text-sm">AePS Withdrawal</span>
        </button>

        <button
          type="button"
          onClick={openDeposit}
          className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 16px rgba(16,185,129,0.35)" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}>
            <ArrowUpRight size={22} />
          </div>
          <span className="text-sm">AePS Deposit</span>
        </button>
      </div>

      {/* ── Transaction List + Export ── */}
      <AepsTransactionTable
        session={session}
        showExportMenu={showExportMenu}
        exportLoading={exportLoading}
        onSetShowExportMenu={setShowExportMenu}
        onViewReceipt={setReceiptTx}
        onEdit={openEditDialog}
        onDelete={setDeletingTx}
        onGeneratePDF={generateAepsPDF}
        onShareWhatsApp={shareAepsWhatsApp}
      />
    </>
  );
}
