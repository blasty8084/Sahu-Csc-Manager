import { useTranslation } from "react-i18next";
import { useListBackups, useCreateBackup, useRestoreBackup, getListBackupsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Database, RotateCcw, Plus, HardDrive, Upload, FileUp,
  CheckCircle2, AlertTriangle, ChevronRight, Loader2, Table2,
} from "lucide-react";
import { useState, useRef } from "react";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface TableInfo {
  name: string;
  label: string;
  rowCount: number;
}

type ImportStep = "idle" | "analyzing" | "select" | "importing" | "done";

export default function Backups() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [restoreId, setRestoreId] = useState<number | null>(null);
  const [restoreFilename, setRestoreFilename] = useState("");

  const [importStep, setImportStep] = useState<ImportStep>("idle");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [analyzedTables, setAnalyzedTables] = useState<TableInfo[]>([]);
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [tmpPath, setTmpPath] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
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
      const res = await fetch("/api/backups/analyze", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Analysis failed" }));
        throw new Error(err.error ?? "Analysis failed");
      }
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

  const selectAll = () => setSelectedTables(new Set(analyzedTables.map((t) => t.name)));
  const clearAll = () => setSelectedTables(new Set());

  const handleSelectiveImport = async () => {
    setConfirmOpen(false);
    setImportStep("importing");
    try {
      const res = await fetch("/api/backups/selective-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tmpPath,
          selectedTables: Array.from(selectedTables),
          originalName,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Import failed" }));
        throw new Error(err.error ?? "Import failed");
      }
      const data = await res.json();
      setImportStep("done");
      toast.success(`✅ Successfully imported ${data.tablesImported.length} table(s) from "${originalName}".`);
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

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
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

        {/* Info banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex gap-3">
            <HardDrive size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{t("backups.info_title")}</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{t("backups.info_desc")}</p>
            </div>
          </div>
        </div>

        {/* ── Import Past Data — Selective ── */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="flex items-center gap-2 px-5 py-4 border-b bg-muted/30">
            <Upload size={16} className="text-primary" />
            <h3 className="font-semibold">Import Past Transaction Data</h3>
          </div>

          <div className="p-5 space-y-4">
            {/* Step 1 — File selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Step 1 — Choose your old database backup file (.sql)</p>
              <div className="flex gap-3 items-center">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2.5 border rounded-lg bg-background hover:bg-muted/40 transition-colors">
                    <FileUp size={15} className="text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">
                      {importFile ? importFile.name : "Choose .sql file…"}
                    </span>
                  </div>
                  <input ref={fileRef} type="file" accept=".sql" className="sr-only" onChange={handleFileSelect} />
                </label>
                {importFile && importStep === "idle" && (
                  <Button size="sm" onClick={handleAnalyze}>
                    Analyze File <ChevronRight size={13} className="ml-1" />
                  </Button>
                )}
                {importStep === "analyzing" && (
                  <Button size="sm" disabled>
                    <Loader2 size={13} className="mr-1.5 animate-spin" /> Analyzing…
                  </Button>
                )}
              </div>
              {importFile && (
                <p className="text-xs text-muted-foreground">
                  {importFile.name} &middot; {formatSize(importFile.size)}
                </p>
              )}
            </div>

            {/* Step 2 — Table selection */}
            {importStep === "select" && analyzedTables.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Step 2 — Select which tables to import
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({selectedTables.size} of {analyzedTables.length} selected)
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-xs text-primary hover:underline">Select all</button>
                    <span className="text-muted-foreground text-xs">·</span>
                    <button onClick={clearAll} className="text-xs text-muted-foreground hover:underline">Clear</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {analyzedTables.map((tbl) => {
                    const checked = selectedTables.has(tbl.name);
                    return (
                      <label
                        key={tbl.name}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                          checked
                            ? "border-primary/50 bg-primary/5 dark:bg-primary/10"
                            : "border-border hover:bg-muted/30"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTable(tbl.name)}
                          className="accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{tbl.label}</p>
                          <p className="text-xs text-muted-foreground">{tbl.rowCount.toLocaleString()} rows</p>
                        </div>
                        <Table2 size={14} className={checked ? "text-primary" : "text-muted-foreground"} />
                      </label>
                    );
                  })}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetImport}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={selectedTables.size === 0}
                    onClick={() => setConfirmOpen(true)}
                    className="bg-primary text-primary-foreground"
                  >
                    <Upload size={13} className="mr-1.5" />
                    Import {selectedTables.size} Table{selectedTables.size !== 1 ? "s" : ""}
                  </Button>
                </div>
              </div>
            )}

            {importStep === "select" && analyzedTables.length === 0 && (
              <div className="border-t pt-4 text-center text-sm text-muted-foreground py-4">
                No data tables with rows were found in this backup file.
              </div>
            )}

            {importStep === "importing" && (
              <div className="border-t pt-4 flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 size={16} className="animate-spin text-primary" />
                Importing selected tables… please wait.
              </div>
            )}

            {importStep === "done" && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
                  <CheckCircle2 size={16} />
                  <span>Import complete! Your past data has been restored successfully.</span>
                </div>
                <button onClick={resetImport} className="mt-3 text-xs text-muted-foreground hover:underline">
                  Import another file
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Backup list */}
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
          <p className="text-sm text-muted-foreground">{t("backups.restore_desc")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreId(null)}>{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={handleRestore} disabled={restoreMut.isPending}>
              {restoreMut.isPending ? t("common.loading") : t("backups.restore")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Selective import confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={17} className="text-orange-500" />
              Confirm Selective Import
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              You are about to import <strong className="text-foreground">{selectedTables.size} table(s)</strong> from:
            </p>
            <p className="font-mono text-xs bg-muted rounded px-2 py-1">{originalName}</p>
            <div className="flex flex-wrap gap-1">
              {Array.from(selectedTables).map((name) => {
                const tbl = analyzedTables.find((t) => t.name === name);
                return (
                  <span key={name} className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                    {tbl?.label ?? name}
                  </span>
                );
              })}
            </div>
            <p className="text-orange-600 dark:text-orange-400 text-xs font-medium">
              ⚠️ Existing rows in these tables will be deleted and replaced with backup data. Make sure you have a current backup before proceeding.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleSelectiveImport}>
              <Upload size={13} className="mr-1.5" />
              Import Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
