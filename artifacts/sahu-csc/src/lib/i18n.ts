import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en/translation.json";
import hi from "../locales/hi/translation.json";
import or from "../locales/or/translation.json";

const getSavedLang = (): string => {
  try {
    return localStorage.getItem("sahu-lang") || "en";
  } catch {
    return "en";
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    or: { translation: or },
  },
  lng: getSavedLang(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export function setLanguage(lang: string) {
  i18n.changeLanguage(lang);
  try {
    localStorage.setItem("sahu-lang", lang);
  } catch {}
}

export default i18n;
