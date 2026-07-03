import { useState, useEffect, useCallback } from "react";
import { syncEngine, SyncStatus, SyncState } from "@/lib/sync-engine";
import { useNetworkStatus } from "./use-network-status";

export interface UseSyncResult {
  syncStatus: SyncStatus;
  pendingCount: number;
  /** Pending AePS + Udhari actions queued in IndexedDB awaiting sync. */
  pendingActionsCount: number;
  /** Requests parked in the service worker's Background Sync queue. */
  bgSyncCount: number;
  /** pendingCount + pendingActionsCount + bgSyncCount, for a single combined badge. */
  totalPendingCount: number;
  lastSyncTime: Date | null;
  syncNow: () => Promise<void>;
}

export function useSync(): UseSyncResult {
  const { isOnline } = useNetworkStatus();
  const [state, setState] = useState<SyncState>(() => syncEngine.getState());

  useEffect(() => syncEngine.subscribe(setState), []);

  const syncNow = useCallback(async () => {
    if (isOnline) await syncEngine.sync();
  }, [isOnline]);

  return {
    syncStatus: state.status,
    pendingCount: state.pendingCount,
    pendingActionsCount: state.pendingActionsCount,
    bgSyncCount: state.bgSyncCount,
    totalPendingCount: state.pendingCount + state.pendingActionsCount + state.bgSyncCount,
    lastSyncTime: state.lastSync,
    syncNow,
  };
}
