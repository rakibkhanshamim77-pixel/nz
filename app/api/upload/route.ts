import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { requirePermission } from "@/app/utils/authz";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, UPLOAD_BASE_DIR, UPLOADS_URL_BASE, VALID_SUBFOLDERS } from "@/db/utils/imageHosts";

function sniffImageType(b: Buffer): string | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b.length >= 12 && b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  if (b.length >= 6 && b.subarray(0, 6).toString("ascii") === "GIF87a") return "gif";
  if (b.length >= 6 && b.subarray(0, 6).toString("ascii") === "GIF89a") return "gif";
  return null;
}

export async function POST(req: NextRequest) {
  const actor = await requirePermission("product_management");
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0)
    return NextResponse.json({ error: "No image received" }, { status: 400 });

  if (file.size > MAX_IMAGE_BYTES)
    return NextResponse.json({ error: "Image must be 5 MB or smaller" }, { status: 400 });

  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type))
    return NextResponse.json({ error: "Only JPG, PNG, WebP or GIF images are allowed" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = sniffImageType(buffer);
  if (!ext) return NextResponse.json({ error: "File is not a valid image" }, { status: 400 });

  // Determine subfolder (products / banners / categories / avatars / screenshots — default: products)
  const rawFolder = (formData.get("folder") ?? "products")?.toString();
  const folder = (VALID_SUBFOLDERS as readonly string[]).includes(rawFolder) ? rawFolder : "products";

  const targetDir = path.resolve(UPLOAD_BASE_DIR, folder);

  if (!existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
  }

  // Safe unique filename: timestamp + 8 random hex chars + sanitised original name
  const baseName = (file.name ?? "image")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 40)
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "image";
  const unique = `${Date.now()}-${randomBytes(4).toString("hex")}-${baseName}.${ext}`;
  const filePath = path.resolve(targetDir, unique);

  // Prevent path traversal: both sides resolve()'d so comparison is consistent on any OS
  if (!filePath.startsWith(targetDir + path.sep) && filePath !== targetDir) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  await writeFile(filePath, buffer);

  const url = `${UPLOADS_URL_BASE}/${folder}/${unique}`;
  return NextResponse.json({ ok: true, url });
}
