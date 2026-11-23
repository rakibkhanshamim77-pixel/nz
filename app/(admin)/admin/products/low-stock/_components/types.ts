import type { StockLevel } from "@/app/utils/inventory";
import type { AdminProductStatus } from "@/db/utils/productVisibility";

export interface LowStockRow {
  id: string;
  name: string;
  sku: string;
  category: string;
  image?: string;
  stock: number;
  price: number;
  status: AdminProductStatus;
  level: Exclude<StockLevel, "ok">;
}

export const LEVEL_LABEL: Record<LowStockRow["level"], string> = {
  out: "Out of stock",
  critical: "Critical",
  low: "Low",
};
