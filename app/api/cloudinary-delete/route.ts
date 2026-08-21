import { cloudinary } from "@/lib/cloudinary";
import { isAdminRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { urls } = await req.json();

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ deleted: 0 });
    }

    // delete_resources only handles one resource_type per call.
    const byType = new Map<string, string[]>();

    for (const url of urls) {
      if (typeof url !== "string" || !url.includes("cloudinary.com")) continue;
      const parsed = parseCloudinaryUrl(url);
      if (!parsed) continue;
      if (!byType.has(parsed.resourceType)) byType.set(parsed.resourceType, []);
      byType.get(parsed.resourceType)!.push(parsed.publicId);
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
    console.error("Cloudinary delete error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

/** https://res.cloudinary.com/<cloud>/<resource_type>/upload/v123/folder/name.ext */
function parseCloudinaryUrl(url: string): { resourceType: string; publicId: string } | null {
  const match = url.match(
    /res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/
  );
  if (!match) return null;
  return { resourceType: match[1], publicId: match[2] };
}
