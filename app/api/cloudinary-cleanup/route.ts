import { cloudinary } from "@/lib/cloudinary";
import { createClient } from "@/lib/supabase/server";
import { isAdminRequest } from "@/lib/auth";
import { SECTIONS } from "@/lib/content";
import { NextResponse } from "next/server";

const RESOURCE_TYPES = ["image", "video", "raw"] as const;

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const supabase = await createClient();

    const [portfolioRes, ordersRes, sectionsRes, paymentsRes] = await Promise.all([
      supabase.from("portfolio_items").select("media_url, thumbnail_url"),
      supabase.from("client_orders").select("delivery_files, receipt_url"),
      supabase.from("section_content").select("bg_url, bg_poster_url, content"),
      supabase.from("order_payments").select("receipt_url"),
    ]);

    // Bail out rather than risk deleting live media because a query silently failed.
    if (portfolioRes.error || ordersRes.error || sectionsRes.error || paymentsRes.error) {
      return NextResponse.json(
        { error: "Could not read all references — scan aborted for safety" },
        { status: 500 }
      );
    }

    const referencedIds = new Set<string>();
    const addUrl = (url: string | null | undefined) => {
      if (!url || !url.includes("cloudinary.com")) return;
      const variants = extractPublicIdVariants(url);
      variants.forEach((id) => referencedIds.add(id));
    };
    // Walk any JSON value and register every Cloudinary URL string inside it.
    const addFromJson = (v: unknown) => {
      if (typeof v === "string") addUrl(v);
      else if (Array.isArray(v)) v.forEach(addFromJson);
      else if (v && typeof v === "object") Object.values(v as Record<string, unknown>).forEach(addFromJson);
    };

    (portfolioRes.data || []).forEach((item) => {
      addUrl(item.media_url);
      addUrl(item.thumbnail_url);
    });

    (ordersRes.data || []).forEach((order) => {
      addUrl(order.receipt_url);
      (order.delivery_files || []).forEach(addUrl);
    });

    // Editable section backgrounds/posters, in-content media, and receipts.
    (sectionsRes.data || []).forEach((s) => {
      addUrl(s.bg_url);
      addUrl(s.bg_poster_url);
      addFromJson((s as { content?: unknown }).content);
    });
    (paymentsRes.data || []).forEach((p) => addUrl(p.receipt_url));

    // Code defaults from the section registry — media referenced only via a
    // fallback (not stored in the DB) must never be treated as orphaned.
    for (const def of SECTIONS) {
      addUrl(def.defaultBg?.url);
      addUrl(def.defaultBg?.poster);
      for (const f of def.fields) {
        if (typeof f.def === "string") addUrl(f.def);
      }
    }

    const orphaned: { public_id: string; url: string; type: string }[] = [];

    for (const resourceType of RESOURCE_TYPES) {
      let nextCursor: string | undefined;

      do {
        // Scan ALL resources in the Cloudinary account (including root & samples folders)
        const result: {
          resources: { public_id: string; secure_url: string; resource_type: string }[];
          next_cursor?: string;
        } = await cloudinary.api.resources({
          type: "upload",
          resource_type: resourceType,
          max_results: 500,
          next_cursor: nextCursor,
        });

        for (const resource of result.resources) {
          const resId = resource.public_id;
          const resIdWithoutExt = resId.replace(/\.[^/.]+$/, "");

          // Orphaned = referenced by neither the database (backgrounds, content
          // media, portfolio, orders, payments) nor the code registry defaults.
          if (!referencedIds.has(resId) && !referencedIds.has(resIdWithoutExt)) {
            orphaned.push({
              public_id: resource.public_id,
              url: resource.secure_url,
              type: resource.resource_type,
            });
          }
        }

        nextCursor = result.next_cursor;
      } while (nextCursor);
    }

    return NextResponse.json({ orphaned, count: orphaned.length });
  } catch (err) {
    console.error("Cloudinary cleanup scan error:", err);
    return NextResponse.json({ error: "Failed to scan" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { items } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // delete_resources only removes one resource_type per call.
    const byType = new Map<string, string[]>();
    for (const item of items) {
      const type = item.type || "image";
      if (!byType.has(type)) byType.set(type, []);
      byType.get(type)!.push(item.public_id);
    }

    let deleted = 0;
    for (const [resourceType, publicIds] of byType) {
      // Cloudinary allows up to 100 public_ids per delete_resources API call.
      for (let i = 0; i < publicIds.length; i += 100) {
        const chunk = publicIds.slice(i, i + 100);
        const result = await cloudinary.api.delete_resources(chunk, {
          resource_type: resourceType,
        });
        deleted += Object.keys(result.deleted || {}).length;
      }
    }

    // Clean up empty default sample folders
    const sampleFolders = [
      "samples/animals",
      "samples/ecommerce",
      "samples/food",
      "samples/landscapes",
      "samples/people",
      "samples",
    ];
    for (const folder of sampleFolders) {
      try {
        await cloudinary.api.delete_folder(folder);
      } catch {
        // Safe to ignore if folder is not empty or doesn't exist
      }
    }

    return NextResponse.json({ deleted });
  } catch (err) {
    console.error("Cloudinary cleanup delete error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

function extractPublicIdVariants(url: string): string[] {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)$/);
  if (!match) return [];
  const full = match[1];
  const withoutExt = full.replace(/\.[^/.]+$/, "");
  return [full, withoutExt];
}
