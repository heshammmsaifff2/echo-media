"use client";

export async function uploadToCloudinary(
  file: File,
  folder: string = "echo"
): Promise<{ url: string; publicId: string }> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });

  if (!res.ok) throw new Error("Failed to get upload signature");

  const { timestamp, signature, cloudName, apiKey } = await res.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("api_key", apiKey);
  formData.append("folder", folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: "POST", body: formData }
  );

  if (!uploadRes.ok) throw new Error("Upload failed");

  const data = await uploadRes.json();
  return { url: data.secure_url, publicId: data.public_id };
}
