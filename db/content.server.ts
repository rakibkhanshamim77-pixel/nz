/**
 * Public server-side reader for content blocks.
 * Returns merged result of DB doc + defaults, so missing slugs always return a usable object.
 */
import dbConnect from "@/db/connect/dbConnect";
import ContentModel from "@/db/models/Content";
import {
  CONTENT_DEFAULTS,
  type ContentSlug,
} from "@/db/content";

export async function getContent<S extends ContentSlug>(
  slug: S,
): Promise<(typeof CONTENT_DEFAULTS)[S]> {
  await dbConnect();
  const doc = await ContentModel.findOne({ slug }).lean();
  const defaults = CONTENT_DEFAULTS[slug];
  if (!doc?.data) return defaults;
  return { ...defaults, ...doc.data } as (typeof CONTENT_DEFAULTS)[S];
}
