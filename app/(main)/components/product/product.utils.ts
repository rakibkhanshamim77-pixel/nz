export { formatPrice } from "@/db/settings";

/** 3 -> "★★★☆☆"-style split, for rendering filled / empty stars separately */
export function starParts(rating: number) {
  const filled = Math.min(5, Math.max(0, Math.round(rating)));
  return { filled: "★".repeat(filled), empty: "★".repeat(5 - filled) };
}
