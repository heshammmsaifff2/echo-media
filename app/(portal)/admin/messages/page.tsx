import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MessagesList, type ContactMessage } from "@/components/admin/messages-list";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_submissions")
    .select("id, name, email, phone, message, is_read, created_at")
    .order("created_at", { ascending: false });

  return <MessagesList initial={(data ?? []) as ContactMessage[]} />;
}
