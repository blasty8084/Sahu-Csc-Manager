import { useTranslation } from "react-i18next";
import { setLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
  { code: "or", label: "ଓଡ଼" },
] as const;

type LangCode = (typeof LANGS)[number]["code"];

async function patchLanguagePref(lang: string) {
  try {
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    await fetch(`${base}/api/preferences`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ language: lang }),
    });
  } catch {}
}

interface LanguageSwitcherProps {
  variant?: "sidebar" | "inline";
}

export function LanguageSwitcher({ variant = "inline" }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const current = i18n.language as LangCode;

  const handleChange = (lang: LangCode) => {
    if (lang === current) return;
    setLanguage(lang);
    if (user) patchLanguagePref(lang);
  };

  if (variant === "sidebar") {
    return (
      <div className="flex items-center gap-1 px-1">
        {LANGS.map((lang) => {
          const active = current === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleChange(lang.code)}
              className={`
                flex-1 py-1 rounded-lg text-[11px] font-bold transition-all duration-100
                ${active
                  ? "bg-[#f97316] text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/10"}
              `}
            >
              {lang.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted border border-border">
      {LANGS.map((lang) => {
        const active = current === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={`
              px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-100
              ${active
                ? "bg-[#f97316] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background"}
            `}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
