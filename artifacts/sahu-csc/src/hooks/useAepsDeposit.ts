import { maskAadhaar } from "@/pages/aeps/aeps.constants";
import type { UseFormReturn } from "react-hook-form";

type AepsFormValues = { amount: string; customerName: string; description: string };

interface UseAepsDepositParams {
  txType: "withdrawal" | "deposit";
  txAadhaar: string;
  txShowAadhaar: boolean;
  txBankName: string;
  txForm: UseFormReturn<AepsFormValues>;
}

/** Derives all computed values and validation flags for the AePS deposit/withdrawal form. */
export function useAepsDeposit({ txType, txAadhaar, txShowAadhaar, txBankName, txForm }: UseAepsDepositParams) {
  const txAmountVal   = txForm.watch("amount");
  const txCustomerName = txForm.watch("customerName");
  const aadhaarDigits = txAadhaar.replace(/\D/g, "");
  const amtNum        = parseFloat(txAmountVal);
  const isWd          = txType === "withdrawal";

  const accent      = isWd ? "linear-gradient(135deg,#f43f5e,#e11d48)" : "linear-gradient(135deg,#10b981,#059669)";
  const accentColor = isWd ? "#e11d48" : "#059669";
  const accentLight = isWd ? "rgba(244,63,94,0.07)"  : "rgba(16,185,129,0.07)";
  const accentBorder = isWd ? "rgba(244,63,94,0.22)" : "rgba(16,185,129,0.22)";

  const isValidAmount  = !isNaN(amtNum) && amtNum > 0;
  const isValidName    = txCustomerName.trim().length >= 2;
  const isValidAadhaar = aadhaarDigits.length === 0 || aadhaarDigits.length === 12;
  const isValidBank    = txBankName.trim().length > 0;
  const isFormValid    = isValidAmount && isValidName && isValidAadhaar && isValidBank;

  const displayAadhaar = txShowAadhaar
    ? maskAadhaar(txAadhaar)
    : aadhaarDigits.length > 0 ? "XXXX XXXX " + aadhaarDigits.slice(-4) : "";

  return {
    txAmountVal, txCustomerName, aadhaarDigits, amtNum, isWd,
    accent, accentColor, accentLight, accentBorder,
    isValidAmount, isValidName, isValidAadhaar, isValidBank, isFormValid,
    displayAadhaar,
  };
}
