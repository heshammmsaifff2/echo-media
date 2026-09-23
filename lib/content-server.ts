import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { SectionRow } from "@/lib/content";

/** All section rows, keyed by slug. Call once per request in a server component. */
export async function getSectionMap(): Promise<Record<string, SectionRow>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("section_content")
    .select("slug, content, bg_type, bg_url, bg_poster_url, bg_public_id");

  const map: Record<string, SectionRow> = {};
  for (const row of (data ?? []) as SectionRow[]) map[row.slug] = row;
  return map;
}
