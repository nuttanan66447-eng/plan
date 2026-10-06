"use client";

import { browserClient } from "@/lib/supabase/browser";

/** Downscale to ≤1800px JPEG in the browser so uploads stay small and fast. */
async function compress(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const max = 1800;
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * k);
  canvas.height = Math.round(bmp.height * k);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/jpeg", 0.85));
}

export async function uploadImage(file: File, folder: string) {
  const sb = browserClient();
  const blob = await compress(file);
  const path = `${folder || "plan"}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await sb.storage.from("plan-images").upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw new Error(error.message);
  return sb.storage.from("plan-images").getPublicUrl(path).data.publicUrl;
}

