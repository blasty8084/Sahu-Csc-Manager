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
  Clock, CalendarDays, Save, Download,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface TableInfo { name: string; label: string; rowCount: number; }
type ImportStep = "idle" | "analyzing" | "select" | "importing" | "done";

const DAYS = [
  { value: 0, label: "Sun" }, { value: 1, label: "Mon" }, { value: 2, label: "Tue" },
  { value: 3, label: "Wed" }, { value: 4, label: "Thu" }, { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

interface ScheduleConfig {
  enabled: boolean;
  frequency: "daily" | "weekly" | "custom";
  time: string;
  days: number[];
  retention: number;
}

const DEFAULT_SCHEDULE: ScheduleConfig = {
  enabled: false, frequency: "daily", time: "02:00", days: [1], retention: 7,
};

export default function Backups() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [restoreId, setRestoreId] = useState<number | null>(null);
  const [restoreFilename, setRestoreFilename] = useState("");

  // Import state
  const [importStep, setImportStep] = useState<ImportStep>("idle");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [analyzedTables, setAnalyzedTables] = useState<TableInfo[]>([]);
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [tmpPath, setTmpPath] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Schedule state
  const [schedule, setSchedule] = useState<ScheduleConfig>(DEFAULT_SCHEDULE);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  const { data: backups, isLoading } = useListBackups();
  const createMut = useCreateBackup();
  const restoreMut = useRestoreBackup();
  const invalidate = () => qc.invalidateQueries({ queryKey: getListBackupsQueryKey() });

  // Load schedule on mount
  useEffect(() => {
    fetch("/api/backups/schedule", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSchedule({ ...DEFAULT_SCHEDULE, ...d }))
      .catch(() => {})
      .finally(() => setScheduleLoading(false));
  }, []);

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

  // Schedule save
  const handleScheduleSave = async () => {
    setScheduleSaving(true);
    try {
      const res = await fetch("/api/backups/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(schedule),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      toast.success("Auto-backup schedule saved successfully.");
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setScheduleSaving(false);
    }
  };

  const toggleDay = (d: number) => {
    setSchedule((s) => {
      const next = s.days.includes(d) ? s.days.filter((x) => x !== d) : [...s.days, d].sort();
      return { ...s, days: next.length ? next : [d] };
    });
  };

  // Import handlers
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
        method: "POST",
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
    setImportStep("idle"); setImportFile(null);
    setAnalyzedTables([]); setSelectedTables(new Set());
    setTmpPath(""); setOriginalName("");
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

        {/* ── Auto-Backup Schedule ── */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="flex items-center gap-2 px-5 py-4 border-b bg-muted/30">
            <Clock size={16} className="text-primary" />
            <h3 className="font-semibold">Automatic Backup Schedule</h3>
          </div>

          {scheduleLoading ? (
            <div className="p-5 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ) : (
            <div className="p-5 space-y-5">

              {/* Enable toggle */}
              <label className="flex items-center justify-between cursor-pointer select-none">
                <div>
                  <p className="text-sm font-medium">Enable Automatic Backups</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {schedule.enabled ? "Backups will run automatically on your schedule." : "Automatic backups are currently off."}
                  </p>
                </div>
                <div
                  onClick={() => setSchedule((s) => ({ ...s, enabled: !s.enabled }))}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${schedule.enabled ? "bg-primary" : "bg-muted-foreground/30"}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${schedule.enabled ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </label>

              {schedule.enabled && (
                <>
                  {/* Frequency */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Frequency</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(["daily", "weekly", "custom"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => {
                            setSchedule((s) => ({
                              ...s,
                              frequency: f,
                              days: f === "weekly" ? [1] : f === "custom" ? [1, 3, 5] : s.days,
                            }));
                          }}
                          className={`py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                            schedule.frequency === f
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:bg-muted/40"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time picker */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Time (24-hour)</p>
                    <input
                      type="time"
                      value={schedule.time}
                      onChange={(e) => setSchedule((s) => ({ ...s, time: e.target.value }))}
                      className="px-3 py-2 border rounded-lg text-sm bg-background w-36 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  {/* Day picker — weekly = single, custom = multi */}
                  {(schedule.frequency === "weekly" || schedule.frequency === "custom") && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        {schedule.frequency === "weekly" ? "Day of Week" : "Days of Week"}
                        {schedule.frequency === "custom" && (
                          <span className="ml-1 text-xs text-muted-foreground">(select multiple)</span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {DAYS.map((d) => {
                          const active = schedule.days.includes(d.value);
                          return (
                            <button
                              key={d.value}
                              onClick={() => {
                                if (schedule.frequency === "weekly") {
                                  setSchedule((s) => ({ ...s, days: [d.value] }));
                                } else {
                                  toggleDay(d.value);
                                }
                              }}
                              className={`w-11 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                                active
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border hover:bg-muted/40"
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Retention */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Retention — Keep Last N Backups</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={schedule.retention}
                        onChange={(e) => setSchedule((s) => ({ ...s, retention: Math.max(1, parseInt(e.target.value) || 1) }))}
                        className="px-3 py-2 border rounded-lg text-sm bg-background w-24 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <p className="text-xs text-muted-foreground">
                        Older backups will be automatically deleted to save space.
                        {schedule.retention >= 30 && " (30+ backups may use significant disk space)"}
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-muted/40 rounded-lg px-4 py-3 text-sm flex items-start gap-2">
                    <CalendarDays size={15} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-muted-foreground">
                      <span className="text-foreground font-medium">Schedule: </span>
                      {schedule.frequency === "daily" && `Every day at ${schedule.time}`}
                      {schedule.frequency === "weekly" && `Every ${DAYS.find((d) => d.value === schedule.days[0])?.label ?? "Mon"} at ${schedule.time}`}
                      {schedule.frequency === "custom" && `Every ${schedule.days.map((d) => DAYS.find((x) => x.value === d)?.label).join(", ")} at ${schedule.time}`}
                      {` · Keep last ${schedule.retention} backup${schedule.retention !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </>
              )}

              <Button size="sm" onClick={handleScheduleSave} disabled={scheduleSaving}>
                {scheduleSaving
                  ? <><Loader2 size={13} className="mr-1.5 animate-spin" /> Saving…</>
                  : <><Save size={13} className="mr-1.5" /> Save Schedule</>
                }
              </Button>
            </div>
          )}
        </div>

        {/* ── Import Past Data (Selective) ── */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="flex items-center gap-2 px-5 py-4 border-b bg-muted/30">
            <Upload size={16} className="text-primary" />
            <h3 className="font-semibold">Import Past Transaction Data</h3>
          </div>

          <div className="p-5 space-y-4">
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
                <p className="text-xs text-muted-foreground">{importFile.name} · {formatSize(importFile.size)}</p>
              )}
            </div>

            {importStep === "select" && analyzedTables.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Step 2 — Select which tables to import
                    <span className="ml-2 text-xs text-muted-foreground">({selectedTables.size} of {analyzedTables.length} selected)</span>
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedTables(new Set(analyzedTables.map((t) => t.name)))} className="text-xs text-primary hover:underline">Select all</button>
                    <span className="text-muted-foreground text-xs">·</span>
                    <button onClick={() => setSelectedTables(new Set())} className="text-xs text-muted-foreground hover:underline">Clear</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {analyzedTables.map((tbl) => {
                    const checked = selectedTables.has(tbl.name);
                    return (
                      <label key={tbl.name} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${checked ? "border-primary/50 bg-primary/5 dark:bg-primary/10" : "border-border hover:bg-muted/30"}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleTable(tbl.name)} className="accent-primary" />
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
                  <Button variant="outline" size="sm" onClick={resetImport}>Cancel</Button>
                  <Button size="sm" disabled={selectedTables.size === 0} onClick={() => setConfirmOpen(true)}>
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
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
                  <CheckCircle2 size={16} />
                  <span>Import complete! Your past data has been restored successfully.</span>
                </div>
                <button onClick={resetImport} className="text-xs text-muted-foreground hover:underline">Import another file</button>
              </div>
            )}
          </div>
        </div>

        {/* Backup list */}
        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
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
                        <div className="flex items-center gap-2">
                          <a
                            href={`/api/backups/${backup.id}/download`}
                            download={backup.filename}
                            className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-border text-xs font-medium hover:bg-muted/40 transition-colors"
                            title="Download .sql file"
                          >
                            <Download size={12} />
                          </a>
                          <Button variant="outline" size="sm" className="h-7 text-xs"
                            onClick={() => { setRestoreId(backup.id); setRestoreFilename(backup.filename); }}
                            data-testid={`button-restore-${backup.id}`}>
                            <RotateCcw size={12} className="mr-1" />{t("backups.restore")}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Restore dialog */}
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

      {/* Import confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={17} className="text-orange-500" />
              Confirm Selective Import
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>You are about to import <strong className="text-foreground">{selectedTables.size} table(s)</strong> from:</p>
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
              ⚠️ Existing rows in these tables will be deleted and replaced. Make sure you have a current backup before proceeding.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleSelectiveImport}>
              <Upload size={13} className="mr-1.5" /> Import Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
