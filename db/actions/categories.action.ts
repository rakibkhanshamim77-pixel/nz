"use server";

import dbConnect from "../connect/dbConnect";
import Category from "../models/Category";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  label: string;
  filter: string;
  description: string;
  startingPrice: number;
  bgColor: string;
  accentColor: string;
}

async function getCategories(limit = 4): Promise<CategoryItem[]> {
  try {
    await dbConnect();

    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(limit)
      .lean();

    // Plain, serializable objects (no ObjectId / Date)
    return categories.map((c) => ({
      id: String(c._id),
      name: c.name,
      slug: c.slug,
      label: c.label ?? "",
      filter: c.filter,
      description: c.description ?? "",
      startingPrice: c.startingPrice ?? 0,
      bgColor: c.bgColor ?? "#1f2937",
      accentColor: c.accentColor ?? "#cbd5e1",
    }));
  } catch (error) {
    console.error("[getCategories] failed:", error);
    return [];
  }
}

export { getCategories };
