import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

export default function Settings() {
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const qc = useQueryClient();
  const { data: settings, isLoading } = useGetSettings();
  const updateMut = useUpdateSettings();

  const form = useForm({
    defaultValues: {
      businessName: "", businessAddress: "", businessMobile: "", businessEmail: "",
      language: "en", theme: "light", currency: "INR", autoBackup: false,
      backupFrequencyDays: 7,
    }
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        businessName: settings.businessName,
        businessAddress: settings.businessAddress,
        businessMobile: settings.businessMobile,
        businessEmail: settings.businessEmail ?? "",
        language: settings.language,
        theme: settings.theme,
        currency: settings.currency,
        autoBackup: settings.autoBackup,
        backupFrequencyDays: settings.backupFrequencyDays,
      });
    }
  }, [settings]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateMut.mutateAsync({ data: values as any });
      qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      setTheme(values.theme as "light" | "dark");
      toast({ title: "Settings saved successfully" });
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
  });

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <h2 className="text-xl font-bold">System Settings</h2>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Business Info */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Business Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Business Name</Label>
                  <Input {...form.register("businessName")} data-testid="input-business-name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input {...form.register("businessAddress")} data-testid="input-business-address" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Mobile</Label>
                    <Input {...form.register("businessMobile")} data-testid="input-business-mobile" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input type="email" {...form.register("businessEmail")} data-testid="input-business-email" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Language</Label>
                    <Select value={form.watch("language")} onValueChange={(v) => form.setValue("language", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="or">Odia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Theme</Label>
                    <Select value={form.watch("theme")} onValueChange={(v) => form.setValue("theme", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Currency</Label>
                    <Select value={form.watch("currency")} onValueChange={(v) => form.setValue("currency", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backup Settings */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Backup Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.watch("autoBackup")}
                    onCheckedChange={(v) => form.setValue("autoBackup", v)}
                    id="auto-backup"
                    data-testid="switch-auto-backup"
                  />
                  <Label htmlFor="auto-backup">Enable automatic backups</Label>
                </div>
                {form.watch("autoBackup") && (
                  <div className="space-y-1.5">
                    <Label>Backup frequency (days)</Label>
                    <Input type="number" min={1} max={30} {...form.register("backupFrequencyDays", { valueAsNumber: true })} className="w-24" data-testid="input-backup-freq" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Button type="submit" disabled={updateMut.isPending} data-testid="button-save-settings">
              {updateMut.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        )}
      </div>
    </Layout>
  );
}
