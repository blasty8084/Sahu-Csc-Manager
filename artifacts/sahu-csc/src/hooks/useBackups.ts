// Barrel — re-exports all backup types + sub-hooks for backward compatibility.
export * from "./backupTypes";
export { useBackupList } from "./useBackupList";
export { useBackupSchedule } from "./useBackupSchedule";
export { useBackupRestore } from "./useBackupRestore";

import { useBackupList } from "./useBackupList";
import { useBackupSchedule } from "./useBackupSchedule";
import { useBackupRestore } from "./useBackupRestore";

/** Composite hook — same return shape as the original single-file hook. */
export function useBackups() {
  const list    = useBackupList();
  const sched   = useBackupSchedule();
  const restore = useBackupRestore();
  return { ...list, ...sched, ...restore };
}
