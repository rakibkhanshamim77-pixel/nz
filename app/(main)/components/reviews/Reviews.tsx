import { getReviews } from "@/db/actions/review.action";
import ReviewsHeader from "./ReviewsHeader";
import ReviewsItem from "./ReviewsItem";

export default async function Reviews() {
  const reviews = await getReviews({ limit: 3 });

  // Nothing to show yet — hide the section instead of rendering an empty grid
  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 mt-24">
      <ReviewsHeader totalRev={reviews?.length} />
      <div className="grid md:grid-cols-3 gap-5">
        {reviews.map((review) => (
          <ReviewsItem key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
