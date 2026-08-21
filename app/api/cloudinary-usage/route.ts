import { cloudinary } from "@/lib/cloudinary";
import { isAdminRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const result = await cloudinary.api.usage();

    const usedBytes = result.storage?.usage ?? 0;
    const limitBytes = 25 * 1024 * 1024 * 1024; // 25 GB free plan

    return NextResponse.json({
      used: usedBytes,
      limit: limitBytes,
      usedFormatted: formatBytes(usedBytes),
      limitFormatted: formatBytes(limitBytes),
      percentage: Math.round((usedBytes / limitBytes) * 100),
      bandwidth: {
        used: result.bandwidth?.usage ?? 0,
        limit: result.bandwidth?.limit ?? 0,
        usedFormatted: formatBytes(result.bandwidth?.usage ?? 0),
        limitFormatted: formatBytes(result.bandwidth?.limit ?? 0),
      },
      resources: result.resources ?? 0,
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
