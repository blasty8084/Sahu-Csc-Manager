import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginLogo } from "@/components/app-logo";
import { CheckCircle2, XCircle, ArrowLeft, Eye, EyeOff, Clock } from "lucide-react";

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type TokenStatus = "checking" | "valid" | "invalid" | "expired" | "used";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("checking");
  const [tokenInfo, setTokenInfo] = useState<{ username: string; expiresAt: string } | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);

    if (!t) { setTokenStatus("invalid"); return; }

    fetch(`${import.meta.env.BASE_URL}api/auth/verify-reset-token?token=${t}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setTokenStatus("valid");
          setTokenInfo({ username: data.username, expiresAt: data.expiresAt });
        } else if (data.reason === "expired") {
          setTokenStatus("expired");
        } else if (data.reason === "used") {
          setTokenStatus("used");
        } else {
          setTokenStatus("invalid");
        }
      })
      .catch(() => setTokenStatus("invalid"));
  }, []);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setSuccess(true);
      setTimeout(() => setLocation("/login"), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const expiryDisplay = tokenInfo
    ? new Date(tokenInfo.expiresAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "";

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
            <CardTitle className="text-xl">Reset Password</CardTitle>
            <CardDescription>Set a new password for your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {tokenStatus === "checking" && (
              <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Verifying reset link…</span>
              </div>
            )}

            {(tokenStatus === "invalid" || tokenStatus === "expired" || tokenStatus === "used") && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                      {tokenStatus === "expired" && "Link expired"}
                      {tokenStatus === "used" && "Link already used"}
                      {tokenStatus === "invalid" && "Invalid reset link"}
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-400">
                      {tokenStatus === "expired" && "This reset link has expired. Please request a new one."}
                      {tokenStatus === "used" && "This reset link was already used. Please request a new one."}
                      {tokenStatus === "invalid" && "This reset link is invalid or missing. Please request a new one."}
                    </p>
                  </div>
                </div>
                <Link href="/forgot-password">
                  <Button className="w-full">Request New Reset Link</Button>
                </Link>
              </div>
            )}

            {tokenStatus === "valid" && !success && (
              <div className="space-y-4">
                {tokenInfo && (
                  <div className="p-3 rounded-lg bg-muted/60 border text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account</span>
                      <span className="font-semibold">{tokenInfo.username}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Expires</span>
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {expiryDisplay}
                      </span>
                    </div>
                  </div>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Min 6 characters"
                                {...field}
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword((v) => !v)}
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Re-enter password"
                                {...field}
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowConfirm((v) => !v)}
                              >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Resetting…" : "Reset Password"}
                    </Button>
                  </form>
                </Form>
              </div>
            )}

            {success && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3 py-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  <div className="text-center">
                    <p className="font-semibold text-foreground">Password reset successfully!</p>
                    <p className="text-sm text-muted-foreground mt-1">Redirecting to login in 3 seconds…</p>
                  </div>
                </div>
                <Link href="/login">
                  <Button className="w-full">Go to Login</Button>
                </Link>
              </div>
            )}

            {tokenStatus !== "checking" && !success && (
              <div className="text-center pt-1">
                <Link href="/login">
                  <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to login
                  </button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
