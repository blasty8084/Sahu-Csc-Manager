import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { DAYS, DEFAULT_SCHEDULE, type ScheduleConfig } from "./backupTypes";

export function useBackupSchedule() {
  const { toast } = useToast();

  const [schedule,        setSchedule]        = useState<ScheduleConfig>(DEFAULT_SCHEDULE);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleSaving,  setScheduleSaving]  = useState(false);

  useEffect(() => {
    fetch("/api/backups/schedule", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSchedule((s) => ({ ...s, ...d })))
      .catch(() => {})
      .finally(() => setScheduleLoading(false));
  }, []);

  const handleScheduleSave = async () => {
    setScheduleSaving(true);
    try {
      const res = await fetch("/api/backups/schedule", {
        method:  "POST",
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

  const nextRunLabel = (() => {
    if (!schedule.enabled) return null;
    const dayName = DAYS.find((d) => d.value === schedule.days[0])?.label;
    if (schedule.frequency === "daily")  return `Daily at ${schedule.time}`;
    if (schedule.frequency === "weekly") return `${dayName} at ${schedule.time}`;
    return `${schedule.days.map((d) => DAYS.find((x) => x.value === d)?.label).join(", ")} at ${schedule.time}`;
  })();

  return {
    schedule,        setSchedule,
    scheduleLoading, setScheduleLoading,
    scheduleSaving,
    handleScheduleSave,
    toggleDay,
    nextRunLabel,
  };
}
