// Shape of the data the product details UI renders.
// When the real MongoDB query is ready, map its result to these types in the action file —
// the UI components don't need to change.

export interface ProductColor {
  /** Display name, e.g. "কালো" */
  name: string;
  /** Any CSS color, e.g. "#111111" */
  hex: string;
  /** Optional color-specific images; falls back to the product images */
  images?: string[];
}

export interface ProductSize {
  /** e.g. "M" */
  label: string;
  stock: number;
}

export interface SizeChartRow {
  size: string;
  chest: number | string;
  length: number | string;
  shoulder: number | string;
}

export interface ProductSizeChartData {
  /** Shown in the column headers, e.g. "ইঞ্চি" */
  unit: string;
  rows: SizeChartRow[];
  note?: string;
}

export interface ProductDetails {
  _id: string;
  name: string;
  slug: string;
  /** Small label above the title, e.g. "Oversized Tee" */
  eyebrow?: string;
  category?: { name: string; slug: string };
  categoryId?: string;
  images: string[];
  /** Plain text — used for meta description and OG tags */
  description: string;
  /** Sanitised HTML from the rich-text editor — rendered on the product page */
  descriptionHtml?: string;
  /** Bullet points under "পণ্যের বিবরণ" */
  highlights: string[];
  fabric?: string;
  care?: string;
  regularPrice: number;
  salePrice: number;
  /** Discount percentage, 0 when none */
  discount: number;
  isNew?: boolean;
  colors: ProductColor[];
  sizes: ProductSize[];
  /** Total stock — used when the product has no sizes */
  stock: number;
  sizeChart?: ProductSizeChartData | null;
}

export interface ReviewSummaryData {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}
