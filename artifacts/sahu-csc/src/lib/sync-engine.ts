import {
  getAllPendingEntries,
  removePendingEntry,
  updatePendingEntryRetry,
  getPendingCount,
  clearExpiredCache,
  getAllPendingActions,
  removePendingAction,
  updatePendingActionRetry,
  type PendingAction,
} from "./offline-db";

export type SyncStatus = "idle" | "syncing" | "partial" | "error";

export interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  /** Pending AePS + Udhari actions queued in IndexedDB awaiting sync. */
  pendingActionsCount: number;
  /** Requests parked in the service worker's Background Sync queue (retried automatically by the browser). */
  bgSyncCount: number;
  lastSync: Date | null;
}

type SyncListener = (state: SyncState) => void;

const MAX_RETRIES = 3;

class SyncEngine {
  private state: SyncState = { status: "idle", pendingCount: 0, pendingActionsCount: 0, bgSyncCount: 0, lastSync: null };
  private listeners = new Set<SyncListener>();
  private syncInProgress = false;
  private bgQueueSizes: Record<string, number> = { "ledger-bg-sync": 0, "app-bg-sync": 0 };

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        setTimeout(() => this.sync(), 500);
      });
      this.refreshCount();
      clearExpiredCache().catch(() => {});

      navigator.serviceWorker?.addEventListener("message", (event: MessageEvent) => {
        if (event.data?.type === "BG_SYNC_QUEUE_UPDATED" && (event.data.queue === "ledger-bg-sync" || event.data.queue === "app-bg-sync")) {
          this.bgQueueSizes[event.data.queue] = event.data.size ?? 0;
          const total = Object.values(this.bgQueueSizes).reduce((a, b) => a + b, 0);
          this.state = { ...this.state, bgSyncCount: total };
          this.notify();
        }
      });

      navigator.serviceWorker?.ready
        .then((reg) => reg.active?.postMessage({ type: "GET_BG_SYNC_COUNT" }))
        .catch(() => {});
    }
  }

  private notify() {
    const snap = { ...this.state };
    this.listeners.forEach((l) => l(snap));
  }

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => this.listeners.delete(listener);
  }

  private async refreshCount() {
    try {
      const [count, actionsCount] = await Promise.all([
        getPendingCount(),
        getAllPendingActions().then((a) => a.length),
      ]);
      this.state = { ...this.state, pendingCount: count, pendingActionsCount: actionsCount };
      this.notify();
    } catch {}
  }

  private async syncActions(): Promise<{ synced: number; failed: number }> {
    const actions = await getAllPendingActions();
    if (actions.length === 0) return { synced: 0, failed: 0 };

    const base = (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") ?? "";
    let synced = 0;
    let failed = 0;

    for (const action of actions) {
      if (action.retryCount >= MAX_RETRIES) {
        failed++;
        continue;
      }
      try {
        const res = await fetch(`${base}${action.endpoint}`, {
          method: action.method,
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(action.body),
        });
        if (res.ok) {
          await removePendingAction(action.id);
          synced++;
        } else {
          await updatePendingActionRetry(action.id, action.retryCount + 1);
          failed++;
        }
      } catch {
        await updatePendingActionRetry(action.id, action.retryCount + 1);
        failed++;
      }
    }

    return { synced, failed };
  }

  async sync(): Promise<void> {
    if (!navigator.onLine || this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const entries = await getAllPendingEntries();
      const pendingActionsBefore = await getAllPendingActions();

      if (entries.length === 0 && pendingActionsBefore.length === 0) {
        this.state = { ...this.state, status: "idle", pendingCount: 0, pendingActionsCount: 0, lastSync: new Date() };
        this.notify();
        return;
      }

      this.state = { ...this.state, status: "syncing", pendingCount: entries.length, pendingActionsCount: pendingActionsBefore.length };
      this.notify();

      const { synced: actionsSynced, failed: actionsFailed } = await this.syncActions();

      const base = (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") ?? "";
      let synced = 0;
      let failed = 0;

      for (const entry of entries) {
        if (entry.retryCount >= MAX_RETRIES) {
          failed++;
          continue;
        }
        try {
          const res = await fetch(`${base}/api/ledger`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              date: entry.date,
              customerName: entry.customerName,
              serviceType: entry.serviceType,
              credit: entry.credit,
              debit: entry.debit,
              description: entry.description,
            }),
          });
          if (res.ok) {
            await removePendingEntry(entry.id);
            synced++;
          } else {
            await updatePendingEntryRetry(entry.id, entry.retryCount + 1);
            failed++;
          }
        } catch {
          await updatePendingEntryRetry(entry.id, entry.retryCount + 1);
          failed++;
        }
      }

      const remaining = await getPendingCount();
      const remainingActions = await getAllPendingActions();
      const totalFailed = failed + actionsFailed;
      const status: SyncStatus = remaining === 0 && remainingActions.length === 0 ? "idle" : totalFailed > 0 ? "partial" : "syncing";

      this.state = { ...this.state, status, pendingCount: remaining, pendingActionsCount: remainingActions.length, lastSync: new Date() };
      this.notify();

      const totalSynced = synced + actionsSynced;
      if (totalSynced > 0) {
        window.dispatchEvent(new CustomEvent("sahu-sync-complete", { detail: { synced: totalSynced } }));
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  getState(): SyncState {
    return { ...this.state };
  }

  async markPendingAdded() {
    await this.refreshCount();
  }
}

export const syncEngine = new SyncEngine();
