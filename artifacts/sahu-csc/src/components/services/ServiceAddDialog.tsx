import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateService } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, Tag, IndianRupee, Layers, X } from "lucide-react";

interface ServiceForm {
  name: string;
  description: string;
  price: number;
  category: string;
  isActive: boolean;
}

interface ServiceAddDialogProps {
  open: boolean;
  onClose: () => void;
  /** Full service list — used for catalog stats in the desktop info panel. */
  services: any[];
  onSuccess: () => void;
}

/**
 * Add-new-service dialog: mobile uses a bottom sheet Dialog;
 * desktop uses a full-screen two-panel layout.
 */
export function ServiceAddDialog({ open, onClose, services, onSuccess }: ServiceAddDialogProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const createMut = useCreateService();

  const form = useForm<ServiceForm>({
    defaultValues: { name: "", description: "", price: 0, category: "General", isActive: true },
  });

  // Reset form to blank defaults each time the dialog opens.
  useEffect(() => {
    if (open) {
      form.reset({ name: "", description: "", price: 0, category: "General", isActive: true });
    }
  }, [open]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createMut.mutateAsync({ data: values });
      toast({ title: "Service created" });
      onClose();
      onSuccess();
    } catch {
      toast({ title: "Failed to save service", variant: "destructive" });
    }
  });

  if (!open) return null;

  /* ── Mobile dialog ───────────────────────────────────────────────── */
  if (isMobile) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl md:rounded-lg">
          <DialogHeader>
            <DialogTitle>Add Service</DialogTitle>
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
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending} data-testid="button-save-service">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  /* ── Desktop two-panel layout ────────────────────────────────────── */
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,44,96,0.40)", backdropFilter: "blur(4px)", zIndex: 49 }} />
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
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>Add New Service</h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.7 }}>
              Add a new service to your CSC catalog. Customers will be able to see it on bills and receipts.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto", position: "relative" }}>
            <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 2 }}>Current Catalog</p>
            {[
              { label: "Total Services", value: String(services.length) },
              { label: "Active", value: String(services.filter((s: any) => s.isActive).length) },
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
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0b2c60", margin: 0 }}>Add New Service</h2>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>Services Catalog · New entry</p>
            </div>
            <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={16} color="#64748b" />
            </button>
          </div>
          <form onSubmit={onSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 22, maxWidth: 620 }}>
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
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Description <span style={{ fontWeight: 400, textTransform: "none" as const, color: "#94a3b8" }}>(optional)</span></label>
                <input {...form.register("description")} placeholder="Brief description of the service..." data-testid="input-service-desc"
                  style={{ width: "100%", height: 50, paddingLeft: 16, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                  onFocus={e => (e.target.style.borderColor = "#f97316")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", borderRadius: 14, padding: "16px 18px", border: "1.5px solid #e2e8f0" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60", marginBottom: 2 }}>Service Active</p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>Inactive services won't appear in transaction forms</p>
                </div>
                <Switch checked={form.watch("isActive")} onCheckedChange={(v) => form.setValue("isActive", v)} id="active-switch-desk" />
              </div>
            </div>
            <div style={{ padding: "20px 40px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 14 }}>
              <button type="button" onClick={onClose} style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
              <button type="submit" disabled={createMut.isPending} data-testid="button-save-service"
                style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#f97316,#fb923c)", color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(249,115,22,0.40)", opacity: createMut.isPending ? 0.7 : 1 }}>
                <CheckCircle2 size={18} />
                {createMut.isPending ? "Saving…" : "Add Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
