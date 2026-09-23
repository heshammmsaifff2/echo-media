import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { isLocale } from "@/lib/locale";
import { ContactContent } from "@/components/sections/contact";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("contact", isLocale(locale) ? locale : "en");
}

export default function ContactPage() {
  return <ContactContent />;
}
