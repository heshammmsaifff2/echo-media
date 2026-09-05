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

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to get upload signature (${res.status})`);
  }

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

  if (!uploadRes.ok) {
    const errData = await uploadRes.json().catch(() => ({}));
    const message = errData?.error?.message || `Upload failed (${uploadRes.status})`;
    throw new Error(message);
  }

  const data = await uploadRes.json();
  return { url: data.secure_url, publicId: data.public_id };
}
