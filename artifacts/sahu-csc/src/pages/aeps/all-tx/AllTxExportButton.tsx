import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AllTxResponse } from "../aeps.constants";

interface AllTxExportButtonProps {
  data: AllTxResponse | undefined;
}

/** Downloads the current filtered page of transactions as a CSV file. */
export function AllTxExportButton({ data }: AllTxExportButtonProps) {
  const handleExport = () => {
    const rows = data?.transactions ?? [];
    if (!rows.length) return;
    const header = ["Date", "Customer Name", "Type", "Amount (INR)", "Description"].join(",");
    const lines = rows.map((tx) =>
      [
        tx.date,
        `"${(tx.customerName ?? "").replace(/"/g, '""')}"`,
        tx.type,
        tx.amount,
        `"${(tx.description ?? "").replace(/"/g, '""')}"`,
      ].join(","),
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aeps-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 h-8 text-xs"
      onClick={handleExport}
      disabled={!data?.transactions?.length}
    >
      <Download size={13} />
      Export CSV
    </Button>
  );
}
