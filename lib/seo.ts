import type { Metadata } from "next";
import {
  type Locale,
  LOCALES,
  DEFAULT_LOCALE,
  OG_LOCALE,
  localePath,
  siteUrl,
} from "@/lib/locale";
import { brand, contact } from "@/lib/brand";

/**
 * Per-page, per-locale search metadata.
 *
 * Titles are written to stand alone in a results page — the brand name is
 * appended by `pageMetadata`, so don't repeat it here. Descriptions are aimed
 * at roughly 150–160 characters, which is what Google typically renders.
 */
type SeoEntry = {
  /** Path without the locale prefix. "/" is the home page. */
  path: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  keywords?: Record<Locale, string[]>;
};

export const PAGES = {
  home: {
    path: "/",
    title: {
      en: "Creative Production House",
      ar: "بيت إنتاج إبداعي",
    },
    description: {
      en: "We don't create videos. We build visual experiences that move people and grow brands. Brand films, commercials, and podcast production.",
      ar: "إحنا مبنعملش فيديوهات. نصنع تجارب بصرية تحرّك الناس وتُنمّي العلامات التجارية. أفلام العلامات والإعلانات وإنتاج البودكاست.",
    },
    keywords: {
      en: [
        "creative production house",
        "brand film production",
        "commercial video production",
        "podcast production",
        "cinematic advertising",
        "video production company",
      ],
      ar: [
        "بيت إنتاج إبداعي",
        "إنتاج أفلام العلامات التجارية",
        "شركة إنتاج فيديو",
        "إنتاج بودكاست",
        "إعلانات سينمائية",
      ],
    },
  },
  work: {
    path: "/portfolio",
    title: { en: "Work", ar: "أعمالنا" },
    description: {
      en: "Selected work from Echo Media Production — brand films, commercials, social content, and podcasts made for brands with something worth saying.",
      ar: "مختارات من أعمال Echo Media Production — أفلام العلامات والإعلانات ومحتوى السوشيال والبودكاست لعلامات لديها ما يستحق أن يُقال.",
    },
    keywords: {
      en: ["video production portfolio", "brand film showreel", "commercial reel"],
      ar: ["أعمال إنتاج الفيديو", "شوريل أفلام العلامات", "إعلانات تجارية"],
    },
  },
  studio: {
    path: "/art-house-studio",
    title: { en: "Art House Studio", ar: "استوديو آرت هاوس" },
    description: {
      en: "A fully equipped production studio — cinema cameras, controlled lighting, a treated sound room, and an edit suite. Available to rent by the day.",
      ar: "استوديو إنتاج مجهّز بالكامل — كاميرات سينمائية وإضاءة محكومة وغرفة صوت معالَجة وجناح مونتاج. متاح للإيجار باليوم.",
    },
    keywords: {
      en: ["studio rental", "podcast studio", "photography studio rental", "video set hire"],
      ar: ["تأجير استوديو", "استوديو بودكاست", "استوديو تصوير", "بلاتوه تصوير"],
    },
  },
  founder: {
    path: "/mahmoud-mekky",
    title: { en: "Mahmoud Mekky", ar: "محمود مكي" },
    description: {
      en: "Founder and Creative Director of Echo Media Production. A decade of commercial filmmaking, podcast production, and creative direction across the region.",
      ar: "مؤسس ومدير إبداعي لـ Echo Media Production. عقد من صناعة الأفلام التجارية وإنتاج البودكاست والإدارة الإبداعية في المنطقة.",
    },
    keywords: {
      en: ["Mahmoud Mekky", "creative director", "commercial film director", "brand film director"],
      ar: ["محمود مكي", "مدير إبداعي", "مخرج إعلانات", "مخرج أفلام تجارية"],
    },
  },
} satisfies Record<string, SeoEntry>;

export type PageKey = keyof typeof PAGES;

/**
 * Build a page's Metadata, including the canonical URL and the hreflang map.
 *
 * Every localized page must advertise every other locale of the same page plus
 * an x-default, or search engines treat the two language versions as unrelated
 * pages competing with each other.
 */
export function pageMetadata(key: PageKey, locale: Locale): Metadata {
  const page = PAGES[key];
  const base = siteUrl();
  const canonical = `${base}${localePath(locale, page.path)}`;

  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[l] = `${base}${localePath(l, page.path)}`;
  }
  languages["x-default"] = `${base}${localePath(DEFAULT_LOCALE, page.path)}`;

  const title = page.title[locale];
  const description = page.description[locale];

  return {
    title,
    description,
    keywords: page.keywords?.[locale],
    alternates: { canonical, languages },
    openGraph: {
      type: "website",
      siteName: brand.name,
      title: `${title} — ${brand.name}`,
      description,
      url: canonical,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${brand.name}`,
      description,
    },
  };
}

/**
 * Organization JSON-LD for the home page.
 *
 * Deliberately `Organization` rather than `LocalBusiness`: LocalBusiness
 * requires a street address and is built around a single physical premises,
 * which is not how this company presents itself. Address, location, and map
 * fields are optional throughout and are only emitted if filled in
 * content/contact.json.
 */
export function organizationJsonLd(locale: Locale) {
  const base = siteUrl();

  const address = contact.address?.[locale]?.trim();
  const locality = contact.location?.[locale]?.trim();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: brand.name,
    alternateName: brand.shortName,
    url: `${base}${localePath(locale, "/")}`,
    email: contact.email,
    telephone: contact.phones.map((p) => p.number),
    description: PAGES.home.description[locale],
    slogan: brand.motto,
    knowsLanguage: ["en", "ar"],
    sameAs: contact.social.map((s) => s.url),

    // Only present once a real address is supplied.
    ...(address || locality
      ? {
          address: {
            "@type": "PostalAddress",
            ...(address ? { streetAddress: address } : {}),
            ...(locality ? { addressLocality: locality } : {}),
          },
        }
      : {}),
    ...(contact.mapUrl?.trim() ? { hasMap: contact.mapUrl } : {}),

    makesOffer: [
      "Brand Film Production",
      "Commercial Production",
      "Podcast Production",
      "Studio Rental",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  };
}
