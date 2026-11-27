import Link from "next/link";
import { getCategories } from "@/db/actions/categories.action";
import ScrollReveal from "./ScrollReveal";

export default async function Categories() {
  const categories = await getCategories(4);

  if (categories.length === 0) return null;

  return (
    <section id="cats" className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
      <ScrollReveal variant="fadeUp">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-mute mb-2">
              Collections
            </p>
            <h2 className="font-display font-bold text-2xl lg:text-3xl tracking-tight">
              ক্যাটাগরি অনুযায়ী কিনুন
            </h2>
          </div>
          <Link href="/categories" className="shrink-0 text-sm text-mute hover:text-ink transition-colors">
            সব দেখুন →
          </Link>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {categories.map((cat, index) => (
          <ScrollReveal key={cat.id} variant="fadeUp" delay={index * 0.07}>
            <Link
              href={`/shop?cat=${encodeURIComponent(cat.filter)}`}
              className="group flex flex-col p-5 sm:p-6 rounded-2xl bg-surface border border-line hover:border-transparent hover:shadow-xl transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink h-full"
            >
              {/* top — color circle + index number */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className="w-11 h-11 rounded-full ring-4 ring-white/60 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: cat.bgColor }}
                  aria-hidden="true"
                />
                <span className="font-display font-extrabold text-3xl text-ink/8 select-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* category name */}
              <div className="flex-1">
                {cat.label && (
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-mute mb-1.5">
                    {cat.label}
                  </p>
                )}
                <p className="font-display font-bold text-lg sm:text-xl lg:text-2xl text-ink leading-snug">
                  {cat.name}
                </p>
              </div>

              {/* bottom row */}
              <div className="mt-5 pt-4 border-t border-line flex items-center justify-between">
                <span className="text-xs sm:text-sm text-mute">
                  {cat.startingPrice > 0
                    ? `৳${cat.startingPrice.toLocaleString("en-US")} থেকে`
                    : "দেখুন"}
                </span>
                <span
                  aria-hidden="true"
                  className="text-sm font-semibold text-ink transition-transform duration-200 group-hover:translate-x-1 inline-block"
                >
                  →
                </span>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
