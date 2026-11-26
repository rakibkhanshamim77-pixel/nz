/**
 * Public server-side reader for content blocks.
 * Returns merged result of DB doc + defaults, so missing slugs always return a usable object.
 */
import { cache } from "react";
import dbConnect from "@/db/connect/dbConnect";
import ContentModel from "@/db/models/Content";
import {
  CONTENT_DEFAULTS,
  type ContentSlug,
} from "@/db/content";

// React.cache() deduplicates identical slug calls within a single render pass —
// Announcement (layout) + SaleBanner + Newsletter on the homepage each call getContent
// with their own slug, so they still hit DB once each, but repeat calls for the same slug
// (e.g. two components needing "announcement") are served from the in-request cache.
export const getContent = cache(async <S extends ContentSlug>(
  slug: S,
): Promise<(typeof CONTENT_DEFAULTS)[S]> => {
  await dbConnect();
  const doc = await ContentModel.findOne({ slug }).select("slug data").lean();
  const defaults = CONTENT_DEFAULTS[slug];
  if (!doc?.data) return defaults;
  return { ...defaults, ...doc.data } as (typeof CONTENT_DEFAULTS)[S];
});
