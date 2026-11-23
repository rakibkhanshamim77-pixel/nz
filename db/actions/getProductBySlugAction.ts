"use server";

import mongoose from "mongoose";
import dbConnect from "../connect/dbConnect";
import Product from "../models/Product";
import Review from "../models/Review";
import type { ProductCardData } from "@/db/actions/product.action";
import type { ReviewItem } from "@/db/actions/review.action";
import type {
  ProductColor,
  ProductDetails,
  ProductSize,
  ProductSizeChartData,
  ReviewSummaryData,
  SizeChartRow,
} from "@/app/(main)/components/product/product.types";

/* ================================================================== */
/*  Small readers — tolerate strings, numbers, Decimal128, ObjectIds   */
/* ================================================================== */

type RawDoc = Record<string, unknown>;

const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

const num = (v: unknown): number | undefined => {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(String(v));
  return Number.isFinite(n) ? n : undefined;
};

const obj = (v: unknown): RawDoc | undefined =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as RawDoc) : undefined;

const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

const idOf = (v: unknown): string | undefined => {
  if (v == null) return undefined;
  const o = obj(v);
  if (o && "_id" in o) return String(o._id); // populated document
  return String(v);
};

const stripHtml = (s: string) =>
  s
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function imageUrl(v: unknown): string | undefined {
  if (typeof v === "string") return str(v);
  const o = obj(v);
  return o ? (str(o.url) ?? str(o.secure_url) ?? str(o.src)) : undefined;
}

function imageList(...sources: unknown[]): string[] {
  const urls = sources
    .flatMap((s) => (Array.isArray(s) ? s : [s]))
    .map(imageUrl)
    .filter((u): u is string => Boolean(u));
  return Array.from(new Set(urls));
}

function stringList(...sources: unknown[]): string[] {
  for (const s of sources) {
    if (typeof s === "string" && s.trim())
      return s
        .split(/\r?\n/)
        .map((x) => x.trim())
        .filter(Boolean);
    const list = arr(s)
      .map((x) => str(x))
      .filter((x): x is string => Boolean(x));
    if (list.length) return list;
  }
  return [];
}

function prices(p: RawDoc) {
  const listPrice = num(p.regularPrice) ?? num(p.price) ?? num(p.mrp);
  const offerPrice =
    num(p.salePrice) ?? num(p.discountPrice) ?? num(p.offerPrice);
  const salePrice = offerPrice ?? listPrice ?? 0;
  const regularPrice = Math.max(listPrice ?? salePrice, salePrice);
  const discount = Math.max(
    0,
    Math.round(
      num(p.discount) ??
        num(p.discountPercentage) ??
        (regularPrice > salePrice ? (1 - salePrice / regularPrice) * 100 : 0),
    ),
  );
  return { regularPrice, salePrice, discount };
}

/** Hidden / draft products are treated as not found */
function isVisible(p: RawDoc): boolean {
  if (p.isActive === false || p.isPublished === false || p.isDeleted === true)
    return false;
  // Scheduled products stay hidden until their publish time
  if (p.publishAt && new Date(String(p.publishAt)).getTime() > Date.now()) return false;
  const status = str(p.status)?.toLowerCase();
  return (
    !status || !["draft", "inactive", "archived", "hidden"].includes(status)
  );
}

/* ================================================================== */
/*  Product document  ->  ProductDetails                              */
/*  Adjust the field names here if your Product schema differs.       */
/* ================================================================== */

/** Used when the schema has no stock field, so the UI doesn't wrongly show "out of stock" */
const UNKNOWN_STOCK = 10;

const looksLikeCssColor = (s: string) =>
  /^#([0-9a-f]{3}){1,2}$/i.test(s) || /^[a-z]+$/i.test(s);

function readColors(p: RawDoc): ProductColor[] {
  // Per-color image overrides stored separately as { [colorName]: string[] }
  const ci = p.colorImages as Record<string, string[]> | null | undefined;

  return arr(p.colors ?? p.colorOptions)
    .map((c): ProductColor | null => {
      if (typeof c === "string" && c.trim()) {
        const name = c.trim();
        const colorSpecific = ci?.[name]?.filter((u): u is string => typeof u === "string" && !!u);
        return {
          name,
          hex: looksLikeCssColor(name) ? name : "#d4d4d4",
          ...(colorSpecific?.length ? { images: colorSpecific } : {}),
        };
      }
      const o = obj(c);
      if (!o) return null;
      const name = str(o.name) ?? str(o.label) ?? str(o.title);
      const hex = str(o.hex) ?? str(o.code) ?? str(o.value) ?? str(o.colorCode);
      if (!name && !hex) return null;
      // Object-style color: use its own images, fall back to colorImages override, then no override
      const inlineImages = imageList(o.images, o.image);
      const colorSpecific: string[] = name ? (ci?.[name]?.filter((u): u is string => typeof u === "string" && !!u) ?? []) : [];
      const images = inlineImages.length ? inlineImages : colorSpecific;
      return {
        name: name ?? hex!,
        hex: hex ?? (name && looksLikeCssColor(name) ? name : "#d4d4d4"),
        ...(images.length ? { images } : {}),
      };
    })
    .filter((c): c is ProductColor => c !== null);
}

