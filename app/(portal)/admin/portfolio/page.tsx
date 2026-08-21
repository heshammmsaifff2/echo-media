import { createClient } from "@/lib/supabase/server";
import { PortfolioManager } from "@/components/admin/portfolio-manager";

export default async function AdminPortfolioPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("portfolio_items")
    .select("*")
    .order("order_index");

  return <PortfolioManager initialItems={items || []} />;
}
