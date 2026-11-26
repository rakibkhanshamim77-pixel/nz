import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { requirePermission } from "@/app/utils/authz";
import { UPLOAD_BASE_DIR, UPLOADS_URL_BASE, isVpsUploadUrl } from "@/db/utils/imageHosts";

export async function DELETE(req: NextRequest) {
  const actor = await requirePermission("product_management");
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { url } = body;
  if (!url || !isVpsUploadUrl(url))
    return NextResponse.json({ error: "Invalid or non-local image URL" }, { status: 400 });

  // Convert public URL back to filesystem path
  const relativePath = url.slice(UPLOADS_URL_BASE.length + 1); // strip leading "/"
  const baseDir = path.resolve(UPLOAD_BASE_DIR);
  const filePath = path.resolve(baseDir, relativePath);

  // Ensure the resolved path is inside UPLOAD_BASE_DIR (prevent traversal)
  if (!filePath.startsWith(baseDir + path.sep) && filePath !== baseDir) {
    return NextResponse.json({ error: "Path not allowed" }, { status: 400 });
  }

  if (!existsSync(filePath)) {
    // Already gone — treat as success so callers stay idempotent
    return NextResponse.json({ ok: true });
  }

  await unlink(filePath);
  return NextResponse.json({ ok: true });
}
