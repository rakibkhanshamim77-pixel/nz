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

export interface CategoriesPage {
  categories: CategoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function toItem(c: Record<string, unknown>): CategoryItem {
  return {
    id: String(c._id),
    name: c.name as string,
    slug: c.slug as string,
    label: (c.label as string) ?? "",
    filter: c.filter as string,
    description: (c.description as string) ?? "",
    startingPrice: (c.startingPrice as number) ?? 0,
    bgColor: (c.bgColor as string) ?? "#1f2937",
    accentColor: (c.accentColor as string) ?? "#cbd5e1",
  };
}

async function getCategories(limit = 4): Promise<CategoryItem[]> {
  try {
    await dbConnect();
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(limit)
      .lean();
    return categories.map(toItem);
  } catch (error) {
    console.error("[getCategories] failed:", error);
    return [];
  }
}

async function getCategoriesPaginated(
  page = 1,
  pageSize = 12,
): Promise<CategoriesPage> {
  try {
    await dbConnect();
    const skip = (page - 1) * pageSize;
    const [docs, total] = await Promise.all([
      Category.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Category.countDocuments({ isActive: true }),
    ]);
    return {
      categories: docs.map(toItem),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error("[getCategoriesPaginated] failed:", error);
    return { categories: [], total: 0, page, pageSize, totalPages: 0 };
  }
}

export { getCategories, getCategoriesPaginated };
