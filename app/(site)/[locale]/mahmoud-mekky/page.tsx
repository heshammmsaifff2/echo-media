import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { isLocale, siteUrl, localePath, type Locale } from "@/lib/locale";
import { brand, founder } from "@/lib/brand";
import { MahmoudContent } from "@/components/sections/mahmoud";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("founder", isLocale(locale) ? locale : "en");
}

/** Person markup so search engines connect the founder to the company. */
function personJsonLd(locale: Locale) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: founder.name[locale],
    jobTitle: founder.role[locale],
    description: founder.bio[locale],
    url: `${base}${localePath(locale, "/mahmoud-mekky")}`,
    worksFor: {
      "@type": "Organization",
      name: brand.name,
      "@id": `${base}/#organization`,
    },
  };
}

export default async function MahmoudMekkyPage({ params }: Params) {
  const { locale } = await params;
  const typed: Locale = isLocale(locale) ? locale : "en";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(typed)) }}
      />
      <MahmoudContent />
    </>
  );
}
