import { useState, useMemo } from "react";
import { useListBackups, useCreateBackup, getListBackupsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { parseBackupMeta } from "./backupTypes";

export function useBackupList() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [deleteId,       setDeleteId]       = useState<number | null>(null);
  const [deleteFilename, setDeleteFilename] = useState("");
  const [deleteLoading,  setDeleteLoading]  = useState(false);

  const { data: backups, isLoading } = useListBackups();
  const createMut = useCreateBackup();

  const invalidate = () => qc.invalidateQueries({ queryKey: getListBackupsQueryKey() });

  const handleCreate = async (toastCreated: string, toastTitle: string) => {
    try {
      await createMut.mutateAsync();
      toast.success(toastCreated);
      invalidate();
    } catch {
      toast({ title: toastTitle, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/backups/${deleteId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Delete failed");
      toast.success(`Backup "${deleteFilename}" deleted.`);
      setDeleteId(null);
      invalidate();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const onDeleteClick = (id: number, filename: string) => {
    setDeleteId(id);
    setDeleteFilename(filename);
  };

  const totalSize = useMemo(
    () => (backups ?? []).reduce((s: number, b: any) => s + (b.size ?? 0), 0),
    [backups],
  );

  const chartData = useMemo(() => {
    const sorted = [...(backups ?? [])].sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    let cumulative = 0;
    return sorted.map((b: any) => {
      cumulative += b.size ?? 0;
      const meta = parseBackupMeta(b.filename);
      return {
        date:     new Date(b.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        sizeKB:   parseFloat((b.size / 1024).toFixed(1)),
        totalKB:  parseFloat((cumulative / 1024).toFixed(1)),
        type:     meta.type,
        filename: b.filename,
      };
    });
  }, [backups]);

  return {
    backups,
    isLoading,
    createIsPending: createMut.isPending,
    deleteId,        setDeleteId,
    deleteFilename,
    deleteLoading,
    handleCreate,
    handleDelete,
    onDeleteClick,
    totalSize,
    chartData,
  };
}
