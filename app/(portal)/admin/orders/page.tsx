import { createClient } from "@/lib/supabase/server";
import { OrdersManager } from "@/components/admin/orders-manager";

type PageProps = {
  searchParams?: Promise<{ client?: string; clientId?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const sp = searchParams ? await searchParams : {};
  const initialClientId = sp?.clientId || sp?.client || "";

  const { data: orders } = await supabase
    .from("client_orders")
    .select("*, profiles!client_orders_client_id_fkey(full_name, email), order_payments(*)")
    .order("created_at", { ascending: false });

  const { data: clients } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "client");

  return (
    <OrdersManager
      initialOrders={orders || []}
      clients={clients || []}
      initialClientId={initialClientId}
    />
  );
}
