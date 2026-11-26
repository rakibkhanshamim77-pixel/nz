/**
 * VPS image storage configuration.
 * Images are stored at UPLOAD_BASE_DIR on the server and served by Nginx at UPLOADS_URL_BASE.
 */

/** Filesystem root where images are written (outside the Next.js project). */
export const UPLOAD_BASE_DIR = process.env.UPLOAD_BASE_DIR ?? "/var/www/neeshanz-uploads";

/** Public base URL that Nginx serves images from (no trailing slash). */
export const UPLOADS_URL_BASE =
  (process.env.NEXT_PUBLIC_UPLOADS_URL ?? "https://neeshanz.com/uploads").replace(/\/$/, "");

/** Allowed subfolder names — prevents arbitrary directory creation. */
export const VALID_SUBFOLDERS = ["products", "banners", "categories", "avatars", "screenshots"] as const;
export type UploadFolder = (typeof VALID_SUBFOLDERS)[number];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

/** Returns true when `value` is a URL served from our VPS uploads. */
export function isVpsUploadUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const base = new URL(UPLOADS_URL_BASE);
    if (url.origin === base.origin && url.pathname.startsWith(base.pathname)) return true;
    // Accept any localhost upload URL regardless of port (dev servers vary)
    if (url.hostname === "localhost" && (url.pathname.startsWith("/uploads/") || url.pathname.startsWith("/api/uploads/"))) return true;
    // Accept production VPS uploads path
    if (url.hostname === "neeshanz.com" && url.pathname.startsWith("/uploads/")) return true;
    return false;
  } catch {
    return false;
  }
}

/** Returns true for any image URL we recognise — VPS uploads OR legacy ImgBB (still displayed until migrated). */
export function isKnownImageUrl(value: string): boolean {
  if (isVpsUploadUrl(value)) return true;
  try {
    const url = new URL(value);
    // Legacy ImgBB URLs — still accepted for display, never for new uploads
    return url.protocol === "https:" && ["i.ibb.co", "i.ibb.co.com"].includes(url.hostname);
  } catch {
    return false;
  }
}
