import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReceiptHeader } from "./receipt/ReceiptHeader";
import { ReceiptLineItems } from "./receipt/ReceiptLineItems";
import { ReceiptQrCode } from "./receipt/ReceiptQrCode";
import { ReceiptDownloadButton } from "./receipt/ReceiptDownloadButton";

interface ReceiptEntry {
  id: number;
  date: string;
  customerName: string;
  serviceType: string;
  credit: number;
  debit: number;
  description: string | null;
  balance: number;
  receiptNumber: string | null;
  receiptToken: string | null;
  createdByName: string | null;
  createdAt: string;
}

interface ReceiptModalProps {
  entry: ReceiptEntry | null;
  open: boolean;
  onClose: () => void;
  businessName?: string;
  businessAddress?: string;
  businessMobile?: string;
  businessWebsite?: string;
  autoDownload?: boolean;
  onAutoDownloadComplete?: () => void;
  autoAction?: "print" | "download" | "share" | "whatsapp" | null;
  onAutoActionComplete?: () => void;
}

export function ReceiptModal({
  entry,
  open,
  onClose,
  businessName = "SAHU CSC Center",
  businessAddress = "",
  businessMobile = "",
  businessWebsite = "",
  autoDownload = false,
  onAutoDownloadComplete,
  autoAction = null,
  onAutoActionComplete,
}: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!entry) return null;

  // ── Derived values ────────────────────────────────────────────────────────────
  const receiptToken    = entry.receiptToken;
  const receiptNumber   = entry.receiptNumber ?? `CSC-${new Date(entry.createdAt).getFullYear()}-${String(entry.id).padStart(4, "0")}`;
  const isVerified      = !!receiptToken;
  const isCryptoVerified = !!receiptToken && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(receiptToken);

  const origin   = typeof window !== "undefined" ? window.location.origin : "";
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const verifyUrl = receiptToken
    ? `${origin}${basePath}/receipts/verify/${receiptToken}`
    : `${origin}${basePath}/ledger`;

  const isCredit    = entry.credit > 0;
  const amount      = isCredit ? entry.credit : entry.debit;
  const amountColor  = isCredit ? "#059669" : "#e11d48";
  const amountPrefix = isCredit ? "+" : "−";
  const txType       = isCredit ? "Credit" : "Debit";

  const txDate        = new Date(entry.date);
  const formattedDate = txDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const shortDate     = txDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const issuedAt      = new Date(entry.createdAt).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const amountWhole   = Math.floor(amount).toLocaleString("en-IN");
  const amountDecimal = (amount % 1).toFixed(2).slice(1);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm p-0 overflow-hidden rounded-2xl md:rounded-2xl gap-0 max-h-[95dvh] flex flex-col [&>button:last-child]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Receipt {receiptNumber}</DialogTitle>
        </DialogHeader>

        {/* Scrollable receipt body */}
        <div className="overflow-y-auto flex-1 min-h-0">
          <div ref={printRef} style={{ background: "#fff" }}>
            <ReceiptHeader receiptNumber={receiptNumber} shortDate={shortDate} />
            <ReceiptLineItems
              txType={txType}
              amountColor={amountColor}
              amountPrefix={amountPrefix}
              amountWhole={amountWhole}
              amountDecimal={amountDecimal}
              isCryptoVerified={isCryptoVerified}
              isVerified={isVerified}
              customerName={entry.customerName}
              serviceType={entry.serviceType}
              description={entry.description}
              createdByName={entry.createdByName}
              issuedAt={issuedAt}
            />
            <ReceiptQrCode
              receiptToken={receiptToken}
              verifyUrl={verifyUrl}
              businessName={businessName}
              businessAddress={businessAddress}
              businessMobile={businessMobile}
              businessWebsite={businessWebsite}
            />
          </div>
        </div>

        {/* Action panel */}
        <ReceiptDownloadButton
          printRef={printRef}
          entry={entry}
          receiptNumber={receiptNumber}
          receiptToken={receiptToken}
          verifyUrl={verifyUrl}
          businessName={businessName}
          txType={txType}
          amount={amount}
          formattedDate={formattedDate}
          open={open}
          autoAction={autoAction}
          autoDownload={autoDownload}
          onAutoActionComplete={onAutoActionComplete}
          onAutoDownloadComplete={onAutoDownloadComplete}
        />
      </DialogContent>
    </Dialog>
  );
}
