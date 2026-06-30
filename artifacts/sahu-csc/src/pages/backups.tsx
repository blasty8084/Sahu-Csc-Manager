import { useTranslation } from "react-i18next";
import { useListBackups, useCreateBackup, useRestoreBackup, getListBackupsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Database, RotateCcw, Plus, HardDrive, Upload, FileUp, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState, useRef } from "react";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Backups() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [restoreId, setRestoreId] = useState<number | null>(null);
  const [restoreFilename, setRestoreFilename] = useState("");

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importConfirm, setImportConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: backups, isLoading } = useListBackups();
  const createMut = useCreateBackup();
  const restoreMut = useRestoreBackup();

  const invalidate = () => qc.invalidateQueries({ queryKey: getListBackupsQueryKey() });

  const handleCreate = async () => {
    try {
      await createMut.mutateAsync();
      toast.success(t("backups.toast_created"));
      invalidate();
    } catch {
      toast({ title: t("backups.title"), variant: "destructive" });
    }
  };

  const handleRestore = async () => {
    if (!restoreId) return;
    try {
      await restoreMut.mutateAsync({ id: restoreId });
      toast.success("Database restored successfully");
      setRestoreId(null);
      invalidate();
    } catch {
      toast({ title: "Restore failed", variant: "destructive" });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".sql")) {
      toast({ title: "Invalid file", description: "Only .sql files are allowed", variant: "destructive" });
      return;
    }
    setImportFile(file);
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportConfirm(false);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const res = await fetch("/api/backups/import", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Import failed" }));
        throw new Error(err.error ?? "Import failed");
      }
      toast.success(`✅ "${importFile.name}" imported successfully! Data has been restored.`);
      setImportFile(null);
      if (fileRef.current) fileRef.current.value = "";
      invalidate();
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{t("backups.title")}</h2>
            <p className="text-sm text-muted-foreground">{backups?.length ?? 0} {t("backups.available")}</p>
          </div>
          <Button size="sm" onClick={handleCreate} disabled={createMut.isPending} data-testid="button-create-backup">
            <Plus size={14} className="mr-1.5" />
            {createMut.isPending ? t("backups.creating") : t("backups.create")}
          </Button>
        </div>

        {/* Info */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex gap-3">
            <HardDrive size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{t("backups.info_title")}</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {t("backups.info_desc")}
              </p>
            </div>
          </div>
        </div>

        {/* ── Import Past SQL Backup ── */}
        <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl p-5 bg-blue-50/40 dark:bg-blue-900/10 space-y-4">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-200">Import Past SQL Backup</h3>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Purani database ka <strong>.sql</strong> backup file yahan upload karo — past transactions, Ledger, AePS, aur Udhari sab restore ho jayenge.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2.5 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-muted hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                <FileUp size={15} className="text-blue-500" />
                <span className="text-sm text-muted-foreground truncate">
                  {importFile ? importFile.name : "Choose .sql file…"}
                </span>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".sql"
                className="sr-only"
                onChange={handleFileSelect}
              />
            </label>
            <Button
              size="sm"
              disabled={!importFile || importing}
              onClick={() => setImportConfirm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            >
              <Upload size={13} className="mr-1.5" />
              {importing ? "Importing…" : "Import"}
            </Button>
          </div>

          {importFile && (
            <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-lg px-3 py-2">
              <CheckCircle2 size={13} />
              <span>Ready: <strong>{importFile.name}</strong> ({formatSize(importFile.size)})</span>
            </div>
          )}
        </div>

        {/* Backup List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        ) : backups?.length === 0 ? (
          <div className="text-center py-16">
            <Database size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">{t("backups.no_backups")}</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden bg-card">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="border-b bg-muted/30">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t("common.name")}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t("common.total")}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t("common.date")}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {backups?.map((backup: any) => (
                  <tr key={backup.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-backup-${backup.id}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Database size={14} className="text-muted-foreground" />
                        <span className="font-mono text-xs">{backup.filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatSize(backup.size)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(backup.createdAt).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => { setRestoreId(backup.id); setRestoreFilename(backup.filename); }}
                        data-testid={`button-restore-${backup.id}`}
                      >
                        <RotateCcw size={12} className="mr-1" />{t("backups.restore")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* Restore from list dialog */}
      <Dialog open={restoreId !== null} onOpenChange={() => setRestoreId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t("backups.restore_title")}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("backups.restore_desc")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreId(null)}>{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={handleRestore} disabled={restoreMut.isPending}>
              {restoreMut.isPending ? t("common.loading") : t("backups.restore")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import confirmation dialog */}
      <Dialog open={importConfirm} onOpenChange={setImportConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" />
              Import SQL Backup — Confirm
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>File: <strong className="text-foreground font-mono">{importFile?.name}</strong></p>
            <p>Ye SQL file current database pe run hogi. Agar file mein <code>DROP TABLE</code> ya <code>TRUNCATE</code> commands hain, to existing data overwrite ho sakta hai.</p>
            <p className="text-orange-600 dark:text-orange-400 font-medium">Pehle current backup zaroor le lo!</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportConfirm(false)}>{t("common.cancel")}</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleImport} disabled={importing}>
              <Upload size={13} className="mr-1.5" />
              {importing ? "Importing…" : "Import Karo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
