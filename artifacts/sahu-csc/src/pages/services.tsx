import { useState } from "react";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";

interface ServiceForm {
  name: string;
  description: string;
  price: number;
  category: string;
  isActive: boolean;
}

export default function Services() {
  const { toast } = useToast();
  const qc = useQueryClient();
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

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
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
