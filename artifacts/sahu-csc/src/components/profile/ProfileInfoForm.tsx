import type { FormEventHandler } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/profile/ProfileCards";

interface ProfileFormValues {
  fullName: string;
  email: string;
  mobile: string;
  bio: string;
  address: string;
}

interface ProfileInfoFormProps {
  form: UseFormReturn<ProfileFormValues>;
  username: string | undefined;
  isPending: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  /** "mobile" stacks all fields; "desktop" uses a 2-column grid */
  layout?: "mobile" | "desktop";
}

export function ProfileInfoForm({
  form,
  username,
  isPending,
  onSubmit,
  layout = "mobile",
}: ProfileInfoFormProps) {
  if (layout === "desktop") {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Full Name">
            <Input {...form.register("fullName")} placeholder="Your full name" />
          </FormField>
          <FormField label="Username">
            <Input value={username ?? ""} disabled className="bg-muted/50" />
          </FormField>
          <FormField label="Email">
            <Input type="email" {...form.register("email")} />
          </FormField>
          <FormField label="Mobile">
            <Input {...form.register("mobile")} placeholder="+91 XXXXX XXXXX" />
          </FormField>
        </div>
        <FormField label="Address">
          <Input {...form.register("address")} />
        </FormField>
        <FormField label="Bio">
          <Textarea {...form.register("bio")} className="resize-none" rows={2} placeholder="Tell us about yourself..." />
        </FormField>
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <FormField label="Full Name"><Input {...form.register("fullName")} /></FormField>
      <FormField label="Username"><Input value={username ?? ""} disabled className="bg-muted/50" /></FormField>
      <FormField label="Email"><Input type="email" {...form.register("email")} /></FormField>
      <FormField label="Mobile"><Input {...form.register("mobile")} /></FormField>
      <FormField label="Address"><Input {...form.register("address")} /></FormField>
      <FormField label="Bio"><Textarea {...form.register("bio")} className="resize-none" rows={2} /></FormField>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
