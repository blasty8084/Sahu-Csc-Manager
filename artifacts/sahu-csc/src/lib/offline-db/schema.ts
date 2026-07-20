// offline-db/schema.ts — IndexedDB schema: shared types, DB constants, openDB singleton
// All other offline-db modules import openDB from here; never open the DB elsewhere.

const DB_NAME = "sahu-csc-offline";
const DB_VERSION = 3;

// ─── Shared types ─────────────────────────────────────────────────────────────

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

export type PendingActionDomain = "aeps" | "udhari";

export interface PendingAction {
  id: string;
  domain: PendingActionDomain;
  /** Human-readable label shown in UI, e.g. "Withdrawal ₹500 — Ramesh" */
  label: string;
  endpoint: string;
  method: "POST" | "PATCH" | "PUT" | "DELETE";
  body: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
}

// ─── DB singleton ──────────────────────────────────────────────────────────────

let _db: IDBDatabase | null = null;

export function openDB(): Promise<IDBDatabase> {
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

      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains("pending_actions")) {
          const store = db.createObjectStore("pending_actions", { keyPath: "id" });
          store.createIndex("domain", "domain", { unique: false });
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
