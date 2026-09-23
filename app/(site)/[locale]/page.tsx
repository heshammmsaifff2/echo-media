import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { pageMetadata, organizationJsonLd } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/locale";
import { HeroSection } from "@/components/sections/hero";
import { LogoMoment } from "@/components/sections/logo-moment";
import { ShowreelSection, FilmSection } from "@/components/sections/showreel";
import { FeaturedWork } from "@/components/sections/featured-work";
import { ClientsSection } from "@/components/sections/process";
import { GoalSection, CtaSection } from "@/components/sections/closing";
import { FullPage } from "@/components/full-page";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("home", isLocale(locale) ? locale : "en");
}

export default async function Home({ params }: Params) {
  const { locale } = await params;
  const typed: Locale = isLocale(locale) ? locale : "en";

  const supabase = await createClient();
  const { data: featured } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("is_featured", true)
    .order("order_index")
    .limit(6);

  return (
    <>
      {/* Structured data: tells search engines what this business is and where. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd(typed)),
        }}
      />

      <FullPage>
        <HeroSection />
        <FilmSection />
        <ShowreelSection />
        <LogoMoment />
        <ClientsSection />
        <GoalSection />
        <CtaSection />
      </FullPage>

      <FeaturedWork items={featured || []} />
    </>
  );
}
