import dbConnect from "@/db/connect/dbConnect";
import Category from "@/db/models/Category";
import type { CategoryOption } from "../_components/form/formTypes";

/** Category choices for the product form. Products store the category's `filter` value, which the shop filters by. */
export async function loadCategoryOptions(keepValue?: string): Promise<CategoryOption[]> {
  await dbConnect();
  const cats = await Category.find({}).sort({ order: 1, name: 1 }).select("name filter isActive").lean();
  const options: CategoryOption[] = cats.map((c) => ({
    value: c.filter,
    label: `${c.name} (${c.filter})${c.isActive === false ? " · hidden" : ""}`,
  }));
  if (keepValue && !options.some((o) => o.value === keepValue))
    options.unshift({ value: keepValue, label: `${keepValue} (not a managed category)` });
  return options;
}
