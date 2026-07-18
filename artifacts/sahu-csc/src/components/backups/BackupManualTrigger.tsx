import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

interface BackupManualTriggerProps {
  backupsCount: number;
  createIsPending: boolean;
  onCreate: () => void;
}

/** Page header — snapshot count summary + "Create Backup" / "Creating…" button. */
export function BackupManualTrigger({ backupsCount, createIsPending, onCreate }: BackupManualTriggerProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
      <div>
        <h2 className="text-xl font-bold text-[#0b2c60]">{t("backups.title")}</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {backupsCount} snapshot{backupsCount !== 1 ? "s" : ""} available · Manage database backups and restore points
        </p>
      </div>
      <Button
        onClick={onCreate}
        disabled={createIsPending}
        data-testid="button-create-backup"
        className="bg-[#f97316] hover:bg-[#ea580c] text-white shadow-sm shrink-0"
      >
        {createIsPending
          ? <><Loader2 size={14} className="mr-1.5 animate-spin" />{t("backups.creating")}</>
          : <><Plus size={14} className="mr-1.5" />{t("backups.create")}</>
        }
      </Button>
    </div>
  );
}
