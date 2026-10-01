import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { pageMetadata } from "@/lib/seo";
import { isLocale } from "@/lib/locale";
import { PortfolioGrid } from "@/components/portfolio-grid";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("work", isLocale(locale) ? locale : "en");
}

export default async function PortfolioPage({ params, searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : undefined;
  const rawCat = typeof sp?.cat === "string" ? sp.cat : typeof sp?.category === "string" ? sp.category : null;

  const supabase = await createClient();
  const [itemsRes, catsRes, subsRes] = await Promise.all([
    supabase.from("portfolio_items").select("*").order("order_index"),
    supabase.from("portfolio_categories").select("*").order("order_index"),
    supabase.from("portfolio_subcategories").select("*").order("order_index"),
  ]);

  const categories = catsRes.data || [];
  let initialCategory: string | null = null;
  if (rawCat) {
    if (rawCat.toLowerCase() === "all") {
      initialCategory = "all";
    } else {
      const found = categories.find(
        (c) =>
          c.id === rawCat ||
          c.name_en.toLowerCase() === rawCat.toLowerCase() ||
          c.name_ar === rawCat
      );
      if (found) initialCategory = found.id;
    }
  }

  return (
    <PortfolioGrid
      items={itemsRes.data || []}
      categories={categories}
      subcategories={subsRes.data || []}
      initialCategory={initialCategory}
    />
  );
}
