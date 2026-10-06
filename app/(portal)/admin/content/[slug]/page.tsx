import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SECTIONS, type SectionRow } from "@/lib/content";
import { ContentManager } from "@/components/admin/content-manager";

export const dynamic = "force-dynamic";

export default async function EditContentPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  if (!SECTIONS.some((section) => section.slug === slug)) notFound();
  const supabase = await createClient();
  const { data, error } = await supabase.from("section_content")
    .select("slug, content, bg_type, bg_url, bg_poster_url, bg_public_id")
    .eq("slug", slug).maybeSingle();
  if (error) throw new Error("Unable to load section content");
  return <ContentManager key={slug} editingSlug={slug} initialRows={data ? { [slug]: data as SectionRow } : {}} />;
}
