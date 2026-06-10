const DB_NAME = "sahu-csc-offline";
const DB_VERSION = 2;

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

export interface PendingNotification {
  id: string;
  title: string;
  body: string;
  url?: string;
  createdAt: number;
  read: boolean;
}

export interface CachedReport {
  key: string;
  type: "daily" | "monthly" | "custom";
  params: Record<string, string>;
  data: unknown;
  cachedAt: number;
  expiresAt: number;
}

export interface UserSession {
  id: number;
  username: string;
  fullName: string;
  role: string;
  email?: string;
  profilePicture?: string;
  cachedAt: number;
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
      const oldVersion = e.oldVersion;

      if (oldVersion < 1) {
        db.createObjectStore("pending_ledger", { keyPath: "id" });
        db.createObjectStore("cache_store", { keyPath: "key" });
      }

      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains("pending_notifications")) {
          db.createObjectStore("pending_notifications", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("cached_reports")) {
          db.createObjectStore("cached_reports", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("user_session")) {
          db.createObjectStore("user_session", { keyPath: "id" });
        }
      }
    };

    req.onsuccess = () => {
      _db = req.result;
      _db.onversionchange = () => { _db?.close(); _db = null; };
      resolve(_db);
    };
    req.onerror = () => reject(req.error);
    req.onblocked = () => { _db?.close(); _db = null; };
  });
}

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

// ─── Generic Cache ────────────────────────────────────────────────────────────

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

// ─── User Session (offline auth) ──────────────────────────────────────────────

export async function saveUserSession(user: UserSession): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("user_session", "readwrite");
    const store = tx.objectStore("user_session");
    const req = store.openCursor();
    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) cursor.delete();
      cursor?.continue();
    };
    tx.oncomplete = () => {
      const tx2 = db.transaction("user_session", "readwrite");
      tx2.objectStore("user_session").put({ ...user, cachedAt: Date.now() });
      tx2.oncomplete = () => resolve();
      tx2.onerror = () => reject(tx2.error);
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedUserSession(): Promise<UserSession | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("user_session", "readonly");
    const req = tx.objectStore("user_session").getAll();
    req.onsuccess = () => {
      const sessions = req.result as UserSession[];
      if (!sessions || sessions.length === 0) return resolve(null);
      const session = sessions[0];
      const age = Date.now() - session.cachedAt;
      if (age > 24 * 60 * 60 * 1000) return resolve(null);
      resolve(session);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearUserSession(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("user_session", "readwrite");
    tx.objectStore("user_session").clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Cached Reports ───────────────────────────────────────────────────────────

export async function saveCachedReport(report: CachedReport): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cached_reports", "readwrite");
    tx.objectStore("cached_reports").put(report);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedReport(key: string): Promise<CachedReport | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cached_reports", "readonly");
    const req = tx.objectStore("cached_reports").get(key);
    req.onsuccess = () => {
      const item = req.result as CachedReport | undefined;
      if (!item) return resolve(null);
      if (Date.now() > item.expiresAt) return resolve(null);
      resolve(item);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getAllCachedReports(): Promise<CachedReport[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cached_reports", "readonly");
    const req = tx.objectStore("cached_reports").getAll();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error);
  });
}

export async function clearExpiredReports(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cached_reports", "readwrite");
    const store = tx.objectStore("cached_reports");
    const req = store.openCursor();
    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (!cursor) return;
      const item = cursor.value as CachedReport;
      if (Date.now() > item.expiresAt) cursor.delete();
      cursor.continue();
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
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

// ─── Storage Usage ────────────────────────────────────────────────────────────

export async function getStorageUsage(): Promise<{ used: number; quota: number; percent: number }> {
  if (!navigator.storage?.estimate) {
    return { used: 0, quota: 0, percent: 0 };
  }
  const { usage = 0, quota = 0 } = await navigator.storage.estimate();
  return {
    used: usage,
    quota,
    percent: quota > 0 ? Math.round((usage / quota) * 100) : 0,
  };
}

export async function getOfflineStats(): Promise<{
  pendingLedger: number;
  pendingNotifications: number;
  cachedReports: number;
  hasSession: boolean;
}> {
  const [pendingLedger, pendingNotifications, cachedReports, session] = await Promise.all([
    getPendingCount(),
    getAllPendingNotifications().then((n) => n.length),
    getAllCachedReports().then((r) => r.length),
    getCachedUserSession(),
  ]);
  return { pendingLedger, pendingNotifications, cachedReports, hasSession: !!session };
}
