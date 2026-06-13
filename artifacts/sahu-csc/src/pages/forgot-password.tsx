import React, { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginLogo } from "@/components/app-logo";
import { ArrowLeft, Copy, CheckCircle2, Clock, RefreshCw, Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  identifier: z.string().min(1, "Enter username, email, or mobile"),
});

export default function ForgotPassword() {
  const { toast } = useToast();
  const [otpInfo, setOtpInfo] = useState<{
    otp: string;
    username: string;
    expiresAt: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      if (!data.otp) {
        toast({ title: "Not found", description: "No active account found for that identifier.", variant: "destructive" });
        return;
      }
      setOtpInfo({ otp: data.otp, username: data.username, expiresAt: data.expiresAt });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const copyOtp = async () => {
    if (!otpInfo) return;
    await navigator.clipboard.writeText(otpInfo.otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "OTP copied!" });
  };

  const expiryDisplay = otpInfo
    ? new Date(otpInfo.expiresAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "";

  const handleReset = () => {
    setOtpInfo(null);
    form.reset();
    setCopied(false);
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: "#0B1340" }}>
      {/* Compact navy header */}
      <div className="flex-shrink-0 pt-6 px-6 pb-4 flex flex-col items-center text-center">
        <LoginLogo size={56} />
        <div className="mt-2.5">
          <h1 className="text-xl font-black">
            <span className="text-white">SAHU </span>
            <span style={{ color: "#F97316" }}>CSC</span>
          </h1>
          <p className="text-white/50 text-xs">Password Recovery</p>
        </div>
      </div>

      {/* White card — fills remaining height */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex-1 bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6">
          {/* Card header */}
          <div className="flex flex-col items-center mb-5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
              style={{ background: "#FEE4D8" }}
            >
              <User className="w-5 h-5" style={{ color: "#F97316" }} />
            </div>
            <h2 className="text-gray-900 font-bold text-lg mt-2">
              {otpInfo ? "OTP Generated" : "Forgot Password"}
            </h2>
            <p className="text-gray-500 text-xs mt-0.5 text-center max-w-xs">
              {otpInfo
                ? "Share this OTP with the user to reset their password"
                : "Enter the account identifier to generate a one-time password"}
            </p>
          </div>

          {!otpInfo ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <FormControl>
                          <Input
                            placeholder="Username, Email or Mobile"
                            className="pl-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400"
                            autoFocus
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="w-full h-11 font-bold text-white border-0"
                    style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}
                  >
                    {form.formState.isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating OTP…
                      </span>
                    ) : "Generate OTP"}
                  </Button>
                </motion.div>

                <div className="text-center pt-1">
                  <Link href="/login">
                    <button type="button" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to login
                    </button>
                  </Link>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              {/* Account info */}
              <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm flex justify-between items-center">
                <span className="text-gray-500">Account</span>
                <span className="font-semibold text-gray-900">{otpInfo.username}</span>
              </div>

              {/* OTP display */}
              <div
                className="rounded-xl border-2 p-5 text-center space-y-3"
                style={{ borderColor: "rgba(249,115,22,0.25)", background: "rgba(249,115,22,0.04)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">One-Time Password</p>
                <div className="flex justify-center gap-2">
                  {otpInfo.otp.split("").map((digit, i) => (
                    <span
                      key={i}
                      className="w-10 h-12 flex items-center justify-center text-2xl font-bold bg-white border-2 border-gray-200 rounded-lg shadow-sm text-gray-900"
                    >
                      {digit}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expires at {expiryDisplay} · valid 15 minutes</span>
                </div>
              </div>

              {/* Copy button */}
              <Button
                variant="outline"
                className="w-full gap-2 h-11 border-gray-200"
                onClick={copyOtp}
              >
                {copied
                  ? <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Copied!</>
                  : <><Copy className="w-4 h-4" /> Copy OTP</>}
              </Button>

              {/* Instructions */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
                <p className="text-xs text-blue-800 leading-relaxed">
                  Share this 6-digit OTP with <strong>{otpInfo.username}</strong> via WhatsApp or verbally.
                  They enter it on the Reset Password page along with their new password. Works only once.
                </p>
              </div>

              {/* Go to reset page */}
              <Link href="/reset-password">
                <Button
                  className="w-full h-11 font-bold text-white border-0"
                  style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}
                >
                  Go to Reset Password →
                </Button>
              </Link>

              {/* Generate new */}
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors py-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Generate for a different user
              </button>

              <div className="text-center">
                <Link href="/login">
                  <button type="button" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to login
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
