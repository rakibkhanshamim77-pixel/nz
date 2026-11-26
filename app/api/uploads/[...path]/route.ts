/**
 * Local development only: serves uploaded images from UPLOAD_BASE_DIR.
 * In production, Nginx serves /uploads/** directly — this route is never hit.
 */
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_BASE_DIR = process.env.UPLOAD_BASE_DIR ?? "/var/www/neeshanz-uploads";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const segments = (params.path ?? []).map((s) => s.replace(/[^a-zA-Z0-9._-]/g, ""));
  if (segments.length === 0) return new NextResponse("Not found", { status: 404 });

  const baseDir = path.resolve(UPLOAD_BASE_DIR);
  const filePath = path.resolve(baseDir, ...segments);

  // Path traversal guard
  if (!filePath.startsWith(baseDir + path.sep)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (!existsSync(filePath)) return new NextResponse("Not found", { status: 404 });

  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME[ext] ?? "application/octet-stream";

  const buffer = await readFile(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
