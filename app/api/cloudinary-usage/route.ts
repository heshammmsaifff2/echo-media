import { cloudinary } from "@/lib/cloudinary";
import { isAdminRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const [usageResult, imagesRes, videosRes, rawRes] = await Promise.all([
      cloudinary.api.usage().catch(() => null),
      cloudinary.api.resources({ type: "upload", resource_type: "image", max_results: 500 }).catch(() => ({ resources: [] })),
      cloudinary.api.resources({ type: "upload", resource_type: "video", max_results: 500 }).catch(() => ({ resources: [] })),
      cloudinary.api.resources({ type: "upload", resource_type: "raw", max_results: 500 }).catch(() => ({ resources: [] })),
    ]);

    const allResources = [
      ...(imagesRes.resources || []),
      ...(videosRes.resources || []),
      ...(rawRes.resources || []),
    ];

    const realtimeBytes = allResources.reduce((sum, r) => sum + (r.bytes || 0), 0);
    const realtimeCount = allResources.length;

    // If account has 0 active resources, real usage is 0 B (bypassing Cloudinary's 24h lagging daily cache)
    const usedBytes = realtimeCount === 0 ? 0 : (realtimeBytes || usageResult?.storage?.usage || 0);
    const limitBytes = 25 * 1024 * 1024 * 1024; // 25 GB free plan
    const resourceCount = realtimeCount;

    return NextResponse.json({
      used: usedBytes,
      limit: limitBytes,
      usedFormatted: formatBytes(usedBytes),
      limitFormatted: formatBytes(limitBytes),
      percentage: Math.round((usedBytes / limitBytes) * 100),
      bandwidth: {
        used: usageResult?.bandwidth?.usage ?? 0,
        limit: usageResult?.bandwidth?.limit ?? 0,
        usedFormatted: formatBytes(usageResult?.bandwidth?.usage ?? 0),
        limitFormatted: formatBytes(usageResult?.bandwidth?.limit ?? 0),
      },
      resources: resourceCount,
    });
  } catch (err) {
    console.error("Cloudinary usage error:", err);
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}
