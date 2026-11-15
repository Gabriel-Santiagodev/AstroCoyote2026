// Owner: Leonardo — Lightweight UI language switch (English default, Spanish optional).
// No dependencies: `t("English text")` returns the Spanish string when the player picked Spanish
// and a translation exists, otherwise the English text (safe fallback). English stays the default
// because the game is judged globally in English (docs/03, decision A4 amendment 2026-11-15).
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode, type RefObject } from "react";
import { ES } from "./es";
import { ES_MINIGAME_PATTERNS, ES_MINIGAMES } from "./es_minigames";
import { ES_PATTERNS, ES_SERVER } from "./es_server";

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

/**
 * Translate text that arrives from the server in English (logbook, events, report causes, tips,
 * crew summaries). Exact matches first, then " — " joined pairs, then sentence patterns.
 */
export function ts(text: string | null | undefined): string {
  if (!text) return text ?? "";
  if (currentLang !== "es") return text;
  const exact = ES_SERVER[text] ?? ES[text];
  if (exact) return exact;
  const TIMEOUT_PREFIX = "Auto-Safe Timeout: ";
  if (text.startsWith(TIMEOUT_PREFIX)) return "Tiempo agotado (opción segura): " + ts(text.slice(TIMEOUT_PREFIX.length));
  if (text.includes(" — ")) return text.split(" — ").map((part) => ts(part)).join(" — ");
  let out = text;
  for (const [pattern, replacement] of ES_PATTERNS) out = out.replace(pattern, replacement);
  return out;
}

function screenLookup(text: string): string | null {
  const exact = ES_MINIGAMES[text] ?? ES[text] ?? ES_SERVER[text];
  if (exact) return exact;
  for (const [pattern, replacement] of ES_MINIGAME_PATTERNS) {
    if (pattern.test(text)) {
      const out = text.replace(pattern, replacement);
      // "{x} anyway": translate the inner label too when we know it.
      const inner = out.replace(/ de todos modos$/, "");
      const innerEs = ES_MINIGAMES[inner] ?? ES[inner];
      return innerEs ? `${innerEs} de todos modos` : out;
    }
  }
  return null;
}

const SCREEN_ATTRS = ["title", "aria-label", "placeholder"];

/**
 * Translate the text a subtree renders (minigames) without touching its source: text nodes and
 * title / aria-label / placeholder are swapped for their Spanish version while Spanish is on.
 * React keeps working: it overwrites the node on its next update and the observer re-translates.
 */
export function useScreenTranslation(ref: RefObject<HTMLElement>): void {
  const { lang } = useContext(I18nContext);
  useEffect(() => {
    const root = ref.current;
    if (!root || lang !== "es") return undefined;
    const translateText = (node: Text) => {
      const raw = node.nodeValue ?? "";
      const trimmed = raw.replace(/\s+/g, " ").trim();
      if (!trimmed || !/[A-Za-z]/.test(trimmed)) return;
      const es = screenLookup(trimmed);
      if (es && es !== trimmed) {
        const lead = raw.match(/^\s*/)?.[0] ?? "";
        const trail = raw.match(/\s*$/)?.[0] ?? "";
        node.nodeValue = lead + es + trail;
      }
    };
    const translateAttrs = (el: Element) => {
      for (const attr of SCREEN_ATTRS) {
        const value = el.getAttribute(attr);
        if (!value) continue;
        const es = screenLookup(value.trim());
        if (es && es !== value) el.setAttribute(attr, es);
      }
    };
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        translateText(node as Text);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      translateAttrs(node as Element);
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      let current = walker.nextNode();
      while (current) {
        if (current.nodeType === Node.TEXT_NODE) translateText(current as Text);
        else translateAttrs(current as Element);
        current = walker.nextNode();
      }
    };
    walk(root);
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "characterData") translateText(m.target as Text);
        else if (m.type === "attributes") translateAttrs(m.target as Element);
        else m.addedNodes.forEach(walk);
      }
    });
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: SCREEN_ATTRS,
    });
    return () => observer.disconnect();
  }, [ref, lang]);
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
