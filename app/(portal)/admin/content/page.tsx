import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { SectionRow } from "@/lib/content";
import { ContentManager } from "@/components/admin/content-manager";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data } = await supabase
    .from("section_content")
    .select("slug, content, bg_type, bg_url, bg_poster_url, bg_public_id");

  const rows: Record<string, SectionRow> = {};
  for (const row of (data ?? []) as SectionRow[]) rows[row.slug] = row;

  return <ContentManager initialRows={rows} />;
}
