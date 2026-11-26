"use client";

import { useState, useTransition } from "react";
import {
  publishReview,
  unpublishReview,
  featureReview,
  unfeatureReview,
  deleteReview,
} from "../_actions/reviewActions";
import type { ReviewRow } from "./reviewsConstants";

interface Props {
  review: ReviewRow;
}

export default function ReviewActionButtons({ review }: Props) {
  const [, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function run(action: (id: string) => Promise<{ ok: boolean; error?: string }>) {
    setErr(null);
    startTransition(async () => {
      const res = await action(review._id);
      if (!res.ok) setErr(res.error ?? "Error");
    });
  }

  return (
    <div className="flex items-center justify-end gap-1.5 flex-wrap">
      {err && (
        <span className="text-xs text-red-600 font-medium mr-1">{err}</span>
      )}

      {/* Publish / Unpublish */}
      {review.isPublished ? (
        <button
          type="button"
          onClick={() => run(unpublishReview)}
          className="btn-ghost !h-8 !px-3 !rounded-[10px] text-xs"
          title="Unpublish"
        >
          Unpublish
        </button>
      ) : (
        <button
          type="button"
          onClick={() => run(publishReview)}
          className="btn-solid !h-8 !px-3 !rounded-[10px] text-xs"
          title="Approve & publish"
        >
          Approve
        </button>
      )}

      {/* Feature / Unfeature */}
      <button
        type="button"
        onClick={() => run(review.isFeatured ? unfeatureReview : featureReview)}
        className="icon-btn solid"
        title={review.isFeatured ? "Remove from featured" : "Pin to home page"}
      >
        <svg
          className="w-4 h-4"
          fill={review.isFeatured ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={review.isFeatured ? 0 : 2}
          viewBox="0 0 24 24"
        >
          <path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" />
        </svg>
      </button>

      {/* Delete */}
      {confirmDelete ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setConfirmDelete(false);
              run(deleteReview);
            }}
            className="btn-solid !h-8 !px-3 !rounded-[10px] text-xs !bg-red-600"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="btn-ghost !h-8 !px-2 !rounded-[10px] text-xs"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="icon-btn"
          title="Delete review"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      )}
    </div>
  );
}
