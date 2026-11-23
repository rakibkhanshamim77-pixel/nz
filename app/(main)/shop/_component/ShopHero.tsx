"use client";

import { Suspense } from "react";
import { useShopUrl } from "./useShopUrl";
import type { CategoryItem } from "@/db/actions/categories.action";

interface Props {
  categories: CategoryItem[];
  totalCount: number;
}

function HeroChips({ categories }: { categories: CategoryItem[] }) {
  const { cats, toggleCat, reset } = useShopUrl();

  return (
    <div className="flex flex-wrap gap-2 mt-7">
      <button
        type="button"
        onClick={reset}
        className={[
          "h-9 px-4 rounded-full text-sm font-semibold transition",
          cats.length === 0
            ? "bg-ink text-bg"
            : "border border-line bg-surface text-ink hover:border-ink hover:bg-soft",
        ].join(" ")}
      >
        সব পণ্য
      </button>
      {categories.map((cat) => {
        const active = cats.includes(cat.filter);
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => toggleCat(cat.filter)}
            className={[
              "h-9 px-4 rounded-full text-sm font-semibold transition",
              active
                ? "bg-ink text-bg"
                : "border border-line bg-surface text-ink hover:border-ink hover:bg-soft",
            ].join(" ")}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}

export default function ShopHero({ categories, totalCount }: Props) {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-soft border border-line mb-8 px-6 py-10 sm:px-10 sm:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-[0.07]"
        style={{ background: "var(--wine)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-10 w-56 h-56 rounded-full opacity-[0.05]"
        style={{ background: "var(--wine)" }}
      />

      <div className="relative z-10 max-w-xl">
        <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full border border-line bg-surface text-xs font-semibold text-mute tracking-wide uppercase mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-wine" />
          {totalCount} টি পণ্য
        </span>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-ink leading-[1.05] mb-3">
          আমাদের কালেকশন
        </h1>
        <p className="text-mute text-base sm:text-lg leading-relaxed">
          প্রিমিয়াম টি-শার্ট, পোলো ও শার্ট — সেরা কোয়ালিটিতে সেরা দামে।
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-wrap gap-2 mt-7">
            {[90, 70, 80, 65].map((w) => (
              <span
                key={w}
                className="h-9 rounded-full bg-line animate-pulse"
                style={{ width: w }}
              />
            ))}
          </div>
        }
      >
        <HeroChips categories={categories} />
      </Suspense>
    </div>
  );
}
