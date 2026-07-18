/**
 * ProfileSystemSettings — system language, theme, currency, auto-backup toggle.
 * Admin-only. Used in both the desktop System card and the mobile System tab
 * (alongside RegistrationControlSection which stays outside this component).
 */
import { type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "./ProfileCards";

type SettingsValues = {
  businessName: string; businessAddress: string; businessMobile: string;
  businessEmail: string; businessWebsite: string;
  language: string; theme: string; currency: string;
  autoBackup: boolean; backupFrequencyDays: number;
};

interface Props {
  settingsForm: UseFormReturn<SettingsValues>;
  updateSettingsMut: { isPending: boolean };
  onSaveSettings: React.FormEventHandler<HTMLFormElement>;
}

export function ProfileSystemSettings({ settingsForm, updateSettingsMut, onSaveSettings }: Props) {
  return (
    <form onSubmit={onSaveSettings} className="space-y-3">
      <FormField label="Language">
        <Select value={settingsForm.watch("language")} onValueChange={v => settingsForm.setValue("language", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="hi">Hindi</SelectItem>
            <SelectItem value="or">Odia</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Theme">
        <Select value={settingsForm.watch("theme")} onValueChange={v => settingsForm.setValue("theme", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Currency">
        <Select value={settingsForm.watch("currency")} onValueChange={v => settingsForm.setValue("currency", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="INR">INR (₹)</SelectItem>
            <SelectItem value="USD">USD ($)</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-sm font-medium">Auto Backup</p>
          <p className="text-xs text-muted-foreground">Scheduled backups</p>
        </div>
        <Switch
          checked={settingsForm.watch("autoBackup")}
          onCheckedChange={v => settingsForm.setValue("autoBackup", v)}
        />
      </div>
      {settingsForm.watch("autoBackup") && (
        <FormField label="Frequency (days)">
          <Input type="number" min={1} max={30}
            {...settingsForm.register("backupFrequencyDays", { valueAsNumber: true })}
            className="w-24" />
        </FormField>
      )}
      <Button type="submit" className="w-full" disabled={updateSettingsMut.isPending}>
        {updateSettingsMut.isPending ? "Saving…" : "Save Settings"}
      </Button>
    </form>
  );
}
