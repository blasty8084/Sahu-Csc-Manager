import { Loader2, HardDriveDownload, FileUp, UploadCloud, Upload, CheckCircle2, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavyCard, CardHead } from "@/components/backups/BackupCards";
import { formatSize } from "@/hooks/useBackups";
import type { ImportStep, TableInfo } from "@/hooks/useBackups";

interface BackupImportCardProps {
  importStep: ImportStep;
  importFile: File | null;
  analyzedTables: TableInfo[];
  selectedTables: Set<string>;
  fileRef: React.RefObject<HTMLInputElement | null>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAnalyze: () => void;
  toggleTable: (name: string) => void;
  resetImport: () => void;
  setConfirmOpen: (open: boolean) => void;
}

/** Import Past Data card — file picker, SQL analysis, table selection, and import trigger. */
export function BackupImportCard({
  importStep, importFile, analyzedTables, selectedTables,
  fileRef, handleFileSelect, handleAnalyze, toggleTable, resetImport, setConfirmOpen,
}: BackupImportCardProps) {
  return (
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
  );
}
