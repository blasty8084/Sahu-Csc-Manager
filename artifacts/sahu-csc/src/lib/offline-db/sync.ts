// offline-db/sync.ts — caches that support offline/sync: generic KV cache,
// user session, cached reports, and storage-usage diagnostics.
import { openDB } from "./schema";
import type { CachedReport, UserSession, CacheItem } from "./schema";
import { getPendingCount, getAllPendingNotifications } from "./queue";

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
