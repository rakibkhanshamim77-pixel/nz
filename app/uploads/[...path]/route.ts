import { promises as fs } from "fs";
import { NextResponse, type NextRequest } from "next/server";
import { requirePermission } from "@/app/utils/authz";
import { resolveUploadPath } from "@/db/utils/localStorage";

// Reads files from disk at request time, so images uploaded after `next build` are served too.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const url = `/uploads/${params.path.join("/")}`;
  const file = resolveUploadPath(url);
  if (!file) return new NextResponse("Not found", { status: 404 });

  // Payment screenshots contain customers' transaction details — staff only
  const isPrivate = params.path[0] === "payments";
  if (isPrivate && !(await requirePermission("order_management")))
    return new NextResponse("Not found", { status: 404 });

  let data: Buffer;
  try {
    data = await fs.readFile(file);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = file.slice(file.lastIndexOf(".") + 1).toLowerCase();
  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": CONTENT_TYPE[ext] ?? "application/octet-stream",
      "Content-Length": String(data.byteLength),
      // File names are unique and never overwritten, so public images can be cached forever
      "Cache-Control": isPrivate ? "private, no-store" : "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
