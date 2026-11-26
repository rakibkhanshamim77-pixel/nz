/**
 * One-time migration: replace localhost:4000 upload URLs with production URL.
 * Run once on the VPS: node scripts/fix-localhost-image-urls.mjs
 */

import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config();

const OLD = "http://localhost:4000/api/uploads";
const NEW = "https://neeshanz.com/uploads";

const client = new MongoClient(process.env.MONGO_URI);

function replace(value) {
  if (typeof value === "string") return value.replaceAll(OLD, NEW);
  if (Array.isArray(value)) return value.map(replace);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replace(v)]));
  }
  return value;
}

async function migrate() {
  await client.connect();
  const db = client.db();

  // Collections that may store image URLs
  const collections = ["products", "categories", "users", "contents", "settings"];

  for (const name of collections) {
    const col = db.collection(name);
    const docs = await col.find({}).toArray();
    let fixed = 0;

    for (const doc of docs) {
      const updated = replace(doc);
      const before = JSON.stringify(doc);
      const after = JSON.stringify(updated);
      if (before !== after) {
        const { _id, ...rest } = updated;
        await col.replaceOne({ _id }, rest);
        fixed++;
      }
    }

    console.log(`${name}: fixed ${fixed} / ${docs.length} documents`);
  }

  await client.close();
  console.log("Done.");
}

migrate().catch((e) => { console.error(e); process.exit(1); });
