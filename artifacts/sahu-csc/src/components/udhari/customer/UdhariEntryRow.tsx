import { useTranslation } from "react-i18next";
import { ArrowDownLeft, ArrowUpRight, Pencil, Receipt, Trash2 } from "lucide-react";
import { fmt } from "./utils";

interface Props {
  e: any;
  onEdit: () => void;
  onDelete: () => void;
  onReceipt: () => void;
}

export function UdhariEntryRow({ e, onEdit, onDelete, onReceipt }: Props) {
  const { t } = useTranslation();
  const isGave = e.type === "gave";
  const color = isGave ? "#ea580c" : "#059669";
  const bg    = isGave ? "rgba(249,115,22,0.08)" : "rgba(16,185,129,0.08)";
  const label = isGave ? t("udhari.customer.you_gave") : t("udhari.customer.you_got");

  return (
    <div
      className="bg-white rounded-xl flex items-start gap-3 px-4 py-3"
      style={{ boxShadow: "0 1px 6px rgba(11,44,96,0.06)" }}
    >
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: bg }}>
        {isGave
          ? <ArrowUpRight size={15} style={{ color }} />
          : <ArrowDownLeft size={15} style={{ color }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold" style={{ color }}>{label}</span>
          <span className="text-sm font-black" style={{ color }}>{isGave ? "+" : "-"}{fmt(e.amount)}</span>
        </div>
        {e.note && <p className="text-xs text-muted-foreground mt-0.5 truncate">{e.note}</p>}
        <p className="text-[10px] text-muted-foreground mt-1">{e.date}</p>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button onClick={onReceipt} title="View Receipt"
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
          <Receipt size={11} className="text-muted-foreground" />
        </button>
        <button onClick={onEdit}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
          <Pencil size={11} className="text-muted-foreground" />
        </button>
        <button onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors">
          <Trash2 size={11} className="text-destructive" />
        </button>
      </div>
    </div>
  );
}
