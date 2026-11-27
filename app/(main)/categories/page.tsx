import type { Metadata } from "next";
import Link from "next/link";
import { getCategoriesPaginated } from "@/db/actions/categories.action";
import ScrollReveal from "../components/ScrollReveal";
import CategoriesPagination from "./_components/CategoriesPagination";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "সকল ক্যাটাগরি – Neeshanz",
  description: "Neeshanz-এর সকল পোশাক ক্যাটাগরি ব্রাউজ করুন।",
  alternates: { canonical: "/categories" },
};

const PAGE_SIZE = 12;

interface Props {
  searchParams: { page?: string };
}

export default async function CategoriesPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const { categories, total, totalPages } = await getCategoriesPaginated(page, PAGE_SIZE);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-28 lg:pb-16 mt-10">
      {/* header */}
      <ScrollReveal variant="fadeUp">
        <div className="mb-10">
          <nav className="flex items-center gap-1.5 text-xs text-mute mb-5">
            <Link href="/" className="hover:text-ink transition-colors">হোম</Link>
            <span>/</span>
            <span className="text-ink font-medium">সকল ক্যাটাগরি</span>
          </nav>
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-mute mb-2">
            Collections
          </p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight">
              সকল ক্যাটাগরি
            </h1>
            <p className="text-sm text-mute shrink-0">{total}টি ক্যাটাগরি</p>
          </div>
        </div>
      </ScrollReveal>

      {/* grid */}
      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-20 text-center">
          <p className="font-semibold text-ink mb-1">কোনো ক্যাটাগরি পাওয়া যায়নি</p>
          <p className="text-sm text-mute">শীঘ্রই নতুন ক্যাটাগরি যোগ হবে।</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat, index) => (
            <ScrollReveal key={cat.id} variant="fadeUp" delay={(index % 4) * 0.07}>
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
                    {String((page - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* name */}
                <div className="flex-1">
                  {cat.label && (
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-mute mb-1.5">
                      {cat.label}
                    </p>
                  )}
                  <p className="font-display font-bold text-lg sm:text-xl text-ink leading-snug">
                    {cat.name}
                  </p>
                  {cat.description && (
                    <p className="text-xs text-mute mt-1.5 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>

                {/* footer */}
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
      )}

      {/* pagination */}
      {totalPages > 1 && (
        <ScrollReveal variant="fadeUp" delay={0.1}>
          <CategoriesPagination currentPage={page} totalPages={totalPages} />
        </ScrollReveal>
      )}
    </main>
  );
}
