import { useState, useEffect, useCallback } from "react";
import { syncEngine, SyncStatus, SyncState } from "@/lib/sync-engine";
import { useNetworkStatus } from "./use-network-status";

export interface UseSyncResult {
  syncStatus: SyncStatus;
  pendingCount: number;
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
    lastSyncTime: state.lastSync,
    syncNow,
  };
}
