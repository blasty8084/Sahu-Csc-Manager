import { useState, useRef } from "react";
import { useRestoreBackup, getListBackupsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { type TableInfo, type ImportStep } from "./backupTypes";

export function useBackupRestore() {
  const { toast } = useToast();
  const qc = useQueryClient();

  // Restore dialog state
  const [restoreId,       setRestoreId]       = useState<number | null>(null);
  const [restoreFilename, setRestoreFilename] = useState("");

  // Import / selective-restore state
  const [importStep,       setImportStep]       = useState<ImportStep>("idle");
  const [importFile,       setImportFile]       = useState<File | null>(null);
  const [analyzedTables,   setAnalyzedTables]   = useState<TableInfo[]>([]);
  const [selectedTables,   setSelectedTables]   = useState<Set<string>>(new Set());
  const [tmpPath,          setTmpPath]           = useState("");
  const [originalName,     setOriginalName]      = useState("");
  const [confirmOpen,      setConfirmOpen]       = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const restoreMut = useRestoreBackup();
  const invalidate  = () => qc.invalidateQueries({ queryKey: getListBackupsQueryKey() });

  // ── Restore from existing backup record ────────────────────────────────────

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

  const onRestoreClick = (id: number, filename: string) => {
    setRestoreId(id);
    setRestoreFilename(filename);
  };

  // ── Import / selective-restore from uploaded SQL file ─────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".sql")) {
      toast({ title: "Invalid file", description: "Only .sql files are allowed.", variant: "destructive" });
      return;
    }
    setImportFile(file);
    setImportStep("idle");
    setAnalyzedTables([]);
    setSelectedTables(new Set());
  };

  const handleAnalyze = async () => {
    if (!importFile) return;
    setImportStep("analyzing");
    try {
      const form = new FormData();
      form.append("file", importFile);
      const res = await fetch("/api/backups/analyze", { method: "POST", body: form, credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Analysis failed");
      const data = await res.json();
      setAnalyzedTables(data.tables);
      setTmpPath(data.tmpPath);
      setOriginalName(data.originalName);
      setSelectedTables(new Set(data.tables.map((t: TableInfo) => t.name)));
      setImportStep("select");
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
      setImportStep("idle");
    }
  };

  const toggleTable = (name: string) => {
    setSelectedTables((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleSelectiveImport = async () => {
    setConfirmOpen(false);
    setImportStep("importing");
    try {
      const res = await fetch("/api/backups/selective-import", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tmpPath, selectedTables: Array.from(selectedTables), originalName }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Import failed");
      const data = await res.json();
      setImportStep("done");
      toast.success(`Imported ${data.tablesImported.length} table(s) from "${originalName}".`);
      invalidate();
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
      setImportStep("select");
    }
  };

  const resetImport = () => {
    setImportStep("idle");
    setImportFile(null);
    setAnalyzedTables([]);
    setSelectedTables(new Set());
    setTmpPath("");
    setOriginalName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return {
    restoreId,       setRestoreId,
    restoreFilename,
    restoreIsPending: restoreMut.isPending,
    handleRestore,
    onRestoreClick,
    importStep,
    importFile,
    analyzedTables,
    selectedTables,
    originalName,
    confirmOpen,     setConfirmOpen,
    fileRef,
    handleFileSelect,
    handleAnalyze,
    toggleTable,
    handleSelectiveImport,
    resetImport,
  };
}
