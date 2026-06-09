const DB_NAME = "sahu-csc-offline";
const DB_VERSION = 1;

export interface PendingLedgerEntry {
  id: string;
  date: string;
  customerName: string;
  serviceType: string;
  credit: number;
  debit: number;
  description: string;
  createdAt: number;
  retryCount: number;
}

export interface CacheItem<T = unknown> {
  key: string;
  value: T;
  expiresAt: number;
}

let _db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("pending_ledger")) {
        db.createObjectStore("pending_ledger", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("cache_store")) {
        db.createObjectStore("cache_store", { keyPath: "key" });
      }
    };
    req.onsuccess = () => {
      _db = req.result;
      resolve(_db);
    };
    req.onerror = () => reject(req.error);
  });
}

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

export async function setCacheItem<T>(key: string, value: T, expiresInMs = 5 * 60 * 1000): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cache_store", "readwrite");
    tx.objectStore("cache_store").put({ key, value, expiresAt: Date.now() + expiresInMs });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCacheItem<T>(key: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cache_store", "readonly");
    const req = tx.objectStore("cache_store").get(key);
    req.onsuccess = () => {
      const item = req.result as CacheItem<T> | undefined;
      if (!item) return resolve(null);
      if (Date.now() > item.expiresAt) return resolve(null);
      resolve(item.value);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearExpiredCache(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cache_store", "readwrite");
    const store = tx.objectStore("cache_store");
    const req = store.openCursor();
    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (!cursor) return;
      const item = cursor.value as CacheItem;
      if (Date.now() > item.expiresAt) cursor.delete();
      cursor.continue();
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
