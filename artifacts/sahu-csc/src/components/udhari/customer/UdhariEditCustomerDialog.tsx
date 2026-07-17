import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUdhariCustomer } from "@workspace/api-client-react";

interface Props {
  customer: any;
  open: boolean;
  onClose: () => void;
}

export function UdhariEditCustomerDialog({ customer, open, onClose }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: customer.name,
    mobile: customer.mobile ?? "",
    address: customer.address ?? "",
  });
  const update = useUpdateUdhariCustomer();

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: t("udhari.customer.toast_name_required"), variant: "destructive" });
      return;
    }
    try {
      await update.mutateAsync({
        customerId: customer.id,
        data: { name: form.name.trim(), mobile: form.mobile || null, address: form.address || null },
      });
      qc.invalidateQueries({ queryKey: [`/api/udhari/customers/${customer.id}`] });
      qc.invalidateQueries({ queryKey: ["/api/udhari/customers"] });
      toast({ title: t("udhari.customer.toast_customer_updated") });
      onClose();
    } catch {
      toast({ title: t("udhari.customer.toast_update_fail"), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold" style={{ color: "#0b2c60" }}>
            {t("udhari.customer.edit_customer")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div>
            <Label className="text-xs font-semibold">{t("udhari.name_label")}</Label>
            <Input className="mt-1 h-9 text-sm" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs font-semibold">{t("udhari.mobile_label")}</Label>
            <Input className="mt-1 h-9 text-sm" placeholder={t("common.optional")} value={form.mobile}
              onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs font-semibold">{t("udhari.address_label")}</Label>
            <Textarea className="mt-1 text-sm resize-none" rows={2} value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>{t("common.cancel")}</Button>
          <Button size="sm" disabled={update.isPending} onClick={handleSave}
            style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff" }}>
            {update.isPending ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
