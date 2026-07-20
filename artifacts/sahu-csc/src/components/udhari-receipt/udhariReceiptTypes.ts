export interface UdhariEntryReceipt {
  id: number;
  type: "gave" | "got";
  amount: number;
  customerName: string;
  customerMobile?: string | null;
  customerAddress?: string | null;
  note: string | null;
  date: string;
  createdAt: string;
  currentBalance: number;
  receiptToken?: string | null;
}

export interface UdhariReceiptModalProps {
  entry: UdhariEntryReceipt | null;
  open: boolean;
  onClose: () => void;
  businessName?: string;
  businessAddress?: string;
  businessMobile?: string;
  businessWebsite?: string;
}
