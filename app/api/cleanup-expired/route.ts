import { createClient } from "@/lib/supabase/server";
import { cloudinary } from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: expired } = await supabase
    .from("client_orders")
    .select("id, delivery_files, delivery_type")
    .eq("is_confirmed_by_admin", true)
    .eq("delivery_expired", false)
    .not("delivery_unlocked_at", "is", null)
    .lt("delivery_unlocked_at", sevenDaysAgo);

  if (!expired?.length) {
    return NextResponse.json({ cleaned: 0 });
  }

  for (const order of expired) {
    // Clear the record first — the row is the source of truth for the client's view.
    const { error } = await supabase
      .from("client_orders")
      .update({ delivery_files: [], delivery_expired: true })
      .eq("id", order.id);

    if (error) continue;

    // Then reclaim the storage. Google Drive / external links are skipped.
    await deleteFromCloudinary(order.delivery_files || []);
  }

  return NextResponse.json({ cleaned: expired.length });
}

async function deleteFromCloudinary(urls: string[]) {
  const byType = new Map<string, string[]>();

  for (const url of urls) {
    if (typeof url !== "string" || !url.includes("res.cloudinary.com")) continue;
    const match = url.match(
      /res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/
    );
    if (!match) continue;
    if (!byType.has(match[1])) byType.set(match[1], []);
    byType.get(match[1])!.push(match[2]);
  }

  for (const [resourceType, publicIds] of byType) {
    try {
      await cloudinary.api.delete_resources(publicIds, { resource_type: resourceType });
    } catch (err) {
      console.error("Failed to delete expired delivery files:", err);
    }
  }
}
