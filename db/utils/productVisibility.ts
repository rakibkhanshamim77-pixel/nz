/** Mongo filter for products customers may see: active, and not scheduled for the future. */
export function publishedProductFilter(now: Date = new Date()) {
  return {
    isActive: true,
    publishAt: { $not: { $gt: now } },
  };
}

export type AdminProductStatus = "active" | "draft" | "scheduled";

export function productStatusOf(
  isActive: boolean,
  publishAt: Date | string | null | undefined,
  now: Date = new Date(),
): AdminProductStatus {
  if (!isActive) return "draft";
  if (publishAt && new Date(publishAt).getTime() > now.getTime()) return "scheduled";
  return "active";
}