function readSizes(p: RawDoc, fallbackStock: number): ProductSize[] {
  // 1) variants: [{ size, color, stock }] — add up stock per size
  const variants = arr(p.variants)
    .map(obj)
    .filter((v): v is RawDoc => Boolean(v));
  if (variants.some((v) => str(v.size))) {
    const totals = new Map<string, number>();
    for (const v of variants) {
      const label = str(v.size);
      if (!label) continue;
      totals.set(
        label,
        (totals.get(label) ?? 0) +
          (num(v.stock) ?? num(v.quantity) ?? num(v.qty) ?? 0),
      );
    }
    return Array.from(totals, ([label, stock]) => ({ label, stock }));
  }

  // 2) sizes: ["S","M"] or [{ size|label|name, stock|quantity|qty }]
  return arr(p.sizes ?? p.sizeOptions)
    .map((s): ProductSize | null => {
      if (typeof s === "string" && s.trim())
        return { label: s.trim(), stock: fallbackStock };
      const o = obj(s);
      if (!o) return null;
      const label = str(o.size) ?? str(o.label) ?? str(o.name);
      if (!label) return null;
      const stock = num(o.stock) ?? num(o.quantity) ?? num(o.qty);
      const available =
        o.available === false || o.inStock === false ? 0 : undefined;
      return { label, stock: available ?? stock ?? fallbackStock };
    })
    .filter((s): s is ProductSize => s !== null);
}

function readSizeChart(p: RawDoc): ProductSizeChartData | null {
  const raw = p.sizeChart ?? p.sizeGuide;
  const o = obj(raw);
  const rowsRaw = Array.isArray(raw) ? raw : arr(o?.rows ?? o?.data);

  const rows = rowsRaw
    .map(obj)
    .filter((r): r is RawDoc => Boolean(r))
    .map((r): SizeChartRow | null => {
      const size = str(r.size) ?? str(r.label);
      if (!size) return null;
      const cell = (v: unknown) => (num(v) ?? str(v) ?? "—") as number | string;
      return {
        size,
        chest: cell(r.chest),
        length: cell(r.length),
        shoulder: cell(r.shoulder),
      };
    })
    .filter((r): r is SizeChartRow => r !== null);

  if (!rows.length) return null;
  return {
    unit: str(o?.unit) ?? "ইঞ্চি",
    rows,
    note: str(o?.note) ?? str(p.sizeChartNote),
  };
}

function readCategory(p: RawDoc): {
  category?: ProductDetails["category"];
  categoryId?: string;
} {
  const raw = p.category;
  if (raw == null) return {};
  const o = obj(raw);
  if (o && ("name" in o || "slug" in o)) {
    // populated Category document
    const name = str(o.name) ?? str(o.title) ?? "";
    return {
      category: { name, slug: str(o.slug) ?? name },
      categoryId: idOf(o),
    };
  }
  if (typeof raw === "string")
    return { category: { name: raw, slug: raw }, categoryId: raw };
  return { categoryId: idOf(raw) }; // unpopulated ObjectId
}

function toProductDetails(p: RawDoc): ProductDetails | null {
  const _id = idOf(p._id);
  const name = str(p.name) ?? str(p.title);
  const slug = str(p.slug);
  if (!_id || !name || !slug) return null;

  const explicitStock =
    num(p.stock) ?? num(p.quantity) ?? num(p.countInStock) ?? num(p.inventory);
  const sizes = readSizes(p, explicitStock ?? UNKNOWN_STOCK);
  const stock =
    explicitStock ??
    (sizes.length ? sizes.reduce((sum, s) => sum + s.stock, 0) : UNKNOWN_STOCK);

  const created = p.createdAt ? new Date(String(p.createdAt)) : null;
  const isNew =
    typeof p.isNew === "boolean"
      ? p.isNew
      : created && !Number.isNaN(created.getTime())
        ? Date.now() - created.getTime() < 30 * 24 * 60 * 60 * 1000
        : false;

  const careRaw = p.care ?? p.careInstructions;
  const care = Array.isArray(careRaw)
    ? stringList(careRaw).join(", ")
    : str(careRaw);

  return {
    _id,
    name,
    slug,
    eyebrow:
      str(p.eyebrow) ?? str(p.subtitle) ?? str(p.productType) ?? str(p.type),
    ...readCategory(p),
    images: imageList(p.images, p.image, p.thumbnail, p.featuredImage),
    description: stripHtml(str(p.description) ?? str(p.shortDescription) ?? ""),
    descriptionHtml: str(p.description) ?? undefined,
    highlights: stringList(p.features, p.highlights, p.keyFeatures, p.details),
    fabric: str(p.fabric) ?? str(p.material),
    care,
    ...prices(p),
    isNew,
    colors: readColors(p),
    sizes,
    stock,
    sizeChart: readSizeChart(p),
  };
}

