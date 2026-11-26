import type { ReviewItem } from "@/db/actions/review.action";

export interface ReviewsItemProps {
  review: ReviewItem;
}

export default function ReviewsItem({ review }: ReviewsItemProps) {
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

  // First grapheme, so Bengali letters keep their vowel sign (e.g. "টে", not "ট")
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
    <article className="group relative flex h-full flex-col rounded-3xl border border-line bg-surface p-6 lg:p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Rating + quote mark */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="text-[17px] tracking-[0.15em]"
          role="img"
          aria-label={`${rating} out of 5 stars`}
        >
          <span className="text-yellow-400">{"★".repeat(rating)}</span>
          <span className="text-line">{"★".repeat(5 - rating)}</span>
        </div>
        <span
          aria-hidden="true"
          className="font-display text-6xl leading-[0.6] text-ink/10 transition-colors duration-300 group-hover:text-teal/40"
        >
          “
        </span>
      </div>

      {/* Review */}
      <p className="text-[15px] leading-7 text-ink/80">{comment}</p>

      {/* Store reply */}
      {storeReply && (
        <div className="mt-5 rounded-r-xl border-l-2 border-teal bg-soft px-4 py-3">
          <span className="block text-[11px] font-semibold tracking-wider uppercase text-mute mb-1">
            স্টোর রিপ্লাই
          </span>
          <p className="text-sm leading-6">{storeReply}</p>
        </div>
      )}

      {/* Customer */}
      <div className="mt-auto pt-6">
        <div className="flex items-center gap-3 border-t border-line pt-5">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-base font-bold text-white ring-4 ring-soft"
            style={{ backgroundColor: avatarColor }}
            aria-hidden="true"
          >
            {initial}
          </span>

          <div className="min-w-0 flex-1">
            <b className="block truncate text-[15px] leading-tight">
              {customerName}
            </b>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-mute">
              {isVerifiedPurchase ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal/10 px-2 py-0.5 font-medium text-teal">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                  ভেরিফায়েড {badge}
                </span>
              ) : (
                badge && (
                  <span className="rounded-full bg-soft px-2 py-0.5">
                    {badge}
                  </span>
                )
              )}
              {date && <time dateTime={createdAt}>{date}</time>}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
