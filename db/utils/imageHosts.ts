/** Hosts ImgBB serves uploaded images from. Keep in sync with next.config.mjs `images.remotePatterns`. */
export const IMGBB_IMAGE_HOSTS = ["i.ibb.co", "i.ibb.co.com"] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function isImgbbUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (IMGBB_IMAGE_HOSTS as readonly string[]).includes(url.hostname);
  } catch {
    return false;
  }
}
