import { createClient } from "@/lib/supabase/server";
import { PortfolioManager } from "@/components/admin/portfolio-manager";
import { CategoriesManager, type Category, type Subcategory } from "@/components/admin/categories-manager";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const supabase = await createClient();

  const [itemsRes, catsRes, subsRes] = await Promise.all([
    supabase.from("portfolio_items").select("*").order("order_index"),
    supabase.from("portfolio_categories").select("*").order("order_index"),
    supabase.from("portfolio_subcategories").select("*").order("order_index"),
  ]);

  const categories = (catsRes.data ?? []) as Category[];
  const subcategories = (subsRes.data ?? []) as Subcategory[];

  return (
    <>
      <CategoriesManager categories={categories} subcategories={subcategories} />
      <PortfolioManager
        initialItems={itemsRes.data || []}
        categories={categories}
        subcategories={subcategories}
      />
    </>
  );
}
