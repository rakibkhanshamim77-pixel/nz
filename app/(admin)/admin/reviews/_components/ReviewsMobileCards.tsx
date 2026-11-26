import type { ReviewRow } from "./reviewsConstants";
import { fmtDate } from "./reviewsConstants";
import ReviewActionButtons from "./ReviewActionButtons";
import ReviewReplyPanel from "./ReviewReplyPanel";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
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

export default function ReviewsMobileCards({ reviews }: { reviews: ReviewRow[] }) {
  if (reviews.length === 0) {
    return (
      <div className="md:hidden py-16 text-center text-[var(--mute)]">
        <svg
          className="w-10 h-10 mx-auto mb-3 opacity-30"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" />
        </svg>
        <p className="text-sm font-medium">No reviews found</p>
      </div>
    );
  }

  return (
    <div className="md:hidden grid gap-3 mb-5">
      {reviews.map((r) => (
        <div key={r._id} className="card p-4">
          {/* Header: avatar + name + rating */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="w-10 h-10 rounded-full grid place-items-center font-display font-bold text-sm text-white shrink-0"
                style={{ backgroundColor: r.avatarColor }}
              >
                {r.customerName.trim()[0]?.toUpperCase() ?? "?"}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-tight truncate">
                  {r.customerName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-xs text-[var(--mute)]">{r.badge}</span>
                  {r.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--ink)] border border-[var(--ink)] rounded-full px-1.5 py-px">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Stars rating={r.rating} />
              <p className="text-xs text-[var(--mute)]">{fmtDate(r.createdAt)}</p>
            </div>
          </div>

          {/* Comment */}
          <p className="text-sm text-[var(--ink)] leading-relaxed line-clamp-3 mb-2">
            {r.comment}
          </p>

          {/* Product */}
          {r.productName && (
            <p className="text-xs text-[var(--mute)] mb-2">
              Product: {r.productName}
            </p>
          )}

          {/* Reply panel */}
          <div className="mb-3">
            <ReviewReplyPanel
              reviewId={r._id}
              existingReply={r.storeReply}
              repliedAt={r.storeRepliedAt}
            />
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {r.isPublished ? (
              <span className="st active text-xs"><i />Published</span>
            ) : (
              <span className="st draft text-xs"><i />Pending</span>
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

          {/* Actions */}
          <div className="pt-3 border-t border-[var(--line)]">
            <ReviewActionButtons review={r} />
          </div>
        </div>
      ))}
    </div>
  );
}
