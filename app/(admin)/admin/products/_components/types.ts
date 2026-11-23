import type { AdminProductStatus } from "@/db/utils/productVisibility";

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  sku: string;
  category: string;
  regularPrice: number;
  salePrice: number;
  stock: number;
  colors: string[];
  sizes: string[];
  image?: string;
  isFeatured: boolean;
  isActive: boolean;
  status: AdminProductStatus;
  publishAt: string | null;
  createdAt: string;
}

export const isOnSale = (p: Pick<ProductRow, "regularPrice" | "salePrice">) =>
  p.salePrice > 0 && p.salePrice < p.regularPrice;

export const STATUS_LABEL: Record<AdminProductStatus, string> = {
  active: "Active",
  draft: "Draft",
  scheduled: "Scheduled",
};
