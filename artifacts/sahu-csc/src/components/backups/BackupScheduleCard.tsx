import { Loader2, CalendarClock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackupScheduleSkeleton } from "@/components/skeletons";
import { NavyCard, CardHead } from "@/components/backups/BackupCards";
import { DAYS } from "@/hooks/useBackups";
import type { ScheduleConfig } from "@/hooks/useBackups";

interface BackupScheduleCardProps {
  schedule: ScheduleConfig;
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleConfig>>;
  scheduleLoading: boolean;
  scheduleSaving: boolean;
  handleScheduleSave: () => void;
  toggleDay: (value: number) => void;
  nextRunLabel: string | null;
}

/** Auto-Backup schedule card — enable toggle, frequency, time, day picker, retention, save. */
export function BackupScheduleCard({
  schedule, setSchedule, scheduleLoading, scheduleSaving,
  handleScheduleSave, toggleDay, nextRunLabel,
}: BackupScheduleCardProps) {
  return (
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
  );
}
