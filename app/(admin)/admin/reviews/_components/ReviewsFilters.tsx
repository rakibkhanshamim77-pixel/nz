"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useTransition } from "react";
import { FILTER_TABS } from "./reviewsConstants";

interface Props {
  currentTab: string;
  currentQ: string;
  currentRating: string;
  total: number;
}

export default function ReviewsFilters({ currentTab, currentQ, currentRating, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  function buildUrl(overrides: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(overrides)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("page");
    return `${pathname}?${sp.toString()}`;
  }

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const q = searchRef.current?.value.trim() ?? "";
      startTransition(() => router.push(buildUrl({ q })));
    }
  }

  function handleRating(e: React.ChangeEvent<HTMLSelectElement>) {
    startTransition(() => router.push(buildUrl({ rating: e.target.value })));
  }

  function clearAll() {
    startTransition(() => router.push(pathname));
  }

  const hasFilters = !!(currentTab || currentQ || currentRating);

  return (
    <section className="card p-4 sm:p-5 mb-5">
      {/* Status tabs */}
      <div
        className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-4"
        role="group"
        aria-label="Review status filter"
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => startTransition(() => router.push(buildUrl({ tab: tab.value })))}
            aria-pressed={currentTab === tab.value ? "true" : "false"}
            className="chip shrink-0"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] items-end">
        {/* Search */}
        <label className="block">
          <span className="lbl">Search customer</span>
          <span className="relative block">
            <svg
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mute)] pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx={11} cy={11} r={7} />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              ref={searchRef}
              onKeyDown={handleSearch}
              defaultValue={currentQ}
              className="inp !h-11 !pl-11 text-sm"
              placeholder="Customer name…"
              autoComplete="off"
            />
          </span>
        </label>

        {/* Rating filter */}
        <label className="block">
          <span className="lbl">Rating</span>
          <span className="sel-wrap block">
            <select
              defaultValue={currentRating}
              onChange={handleRating}
              className="inp !h-11 text-sm"
            >
              <option value="">Any rating</option>
              <option value="5">★★★★★ (5)</option>
              <option value="4">★★★★☆ (4)</option>
              <option value="3">★★★☆☆ (3)</option>
              <option value="2">★★☆☆☆ (2)</option>
              <option value="1">★☆☆☆☆ (1)</option>
            </select>
          </span>
        </label>

        {/* Clear */}
        <button
          type="button"
          onClick={clearAll}
          disabled={!hasFilters}
          className="btn-ghost !h-11 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M3 5h18l-7 8v6l-4 2v-8z" />
            <path d="m16 3 5 5M21 3l-5 5" />
          </svg>
          Clear
        </button>
      </div>

      <p className="text-sm text-[var(--mute)] mt-4 pt-4 border-t border-[var(--line)]">
        <b className="text-[var(--ink)] font-bold">{total}</b>{" "}
        {total === 1 ? "review" : "reviews"}
        {hasFilters && " (filtered)"}
      </p>
    </section>
  );
}
