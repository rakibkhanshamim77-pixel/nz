/**
 * One-time migration: copies every ImgBB image referenced in the database into the
 * local upload folder (UPLOAD_DIR, default C:/neeshanz on Windows) and rewrites the
 * stored URLs to /uploads/... .
 *
 *   npx tsx scripts/migrate-imgbb-images.ts            # dry run: lists what would change
 *   npx tsx scripts/migrate-imgbb-images.ts --apply    # downloads images and updates the database
 *
 * Safe to run more than once: already-migrated URLs no longer match and are skipped.
 * Back up the database before running with --apply.
 */
import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import { getUploadDir, saveUploadedImage } from "../db/utils/localStorage";
import type { UploadFolder } from "../db/utils/imageHosts";

loadEnvConfig(process.cwd());

const APPLY = process.argv.includes("--apply");
const IMGBB_RE = /^https:\/\/i\.ibb\.co(\.com)?\//;

type Found = { path: string; url: string };

/** Collects every ImgBB URL string in a document together with its dotted path. */
function collect(value: unknown, path: string, out: Found[]) {
  if (typeof value === "string") {
    if (IMGBB_RE.test(value)) out.push({ path, url: value });
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => collect(v, path ? `${path}.${i}` : String(i), out));
  } else if (value && typeof value === "object" && !(value instanceof mongoose.Types.ObjectId) && !(value instanceof Date)) {
    for (const [k, v] of Object.entries(value)) collect(v, path ? `${path}.${k}` : k, out);
  }
}

const done = new Map<string, string>(); // ImgBB URL -> /uploads URL

async function migrateUrl(url: string, folder: UploadFolder): Promise<string | null> {
  const cached = done.get(url);
  if (cached) return cached;

  const clean = url.split("?")[0];
  const res = await fetch(clean, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) {
    console.warn(`  ! download failed (${res.status}): ${clean}`);
    return null;
  }
  const name = decodeURIComponent(clean.split("/").pop() ?? "image");
  const saved = await saveUploadedImage(new Uint8Array(await res.arrayBuffer()), folder, name);
  if (!saved.ok) {
    console.warn(`  ! could not save (${saved.error}): ${clean}`);
    return null;
  }
  done.set(url, saved.url);
  return saved.url;
}

async function main() {
  const uri = process.env.MONGO_URI?.trim();
  if (!uri) throw new Error("MONGO_URI is not set");
  await mongoose.connect(uri);
  const db = mongoose.connection.db!;

  console.log(`${APPLY ? "APPLYING" : "DRY RUN"} — upload folder: ${getUploadDir()}\n`);
  let total = 0;
  let failed = 0;

  for (const { name } of await db.listCollections().toArray()) {
    const col = db.collection(name);
    for await (const doc of col.find({})) {
      const found: Found[] = [];
      collect(doc, "", found);
      if (!found.length) continue;

      console.log(`${name} ${doc._id}: ${found.length} image(s)`);
      total += found.length;
      if (!APPLY) continue;

      const $set: Record<string, string> = {};
      for (const f of found) {
        const folder: UploadFolder = /payment|screenshot/i.test(f.path) ? "payments" : "products";
        const local = await migrateUrl(f.url, folder);
        if (local) $set[f.path] = local;
        else failed++;
      }
      if (Object.keys($set).length) await col.updateOne({ _id: doc._id }, { $set });
    }
  }

  console.log(
    APPLY
      ? `\nDone. ${total - failed} URL(s) migrated, ${failed} failed (left unchanged — re-run to retry).`
      : `\n${total} ImgBB URL(s) found. Re-run with --apply to migrate them.`,
  );
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
