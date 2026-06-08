import React, { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginLogo } from "@/components/app-logo";
import { ArrowLeft, Copy, CheckCircle2, Clock, RefreshCw } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <LoginLogo />
          <h1 className="text-3xl font-bold text-foreground">SAHU CSC</h1>
          <p className="text-muted-foreground mt-1">Password Recovery</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-xl">Forgot Password</CardTitle>
            <CardDescription>
              {otpInfo
                ? "Share this OTP with the user to reset their password"
                : "Enter the account identifier to generate a one-time password"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!otpInfo ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username, Email or Mobile</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account identifier" autoFocus {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Generating OTP…" : "Generate OTP"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-5">
                {/* Account info */}
                <div className="rounded-lg bg-muted/60 border px-4 py-3 text-sm flex justify-between items-center">
                  <span className="text-muted-foreground">Account</span>
                  <span className="font-semibold">{otpInfo.username}</span>
                </div>

                {/* OTP display */}
                <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6 text-center space-y-3">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">One-Time Password</p>
                  <div className="flex justify-center gap-2">
                    {otpInfo.otp.split("").map((digit, i) => (
                      <span
                        key={i}
                        className="w-11 h-14 flex items-center justify-center text-3xl font-bold bg-background border-2 border-border rounded-lg shadow-sm text-foreground"
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Expires at {expiryDisplay} · valid for 15 minutes</span>
                  </div>
                </div>

                {/* Copy button */}
                <Button variant="outline" className="w-full gap-2" onClick={copyOtp}>
                  {copied
                    ? <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Copied!</>
                    : <><Copy className="w-4 h-4" /> Copy OTP</>}
                </Button>

                {/* Instructions */}
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-4 py-3">
                  <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                    Share this 6-digit OTP with <strong>{otpInfo.username}</strong> via WhatsApp or verbally.
                    They will enter it on the Reset Password page along with their username and new password.
                    The OTP works only once.
                  </p>
                </div>

                {/* Go to reset page */}
                <Link href="/reset-password">
                  <Button className="w-full gap-2">
                    Go to Reset Password →
                  </Button>
                </Link>

                {/* Generate new */}
                <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground" onClick={handleReset}>
                  <RefreshCw className="w-4 h-4" />
                  Generate for a different user
                </Button>
              </div>
            )}

            <div className="text-center pt-1">
              <Link href="/login">
                <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to login
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
