import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { pageMetadata, organizationJsonLd } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/locale";
import { HeroSection } from "@/components/sections/hero";
import { ManifestoSection } from "@/components/sections/manifesto";
import { LogoMoment } from "@/components/sections/logo-moment";
import { DnaSection, ValuesSection } from "@/components/sections/dna";
import { PositioningSection } from "@/components/sections/positioning";
import { ShowreelSection, FilmSection } from "@/components/sections/showreel";
import { FeaturedWork } from "@/components/sections/featured-work";
import { ServicesSection } from "@/components/sections/services";
import { ArchitectureSection } from "@/components/sections/architecture";
import { ProcessSection, ClientsSection } from "@/components/sections/process";
import { GoalSection, CtaSection } from "@/components/sections/closing";

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

      <HeroSection />
      <FilmSection />
      <ManifestoSection />
      <ShowreelSection />
      <LogoMoment />
      <FeaturedWork items={featured || []} />
      <DnaSection />
      <PositioningSection />
      <ServicesSection />
      <ArchitectureSection />
      <ValuesSection />
      <ProcessSection />
      <ClientsSection />
      <GoalSection />
      <CtaSection />
    </>
  );
}
