"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  currentPage: number;
  totalPages: number;
}

export default function CategoriesPagination({ currentPage, totalPages }: Props) {
  const pathname = usePathname();

  const pageUrl = (p: number) =>
    p === 1 ? pathname : `${pathname}?page=${p}`;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="mt-12 flex items-center justify-center gap-1.5">
      {/* prev */}
      {currentPage > 1 ? (
        <Link
          href={pageUrl(currentPage - 1)}
          className="h-10 px-4 rounded-xl border border-line bg-surface text-sm font-medium text-ink hover:bg-soft transition-colors"
        >
          ← আগে
        </Link>
      ) : (
        <span className="h-10 px-4 rounded-xl border border-line bg-surface text-sm font-medium text-mute opacity-40 flex items-center">
          ← আগে
        </span>
      )}

      {/* page numbers */}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="h-10 w-10 grid place-items-center text-mute text-sm">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageUrl(p)}
            className={`h-10 w-10 grid place-items-center rounded-xl text-sm font-semibold transition-colors ${
              p === currentPage
                ? "bg-ink text-bg"
                : "border border-line bg-surface text-ink hover:bg-soft"
            }`}
          >
            {p}
          </Link>
        ),
      )}

      {/* next */}
      {currentPage < totalPages ? (
        <Link
          href={pageUrl(currentPage + 1)}
          className="h-10 px-4 rounded-xl border border-line bg-surface text-sm font-medium text-ink hover:bg-soft transition-colors"
        >
          পরে →
        </Link>
      ) : (
        <span className="h-10 px-4 rounded-xl border border-line bg-surface text-sm font-medium text-mute opacity-40 flex items-center">
          পরে →
        </span>
      )}
    </div>
  );
}
