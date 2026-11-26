"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useTransition, useRef, useCallback } from "react";
import { useCurrency } from "@/app/context/CurrencyProvider";

interface Props {
  categories: string[];
  total: number;
  filtered: number;
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "draft", label: "Draft" },
  { key: "scheduled", label: "Scheduled" },
] as const;

export default function ProductsFilters({ categories, total, filtered }: Props) {
  const router = useRouter();
  const { currency } = useCurrency();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentStatus = searchParams.get("status") ?? "all";
  const currentPmin = searchParams.get("pmin") ?? "";
  const currentPmax = searchParams.get("pmax") ?? "";

  const [searchVal, setSearchVal] = useState(currentQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const push = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  const handleSearch = (val: string) => {
    setSearchVal(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (debounceRef as any).current = setTimeout(() => push({ q: val }), 180);
  };

  const handleClear = () => {
    setSearchVal("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasFilters =
    !!(currentQ || currentCategory || currentPmin || currentPmax || currentStatus !== "all");

  const priceError =
    currentPmin !== "" &&
    currentPmax !== "" &&
    Number(currentPmin) > Number(currentPmax);

  return (
    <section className="card p-4 sm:p-5 mb-5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-end">
        {/* Search */}
        <label className="block">
          <span className="flbl">Search</span>
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
              className="inp !h-11 !pl-11 text-sm"
              placeholder="Product name or SKU"
              autoComplete="off"
              value={searchVal}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchVal && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--soft)] grid place-items-center text-xs"
                aria-label="Clear search"
                onClick={() => { setSearchVal(""); push({ q: "" }); }}
              >
                ✕
              </button>
            )}
          </span>
        </label>

        {/* Category */}
        <label className="block">
          <span className="flbl">Category</span>
          <span className="sel-wrap block">
            <select
              className="inp !h-11 text-sm"
              value={currentCategory}
              onChange={(e) => push({ category: e.target.value })}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </span>
        </label>

        {/* Price range */}
        <div>
          <span className="flbl">Price range ({currency.symbol})</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              inputMode="numeric"
              className={`inp !h-11 text-sm ${priceError ? "err" : ""}`}
              placeholder="Min"
              aria-label="Minimum price"
              defaultValue={currentPmin}
              onBlur={(e) => push({ pmin: e.target.value })}
            />
            <span className="text-[var(--mute)]">–</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              className={`inp !h-11 text-sm ${priceError ? "err" : ""}`}
              placeholder="Max"
              aria-label="Maximum price"
              defaultValue={currentPmax}
              onBlur={(e) => push({ pmax: e.target.value })}
            />
          </div>
        </div>

        {/* Clear filters */}
        <button
          type="button"
          className="btn-ghost !h-11 justify-center"
          disabled={!hasFilters || isPending}
          onClick={handleClear}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M3 5h18l-7 8v6l-4 2v-8z" />
            <path d="m16 3 5 5M21 3l-5 5" />
          </svg>
          Clear Filters
        </button>
      </div>

      {/* Status tabs + count */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[var(--line)]">
        <div className="flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="Status filter">
          {STATUS_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className="chip"
              aria-pressed={currentStatus === key ? "true" : "false"}
              onClick={() => push({ status: key === "all" ? "" : key })}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm text-[var(--mute)]">
          <b className="text-[var(--ink)]">{filtered}</b> of{" "}
          <b className="text-[var(--ink)]">{total}</b> products
        </p>
      </div>
    </section>
  );
}
