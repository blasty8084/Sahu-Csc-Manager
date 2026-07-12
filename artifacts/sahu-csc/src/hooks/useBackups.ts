import { useState, useRef, useMemo, useEffect } from "react";
import { useListBackups, useCreateBackup, useRestoreBackup, getListBackupsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TableInfo { name: string; label: string; rowCount: number; }
export type ImportStep = "idle" | "analyzing" | "select" | "importing" | "done";
export interface ScheduleConfig {
  enabled: boolean;
  frequency: "daily" | "weekly" | "custom";
  time: string;
  days: number[];
  retention: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const DAYS = [
  { value: 0, label: "Sun" }, { value: 1, label: "Mon" }, { value: 2, label: "Tue" },
  { value: 3, label: "Wed" }, { value: 4, label: "Thu" }, { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export const DEFAULT_SCHEDULE: ScheduleConfig = {
  enabled: false, frequency: "daily", time: "02:00", days: [1], retention: 7,
};

// ─── Formatters ───────────────────────────────────────────────────────────────
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function relativeTime(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  <  1) return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  <  7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function parseBackupMeta(filename: string): { label: string; type: "auto" | "manual" } {
  const isAuto = filename.startsWith("auto_backup_");
  const raw = filename.replace(/^(auto_backup_|backup_)/, "").replace(/\.sql$/, "");
  const iso = raw.replace(/T(\d{2})-(\d{2})-(\d{2})-\d+Z$/, "T$1:$2:$3Z");
  const d = new Date(iso);
  const label = isNaN(d.getTime())
    ? filename
    : d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
  return { label, type: isAuto ? "auto" : "manual" };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useBackups() {
  const { toast } = useToast();
  const qc = useQueryClient();

  // Restore dialog state
  const [restoreId, setRestoreId] = useState<number | null>(null);
  const [restoreFilename, setRestoreFilename] = useState("");

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteFilename, setDeleteFilename] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  // Data hooks
  const { data: backups, isLoading } = useListBackups();
  const createMut = useCreateBackup();
  const restoreMut = useRestoreBackup();

  const invalidate = () => qc.invalidateQueries({ queryKey: getListBackupsQueryKey() });

  useEffect(() => {
    fetch("/api/backups/schedule", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSchedule((s) => ({ ...s, ...d })))
      .catch(() => {})
      .finally(() => setScheduleLoading(false));
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreate = async (toastCreated: string, toastTitle: string) => {
    try {
      await createMut.mutateAsync();
      toast.success(toastCreated);
      invalidate();
    } catch {
      toast({ title: toastTitle, variant: "destructive" });
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
      toast.success("Auto-backup schedule saved.");
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
    setImportStep("idle");
    setImportFile(null);
    setAnalyzedTables([]);
    setSelectedTables(new Set());
    setTmpPath("");
    setOriginalName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  // Row-action helpers (set dialog state)
  const onRestoreClick = (id: number, filename: string) => {
    setRestoreId(id);
    setRestoreFilename(filename);
  };
  const onDeleteClick = (id: number, filename: string) => {
    setDeleteId(id);
    setDeleteFilename(filename);
  };

  // ── Derived values ────────────────────────────────────────────────────────

  const nextRunLabel = (() => {
    if (!schedule.enabled) return null;
    const dayName = DAYS.find((d) => d.value === schedule.days[0])?.label;
    if (schedule.frequency === "daily") return `Daily at ${schedule.time}`;
    if (schedule.frequency === "weekly") return `${dayName} at ${schedule.time}`;
    return `${schedule.days.map((d) => DAYS.find((x) => x.value === d)?.label).join(", ")} at ${schedule.time}`;
  })();

  const totalSize = useMemo(
    () => (backups ?? []).reduce((s: number, b: any) => s + (b.size ?? 0), 0),
    [backups]
  );

  const chartData = useMemo(() => {
    const sorted = [...(backups ?? [])].sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    let cumulative = 0;
    return sorted.map((b: any) => {
      cumulative += b.size ?? 0;
      const meta = parseBackupMeta(b.filename);
      return {
        date: new Date(b.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        sizeKB: parseFloat((b.size / 1024).toFixed(1)),
        totalKB: parseFloat((cumulative / 1024).toFixed(1)),
        type: meta.type,
        filename: b.filename,
      };
    });
  }, [backups]);

  return {
    // data
    backups,
    isLoading,
    createIsPending: createMut.isPending,
    restoreIsPending: restoreMut.isPending,
    // restore dialog
    restoreId,
    setRestoreId,
    restoreFilename,
    // delete dialog
    deleteId,
    setDeleteId,
    deleteFilename,
    deleteLoading,
    // import
    importStep,
    importFile,
    analyzedTables,
    selectedTables,
    originalName,
    confirmOpen,
    setConfirmOpen,
    fileRef,
    // schedule
    schedule,
    setSchedule,
    scheduleLoading,
    setScheduleLoading,
    scheduleSaving,
    // handlers
    handleCreate,
    handleRestore,
    handleDelete,
    handleScheduleSave,
    toggleDay,
    handleFileSelect,
    handleAnalyze,
    toggleTable,
    handleSelectiveImport,
    resetImport,
    onRestoreClick,
    onDeleteClick,
    // derived
    nextRunLabel,
    totalSize,
    chartData,
  };
}
