"use client";

import { Suspense } from "react";
import { useShopUrl } from "./useShopUrl";

interface Props {
  totalPages: number;
}

function Pagination({ totalPages }: Props) {
  const { page, setPage, isPending } = useShopUrl();

  if (totalPages <= 1) return null;

  // Show at most 5 page buttons with ellipsis
  const getPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, null, totalPages];
    if (page >= totalPages - 2) return [1, null, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, null, page - 1, page, page + 1, null, totalPages];
  };

  return (
    <nav
      aria-label="Pagination"
      className={[
        "flex justify-center items-center gap-1.5 mt-10 transition-opacity",
        isPending ? "opacity-50 pointer-events-none" : "",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="w-10 h-10 rounded-xl border border-line bg-surface grid place-items-center text-ink hover:bg-soft disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      {getPages().map((p, i) =>
        p === null ? (
          <span key={`ellipsis-${i}`} className="w-10 h-10 grid place-items-center text-mute text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => setPage(p)}
            aria-current={p === page ? "page" : undefined}
            className={[
              "w-10 h-10 rounded-xl border text-sm font-semibold transition",
              p === page
                ? "bg-ink text-bg border-ink"
                : "border-line bg-surface text-ink hover:bg-soft",
            ].join(" ")}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="w-10 h-10 rounded-xl border border-line bg-surface grid place-items-center text-ink hover:bg-soft disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
}

export default function ShopPaginationClient(props: Props) {
  return (
    <Suspense>
      <Pagination {...props} />
    </Suspense>
  );
}
