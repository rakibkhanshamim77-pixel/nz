import type { ReviewItem } from "@/db/actions/review.action";
import ProductReviewCard from "./ProductReviewCard";

interface ProductReviewListProps {
  reviews: ReviewItem[];
}

export default function ProductReviewList({ reviews }: ProductReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="font-semibold mb-1">No reviews yet</p>
        <p className="text-sm text-mute">
          If you have purchased this product, be the first to write a review.
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
