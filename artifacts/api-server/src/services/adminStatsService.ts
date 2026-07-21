import { db, pool, ledgerTable, usersTable, auditLogsTable } from "@workspace/db";
import { eq, sum, count, desc } from "drizzle-orm";
import { cached } from "../lib/query-cache";

// Cross-user balance summary — used by /admin/users-overview.
// Cached for 5 s; invalidated on any ledger write (see query-cache.ts).
export async function getUsersOverview() {
  return cached("admin:users-overview", 5_000, async () => {
    const balanceRows = await db
      .select({
        userId: ledgerTable.createdBy,
        totalCredits: sum(ledgerTable.credit),
        totalDebits: sum(ledgerTable.debit),
        totalTransactions: count(),
      })
      .from(ledgerTable)
      .groupBy(ledgerTable.createdBy);

    const balanceByUser = new Map(balanceRows.map((b) => [b.userId, b]));

    // DISTINCT ON gives each user's most recent entry in one query (not N queries).
    const recentRows = await pool.query<{
      created_by: number;
      date: string;
      customer_name: string;
      service_type: string;
      credit: string;
      debit: string;
    }>(`
      SELECT DISTINCT ON (created_by) created_by, date, customer_name, service_type, credit, debit
      FROM ledger
      ORDER BY created_by, created_at DESC
    `);
    const recentByUser = new Map(recentRows.rows.map((r) => [r.created_by, r]));

    const users = await db
      .select({ id: usersTable.id, username: usersTable.username, fullName: usersTable.fullName, role: usersTable.role, isActive: usersTable.isActive })
      .from(usersTable);

    return users.map((user) => {
      const balance = balanceByUser.get(user.id);
      const totalCredits = parseFloat(balance?.totalCredits ?? "0");
      const totalDebits = parseFloat(balance?.totalDebits ?? "0");
      const recent = recentByUser.get(user.id);
      return {
        userId: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        balance: totalCredits - totalDebits,
        totalCredits,
        totalDebits,
        totalTransactions: balance?.totalTransactions ?? 0,
        lastEntry: recent
          ? {
              date: recent.date,
              customerName: recent.customer_name,
              serviceType: recent.service_type,
              credit: parseFloat(recent.credit ?? "0"),
              debit: parseFloat(recent.debit ?? "0"),
            }
          : null,
      };
    });
  });
}

export async function getRecentAuditLogs(limit: number) {
  const logs = await db
    .select({
      id: auditLogsTable.id,
      userId: auditLogsTable.userId,
      action: auditLogsTable.action,
      details: auditLogsTable.details,
      ipAddress: auditLogsTable.ipAddress,
      createdAt: auditLogsTable.createdAt,
      username: usersTable.username,
    })
    .from(auditLogsTable)
    .leftJoin(usersTable, eq(auditLogsTable.userId, usersTable.id))
    .orderBy(desc(auditLogsTable.createdAt))
    .limit(limit);
  return {
    logs: logs.map((l) => ({
      id: l.id,
      userId: l.userId,
      username: l.username ?? null,
      action: l.action,
      details: l.details ?? null,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
    })),
    queriedAt: new Date().toISOString(),
  };
}

export async function getDbStats() {
  const tableNames = [
    "users", "ledger", "aeps_daily", "aeps_transactions",
    "udhari_customers", "udhari_entries", "notifications",
    "audit_logs", "user_sessions", "settings", "services",
    "push_subscriptions", "receipt_counters", "email_otps",
    "password_reset_tokens", "broadcast_logs", "backups",
    "user_preferences", "user_notification_preferences",
  ];
  const tablesWithTimestamp = new Set([
    "ledger", "users", "aeps_daily", "aeps_transactions",
    "udhari_customers", "udhari_entries", "notifications",
    "audit_logs", "user_sessions", "email_otps",
    "password_reset_tokens", "broadcast_logs", "backups",
    "push_subscriptions", "services",
  ]);
  const rows = await Promise.all(
    tableNames.map(async (table) => {
      const countResult = await pool.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM "${table}"`
      );
      const rowCount = parseInt(countResult.rows[0]?.count ?? "0", 10);
      let lastEntry: string | null = null;
      if (tablesWithTimestamp.has(table)) {
        try {
          const tsResult = await pool.query<{ ts: string }>(
            `SELECT MAX(created_at) AS ts FROM "${table}"`
          );
          lastEntry = tsResult.rows[0]?.ts ?? null;
        } catch {
          lastEntry = null;
        }
      }
      return { table, rowCount, lastEntry };
    })
  );
  return { tables: rows, queriedAt: new Date().toISOString() };
}
