// Server component: fetches featured products from MongoDB and hands them to the client slider.

import { getFeaturedProducts } from "@/db/actions/product.action";
import HeroSlider from "./hero/HeroSlider";
import { DEMO_SLIDES } from "./heroSlider.demo";

export default async function HeroSection() {
  const slides = await getFeaturedProducts(5);

  if (slides.length === 0) {
    // Demo slides help while building; in production an empty hero simply isn't rendered
    return process.env.NODE_ENV === "development" ? (
      <HeroSlider slides={DEMO_SLIDES} />
    ) : null;
  }

  return <HeroSlider slides={slides} />;
}

/** Use as the <Suspense> fallback so the layout doesn't jump while the DB query runs */
export function HeroSectionSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading featured products">
      {/* Mobile skeleton: full-screen */}
      <div className="lg:hidden animate-pulse bg-soft" style={{ height: "calc(100dvh - 56px - 56px)" }} />

      {/* Desktop skeleton: 2-col grid */}
      <div className="hidden lg:block mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="animate-pulse space-y-5">
            <div className="h-8 w-36 rounded-lg bg-soft" />
            <div className="h-14 w-4/5 rounded-xl bg-soft" />
            <div className="h-5 w-full max-w-md rounded bg-soft" />
            <div className="h-5 w-2/3 max-w-md rounded bg-soft" />
            <div className="h-10 w-48 rounded-lg bg-soft" />
            <div className="h-12 w-40 rounded-xl bg-soft" />
          </div>
          <div className="aspect-[4/4.6] animate-pulse rounded-3xl bg-soft" />
        </div>
      </div>
    </section>
  );
}
