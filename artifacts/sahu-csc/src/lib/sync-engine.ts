import {
  getAllPendingEntries,
  removePendingEntry,
  updatePendingEntryRetry,
  getPendingCount,
  clearExpiredCache,
} from "./offline-db";

export type SyncStatus = "idle" | "syncing" | "partial" | "error";

export interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  /** Requests parked in the service worker's Background Sync queue (retried automatically by the browser). */
  bgSyncCount: number;
  lastSync: Date | null;
}

type SyncListener = (state: SyncState) => void;

const MAX_RETRIES = 3;

class SyncEngine {
  private state: SyncState = { status: "idle", pendingCount: 0, bgSyncCount: 0, lastSync: null };
  private listeners = new Set<SyncListener>();
  private syncInProgress = false;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        setTimeout(() => this.sync(), 500);
      });
      this.refreshCount();
      clearExpiredCache().catch(() => {});

      navigator.serviceWorker?.addEventListener("message", (event: MessageEvent) => {
        if (event.data?.type === "BG_SYNC_QUEUE_UPDATED" && event.data.queue === "ledger-bg-sync") {
          this.state = { ...this.state, bgSyncCount: event.data.size ?? 0 };
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
      const count = await getPendingCount();
      this.state = { ...this.state, pendingCount: count };
      this.notify();
    } catch {}
  }

  async sync(): Promise<void> {
    if (!navigator.onLine || this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const entries = await getAllPendingEntries();
      if (entries.length === 0) {
        this.state = { ...this.state, status: "idle", pendingCount: 0, lastSync: new Date() };
        this.notify();
        return;
      }

      this.state = { ...this.state, status: "syncing", pendingCount: entries.length };
      this.notify();

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
      const status: SyncStatus = remaining === 0 ? "idle" : failed > 0 ? "partial" : "syncing";

      this.state = { ...this.state, status, pendingCount: remaining, lastSync: new Date() };
      this.notify();

      if (synced > 0) {
        window.dispatchEvent(new CustomEvent("sahu-sync-complete", { detail: { synced } }));
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
