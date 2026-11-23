import { htmlToText, sanitizeRichText } from "../utils/sanitizeHtml";

export const PRODUCT_LIMITS = {
  nameMin: 3,
  nameMax: 90,
  descMinChars: 20,
  descMaxHtml: 20_000,
  priceMax: 1_000_000,
  stockMax: 100_000,
  galleryMax: 8,
  sizesMax: 15,
  sizeMax: 6,
  colorsMax: 12,
  colorMax: 24,
  colorImagesMax: 6,
  featuresMax: 12,
  featureMax: 120,
  chartRowsMax: 15,
  measureMax: 200,
} as const;

export const SKU_PATTERN = /^[A-Z0-9-]{4,20}$/;
export const SIZE_PATTERN = /^[A-Z0-9]{1,6}$/;
export const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as const;

export type ProductStatus = "active" | "draft" | "scheduled";

export interface SizeChartRowInput {
  size: string;
  chest: string;
  length: string;
  shoulder: string;
}

/** Shape sent from the product form to the create/update server actions. */
export interface ProductPayload {
  name: string;
  sku: string;
  category: string;
  description: string;
  regularPrice: string;
  salePrice: string;
  stock: string;
  images: string[];
  colors: string[];
  /** Optional per-color image URLs; keys must be in colors */
  colorImages?: Record<string, string[]>;
  sizes: string[];
  features: string[];
  sizeChart: SizeChartRowInput[];
  status: ProductStatus;
  publishAt: string;
  isFeatured: boolean;
}

export type ProductFieldKey = keyof ProductPayload;
export type ProductFieldErrors = Partial<Record<ProductFieldKey, string>>;

export interface CleanSizeChartRow {
  size: string;
  chest?: number;
  length?: number;
  shoulder?: number;
}

export interface CleanProduct {
  name: string;
  sku: string;
  category: string;
  description: string;
  regularPrice: number;
  salePrice: number;
  discount: number;
  stock: number;
  images: string[];
  colors: string[];
  colorImages: Record<string, string[]>;
  sizes: string[];
  features: string[];
  sizeChart: CleanSizeChartRow[];
  isActive: boolean;
  publishAt: Date | null;
  isFeatured: boolean;
}

export type ProductValidation =
  | { ok: true; data: CleanProduct }
  | { ok: false; errors: ProductFieldErrors };

const text = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").map((x) => x.trim()) : [];

/** Whole non-negative number from a number or digit-only string; NaN otherwise. */
export function parseWhole(v: unknown): number {
  if (typeof v === "number") return Number.isInteger(v) && v >= 0 ? v : NaN;
  const s = text(v);
  return /^\d{1,9}$/.test(s) ? Number(s) : NaN;
}

function parseMeasure(v: unknown): number | undefined | null {
  const s = typeof v === "number" ? String(v) : text(v);
  if (!s) return undefined;
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(s)) return null;
  const n = Number(s);
  return n <= PRODUCT_LIMITS.measureMax ? n : null;
}

export function discountPercent(regular: number, sale: number): number {
  return regular > 0 && sale > 0 && sale < regular ? Math.round((1 - sale / regular) * 100) : 0;
}

