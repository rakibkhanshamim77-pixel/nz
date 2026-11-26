"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/app/utils/authz";
import dbConnect from "@/db/connect/dbConnect";
import Category from "@/db/models/Category";
import Product from "@/db/models/Product";
import {
  validateCategory,
  type CategoryFieldErrors,
  type CategoryFieldKey,
  type CleanCategory,
} from "@/db/validation/category.validation";
import type { ActionResult } from "./types";

type CategoryResult = ActionResult<{ id: string }, CategoryFieldKey>;

const NOT_ALLOWED = "You don't have permission to manage categories.";
const FIX = "Please fix the highlighted fields.";
/** Case-insensitive comparison for name / filter uniqueness */
const CI = { locale: "en", strength: 2 } as const;

function revalidateStore() {
  revalidatePath("/", "layout");
}

async function uniquenessErrors(data: CleanCategory, excludeId?: string): Promise<CategoryFieldErrors> {
  const notSelf = excludeId ? { _id: { $ne: new mongoose.Types.ObjectId(excludeId) } } : {};
  const [name, slug, filter] = await Promise.all([
    Category.findOne({ name: data.name, ...notSelf }).collation(CI).select("_id").lean(),
    Category.findOne({ slug: data.slug, ...notSelf }).select("_id").lean(),
    Category.findOne({ filter: data.filter, ...notSelf }).collation(CI).select("_id").lean(),
  ]);
  const errors: CategoryFieldErrors = {};
  if (name) errors.name = "A category with this name already exists";
  if (slug) errors.slug = "This slug is already used by another category";
  if (filter) errors.filter = "Another category already uses this filter value";
  return errors;
}

function duplicateKeyField(error: unknown): CategoryFieldKey | null {
  if (typeof error !== "object" || error === null || (error as { code?: unknown }).code !== 11000) return null;
  const key = Object.keys((error as { keyPattern?: Record<string, unknown> }).keyPattern ?? {})[0];
  return key === "slug" || key === "name" || key === "filter" ? key : "slug";
}

export async function createCategory(payload: unknown): Promise<CategoryResult> {
  if (!(await requirePermission("product_management"))) return { ok: false, error: NOT_ALLOWED };
  const result = validateCategory(payload);
  if (!result.ok) return { ok: false, error: FIX, fieldErrors: result.errors };

  try {
    await dbConnect();
    const fieldErrors = await uniquenessErrors(result.data);
    if (Object.keys(fieldErrors).length) return { ok: false, error: FIX, fieldErrors };

    const created = await Category.create(result.data);
    revalidateStore();
    return { ok: true, data: { id: String(created._id) } };
  } catch (error) {
    const field = duplicateKeyField(error);
    if (field) return { ok: false, error: FIX, fieldErrors: { [field]: "This value is already in use" } };
    console.error("[createCategory]", error);
    return { ok: false, error: "Couldn't create the category. Please try again." };
  }
}

/** Updates a category. If its filter value changes, products in it are moved to the new value. */
export async function updateCategory(categoryId: string, payload: unknown): Promise<CategoryResult> {
  if (!(await requirePermission("product_management"))) return { ok: false, error: NOT_ALLOWED };
  if (typeof categoryId !== "string" || !mongoose.isValidObjectId(categoryId))
    return { ok: false, error: "Invalid category id." };
  const result = validateCategory(payload);
  if (!result.ok) return { ok: false, error: FIX, fieldErrors: result.errors };
  const data = result.data;

  try {
    await dbConnect();
    const current = await Category.findById(categoryId).select("filter").lean();
    if (!current) return { ok: false, error: "This category no longer exists." };

    const fieldErrors = await uniquenessErrors(data, categoryId);
    if (Object.keys(fieldErrors).length) return { ok: false, error: FIX, fieldErrors };

    await Category.updateOne({ _id: current._id }, { $set: data }, { runValidators: true });

    if (current.filter !== data.filter) {
      try {
        await Product.updateMany({ category: current.filter }, { $set: { category: data.filter } });
      } catch (error) {
        console.error("[updateCategory] product move failed", error);
        revalidateStore();
        return {
          ok: false,
          error: `The category was saved, but its products couldn't be moved to "${data.filter}". Save again to retry.`,
        };
      }
    }

    revalidateStore();
    return { ok: true, data: { id: categoryId } };
  } catch (error) {
    const field = duplicateKeyField(error);
    if (field) return { ok: false, error: FIX, fieldErrors: { [field]: "This value is already in use" } };
    console.error("[updateCategory]", error);
    return { ok: false, error: "Couldn't update the category. Please try again." };
  }
}

/**
 * Deletes a category. When products still use it, `reassignTo` (another category's filter value)
 * is required and those products are moved there first — no product is ever left orphaned.
 */
export async function deleteCategory(
  categoryId: string,
  reassignTo?: string,
): Promise<ActionResult<{ moved: number }>> {
  if (!(await requirePermission("product_management"))) return { ok: false, error: NOT_ALLOWED };
  if (typeof categoryId !== "string" || !mongoose.isValidObjectId(categoryId))
    return { ok: false, error: "Invalid category id." };

  try {
    await dbConnect();
    const category = await Category.findById(categoryId).select("filter name").lean();
    if (!category) return { ok: false, error: "This category was already deleted." };

    const inUse = await Product.countDocuments({ category: category.filter });
    let moved = 0;

    if (inUse > 0) {
      if (typeof reassignTo !== "string" || !reassignTo.trim())
        return { ok: false, error: `${inUse} product${inUse > 1 ? "s use" : " uses"} this category. Choose where to move ${inUse > 1 ? "them" : "it"} first.` };
      const target = await Category.findOne({ filter: reassignTo.trim(), _id: { $ne: category._id } })
        .select("filter")
        .lean();
      if (!target) return { ok: false, error: "The category to move products to doesn't exist." };

      const res = await Product.updateMany({ category: category.filter }, { $set: { category: target.filter } });
      moved = res.modifiedCount;
      if (await Product.exists({ category: category.filter }))
        return { ok: false, error: "Some products couldn't be moved, so the category was kept. Please try again." };
    }

    await Category.deleteOne({ _id: category._id });
    revalidateStore();
    return { ok: true, data: { moved } };
  } catch (error) {
    console.error("[deleteCategory]", error);
    return { ok: false, error: "Couldn't delete the category. Please try again." };
  }
}

export async function setCategoryActive(categoryId: string, isActive: boolean): Promise<ActionResult> {
  if (!(await requirePermission("product_management"))) return { ok: false, error: NOT_ALLOWED };
  if (typeof categoryId !== "string" || !mongoose.isValidObjectId(categoryId) || typeof isActive !== "boolean")
    return { ok: false, error: "Invalid request." };

  try {
    await dbConnect();
    const res = await Category.updateOne({ _id: categoryId }, { $set: { isActive } });
    if (!res.matchedCount) return { ok: false, error: "This category no longer exists." };
    revalidateStore();
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[setCategoryActive]", error);
    return { ok: false, error: "Couldn't update the category. Please try again." };
  }
}
