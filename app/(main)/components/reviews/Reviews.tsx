import { getReviews } from "@/db/actions/review.action";
import ReviewsHeader from "./ReviewsHeader";
import ReviewsItem from "./ReviewsItem";
import ScrollReveal from "../ScrollReveal";

export default async function Reviews() {
  const reviews = await getReviews({ limit: 3 });

  // Nothing to show yet — hide the section instead of rendering an empty grid
  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 mt-24">
      <ScrollReveal variant="fadeUp">
        <ReviewsHeader totalRev={reviews?.length} />
      </ScrollReveal>
      <div className="grid md:grid-cols-3 gap-5">
        {reviews.map((review, index) => (
          <ScrollReveal key={review.id} variant="fadeUp" delay={index * 0.1}>
            <ReviewsItem review={review} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
