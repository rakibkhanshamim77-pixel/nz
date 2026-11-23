import type { ReviewItem } from "@/db/actions/review.action";
import ProductReviewForm from "./ProductReviewForm";
import ProductReviewList from "./ProductReviewList";
import ProductReviewSummary from "./ProductReviewSummary";
import type { ReviewSummaryData } from "./product.types";

interface ProductReviewSectionProps {
  reviews: ReviewItem[];
  summary: ReviewSummaryData;
  sizeOptions: string[];
  colorOptions: string[];
  productSlug: string;
}

export default function ProductReviewSection({
  reviews,
  summary,
  sizeOptions,
  colorOptions,
  productSlug,
}: ProductReviewSectionProps) {
  return (
    <section id="reviews" className="mt-16 sm:mt-20 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight">
          কাস্টমার রিভিউ
        </h2>
        <a
          href="#write-review"
          className="h-11 px-5 rounded-2xl bg-ink text-bg font-semibold inline-flex items-center gap-2 hover:opacity-90"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M4 20h4L19 9l-4-4L4 16z" />
            <path d="m13 7 4 4" />
          </svg>
          রিভিউ লিখুন
        </a>
      </div>

      <div className="grid lg:grid-cols-[340px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
        <ProductReviewSummary summary={summary} />
        <div>
          <ProductReviewForm
            sizeOptions={sizeOptions}
            colorOptions={colorOptions}
            productSlug={productSlug}
          />
          <ProductReviewList reviews={reviews} />
        </div>
      </div>
    </section>
  );
}
