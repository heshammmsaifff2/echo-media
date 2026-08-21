import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { pageMetadata } from "@/lib/seo";
import { isLocale } from "@/lib/locale";
import { PortfolioGrid } from "@/components/portfolio-grid";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("work", isLocale(locale) ? locale : "en");
}

export default async function PortfolioPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("portfolio_items")
    .select("*")
    .order("order_index");

  return <PortfolioGrid items={items || []} />;
}
