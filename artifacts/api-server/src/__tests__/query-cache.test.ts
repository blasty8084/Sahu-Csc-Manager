import { describe, it, expect, vi } from "vitest";
import { cached, invalidatePrefix } from "../lib/query-cache";

let seq = 0;
/** Returns a unique cache key to avoid cross-test pollution in the shared in-process cache. */
const key = (label: string) => `test:${label}:${++seq}`;

describe("cached", () => {
  it("calls loader on first access (cache miss)", async () => {
    const loader = vi.fn().mockResolvedValue({ value: 42 });
    const result = await cached(key("miss"), 5_000, loader);

    expect(loader).toHaveBeenCalledOnce();
    expect(result).toEqual({ value: 42 });
  });

  it("does NOT call loader on second access within TTL (cache hit)", async () => {
    const loader = vi.fn().mockResolvedValue("cached-string");
    const k = key("hit");

    const first = await cached(k, 5_000, loader);
    const second = await cached(k, 5_000, loader);

    expect(loader).toHaveBeenCalledOnce();
    expect(first).toBe(second);
  });

  it("returns different values for different keys", async () => {
    const loaderA = vi.fn().mockResolvedValue("A");
    const loaderB = vi.fn().mockResolvedValue("B");

    const a = await cached(key("ka"), 5_000, loaderA);
    const b = await cached(key("kb"), 5_000, loaderB);

    expect(a).toBe("A");
    expect(b).toBe("B");
  });

  it("re-invokes loader after TTL of 1ms expires", async () => {
    const loader = vi.fn().mockResolvedValue("fresh");
    const k = key("ttl");

    await cached(k, 1, loader);   // 1ms TTL
    await new Promise((r) => setTimeout(r, 5)); // wait for expiry
    await cached(k, 1, loader);

    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("caches null and false (falsy values are valid cache entries)", async () => {
    const loaderNull = vi.fn().mockResolvedValue(null);
    const loaderFalse = vi.fn().mockResolvedValue(false);

    const kn = key("null");
    const kf = key("false");

    const n1 = await cached(kn, 5_000, loaderNull);
    const n2 = await cached(kn, 5_000, loaderNull);
    const f1 = await cached(kf, 5_000, loaderFalse);
    const f2 = await cached(kf, 5_000, loaderFalse);

    expect(n1).toBeNull();
    expect(n2).toBeNull();
    expect(loaderNull).toHaveBeenCalledOnce();

    expect(f1).toBe(false);
    expect(f2).toBe(false);
    expect(loaderFalse).toHaveBeenCalledOnce();
  });
});

describe("invalidatePrefix", () => {
  it("forces a cache miss for keys matching the prefix", async () => {
    const loader = vi.fn().mockResolvedValue("data");
    const prefix = `inv-prefix-${++seq}:`;
    const k = `${prefix}key`;

    await cached(k, 5_000, loader);
    expect(loader).toHaveBeenCalledOnce();

    await invalidatePrefix(prefix);

    await cached(k, 5_000, loader);
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("does NOT invalidate keys that share a prefix only partially", async () => {
    const loader = vi.fn().mockResolvedValue("kept");
    const base = `partial-${++seq}`;
    const k = `${base}:entry`;

    await cached(k, 5_000, loader);
    await invalidatePrefix(`${base}:OTHER:`);

    await cached(k, 5_000, loader);
    expect(loader).toHaveBeenCalledOnce(); // still cached
  });

  it("is a no-op when no matching keys exist", async () => {
    await expect(invalidatePrefix(`nonexistent-${++seq}:`)).resolves.toBeUndefined();
  });
});
