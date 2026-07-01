import { useTranslation } from "react-i18next";
import { useListBackups, useCreateBackup, useRestoreBackup, getListBackupsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Database, RotateCcw, Plus, Upload, FileUp,
  CheckCircle2, AlertTriangle, Loader2, Table2,
  CalendarClock, HardDriveDownload, Download, Save, Clock,
  UploadCloud, Trash2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function relativeTime(date: string | Date): string {
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

function parseBackupMeta(filename: string): { label: string; type: "auto" | "manual" } {
  const isAuto = filename.startsWith("auto_backup_");
  const raw = filename.replace(/^(auto_backup_|backup_)/, "").replace(/\.sql$/, "");
  // raw looks like: 2026-06-16T07-05-40-015Z → convert dashes back to colons/dots
  const iso = raw.replace(/T(\d{2})-(\d{2})-(\d{2})-\d+Z$/, "T$1:$2:$3Z");
  const d = new Date(iso);
  const label = isNaN(d.getTime())
    ? filename
    : d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
  return { label, type: isAuto ? "auto" : "manual" };
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

function NavyCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden [border-top:3px_solid_#0b2c60] ${className}`}>
      {children}
    </div>
  );
}

function CardHead({ icon, title, description, right }: {
  icon: React.ReactNode; title: string; description?: string; right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
      <div className="flex items-center gap-2.5">
        <span className="text-[#0b2c60]">{icon}</span>
        <div>
          <p className="font-semibold text-[#0b2c60] text-sm leading-tight">{title}</p>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export default function Backups() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [restoreId, setRestoreId] = useState<number | null>(null);
  const [restoreFilename, setRestoreFilename] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteFilename, setDeleteFilename] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [importStep, setImportStep] = useState<ImportStep>("idle");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [analyzedTables, setAnalyzedTables] = useState<TableInfo[]>([]);
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [tmpPath, setTmpPath] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [schedule, setSchedule] = useState<ScheduleConfig>(DEFAULT_SCHEDULE);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  const { data: backups, isLoading } = useListBackups();
  const createMut = useCreateBackup();
  const restoreMut = useRestoreBackup();
  const invalidate = () => qc.invalidateQueries({ queryKey: getListBackupsQueryKey() });

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
    setImportStep("idle"); setImportFile(null);
    setAnalyzedTables([]); setSelectedTables(new Set());
    setTmpPath(""); setOriginalName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const nextRunLabel = (() => {
    if (!schedule.enabled) return null;
    const dayName = DAYS.find((d) => d.value === schedule.days[0])?.label;
    if (schedule.frequency === "daily") return `Daily at ${schedule.time}`;
    if (schedule.frequency === "weekly") return `${dayName} at ${schedule.time}`;
    return `${schedule.days.map((d) => DAYS.find((x) => x.value === d)?.label).join(", ")} at ${schedule.time}`;
  })();

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-[#0b2c60]">{t("backups.title")}</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {backups?.length ?? 0} snapshot{(backups?.length ?? 0) !== 1 ? "s" : ""} available · Manage database backups and restore points
            </p>
          </div>
          <Button
            onClick={handleCreate}
            disabled={createMut.isPending}
            data-testid="button-create-backup"
            className="bg-[#f97316] hover:bg-[#ea580c] text-white shadow-sm shrink-0"
          >
            {createMut.isPending
              ? <><Loader2 size={14} className="mr-1.5 animate-spin" />{t("backups.creating")}</>
              : <><Plus size={14} className="mr-1.5" />{t("backups.create")}</>
            }
          </Button>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Backup History ── */}
          <div className="lg:col-span-2">
            <NavyCard>
              <CardHead
                icon={<Database size={16} />}
                title="Backup History"
                description="Available snapshots ready for restoration"
              />
              <div className="p-1">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                  </div>
                ) : !backups?.length ? (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <Database size={24} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm">{t("backups.no_backups")}</p>
                    <p className="text-slate-400 text-xs mt-1">Create your first backup using the button above</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[480px]">
                      <thead className="border-b border-slate-100 bg-slate-50/70">
                        <tr className="text-left">
                          <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Backup</th>
                          <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Size</th>
                          <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Date</th>
                          <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {backups?.map((backup: any) => {
                          const meta = parseBackupMeta(backup.filename);
                          return (
                          <tr key={backup.id} className="hover:bg-slate-50/80 transition-colors" data-testid={`row-backup-${backup.id}`}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${meta.type === "auto" ? "bg-emerald-50" : "bg-[#0b2c60]/10"}`}>
                                  <Database size={13} className={meta.type === "auto" ? "text-emerald-600" : "text-[#0b2c60]"} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-medium text-slate-800">{meta.label}</span>
                                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${meta.type === "auto" ? "bg-emerald-100 text-emerald-700" : "bg-[#0b2c60]/10 text-[#0b2c60]"}`}>
                                      {meta.type === "auto" ? "Auto" : "Manual"}
                                    </span>
                                  </div>
                                  <p className="font-mono text-[10px] text-slate-400 truncate max-w-[220px] mt-0.5">{backup.filename}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal text-xs">
                                {formatSize(backup.size)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div title={new Date(backup.createdAt).toLocaleString("en-IN")}>
                                <p className="text-xs font-medium text-slate-700">{relativeTime(backup.createdAt)}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{new Date(backup.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1.5">
                                <a
                                  href={`/api/backups/${backup.id}/download`}
                                  download={backup.filename}
                                  title="Download .sql file"
                                  className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-[#0b2c60] hover:text-white hover:border-[#0b2c60] transition-colors"
                                >
                                  <Download size={12} />
                                  <span className="hidden sm:inline">Download</span>
                                </a>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs px-2.5 text-slate-600 hover:bg-[#f97316] hover:text-white hover:border-[#f97316] transition-colors"
                                  onClick={() => { setRestoreId(backup.id); setRestoreFilename(backup.filename); }}
                                  data-testid={`button-restore-${backup.id}`}
                                >
                                  <RotateCcw size={12} className="mr-1" />
                                  {t("backups.restore")}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs px-2.5 text-slate-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                                  onClick={() => { setDeleteId(backup.id); setDeleteFilename(backup.filename); }}
                                  data-testid={`button-delete-${backup.id}`}
                                  title="Delete backup"
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ); })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </NavyCard>
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-6">

            {/* Auto-Backup Schedule */}
            <NavyCard>
              <CardHead
                icon={<CalendarClock size={16} />}
                title="Auto-Backup"
                description="Scheduled database snapshots"
                right={
                  <button
                    onClick={() => setSchedule((s) => ({ ...s, enabled: !s.enabled }))}
                    className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${schedule.enabled ? "bg-[#f97316]" : "bg-slate-300"}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${schedule.enabled ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                }
              />

              <div className="p-4">
                {/* Active status */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${schedule.enabled ? "bg-emerald-500" : "bg-slate-300"}`} />
                  {schedule.enabled ? (
                    <span className="text-xs text-slate-600">
                      <span className="font-medium text-emerald-700">Active</span>
                      {nextRunLabel && <> · {nextRunLabel}</>}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Disabled</span>
                  )}
                </div>

                {scheduleLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-3/4" />
                  </div>
                ) : (
                  <div className={`space-y-4 transition-opacity ${schedule.enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                    {/* Frequency */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Frequency</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["daily", "weekly", "custom"] as const).map((f) => (
                          <button
                            key={f}
                            onClick={() => setSchedule((s) => ({
                              ...s, frequency: f,
                              days: f === "weekly" ? [1] : f === "custom" ? [1, 3, 5] : s.days,
                            }))}
                            className={`py-1.5 rounded-lg border text-xs font-medium capitalize transition-colors ${
                              schedule.frequency === f
                                ? "border-[#0b2c60] bg-[#0b2c60] text-white"
                                : "border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time (24h)</p>
                      <input
                        type="time"
                        value={schedule.time}
                        onChange={(e) => setSchedule((s) => ({ ...s, time: e.target.value }))}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:outline-none focus:ring-2 focus:ring-[#0b2c60]/20"
                      />
                    </div>

                    {/* Day picker */}
                    {(schedule.frequency === "weekly" || schedule.frequency === "custom") && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {schedule.frequency === "weekly" ? "Day" : "Days"}
                        </p>
                        <div className="flex flex-wrap gap-1">
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
                                className={`w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-semibold transition-colors ${
                                  active
                                    ? "bg-[#0b2c60] text-white"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                              >
                                {d.label.slice(0, 2)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Retention */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Keep Last N Backups</p>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={schedule.retention}
                        onChange={(e) => setSchedule((s) => ({ ...s, retention: Math.max(1, parseInt(e.target.value) || 1) }))}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:outline-none focus:ring-2 focus:ring-[#0b2c60]/20"
                      />
                    </div>

                    <Button
                      size="sm"
                      onClick={handleScheduleSave}
                      disabled={scheduleSaving}
                      className="w-full bg-[#0b2c60] hover:bg-[#0a2456] text-white text-xs"
                    >
                      {scheduleSaving
                        ? <><Loader2 size={12} className="mr-1.5 animate-spin" /> Saving…</>
                        : <><Save size={12} className="mr-1.5" /> Save Schedule</>
                      }
                    </Button>
                  </div>
                )}
              </div>
            </NavyCard>

            {/* Import Data */}
            <NavyCard>
              <CardHead
                icon={<HardDriveDownload size={16} />}
                title="Import Past Data"
                description="Restore from a local .sql file"
              />
              <div className="p-4 space-y-4">

                {/* Idle / file select */}
                {(importStep === "idle" || importStep === "analyzing") && (
                  <div>
                    <label className="cursor-pointer block">
                      <div className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition-colors ${
                        importFile
                          ? "border-[#0b2c60]/30 bg-[#0b2c60]/5"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}>
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2.5">
                          <UploadCloud size={18} className="text-[#f97316]" />
                        </div>
                        {importFile ? (
                          <>
                            <p className="text-sm font-medium text-[#0b2c60] truncate max-w-full">{importFile.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{formatSize(importFile.size)}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-slate-700">Click to choose file</p>
                            <p className="text-xs text-slate-400 mt-0.5">or drag & drop · .sql only</p>
                          </>
                        )}
                      </div>
                      <input ref={fileRef} type="file" accept=".sql" className="sr-only" onChange={handleFileSelect} />
                    </label>

                    {importFile && (
                      <Button
                        size="sm"
                        onClick={handleAnalyze}
                        disabled={importStep === "analyzing"}
                        className="w-full mt-3 bg-[#0b2c60] hover:bg-[#0a2456] text-white text-xs"
                      >
                        {importStep === "analyzing"
                          ? <><Loader2 size={12} className="mr-1.5 animate-spin" /> Analyzing…</>
                          : <><FileUp size={12} className="mr-1.5" /> Analyze File</>
                        }
                      </Button>
                    )}
                  </div>
                )}

                {/* Table selection */}
                {importStep === "select" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-700">
                        Select tables
                        <span className="ml-1.5 text-slate-400">({selectedTables.size}/{analyzedTables.length})</span>
                      </p>
                      <div className="flex gap-2 text-xs">
                        <button onClick={() => setSelectedTables(new Set(analyzedTables.map((t) => t.name)))} className="text-[#0b2c60] hover:underline">All</button>
                        <span className="text-slate-300">·</span>
                        <button onClick={() => setSelectedTables(new Set())} className="text-slate-500 hover:underline">None</button>
                      </div>
                    </div>

                    {analyzedTables.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-3">No data tables found in this file.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {analyzedTables.map((tbl) => {
                          const checked = selectedTables.has(tbl.name);
                          return (
                            <label key={tbl.name} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                              checked ? "border-[#0b2c60]/30 bg-[#0b2c60]/5" : "border-slate-100 hover:bg-slate-50"
                            }`}>
                              <input type="checkbox" checked={checked} onChange={() => toggleTable(tbl.name)} className="accent-[#0b2c60] shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-700 truncate">{tbl.label}</p>
                                <p className="text-[10px] text-slate-400">{tbl.rowCount.toLocaleString()} rows</p>
                              </div>
                              <Table2 size={12} className={checked ? "text-[#0b2c60]" : "text-slate-300"} />
                            </label>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" onClick={resetImport} className="flex-1 text-xs h-7">Cancel</Button>
                      <Button
                        size="sm"
                        disabled={selectedTables.size === 0}
                        onClick={() => setConfirmOpen(true)}
                        className="flex-1 text-xs h-7 bg-[#f97316] hover:bg-[#ea580c] text-white"
                      >
                        <Upload size={11} className="mr-1" />
                        Import {selectedTables.size}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Importing */}
                {importStep === "importing" && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-500 py-2">
                    <Loader2 size={15} className="animate-spin text-[#0b2c60] shrink-0" />
                    Importing selected tables… please wait.
                  </div>
                )}

                {/* Done */}
                {importStep === "done" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                      <CheckCircle2 size={14} className="shrink-0" />
                      <span>Import complete! Past data restored successfully.</span>
                    </div>
                    <button onClick={resetImport} className="text-xs text-slate-400 hover:underline">Import another file</button>
                  </div>
                )}

              </div>
            </NavyCard>

          </div>
        </div>
      </div>

      {/* ── Delete confirm dialog ── */}
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
              {deleteLoading ? <><Loader2 size={12} className="mr-1.5 animate-spin" />Deleting…</> : <><Trash2 size={12} className="mr-1.5" />Delete</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Restore confirm dialog ── */}
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
              disabled={restoreMut.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {restoreMut.isPending ? t("common.loading") : t("backups.restore")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Selective import confirm dialog ── */}
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
    </Layout>
  );
}
