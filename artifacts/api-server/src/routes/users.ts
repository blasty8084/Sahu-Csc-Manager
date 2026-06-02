import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateUserBody, UpdateUserBody, UpdateUserParams, DeleteUserParams } from "@workspace/api-zod";
import { requireRole, hashPassword, auditLog, getClientIp } from "../lib/auth";

const router: IRouter = Router();

function fmt(u: any) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    mobile: u.mobile ?? null,
    fullName: u.fullName ?? null,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
  };
}

router.get("/users", requireRole("admin"), async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(usersTable.username);
  res.json(users.map(fmt));
});

router.post("/users", requireRole("admin"), async (req, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const passwordHash = await hashPassword(parsed.data.password);
  const [u] = await db.insert(usersTable).values({
    username: parsed.data.username,
    email: parsed.data.email,
    mobile: parsed.data.mobile ?? null,
    fullName: parsed.data.fullName ?? null,
    passwordHash,
    role: parsed.data.role,
    isActive: true,
  }).returning();

  await auditLog(req.session.userId!, "user.create", `Created user: ${u.username}`, getClientIp(req));
  res.status(201).json(fmt(u));
});

router.patch("/users/:id", requireRole("admin"), async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  const updates: Record<string, any> = {};
  if (parsed.data.username !== undefined) updates.username = parsed.data.username;
  if (parsed.data.email !== undefined) updates.email = parsed.data.email;
  if (parsed.data.mobile !== undefined) updates.mobile = parsed.data.mobile;
  if (parsed.data.fullName !== undefined) updates.fullName = parsed.data.fullName;
  if (parsed.data.role !== undefined) updates.role = parsed.data.role;
  if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive;
  if (parsed.data.password) updates.passwordHash = await hashPassword(parsed.data.password);

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  await auditLog(req.session.userId!, "user.update", `Updated user ${id}`, getClientIp(req));
  res.json(fmt(updated));
});

router.delete("/users/:id", requireRole("admin"), async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  await db.delete(usersTable).where(eq(usersTable.id, id));
  await auditLog(req.session.userId!, "user.delete", `Deleted user ${id}`, getClientIp(req));
  res.sendStatus(204);
});

export default router;
