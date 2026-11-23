"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

interface Props {
  total: number;
  page: number;
  per: number;
}

const PER_OPTIONS = [5, 10, 20, 50];

export default function ProductsPagination({ total, page, per }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / per));

  const push = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  if (total === 0) return null;

  const start = (page - 1) * per + 1;
  const end = Math.min(page * per, total);

  // Build page number list with ellipsis
  const nums: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      nums.push(i);
    } else if (nums[nums.length - 1] !== "…") {
      nums.push("…");
    }
  }

  return (
    <nav
      className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4"
      aria-label="Pagination"
    >
      {/* Per-page + range */}
      <div className="flex items-center gap-3 text-sm text-[var(--mute)]">
        <label className="flex items-center gap-2">
          <span>Rows per page</span>
          <span className="sel-wrap block">
            <select
              className="inp !h-9 !w-[76px] !rounded-xl text-sm !pl-3"
              value={per}
              onChange={(e) => push({ per: e.target.value, page: "1" })}
            >
              {PER_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </span>
        </label>
        <span className="hidden sm:inline">
          Showing {start}–{end} of {total}
        </span>
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="pg"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => push({ page: String(page - 1) })}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M15 6 9 12l6 6" />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex items-center gap-1.5">
          {nums.map((n, i) =>
            n === "…" ? (
              <span key={`gap-${i}`} className="pg-gap">…</span>
            ) : (
              <button
                key={n}
                type="button"
                className="pg"
                aria-current={n === page ? "page" : undefined}
                onClick={() => push({ page: String(n) })}
              >
                {n}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className="pg"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => push({ page: String(page + 1) })}
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
