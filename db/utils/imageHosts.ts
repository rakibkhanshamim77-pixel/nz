/**
 * Uploaded images live on this server's disk (see db/utils/localStorage.ts) and are
 * served from `/uploads/...` by app/uploads/[...path]/route.ts.
 *
 * This file has no Node-only imports so it can be used on both the client and the server.
 */

/** Public URL prefix every uploaded image starts with */
export const UPLOAD_URL_PREFIX = "/uploads/";

/** Top-level folders inside the upload directory */
export const UPLOAD_FOLDERS = ["products", "payments"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const IMAGE_EXT: Record<AllowedImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// /uploads/<folder>/<yyyy>/<mm>/<name>.<ext> — exactly what saveUploadedImage() produces
const UPLOAD_URL_RE = /^\/uploads\/(products|payments)\/\d{4}\/\d{2}\/[a-z0-9-]{1,80}\.(jpg|png|webp)$/;

/** True for a URL produced by our own upload code (and nothing else). */
export function isUploadedImageUrl(value: string, folder?: UploadFolder): boolean {
  if (!UPLOAD_URL_RE.test(value)) return false;
  return folder ? value.startsWith(`${UPLOAD_URL_PREFIX}${folder}/`) : true;
}

/** Detects the real format from the file's first bytes — the browser-reported MIME type is not trusted. */
export function sniffImageType(b: Uint8Array): AllowedImageType | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (b.length >= 8 && png.every((v, i) => b[i] === v)) return "image/png";
  const ascii = (from: number, to: number) => String.fromCharCode(...Array.from(b.subarray(from, to)));
  if (b.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}
