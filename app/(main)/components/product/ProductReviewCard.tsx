import type { ReviewItem } from "@/db/actions/review.action";
import { starParts } from "./product.utils";

interface ProductReviewCardProps {
  review: ReviewItem;
}

export default function ProductReviewCard({ review }: ProductReviewCardProps) {
  const {
    customerName,
    avatarColor,
    badge,
    rating,
    comment,
    storeReply,
    isVerifiedPurchase,
    createdAt,
  } = review;
  const { filled, empty } = starParts(rating);

  // First grapheme, so Bengali letters keep their vowel sign
  const initial =
    new Intl.Segmenter("bn", { granularity: "grapheme" })
      .segment(customerName.trim())
      [Symbol.iterator]()
      .next().value?.segment ?? "?";

  const date = createdAt
    ? new Date(createdAt).toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <article className="card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold text-white"
          style={{ backgroundColor: avatarColor }}
          aria-hidden="true"
        >
          {initial}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <b className="truncate">{customerName}</b>
            {isVerifiedPurchase ? (
              <span className="text-[11px] font-semibold rounded-md bg-soft px-2 py-0.5">
                ✓ ভেরিফায়েড {badge}
              </span>
            ) : (
              badge && (
                <span className="text-[11px] rounded-md bg-soft px-2 py-0.5">
                  {badge}
                </span>
              )
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm">
            <span role="img" aria-label={`৫-এর মধ্যে ${rating}`}>
              <span className="text-yellow-400">{filled}</span>
              <span className="text-line">{empty}</span>
            </span>
            {date && (
              <time dateTime={createdAt} className="text-xs text-mute">
                {date}
              </time>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 text-[15px] leading-relaxed text-mute">{comment}</p>

      {storeReply && (
        <div className="mt-4 rounded-xl bg-soft p-3 text-sm">
          <b>স্টোর রিপ্লাই:</b> {storeReply}
        </div>
      )}
    </article>
  );
}
