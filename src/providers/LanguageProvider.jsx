"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { translations } from "@/constants/translations";

export const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
  toggleLang: () => {},
  t: (text) => text,
});

const STORAGE_KEY = "portfolio-lang";
const SUPPORTED = ["en", "id"];

/**
 * Text keys are the English strings themselves: t("Add Project") returns the Indonesian
 * translation when lang === "id" and falls back to the English key when none exists.
 * Supports {placeholders}: t("Hello {name}", { name: "Reza" }).
 */
export function LanguageProvider({ children }) {
  // Always start with "en" so server HTML and first client render match; the stored
  // preference is applied right after hydration.
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    let stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}
    const initial =
      SUPPORTED.includes(stored) ? stored : navigator.language?.toLowerCase().startsWith("id") ? "id" : "en";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLangState(initial);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    if (!SUPPORTED.includes(next)) return;
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const toggleLang = useCallback(() => setLang(lang === "en" ? "id" : "en"), [lang, setLang]);

  const t = useCallback(
    (text, vars) => {
      let out = (lang !== "en" && translations[lang]?.[text]) || text;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          out = out.replaceAll(`{${k}}`, String(v));
        });
      }
      return out;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, setLang, toggleLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
