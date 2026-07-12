import { AlertTriangle, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import type { TableInfo } from "@/hooks/useBackups";

interface BackupActionsProps {
  // Restore dialog
  restoreId: number | null;
  setRestoreId: (id: number | null) => void;
  restoreFilename: string;
  restoreIsPending: boolean;
  handleRestore: () => void;
  // Delete dialog
  deleteId: number | null;
  setDeleteId: (id: number | null) => void;
  deleteFilename: string;
  deleteLoading: boolean;
  handleDelete: () => void;
  // Selective import confirm dialog
  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
  selectedTables: Set<string>;
  analyzedTables: TableInfo[];
  originalName: string;
  handleSelectiveImport: () => void;
  t: (key: string) => string;
}

export function BackupActions({
  restoreId, setRestoreId, restoreFilename, restoreIsPending, handleRestore,
  deleteId, setDeleteId, deleteFilename, deleteLoading, handleDelete,
  confirmOpen, setConfirmOpen, selectedTables, analyzedTables, originalName, handleSelectiveImport,
  t,
}: BackupActionsProps) {
  return (
    <>
      {/* Delete confirm dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="mx-auto w-11 h-11 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3">
              <Trash2 size={20} />
            </div>
            <DialogTitle className="text-center">Delete Backup?</DialogTitle>
            <DialogDescription className="text-center text-sm text-slate-500 pt-1">
              This will permanently delete the backup file from disk and remove it from history. This cannot be undone.
            </DialogDescription>
            {deleteFilename && (
              <p className="text-xs font-mono bg-slate-50 border rounded-md px-3 py-2 text-slate-700 mt-2 break-all">{deleteFilename}</p>
            )}
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {deleteLoading
                ? <><Loader2 size={12} className="mr-1.5 animate-spin" />Deleting…</>
                : <><Trash2 size={12} className="mr-1.5" />Delete</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore confirm dialog */}
      <Dialog open={restoreId !== null} onOpenChange={() => setRestoreId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="mx-auto w-11 h-11 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3">
              <AlertTriangle size={20} />
            </div>
            <DialogTitle className="text-center">{t("backups.restore_title")}</DialogTitle>
            <DialogDescription className="text-center text-sm text-slate-500 pt-1">
              {t("backups.restore_desc")}
            </DialogDescription>
            {restoreFilename && (
              <p className="text-xs font-mono bg-slate-50 border rounded-md px-3 py-2 text-slate-700 mt-2 break-all">{restoreFilename}</p>
            )}
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRestoreId(null)} className="flex-1">{t("common.cancel")}</Button>
            <Button
              variant="destructive"
              onClick={handleRestore}
              disabled={restoreIsPending}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {restoreIsPending ? t("common.loading") : t("backups.restore")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Selective import confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500" />
              Confirm Selective Import
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-500">
            <p>Importing <strong className="text-slate-800">{selectedTables.size} table(s)</strong> from:</p>
            <p className="font-mono text-xs bg-slate-50 rounded px-2 py-1.5 text-slate-700">{originalName}</p>
            <div className="flex flex-wrap gap-1">
              {Array.from(selectedTables).map((name) => {
                const tbl = analyzedTables.find((t) => t.name === name);
                return (
                  <span key={name} className="text-xs bg-[#0b2c60]/10 text-[#0b2c60] rounded-full px-2 py-0.5">
                    {tbl?.label ?? name}
                  </span>
                );
              })}
            </div>
            <p className="text-orange-600 text-xs font-medium">
              ⚠️ Existing rows in these tables will be deleted and replaced. Ensure you have a current backup first.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSelectiveImport} className="flex-1 bg-[#f97316] hover:bg-[#ea580c] text-white">
              <Upload size={12} className="mr-1.5" /> Import Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
