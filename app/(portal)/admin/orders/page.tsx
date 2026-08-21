import { createClient } from "@/lib/supabase/server";
import { OrdersManager } from "@/components/admin/orders-manager";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("client_orders")
    .select("*, profiles!client_orders_client_id_fkey(full_name, email)")
    .order("created_at", { ascending: false });

  const { data: clients } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "client");

  return <OrdersManager initialOrders={orders || []} clients={clients || []} />;
}
