export interface AepsTxReceipt {
  id: number;
  type: "withdrawal" | "deposit";
  amount: number;
  customerName: string;
  description: string | null;
  balance?: number;
  createdAt: string;
  date?: string;
  receiptToken?: string | null;
}

export interface AepsReceiptModalProps {
  tx: AepsTxReceipt | null;
  open: boolean;
  onClose: () => void;
  businessName?: string;
  businessAddress?: string;
  businessMobile?: string;
  businessWebsite?: string;
}
