export interface ReceiptEntry {
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

export interface ReceiptModalProps {
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

