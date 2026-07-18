import { AepsReceiptModal } from "@/components/aeps-receipt-modal";
import { AepsWithdrawalForm } from "@/components/aeps/AepsWithdrawalForm";
import { AepsDepositForm } from "@/components/aeps/AepsDepositForm";
import { OpenDayDialog } from "@/components/aeps/OpenDayDialog";
import { EditTransactionDialog } from "@/pages/aeps/EditTransactionDialog";
import { DeleteTransactionDialog } from "@/pages/aeps/DeleteTransactionDialog";
import type { UseDailyTabReturn } from "@/hooks/useDailyTab";

interface DailyTabFormProps {
  state: UseDailyTabReturn;
}

/**
 * All popup dialogs and form overlays for the Daily AePS tab:
 * open-day dialog, withdrawal/deposit forms (mobile + desktop),
 * edit dialog, delete dialog, and the receipt modal.
 */
export function DailyTabForm({ state }: DailyTabFormProps) {
  const {
    isMobile, selectedDate,
    showOpenDialog, setShowOpenDialog,
    showTxDialog, txType, setTxType,
    txStep, setTxStep,
    txAadhaar, setTxAadhaar, txShowAadhaar, setTxShowAadhaar,
    txBankName, setTxBankName, txAccountNo, setTxAccountNo, txNote, setTxNote,
    session, txForm, openForm,
    aepsCustomerNames, aepsFrequentCustomers,
    openMut, txMut, editMut, deleteMut,
    editingTx, setEditingTx, deletingTx, setDeletingTx, receiptTx, setReceiptTx,
    editForm, editCustomerName,
    onOpenSubmit, onEditSubmit, handleConfirmSave, handleNewTransaction, handleCloseTxDialog,
    businessName, businessAddress, businessMobile, businessWebsite,
  } = state;

  return (
    <>
      <OpenDayDialog
        open={showOpenDialog}
        onClose={() => setShowOpenDialog(false)}
        isMobile={isMobile}
        session={session}
        selectedDate={selectedDate}
        openForm={openForm}
        onSubmit={onOpenSubmit}
        isPending={openMut.isPending}
      />

      {isMobile && (
        <AepsWithdrawalForm
          open={showTxDialog}
          txType={txType} txStep={txStep}
          txAadhaar={txAadhaar} txShowAadhaar={txShowAadhaar}
          txBankName={txBankName} txAccountNo={txAccountNo} txNote={txNote}
          session={session} txForm={txForm}
          aepsCustomerNames={aepsCustomerNames} aepsFrequentCustomers={aepsFrequentCustomers}
          isMutPending={txMut.isPending}
          onClose={handleCloseTxDialog}
          onSetTxType={setTxType} onSetTxStep={setTxStep}
          onSetTxAadhaar={setTxAadhaar} onSetTxShowAadhaar={setTxShowAadhaar}
          onSetTxBankName={setTxBankName} onSetTxAccountNo={setTxAccountNo} onSetTxNote={setTxNote}
          onConfirmSave={handleConfirmSave} onNewTransaction={handleNewTransaction}
        />
      )}

      {!isMobile && showTxDialog && (
        <AepsDepositForm
          txType={txType} txStep={txStep}
          txAadhaar={txAadhaar} txShowAadhaar={txShowAadhaar}
          txBankName={txBankName} txAccountNo={txAccountNo} txNote={txNote}
          session={session} txForm={txForm}
          aepsCustomerNames={aepsCustomerNames} aepsFrequentCustomers={aepsFrequentCustomers}
          isMutPending={txMut.isPending}
          onClose={handleCloseTxDialog}
          onSetTxType={setTxType} onSetTxStep={setTxStep}
          onSetTxAadhaar={setTxAadhaar} onSetTxShowAadhaar={setTxShowAadhaar}
          onSetTxBankName={setTxBankName} onSetTxAccountNo={setTxAccountNo} onSetTxNote={setTxNote}
          onConfirmSave={handleConfirmSave} onNewTransaction={handleNewTransaction}
        />
      )}

      <EditTransactionDialog
        open={!!editingTx}
        onOpenChange={(open) => { if (!open) setEditingTx(null); }}
        editForm={editForm}
        editCustomerName={editCustomerName}
        suggestions={aepsCustomerNames}
        onSubmit={onEditSubmit}
        isPending={editMut.isPending}
      />

      <DeleteTransactionDialog
        tx={deletingTx}
        onOpenChange={(open) => { if (!open) setDeletingTx(null); }}
        onConfirm={() => deletingTx && deleteMut.mutate(deletingTx.id)}
        isPending={deleteMut.isPending}
      />

      <AepsReceiptModal
        open={receiptTx !== null}
        tx={receiptTx ? {
          id: receiptTx.id, type: receiptTx.type, amount: receiptTx.amount,
          customerName: receiptTx.customerName, description: receiptTx.description,
          balance: receiptTx.balance, createdAt: receiptTx.createdAt,
          date: selectedDate, receiptToken: receiptTx.receiptToken,
        } : null}
        onClose={() => setReceiptTx(null)}
        businessName={businessName} businessAddress={businessAddress}
        businessMobile={businessMobile} businessWebsite={businessWebsite}
      />
    </>
  );
}
