/**
 * A product counts as low stock when `stock <= threshold`.
 *
 * The live threshold comes from the settings page — read it with
 * `getLowStockThreshold()` from db/settings.server.ts. This module stays free of
 * mongoose because client components import `stockLevel` and the options list.
 */
export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export const LOW_STOCK_THRESHOLD_OPTIONS = [3, 5, 10, 20, 50] as const;

export type StockLevel = "out" | "critical" | "low" | "ok";

export function stockLevel(stock: number, threshold: number): StockLevel {
  if (stock <= 0) return "out";
  if (stock <= Math.max(1, Math.ceil(threshold / 2))) return "critical";
  if (stock <= threshold) return "low";
  return "ok";
}
