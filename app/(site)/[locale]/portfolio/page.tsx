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
  const [itemsRes, catsRes, subsRes] = await Promise.all([
    supabase.from("portfolio_items").select("*").order("order_index"),
    supabase.from("portfolio_categories").select("*").order("order_index"),
    supabase.from("portfolio_subcategories").select("*").order("order_index"),
  ]);

  return (
    <PortfolioGrid
      items={itemsRes.data || []}
      categories={catsRes.data || []}
      subcategories={subsRes.data || []}
    />
  );
}
