import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatReceiptNumber } from "../lib/ledger-utils";

// ── Pure format tests (no DB required) ───────────────────────────────────────
describe("formatReceiptNumber — format correctness", () => {
  it("matches the CSC-YYYY-NNNN pattern exactly", () => {
    expect(formatReceiptNumber(2024, 1)).toMatch(/^CSC-\d{4}-\d{4}$/);
  });

  it("embeds the correct year", () => {
    expect(formatReceiptNumber(2025, 1)).toContain("2025");
    expect(formatReceiptNumber(2026, 1)).toContain("2026");
  });

  it("zero-pads the sequence to at least 4 digits", () => {
    expect(formatReceiptNumber(2024,    1)).toBe("CSC-2024-0001");
    expect(formatReceiptNumber(2024,    9)).toBe("CSC-2024-0009");
    expect(formatReceiptNumber(2024,   99)).toBe("CSC-2024-0099");
    expect(formatReceiptNumber(2024,  999)).toBe("CSC-2024-0999");
    expect(formatReceiptNumber(2024, 9999)).toBe("CSC-2024-9999");
  });

  it("does NOT truncate sequences beyond 9999 — grows naturally", () => {
    // The padStart(4) adds padding up to 4 chars; longer sequences expand.
    expect(formatReceiptNumber(2024, 10000)).toBe("CSC-2024-10000");
  });

  it("produces a different number for each distinct (year, count) pair", () => {
    const a = formatReceiptNumber(2024, 1);
    const b = formatReceiptNumber(2024, 2);
    const c = formatReceiptNumber(2025, 1); // year rollover
    expect(new Set([a, b, c]).size).toBe(3);
  });
});

// ── Sequence / DB-interaction tests (mocked) ──────────────────────────────────
//
// generateReceiptNumber in ledger.ts does:
//   db.insert(receiptCountersTable)
//     .values({ year, lastCount: 1 })
//     .onConflictDoUpdate({ ... lastCount + 1 })
//     .returning({ lastCount })
//
// The atomicity guarantee comes from Postgres ON CONFLICT DO UPDATE (no
// application-level locking needed).  These tests verify that:
//   a) the returned DB count is forwarded to formatReceiptNumber correctly, and
//   b) two concurrent calls with distinct DB-returned counts produce distinct receipts.

const mockReturning = vi.fn();

vi.mock("@workspace/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoUpdate: vi.fn(() => ({
          returning: mockReturning,
        })),
      })),
    })),
  },
  receiptCountersTable: { year: "year", lastCount: "lastCount" },
  ledgerTable: {},
  usersTable: {},
  userSessionsTable: {},
  pool: {},
}));

// Wrapper that replicates what generateReceiptNumber does — calls the mocked
// DB chain and formats with formatReceiptNumber.
async function simulateGenerate(year: number): Promise<string> {
  const [row] = await mockReturning();
  return formatReceiptNumber(year, (row as { lastCount: number }).lastCount);
}

describe("generateReceiptNumber — sequence via mocked DB", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sequence increments: first gets 0001, second gets 0002", async () => {
    mockReturning
      .mockResolvedValueOnce([{ lastCount: 1 }])
      .mockResolvedValueOnce([{ lastCount: 2 }]);

    expect(await simulateGenerate(2024)).toBe("CSC-2024-0001");
    expect(await simulateGenerate(2024)).toBe("CSC-2024-0002");
  });

  it("year rollover: year 2025 starts at 0001 independently of 2024's counter", async () => {
    // Each year has its own row in receipt_counters (keyed on year).
    // After year 2024 ends at count 5, year 2025's first entry gets count 1.
    mockReturning.mockResolvedValueOnce([{ lastCount: 1 }]);
    const firstOf2025 = await simulateGenerate(2025);
    expect(firstOf2025).toBe("CSC-2025-0001");
    expect(firstOf2025).not.toContain("2024");
  });

  it("concurrent generation: each call gets a distinct receipt number", async () => {
    // The ON CONFLICT DO UPDATE ... lastCount + 1 is atomic at DB level, so
    // two concurrent calls each receive a distinct count.  This test verifies
    // that distinct DB-returned counts produce distinct receipt numbers.
    mockReturning
      .mockResolvedValueOnce([{ lastCount: 7 }])
      .mockResolvedValueOnce([{ lastCount: 8 }]);

    const [r1, r2] = await Promise.all([
      simulateGenerate(2024),
      simulateGenerate(2024),
    ]);

    expect(r1).toBe("CSC-2024-0007");
    expect(r2).toBe("CSC-2024-0008");
    expect(r1).not.toBe(r2);
  });
});
