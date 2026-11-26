// Server-only (uses the file system). Never import this from a "use client" file.
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import {
  ALLOWED_IMAGE_TYPES,
  IMAGE_EXT,
  MAX_IMAGE_BYTES,
  UPLOAD_URL_PREFIX,
  isUploadedImageUrl,
  sniffImageType,
  type UploadFolder,
} from "./imageHosts";

/**
 * Where uploaded images are stored. It is deliberately OUTSIDE the project folder,
 * so `next build`, `git pull` or re-deploying never deletes them.
 *
 *   UPLOAD_DIR env var, if set        (e.g. UPLOAD_DIR=C:/neeshanz or /var/www/neeshanz)
 *   otherwise on Windows              C:/neeshanz
 *   otherwise (Linux / macOS)         ~/neeshanz
 */
export function getUploadDir(): string {
  const fromEnv = process.env.UPLOAD_DIR?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  return process.platform === "win32" ? "C:\\neeshanz" : path.join(os.homedir(), "neeshanz");
}

export type SaveImageResult =
  | { ok: true; url: string }
  | { ok: false; error: "empty" | "too_large" | "bad_type" | "write_failed" };

/** Validates the bytes and writes them to <UPLOAD_DIR>/<folder>/<yyyy>/<mm>/<random>.<ext>. */
export async function saveUploadedImage(
  data: Uint8Array,
  folder: UploadFolder,
  baseName = "image",
): Promise<SaveImageResult> {
  if (data.byteLength === 0) return { ok: false, error: "empty" };
  if (data.byteLength > MAX_IMAGE_BYTES) return { ok: false, error: "too_large" };

  const type = sniffImageType(data);
  if (!type || !(ALLOWED_IMAGE_TYPES as readonly string[]).includes(type)) return { ok: false, error: "bad_type" };

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const slug =
    baseName
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "image";
  const fileName = `${slug}-${Date.now().toString(36)}${randomBytes(6).toString("hex")}.${IMAGE_EXT[type]}`;

  const dir = path.join(getUploadDir(), folder, yyyy, mm);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, fileName), data, { flag: "wx" });
  } catch (error) {
    console.error("[saveUploadedImage] could not write file", error);
    return { ok: false, error: "write_failed" };
  }

  const url = `${UPLOAD_URL_PREFIX}${folder}/${yyyy}/${mm}/${fileName}`;
  return isUploadedImageUrl(url, folder) ? { ok: true, url } : { ok: false, error: "write_failed" };
}

/**
 * Maps a `/uploads/...` URL to its absolute file path, or null if the URL isn't one of ours.
 * The strict URL pattern already blocks `..`; the prefix check is a second guard.
 */
export function resolveUploadPath(url: string): string | null {
  if (!isUploadedImageUrl(url)) return null;
  const root = getUploadDir();
  const full = path.resolve(root, url.slice(UPLOAD_URL_PREFIX.length));
  return full.startsWith(root + path.sep) ? full : null;
}

