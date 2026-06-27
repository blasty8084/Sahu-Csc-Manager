import { useTranslation } from "react-i18next";
import { useListBackups, useCreateBackup, useRestoreBackup, getListBackupsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Database, Download, RotateCcw, Plus, HardDrive } from "lucide-react";
import { useState } from "react";

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

  const { data: backups, isLoading } = useListBackups();
  const createMut = useCreateBackup();
  const restoreMut = useRestoreBackup();

  const invalidate = () => qc.invalidateQueries({ queryKey: getListBackupsQueryKey() });

  const handleCreate = async () => {
    try {
      await createMut.mutateAsync();
      toast.success("Backup created successfully");
      invalidate();
    } catch {
      toast({ title: "Backup failed", variant: "destructive" });
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

  return (
    <Layout>
      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Backup & Restore</h2>
            <p className="text-sm text-muted-foreground">{backups?.length ?? 0} backups available</p>
          </div>
          <Button size="sm" onClick={handleCreate} disabled={createMut.isPending} data-testid="button-create-backup">
            <Plus size={14} className="mr-1.5" />
            {createMut.isPending ? "Creating..." : "Create Backup"}
          </Button>
        </div>

        {/* Info */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex gap-3">
            <HardDrive size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Backup Information</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Backups contain a snapshot of your database. Restoring will replace current data. Always verify integrity before restoring.
              </p>
            </div>
          </div>
        </div>

        {/* Backup List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        ) : backups?.length === 0 ? (
          <div className="text-center py-16">
            <Database size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No backups yet. Create your first backup.</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden bg-card">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="border-b bg-muted/30">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Filename</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Size</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Created</th>
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
                        <RotateCcw size={12} className="mr-1" />Restore
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

      <Dialog open={restoreId !== null} onOpenChange={() => setRestoreId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Restore Backup?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Restoring from <span className="font-mono text-xs">{restoreFilename}</span> will replace current database data. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRestore} disabled={restoreMut.isPending}>
              {restoreMut.isPending ? "Restoring..." : "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
