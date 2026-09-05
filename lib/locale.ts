/** Route-level locale handling. The URL is the source of truth: /en/... and /ar/... */

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ar";

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** BCP-47 tags for <html lang> and og:locale. */
export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  ar: "ar",
};

export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  ar: "ar_EG",
};

/** Prefix an app-internal path with the locale segment. */
export function localePath(locale: Locale, path: string): string {
  if (!path.startsWith("/")) return path;
  const clean = path === "/" ? "" : path;
  return `/${locale}${clean}`;
}

/**
 * Swap the locale on the current path, keeping the rest intact.
 * Paths outside the localized tree (/auth, /admin, …) are returned unchanged.
 */
export function switchLocalePath(pathname: string, next: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${next}`;
  if (isLocale(segments[0])) {
    segments[0] = next;
    return `/${segments.join("/")}`;
  }
  return pathname;
}

/** The public site's canonical origin, used for canonical/alternate/sitemap URLs. */
export function siteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "");
  return (fromEnv || "http://localhost:3000").replace(/\/$/, "");
}
