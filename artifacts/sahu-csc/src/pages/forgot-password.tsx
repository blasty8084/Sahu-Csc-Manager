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
import { ArrowLeft, Copy, CheckCircle2, Clock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  identifier: z.string().min(1, "Enter your username, email, or mobile"),
});

export default function ForgotPassword() {
  const { toast } = useToast();
  const [resetInfo, setResetInfo] = useState<{ resetUrl: string; expiresAt: string } | null>(null);
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
      setResetInfo({ resetUrl: data.resetUrl, expiresAt: data.expiresAt });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const copyLink = async () => {
    if (!resetInfo) return;
    await navigator.clipboard.writeText(resetInfo.resetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!" });
  };

  const expiryDisplay = resetInfo
    ? new Date(resetInfo.expiresAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
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
            <CardTitle className="text-xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your username, email, or mobile to get a reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!resetInfo ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username, Email or Mobile</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your identifier" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Generating link..." : "Get Reset Link"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-emerald-800 dark:text-emerald-300">
                    Reset link generated successfully.
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Expires at {expiryDisplay} (1 hour)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted border text-xs font-mono break-all leading-relaxed">
                    {resetInfo.resetUrl}
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={copyLink}>
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy Reset Link"}
                  </Button>
                </div>

                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                  <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                    <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Share this link with the user or open it directly to reset the password.
                      The link works only once and expires in 1 hour.
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setResetInfo(null); form.reset(); }}
                >
                  Generate another link
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
