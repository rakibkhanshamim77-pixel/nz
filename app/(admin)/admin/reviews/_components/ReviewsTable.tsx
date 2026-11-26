import type { ReviewRow } from "./reviewsConstants";
import { fmtDate } from "./reviewsConstants";
import ReviewActionButtons from "./ReviewActionButtons";
import ReviewReplyPanel from "./ReviewReplyPanel";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "text-[var(--ink)]" : "text-[var(--line)]"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}

function Avatar({ name, color }: { name: string; color: string }) {
  const letter = name.trim()[0]?.toUpperCase() ?? "?";
  return (
    <span
      className="w-9 h-9 rounded-full grid place-items-center font-display font-bold text-sm text-white shrink-0"
      style={{ backgroundColor: color }}
    >
      {letter}
    </span>
  );
}

export default function ReviewsTable({ reviews }: { reviews: ReviewRow[] }) {
  if (reviews.length === 0) {
    return (
      <section className="card hidden md:block mb-5">
        <div className="py-20 text-center text-[var(--mute)]">
          <svg
            className="w-12 h-12 mx-auto mb-4 opacity-30"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" />
          </svg>
          <p className="text-sm font-medium">No reviews found</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card hidden md:block mb-5">
      <div className="overflow-x-auto rounded-[24px]">
        <table className="ptbl w-full">
          <thead>
            <tr>
              <th>CUSTOMER</th>
              <th>RATING</th>
              <th>COMMENT</th>
              <th>STATUS</th>
              <th>DATE</th>
              <th className="text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r._id}>
                {/* Customer */}
                <td>
                  <div className="flex items-center gap-3">
                    <Avatar name={r.customerName} color={r.avatarColor} />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-tight">
                        {r.customerName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-xs text-[var(--mute)]">{r.badge}</span>
                        {r.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--ink)] border border-[var(--ink)] rounded-full px-1.5 py-px leading-none">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path d="m5 12 5 5L20 7" />
                            </svg>
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Rating */}
                <td>
                  <Stars rating={r.rating} />
                  <p className="text-xs text-[var(--mute)] mt-0.5">{r.rating}/5</p>
                </td>

                {/* Comment */}
                <td className="max-w-xs">
                  <p className="text-sm line-clamp-2 leading-snug">{r.comment}</p>
                  {r.productName && (
                    <p className="text-xs text-[var(--mute)] mt-1">
                      Product: {r.productName}
                    </p>
                  )}
                  <ReviewReplyPanel
                    reviewId={r._id}
                    existingReply={r.storeReply}
                    repliedAt={r.storeRepliedAt}
                  />
                </td>

                {/* Status */}
                <td>
                  <div className="flex flex-col gap-1.5">
                    {r.isPublished ? (
                      <span className="st active text-xs">
                        <i />
                        Published
                      </span>
                    ) : (
                      <span className="st draft text-xs">
                        <i />
                        Pending
                      </span>
                    )}
                    {r.isFeatured && (
                      <span className="inline-flex items-center gap-1 h-[26px] px-2.5 rounded-full text-xs font-bold border border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" />
                        </svg>
                        Featured
                      </span>
                    )}
                  </div>
                </td>

                {/* Date */}
                <td>
                  <p className="text-sm">{fmtDate(r.createdAt)}</p>
                </td>

                {/* Actions */}
                <td className="text-right">
                  <ReviewActionButtons review={r} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
