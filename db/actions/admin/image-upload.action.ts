"use server";

import { requirePermission } from "@/app/utils/authz";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, type UploadFolder } from "@/db/utils/imageHosts";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";

const UPLOAD_BASE_DIR = process.env.UPLOAD_BASE_DIR ?? "/var/www/neeshanz-uploads";
const UPLOADS_URL_BASE = (process.env.NEXT_PUBLIC_UPLOADS_URL ?? "https://neeshanz.com/uploads").replace(/\/$/, "");

export type UploadImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** Detects the real format from the file's first bytes. */
function sniffExt(b: Buffer): string | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b.length >= 12 && b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return null;
}

export async function uploadProductImage(
  formData: FormData,
  folder: UploadFolder = "products",
): Promise<UploadImageResult> {
  if (!(await requirePermission("product_management")))
    return { ok: false, error: "You are not allowed to upload images." };

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "No image was received." };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "Images must be 5 MB or smaller." };
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type))
    return { ok: false, error: "Only JPG, PNG or WebP images are allowed." };

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = sniffExt(buffer);
  if (!ext) return { ok: false, error: "This file isn't a valid JPG, PNG or WebP image." };

  const baseName = (file.name ?? "image")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 40)
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "image";
  const unique = `${Date.now()}-${randomBytes(4).toString("hex")}-${baseName}.${ext}`;

  const targetDir = path.resolve(UPLOAD_BASE_DIR, folder);
  const filePath = path.resolve(targetDir, unique);

  // Prevent path traversal: both sides are resolve()'d so comparison is consistent on any OS
  if (!filePath.startsWith(targetDir + path.sep) && filePath !== targetDir) {
    return { ok: false, error: "Invalid filename." };
  }

  try {
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
    }
    await writeFile(filePath, buffer);
  } catch (err) {
    console.error("[uploadProductImage] write failed", err);
    return { ok: false, error: "Failed to save image. Check server storage permissions." };
  }

  const url = `${UPLOADS_URL_BASE}/${folder}/${unique}`;
  return { ok: true, url };
}
