import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { FinanceDashboard, type FinanceOrder } from "@/components/admin/finance-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data } = await supabase
    .from("client_orders")
    .select(
      "id, project_title, total_amount, created_at, profiles!client_orders_client_id_fkey(full_name, email), order_payments(*)"
    )
    .order("created_at", { ascending: false });

  return <FinanceDashboard orders={(data ?? []) as unknown as FinanceOrder[]} />;
}
