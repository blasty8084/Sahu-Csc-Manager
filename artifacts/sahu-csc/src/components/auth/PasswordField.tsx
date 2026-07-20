import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock } from "lucide-react";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginFormValues } from "./loginTypes";

interface PasswordFieldProps {
  form: ReturnType<typeof useForm<LoginFormValues>>;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
}

export function PasswordField({ form, showPassword, setShowPassword }: PasswordFieldProps) {
  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <FormControl>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-10 pr-11 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all"
                {...field}
              />
            </FormControl>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
