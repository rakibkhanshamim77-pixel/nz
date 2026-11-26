import Link from "next/link";
import type { CategoryItem } from "@/db/actions/categories.action";
import { formatPrice, type CurrencySettings } from "@/db/settings";

interface Props {
  cat: CategoryItem;
  index: number;
  currency: CurrencySettings;
}

export default function CategoryCard({ cat, index, currency }: Props) {
  return (
    <Link
      href={`/shop?cat=${encodeURIComponent(cat.filter)}`}
      aria-label={`${cat.name}${cat.startingPrice > 0 ? ` — from ${formatPrice(cat.startingPrice, currency)}` : ""}`}
      className="group relative isolate overflow-hidden rounded-2xl aspect-[4/5] p-5 sm:p-6 flex flex-col justify-between text-white transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      style={{ background: cat.bgColor }}
    >
      {/* Accent circles */}
      <span
        aria-hidden="true"
        className="absolute -right-12 -top-12 -z-10 h-44 w-44 rounded-full opacity-15 transition-transform duration-500 group-hover:scale-125"
        style={{ backgroundColor: cat.accentColor }}
      />
      <span
        aria-hidden="true"
        className="absolute -left-14 -bottom-20 -z-10 h-52 w-52 rounded-full border border-white/10 transition-transform duration-500 group-hover:scale-110"
      />

      {/* Top row: index number + label badge */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-display font-extrabold text-5xl lg:text-6xl leading-none text-white/15">
          {(index + 1).toLocaleString("en-US", { minimumIntegerDigits: 2 })}
        </span>
        {cat.label && (
          <span
            className="rounded-full bg-white/10 backdrop-blur px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase"
            style={{ color: cat.accentColor }}
          >
            {cat.label}
          </span>
        )}
      </div>

      {/* Bottom row: name + price + CTA */}
      <div>
        <span
          aria-hidden="true"
          className="block h-0.5 w-8 rounded-full mb-3 transition-all duration-300 group-hover:w-14"
          style={{ backgroundColor: cat.accentColor }}
        />
        <b className="block font-display text-lg sm:text-xl lg:text-2xl leading-tight">
          {cat.name}
        </b>
        {cat.description && (
          <span className="block mt-1 text-xs sm:text-sm opacity-60 line-clamp-2">
            {cat.description}
          </span>
        )}
        {cat.startingPrice > 0 && (
          <span className="block mt-1 text-sm opacity-75">
            From {formatPrice(cat.startingPrice, currency)}
          </span>
        )}
        <span className="mt-4 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold">
          View Collection
          <span
            aria-hidden="true"
            className="grid place-items-center h-7 w-7 rounded-full bg-white text-gray-900 transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
