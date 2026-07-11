import { describe, it, expect } from "vitest";
import { computeRunningBalances } from "../lib/ledger-utils";

describe("computeRunningBalances", () => {
  it("returns empty array for empty input", () => {
    expect(computeRunningBalances([])).toEqual([]);
  });

  it("credit-only entries produce correct positive running balance", () => {
    const entries = [
      { credit: "100", debit: null },
      { credit: "200", debit: null },
      { credit: "50",  debit: null },
    ];
    expect(computeRunningBalances(entries)).toEqual([100, 300, 350]);
  });

  it("debit-only entries produce correct negative running balance", () => {
    const entries = [
      { credit: null, debit: "100" },
      { credit: null, debit: "50"  },
    ];
    expect(computeRunningBalances(entries)).toEqual([-100, -150]);
  });

  it("mixed credit/debit sequence produces correct final balance", () => {
    const entries = [
      { credit: "1000", debit: null   }, // → 1000
      { credit: null,   debit: "250"  }, // → 750
      { credit: "500",  debit: null   }, // → 1250
      { credit: null,   debit: "1000" }, // → 250
      { credit: "100",  debit: "50"   }, // → 300
    ];
    expect(computeRunningBalances(entries)).toEqual([1000, 750, 1250, 250, 300]);
  });

  it("regression: mid-sequence edit shifts every later balance correctly (batched recalc)", () => {
    // This is the scenario that was fixed by the batched UNNEST UPDATE:
    // editing entry #2 (credit 200 → 0) must shift all subsequent balances.
    // Previously the per-row UPDATE loop could race; the batched version must
    // produce identical final values.
    const before = [
      { credit: "500", debit: null }, // → 500
      { credit: "200", debit: null }, // → 700
      { credit: "100", debit: null }, // → 800
    ];
    const after = [
      { credit: "500", debit: null }, // → 500   (unchanged)
      { credit: "0",   debit: null }, // → 500   (edited: 200 → 0)
      { credit: "100", debit: null }, // → 600   (must shift −200 from the edit)
    ];
    expect(computeRunningBalances(before)).toEqual([500, 700, 800]);
    expect(computeRunningBalances(after)).toEqual([500, 500, 600]);
  });

  it("maintains per-entry running totals, not just the final sum", () => {
    const entries = [
      { credit: "300", debit: null   },
      { credit: null,  debit: "100"  },
      { credit: "200", debit: null   },
    ];
    const [b0, b1, b2] = computeRunningBalances(entries);
    expect(b0).toBe(300);
    expect(b1).toBe(200);
    expect(b2).toBe(400);
  });

  it("numeric DB columns returned as strings are parsed without NaN", () => {
    const entries = [
      { credit: "1234.56", debit: "0.00"   },
      { credit: "0.00",    debit: "234.56" },
    ];
    const balances = computeRunningBalances(entries);
    expect(balances.every((b) => !Number.isNaN(b))).toBe(true);
    expect(balances[0]).toBeCloseTo(1234.56, 2);
    expect(balances[1]).toBeCloseTo(1000.00, 2);
  });

  it("null credit and debit fields are treated as zero — no silent NaN", () => {
    const entries = [
      { credit: null, debit: null  },
      { credit: "100", debit: null },
    ];
    const balances = computeRunningBalances(entries);
    expect(balances.every((b) => !Number.isNaN(b))).toBe(true);
    expect(balances).toEqual([0, 100]);
  });

  it("single entry with both credit and debit is netted correctly", () => {
    expect(computeRunningBalances([{ credit: "500", debit: "200" }])).toEqual([300]);
  });
});
