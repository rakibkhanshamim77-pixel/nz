"use server";

import { requirePermission } from "@/app/utils/authz";
import { ALLOWED_IMAGE_TYPES } from "@/db/utils/imageHosts";
import { saveUploadedImage } from "@/db/utils/localStorage";

export type UploadImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const ERRORS = {
  empty: "No image was received.",
  too_large: "Images must be 5 MB or smaller.",
  bad_type: "This file isn't a valid JPG, PNG or WebP image.",
  write_failed: "Couldn't save the image on the server. Check the upload folder and try again.",
} as const;

/** Saves one product image to the server's upload folder and returns its `/uploads/...` URL. */
export async function uploadProductImage(formData: FormData): Promise<UploadImageResult> {
  if (!(await requirePermission("product_management")))
    return { ok: false, error: "You are not allowed to upload images." };

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: ERRORS.empty };
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type))
    return { ok: false, error: "Only JPG, PNG or WebP images are allowed." };

  const res = await saveUploadedImage(new Uint8Array(await file.arrayBuffer()), "products", file.name || "product");
  return res.ok ? { ok: true, url: res.url } : { ok: false, error: ERRORS[res.error] };
}
