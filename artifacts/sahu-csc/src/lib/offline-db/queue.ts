// offline-db/queue.ts — write queues for offline operations
// Covers: pending ledger entries, pending actions (AePS/Udhari), pending notifications.
import { openDB } from "./schema";
import type { PendingLedgerEntry, PendingAction, PendingActionDomain, PendingNotification } from "./schema";

// ─── Pending Ledger ───────────────────────────────────────────────────────────

export async function addPendingEntry(entry: PendingLedgerEntry): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending_ledger", "readwrite");
    tx.objectStore("pending_ledger").put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllPendingEntries(): Promise<PendingLedgerEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending_ledger", "readonly");
    const req = tx.objectStore("pending_ledger").getAll();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error);
  });
}

export async function removePendingEntry(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending_ledger", "readwrite");
    tx.objectStore("pending_ledger").delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updatePendingEntryRetry(id: string, retryCount: number): Promise<void> {
  const db = await openDB();
  const entry = await new Promise<PendingLedgerEntry | undefined>((resolve, reject) => {
    const tx = db.transaction("pending_ledger", "readonly");
    const req = tx.objectStore("pending_ledger").get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  if (!entry) return;
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending_ledger", "readwrite");
    tx.objectStore("pending_ledger").put({ ...entry, retryCount });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingCount(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending_ledger", "readonly");
    const req = tx.objectStore("pending_ledger").count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── Pending Actions (AePS / Udhari offline queue) ────────────────────────────

export async function addPendingAction(action: PendingAction): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending_actions", "readwrite");
    tx.objectStore("pending_actions").put(action);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllPendingActions(domain?: PendingActionDomain): Promise<PendingAction[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending_actions", "readonly");
    const store = tx.objectStore("pending_actions");
    const req = domain ? store.index("domain").getAll(domain) : store.getAll();
    req.onsuccess = () => resolve((req.result as PendingAction[]) ?? []);
    req.onerror = () => reject(req.error);
  });
}

export async function removePendingAction(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending_actions", "readwrite");
    tx.objectStore("pending_actions").delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updatePendingActionRetry(id: string, retryCount: number): Promise<void> {
  const db = await openDB();
  const action = await new Promise<PendingAction | undefined>((resolve, reject) => {
    const tx = db.transaction("pending_actions", "readonly");
    const req = tx.objectStore("pending_actions").get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  if (!action) return;
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending_actions", "readwrite");
    tx.objectStore("pending_actions").put({ ...action, retryCount });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingActionsCount(domain?: PendingActionDomain): Promise<number> {
  const actions = await getAllPendingActions(domain);
  return actions.length;
}

// ─── Pending Notifications ────────────────────────────────────────────────────

export async function addPendingNotification(notif: PendingNotification): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending_notifications", "readwrite");
    tx.objectStore("pending_notifications").put(notif);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllPendingNotifications(): Promise<PendingNotification[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending_notifications", "readonly");
    const req = tx.objectStore("pending_notifications").getAll();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error);
  });
}

export async function markNotificationRead(id: string): Promise<void> {
  const db = await openDB();
  const tx1 = db.transaction("pending_notifications", "readonly");
  const existing = await new Promise<PendingNotification | undefined>((res, rej) => {
    const r = tx1.objectStore("pending_notifications").get(id);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  if (!existing) return;
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending_notifications", "readwrite");
    tx.objectStore("pending_notifications").put({ ...existing, read: true });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearReadNotifications(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending_notifications", "readwrite");
    const store = tx.objectStore("pending_notifications");
    const req = store.openCursor();
    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (!cursor) return;
      if ((cursor.value as PendingNotification).read) cursor.delete();
      cursor.continue();
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
