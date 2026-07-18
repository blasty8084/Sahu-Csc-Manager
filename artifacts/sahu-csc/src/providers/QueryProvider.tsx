import React from "react";
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { get, set, del } from "idb-keyval";

declare const __APP_VERSION__: string;

// ─── Session-replaced detector — fires a custom DOM event on SESSION_REPLACED ─
function detectSessionReplaced(error: any) {
  const msg: string = error?.message ?? String(error ?? "");
  if (msg.includes("SESSION_REPLACED")) {
    window.dispatchEvent(new CustomEvent("sahu-session-replaced"));
  }
}

// ─── QueryClient ──────────────────────────────────────────────────────────────
export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: detectSessionReplaced }),
  mutationCache: new MutationCache({ onError: detectSessionReplaced }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60_000,       // 5 min — serve cache instantly on repeat navigation
      gcTime: 30 * 60_000,         // 30 min — keep data in memory the whole session
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

// ─── IDB-backed persister ─────────────────────────────────────────────────────
const CACHE_STORAGE_KEY = "sahu-csc-rq-cache";

const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => get(key),
    setItem: (key, value) => set(key, value),
    removeItem: (key) => del(key),
  },
  key: CACHE_STORAGE_KEY,
  throttleTime: 1000,
});

// ─── Provider component ───────────────────────────────────────────────────────
interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        buster: typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "3.1.1",
        maxAge: 8 * 60 * 60_000,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const key = query.queryKey[0];
            return key !== "auth/me" && query.state.status === "success";
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
