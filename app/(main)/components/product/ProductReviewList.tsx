import type { ReviewItem } from "@/db/actions/review.action";
import ProductReviewCard from "./ProductReviewCard";

interface ProductReviewListProps {
  reviews: ReviewItem[];
}

export default function ProductReviewList({ reviews }: ProductReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="font-semibold mb-1">এখনো কোনো রিভিউ নেই</p>
        <p className="text-sm text-mute">
          এই পণ্যটি কিনে থাকলে প্রথম রিভিউটি আপনিই লিখুন।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ProductReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
