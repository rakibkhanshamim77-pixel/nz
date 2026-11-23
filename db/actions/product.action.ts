"use server";

import dbConnect from "../connect/dbConnect";
import Product from "../models/Product";
import { publishedProductFilter } from "@/db/utils/productVisibility";
import {
  toBengaliDigits,
  type HeroSlide,
  type HeroSlideColor,
} from "@/app/(main)/components/hero/heroSlider.shared";

/* ------------------------------------------------------------------ */
/*  Mapping: Mongo product document  ->  HeroSlide                     */
/*  Field names are matched flexibly (title/name, salePrice/discount-  */
/*  Price, images[]/thumbnail…). Adjust here if your schema differs.   */
/* ------------------------------------------------------------------ */

type RawDoc = Record<string, unknown>;

const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

/** Handles numbers, numeric strings and Decimal128 (via toString) */
const num = (v: unknown): number | undefined => {
  if (v == null) return undefined;
  const n = typeof v === "number" ? v : Number(String(v));
  return Number.isFinite(n) ? n : undefined;
};

const stripHtml = (s: string) =>
  s
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (s: string, max = 160) =>
  s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;

function imageUrl(v: unknown): string | undefined {
  if (typeof v === "string") return str(v);
  if (v && typeof v === "object") {
    const o = v as RawDoc;
    return str(o.url) ?? str(o.secure_url) ?? str(o.src);
  }
  return undefined;
}

function pickImage(p: RawDoc): string | undefined {
  const candidates: unknown[] = [
    p.image,
    p.thumbnail,
    p.featuredImage,
    ...(Array.isArray(p.images) ? p.images : []),
  ];
  for (const c of candidates) {
    const url = imageUrl(c);
    if (url) return url;
  }
  return undefined;
}

function pickStrings(...values: unknown[]): string[] {
  for (const v of values) {
    if (Array.isArray(v)) {
      const list = v.map((x) => str(x)).filter((x): x is string => Boolean(x));
      if (list.length) return list;
    }
  }
  return [];
}

function pickColors(v: unknown): HeroSlideColor[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((c): HeroSlideColor | null => {
      if (typeof c === "string" && c.trim())
        return { name: c.trim(), hex: c.trim() }; // "maroon" / "#7f1d1d" are both valid CSS
      if (c && typeof c === "object") {
        const o = c as RawDoc;
        const hex = str(o.hex) ?? str(o.code) ?? str(o.value);
        const name = str(o.name) ?? hex;
        return hex && name ? { name, hex } : null;
      }
      return null;
    })
    .filter((c): c is HeroSlideColor => c !== null)
    .slice(0, 5);
}

function toHeroSlide(p: RawDoc): HeroSlide | null {
  const id = p._id != null ? String(p._id) : "";
  const title = str(p.title) ?? str(p.name);
  const slug = str(p.slug);
  const src = pickImage(p);

  // A slide without these can't be rendered or linked — skip it
  if (!id || !title || !slug || !src) return null;

  const listPrice = num(p.regularPrice) ?? num(p.price) ?? num(p.mrp);
  const offerPrice =
    num(p.salePrice) ?? num(p.discountPrice) ?? num(p.offerPrice);

  const regularPrice = Math.max(listPrice ?? offerPrice ?? 0, offerPrice ?? 0);
  const salePrice = offerPrice ?? regularPrice;

  const discount = Math.max(
    0,
    Math.round(
      num(p.discountPercentage) ??
        num(p.discount) ??
        (regularPrice > salePrice ? (1 - salePrice / regularPrice) * 100 : 0),
    ),
  );

  const rawDescription = str(p.shortDescription) ?? str(p.description) ?? "";

  return {
    id,
    slug,
    title,
    badge:
      str(p.badge) ??
      (discount > 0
        ? `-${toBengaliDigits(discount)}% ডিসকাউন্ট`
        : "ফিচার্ড প্রোডাক্ট"),
    description: truncate(stripHtml(rawDescription)),
    regularPrice,
    salePrice,
    discount,
    features: pickStrings(p.features, p.highlights, p.keyFeatures).slice(0, 4),
    image: { src, alt: str(p.imageAlt) ?? title },
    colors: pickColors(p.colors),
  };
}

/* ------------------------------------------------------------------ */
/*  Server action                                                      */
/* ------------------------------------------------------------------ */

/**
 * Featured products shaped for the hero slider.
 * Always resolves to an array (empty on error) and only contains plain, serializable values,
 * so it can be passed straight to a client component.
 */
