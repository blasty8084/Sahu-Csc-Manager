import { useForm } from "react-hook-form";
import { Smartphone } from "lucide-react";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginFormValues } from "./loginTypes";

interface UsernameFieldProps {
  form: ReturnType<typeof useForm<LoginFormValues>>;
}

export function UsernameField({ form }: UsernameFieldProps) {
  return (
    <FormField
      control={form.control}
      name="identifier"
      render={({ field }) => (
        <FormItem>
          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <FormControl>
              <Input
                placeholder="Mobile / Username / Email"
                className="pl-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all"
                {...field}
              />
            </FormControl>
          </div>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
