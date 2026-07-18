/**
 * ProfileBusinessForm — business name, address, mobile, email, website fields.
 * Admin-only. Used in both the desktop right-column card and the mobile Business tab.
 */
import { type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function ProfileBusinessForm({ settingsForm, updateSettingsMut, onSaveSettings }: Props) {
  return (
    <form onSubmit={onSaveSettings} className="space-y-3">
      <FormField label="Business Name"><Input {...settingsForm.register("businessName")} /></FormField>
      <FormField label="Website"><Input {...settingsForm.register("businessWebsite")} placeholder="e.g. sahucsc.in" /></FormField>
      <FormField label="Mobile"><Input {...settingsForm.register("businessMobile")} /></FormField>
      <FormField label="Email"><Input type="email" {...settingsForm.register("businessEmail")} /></FormField>
      <FormField label="Address"><Input {...settingsForm.register("businessAddress")} /></FormField>
      <Button type="submit" className="w-full mt-1" disabled={updateSettingsMut.isPending}>
        {updateSettingsMut.isPending ? "Saving…" : "Save Business Info"}
      </Button>
    </form>
  );
}
