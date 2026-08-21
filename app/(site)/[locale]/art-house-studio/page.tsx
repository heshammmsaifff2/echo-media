import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { isLocale } from "@/lib/locale";
import { ArtHouseContent } from "@/components/sections/art-house";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("studio", isLocale(locale) ? locale : "en");
}

export default function ArtHouseStudioPage() {
  return <ArtHouseContent />;
}