export function validateProduct(raw: unknown, now: Date = new Date()): ProductValidation {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: ProductFieldErrors = {};
  const L = PRODUCT_LIMITS;

  const name = text(input.name).replace(/\s+/g, " ");
  if (name.length < L.nameMin) errors.name = `Enter a product name (at least ${L.nameMin} characters)`;
  else if (name.length > L.nameMax) errors.name = `Keep the name under ${L.nameMax} characters`;

  const sku = text(input.sku).toUpperCase();
  if (!SKU_PATTERN.test(sku)) errors.sku = "Use 4–20 capital letters, numbers or dashes";

  const category = text(input.category);
  if (!category) errors.category = "Choose a category";

  const rawDescription = typeof input.description === "string" ? input.description : "";
  const description = rawDescription.length > L.descMaxHtml ? "" : sanitizeRichText(rawDescription);
  const descChars = htmlToText(description).length;
  if (rawDescription.length > L.descMaxHtml) errors.description = "Description is too long";
  else if (descChars < L.descMinChars)
    errors.description = `Write a description of at least ${L.descMinChars} characters`;

  const regularPrice = parseWhole(input.regularPrice);
  if (!(regularPrice > 0)) errors.regularPrice = "Enter the regular price in whole taka";
  else if (regularPrice > L.priceMax) errors.regularPrice = "Price is too high";

  const saleRaw = text(input.salePrice);
  let salePrice = regularPrice;
  if (saleRaw) {
    const sale = parseWhole(saleRaw);
    if (!(sale > 0)) errors.salePrice = "Enter the sale price in whole taka";
    else if (regularPrice > 0 && sale >= regularPrice)
      errors.salePrice = "Sale price must be lower than the regular price";
    else salePrice = sale;
  }

  const stock = parseWhole(input.stock);
  if (Number.isNaN(stock)) errors.stock = "Enter the stock quantity (0 or more)";
  else if (stock > L.stockMax) errors.stock = `Stock can't exceed ${L.stockMax.toLocaleString("en-US")}`;

  const images = Array.from(new Set(strings(input.images).filter(Boolean)));
  if (images.length === 0) errors.images = "Add a thumbnail image";
  else if (images.length > L.galleryMax + 1)
    errors.images = `Use at most ${L.galleryMax} gallery images`;

  const sizes = strings(input.sizes).map((s) => s.toUpperCase()).filter(Boolean);
  if (sizes.length === 0) errors.sizes = "Add at least one size";
  else if (sizes.length > L.sizesMax) errors.sizes = `Use at most ${L.sizesMax} sizes`;
  else if (sizes.some((s) => !SIZE_PATTERN.test(s))) errors.sizes = "Sizes may only use letters and numbers (max 6)";
  else if (new Set(sizes).size !== sizes.length) errors.sizes = "Each size can only be added once";

  const colors = strings(input.colors).map((c) => c.replace(/\s+/g, " ")).filter(Boolean);
  const colorKeys = colors.map((c) => c.toLowerCase());
  if (colors.length > L.colorsMax) errors.colors = `Use at most ${L.colorsMax} colours`;
  else if (colors.some((c) => c.length > L.colorMax)) errors.colors = `Colour names must be under ${L.colorMax} characters`;
  else if (new Set(colorKeys).size !== colorKeys.length) errors.colors = "Each colour can only be added once";

  // Optional per-color images: { [colorName]: [url, ...] }
  const colorImages: Record<string, string[]> = {};
  const rawCI = input.colorImages;
  if (rawCI && typeof rawCI === "object" && !Array.isArray(rawCI)) {
    for (const [key, val] of Object.entries(rawCI as Record<string, unknown>)) {
      if (!colorKeys.includes(key.toLowerCase())) continue;
      const urls = Array.isArray(val) ? val.filter((u): u is string => typeof u === "string" && !!u) : [];
      if (urls.length) colorImages[key] = urls.slice(0, L.colorImagesMax);
    }
  }

  const features = strings(input.features).map((f) => f.replace(/\s+/g, " ")).filter(Boolean);
  if (features.length > L.featuresMax) errors.features = `Use at most ${L.featuresMax} features`;
  else if (features.some((f) => f.length > L.featureMax))
    errors.features = `Each feature must be under ${L.featureMax} characters`;

  const sizeChart: CleanSizeChartRow[] = [];
  const chartRows = Array.isArray(input.sizeChart) ? input.sizeChart : [];
  if (chartRows.length > L.chartRowsMax) errors.sizeChart = `Use at most ${L.chartRowsMax} rows`;
  else {
    for (const r of chartRows) {
      const row = (r && typeof r === "object" ? r : {}) as Record<string, unknown>;
      const size = text(row.size).toUpperCase();
      const chest = parseMeasure(row.chest);
      const length = parseMeasure(row.length);
      const shoulder = parseMeasure(row.shoulder);
      const empty = !size && chest === undefined && length === undefined && shoulder === undefined;
      if (empty) continue;
      if (!SIZE_PATTERN.test(size)) {
        errors.sizeChart = "Every size chart row needs a size";
        break;
      }
      if (chest === null || length === null || shoulder === null) {
        errors.sizeChart = `Measurements must be numbers up to ${L.measureMax} (e.g. 40 or 40.5)`;
        break;
      }
      sizeChart.push({ size, chest, length, shoulder });
    }
    const chartSizes = sizeChart.map((r) => r.size);
    if (!errors.sizeChart && new Set(chartSizes).size !== chartSizes.length)
      errors.sizeChart = "Each size can only appear once in the size chart";
  }

  const status: ProductStatus =
    input.status === "draft" || input.status === "scheduled" ? input.status : "active";
  let publishAt: Date | null = null;
  if (status === "scheduled") {
    const d = new Date(text(input.publishAt));
    if (Number.isNaN(d.getTime())) errors.publishAt = "Pick a publish date and time";
    else if (d.getTime() <= now.getTime()) errors.publishAt = "Publish time must be in the future";
    else publishAt = d;
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name,
      sku,
      category,
      description,
      regularPrice,
      salePrice,
      discount: discountPercent(regularPrice, salePrice),
      stock,
      images,
      colors,
      colorImages,
      sizes,
      features,
      sizeChart,
      isActive: status !== "draft",
      publishAt,
      isFeatured: input.isFeatured === true,
    },
  };
}