async function getFeaturedProducts(limit = 5): Promise<HeroSlide[]> {
  try {
    await dbConnect();

    const docs = await Product.find({ isFeatured: true, ...publishedProductFilter() })
      .sort({ updatedAt: -1, _id: -1 })
      .limit(Math.min(Math.max(1, limit), 10))
      .select("name slug images thumbnail regularPrice salePrice discount discountPercentage features highlights badge shortDescription description colors isFeatured")
      .lean<RawDoc[]>()
      .exec();

    return docs.map(toHeroSlide).filter((s): s is HeroSlide => s !== null);
  } catch (error) {
    console.error("[getFeaturedProducts] failed:", error);
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Product cards (Products section / shop grid)                       */
/* ------------------------------------------------------------------ */

export interface ProductCardData {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  regularPrice: number;
  salePrice: number;
  /** Discount percentage, 0 when there is no discount */
  discount: number;
  rating?: number;
  reviewCount?: number;
}

export interface GetProductsOptions {
  /** Max products to return (default 8, capped at 48) */
  limit?: number;
  /** Only featured products */
  featured?: boolean;
}

function toProductCard(p: RawDoc): ProductCardData | null {
  const _id = p._id != null ? String(p._id) : "";
  const name = str(p.name) ?? str(p.title);
  const slug = str(p.slug);

  // A card without these can't be rendered or linked — skip it
  if (!_id || !name || !slug) return null;

  const images = (Array.isArray(p.images) ? p.images : [p.image, p.thumbnail])
    .map(imageUrl)
    .filter((url): url is string => Boolean(url));

  const listPrice = num(p.regularPrice) ?? num(p.price);
  const offerPrice = num(p.salePrice);

  const salePrice = offerPrice ?? listPrice ?? 0;
  const regularPrice = Math.max(listPrice ?? salePrice, salePrice);

  const discount = Math.max(
    0,
    Math.round(
      num(p.discount) ??
        (regularPrice > salePrice ? (1 - salePrice / regularPrice) * 100 : 0),
    ),
  );

  return {
    _id,
    name,
    slug,
    images,
    regularPrice,
    salePrice,
    discount,
    rating: num(p.rating) ?? num(p.averageRating),
    reviewCount: num(p.reviewCount) ?? num(p.numReviews),
  };
}

/**
 * Products shaped for product cards.
 * Always resolves to an array (empty on error) of plain, serializable objects.
 */
async function getProducts({
  limit = 8,
  featured = false,
}: GetProductsOptions = {}): Promise<ProductCardData[]> {
  try {
    await dbConnect();

    const filter = featured
      ? { isFeatured: true, ...publishedProductFilter() }
      : publishedProductFilter();

    const docs = await Product.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(Math.min(Math.max(1, limit), 48))
      .select("name slug images regularPrice salePrice discount rating reviewCount")
      .lean<RawDoc[]>()
      .exec();

    return docs
      .map(toProductCard)
      .filter((p): p is ProductCardData => p !== null);
  } catch (error) {
    console.error("[getProducts] failed:", error);
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Shop page — filtered / paginated / searchable product listing       */
/* ------------------------------------------------------------------ */

export interface ShopProductCardData {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  regularPrice: number;
  salePrice: number;
  discount: number;
  rating?: number;
  reviewCount?: number;
  sizes: string[];
  colors: string[];
  stock: number;
  category: string;
}

export interface ShopQueryParams {
  q?: string;
  categories?: string[];
  sizes?: string[];
  colors?: string[];
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  sort?: string;
  page?: number;
}

export interface ShopResult {
  products: ShopProductCardData[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

const SHOP_PER_PAGE = 9;

function toShopCard(p: RawDoc): ShopProductCardData | null {
  const base = toProductCard(p);
  if (!base) return null;

  const sizes = Array.isArray(p.sizes)
    ? (p.sizes as unknown[]).map((s) => str(s)).filter((s): s is string => Boolean(s))
    : [];

  const colors = Array.isArray(p.colors)
    ? (p.colors as unknown[])
        .map((c) => {
          if (typeof c === "string") return str(c) ?? null;
          if (c && typeof c === "object") {
            const o = c as RawDoc;
            return str(o.name) ?? str(o.hex) ?? null;
          }
          return null;
        })
        .filter((c): c is string => c !== null)
    : [];

  return {
    ...base,
    sizes,
    colors,
    stock: num(p.stock) ?? 0,
    category: str(p.category) ?? "",
  };
}

async function getShopProducts(params: ShopQueryParams = {}): Promise<ShopResult> {
  const page = Math.max(1, params.page ?? 1);
  const skip = (page - 1) * SHOP_PER_PAGE;

  // Build MongoDB filter
  const filter: Record<string, unknown> = { ...publishedProductFilter() };

  if (params.q?.trim()) {
    filter.name = { $regex: params.q.trim(), $options: "i" };
  }
  if (params.categories?.length) {
    filter.category = { $in: params.categories };
  }
  if (params.sizes?.length) {
    filter.sizes = { $in: params.sizes };
  }
  if (params.colors?.length) {
    filter.colors = { $in: params.colors };
  }
  if (params.maxPrice && params.maxPrice < 10000) {
    filter.salePrice = { $lte: params.maxPrice };
  }
  if (params.inStock) {
    filter.stock = { $gt: 0 };
  }
  if (params.onSale) {
    filter.discount = { $gt: 0 };
  }

  // Sort
  const sortMap: Record<string, Record<string, 1 | -1>> = {
    new:  { createdAt: -1 },
    lo:   { salePrice: 1 },
    hi:   { salePrice: -1 },
    rate: { rating: -1, _id: -1 },
    pop:  { isFeatured: -1, createdAt: -1, _id: -1 },
  };
  const sortQuery = sortMap[params.sort ?? "pop"] ?? sortMap.pop;

  try {
    await dbConnect();

    const [docs, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(SHOP_PER_PAGE)
        .select("name slug images regularPrice salePrice discount rating reviewCount sizes colors stock category")
        .lean<RawDoc[]>()
        .exec(),
      Product.countDocuments(filter),
    ]);

    const products = docs
      .map(toShopCard)
      .filter((p): p is ShopProductCardData => p !== null);

    return {
      products,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / SHOP_PER_PAGE)),
      currentPage: page,
    };
  } catch (error) {
    console.error("[getShopProducts] failed:", error);
    return { products: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }
}

export { getFeaturedProducts, getProducts, getShopProducts };
