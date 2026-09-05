import { NextRequest, NextResponse } from "next/server";
import { getUploadSignature } from "@/lib/cloudinary";
import { getUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const folder = body.folder || "echo";

  const { timestamp, signature } = await getUploadSignature(folder);

  return NextResponse.json({
    timestamp,
    signature,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
  });
}
