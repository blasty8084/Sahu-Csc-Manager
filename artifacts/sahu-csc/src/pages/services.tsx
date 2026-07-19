import { useState } from "react";
import { useListServices, useDeleteService, getListServicesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ServicesSkeleton } from "@/components/skeletons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceAddDialog } from "@/components/services/ServiceAddDialog";
import { ServiceEditDialog } from "@/components/services/ServiceEditDialog";

export default function Services() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editService, setEditService] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: services, isLoading } = useListServices();
  const deleteMut = useDeleteService();

  const invalidate = () => qc.invalidateQueries({ queryKey: getListServicesQueryKey() });

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
          <Button size="sm" onClick={() => setShowAddForm(true)} data-testid="button-new-service">
            <Plus size={14} className="md:mr-1.5" />
            <span className="hidden md:inline">Add Service</span>
          </Button>
        </div>

        {isLoading ? (
          <ServicesSkeleton />
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
                <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {services?.filter((s: any) => s.category === cat).map((service: any) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onEdit={() => setEditService(service)}
                      onDelete={() => setDeleteId(service.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <ServiceAddDialog
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        services={services ?? []}
        onSuccess={invalidate}
      />

      <ServiceEditDialog
        open={!!editService}
        service={editService}
        onClose={() => setEditService(null)}
        services={services ?? []}
        onSuccess={invalidate}
      />

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
