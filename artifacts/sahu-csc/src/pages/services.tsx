import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useListServices, useCreateService, useUpdateService, useDeleteService, getListServicesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus, Pencil, Trash2, X, CheckCircle2, Tag, IndianRupee, Layers } from "lucide-react";
import { useForm } from "react-hook-form";

interface ServiceForm {
  name: string;
  description: string;
  price: number;
  category: string;
  isActive: boolean;
}

export default function Services() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isMobile = useIsMobile();
  const [showForm, setShowForm] = useState(false);
  const [editService, setEditService] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: services, isLoading } = useListServices();
  const createMut = useCreateService();
  const updateMut = useUpdateService();
  const deleteMut = useDeleteService();

  const form = useForm<ServiceForm>({
    defaultValues: { name: "", description: "", price: 0, category: "General", isActive: true }
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: getListServicesQueryKey() });

  const openCreate = () => {
    setEditService(null);
    form.reset({ name: "", description: "", price: 0, category: "General", isActive: true });
    setShowForm(true);
  };

  const openEdit = (s: any) => {
    setEditService(s);
    form.reset({ name: s.name, description: s.description, price: s.price, category: s.category, isActive: s.isActive });
    setShowForm(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editService) {
        await updateMut.mutateAsync({ id: editService.id, data: values });
        toast({ title: "Service updated" });
      } else {
        await createMut.mutateAsync({ data: values });
        toast({ title: "Service created" });
      }
      setShowForm(false);
      invalidate();
    } catch {
      toast({ title: "Failed to save service", variant: "destructive" });
    }
  });

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMut.mutateAsync({ id: deleteId });
      toast({ title: "Service deleted" });
      setDeleteId(null);
      invalidate();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const categories = [...new Set(services?.map((s: any) => s.category) ?? [])];

  return (
    <Layout>
      <div className="space-y-4 md:space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-bold">CSC Services</h2>
            <p className="text-xs md:text-sm text-muted-foreground">{services?.length ?? 0} services</p>
          </div>
          <Button size="sm" onClick={openCreate} data-testid="button-new-service">
            <Plus size={14} className="md:mr-1.5" />
            <span className="hidden md:inline">Add Service</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
          </div>
        ) : !services?.length ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No services yet. Add your first service.</div>
        ) : (
          <>
            {categories.map((cat) => (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{cat}</h3>
                  <div className="flex-1 h-px bg-border" />
                </div>
                {/* Mobile: 1-col; Tablet: 2-col; Desktop: 3-col */}
                <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {services?.filter((s: any) => s.category === cat).map((service: any) => (
                    <div
                      key={service.id}
                      className={`bg-card border rounded-xl p-4 relative transition-all hover:shadow-sm ${!service.isActive ? "opacity-55" : ""}`}
                      data-testid={`card-service-${service.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm truncate">{service.name}</h4>
                            {!service.isActive && (
                              <Badge variant="secondary" className="text-[10px] py-0 h-4">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{service.description}</p>
                          <p className="text-base md:text-lg font-bold text-primary mt-2">
                            ₹{service.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-1 flex-shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(service)}>
                            <Pencil size={13} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(service.id)}>
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Add/Edit Service — Mobile Dialog */}
      <Dialog open={showForm && !!isMobile} onOpenChange={setShowForm}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl md:rounded-lg">
          <DialogHeader>
            <DialogTitle>{editService ? "Edit Service" : "Add Service"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Service Name</Label>
              <Input {...form.register("name", { required: true })} placeholder="e.g. PAN Card" data-testid="input-service-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input {...form.register("category", { required: true })} placeholder="e.g. Government" data-testid="input-service-category" />
              </div>
              <div className="space-y-1.5">
                <Label>Price (₹)</Label>
                <Input type="number" step="0.01" min="0" {...form.register("price", { valueAsNumber: true, min: 0 })} data-testid="input-service-price" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input {...form.register("description")} placeholder="Brief description..." data-testid="input-service-desc" />
            </div>
            <div className="flex items-center gap-3 py-1">
              <Switch checked={form.watch("isActive")} onCheckedChange={(v) => form.setValue("isActive", v)} id="active-switch" />
              <Label htmlFor="active-switch" className="cursor-pointer">Active</Label>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending} data-testid="button-save-service">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Service — Desktop V2 Split Layout */}
      {!isMobile && showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: "fixed", inset: 0, background: "rgba(11,44,96,0.40)", backdropFilter: "blur(4px)", zIndex: 49 }} />
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>

            {/* LEFT INFO PANEL */}
            <div style={{ width: 380, flexShrink: 0, background: "linear-gradient(160deg,#7c2d12 0%,#c2410c 50%,#f97316 100%)", display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.10)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(0,0,0,0.10)", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, position: "relative" }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(11,44,96,0.40)" }}>
                  <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
                </div>
                <div><span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU </span><span style={{ color: "rgba(255,255,255,0.70)", fontWeight: 900, fontSize: 16 }}>CSC</span></div>
              </div>
              <div style={{ position: "relative", marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,0.20)", border: "2px solid rgba(255,255,255,0.30)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <Tag size={30} color="#fff" />
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 8, padding: "4px 10px", marginBottom: 10 }}>
                  <Layers size={11} color="#fff" />
                  <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>Services Catalog</span>
                </div>
                <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>
                  {editService ? "Edit Service" : "Add New Service"}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.7 }}>
                  {editService
                    ? "Update the service details, pricing, or availability in your catalog."
                    : "Add a new service to your CSC catalog. Customers will be able to see it on bills and receipts."}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto", position: "relative" }}>
                <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 2 }}>Current Catalog</p>
                {[
                  { label: "Total Services", value: String(Array.isArray(services) ? services.length : 0) },
                  { label: "Active", value: String(Array.isArray(services) ? services.filter((s: any) => s.isActive).length : 0) },
                  { label: "Selected Category", value: form.watch("category") || "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "11px 16px", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <span style={{ color: "rgba(255,255,255,0.60)", fontSize: 12, fontWeight: 500 }}>{label}</span>
                    <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT FORM PANEL */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>
              <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0b2c60", margin: 0 }}>{editService ? "Edit Service" : "Add New Service"}</h2>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>Services Catalog · {editService ? "Update details" : "New entry"}</p>
                </div>
                <button onClick={() => setShowForm(false)} style={{ width: 38, height: 38, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <X size={16} color="#64748b" />
                </button>
              </div>

              <form onSubmit={onSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 22, maxWidth: 620 }}>

                  {/* Service name hero */}
                  <div style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.06),rgba(251,146,60,0.03))", border: "2px solid rgba(249,115,22,0.20)", borderRadius: 20, padding: "20px 24px" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#c2410c", textTransform: "uppercase" as const, letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>Service Name *</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(249,115,22,0.35)" }}>
                        <Tag size={20} color="#fff" />
                      </div>
                      <input {...form.register("name", { required: true })} placeholder="e.g. PAN Card Application" data-testid="input-service-name"
                        style={{ flex: 1, fontSize: 20, fontWeight: 800, color: "#0b2c60", background: "transparent", border: "none", outline: "none" }} />
                    </div>
                  </div>

                  {/* Category + Price */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Category *</label>
                      <div style={{ position: "relative" }}>
                        <Layers size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input {...form.register("category", { required: true })} placeholder="e.g. Government" data-testid="input-service-category"
                          style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                          onFocus={e => (e.target.style.borderColor = "#f97316")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Price (₹)</label>
                      <div style={{ position: "relative" }}>
                        <IndianRupee size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input type="number" step="0.01" min="0" {...form.register("price", { valueAsNumber: true, min: 0 })} data-testid="input-service-price"
                          style={{ width: "100%", height: 50, paddingLeft: 38, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                          onFocus={e => (e.target.style.borderColor = "#f97316")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Description <span style={{ fontWeight: 400, textTransform: "none" as const, color: "#94a3b8" }}>(optional)</span></label>
                    <input {...form.register("description")} placeholder="Brief description of the service..." data-testid="input-service-desc"
                      style={{ width: "100%", height: 50, paddingLeft: 16, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                      onFocus={e => (e.target.style.borderColor = "#f97316")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                  </div>

                  {/* Active toggle */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", borderRadius: 14, padding: "16px 18px", border: "1.5px solid #e2e8f0" }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60", marginBottom: 2 }}>Service Active</p>
                      <p style={{ fontSize: 12, color: "#94a3b8" }}>Inactive services won't appear in transaction forms</p>
                    </div>
                    <Switch checked={form.watch("isActive")} onCheckedChange={(v) => form.setValue("isActive", v)} id="active-switch-desk" />
                  </div>
                </div>

                <div style={{ padding: "20px 40px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 14 }}>
                  <button type="button" onClick={() => setShowForm(false)} style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
                  <button type="submit" disabled={createMut.isPending || updateMut.isPending} data-testid="button-save-service"
                    style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#f97316,#fb923c)", color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(249,115,22,0.40)", opacity: (createMut.isPending || updateMut.isPending) ? 0.7 : 1 }}>
                    <CheckCircle2 size={18} />
                    {(createMut.isPending || updateMut.isPending) ? "Saving…" : editService ? "Save Changes" : "Add Service"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirm */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl md:rounded-lg">
          <DialogHeader><DialogTitle>Delete Service?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
