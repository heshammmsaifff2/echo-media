import { createClient } from "@/lib/supabase/server";
import { ClientsList } from "@/components/admin/clients-list";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("profiles")
    .select("id, full_name, email, username, role, created_at")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  return <ClientsList clients={clients || []} />;
}
