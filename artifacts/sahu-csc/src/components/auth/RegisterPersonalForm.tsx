/**
 * RegisterPersonalForm — username, full name, email, and mobile fields.
 * Must be rendered inside a shadcn <Form> wrapper.
 */
import { type UseFormReturn } from "react-hook-form";
import { Mail, Smartphone, User } from "lucide-react";
import {
  FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { RegisterFormValues } from "./registerTypes";

interface Props {
  form: UseFormReturn<RegisterFormValues>;
}

export function RegisterPersonalForm({ form }: Props) {
  return (
    <>
      <FormField control={form.control} name="username" render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-semibold text-gray-600">Username *</FormLabel>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <FormControl>
              <Input placeholder="e.g. sahu_csc" className="pl-10 h-11 border-gray-200 bg-white" {...field} />
            </FormControl>
          </div>
          <FormMessage className="text-xs" />
        </FormItem>
      )} />

      <FormField control={form.control} name="fullName" render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-semibold text-gray-600">Full Name</FormLabel>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <FormControl>
              <Input placeholder="Your full name" className="pl-10 h-11 border-gray-200 bg-white" {...field} />
            </FormControl>
          </div>
          <FormMessage className="text-xs" />
        </FormItem>
      )} />

      <FormField control={form.control} name="email" render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-semibold text-gray-600">
            Email * <span className="text-gray-400 font-normal">(OTP will be sent here)</span>
          </FormLabel>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <FormControl>
              <Input type="email" placeholder="you@example.com" className="pl-10 h-11 border-gray-200 bg-white" {...field} />
            </FormControl>
          </div>
          <FormMessage className="text-xs" />
        </FormItem>
      )} />

      <FormField control={form.control} name="mobile" render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-semibold text-gray-600">Mobile Number</FormLabel>
          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <FormControl>
              <Input
                type="tel"
                placeholder="10-digit mobile (optional)"
                className="pl-10 h-11 border-gray-200 bg-white"
                maxLength={10}
                {...field}
              />
            </FormControl>
          </div>
          <FormMessage className="text-xs" />
        </FormItem>
      )} />
    </>
  );
}