function toProductCard(p: RawDoc): ProductCardData | null {
  const _id = idOf(p._id);
  const name = str(p.name) ?? str(p.title);
  const slug = str(p.slug);
  if (!_id || !name || !slug) return null;
  return {
    _id,
    name,
    slug,
    images: imageList(p.images, p.image, p.thumbnail),
    ...prices(p),
  };
}

/* ================================================================== */
/*  Actions                                                           */
/* ================================================================== */

/** One product by slug, or null when it doesn't exist / is hidden. */
async function getProductBySlug(slug: string): Promise<ProductDetails | null> {
  // Plain strings only — an object here could be used as a MongoDB operator
  if (typeof slug !== "string") return null;
  const cleanSlug = decodeURIComponent(slug).trim();
  if (!cleanSlug || cleanSlug.length > 200) return null;

  try {
    await dbConnect();

    let query = Product.findOne({ slug: cleanSlug });
    // Only populate when category is a real reference in your schema
    const categoryPath = Product.schema.path("category") as
      | { options?: { ref?: unknown } }
      | undefined;
    if (categoryPath?.options?.ref)
      query = query.populate({ path: "category", select: "name slug" });

    const doc = await query.lean<RawDoc>().exec();
    if (!doc || !isVisible(doc)) return null;

    return toProductDetails(doc);
  } catch (error) {
    console.error("[getProductBySlug] failed:", error);
    return null;
  }
}

/** Reviews for one product (first page) + summary calculated by MongoDB, not by loading every review. */
async function getProductReviews(
  productId: string,
  limit = 6,
): Promise<{ reviews: ReviewItem[]; summary: ReviewSummaryData }> {
  const empty: ReviewSummaryData = {
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };

  if (typeof productId !== "string" || !mongoose.isValidObjectId(productId))
    return { reviews: [], summary: empty };

  try {
    await dbConnect();

    const productObjectId = new mongoose.Types.ObjectId(productId);
    // Unpublished reviews only show while developing locally
    const match: Record<string, unknown> = { product: productObjectId };
    if (process.env.NODE_ENV === "production") match.isPublished = true;

    const [docs, buckets] = await Promise.all([
      Review.find(match)
        .sort({ createdAt: -1 })
        .limit(Math.min(Math.max(1, limit), 24))
        .select("customerName avatarColor badge rating comment storeReply isVerifiedPurchase createdAt")
        .lean(),
      Review.aggregate<{ _id: number; count: number }>([
        { $match: match },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
    ]);

    const distribution = { ...empty.distribution };
    let total = 0;
    let sum = 0;
    for (const b of buckets) {
      const star = Math.min(5, Math.max(1, Math.round(b._id))) as
        | 1
        | 2
        | 3
        | 4
        | 5;
      distribution[star] += b.count;
      total += b.count;
      sum += star * b.count;
    }

    const reviews: ReviewItem[] = docs.map((r) => ({
      id: String(r._id),
      customerName: r.customerName,
      avatarColor: r.avatarColor ?? "#3b82f6",
      badge: r.badge ?? "ক্রেতা",
      rating: Math.min(5, Math.max(1, Math.round(r.rating))),
      comment: r.comment,
      storeReply: r.storeReply?.text ?? null,
      isVerifiedPurchase: Boolean(r.isVerifiedPurchase),
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : "",
    }));

    return {
      reviews,
      summary: {
        average: total ? Math.round((sum / total) * 10) / 10 : 0,
        total,
        distribution,
      },
    };
  } catch (error) {
    console.error("[getProductReviews] failed:", error);
    return { reviews: [], summary: empty };
  }
}

/** Up to `limit` products from the same category (current product excluded), topped up with newest products. */
async function getRelatedProducts(
  productId: string,
  categoryId?: string,
  limit = 4,
): Promise<ProductCardData[]> {
  if (typeof productId !== "string" || !mongoose.isValidObjectId(productId))
    return [];
  const max = Math.min(Math.max(1, limit), 12);

  try {
    await dbConnect();

    const excludeIds: unknown[] = [new mongoose.Types.ObjectId(productId)];
    const results: RawDoc[] = [];

    if (categoryId) {
      const sameCategory = await Product.find({
        _id: { $nin: excludeIds },
        category: categoryId,
      })
        .sort({ createdAt: -1 })
        .limit(max * 2) // a little extra in case some are hidden
        .select("name slug images regularPrice salePrice discount isActive publishAt")
        .lean<RawDoc[]>()
        .exec();
      results.push(...sameCategory.filter(isVisible).slice(0, max));
    }

    if (results.length < max) {
      excludeIds.push(...results.map((r) => r._id));
      const more = await Product.find({ _id: { $nin: excludeIds } })
        .sort({ createdAt: -1 })
        .limit((max - results.length) * 2)
        .select("name slug images regularPrice salePrice discount isActive publishAt")
        .lean<RawDoc[]>()
        .exec();
      results.push(...more.filter(isVisible).slice(0, max - results.length));
    }

    return results
      .map(toProductCard)
      .filter((p): p is ProductCardData => p !== null);
  } catch (error) {
    console.error("[getRelatedProducts] failed:", error);
    return [];
  }
}

export { getProductBySlug, getProductReviews, getRelatedProducts };
