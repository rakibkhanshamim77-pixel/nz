"use server";

import { requirePermission } from "@/app/utils/authz";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  isImgbbUrl,
} from "@/db/utils/imageHosts";

export type UploadImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

type AllowedType = (typeof ALLOWED_IMAGE_TYPES)[number];

/** Detects the real format from the file's first bytes — the browser-reported MIME type is not trusted. */
function sniffImageType(b: Buffer): AllowedType | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (
    b.length >= 8 &&
    b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "image/png";
  if (
    b.length >= 12 &&
    b.subarray(0, 4).toString("ascii") === "RIFF" &&
    b.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "image/webp";
  return null;
}

interface ImgbbResponse {
  success?: boolean;
  data?: { url?: string; display_url?: string };
  error?: { message?: string };
}

export async function uploadProductImage(formData: FormData): Promise<UploadImageResult> {
  if (!(await requirePermission("product_management"))) return { ok: false, error: "You are not allowed to upload images." };

  const apiKey = process.env.IMGBB_API_KEY?.trim();
  if (!apiKey) {
    console.error("[uploadProductImage] IMGBB_API_KEY is not set");
    return { ok: false, error: "Image uploads are not configured on the server." };
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "No image was received." };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "Images must be 5 MB or smaller." };
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type))
    return { ok: false, error: "Only JPG, PNG or WebP images are allowed." };

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!sniffImageType(buffer)) return { ok: false, error: "This file isn't a valid JPG, PNG or WebP image." };

  const name =
    file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .slice(0, 60) || "product";

  const body = new FormData();
  body.append("key", apiKey);
  body.append("image", buffer.toString("base64"));
  body.append("name", name);

  try {
    const res = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(45_000),
    });
    const json = (await res.json().catch(() => null)) as ImgbbResponse | null;
    const url = json?.data?.url ?? json?.data?.display_url;

    if (!res.ok || !json?.success || !url || !isImgbbUrl(url)) {
      console.error("[uploadProductImage] ImgBB rejected upload", res.status, json?.error?.message);
      return { ok: false, error: "The image host rejected this upload. Please try again." };
    }
    return { ok: true, url };
  } catch (error) {
    console.error("[uploadProductImage] request failed", error);
    return { ok: false, error: "Couldn't reach the image host. Check your connection and retry." };
  }
}
