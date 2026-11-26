import Link from "next/link";
import { getCategories } from "@/db/actions/categories.action";
import { getCurrencySettings } from "@/db/settings.server";
import CategoryCard from "./CategoryCard";

export default async function Categories() {
  const [categories, currency] = await Promise.all([
    getCategories(4),
    getCurrencySettings(),
  ]);

  if (categories.length === 0) return null;

  return (
    <section id="cats" className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
      <div className="flex items-end justify-between gap-4 mb-7">
        <div>
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-mute mb-2">
            Collections
          </span>
          <h2 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight">
            Shop by Category
          </h2>
        </div>
        <Link
          href="/categories"
          className="group inline-flex items-center gap-1.5 shrink-0 text-sm font-medium text-mute hover:text-ink transition-colors"
        >
          View All
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {categories.map((cat, index) => (
          <CategoryCard key={cat.id} cat={cat} index={index} currency={currency} />
        ))}
      </div>
    </section>
  );
}
