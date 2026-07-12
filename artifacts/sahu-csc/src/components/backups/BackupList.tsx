import { Database, Download, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackupHistorySkeleton } from "@/components/skeletons";
import { NavyCard, CardHead } from "@/components/backups/BackupCards";
import { formatSize, relativeTime, parseBackupMeta } from "@/hooks/useBackups";

interface BackupListProps {
  backups: any[] | undefined;
  isLoading: boolean;
  totalSize: number;
  onRestoreClick: (id: number, filename: string) => void;
  onDeleteClick: (id: number, filename: string) => void;
  t: (key: string) => string;
}

export function BackupList({ backups, isLoading, totalSize, onRestoreClick, onDeleteClick, t }: BackupListProps) {
  return (
    <NavyCard>
      <CardHead
        icon={<Database size={16} />}
        title="Backup History"
        description={
          backups?.length
            ? `${backups.length} snapshot${backups.length !== 1 ? "s" : ""} · ${formatSize(totalSize)} total used`
            : "Available snapshots ready for restoration"
        }
      />
      <div className="p-1">
        {isLoading ? (
          <BackupHistorySkeleton />
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
                            onClick={() => onRestoreClick(backup.id, backup.filename)}
                            data-testid={`button-restore-${backup.id}`}
                          >
                            <RotateCcw size={12} className="mr-1" />
                            {t("backups.restore")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2.5 text-slate-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                            onClick={() => onDeleteClick(backup.id, backup.filename)}
                            data-testid={`button-delete-${backup.id}`}
                            title="Delete backup"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </NavyCard>
  );
}
