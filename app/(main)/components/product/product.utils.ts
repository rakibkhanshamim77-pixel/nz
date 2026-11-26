/** 1450 -> "BDT 1,450" (same format as the design) */
export function formatPrice(amount: number): string {
  return `BDT ${Math.round(amount).toLocaleString("en-US")}`;
}

/** 3 -> "★★★☆☆"-style split, for rendering filled / empty stars separately */
export function starParts(rating: number) {
  const filled = Math.min(5, Math.max(0, Math.round(rating)));
  return { filled: "★".repeat(filled), empty: "★".repeat(5 - filled) };
}
