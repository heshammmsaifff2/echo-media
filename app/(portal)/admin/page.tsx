import { createClient } from "@/lib/supabase/server";
import { AdminStats } from "@/components/admin/admin-stats";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [portfolioRes, ordersRes, clientsRes] = await Promise.all([
    supabase.from("portfolio_items").select("id", { count: "exact", head: true }),
    supabase.from("client_orders").select("id, total_amount, deposit_paid, payment_status", { count: "exact" }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "client"),
  ]);

  const totalRevenue = (ordersRes.data || []).reduce((sum, o) => sum + Number(o.total_amount), 0);
  const pendingReceipts = (ordersRes.data || []).filter((o) => o.payment_status === "receipt_uploaded").length;

  return (
    <AdminStats
      stats={{
        portfolioCount: portfolioRes.count || 0,
        ordersCount: ordersRes.count || 0,
        clientsCount: clientsRes.count || 0,
        totalRevenue,
        pendingReceipts,
      }}
    />
  );
}
