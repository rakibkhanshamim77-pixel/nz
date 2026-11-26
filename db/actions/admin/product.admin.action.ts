"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/app/utils/authz";
import dbConnect from "@/db/connect/dbConnect";
import Product from "@/db/models/Product";
import Category from "@/db/models/Category";
import { isKnownImageUrl } from "@/db/utils/imageHosts";
import { slugify } from "@/db/utils/slug";
import {
  PRODUCT_LIMITS,
  parseWhole,
  validateProduct,
  type CleanProduct,
  type ProductFieldKey,
} from "@/db/validation/product.validation";
import type { ActionResult } from "./types";

type ProductResult = ActionResult<{ id: string; slug: string }, ProductFieldKey>;

const NOT_ALLOWED = "You don't have permission to manage products.";
const GENERIC = "Something went wrong while saving. Please try again.";

function revalidateStore() {
  revalidatePath("/", "layout");
}

async function uniqueSlug(name: string, sku: string): Promise<string> {
  const base = slugify(name) || slugify(sku) || "product";
  for (let i = 0; i < 25; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    if (!(await Product.exists({ slug: candidate }))) return candidate;
  }
  return `${base}-${new mongoose.Types.ObjectId().toString().slice(-6)}`;
}

/** Shared checks that need the database. `current` is the product being edited, if any. */
async function checkAgainstDb(
  data: CleanProduct,
  current?: { _id: unknown; category: string; images: string[]; colorImages?: Record<string, string[]> },
): Promise<Partial<Record<ProductFieldKey, string>>> {
  const errors: Partial<Record<ProductFieldKey, string>> = {};
  const keptImages = new Set(current?.images ?? []);
  // Existing color-specific images count as "kept" so they aren't re-uploaded on edit
  for (const urls of Object.values(current?.colorImages ?? {}))
    urls.forEach((u) => keptImages.add(u));

  if (data.images.some((u) => !isKnownImageUrl(u) && !keptImages.has(u)))
    errors.images = "One or more images didn't upload correctly. Re-add them and try again.";

  // Validate color image URLs
  for (const urls of Object.values(data.colorImages)) {
    if (urls.some((u) => !isKnownImageUrl(u) && !keptImages.has(u))) {
      errors.colorImages = "One or more color images didn't upload correctly. Re-add them and try again.";
      break;
    }
  }

  const categoryUnchanged = current && current.category === data.category;
  if (!categoryUnchanged && !(await Category.exists({ filter: data.category })))
    errors.category = "This category no longer exists. Choose another one.";

  const skuTaken = await Product.exists({
    sku: data.sku,
    ...(current ? { _id: { $ne: current._id } } : {}),
  });
  if (skuTaken) errors.sku = "Another product already uses this SKU";

  return errors;
}

function isDuplicateKey(error: unknown): error is { code: number; keyPattern?: Record<string, unknown> } {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === 11000;
}

export async function createProduct(payload: unknown): Promise<ProductResult> {
  if (!(await requirePermission("product_management"))) return { ok: false, error: NOT_ALLOWED };

  const result = validateProduct(payload);
  if (!result.ok) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: result.errors };
  const data = result.data;

  try {
    await dbConnect();
    const fieldErrors = await checkAgainstDb(data);
    if (Object.keys(fieldErrors).length)
      return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };

    const product = await Product.create({ ...data, slug: await uniqueSlug(data.name, data.sku) });
    revalidateStore();
    return { ok: true, data: { id: String(product._id), slug: product.slug } };
  } catch (error) {
    if (isDuplicateKey(error) && error.keyPattern?.sku)
      return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: { sku: "Another product already uses this SKU" } };
    console.error("[createProduct]", error);
    return { ok: false, error: GENERIC };
  }
}

/**
 * Replaces every field the form manages and leaves everything else (slug, brand, ratings…) untouched.
 * `expectedUpdatedAt` guards against overwriting someone else's newer edit.
 */
export async function updateProduct(
  productId: string,
  payload: unknown,
  expectedUpdatedAt?: string,
): Promise<ProductResult> {
  if (!(await requirePermission("product_management"))) return { ok: false, error: NOT_ALLOWED };
  if (typeof productId !== "string" || !mongoose.isValidObjectId(productId))
    return { ok: false, error: "Invalid product id." };

  const result = validateProduct(payload);
  if (!result.ok) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: result.errors };
  const data = result.data;

  try {
    await dbConnect();
    const current = await Product.findById(productId).select("category images colorImages slug updatedAt").lean();
    if (!current) return { ok: false, error: "This product no longer exists." };

    if (
      expectedUpdatedAt &&
      current.updatedAt &&
      new Date(current.updatedAt).toISOString() !== expectedUpdatedAt
    )
      return {
        ok: false,
        error: "This product was changed somewhere else since you opened it. Reload the page to get the latest version.",
      };

    const fieldErrors = await checkAgainstDb(data, current);
    if (Object.keys(fieldErrors).length)
      return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };

    await Product.updateOne({ _id: current._id }, { $set: data }, { runValidators: true });
    revalidateStore();
    return { ok: true, data: { id: productId, slug: current.slug } };
  } catch (error) {
    if (isDuplicateKey(error) && error.keyPattern?.sku)
      return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: { sku: "Another product already uses this SKU" } };
    console.error("[updateProduct]", error);
    return { ok: false, error: GENERIC };
  }
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  if (!(await requirePermission("product_management"))) return { ok: false, error: NOT_ALLOWED };
  if (typeof productId !== "string" || !mongoose.isValidObjectId(productId))
    return { ok: false, error: "Invalid product id." };

  try {
    await dbConnect();
    const deleted = await Product.findByIdAndDelete(productId).select("_id").lean();
    if (!deleted) return { ok: false, error: "This product was already deleted." };
    revalidateStore();
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[deleteProduct]", error);
    return { ok: false, error: "Couldn't delete the product. Please try again." };
  }
}

export async function setProductFeatured(productId: string, featured: boolean): Promise<ActionResult> {
  if (!(await requirePermission("product_management"))) return { ok: false, error: NOT_ALLOWED };
  if (typeof productId !== "string" || !mongoose.isValidObjectId(productId) || typeof featured !== "boolean")
    return { ok: false, error: "Invalid request." };

  try {
    await dbConnect();
    const res = await Product.updateOne({ _id: productId }, { $set: { isFeatured: featured } });
    if (!res.matchedCount) return { ok: false, error: "This product no longer exists." };
    revalidateStore();
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[setProductFeatured]", error);
    return { ok: false, error: "Couldn't update the product. Please try again." };
  }
}

export async function updateProductStock(productId: string, stock: unknown): Promise<ActionResult<{ stock: number }>> {
  if (!(await requirePermission("product_management"))) return { ok: false, error: NOT_ALLOWED };
  if (typeof productId !== "string" || !mongoose.isValidObjectId(productId))
    return { ok: false, error: "Invalid product id." };

  const value = parseWhole(stock);
  if (Number.isNaN(value) || value > PRODUCT_LIMITS.stockMax)
    return { ok: false, error: `Stock must be a whole number from 0 to ${PRODUCT_LIMITS.stockMax.toLocaleString("en-US")}.` };

  try {
    await dbConnect();
    const res = await Product.updateOne({ _id: productId }, { $set: { stock: value } });
    if (!res.matchedCount) return { ok: false, error: "This product no longer exists." };
    revalidateStore();
    return { ok: true, data: { stock: value } };
  } catch (error) {
    console.error("[updateProductStock]", error);
    return { ok: false, error: "Couldn't update stock. Please try again." };
  }
}
