import type { CacheBackend } from "./types";
import { createMemoryBackend } from "./memoryBackend";

const instances = new Map<string, CacheBackend>();

/** One backend instance per namespace, created lazily and reused. */
export function getCacheBackend(namespace: string): CacheBackend {
  const existing = instances.get(namespace);
  if (existing) return existing;
  const backend = createMemoryBackend();
  instances.set(namespace, backend);
  return backend;
}
