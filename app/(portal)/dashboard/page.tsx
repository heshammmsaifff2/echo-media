import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { ClientDashboard } from "@/components/client/dashboard";

export const metadata = {
  title: "Dashboard — echo",
};

export default async function DashboardPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("client_orders")
    .select("*, order_payments(*)")
    .eq("client_id", profile!.id)
    .order("created_at", { ascending: false });

  return <ClientDashboard orders={orders || []} profile={profile!} />;
}
