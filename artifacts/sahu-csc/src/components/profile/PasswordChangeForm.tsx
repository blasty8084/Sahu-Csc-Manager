import type { FormEventHandler } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/profile/ProfileCards";

interface PasswordFormValues {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

interface PasswordChangeFormProps {
  form: UseFormReturn<PasswordFormValues>;
  isPending: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  /** "mobile" stacks fields; "desktop" puts new/confirm in a 2-column grid */
  layout?: "mobile" | "desktop";
}

export function PasswordChangeForm({
  form,
  isPending,
  onSubmit,
  layout = "mobile",
}: PasswordChangeFormProps) {
  if (layout === "desktop") {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="Current Password">
          <Input type="password" {...form.register("currentPassword")} placeholder="Enter current password" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="New Password">
            <Input type="password" {...form.register("password")} />
          </FormField>
          <FormField label="Confirm Password">
            <Input type="password" {...form.register("confirmPassword")} />
          </FormField>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Changing…" : "Change Password"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <FormField label="Current Password">
        <Input type="password" {...form.register("currentPassword")} />
      </FormField>
      <FormField label="New Password">
        <Input type="password" {...form.register("password")} />
      </FormField>
      <FormField label="Confirm Password">
        <Input type="password" {...form.register("confirmPassword")} />
      </FormField>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Changing…" : "Change Password"}
      </Button>
    </form>
  );
}
