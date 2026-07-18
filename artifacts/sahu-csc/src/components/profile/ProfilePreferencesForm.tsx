/**
 * ProfilePreferencesForm — theme, language, and dashboard-layout preferences.
 * Used in both the desktop right-column card and the mobile Preferences tab.
 */
import { type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Globe, LayoutDashboard } from "lucide-react";
import { setLanguage } from "@/lib/i18n";

type PrefsValues = { theme: "light" | "dark"; language: "en" | "hi" | "or"; dashboardLayout: string };

interface Props {
  prefsForm: UseFormReturn<PrefsValues>;
  updatePrefsMut: { isPending: boolean };
  onSavePreferences: React.FormEventHandler<HTMLFormElement>;
  currentLang: { flag: string; name: string };
}

export function ProfilePreferencesForm({ prefsForm, updatePrefsMut, onSavePreferences, currentLang }: Props) {
  const rows = [
    {
      label: "Theme", icon: <Palette size={14} />,
      child: (
        <Select value={prefsForm.watch("theme")} onValueChange={v => prefsForm.setValue("theme", v as "light" | "dark")}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="light">☀️ Light</SelectItem>
            <SelectItem value="dark">🌙 Dark</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      label: "Language", icon: <Globe size={14} />,
      badge: (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
          {currentLang.flag} {currentLang.name}
        </span>
      ),
      child: (
        <Select value={prefsForm.watch("language")} onValueChange={v => { prefsForm.setValue("language", v as "en" | "hi" | "or"); setLanguage(v); }}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="en">🇬🇧 English</SelectItem>
            <SelectItem value="hi">🇮🇳 हिंदी</SelectItem>
            <SelectItem value="or">🇮🇳 ଓଡ଼ିଆ</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      label: "Dashboard", icon: <LayoutDashboard size={14} />,
      child: (
        <Select value={prefsForm.watch("dashboardLayout")} onValueChange={v => prefsForm.setValue("dashboardLayout", v)}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="expanded">Expanded</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <form onSubmit={onSavePreferences} className="space-y-4">
      {rows.map((row, i) => (
        <div key={row.label} className={`flex items-center justify-between ${i < rows.length - 1 ? "pb-4 border-b" : ""}`}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm font-medium">{row.icon}{row.label}</div>
            {row.badge && <div>{row.badge}</div>}
          </div>
          {row.child}
        </div>
      ))}
      <Button type="submit" className="w-full mt-1" disabled={updatePrefsMut.isPending}>
        {updatePrefsMut.isPending ? "Saving…" : "Save Preferences"}
      </Button>
    </form>
  );
}
