import type { MetadataRoute } from "next";
import { PAGES } from "@/lib/seo";
import { LOCALES, DEFAULT_LOCALE, localePath, siteUrl } from "@/lib/locale";

export const dynamic = "force-static";

/**
 * One entry per page per locale, each carrying the full alternates map so
 * Google pairs the English and Arabic versions instead of ranking them
 * against each other.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const lastModified = new Date();

  const priorities: Record<string, number> = {
    "/": 1,
    "/portfolio": 0.9,
    "/art-house-studio": 0.8,
    "/mahmoud-mekky": 0.7,
  };

  const entries: MetadataRoute.Sitemap = [];

  for (const page of Object.values(PAGES)) {
    const languages: Record<string, string> = {};
    for (const l of LOCALES) {
      languages[l] = `${base}${localePath(l, page.path)}`;
    }
    languages["x-default"] = `${base}${localePath(DEFAULT_LOCALE, page.path)}`;

    for (const locale of LOCALES) {
      entries.push({
        url: `${base}${localePath(locale, page.path)}`,
        lastModified,
        changeFrequency: page.path === "/" ? "weekly" : "monthly",
        priority: priorities[page.path] ?? 0.6,
        alternates: { languages },
      });
    }
  }

  return entries;
}
