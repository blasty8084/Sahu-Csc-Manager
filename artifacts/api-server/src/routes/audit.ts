import { Router, type IRouter } from "express";
import { db, auditLogsTable, usersTable } from "@workspace/db";
import { eq, and, gte, lte, desc, count } from "drizzle-orm";
import { ListAuditLogsQueryParams } from "@workspace/api-zod";
import { requireRole } from "../lib/auth";

const router: IRouter = Router();

router.get("/audit-logs", requireRole("admin"), async (req, res): Promise<void> => {
  const params = ListAuditLogsQueryParams.safeParse(req.query);
  const page = params.success && params.data.page ? params.data.page : 1;
  const limit = params.success && params.data.limit ? params.data.limit : 20;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (params.success) {
    if (params.data.userId) conditions.push(eq(auditLogsTable.userId, params.data.userId));
    if (params.data.action) conditions.push(eq(auditLogsTable.action, params.data.action as string));
    if (params.data.startDate) {
      conditions.push(gte(auditLogsTable.createdAt, new Date(params.data.startDate as string)));
    }
    if (params.data.endDate) {
      conditions.push(lte(auditLogsTable.createdAt, new Date(params.data.endDate as string)));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [logs, totalResult] = await Promise.all([
    db
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
      .where(whereClause)
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(auditLogsTable).where(whereClause),
  ]);

  res.json({
    logs: logs.map((l) => ({
      id: l.id,
      userId: l.userId,
      username: l.username ?? null,
      action: l.action,
      details: l.details ?? null,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
    })),
    total: totalResult[0]?.total ?? 0,
    page,
    limit,
  });
});

export default router;
