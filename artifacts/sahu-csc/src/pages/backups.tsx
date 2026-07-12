import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { BackupScheduleSkeleton } from "@/components/skeletons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  Plus, Loader2, CalendarClock, HardDriveDownload, Save,
  UploadCloud, CheckCircle2, Upload, FileUp,
  Table2, TrendingUp,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { NavyCard, CardHead } from "@/components/backups/BackupCards";
import { BackupList } from "@/components/backups/BackupList";
import { BackupActions } from "@/components/backups/BackupActions";
import { useBackups, formatSize, DAYS } from "@/hooks/useBackups";

export default function Backups() {
  const { t } = useTranslation();

  const {
    backups, isLoading, createIsPending, restoreIsPending,
    restoreId, setRestoreId, restoreFilename,
    deleteId, setDeleteId, deleteFilename, deleteLoading,
    importStep, importFile, analyzedTables, selectedTables, originalName,
    confirmOpen, setConfirmOpen, fileRef,
    schedule, setSchedule, scheduleLoading, scheduleSaving,
    handleCreate, handleRestore, handleDelete,
    handleScheduleSave, toggleDay,
    handleFileSelect, handleAnalyze, toggleTable,
    handleSelectiveImport, resetImport,
    onRestoreClick, onDeleteClick,
    nextRunLabel, totalSize, chartData,
  } = useBackups();

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
            onClick={() => handleCreate(t("backups.toast_created"), t("backups.title"))}
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

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Backup History ── */}
          <div className="lg:col-span-2">
            <BackupList
              backups={backups}
              isLoading={isLoading}
              totalSize={totalSize}
              onRestoreClick={onRestoreClick}
              onDeleteClick={onDeleteClick}
              t={t}
            />
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
                  <BackupScheduleSkeleton />
                ) : (
                  <div className={`space-y-4 transition-opacity ${schedule.enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
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

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time (24h)</p>
                      <input
                        type="time"
                        value={schedule.time}
                        onChange={(e) => setSchedule((s) => ({ ...s, time: e.target.value }))}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:outline-none focus:ring-2 focus:ring-[#0b2c60]/20"
                      />
                    </div>

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
                                  active ? "bg-[#0b2c60] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                              >
                                {d.label.slice(0, 2)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

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

            {/* Import Past Data */}
            <NavyCard>
              <CardHead
                icon={<HardDriveDownload size={16} />}
                title="Import Past Data"
                description="Restore from a local .sql file"
              />
              <div className="p-4 space-y-4">

                {(importStep === "idle" || importStep === "analyzing") && (
                  <div>
                    <label className="cursor-pointer block">
                      <div className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition-colors ${
                        importFile ? "border-[#0b2c60]/30 bg-[#0b2c60]/5" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
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

                {importStep === "select" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-700">
                        Select tables
                        <span className="ml-1.5 text-slate-400">({selectedTables.size}/{analyzedTables.length})</span>
                      </p>
                      <div className="flex gap-2 text-xs">
                        <button onClick={() => analyzedTables.forEach((t) => !selectedTables.has(t.name) && toggleTable(t.name))} className="text-[#0b2c60] hover:underline">All</button>
                        <span className="text-slate-300">·</span>
                        <button onClick={() => analyzedTables.forEach((t) => selectedTables.has(t.name) && toggleTable(t.name))} className="text-slate-500 hover:underline">None</button>
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

                {importStep === "importing" && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-500 py-2">
                    <Loader2 size={15} className="animate-spin text-[#0b2c60] shrink-0" />
                    Importing selected tables… please wait.
                  </div>
                )}

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

        {/* ── Storage Trend Chart ── */}
        {(backups?.length ?? 0) > 0 && (
          <NavyCard>
            <CardHead
              icon={<TrendingUp size={16} />}
              title="Storage Trend"
              description={`Cumulative backup storage · ${formatSize(totalSize)} across ${backups?.length ?? 0} snapshot${(backups?.length ?? 0) !== 1 ? "s" : ""}`}
            />
            <div className="px-4 pb-5 pt-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#0b2c60] inline-block" />
                  <span className="text-xs text-slate-500">Snapshot size (KB)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#f97316] inline-block" />
                  <span className="text-xs text-slate-500">Cumulative storage (KB)</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradSize" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0b2c60" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0b2c60" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v} KB`} width={62} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    formatter={(value: number, name: string) => [`${value} KB`, name === "sizeKB" ? "Snapshot size" : "Cumulative storage"]}
                    labelStyle={{ fontWeight: 600, color: "#0b2c60", marginBottom: 4 }}
                  />
                  <Area type="monotone" dataKey="sizeKB" stroke="#0b2c60" strokeWidth={2} fill="url(#gradSize)" dot={{ r: 3, fill: "#0b2c60", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#0b2c60" }} />
                  <Area type="monotone" dataKey="totalKB" stroke="#f97316" strokeWidth={2} fill="url(#gradTotal)" dot={{ r: 3, fill: "#f97316", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#f97316" }} />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Breakdown:</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  {chartData.filter((d) => d.type === "auto").length} auto
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-[#0b2c60] inline-block" />
                  {chartData.filter((d) => d.type === "manual").length} manual
                </span>
                <span className="text-[11px] text-slate-400">·</span>
                <span className="text-[11px] text-slate-600">Avg size: {formatSize(totalSize / (backups?.length || 1))}</span>
                <span className="text-[11px] text-slate-600">· Latest: {chartData.length ? `${chartData[chartData.length - 1].sizeKB} KB` : "—"}</span>
              </div>
            </div>
          </NavyCard>
        )}

      </div>

      <BackupActions
        restoreId={restoreId}
        setRestoreId={setRestoreId}
        restoreFilename={restoreFilename}
        restoreIsPending={restoreIsPending}
        handleRestore={handleRestore}
        deleteId={deleteId}
        setDeleteId={setDeleteId}
        deleteFilename={deleteFilename}
        deleteLoading={deleteLoading}
        handleDelete={handleDelete}
        confirmOpen={confirmOpen}
        setConfirmOpen={setConfirmOpen}
        selectedTables={selectedTables}
        analyzedTables={analyzedTables}
        originalName={originalName}
        handleSelectiveImport={handleSelectiveImport}
        t={t}
      />
    </Layout>
  );
}
