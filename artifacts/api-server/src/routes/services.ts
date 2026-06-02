import { Router, type IRouter } from "express";
import { db, servicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateServiceBody, UpdateServiceBody, UpdateServiceParams, DeleteServiceParams } from "@workspace/api-zod";
import { requireAuth, requireRole, auditLog, getClientIp } from "../lib/auth";

const router: IRouter = Router();

function fmt(s: any) {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    price: parseFloat(s.price ?? "0"),
    category: s.category,
    isActive: s.isActive,
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
  };
}

router.get("/services", requireAuth, async (_req, res): Promise<void> => {
  const services = await db.select().from(servicesTable).orderBy(servicesTable.category, servicesTable.name);
  res.json(services.map(fmt));
});

router.post("/services", requireRole("admin"), async (req, res): Promise<void> => {
  const parsed = CreateServiceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [s] = await db.insert(servicesTable).values({
    name: parsed.data.name,
    description: parsed.data.description,
    price: String(parsed.data.price),
    category: parsed.data.category,
    isActive: parsed.data.isActive ?? true,
  }).returning();
  await auditLog(req.session.userId!, "service.create", `Created service: ${s.name}`, getClientIp(req));
  res.status(201).json(fmt(s));
});

router.patch("/services/:id", requireRole("admin"), async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const parsed = UpdateServiceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [existing] = await db.select().from(servicesTable).where(eq(servicesTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  const updates: Record<string, any> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.price !== undefined) updates.price = String(parsed.data.price);
  if (parsed.data.category !== undefined) updates.category = parsed.data.category;
  if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive;

  const [updated] = await db.update(servicesTable).set(updates).where(eq(servicesTable.id, id)).returning();
  await auditLog(req.session.userId!, "service.update", `Updated service ${id}`, getClientIp(req));
  res.json(fmt(updated));
});

router.delete("/services/:id", requireRole("admin"), async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [existing] = await db.select().from(servicesTable).where(eq(servicesTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  await db.delete(servicesTable).where(eq(servicesTable.id, id));
  await auditLog(req.session.userId!, "service.delete", `Deleted service ${id}`, getClientIp(req));
  res.sendStatus(204);
});

export default router;
