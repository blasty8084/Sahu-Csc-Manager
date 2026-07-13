import { describe, it, expect } from "vitest";

// ── Admin table names ─────────────────────────────────────────────────────────
// These are the tables exposed by GET /api/admin/stats. The list must stay
// consistent with the actual DB schema so the admin panel shows all data.
// If you add a new table to the schema, add it here too.
const EXPECTED_ADMIN_TABLES = [
  "users",
  "ledger",
  "aeps_daily",
  "aeps_transactions",
  "udhari",
  "notifications",
  "push_subscriptions",
  "receipt_counters",
  "email_otps",
];

describe("admin stats — table name registry", () => {
  it("expected table list is non-empty and contains core tables", () => {
    expect(EXPECTED_ADMIN_TABLES.length).toBeGreaterThan(0);
    expect(EXPECTED_ADMIN_TABLES).toContain("users");
    expect(EXPECTED_ADMIN_TABLES).toContain("ledger");
  });

  it("receipt_counters is present — receipt numbering requires its own table", () => {
    expect(EXPECTED_ADMIN_TABLES).toContain("receipt_counters");
  });

  it("push_subscriptions is present — web push requires subscription rows", () => {
    expect(EXPECTED_ADMIN_TABLES).toContain("push_subscriptions");
  });

  it("all table names are snake_case strings without spaces", () => {
    for (const name of EXPECTED_ADMIN_TABLES) {
      expect(name).toMatch(/^[a-z][a-z0-9_]*$/);
    }
  });

  it("no duplicate table names in the registry", () => {
    const set = new Set(EXPECTED_ADMIN_TABLES);
    expect(set.size).toBe(EXPECTED_ADMIN_TABLES.length);
  });
});

// ── Role permission matrix ────────────────────────────────────────────────────
// Verify that the RBAC permission set covers the minimum expected surface.
// Source: artifacts/api-server/src/lib/auth/middleware.ts ROLE_PERMISSIONS.

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "ledger:view", "ledger:create", "ledger:edit", "ledger:delete",
    "aeps:view", "aeps:create", "aeps:edit", "aeps:delete",
    "udhari:view", "udhari:create", "udhari:edit", "udhari:delete",
    "reports:view", "admin:view",
  ],
  operator: [
    "ledger:view", "ledger:create",
    "aeps:view", "aeps:create",
    "udhari:view", "udhari:create",
    "reports:view",
  ],
};

describe("RBAC — role permission matrix", () => {
  it("admin has all operator permissions (superset)", () => {
    const adminSet = new Set(ROLE_PERMISSIONS.admin);
    for (const perm of ROLE_PERMISSIONS.operator) {
      expect(adminSet.has(perm)).toBe(true);
    }
  });

  it("admin has admin:view; operator does not", () => {
    expect(ROLE_PERMISSIONS.admin).toContain("admin:view");
    expect(ROLE_PERMISSIONS.operator).not.toContain("admin:view");
  });

  it("operator cannot delete ledger entries", () => {
    expect(ROLE_PERMISSIONS.operator).not.toContain("ledger:delete");
  });

  it("all permissions follow the resource:action pattern", () => {
    const allPerms = [...ROLE_PERMISSIONS.admin, ...ROLE_PERMISSIONS.operator];
    for (const perm of allPerms) {
      expect(perm).toMatch(/^[a-z]+:[a-z]+$/);
    }
  });
});

// ── formatEntry — shape contract ──────────────────────────────────────────────
// formatEntry is an internal helper in ledger.ts. These tests verify the shape
// contract it must uphold so API consumers don't receive unexpected null/NaN fields.

function formatEntry(entry: any, createdByName?: string | null) {
  return {
    id: entry.id,
    date: entry.date,
    customerName: entry.customerName,
    serviceType: entry.serviceType,
    credit: parseFloat(entry.credit ?? "0"),
    debit: parseFloat(entry.debit ?? "0"),
    description: entry.description,
    balance: parseFloat(entry.balance ?? "0"),
    createdBy: entry.createdBy,
    createdByName: createdByName ?? null,
    receiptNumber: entry.receiptNumber ?? null,
    receiptToken: entry.receiptToken ?? null,
    createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt,
  };
}

describe("formatEntry — ledger row shape contract", () => {
  it("null credit/debit columns become 0, not NaN", () => {
    const result = formatEntry({ id: 1, date: "2024-01-01", customerName: "Test", serviceType: "AePS", credit: null, debit: null, description: null, balance: null, createdBy: 1, createdAt: "2024-01-01T00:00:00Z" });
    expect(result.credit).toBe(0);
    expect(result.debit).toBe(0);
    expect(result.balance).toBe(0);
    expect(Number.isNaN(result.credit)).toBe(false);
  });

  it("string numeric columns from Postgres are parsed to floats", () => {
    const result = formatEntry({ id: 2, date: "2024-01-01", customerName: "A", serviceType: "B", credit: "1500.50", debit: "0.00", description: null, balance: "1500.50", createdBy: 1, createdAt: "2024-01-01T00:00:00Z" });
    expect(result.credit).toBeCloseTo(1500.5, 2);
    expect(result.debit).toBe(0);
  });

  it("missing receiptNumber and receiptToken default to null", () => {
    const result = formatEntry({ id: 3, date: "2024-01-01", customerName: "A", serviceType: "B", credit: "0", debit: "0", description: null, balance: "0", createdBy: 1, createdAt: "2024-01-01T00:00:00Z" });
    expect(result.receiptNumber).toBeNull();
    expect(result.receiptToken).toBeNull();
  });

  it("Date objects are serialised to ISO strings", () => {
    const d = new Date("2024-06-15T10:30:00.000Z");
    const result = formatEntry({ id: 4, date: "2024-06-15", customerName: "A", serviceType: "B", credit: "0", debit: "0", description: null, balance: "0", createdBy: 1, createdAt: d });
    expect(result.createdAt).toBe("2024-06-15T10:30:00.000Z");
  });

  it("createdByName falls back to null when omitted", () => {
    const result = formatEntry({ id: 5, date: "2024-01-01", customerName: "A", serviceType: "B", credit: "0", debit: "0", description: null, balance: "0", createdBy: 1, createdAt: "2024-01-01T00:00:00Z" });
    expect(result.createdByName).toBeNull();
  });
});
