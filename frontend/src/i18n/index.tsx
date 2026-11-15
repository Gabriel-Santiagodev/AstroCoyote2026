// Owner: Leonardo — Lightweight UI language switch (English default, Spanish optional).
// No dependencies: `t("English text")` returns the Spanish string when the player picked Spanish
// and a translation exists, otherwise the English text (safe fallback). English stays the default
// because the game is judged globally in English (docs/03, decision A4 amendment 2026-11-15).
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { ES } from "./es";

export type Lang = "en" | "es";

const STORAGE_KEY = "astro-squad.lang.v1";

function readStoredLang(): Lang {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "es" ? "es" : "en";
  } catch {
    return "en";
  }
}

let currentLang: Lang = typeof window === "undefined" ? "en" : readStoredLang();

export function getLang(): Lang {
  return currentLang;
}

/** Translate an English UI string; `{name}` placeholders are filled from `vars`. */
export function t(text: string, vars?: Record<string, string | number>): string {
  let out = currentLang === "es" ? ES[text] ?? text : text;
  if (vars) {
    for (const [key, value] of Object.entries(vars)) out = out.split(`{${key}}`).join(String(value));
  }
  return out;
}

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nValue>({ lang: "en", setLang: () => undefined });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(currentLang);

  const setLang = useCallback((next: Lang) => {
    currentLang = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode / blocked storage: the switch still works for this visit.
    }
    document.documentElement.lang = next;
    setLangState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, []);

  return <I18nContext.Provider value={{ lang, setLang }}>{children}</I18nContext.Provider>;
}

/** Components that read `lang` re-render on a switch; App reads it so the whole tree refreshes. */
export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
