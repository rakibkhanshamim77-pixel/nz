"use client";

import { useEffect, useRef, useState } from "react";
import { useShopUrl } from "./useShopUrl";
import { SHOP_SORT_OPTIONS } from "./shop.constants";

interface Props {
  totalCount: number;
  onOpenFilters: () => void;
}

export default function ShopToolbar({ totalCount, onOpenFilters }: Props) {
  const { q, sort, activeFilterCount, isPending, setQ, setSort } = useShopUrl();
  const [localQ, setLocalQ] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // keep localQ in sync when URL changes externally (e.g. reset)
  useEffect(() => { setLocalQ(q); }, [q]);

  const handleSearch = (val: string) => {
    setLocalQ(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQ(val.trim()), 400);
  };

  return (
    <div className="mb-5 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
      {/* Search — full-width on mobile, flex-1 on sm+ */}
      <div className="relative w-full sm:flex-1 sm:min-w-0">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mute"
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={localQ}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="পণ্য খুঁজুন…"
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine/60 transition"
        />
      </div>

      {/* Second row on mobile: sort + filter button + count */}
      <div className="flex items-center gap-2">
        {/* result count */}
        <p className="hidden sm:block text-sm text-mute shrink-0 mr-1">
          {isPending ? (
            <span className="inline-block w-16 h-4 rounded bg-line animate-pulse" />
          ) : (
            <><span className="font-semibold text-ink">{totalCount}টি</span> পণ্য</>
          )}
        </p>

        {/* sort */}
        <div className="relative flex-1 sm:flex-none sm:shrink-0">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full h-11 pl-3 pr-8 rounded-xl border border-line bg-surface text-sm text-ink appearance-none cursor-pointer hover:border-ink transition focus:outline-none focus:ring-2 focus:ring-wine/30"
          >
            {SHOP_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-mute" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        {/* mobile filter toggle */}
        <button
          type="button"
          onClick={onOpenFilters}
          className="lg:hidden relative h-11 px-4 rounded-xl border border-line bg-surface text-sm font-medium text-ink hover:bg-soft transition flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 6h18M6 12h12M9 18h6" />
          </svg>
          ফিল্টার
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-wine text-white text-[10px] font-bold grid place-items-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
