import type { CategoryItem } from "@/db/actions/categories.action";
import type { CurrencySettings } from "@/db/settings";
import CategoryCard from "@/app/(main)/components/CategoryCard";
import Link from "next/link";

interface Props {
  categories: CategoryItem[];
  currency: CurrencySettings;
}

export default function CategoriesGrid({ categories, currency }: Props) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div
          className="w-20 h-20 rounded-3xl grid place-items-center"
          style={{ background: "var(--soft)" }}
        >
          <svg
            className="w-9 h-9 text-mute"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path d="M3 7h18M3 12h18M3 17h18" />
          </svg>
        </div>
        <p className="text-mute text-sm">No categories found.</p>
        <Link
          href="/shop"
          className="mt-2 h-10 px-6 rounded-2xl bg-ink text-bg text-sm font-semibold flex items-center hover:opacity-90 transition-opacity"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      {categories.map((cat, index) => (
        <CategoryCard key={cat.id} cat={cat} index={index} currency={currency} />
      ))}
    </div>
  );
}
