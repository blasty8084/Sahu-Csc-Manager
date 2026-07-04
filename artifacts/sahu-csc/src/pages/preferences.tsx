import { useTranslation } from "react-i18next";
import { useGetPreferences, useUpdatePreferences, getGetPreferencesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PreferencesSkeleton } from "@/components/skeletons";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Palette, Globe, LayoutDashboard } from "lucide-react";

export default function Preferences() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const qc = useQueryClient();
  const { data: prefs, isLoading } = useGetPreferences();
  const updateMut = useUpdatePreferences();

  const form = useForm({
    defaultValues: {
      theme: "light" as "light" | "dark",
      language: "en" as "en" | "hi" | "or",
      dashboardLayout: "default",
    }
  });

  useEffect(() => {
    if (prefs) {
      form.reset({
        theme: prefs.theme,
        language: prefs.language,
        dashboardLayout: prefs.dashboardLayout,
      });
    }
  }, [prefs]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateMut.mutateAsync({ data: values });
      qc.invalidateQueries({ queryKey: getGetPreferencesQueryKey() });
      setTheme(values.theme);
      toast.success(t("profile.toast_prefs_saved"));
    } catch {
      toast({ title: t("profile.save_preferences"), variant: "destructive" });
    }
  });

  return (
    <Layout>
      <div className="space-y-6 max-w-xl">
        <div>
          <h2 className="text-xl font-bold">{t("profile.preferences")}</h2>
          <p className="text-sm text-muted-foreground">{t("profile.language_hint")}</p>
        </div>

        {isLoading ? (
          <PreferencesSkeleton />
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Theme */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette size={16} /> Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Theme</Label>
                    <p className="text-xs text-muted-foreground">Choose your preferred colour scheme</p>
                  </div>
                  <Select
                    value={form.watch("theme")}
                    onValueChange={(v) => form.setValue("theme", v as "light" | "dark")}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">☀️ Light</SelectItem>
                      <SelectItem value="dark">🌙 Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Language */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe size={16} /> {t("profile.language")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">{t("profile.language")}</Label>
                    <p className="text-xs text-muted-foreground">{t("profile.language_hint")}</p>
                  </div>
                  <Select
                    value={form.watch("language")}
                    onValueChange={(v) => form.setValue("language", v as "en" | "hi" | "or")}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                      <SelectItem value="hi">🇮🇳 हिंदी</SelectItem>
                      <SelectItem value="or">🇮🇳 ଓଡ଼ିଆ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Layout */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <LayoutDashboard size={16} /> Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Layout</Label>
                    <p className="text-xs text-muted-foreground">Choose how your dashboard is arranged</p>
                  </div>
                  <Select
                    value={form.watch("dashboardLayout")}
                    onValueChange={(v) => form.setValue("dashboardLayout", v)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="expanded">Expanded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={updateMut.isPending}>
              {updateMut.isPending ? t("common.saving") : t("profile.save_preferences")}
            </Button>
          </form>
        )}
      </div>
    </Layout>
  );
}
