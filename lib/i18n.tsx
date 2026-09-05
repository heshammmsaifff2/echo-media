"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { Bi } from "@/lib/brand";
import { type Locale, DEFAULT_LOCALE, isLocale } from "@/lib/locale";

export type { Locale };

type I18nContextType = {
  locale: Locale;
  /** Pick the right side of a bilingual value. */
  pick: <T>(value: { en: T; ar: T }) => T;
  dir: "ltr" | "rtl";
  isAr: boolean;
};

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "echo-locale";

/**
 * Locale provider.
 *
 * On the public site the locale comes from the URL (/en, /ar) and is passed in
 * as `locale` — the server renders the right language, which is what search
 * engines index. The portal (auth, dashboard, admin) has no locale segment, so
 * it omits the prop and falls back to the visitor's last choice.
 */
export function I18nProvider({
  children,
  locale: routeLocale,
}: {
  children: ReactNode;
  locale?: Locale;
}) {
  const [storedLocale, setStoredLocale] = useState<Locale>(DEFAULT_LOCALE);

  // Remember the route locale so the unlocalized portal and proxy can follow it.
  useEffect(() => {
    if (routeLocale) {
      localStorage.setItem(STORAGE_KEY, routeLocale);
      document.cookie = `${STORAGE_KEY}=${routeLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [routeLocale]);

  // Portal only: adopt the remembered choice after mount. Rendering the default
  // first keeps server and client markup identical on the first paint.
  useEffect(() => {
    if (routeLocale) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved ?? undefined)) setStoredLocale(saved as Locale);
  }, [routeLocale]);

  const locale = routeLocale ?? storedLocale;

  // The site tree sets lang/dir on the server; the portal needs it set here.
  useEffect(() => {
    if (routeLocale) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale, routeLocale]);

  const value = useMemo<I18nContextType>(() => {
    const isAr = locale === "ar";
    return {
      locale,
      pick: <T,>(v: { en: T; ar: T }) => (isAr ? v.ar : v.en),
      dir: isAr ? "rtl" : "ltr",
      isAr,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Convenience for components that only need the active string. */
export function useBi() {
  return useI18n().pick as (value: Bi) => string;
}
