// ISR: regenerate at most every 60 s; purged immediately by admin product/content actions
export const revalidate = 60;

import { Suspense } from "react";
import Categories from "./components/Categories";

import TrustStrip from "./components/TrustStrip";
import HeroSection, { HeroSectionSkeleton } from "./components/HeroSection";
import Products from "./components/products/Products";
import SaleBanner from "./components/salebanner/SaleBanner";
import WhyUs from "./components/whyus/WhyUs";
import Reviews from "./components/reviews/Reviews";
import NewsLetter from "./components/news-letter/NewsLetter";
import { getContent } from "@/db/content.server";

export default async function Home() {
  const newsletter = await getContent("newsletter");
  return (
    <>
      <main className="pb-28 lg:pb-0">
        {/* Hero slider */}
        <Suspense fallback={<HeroSectionSkeleton />}>
          <HeroSection />
        </Suspense>
        {/* Trust strip */}
        <TrustStrip />
        {/* Categories */}
        <Categories />
        {/* Products */}
        <Products />
        {/* Sale banner */}
        <SaleBanner />
        {/* Why us */}
        <WhyUs />
        {/* Reviews */}
        <Reviews />
        {/* Newsletter */}
        {newsletter.isEnabled && (
          <NewsLetter title={newsletter.title} description={newsletter.description} />
        )}
      </main>
      {/* Footer */}

      {/* Mobile bottom nav */}
    </>
  );
}
