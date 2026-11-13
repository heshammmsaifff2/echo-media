import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { pageMetadata, organizationJsonLd } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/locale";
import { HeroSection } from "@/components/sections/hero";
import { AmbientAurora } from "@/components/ambient-aurora";
import { SpotlightSection } from "@/components/sections/spotlight";
import { ShowreelSection, LightingSection } from "@/components/sections/showreel";
import { FeaturedWork } from "@/components/sections/featured-work";
import { ClientsSection } from "@/components/sections/process";
import { DnaSection } from "@/components/sections/dna";
import { DnaServicesSection } from "@/components/sections/dna-services";
import { CtaSection } from "@/components/sections/closing";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("home", isLocale(locale) ? locale : "en");
}

export default async function Home({ params }: Params) {
  const { locale } = await params;
  const typed: Locale = isLocale(locale) ? locale : "en";

  const supabase = await createClient();
  const [featuredRes, catsRes] = await Promise.all([
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("is_featured", true)
      .order("order_index")
      .limit(6),
    supabase.from("portfolio_categories").select("*").order("order_index"),
  ]);
  const featured = featuredRes.data;

  return (
    <>
      {/* Structured data: tells search engines what this business is and where. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd(typed)),
        }}
      />

      <AmbientAurora />

      <main className="relative isolate flex flex-col w-full">
        <div className="relative w-full transition-transform duration-500 ease-out">
          <HeroSection />
        </div>

        <div className="relative w-full transition-transform duration-500 ease-out">
          <ShowreelSection />
        </div>

        <div className="relative w-full transition-transform duration-500 ease-out">
          <LightingSection />
        </div>

        <div className="relative w-full transition-transform duration-500 ease-out">
          <FeaturedWork items={featured || []} categories={catsRes.data || []} />
        </div>

        <div className="relative w-full transition-transform duration-500 ease-out">
          <SpotlightSection />
        </div>

        <div className="relative w-full transition-transform duration-500 ease-out">
          <DnaServicesSection />
        </div>

        <div className="relative w-full transition-transform duration-500 ease-out">
          <ClientsSection />
        </div>

        <div className="relative w-full transition-transform duration-500 ease-out">
          <DnaSection />
        </div>

        <div className="relative w-full transition-transform duration-500 ease-out">
          <CtaSection />
        </div>
      </main>
    </>
  );
}
