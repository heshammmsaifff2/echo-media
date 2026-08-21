import { cloudinary } from "@/lib/cloudinary";
import { createClient } from "@/lib/supabase/server";
import { isAdminRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

const RESOURCE_TYPES = ["image", "video", "raw"] as const;

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const supabase = await createClient();

    const [portfolioRes, ordersRes] = await Promise.all([
      supabase.from("portfolio_items").select("media_url, thumbnail_url"),
      supabase.from("client_orders").select("delivery_files, receipt_url"),
    ]);

    // Bail out rather than risk deleting live media because a query silently failed.
    if (portfolioRes.error || ordersRes.error) {
      return NextResponse.json(
        { error: "Could not read all references — scan aborted for safety" },
        { status: 500 }
      );
    }

    const referencedIds = new Set<string>();
    const addUrl = (url: string | null | undefined) => {
      if (!url || !url.includes("cloudinary.com")) return;
      const id = extractPublicId(url);
      if (id) referencedIds.add(id);
    };

    (portfolioRes.data || []).forEach((item) => {
      addUrl(item.media_url);
      addUrl(item.thumbnail_url);
    });

    (ordersRes.data || []).forEach((order) => {
      addUrl(order.receipt_url);
      (order.delivery_files || []).forEach(addUrl);
    });

    const orphaned: { public_id: string; url: string; type: string }[] = [];

    for (const resourceType of RESOURCE_TYPES) {
      let nextCursor: string | undefined;

      do {
        const result: {
          resources: { public_id: string; secure_url: string; resource_type: string }[];
          next_cursor?: string;
        } = await cloudinary.api.resources({
          type: "upload",
          resource_type: resourceType,
          prefix: "echo/",
          max_results: 500,
          next_cursor: nextCursor,
        });

        for (const resource of result.resources) {
          if (!referencedIds.has(resource.public_id)) {
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
      const result = await cloudinary.api.delete_resources(publicIds, {
        resource_type: resourceType,
      });
      deleted += Object.keys(result.deleted || {}).length;
    }

    return NextResponse.json({ deleted });
  } catch (err) {
    console.error("Cloudinary cleanup delete error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return match ? match[1] : null;
}
